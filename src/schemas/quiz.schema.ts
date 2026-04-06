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
