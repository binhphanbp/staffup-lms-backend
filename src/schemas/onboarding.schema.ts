import { z } from 'zod';

const idParam = z.string().regex(/^\d+$/, 'ID không hợp lệ');

const taskCategoryEnum = z.enum(['learning', 'admin', 'meeting', 'practice', 'review', 'other']);
const taskPriorityEnum = z.enum(['low', 'medium', 'high']);
const taskStatusEnum = z.enum(['pending', 'in_progress', 'done', 'skipped']);
const planStatusEnum = z.enum(['active', 'completed', 'paused', 'cancelled']);

export const templateIdParamsSchema = z.object({ id: idParam });
export const planIdParamsSchema = z.object({ id: idParam });
export const planTaskParamsSchema = z.object({ id: idParam, taskId: idParam });

export const listTemplatesQuerySchema = z.object({
  isActive: z.union([z.literal('true'), z.literal('false')]).optional(),
  departmentId: idParam.optional(),
  search: z.string().trim().max(150).optional(),
});

export const listPlansQuerySchema = z.object({
  status: planStatusEnum.optional(),
  assigneeId: idParam.optional(),
  managerId: idParam.optional(),
  scope: z.enum(['mine', 'team']).optional(),
});

const taskInputSchema = z.object({
  id: idParam.optional(),
  title: z.string().trim().min(2).max(250),
  description: z.string().trim().max(1000).nullish(),
  category: taskCategoryEnum.optional(),
  priority: taskPriorityEnum.optional(),
  estimatedHours: z.number().int().min(1).max(80).optional(),
  courseId: idParam.nullish(),
  resourceUrl: z.string().trim().url('URL không hợp lệ').max(500).nullish().or(z.literal('')),
});

const stageInputSchema = z.object({
  id: idParam.optional(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).nullish(),
  startOffsetDays: z.number().int().min(0).max(365),
  endOffsetDays: z.number().int().min(1).max(365),
  tasks: z.array(taskInputSchema).max(20).default([]),
});

export const upsertTemplateSchema = z.object({
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().max(1000).optional().default(''),
  targetPosition: z.string().trim().max(150).nullish(),
  departmentId: idParam.nullish(),
  totalDays: z.number().int().min(1).max(365).optional(),
  isActive: z.boolean().optional(),
  stages: z.array(stageInputSchema).min(1).max(6),
});

export const aiGenerateTemplateSchema = z.object({
  targetPosition: z.string().trim().min(2).max(150),
  departmentName: z.string().trim().max(150).nullish(),
  totalDays: z.number().int().min(7).max(180).optional(),
  toneHint: z.string().trim().max(150).nullish(),
  extraNotes: z.string().trim().max(500).nullish(),
});

export const assignPlanSchema = z.object({
  templateId: idParam,
  assigneeId: idParam,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ (YYYY-MM-DD).'),
  notes: z.string().trim().max(1000).nullish(),
});

export const updatePlanSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày không hợp lệ (YYYY-MM-DD).')
    .optional(),
  status: planStatusEnum.optional(),
  notes: z.string().trim().max(1000).nullish(),
});

export const updateTaskStatusSchema = z.object({
  status: taskStatusEnum,
  managerNote: z.string().trim().max(500).nullish(),
});
