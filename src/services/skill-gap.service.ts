import type { Prisma, Skill, UserSkill } from '@prisma/client';
import { generateContentWithFallback } from '@/utils/ai-generate';
import { prisma } from '@/config/database';
import { genAI } from '@/config/gemini.config';
import { ensureModuleEnabled, getEffectiveConfig } from '@/services/ai-config.service';
import { logger } from '@/config/logger';
import { AppError } from '@/utils';

// ============================================================
// Skill Gap Analysis Service (P2.2)
// ============================================================

const MIN_LEVEL = 1;
const MAX_LEVEL = 5;

const clampLevel = (n: number) => Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Math.round(n)));

const serializeBigInt = (v: bigint): string => v.toString();

const slugify = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 140);

// ============================================================
// Types
// ============================================================

export interface SkillView {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  isActive: boolean;
}

export interface PositionSkillView {
  id: string;
  positionTitle: string;
  skillId: string;
  skill: SkillView;
  targetLevel: number;
  weight: number;
  isCore: boolean;
}

export interface UserSkillView {
  id: string;
  skillId: string;
  skill: SkillView;
  currentLevel: number;
  source: string;
  notes: string | null;
  lastAssessedAt: string;
}

export interface SkillGapEntry {
  skillId: string;
  skill: SkillView;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  weight: number;
  isCore: boolean;
  weightedGap: number;
  recommendedCourses: Array<{ id: string; title: string; slug: string }>;
}

export interface MyGapResponse {
  positionTitle: string | null;
  totalSkills: number;
  averageCurrent: number;
  averageTarget: number;
  totalGap: number;
  weightedGap: number;
  readiness: number; // 0..100
  band: string;
  entries: SkillGapEntry[];
}

const toSkillView = (s: {
  id: bigint;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  isActive: boolean;
}): SkillView => ({
  id: serializeBigInt(s.id),
  name: s.name,
  slug: s.slug,
  description: s.description,
  category: s.category,
  isActive: s.isActive,
});

const toUserSkillView = (us: UserSkill & { skill: Skill }): UserSkillView => ({
  id: serializeBigInt(us.id),
  skillId: serializeBigInt(us.skillId),
  skill: toSkillView(us.skill),
  currentLevel: us.currentLevel,
  source: us.source,
  notes: us.notes,
  lastAssessedAt: us.lastAssessedAt.toISOString(),
});

const computeBand = (readiness: number): string => {
  if (readiness < 30) return 'Needs Significant Development';
  if (readiness < 60) return 'Developing';
  if (readiness < 80) return 'Competent';
  if (readiness < 95) return 'Proficient';
  return 'Mastery';
};

// ============================================================
// Skill catalog (admin)
// ============================================================

export const listSkills = async (filters: {
  category?: string;
  q?: string;
  isActive?: boolean;
}): Promise<SkillView[]> => {
  const { category, q, isActive } = filters;
  const skills = await prisma.skill.findMany({
    where: {
      ...(typeof isActive === 'boolean' ? { isActive } : {}),
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' as Prisma.QueryMode } },
              { description: { contains: q, mode: 'insensitive' as Prisma.QueryMode } },
            ],
          }
        : {}),
    },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
  return skills.map(toSkillView);
};

export const createSkill = async (input: {
  name: string;
  description?: string;
  category?: string;
}): Promise<SkillView> => {
  const slug = slugify(input.name);
  if (!slug) throw new AppError('Tên kỹ năng không hợp lệ', 400);
  try {
    const skill = await prisma.skill.create({
      data: {
        name: input.name.trim(),
        slug,
        description: input.description?.trim() || null,
        category: input.category?.trim() || null,
      },
    });
    return toSkillView(skill);
  } catch (e) {
    if ((e as { code?: string }).code === 'P2002') {
      throw new AppError('Kỹ năng đã tồn tại', 409);
    }
    throw e;
  }
};

export const updateSkill = async (
  id: bigint,
  input: { name?: string; description?: string; category?: string; isActive?: boolean },
): Promise<SkillView> => {
  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill) throw new AppError('Kỹ năng không tồn tại', 404);

  const data: Prisma.SkillUpdateInput = {};
  if (input.name) {
    data.name = input.name.trim();
    data.slug = slugify(input.name);
  }
  if (input.description !== undefined) data.description = input.description?.trim() || null;
  if (input.category !== undefined) data.category = input.category?.trim() || null;
  if (input.isActive !== undefined) data.isActive = input.isActive;

  const updated = await prisma.skill.update({ where: { id }, data });
  return toSkillView(updated);
};

export const deleteSkill = async (id: bigint): Promise<void> => {
  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill) throw new AppError('Kỹ năng không tồn tại', 404);
  await prisma.skill.delete({ where: { id } });
};

// ============================================================
// Position-skill mapping (admin)
// ============================================================

export const listPositionTitles = async (): Promise<string[]> => {
  const rows = await prisma.user.findMany({
    where: { positionTitle: { not: null }, isActive: true },
    distinct: ['positionTitle'],
    select: { positionTitle: true },
    orderBy: { positionTitle: 'asc' },
  });
  return rows.map((r) => r.positionTitle ?? '').filter((t) => t.length > 0);
};

export const listPositionSkills = async (positionTitle: string): Promise<PositionSkillView[]> => {
  const rows = await prisma.positionSkill.findMany({
    where: { positionTitle },
    include: { skill: true },
    orderBy: [{ isCore: 'desc' }, { weight: 'desc' }],
  });
  return rows.map((r) => ({
    id: serializeBigInt(r.id),
    positionTitle: r.positionTitle,
    skillId: serializeBigInt(r.skillId),
    skill: toSkillView(r.skill),
    targetLevel: r.targetLevel,
    weight: r.weight,
    isCore: r.isCore,
  }));
};

export const upsertPositionSkill = async (input: {
  positionTitle: string;
  skillId: bigint;
  targetLevel: number;
  weight?: number;
  isCore?: boolean;
}): Promise<PositionSkillView> => {
  const skill = await prisma.skill.findUnique({ where: { id: input.skillId } });
  if (!skill) throw new AppError('Kỹ năng không tồn tại', 404);

  const row = await prisma.positionSkill.upsert({
    where: {
      positionTitle_skillId: {
        positionTitle: input.positionTitle,
        skillId: input.skillId,
      },
    },
    create: {
      positionTitle: input.positionTitle,
      skillId: input.skillId,
      targetLevel: clampLevel(input.targetLevel),
      weight: input.weight ?? 1.0,
      isCore: input.isCore ?? false,
    },
    update: {
      targetLevel: clampLevel(input.targetLevel),
      weight: input.weight ?? undefined,
      isCore: input.isCore ?? undefined,
    },
    include: { skill: true },
  });
  return {
    id: serializeBigInt(row.id),
    positionTitle: row.positionTitle,
    skillId: serializeBigInt(row.skillId),
    skill: toSkillView(row.skill),
    targetLevel: row.targetLevel,
    weight: row.weight,
    isCore: row.isCore,
  };
};

export const deletePositionSkill = async (id: bigint): Promise<void> => {
  await prisma.positionSkill.delete({ where: { id } });
};

// ============================================================
// User self-assessment
// ============================================================

export const getMyProfile = async (
  userId: bigint,
): Promise<{
  positionTitle: string | null;
  skills: UserSkillView[];
}> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { positionTitle: true },
  });
  if (!user) throw new AppError('User not found', 404);

  const userSkills = await prisma.userSkill.findMany({
    where: { userId },
    include: { skill: true },
    orderBy: [{ skill: { category: 'asc' } }, { skill: { name: 'asc' } }],
  });

  return {
    positionTitle: user.positionTitle,
    skills: userSkills.map(toUserSkillView),
  };
};

export const setMySkillLevel = async (
  userId: bigint,
  skillId: bigint,
  level: number,
  notes?: string,
): Promise<UserSkillView> => {
  const skill = await prisma.skill.findUnique({ where: { id: skillId } });
  if (!skill) throw new AppError('Kỹ năng không tồn tại', 404);

  const lvl = clampLevel(level);
  const [userSkill] = await prisma.$transaction([
    prisma.userSkill.upsert({
      where: { userId_skillId: { userId, skillId } },
      create: {
        userId,
        skillId,
        currentLevel: lvl,
        source: 'self',
        notes: notes ?? null,
        lastAssessedAt: new Date(),
      },
      update: {
        currentLevel: lvl,
        source: 'self',
        notes: notes ?? null,
        lastAssessedAt: new Date(),
      },
      include: { skill: true },
    }),
    prisma.skillAssessment.create({
      data: {
        userId,
        skillId,
        level: lvl,
        source: 'self',
        notes: notes ?? null,
      },
    }),
  ]);
  return toUserSkillView(userSkill);
};

export const managerAssessSkill = async (
  managerUserId: bigint,
  targetUserId: bigint,
  skillId: bigint,
  level: number,
  notes?: string,
): Promise<UserSkillView> => {
  const skill = await prisma.skill.findUnique({ where: { id: skillId } });
  if (!skill) throw new AppError('Kỹ năng không tồn tại', 404);

  const lvl = clampLevel(level);
  const [userSkill] = await prisma.$transaction([
    prisma.userSkill.upsert({
      where: { userId_skillId: { userId: targetUserId, skillId } },
      create: {
        userId: targetUserId,
        skillId,
        currentLevel: lvl,
        source: 'manager',
        notes: notes ?? null,
        lastAssessedAt: new Date(),
      },
      update: {
        currentLevel: lvl,
        source: 'manager',
        notes: notes ?? null,
        lastAssessedAt: new Date(),
      },
      include: { skill: true },
    }),
    prisma.skillAssessment.create({
      data: {
        userId: targetUserId,
        skillId,
        level: lvl,
        source: 'manager',
        assessedById: managerUserId,
        notes: notes ?? null,
      },
    }),
  ]);
  return toUserSkillView(userSkill);
};

// ============================================================
// Gap calculation
// ============================================================

const calcGapForUser = async (userId: bigint): Promise<MyGapResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { positionTitle: true },
  });
  if (!user) throw new AppError('User not found', 404);

  if (!user.positionTitle) {
    return {
      positionTitle: null,
      totalSkills: 0,
      averageCurrent: 0,
      averageTarget: 0,
      totalGap: 0,
      weightedGap: 0,
      readiness: 0,
      band: 'Not Set',
      entries: [],
    };
  }

  const [positionSkills, userSkills, recommendations] = await Promise.all([
    prisma.positionSkill.findMany({
      where: { positionTitle: user.positionTitle },
      include: { skill: true },
      orderBy: [{ isCore: 'desc' }, { weight: 'desc' }],
    }),
    prisma.userSkill.findMany({
      where: { userId },
      select: { skillId: true, currentLevel: true },
    }),
    prisma.skillCourseRecommendation.findMany({
      include: { course: { select: { id: true, title: true, slug: true, status: true } } },
      orderBy: { priority: 'desc' },
    }),
  ]);

  const userMap = new Map(userSkills.map((u) => [u.skillId.toString(), u.currentLevel]));
  const courseMap = new Map<
    string,
    Array<{ id: string; title: string; slug: string; minLevel: number; maxLevel: number }>
  >();
  for (const r of recommendations) {
    if (r.course.status !== 'published') continue;
    const k = r.skillId.toString();
    if (!courseMap.has(k)) courseMap.set(k, []);
    courseMap.get(k)!.push({
      id: serializeBigInt(r.course.id),
      title: r.course.title,
      slug: r.course.slug,
      minLevel: r.minLevel,
      maxLevel: r.maxLevel,
    });
  }

  const entries: SkillGapEntry[] = positionSkills.map((ps) => {
    const skillKey = ps.skillId.toString();
    const current = userMap.get(skillKey) ?? 0;
    const gap = Math.max(0, ps.targetLevel - current);
    const weightedGap = gap * ps.weight;
    const recs = (courseMap.get(skillKey) ?? [])
      .filter((c) => current >= c.minLevel - 1 && current <= c.maxLevel)
      .slice(0, 3)
      .map((c) => ({ id: c.id, title: c.title, slug: c.slug }));
    return {
      skillId: skillKey,
      skill: toSkillView(ps.skill),
      currentLevel: current,
      targetLevel: ps.targetLevel,
      gap,
      weight: ps.weight,
      isCore: ps.isCore,
      weightedGap,
      recommendedCourses: recs,
    };
  });

  const totalSkills = entries.length;
  if (totalSkills === 0) {
    return {
      positionTitle: user.positionTitle,
      totalSkills: 0,
      averageCurrent: 0,
      averageTarget: 0,
      totalGap: 0,
      weightedGap: 0,
      readiness: 0,
      band: 'Not Set',
      entries: [],
    };
  }

  const sumCurrent = entries.reduce((s, e) => s + e.currentLevel, 0);
  const sumTarget = entries.reduce((s, e) => s + e.targetLevel, 0);
  const totalGap = entries.reduce((s, e) => s + e.gap, 0);
  const weightedGap = entries.reduce((s, e) => s + e.weightedGap, 0);
  const totalWeightedTarget = entries.reduce((s, e) => s + e.targetLevel * e.weight, 0);
  const readiness =
    totalWeightedTarget > 0
      ? Math.max(
          0,
          Math.min(100, ((totalWeightedTarget - weightedGap) / totalWeightedTarget) * 100),
        )
      : 0;

  return {
    positionTitle: user.positionTitle,
    totalSkills,
    averageCurrent: Number((sumCurrent / totalSkills).toFixed(2)),
    averageTarget: Number((sumTarget / totalSkills).toFixed(2)),
    totalGap,
    weightedGap: Number(weightedGap.toFixed(2)),
    readiness: Number(readiness.toFixed(1)),
    band: computeBand(readiness),
    entries,
  };
};

export const getMyGap = (userId: bigint) => calcGapForUser(userId);

export const getUserGap = async (
  managerUserId: bigint,
  targetUserId: bigint,
): Promise<
  MyGapResponse & { user: { id: string; fullName: string; positionTitle: string | null } }
> => {
  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      fullName: true,
      positionTitle: true,
      departmentId: true,
      department: { select: { id: true, managerUserId: true } },
    },
  });
  if (!target) throw new AppError('User not found', 404);

  // Manager can see their own department members; admins handled at route level via requireRole
  if (target.department?.managerUserId !== managerUserId) {
    // Admin/HR check should already have allowed access at route layer; we soft-check here
    // by allowing if same dept manager. For other roles route guard is the gate.
  }
  const gap = await calcGapForUser(targetUserId);
  return {
    ...gap,
    user: {
      id: serializeBigInt(target.id),
      fullName: target.fullName,
      positionTitle: target.positionTitle,
    },
  };
};

// ============================================================
// Manager team roll-up
// ============================================================

export interface TeamRollUpEntry {
  userId: string;
  fullName: string;
  positionTitle: string | null;
  readiness: number;
  band: string;
  totalGap: number;
  weightedGap: number;
  topGapSkills: Array<{ skillId: string; skillName: string; gap: number }>;
}

export interface TeamRollUpResponse {
  departmentId: string;
  departmentName: string;
  totalMembers: number;
  averageReadiness: number;
  skillHeatmap: Array<{
    skillId: string;
    skillName: string;
    averageGap: number;
    affectedMembers: number;
  }>;
  members: TeamRollUpEntry[];
}

export const getTeamRollUp = async (
  departmentId: bigint,
  managerUserId: bigint | null,
  isAdmin: boolean,
): Promise<TeamRollUpResponse> => {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    select: { id: true, name: true, managerUserId: true },
  });
  if (!department) throw new AppError('Department not found', 404);

  if (!isAdmin && managerUserId && department.managerUserId !== managerUserId) {
    throw new AppError('Bạn không có quyền xem phòng ban này', 403);
  }

  const members = await prisma.user.findMany({
    where: { departmentId, isActive: true },
    select: { id: true, fullName: true, positionTitle: true },
    orderBy: { fullName: 'asc' },
  });

  const memberGaps: TeamRollUpEntry[] = await Promise.all(
    members.map(async (m) => {
      const gap = await calcGapForUser(m.id);
      const topGap = [...gap.entries]
        .sort((a, b) => b.weightedGap - a.weightedGap)
        .slice(0, 3)
        .map((e) => ({
          skillId: e.skillId,
          skillName: e.skill.name,
          gap: e.gap,
        }));
      return {
        userId: serializeBigInt(m.id),
        fullName: m.fullName,
        positionTitle: m.positionTitle,
        readiness: gap.readiness,
        band: gap.band,
        totalGap: gap.totalGap,
        weightedGap: gap.weightedGap,
        topGapSkills: topGap,
      };
    }),
  );

  // Aggregate skill heatmap across members
  const skillMap = new Map<
    string,
    { skillId: string; skillName: string; sum: number; count: number; affected: number }
  >();
  for (const m of members) {
    const gap = await calcGapForUser(m.id);
    for (const e of gap.entries) {
      const key = e.skillId;
      const existing = skillMap.get(key) ?? {
        skillId: e.skillId,
        skillName: e.skill.name,
        sum: 0,
        count: 0,
        affected: 0,
      };
      existing.sum += e.gap;
      existing.count += 1;
      if (e.gap > 0) existing.affected += 1;
      skillMap.set(key, existing);
    }
  }
  const skillHeatmap = Array.from(skillMap.values())
    .map((s) => ({
      skillId: s.skillId,
      skillName: s.skillName,
      averageGap: s.count > 0 ? Number((s.sum / s.count).toFixed(2)) : 0,
      affectedMembers: s.affected,
    }))
    .sort((a, b) => b.averageGap - a.averageGap);

  const averageReadiness =
    memberGaps.length > 0
      ? Number((memberGaps.reduce((s, m) => s + m.readiness, 0) / memberGaps.length).toFixed(1))
      : 0;

  return {
    departmentId: serializeBigInt(department.id),
    departmentName: department.name,
    totalMembers: members.length,
    averageReadiness,
    skillHeatmap,
    members: memberGaps,
  };
};

// ============================================================
// AI generate skills for a position (Gemini)
// ============================================================

export interface AiSkillSuggestion {
  name: string;
  description: string;
  category: string;
  targetLevel: number;
  isCore: boolean;
  weight: number;
}

const FALLBACK_SUGGESTIONS: AiSkillSuggestion[] = [
  {
    name: 'Giao tiếp chuyên nghiệp',
    description: 'Khả năng diễn đạt rõ ràng, lắng nghe và phản hồi với đồng nghiệp / khách hàng.',
    category: 'Soft Skills',
    targetLevel: 4,
    isCore: true,
    weight: 1.2,
  },
  {
    name: 'Làm việc nhóm',
    description: 'Phối hợp hiệu quả trong team, chia sẻ kiến thức và hỗ trợ thành viên khác.',
    category: 'Soft Skills',
    targetLevel: 4,
    isCore: true,
    weight: 1.0,
  },
  {
    name: 'Quản lý thời gian',
    description: 'Sắp xếp ưu tiên công việc, hoàn thành đúng hạn các deliverable.',
    category: 'Productivity',
    targetLevel: 3,
    isCore: false,
    weight: 0.8,
  },
];

const parseAiSkills = (raw: string): AiSkillSuggestion[] | null => {
  try {
    const cleaned = raw
      .replace(/```(?:json)?/gi, '')
      .replace(/```/g, '')
      .trim();
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start === -1 || end === -1) return null;
    const arr = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(arr)) return null;
    return arr
      .filter((s) => s && typeof s.name === 'string' && s.name.length > 0)
      .map((s) => ({
        name: String(s.name).trim().slice(0, 120),
        description: String(s.description ?? '')
          .trim()
          .slice(0, 500),
        category: String(s.category ?? 'General')
          .trim()
          .slice(0, 60),
        targetLevel: clampLevel(Number(s.targetLevel ?? 3)),
        isCore: Boolean(s.isCore),
        weight: Math.max(0.1, Math.min(3, Number(s.weight ?? 1))),
      }))
      .slice(0, 12);
  } catch {
    return null;
  }
};

export const aiSuggestSkillsForPosition = async (
  positionTitle: string,
  context?: string,
): Promise<{ suggestions: AiSkillSuggestion[]; source: 'ai' | 'fallback' }> => {
  try {
    await ensureModuleEnabled('chatbot', 'Skill gap AI suggester');
  } catch {
    return { suggestions: FALLBACK_SUGGESTIONS, source: 'fallback' };
  }

  try {
    const cfg = await getEffectiveConfig();
    const prompt = `Bạn là chuyên gia L&D. Hãy gợi ý 8-10 kỹ năng cốt lõi cần có cho vị trí "${positionTitle}" tại công ty Việt Nam.${context ? `\nNgữ cảnh thêm: ${context}` : ''}\n\nTRẢ VỀ JSON ARRAY (không kèm chữ khác), mỗi phần tử có:\n{ "name": "Tên kỹ năng (tiếng Việt)", "description": "1-2 câu mô tả", "category": "Soft Skills | Technical | Domain Knowledge | Leadership | Productivity", "targetLevel": 1-5, "isCore": true|false, "weight": 0.5-2.0 }\n\nQUY TẮC:\n- Trả về đúng JSON array, không markdown, không giải thích\n- Cân bằng giữa technical (chuyên môn) và soft (mềm)\n- 3-4 skill phải là isCore=true\n- targetLevel phù hợp seniority đoán từ position`;

    const result = await generateContentWithFallback({
      model: cfg.chatModel,
      contents: [{ role: 'user' as const, parts: [{ text: prompt }] }],
      config: {
        temperature: 0.4,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json',
      },
    });
    const text = result.text ?? '';
    const parsed = parseAiSkills(text);
    if (!parsed || parsed.length === 0) {
      logger.warn('skill-gap.ai_suggest: failed to parse, using fallback', { positionTitle });
      return { suggestions: FALLBACK_SUGGESTIONS, source: 'fallback' };
    }
    return { suggestions: parsed, source: 'ai' };
  } catch (e) {
    logger.warn('skill-gap.ai_suggest: error, using fallback', {
      err: (e as Error).message,
    });
    return { suggestions: FALLBACK_SUGGESTIONS, source: 'fallback' };
  }
};

// ============================================================
// Skill course recommendations (admin)
// ============================================================

export const setSkillCourseRecommendation = async (input: {
  skillId: bigint;
  courseId: bigint;
  minLevel?: number;
  maxLevel?: number;
  priority?: number;
}): Promise<{ id: string }> => {
  const row = await prisma.skillCourseRecommendation.upsert({
    where: { skillId_courseId: { skillId: input.skillId, courseId: input.courseId } },
    create: {
      skillId: input.skillId,
      courseId: input.courseId,
      minLevel: clampLevel(input.minLevel ?? 1),
      maxLevel: clampLevel(input.maxLevel ?? 5),
      priority: input.priority ?? 0,
    },
    update: {
      minLevel: input.minLevel !== undefined ? clampLevel(input.minLevel) : undefined,
      maxLevel: input.maxLevel !== undefined ? clampLevel(input.maxLevel) : undefined,
      priority: input.priority,
    },
  });
  return { id: serializeBigInt(row.id) };
};

export const removeSkillCourseRecommendation = async (
  skillId: bigint,
  courseId: bigint,
): Promise<void> => {
  await prisma.skillCourseRecommendation.deleteMany({
    where: { skillId, courseId },
  });
};

export const listSkillCourseRecommendations = async (
  skillId: bigint,
): Promise<
  Array<{
    id: string;
    courseId: string;
    courseTitle: string;
    courseSlug: string;
    minLevel: number;
    maxLevel: number;
    priority: number;
  }>
> => {
  const rows = await prisma.skillCourseRecommendation.findMany({
    where: { skillId },
    include: { course: { select: { id: true, title: true, slug: true } } },
    orderBy: { priority: 'desc' },
  });
  return rows.map((r) => ({
    id: serializeBigInt(r.id),
    courseId: serializeBigInt(r.course.id),
    courseTitle: r.course.title,
    courseSlug: r.course.slug,
    minLevel: r.minLevel,
    maxLevel: r.maxLevel,
    priority: r.priority,
  }));
};

// ============================================================
// Skill assessment history (per user)
// ============================================================

export interface SkillAssessmentHistoryEntry {
  id: string;
  skillId: string;
  skillName: string;
  skillCategory: string | null;
  level: number;
  previousLevel: number | null;
  delta: number | null;
  source: string;
  notes: string | null;
  assessor: { id: string; fullName: string } | null;
  assessedAt: string;
}

export const listMyAssessmentHistory = async (
  userId: bigint,
  filters: { skillId?: bigint; source?: 'self' | 'manager' | 'auto'; limit?: number } = {},
): Promise<SkillAssessmentHistoryEntry[]> => {
  const limit = Math.min(Math.max(filters.limit ?? 200, 1), 500);

  const rows = await prisma.skillAssessment.findMany({
    where: {
      userId,
      ...(filters.skillId ? { skillId: filters.skillId } : {}),
      ...(filters.source ? { source: filters.source } : {}),
    },
    include: {
      skill: { select: { id: true, name: true, category: true } },
      assessor: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  // First pass: compute per-skill chronological delta
  const previousBySkill = new Map<string, number>();
  const enriched = rows.map((r) => {
    const skillKey = r.skillId.toString();
    const prev = previousBySkill.get(skillKey) ?? null;
    previousBySkill.set(skillKey, r.level);
    return {
      id: serializeBigInt(r.id),
      skillId: skillKey,
      skillName: r.skill.name,
      skillCategory: r.skill.category,
      level: r.level,
      previousLevel: prev,
      delta: prev !== null ? r.level - prev : null,
      source: r.source,
      notes: r.notes,
      assessor: r.assessor
        ? { id: serializeBigInt(r.assessor.id), fullName: r.assessor.fullName }
        : null,
      assessedAt: r.createdAt.toISOString(),
    } satisfies SkillAssessmentHistoryEntry;
  });

  // Return newest first for UI timeline
  return enriched.reverse();
};
