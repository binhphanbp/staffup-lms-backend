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

// Get attempt history
export const getAttemptHistorySchema = z.object({
  enrollmentId: numericIdStringSchema('Enrollment ID').optional(),
  quizId: numericIdStringSchema('Quiz ID').optional(),
});

export type GetAttemptHistoryInput = z.infer<typeof getAttemptHistorySchema>;

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
