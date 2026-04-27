import { prisma } from '@/config/database';
import { logger } from '@/config/logger';

// ─────────────────────────────────────────────────────────────────────────────
// XP source codes
// ─────────────────────────────────────────────────────────────────────────────
export type XpSource =
  | 'lesson_completed'
  | 'quiz_passed'
  | 'course_completed'
  | 'certificate_earned'
  | 'streak_bonus'
  | 'badge_unlocked';

export const XP_REWARDS: Record<XpSource, number> = {
  lesson_completed: 20,
  quiz_passed: 50,
  course_completed: 200,
  certificate_earned: 100,
  streak_bonus: 10,
  badge_unlocked: 25,
};

// ─────────────────────────────────────────────────────────────────────────────
// Level progression — cumulative XP to reach level N
//   level 1 = 0 XP
//   level 2 = 100, level 3 = 300, level 4 = 600, ...
// Formula: cumulativeXp(N) = 50 * N * (N - 1)
// ─────────────────────────────────────────────────────────────────────────────
const cumulativeXpForLevel = (level: number): number => 50 * level * (level - 1);

const computeLevel = (totalXp: number): number => {
  // Largest N where cumulativeXp(N) <= totalXp
  // 50N(N-1) <= xp  =>  N <= (1 + sqrt(1 + 8*xp/50)) / 2
  const level = Math.floor((1 + Math.sqrt(1 + (8 * totalXp) / 50)) / 2);
  return Math.max(1, level);
};

const xpForNextLevel = (currentLevel: number): number => cumulativeXpForLevel(currentLevel + 1);

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers (date-only comparison in UTC)
// ─────────────────────────────────────────────────────────────────────────────
const todayUtc = (): Date => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

const dateOnly = (d: Date): Date =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

const daysBetween = (a: Date, b: Date): number =>
  Math.round((dateOnly(a).getTime() - dateOnly(b).getTime()) / (24 * 3600 * 1000));

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────
export interface UserStats {
  userId: string;
  totalXp: number;
  currentLevel: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  progressToNextLevel: number; // 0..1
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  badgesEarned: number;
  badgesTotal: number;
}

export interface AwardXpResult {
  xpAwarded: number;
  totalXp: number;
  previousLevel: number;
  currentLevel: number;
  leveledUp: boolean;
  newBadges: BadgeDto[];
}

export interface BadgeDto {
  id: string;
  code: string;
  name: string;
  description: string;
  iconName: string;
  tier: string;
  earnedAt: string | null;
}

export interface XpTransactionDto {
  id: string;
  amount: number;
  source: XpSource | string;
  referenceId: string | null;
  description: string | null;
  createdAt: string;
}

export interface LeaderboardEntryDto {
  rank: number;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  departmentId: string | null;
  departmentName: string | null;
  totalXp: number;
  currentLevel: number;
  currentStreak: number;
  badgesEarned: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Ensure row exists (singleton-per-user)
// ─────────────────────────────────────────────────────────────────────────────
async function ensureUserRow(userId: bigint) {
  const db = prisma as any;
  const existing = await db.userGamification.findUnique({ where: { userId } });
  if (existing) return existing;
  return db.userGamification.create({
    data: { userId, totalXp: 0, currentLevel: 1, currentStreak: 0, longestStreak: 0 },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Streak update — call on any meaningful learning activity
// ─────────────────────────────────────────────────────────────────────────────
export async function recordActivity(
  userId: string,
): Promise<{ currentStreak: number; longestStreak: number; streakBonusXp: number }> {
  const db = prisma as any;
  const uid = BigInt(userId);
  const row = await ensureUserRow(uid);
  const today = todayUtc();

  let newStreak: number;
  let streakBonusXp = 0;

  if (!row.lastActivityDate) {
    newStreak = 1;
  } else {
    const gap = daysBetween(today, new Date(row.lastActivityDate));
    if (gap === 0) {
      // Same day, no change
      return {
        currentStreak: row.currentStreak,
        longestStreak: row.longestStreak,
        streakBonusXp: 0,
      };
    } else if (gap === 1) {
      newStreak = row.currentStreak + 1;
      streakBonusXp = XP_REWARDS.streak_bonus;
    } else {
      // Reset
      newStreak = 1;
    }
  }

  const longest = Math.max(row.longestStreak, newStreak);
  await db.userGamification.update({
    where: { userId: uid },
    data: {
      currentStreak: newStreak,
      longestStreak: longest,
      lastActivityDate: today,
    },
  });

  if (streakBonusXp > 0) {
    // Award streak bonus XP without re-triggering streak update (avoid recursion)
    await awardXpInternal(userId, streakBonusXp, 'streak_bonus', null, `Streak ${newStreak} ngày`);
  }

  return { currentStreak: newStreak, longestStreak: longest, streakBonusXp };
}

// ─────────────────────────────────────────────────────────────────────────────
// Award XP — log transaction, update total + level, check badge unlocks
// ─────────────────────────────────────────────────────────────────────────────
async function awardXpInternal(
  userId: string,
  amount: number,
  source: XpSource,
  referenceId: string | null,
  description: string | null,
): Promise<AwardXpResult> {
  const db = prisma as any;
  const uid = BigInt(userId);
  const row = await ensureUserRow(uid);
  const previousLevel = row.currentLevel;

  const newTotal = row.totalXp + amount;
  const newLevel = computeLevel(newTotal);

  await db.$transaction([
    db.xpTransaction.create({
      data: {
        userId: uid,
        amount,
        source,
        referenceId: referenceId ?? null,
        description: description ?? null,
      },
    }),
    db.userGamification.update({
      where: { userId: uid },
      data: { totalXp: newTotal, currentLevel: newLevel },
    }),
  ]);

  const newBadges = await checkBadgeUnlocks(userId);
  return {
    xpAwarded: amount,
    totalXp: newTotal,
    previousLevel,
    currentLevel: newLevel,
    leveledUp: newLevel > previousLevel,
    newBadges,
  };
}

export async function awardXp(
  userId: string,
  source: XpSource,
  referenceId?: string | null,
  description?: string | null,
  amountOverride?: number,
): Promise<AwardXpResult> {
  const amount = amountOverride ?? XP_REWARDS[source];
  try {
    // Touch streak first so today's activity is recorded; ignore streak result here
    await recordActivity(userId);
    return await awardXpInternal(userId, amount, source, referenceId ?? null, description ?? null);
  } catch (err) {
    logger.error('[gamification] awardXp failed', { userId, source, err });
    // Never block the calling flow on gamification failure
    return {
      xpAwarded: 0,
      totalXp: 0,
      previousLevel: 1,
      currentLevel: 1,
      leveledUp: false,
      newBadges: [],
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Badge unlock evaluation
// ─────────────────────────────────────────────────────────────────────────────
interface BadgeCriteria {
  type: 'lessons_completed' | 'quizzes_passed' | 'courses_completed' | 'streak' | 'level';
  threshold: number;
}

async function checkBadgeUnlocks(userId: string): Promise<BadgeDto[]> {
  const db = prisma as any;
  const uid = BigInt(userId);

  const [badges, alreadyEarned, gamification, lessonsCompleted, quizzesPassed, coursesCompleted] =
    await Promise.all([
      db.badge.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      db.userBadge.findMany({ where: { userId: uid }, select: { badgeId: true } }),
      db.userGamification.findUnique({ where: { userId: uid } }),
      db.lessonProgress.count({
        where: { status: 'completed', enrollment: { userId: uid } },
      }),
      db.quizAttempt.count({ where: { isPassed: true, enrollment: { userId: uid } } }),
      db.enrollment.count({ where: { userId: uid, status: 'completed' } }),
    ]);

  const earnedSet = new Set<string>(alreadyEarned.map((ub: any) => ub.badgeId.toString()));
  const unlocked: BadgeDto[] = [];

  for (const badge of badges) {
    if (earnedSet.has(badge.id.toString())) continue;
    const criteria = badge.criteria as BadgeCriteria;
    if (!criteria || typeof criteria.threshold !== 'number') continue;

    let actual: number;
    switch (criteria.type) {
      case 'lessons_completed':
        actual = lessonsCompleted;
        break;
      case 'quizzes_passed':
        actual = quizzesPassed;
        break;
      case 'courses_completed':
        actual = coursesCompleted;
        break;
      case 'streak':
        actual = gamification?.longestStreak ?? 0;
        break;
      case 'level':
        actual = gamification?.currentLevel ?? 1;
        break;
      default:
        continue;
    }

    if (actual >= criteria.threshold) {
      const ub = await db.userBadge.create({
        data: { userId: uid, badgeId: badge.id },
      });
      unlocked.push({
        id: badge.id.toString(),
        code: badge.code,
        name: badge.name,
        description: badge.description,
        iconName: badge.iconName,
        tier: badge.tier,
        earnedAt: ub.earnedAt.toISOString(),
      });
    }
  }

  return unlocked;
}

// ─────────────────────────────────────────────────────────────────────────────
// Read APIs
// ─────────────────────────────────────────────────────────────────────────────
export async function getUserStats(userId: string): Promise<UserStats> {
  const db = prisma as any;
  const uid = BigInt(userId);
  const row = await ensureUserRow(uid);
  const [badgesEarned, badgesTotal] = await Promise.all([
    db.userBadge.count({ where: { userId: uid } }),
    db.badge.count({ where: { isActive: true } }),
  ]);

  const xpAtLevel = cumulativeXpForLevel(row.currentLevel);
  const xpAtNext = cumulativeXpForLevel(row.currentLevel + 1);
  const xpInLevel = row.totalXp - xpAtLevel;
  const xpToNext = Math.max(0, xpAtNext - row.totalXp);
  const span = xpAtNext - xpAtLevel;
  const progress = span > 0 ? Math.min(1, xpInLevel / span) : 0;

  return {
    userId: row.userId.toString(),
    totalXp: row.totalXp,
    currentLevel: row.currentLevel,
    xpInCurrentLevel: xpInLevel,
    xpToNextLevel: xpToNext,
    progressToNextLevel: progress,
    currentStreak: row.currentStreak,
    longestStreak: row.longestStreak,
    lastActivityDate: row.lastActivityDate ? row.lastActivityDate.toISOString() : null,
    badgesEarned,
    badgesTotal,
  };
}

export async function listUserBadges(
  userId: string,
): Promise<{ earned: BadgeDto[]; locked: BadgeDto[] }> {
  const db = prisma as any;
  const uid = BigInt(userId);
  const [allBadges, earnedRows] = await Promise.all([
    db.badge.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    db.userBadge.findMany({
      where: { userId: uid },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    }),
  ]);
  const earnedMap = new Map<string, Date>(
    earnedRows.map((ub: any) => [ub.badgeId.toString(), ub.earnedAt as Date]),
  );

  const earned: BadgeDto[] = [];
  const locked: BadgeDto[] = [];
  for (const b of allBadges) {
    const earnedAt = earnedMap.get(b.id.toString());
    const dto: BadgeDto = {
      id: b.id.toString(),
      code: b.code,
      name: b.name,
      description: b.description,
      iconName: b.iconName,
      tier: b.tier,
      earnedAt: earnedAt ? earnedAt.toISOString() : null,
    };
    if (earnedAt) earned.push(dto);
    else locked.push(dto);
  }
  return { earned, locked };
}

export async function listXpTransactions(userId: string, limit = 50): Promise<XpTransactionDto[]> {
  const db = prisma as any;
  const rows = await db.xpTransaction.findMany({
    where: { userId: BigInt(userId) },
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 200),
  });
  return rows.map((r: any) => ({
    id: r.id.toString(),
    amount: r.amount,
    source: r.source,
    referenceId: r.referenceId,
    description: r.description,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getLeaderboard(params: {
  scope?: 'global' | 'department';
  departmentId?: string | null;
  limit?: number;
}): Promise<LeaderboardEntryDto[]> {
  const db = prisma as any;
  const limit = Math.min(params.limit ?? 20, 100);

  const userWhere: Record<string, unknown> = { isActive: true };
  if (params.scope === 'department' && params.departmentId) {
    userWhere.departmentId = BigInt(params.departmentId);
  }

  const rows = await db.userGamification.findMany({
    where: { user: userWhere },
    orderBy: [{ totalXp: 'desc' }, { updatedAt: 'asc' }],
    take: limit,
    include: {
      user: { include: { department: { select: { id: true, name: true } } } },
    },
  });

  const userIds = rows.map((r: any) => r.userId);
  const badgeCounts: Array<{ userId: bigint; _count: { badgeId: number } }> = userIds.length
    ? await db.userBadge.groupBy({
        by: ['userId'],
        where: { userId: { in: userIds } },
        _count: { badgeId: true },
      })
    : [];
  const badgeMap = new Map<string, number>(
    badgeCounts.map((b) => [b.userId.toString(), b._count.badgeId]),
  );

  return rows.map((r: any, idx: number) => ({
    rank: idx + 1,
    userId: r.userId.toString(),
    fullName: r.user.fullName,
    email: r.user.email,
    avatarUrl: r.user.avatarUrl,
    departmentId: r.user.department?.id?.toString() ?? null,
    departmentName: r.user.department?.name ?? null,
    totalXp: r.totalXp,
    currentLevel: r.currentLevel,
    currentStreak: r.currentStreak,
    badgesEarned: badgeMap.get(r.userId.toString()) ?? 0,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper exports for tests / debug
// ─────────────────────────────────────────────────────────────────────────────
export const __helpers = {
  cumulativeXpForLevel,
  computeLevel,
  xpForNextLevel,
};
