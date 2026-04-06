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
