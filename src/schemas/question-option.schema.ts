import { z } from 'zod';
import { requiredStringSchema } from '@/schemas/shared.schema';

export const createOptionSchema = z.object({
  content: requiredStringSchema('Content', 1, 5000),
  isCorrect: z.boolean().default(false),
  orderIndex: z.coerce.number().int().positive(),
});

export const updateOptionSchema = z
  .object({
    content: requiredStringSchema('Content', 1, 5000).optional(),
    isCorrect: z.boolean().optional(),
    orderIndex: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) =>
      data.content !== undefined || data.isCorrect !== undefined || data.orderIndex !== undefined,
    {
      message: 'At least one field must be provided.',
      path: [],
    },
  );

export type CreateOptionInput = z.infer<typeof createOptionSchema>;
export type UpdateOptionInput = z.infer<typeof updateOptionSchema>;
