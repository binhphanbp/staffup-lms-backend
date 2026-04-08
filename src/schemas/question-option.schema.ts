import { z } from 'zod';

export const createOptionSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  isCorrect: z.boolean().default(false),
  orderIndex: z.number().int().positive(),
});

export const updateOptionSchema = z.object({
  content: z.string().min(1).optional(),
  isCorrect: z.boolean().optional(),
  orderIndex: z.number().int().positive().optional(),
});

export type CreateOptionInput = z.infer<typeof createOptionSchema>;
export type UpdateOptionInput = z.infer<typeof updateOptionSchema>;
