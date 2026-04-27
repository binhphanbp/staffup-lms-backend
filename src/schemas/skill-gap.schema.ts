import { z } from 'zod';

const idParam = z.string().regex(/^\d+$/, 'ID không hợp lệ');

export const idParamsSchema = z.object({
  id: idParam,
});

export const userIdParamsSchema = z.object({
  userId: idParam,
});

export const departmentIdParamsSchema = z.object({
  departmentId: idParam,
});

export const skillIdParamsSchema = z.object({
  skillId: idParam,
});

export const listSkillsQuerySchema = z.object({
  category: z.string().max(60).optional(),
  q: z.string().max(120).optional(),
  isActive: z.enum(['true', 'false']).optional(),
});

export const createSkillSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  category: z.string().max(60).optional(),
});

export const updateSkillSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).optional(),
  category: z.string().max(60).optional(),
  isActive: z.boolean().optional(),
});

export const positionTitleQuerySchema = z.object({
  positionTitle: z.string().min(1).max(150),
});

export const upsertPositionSkillSchema = z.object({
  positionTitle: z.string().min(1).max(150),
  skillId: idParam,
  targetLevel: z.number().int().min(1).max(5),
  weight: z.number().min(0.1).max(3).optional(),
  isCore: z.boolean().optional(),
});

export const setMySkillSchema = z.object({
  level: z.number().int().min(1).max(5),
  notes: z.string().max(2000).optional(),
});

export const managerAssessSchema = z.object({
  userId: idParam,
  skillId: idParam,
  level: z.number().int().min(1).max(5),
  notes: z.string().max(2000).optional(),
});

export const aiSuggestSchema = z.object({
  positionTitle: z.string().min(1).max(150),
  context: z.string().max(2000).optional(),
});

export const setRecommendationSchema = z.object({
  courseId: idParam,
  minLevel: z.number().int().min(1).max(5).optional(),
  maxLevel: z.number().int().min(1).max(5).optional(),
  priority: z.number().int().min(0).max(100).optional(),
});

export const removeRecommendationSchema = z.object({
  courseId: idParam,
});
