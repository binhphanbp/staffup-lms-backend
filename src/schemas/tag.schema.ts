import { z } from 'zod';
import { numericIdStringSchema, requiredStringSchema } from '@/schemas/shared.schema';

export const createTagSchema = z.object({
  name: requiredStringSchema('Tag name', 1, 100),
});

export const updateTagSchema = z
  .object({
    name: requiredStringSchema('Tag name', 1, 100).optional(),
  })
  .refine((data) => data.name !== undefined, {
    message: 'At least one field must be provided.',
    path: [],
  });

export const tagIdParamSchema = z.object({
  id: numericIdStringSchema('Tag ID'),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
