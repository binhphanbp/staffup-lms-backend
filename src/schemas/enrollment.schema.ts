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

export const listEnrollmentsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  userId: z.string().regex(/^\d+$/).optional(),
  courseId: z.string().regex(/^\d+$/).optional(),
  status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled', 'expired']).optional(),
  departmentId: z.string().regex(/^\d+$/).optional(),
  overdue: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

// Status transition rules:
// assigned    → in_progress, cancelled
// in_progress → completed, cancelled
// completed   → (terminal, admin only can revert to in_progress)
// cancelled   → assigned (re-enroll, admin only)
// expired     → assigned (admin only)
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  assigned: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: ['in_progress'], // admin only
  cancelled: ['assigned'], // admin only
  expired: ['assigned'], // admin only
};

export const updateEnrollmentStatusSchema = z.object({
  status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled', 'expired']),
  dueAt: z.string().datetime().optional().nullable(),
  startedAt: z.string().datetime().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
  note: z.string().max(500).optional().nullable(),
});

export { ALLOWED_TRANSITIONS };

export type GetEnrollmentDetailInput = z.infer<typeof getEnrollmentDetailSchema>;
export type EnrollUsersInput = z.infer<typeof enrollUsersSchema>;
export type ListEnrollmentsQuery = z.infer<typeof listEnrollmentsSchema>;
export type UpdateEnrollmentStatusInput = z.infer<typeof updateEnrollmentStatusSchema>;

// ─── Lesson Progress Schemas ───────────────────────────────────────────────

export const startLessonSchema = z.object({
  enrollmentId: z.string().regex(/^\d+$/, 'Enrollment ID must be a valid number'),
  lessonId: z.string().regex(/^\d+$/, 'Lesson ID must be a valid number'),
});

export const updateLessonProgressSchema = z.object({
  params: z.object({
    enrollmentId: z.string().regex(/^\d+$/, 'Enrollment ID must be a valid number'),
    lessonId: z.string().regex(/^\d+$/, 'Lesson ID must be a valid number'),
  }),
  body: z.object({
    watchTimeSeconds: z.number().int().min(0).optional(),
    lastPositionSeconds: z.number().int().min(0).optional(),
    status: z.enum(['in_progress', 'completed', 'skipped']).optional(),
  }),
});

export type StartLessonInput = z.infer<typeof startLessonSchema>;
export type UpdateLessonProgressInput = z.infer<typeof updateLessonProgressSchema>;
