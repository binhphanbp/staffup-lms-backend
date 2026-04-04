import { z } from 'zod';

export const getEnrollmentDetailSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Enrollment ID is required'),
  }),
});

export type GetEnrollmentDetailInput = z.infer<typeof getEnrollmentDetailSchema>;
