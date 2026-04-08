import { z } from 'zod';

const questionOptionSchema = z.object({
  content: z.string().min(1),
  isCorrect: z.boolean().default(false),
  orderIndex: z.number().int().positive(),
});

export const createQuestionSchema = z
  .object({
    questionType: z.enum(['single_choice', 'multiple_choice', 'essay']),
    content: z.string().min(1),
    explanation: z.string().optional().nullable(),
    defaultPoints: z.number().int().positive().optional(),
    options: z.array(questionOptionSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.questionType === 'essay') {
        return !data.options || data.options.length === 0;
      }
      return true;
    },
    { message: 'essay questions must not have options' },
  )
  .refine(
    (data) => {
      if (data.questionType !== 'essay') {
        return data.options && data.options.length >= 2;
      }
      return true;
    },
    { message: 'single_choice and multiple_choice questions require at least 2 options' },
  )
  .refine(
    (data) => {
      if (data.questionType === 'single_choice' && data.options) {
        return data.options.filter((o) => o.isCorrect).length === 1;
      }
      return true;
    },
    { message: 'single_choice question must have exactly 1 correct option' },
  )
  .refine(
    (data) => {
      if (data.questionType === 'multiple_choice' && data.options) {
        return data.options.filter((o) => o.isCorrect).length >= 1;
      }
      return true;
    },
    { message: 'multiple_choice question must have at least 1 correct option' },
  );

export const updateQuestionSchema = z.object({
  content: z.string().min(1).optional(),
  explanation: z.string().optional().nullable(),
  defaultPoints: z.number().int().positive().optional(),
});

export const listQuestionsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  questionType: z.enum(['single_choice', 'multiple_choice', 'essay']).optional(),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ListQuestionsQuery = z.infer<typeof listQuestionsSchema>;
