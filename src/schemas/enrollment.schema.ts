import { z } from 'zod';
import {
  numericIdStringSchema,
  optionalBooleanQuerySchema,
  optionalNullableDescriptionSchema,
  paginationLimitQuerySchema,
  paginationPageQuerySchema,
  searchQuerySchema,
  uniqueStringArraySchema,
} from '@/schemas/shared.schema';

export const enrollmentIdParamSchema = z.object({
  id: numericIdStringSchema('Enrollment ID'),
});

export const getEnrollmentDetailSchema = enrollmentIdParamSchema;

export const enrollCourseParamsSchema = z.object({
  courseId: numericIdStringSchema('Course ID'),
});

export const enrollUsersSchema = z.object({
  userIds: uniqueStringArraySchema(numericIdStringSchema('User ID'), 'userIds', 1, 500),
  dueAt: z
    .string()
    .datetime({ message: 'dueAt must be a valid ISO datetime.' })
    .optional()
    .nullable(),
  assignmentNote: optionalNullableDescriptionSchema.optional(),
});

export const selfEnrollSchema = z.object({
  courseId: numericIdStringSchema('Course ID'),
});
export const selfEnrollSchema = z.object({
  courseId: numericIdStringSchema('Course ID'),
});

export const listEnrollmentsSchema = z.object({
  page: paginationPageQuerySchema,
  limit: paginationLimitQuerySchema,
  userId: numericIdStringSchema('User ID').optional(),
  courseId: numericIdStringSchema('Course ID').optional(),
  status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled', 'expired']).optional(),
  departmentId: numericIdStringSchema('Department ID').optional(),
  overdue: optionalBooleanQuerySchema,
  search: searchQuerySchema,
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

export const updateEnrollmentStatusParamsSchema = enrollmentIdParamSchema;

export const updateEnrollmentStatusSchema = z.object({
  status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled', 'expired']),
  dueAt: z
    .string()
    .datetime({ message: 'dueAt must be a valid ISO datetime.' })
    .optional()
    .nullable(),
  startedAt: z
    .string()
    .datetime({ message: 'startedAt must be a valid ISO datetime.' })
    .optional()
    .nullable(),
  completedAt: z
    .string()
    .datetime({ message: 'completedAt must be a valid ISO datetime.' })
    .optional()
    .nullable(),
  note: optionalNullableDescriptionSchema.optional(),
});

export { ALLOWED_TRANSITIONS };

export type GetEnrollmentDetailInput = z.infer<typeof getEnrollmentDetailSchema>;
export type EnrollUsersInput = z.infer<typeof enrollUsersSchema>;
export type ListEnrollmentsQuery = z.infer<typeof listEnrollmentsSchema>;
export type UpdateEnrollmentStatusInput = z.infer<typeof updateEnrollmentStatusSchema>;

// ─── Lesson Progress Schemas ───────────────────────────────────────────────

export const enrollmentLessonParamsSchema = z.object({
  enrollmentId: numericIdStringSchema('Enrollment ID'),
  lessonId: numericIdStringSchema('Lesson ID'),
});

export const startLessonSchema = enrollmentLessonParamsSchema;

export const updateLessonProgressBodySchema = z
  .object({
    watchTimeSeconds: z.coerce
      .number()
      .int()
      .min(0, 'watchTimeSeconds must be at least 0.')
      .optional(),
    lastPositionSeconds: z.coerce
      .number()
      .int()
      .min(0, 'lastPositionSeconds must be at least 0.')
      .optional(),
    status: z.enum(['in_progress', 'completed', 'skipped']).optional(),
  })
  .refine(
    (data) =>
      data.watchTimeSeconds !== undefined ||
      data.lastPositionSeconds !== undefined ||
      data.status !== undefined,
    {
      message: 'At least one field must be provided.',
      path: [],
    },
  );

export const updateLessonProgressSchema = z.object({
  params: enrollmentLessonParamsSchema,
  body: updateLessonProgressBodySchema,
});

export const completeLessonSchema = enrollmentLessonParamsSchema;

export const getEnrollmentProgressSchema = z.object({
  enrollmentId: numericIdStringSchema('Enrollment ID'),
});

export type StartLessonInput = z.infer<typeof startLessonSchema>;
export type UpdateLessonProgressInput = z.infer<typeof updateLessonProgressSchema>;
export type CompleteLessonInput = z.infer<typeof completeLessonSchema>;
export type GetEnrollmentProgressInput = z.infer<typeof getEnrollmentProgressSchema>;
