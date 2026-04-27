import { z } from 'zod';
import { numericIdStringSchema, uniqueStringArraySchema } from '@/schemas/shared.schema';

// Get quiz attempt detail
export const getQuizAttemptDetailSchema = z.object({
  id: numericIdStringSchema('Attempt ID'),
});

export type GetQuizAttemptDetailInput = z.infer<typeof getQuizAttemptDetailSchema>;

// Start quiz attempt
export const startQuizAttemptSchema = z.object({
  quizId: numericIdStringSchema('Quiz ID'),
  enrollmentId: numericIdStringSchema('Enrollment ID'),
});

export type StartQuizAttemptInput = z.infer<typeof startQuizAttemptSchema>;

// Save quiz attempt response
export const saveQuizResponseSchema = z.object({
  attemptQuestionId: numericIdStringSchema('Attempt question ID'),
  responseText: z
    .string()
    .trim()
    .max(10000, 'Response text must be at most 10000 characters long.')
    .optional()
    .nullable(),
  selectedOptionIds: uniqueStringArraySchema(
    numericIdStringSchema('Selected option ID'),
    'selectedOptionIds',
    0,
    100,
  ).optional(),
});

export type SaveQuizResponseInput = z.infer<typeof saveQuizResponseSchema>;

// Auto-grade objective questions
export const autoGradeObjectiveSchema = z.object({
  attemptId: numericIdStringSchema('Attempt ID'),
});

export type AutoGradeObjectiveInput = z.infer<typeof autoGradeObjectiveSchema>;

// Submit quiz attempt
export const submitQuizAttemptSchema = z.object({
  attemptId: numericIdStringSchema('Attempt ID'),
});

export type SubmitQuizAttemptInput = z.infer<typeof submitQuizAttemptSchema>;

// Get attempt history (student scope — filters by authenticated user)
export const getAttemptHistorySchema = z.object({
  enrollmentId: numericIdStringSchema('Enrollment ID').optional(),
  quizId: numericIdStringSchema('Quiz ID').optional(),
});

export type GetAttemptHistoryInput = z.infer<typeof getAttemptHistorySchema>;

// Get all attempts (admin/trainer scope — server-side filtering + pagination)
const attemptStatusSchema = z.enum([
  'in_progress',
  'submitted',
  'graded',
  'expired',
  'auto_submitted',
]);

const attemptAiStatusSchema = z.enum(['all', 'pending', 'ai_graded', 'finalized']);

const attemptSortBySchema = z.enum(['submittedAt', 'startedAt', 'gradedAt', 'totalScore']);

export const getAllAttemptsSchema = z.object({
  status: attemptStatusSchema.optional(),
  aiStatus: attemptAiStatusSchema.optional(),
  courseId: numericIdStringSchema('Course ID').optional(),
  quizId: numericIdStringSchema('Quiz ID').optional(),
  search: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(20),
  sortBy: attemptSortBySchema.default('submittedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type GetAllAttemptsInput = z.infer<typeof getAllAttemptsSchema>;

// Manual grade response
export const manualGradeResponseSchema = z.object({
  responseId: numericIdStringSchema('Response ID'),
});

export const manualGradeResponseBodySchema = z.object({
  awardedPoints: z.coerce.number().min(0, 'Awarded points must be at least 0.'),
});

export type ManualGradeResponseInput = z.infer<typeof manualGradeResponseSchema>;
export type ManualGradeResponseBodyInput = z.infer<typeof manualGradeResponseBodySchema>;

// Finalize grading
export const finalizeGradingSchema = z.object({
  attemptId: numericIdStringSchema('Attempt ID'),
});

export type FinalizeGradingInput = z.infer<typeof finalizeGradingSchema>;
