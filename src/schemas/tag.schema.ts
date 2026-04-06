import { z } from 'zod';

export const createTagSchema = z.object({
  name: z
    .string({
      required_error: 'Tag name is required',
    })
    .min(1, 'Tag name cannot be empty')
    .max(100, 'Tag name cannot exceed 100 characters'),
});

export const updateTagSchema = z.object({
  name: z
    .string()
    .min(1, 'Tag name cannot be empty')
    .max(100, 'Tag name cannot exceed 100 characters')
    .optional(),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
