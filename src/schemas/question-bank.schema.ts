import { z } from 'zod';
import {
  numericIdStringSchema,
  optionalBooleanQuerySchema,
  optionalNullableDescriptionSchema,
  paginationLimitQuerySchema,
  paginationPageQuerySchema,
  requiredStringSchema,
  searchQuerySchema,
} from '@/schemas/shared.schema';

export const createQuestionBankSchema = z.object({
  title: requiredStringSchema('Title', 2, 200),
  description: optionalNullableDescriptionSchema.optional(),
  categoryId: numericIdStringSchema('Category ID').optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateQuestionBankSchema = z
  .object({
    title: requiredStringSchema('Title', 2, 200).optional(),
    description: optionalNullableDescriptionSchema.optional(),
    categoryId: numericIdStringSchema('Category ID').optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.categoryId !== undefined ||
      data.isActive !== undefined,
    {
      message: 'At least one field must be provided.',
      path: [],
    },
  );

export const listQuestionBanksSchema = z.object({
  page: paginationPageQuerySchema,
  limit: paginationLimitQuerySchema,
  categoryId: numericIdStringSchema('Category ID').optional(),
  ownerTrainerId: numericIdStringSchema('Owner trainer ID').optional(),
  search: searchQuerySchema,
  isActive: optionalBooleanQuerySchema,
});

export const questionBankIdParamSchema = z.object({
  id: numericIdStringSchema('Question bank ID'),
});

export const questionBankRouteParamsSchema = z.object({
  bankId: numericIdStringSchema('Question bank ID'),
});

export type CreateQuestionBankInput = z.infer<typeof createQuestionBankSchema>;
export type UpdateQuestionBankInput = z.infer<typeof updateQuestionBankSchema>;
export type ListQuestionBanksQuery = z.infer<typeof listQuestionBanksSchema>;
