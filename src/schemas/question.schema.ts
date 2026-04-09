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

const questionOptionSchema = z.object({
  content: requiredStringSchema('Option content', 1, 5000),
  isCorrect: z.boolean().default(false),
  orderIndex: z.coerce.number().int().positive(),
});

export const createQuestionSchema = z
  .object({
    questionType: z.enum(['single_choice', 'multiple_choice', 'essay']),
    content: requiredStringSchema('Question content', 1, 10000),
    explanation: optionalNullableDescriptionSchema.optional(),
    defaultPoints: z.coerce.number().int().positive().optional(),
    options: z
      .array(questionOptionSchema)
      .superRefine((items, ctx) => {
        const seen = new Set<number>();

        items.forEach((item, index) => {
          if (seen.has(item.orderIndex)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [index, 'orderIndex'],
              message: 'Duplicate option orderIndex is not allowed.',
            });
            return;
          }

          seen.add(item.orderIndex);
        });
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (data.questionType === 'essay') {
        return !data.options || data.options.length === 0;
      }
      return true;
    },
    { message: 'Essay questions must not have options.' },
  )
  .refine(
    (data) => {
      if (data.questionType !== 'essay') {
        return data.options && data.options.length >= 2;
      }
      return true;
    },
    { message: 'Single choice and multiple choice questions require at least 2 options.' },
  )
  .refine(
    (data) => {
      if (data.questionType === 'single_choice' && data.options) {
        return data.options.filter((o) => o.isCorrect).length === 1;
      }
      return true;
    },
    { message: 'Single choice question must have exactly 1 correct option.' },
  )
  .refine(
    (data) => {
      if (data.questionType === 'multiple_choice' && data.options) {
        return data.options.filter((o) => o.isCorrect).length >= 1;
      }
      return true;
    },
    { message: 'Multiple choice question must have at least 1 correct option.' },
  );

export const updateQuestionSchema = z
  .object({
    content: requiredStringSchema('Question content', 1, 10000).optional(),
    explanation: optionalNullableDescriptionSchema.optional(),
    defaultPoints: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) =>
      data.content !== undefined ||
      data.explanation !== undefined ||
      data.defaultPoints !== undefined,
    {
      message: 'At least one field must be provided.',
      path: [],
    },
  );

export const listQuestionsSchema = z.object({
  page: paginationPageQuerySchema,
  limit: paginationLimitQuerySchema,
  questionType: z.enum(['single_choice', 'multiple_choice', 'essay']).optional(),
  search: searchQuerySchema,
  isActive: optionalBooleanQuerySchema,
});

export const questionParamsSchema = z.object({
  bankId: numericIdStringSchema('Question bank ID'),
  id: numericIdStringSchema('Question ID'),
});

export const questionOptionParamsSchema = z.object({
  bankId: numericIdStringSchema('Question bank ID'),
  questionId: numericIdStringSchema('Question ID'),
  optionId: numericIdStringSchema('Option ID'),
});

export const questionInBankParamsSchema = z.object({
  bankId: numericIdStringSchema('Question bank ID'),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ListQuestionsQuery = z.infer<typeof listQuestionsSchema>;
