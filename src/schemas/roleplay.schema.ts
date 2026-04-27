import { z } from 'zod';

const idParam = z.string().regex(/^\d+$/, 'ID không hợp lệ');

export const sessionIdParamsSchema = z.object({
  sessionId: idParam,
});

export const scenarioIdParamsSchema = z.object({
  id: idParam,
});

export const startSessionSchema = z.object({
  scenarioId: idParam,
});

export const sendTurnSchema = z.object({
  message: z.string().trim().min(1, 'Tin nhắn không được để trống').max(2000),
});

export const listSessionsQuerySchema = z.object({
  scenarioId: idParam.optional(),
});

const rubricCriterionSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9_]+$/, 'key chỉ gồm chữ thường, số, dấu gạch dưới'),
  label: z.string().trim().min(1).max(100),
  description: z.string().trim().max(300).optional().default(''),
  weight: z.number().int().min(1).max(100),
});

export const createScenarioSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, 'slug chỉ gồm chữ thường, số, gạch nối'),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(2000),
  personaName: z.string().trim().min(1).max(100),
  personaRole: z.string().trim().min(1).max(150),
  personaTone: z.string().trim().max(50).optional(),
  context: z.string().trim().min(20).max(4000),
  openingLine: z.string().trim().min(2).max(1000),
  objectives: z.array(z.string().trim().min(2).max(300)).max(8).optional(),
  evaluationRubric: z.array(rubricCriterionSchema).max(8).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  category: z
    .enum(['communication', 'sales', 'leadership', 'conflict', 'interview', 'support'])
    .optional(),
  estimatedMinutes: z.number().int().min(2).max(60).optional(),
  maxTurns: z.number().int().min(3).max(30).optional(),
  language: z.string().trim().max(10).optional(),
  voiceHint: z.string().trim().max(50).nullish(),
  isActive: z.boolean().optional(),
});

export const updateScenarioSchema = createScenarioSchema.partial();
