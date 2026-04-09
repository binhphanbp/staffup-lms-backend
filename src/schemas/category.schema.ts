import { z } from 'zod';
import {
  numericIdStringSchema,
  optionalBooleanQuerySchema,
  requiredStringSchema,
} from '@/schemas/shared.schema';

const parentIdSchema = z
  .union([z.string(), z.number()])
  .optional()
  .nullable()
  .transform((val) => {
    if (val === '' || val === null || val === undefined) return null;
    return String(val);
  })
  .refine((val) => val === null || /^\d+$/.test(val), 'Parent ID is invalid.');

export const categoryIdParamSchema = z.object({
  id: numericIdStringSchema('Category ID'),
});

export const categoryListQuerySchema = z.object({
  tree: optionalBooleanQuerySchema,
  activeOnly: optionalBooleanQuerySchema,
});

export const createCategorySchema = z.object({
  name: requiredStringSchema('Name', 2, 150),
  parentId: parentIdSchema,
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = z
  .object({
    name: requiredStringSchema('Name', 2, 150).optional(),
    parentId: parentIdSchema,
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.parentId !== undefined || data.isActive !== undefined,
    {
      message: 'At least one field must be provided.',
      path: [],
    },
  );

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryListQuery = z.infer<typeof categoryListQuerySchema>;
