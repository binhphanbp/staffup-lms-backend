import { z } from 'zod';

export const getEnrollmentDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Enrollment ID is required'),
  }),
});

export const enrollUsersSchema = z.object({
  userIds: z
    .array(z.string().regex(/^\d+$/, 'User ID must be a valid number'))
    .min(1, 'At least one user ID is required'),
  dueAt: z
    .string()
    .datetime({ message: 'dueAt must be a valid ISO datetime' })
    .optional()
    .nullable(),
  assignmentNote: z.string().max(500).optional().nullable(),
});

export type GetEnrollmentDetailInput = z.infer<typeof getEnrollmentDetailSchema>;
export type EnrollUsersInput = z.infer<typeof enrollUsersSchema>;
