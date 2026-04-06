import { z } from 'zod';

// Get quiz attempt detail
export const getQuizAttemptDetailSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Attempt ID must be a numeric string'),
});

export type GetQuizAttemptDetailInput = z.infer<typeof getQuizAttemptDetailSchema>;

// Start quiz attempt
export const startQuizAttemptSchema = z.object({
  quizId: z.string().regex(/^\d+$/, 'Quiz ID must be a numeric string'),
  enrollmentId: z.string().regex(/^\d+$/, 'Enrollment ID must be a numeric string'),
});

export type StartQuizAttemptInput = z.infer<typeof startQuizAttemptSchema>;

// Save quiz attempt response
export const saveQuizResponseSchema = z.object({
  attemptQuestionId: z.string().regex(/^\d+$/, 'Attempt question ID must be a numeric string'),
  responseText: z.string().max(10000).optional().nullable(),
  selectedOptionIds: z.array(z.string().regex(/^\d+$/)).optional(),
});

export type SaveQuizResponseInput = z.infer<typeof saveQuizResponseSchema>;

// Auto-grade objective questions
export const autoGradeObjectiveSchema = z.object({
  attemptId: z.string().regex(/^\d+$/, 'Attempt ID must be a numeric string'),
});

export type AutoGradeObjectiveInput = z.infer<typeof autoGradeObjectiveSchema>;

// Submit quiz attempt
export const submitQuizAttemptSchema = z.object({
  attemptId: z.string().regex(/^\d+$/, 'Attempt ID must be a numeric string'),
});

export type SubmitQuizAttemptInput = z.infer<typeof submitQuizAttemptSchema>;

// Get attempt history
export const getAttemptHistorySchema = z.object({
  enrollmentId: z.string().regex(/^\d+$/, 'Enrollment ID must be a numeric string').optional(),
  quizId: z.string().regex(/^\d+$/, 'Quiz ID must be a numeric string').optional(),
});

export type GetAttemptHistoryInput = z.infer<typeof getAttemptHistorySchema>;

// Manual grade response
export const manualGradeResponseSchema = z.object({
  responseId: z.string().regex(/^\d+$/, 'Response ID must be a numeric string'),
});

export const manualGradeResponseBodySchema = z.object({
  awardedPoints: z.number().min(0, 'Awarded points must be at least 0'),
});

export type ManualGradeResponseInput = z.infer<typeof manualGradeResponseSchema>;
export type ManualGradeResponseBodyInput = z.infer<typeof manualGradeResponseBodySchema>;

// Finalize grading
export const finalizeGradingSchema = z.object({
  attemptId: z.string().regex(/^\d+$/, 'Attempt ID must be a numeric string'),
});

export type FinalizeGradingInput = z.infer<typeof finalizeGradingSchema>;
