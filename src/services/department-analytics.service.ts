import { Prisma } from '@prisma/client';
import { prisma } from '@/config/database';

type EnrollmentStatus = 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'expired';

const VALID_RANGES = [7, 30, 60, 90] as const;
type RangeDays = (typeof VALID_RANGES)[number];

interface DepartmentSummary {
  id: string;
  name: string;
}

interface SummaryMetrics {
  totalLearners: number;
  activeLast7Days: number;
  activeLast30Days: number;
  averageProgressPercent: number;
  completionRate: number;
  atRiskRate: number;
  benchmark: {
    averageProgressPercent: number;
    completionRate: number;
    atRiskRate: number;
    deltaAverageProgressPercent: number;
    deltaCompletionRate: number;
    deltaAtRiskRate: number;
  };
}

interface TrendPoint {
  date: string;
  count: number;
}

interface PerformerEntry {
  userId: string;
  fullName: string;
  email: string;
  positionTitle: string | null;
  totalProgressPercent: number;
  completedCount: number;
  totalEnrollments: number;
  totalXp: number;
  daysSinceLastActivity: number | null;
}

interface CourseDistribution {
  courseId: string;
  title: string;
  totalEnrollments: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  averageProgressPercent: number;
}

interface SkillDistribution {
  skillId: string;
  skillName: string;
  category: string | null;
  averageCurrentLevel: number;
  averageTargetLevel: number;
  gapPercent: number;
  learnersCovered: number;
}

export interface DepartmentAnalyticsResponse {
  department: DepartmentSummary;
  rangeDays: RangeDays;
  generatedAt: string;
  summary: SummaryMetrics;
  trends: {
    enrollmentsByDay: TrendPoint[];
    completionsByDay: TrendPoint[];
    activeLearnersByDay: TrendPoint[];
  };
  topPerformers: PerformerEntry[];
  bottomPerformers: PerformerEntry[];
  courseDistribution: CourseDistribution[];
  skillDistribution: SkillDistribution[];
}

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const round1 = (value: number): number => Math.round(value * 10) / 10;

const startOfDay = (date: Date): Date => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const formatDate = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Build an empty daily series spanning the requested window (inclusive of today).
 */
const buildDateSeries = (rangeDays: number, now: Date): TrendPoint[] => {
  const series: TrendPoint[] = [];
  const today = startOfDay(now);
  for (let i = rangeDays - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    series.push({ date: formatDate(day), count: 0 });
  }
  return series;
};

const fillSeries = (
  series: TrendPoint[],
  rows: Array<{ bucket: Date; count: bigint | number }>,
): TrendPoint[] => {
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(formatDate(row.bucket), Number(row.count));
  }
  return series.map((point) => ({ date: point.date, count: map.get(point.date) ?? 0 }));
};

const normalizeRange = (raw: number | undefined): RangeDays => {
  if (raw && (VALID_RANGES as readonly number[]).includes(raw)) {
    return raw as RangeDays;
  }
  return 30;
};

export const getDepartmentAnalytics = async (
  departmentId: bigint,
  rangeRaw?: number,
): Promise<DepartmentAnalyticsResponse> => {
  const rangeDays = normalizeRange(rangeRaw);
  const now = new Date();
  const today = startOfDay(now);
  const rangeStart = new Date(today);
  rangeStart.setDate(today.getDate() - (rangeDays - 1));
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // ---- 1) Department + learners (employees only) ------------------------------------------------
  const [department, learners] = await Promise.all([
    prisma.department.findUnique({ where: { id: departmentId }, select: { id: true, name: true } }),
    prisma.user.findMany({
      where: {
        departmentId,
        userRoles: { some: { role: { code: 'employee' } } },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        positionTitle: true,
        isActive: true,
      },
      orderBy: { fullName: 'asc' },
    }),
  ]);

  if (!department) {
    throw new Error('Department not found');
  }

  const learnerIds = learners.map((l) => l.id);

  // ---- 2) Enrollments + risk + course load (dept-scoped) ----------------------------------------
  const [deptEnrollments, deptRiskRecent, companyEnrollments, companyRiskRecent] =
    await Promise.all([
      prisma.enrollment.findMany({
        where: { user: { departmentId } },
        select: {
          id: true,
          userId: true,
          courseId: true,
          status: true,
          progressPercentCache: true,
          completedAt: true,
          enrolledAt: true,
          lastActivityAt: true,
          course: { select: { id: true, title: true } },
          learnerRiskAssessments: {
            orderBy: { calculatedAt: 'desc' },
            take: 1,
            select: { riskLevel: true, expiresAt: true },
          },
        },
      }),
      // Latest risk assessment count per dept
      prisma.$queryRaw<Array<{ risk_level: string; total: bigint }>>`
      SELECT risk_level, COUNT(*)::bigint AS total
      FROM (
        SELECT DISTINCT ON (e.id) lra.risk_level, lra.expires_at
        FROM enrollments e
        JOIN users u ON u.id = e.user_id
        JOIN learner_risk_assessments lra ON lra.enrollment_id = e.id
        WHERE u.department_id = ${departmentId}
        ORDER BY e.id, lra.calculated_at DESC
      ) latest
      WHERE expires_at IS NULL OR expires_at >= NOW()
      GROUP BY risk_level
    `,
      prisma.enrollment.findMany({
        select: { id: true, status: true, progressPercentCache: true },
      }),
      prisma.$queryRaw<Array<{ risk_level: string; total: bigint }>>`
      SELECT risk_level, COUNT(*)::bigint AS total
      FROM (
        SELECT DISTINCT ON (e.id) lra.risk_level, lra.expires_at
        FROM enrollments e
        JOIN learner_risk_assessments lra ON lra.enrollment_id = e.id
        ORDER BY e.id, lra.calculated_at DESC
      ) latest
      WHERE expires_at IS NULL OR expires_at >= NOW()
      GROUP BY risk_level
    `,
    ]);

  // ---- 3) Summary metrics + benchmark -----------------------------------------------------------
  const totalLearners = learners.length;
  const activeStatuses: EnrollmentStatus[] = ['assigned', 'in_progress'];
  const deptActive = deptEnrollments.filter((e) => activeStatuses.includes(e.status));
  const deptCompleted = deptEnrollments.filter((e) => e.status === 'completed').length;
  const deptCompletionRate =
    deptEnrollments.length > 0 ? round1((deptCompleted / deptEnrollments.length) * 100) : 0;
  const deptAvgProgress =
    deptActive.length > 0
      ? round1(
          deptActive.reduce((sum, e) => sum + toNumber(e.progressPercentCache), 0) /
            deptActive.length,
        )
      : 0;

  const deptRiskHigh = Number(deptRiskRecent.find((r) => r.risk_level === 'high')?.total ?? 0);
  const deptRiskMed = Number(deptRiskRecent.find((r) => r.risk_level === 'medium')?.total ?? 0);
  const deptAtRisk = deptRiskHigh + deptRiskMed;
  const deptAtRiskRate =
    deptEnrollments.length > 0 ? round1((deptAtRisk / deptEnrollments.length) * 100) : 0;

  const companyCompleted = companyEnrollments.filter((e) => e.status === 'completed').length;
  const companyActive = companyEnrollments.filter((e) => activeStatuses.includes(e.status));
  const companyCompletionRate =
    companyEnrollments.length > 0
      ? round1((companyCompleted / companyEnrollments.length) * 100)
      : 0;
  const companyAvgProgress =
    companyActive.length > 0
      ? round1(
          companyActive.reduce((sum, e) => sum + toNumber(e.progressPercentCache), 0) /
            companyActive.length,
        )
      : 0;
  const companyAtRisk =
    Number(companyRiskRecent.find((r) => r.risk_level === 'high')?.total ?? 0) +
    Number(companyRiskRecent.find((r) => r.risk_level === 'medium')?.total ?? 0);
  const companyAtRiskRate =
    companyEnrollments.length > 0 ? round1((companyAtRisk / companyEnrollments.length) * 100) : 0;

  // Active counts use enrollment.lastActivityAt as proxy
  const activeLast7Days = new Set(
    deptEnrollments
      .filter((e) => e.lastActivityAt && e.lastActivityAt >= sevenDaysAgo)
      .map((e) => String(e.userId)),
  ).size;
  const activeLast30Days = new Set(
    deptEnrollments
      .filter((e) => e.lastActivityAt && e.lastActivityAt >= thirtyDaysAgo)
      .map((e) => String(e.userId)),
  ).size;

  const summary: SummaryMetrics = {
    totalLearners,
    activeLast7Days,
    activeLast30Days,
    averageProgressPercent: deptAvgProgress,
    completionRate: deptCompletionRate,
    atRiskRate: deptAtRiskRate,
    benchmark: {
      averageProgressPercent: companyAvgProgress,
      completionRate: companyCompletionRate,
      atRiskRate: companyAtRiskRate,
      deltaAverageProgressPercent: round1(deptAvgProgress - companyAvgProgress),
      deltaCompletionRate: round1(deptCompletionRate - companyCompletionRate),
      deltaAtRiskRate: round1(deptAtRiskRate - companyAtRiskRate),
    },
  };

  // ---- 4) Trends (3 daily series) ---------------------------------------------------------------
  const enrollmentsRaw = await prisma.$queryRaw<Array<{ bucket: Date; count: bigint }>>`
    SELECT DATE_TRUNC('day', e.enrolled_at) AS bucket, COUNT(*)::bigint AS count
    FROM enrollments e
    JOIN users u ON u.id = e.user_id
    WHERE u.department_id = ${departmentId}
      AND e.enrolled_at >= ${rangeStart}
    GROUP BY bucket
    ORDER BY bucket ASC
  `;
  const completionsRaw = await prisma.$queryRaw<Array<{ bucket: Date; count: bigint }>>`
    SELECT DATE_TRUNC('day', e.completed_at) AS bucket, COUNT(*)::bigint AS count
    FROM enrollments e
    JOIN users u ON u.id = e.user_id
    WHERE u.department_id = ${departmentId}
      AND e.completed_at IS NOT NULL
      AND e.completed_at >= ${rangeStart}
    GROUP BY bucket
    ORDER BY bucket ASC
  `;
  const activeRaw = await prisma.$queryRaw<Array<{ bucket: Date; count: bigint }>>`
    SELECT DATE_TRUNC('day', e.last_activity_at) AS bucket,
           COUNT(DISTINCT e.user_id)::bigint AS count
    FROM enrollments e
    JOIN users u ON u.id = e.user_id
    WHERE u.department_id = ${departmentId}
      AND e.last_activity_at IS NOT NULL
      AND e.last_activity_at >= ${rangeStart}
    GROUP BY bucket
    ORDER BY bucket ASC
  `;

  const baseSeries = buildDateSeries(rangeDays, now);
  const trends = {
    enrollmentsByDay: fillSeries(baseSeries, enrollmentsRaw),
    completionsByDay: fillSeries(baseSeries, completionsRaw),
    activeLearnersByDay: fillSeries(baseSeries, activeRaw),
  };

  // ---- 5) Top / bottom performers ---------------------------------------------------------------
  const xpAgg = learnerIds.length
    ? await prisma.userGamification.findMany({
        where: { userId: { in: learnerIds } },
        select: { userId: true, totalXp: true },
      })
    : [];
  const xpMap = new Map<string, number>(xpAgg.map((x) => [String(x.userId), Number(x.totalXp)]));

  const performersBase: PerformerEntry[] = learners.map((learner) => {
    const myEnrollments = deptEnrollments.filter((e) => String(e.userId) === String(learner.id));
    const totalProgress = myEnrollments.length
      ? round1(
          myEnrollments.reduce((sum, e) => sum + toNumber(e.progressPercentCache), 0) /
            myEnrollments.length,
        )
      : 0;
    const completed = myEnrollments.filter((e) => e.status === 'completed').length;
    const lastActivities = myEnrollments
      .map((e) => e.lastActivityAt)
      .filter((d): d is Date => d !== null);
    const lastActivity = lastActivities.length
      ? lastActivities.reduce((max, d) => (d > max ? d : max))
      : null;
    const daysSinceLastActivity = lastActivity
      ? Math.floor((now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000))
      : null;
    return {
      userId: String(learner.id),
      fullName: learner.fullName,
      email: learner.email,
      positionTitle: learner.positionTitle,
      totalProgressPercent: totalProgress,
      completedCount: completed,
      totalEnrollments: myEnrollments.length,
      totalXp: xpMap.get(String(learner.id)) ?? 0,
      daysSinceLastActivity,
    };
  });

  const topPerformers = [...performersBase]
    .sort((a, b) => {
      if (b.completedCount !== a.completedCount) return b.completedCount - a.completedCount;
      if (b.totalProgressPercent !== a.totalProgressPercent)
        return b.totalProgressPercent - a.totalProgressPercent;
      return b.totalXp - a.totalXp;
    })
    .slice(0, 5);

  const bottomPerformers = [...performersBase]
    .filter((p) => p.totalEnrollments > 0)
    .sort((a, b) => {
      if (a.totalProgressPercent !== b.totalProgressPercent)
        return a.totalProgressPercent - b.totalProgressPercent;
      const aIdle = a.daysSinceLastActivity ?? Number.MAX_SAFE_INTEGER;
      const bIdle = b.daysSinceLastActivity ?? Number.MAX_SAFE_INTEGER;
      return bIdle - aIdle;
    })
    .slice(0, 5);

  // ---- 6) Course distribution -------------------------------------------------------------------
  const courseMap = new Map<string, CourseDistribution>();
  for (const e of deptEnrollments) {
    const id = String(e.course.id);
    const slot = courseMap.get(id) ?? {
      courseId: id,
      title: e.course.title,
      totalEnrollments: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      averageProgressPercent: 0,
    };
    slot.totalEnrollments += 1;
    if (e.status === 'completed') slot.completed += 1;
    else if (e.status === 'in_progress') slot.inProgress += 1;
    else if (e.status === 'assigned') slot.notStarted += 1;
    slot.averageProgressPercent += toNumber(e.progressPercentCache);
    courseMap.set(id, slot);
  }
  const courseDistribution = [...courseMap.values()]
    .map((c) => ({
      ...c,
      averageProgressPercent: c.totalEnrollments
        ? round1(c.averageProgressPercent / c.totalEnrollments)
        : 0,
    }))
    .sort((a, b) => b.totalEnrollments - a.totalEnrollments)
    .slice(0, 10);

  // ---- 7) Skill distribution --------------------------------------------------------------------
  const positionTitles = Array.from(
    new Set(learners.map((l) => l.positionTitle).filter((p): p is string => !!p)),
  );

  const positionSkills = positionTitles.length
    ? await prisma.positionSkill.findMany({
        where: { positionTitle: { in: positionTitles } },
        select: {
          positionTitle: true,
          targetLevel: true,
          skill: { select: { id: true, name: true, category: true } },
        },
      })
    : [];

  const userSkills = learnerIds.length
    ? await prisma.userSkill.findMany({
        where: { userId: { in: learnerIds } },
        select: { userId: true, skillId: true, currentLevel: true },
      })
    : [];

  const skillMap = new Map<
    string,
    {
      skillId: string;
      skillName: string;
      category: string | null;
      currentLevels: number[];
      targetLevels: number[];
      learnersCovered: Set<string>;
    }
  >();

  // Aggregate target levels per skill from position requirements scoped to learners' positions
  const learnersByPosition = new Map<string, string[]>();
  for (const learner of learners) {
    if (!learner.positionTitle) continue;
    const list = learnersByPosition.get(learner.positionTitle) ?? [];
    list.push(String(learner.id));
    learnersByPosition.set(learner.positionTitle, list);
  }
  for (const ps of positionSkills) {
    const learnersForPos = learnersByPosition.get(ps.positionTitle) ?? [];
    if (!learnersForPos.length) continue;
    const id = String(ps.skill.id);
    const slot = skillMap.get(id) ?? {
      skillId: id,
      skillName: ps.skill.name,
      category: ps.skill.category,
      currentLevels: [],
      targetLevels: [],
      learnersCovered: new Set<string>(),
    };
    // Push target level once per learner who needs this skill
    for (const _ of learnersForPos) slot.targetLevels.push(ps.targetLevel);
    skillMap.set(id, slot);
  }

  // Aggregate current levels from user_skills
  for (const us of userSkills) {
    const id = String(us.skillId);
    const slot = skillMap.get(id);
    if (!slot) continue;
    slot.currentLevels.push(us.currentLevel);
    slot.learnersCovered.add(String(us.userId));
  }

  const skillDistribution: SkillDistribution[] = [...skillMap.values()]
    .map((slot) => {
      const avgCurrent = slot.currentLevels.length
        ? slot.currentLevels.reduce((sum, lvl) => sum + lvl, 0) / slot.currentLevels.length
        : 0;
      const avgTarget = slot.targetLevels.length
        ? slot.targetLevels.reduce((sum, lvl) => sum + lvl, 0) / slot.targetLevels.length
        : 0;
      const gapPercent =
        avgTarget > 0 ? Math.max(0, ((avgTarget - avgCurrent) / avgTarget) * 100) : 0;
      return {
        skillId: slot.skillId,
        skillName: slot.skillName,
        category: slot.category,
        averageCurrentLevel: round1(avgCurrent),
        averageTargetLevel: round1(avgTarget),
        gapPercent: round1(gapPercent),
        learnersCovered: slot.learnersCovered.size,
      };
    })
    .sort((a, b) => b.gapPercent - a.gapPercent)
    .slice(0, 10);

  // Hint Prisma type usage so unused-import isn't flagged in some lint configs
  void Prisma;

  return {
    department: { id: String(department.id), name: department.name },
    rangeDays,
    generatedAt: now.toISOString(),
    summary,
    trends,
    topPerformers,
    bottomPerformers,
    courseDistribution,
    skillDistribution,
  };
};
