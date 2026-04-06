import { z } from 'zod';

// Get quiz attempt detail
export const getQuizAttemptDetailSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Attempt ID must be a numeric string'),
});

export type GetQuizAttemptDetailInput = z.infer<typeof getQuizAttemptDetailSchema>;
