import { z } from 'zod';

export const createQuizSchema = z
  .object({
    courseId: z.string().regex(/^\d+$/, 'Course ID must be a valid number'),
    lessonId: z.string().regex(/^\d+$/, 'Lesson ID must be a valid number').optional(),
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    selectionMode: z.enum(['fixed', 'random_pool']).optional(),
    passScorePercent: z
      .number()
      .min(0, 'Pass score must be at least 0')
      .max(100, 'Pass score must be at most 100')
      .optional(),
    timeLimitMinutes: z.number().int().positive('Time limit must be positive').optional(),
    maxAttempts: z.number().int().positive('Max attempts must be positive').optional(),
    questionsToPull: z.number().int().positive('Questions to pull must be positive').optional(),
    shuffleQuestions: z.boolean().optional(),
    shuffleOptions: z.boolean().optional(),
    questions: z
      .array(
        z.object({
          questionId: z.string().regex(/^\d+$/, 'Question ID must be a valid number'),
          orderIndex: z.number().int().positive().optional(),
          points: z.number().int().positive().optional(),
          isRequired: z.boolean().optional(),
        }),
      )
      .optional(),
  })
  .refine(
    (data) => {
      // If random_pool mode, questionsToPull is required
      if (data.selectionMode === 'random_pool' && !data.questionsToPull) {
        return false;
      }
      return true;
    },
    {
      message: 'Questions to pull is required for random_pool selection mode',
      path: ['questionsToPull'],
    },
  )
  .refine(
    (data) => {
      // If random_pool mode, check if enough questions provided
      if (
        data.selectionMode === 'random_pool' &&
        data.questionsToPull &&
        data.questions &&
        data.questions.length < data.questionsToPull
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Not enough questions provided for random_pool mode',
      path: ['questions'],
    },
  );

export const updateQuizSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  selectionMode: z.enum(['fixed', 'random_pool']).optional(),
  passScorePercent: z
    .number()
    .min(0, 'Pass score must be at least 0')
    .max(100, 'Pass score must be at most 100')
    .optional(),
  timeLimitMinutes: z.number().int().positive('Time limit must be positive').optional(),
  maxAttempts: z.number().int().positive('Max attempts must be positive').optional(),
  questionsToPull: z.number().int().positive('Questions to pull must be positive').optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
});

export const quizIdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Quiz ID must be a valid number'),
});

export const listQuizzesQuerySchema = z.object({
  courseId: z.string().regex(/^\d+$/, 'Course ID must be a valid number').optional(),
  lessonId: z.string().regex(/^\d+$/, 'Lesson ID must be a valid number').optional(),
  selectionMode: z.enum(['fixed', 'random_pool']).optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a valid number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a valid number').optional(),
});

export const addQuestionToQuizSchema = z.object({
  questionId: z.string().regex(/^\d+$/, 'Question ID must be a valid number'),
  orderIndex: z.number().int().positive().optional(),
  points: z.number().int().positive().optional(),
  isRequired: z.boolean().optional(),
});

export const updateQuizQuestionSchema = z.object({
  orderIndex: z.number().int().positive().optional(),
  points: z.number().int().positive().optional(),
  isRequired: z.boolean().optional(),
});

export const reorderQuizQuestionsSchema = z.object({
  questionOrders: z.array(
    z.object({
      questionId: z.string().regex(/^\d+$/, 'Question ID must be a valid number'),
      orderIndex: z.number().int().positive(),
    }),
  ),
});

export const quizQuestionParamsSchema = z.object({
  quizId: z.string().regex(/^\d+$/, 'Quiz ID must be a valid number'),
  questionId: z.string().regex(/^\d+$/, 'Question ID must be a valid number'),
});

export const quizIdOnlyParamsSchema = z.object({
  quizId: z.string().regex(/^\d+$/, 'Quiz ID must be a valid number'),
});

export type CreateQuizBody = z.infer<typeof createQuizSchema>;
export type UpdateQuizBody = z.infer<typeof updateQuizSchema>;
export type QuizIdParams = z.infer<typeof quizIdParamsSchema>;
export type ListQuizzesQuery = z.infer<typeof listQuizzesQuerySchema>;
export type AddQuestionToQuizBody = z.infer<typeof addQuestionToQuizSchema>;
export type UpdateQuizQuestionBody = z.infer<typeof updateQuizQuestionSchema>;
export type ReorderQuizQuestionsBody = z.infer<typeof reorderQuizQuestionsSchema>;
export type QuizQuestionParams = z.infer<typeof quizQuestionParamsSchema>;
export type QuizIdOnlyParams = z.infer<typeof quizIdOnlyParamsSchema>;
