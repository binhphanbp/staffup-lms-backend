import { z } from 'zod';

const parentIdSchema = z
  .union([z.string(), z.number()])
  .optional()
  .nullable()
  .transform((val) => {
    if (val === '' || val === null || val === undefined) return null;
    return String(val);
  })
  .refine((val) => val === null || /^\d+$/.test(val), 'Invalid parent ID format');

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(150, 'Name must be at most 150 characters'),
  parentId: parentIdSchema,
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(150, 'Name must be at most 150 characters')
    .optional(),
  parentId: parentIdSchema,
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
