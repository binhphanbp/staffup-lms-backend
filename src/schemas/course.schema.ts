import { z } from 'zod';

const expandableCourseRelations = [
  'modules',
  'lessons',
  'resources',
  'quiz',
  'tags',
  'all',
] as const;
const lessonTypeValues = ['video', 'article', 'quiz'] as const;
const lessonResourceTypeValues = ['file', 'video', 'material'] as const;

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters')
    .trim(),
  description: z
    .string()
    .max(5000, 'Description must be at most 5000 characters')
    .trim()
    .optional(),
  thumbnailUrl: z.string().url('Thumbnail must be a valid URL').trim().optional(),
  mediaFolder: z.string().trim().max(255, 'Media folder must be at most 255 characters').optional(),
  categoryId: z.string().regex(/^\d+$/, 'Invalid category ID').optional(),
  ownerDepartmentId: z.string().regex(/^\d+$/, 'Invalid department ID').optional(),
  trainerUserId: z.string().regex(/^\d+$/, 'Invalid trainer ID').optional(),
  estimatedDurationMinutes: z.coerce.number().int().positive().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const updateCourseSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(5000, 'Description must be at most 5000 characters')
    .trim()
    .optional(),
  thumbnailUrl: z.string().url('Thumbnail must be a valid URL').trim().optional(),
  mediaFolder: z.string().trim().max(255, 'Media folder must be at most 255 characters').optional(),
  categoryId: z.string().regex(/^\d+$/, 'Invalid category ID').optional(),
  ownerDepartmentId: z.string().regex(/^\d+$/, 'Invalid department ID').optional(),
  trainerUserId: z.string().regex(/^\d+$/, 'Invalid trainer ID').optional(),
  estimatedDurationMinutes: z.coerce.number().int().positive().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const updateCourseStatusSchema = z.object({
  status: z.enum(['draft', 'published', 'archived']),
});

export const addCourseTagSchema = z.object({
  tagId: z.string().regex(/^\d+$/, 'Invalid tag ID'),
});

export const createCourseModuleSchema = z.object({
  title: z
    .string()
    .min(1, 'Module title is required')
    .max(200, 'Module title must be at most 200 characters')
    .trim(),
  orderIndex: z.coerce.number().int().positive(),
});

export const updateCourseModuleSchema = z.object({
  title: z
    .string()
    .min(1, 'Module title is required')
    .max(200, 'Module title must be at most 200 characters')
    .trim()
    .optional(),
  orderIndex: z.coerce.number().int().positive().optional(),
});

export const reorderCourseModulesSchema = z.object({
  moduleOrders: z
    .array(
      z.object({
        moduleId: z.string().regex(/^\d+$/, 'Invalid module ID'),
        orderIndex: z.coerce.number().int().positive(),
      }),
    )
    .min(1, 'At least one module order is required')
    .superRefine((items, ctx) => {
      const moduleIds = new Set<string>();
      const orderIndexes = new Set<number>();

      items.forEach((item, index) => {
        if (moduleIds.has(item.moduleId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, 'moduleId'],
            message: 'Duplicate moduleId is not allowed',
          });
        }
        moduleIds.add(item.moduleId);

        if (orderIndexes.has(item.orderIndex)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, 'orderIndex'],
            message: 'Duplicate orderIndex is not allowed',
          });
        }
        orderIndexes.add(item.orderIndex);
      });
    }),
});

const lessonPayloadSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Lesson title is required')
      .max(200, 'Lesson title must be at most 200 characters')
      .trim(),
    lessonType: z.enum(lessonTypeValues),
    contentText: z
      .string()
      .max(50000, 'Lesson content must be at most 50000 characters')
      .trim()
      .optional(),
    videoUrl: z.string().url('Video URL must be valid').trim().optional(),
    durationSeconds: z.coerce.number().int().min(0).default(0),
    orderIndex: z.coerce.number().int().positive(),
    isPreview: z.coerce.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.lessonType === 'video' && !data.videoUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['videoUrl'],
        message: 'videoUrl is required for video lessons',
      });
    }

    if (data.lessonType === 'article' && !data.contentText) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contentText'],
        message: 'contentText is required for article lessons',
      });
    }
  });

export const createCourseLessonSchema = lessonPayloadSchema;

export const updateCourseLessonSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Lesson title is required')
      .max(200, 'Lesson title must be at most 200 characters')
      .trim()
      .optional(),
    lessonType: z.enum(lessonTypeValues).optional(),
    contentText: z
      .string()
      .max(50000, 'Lesson content must be at most 50000 characters')
      .trim()
      .optional(),
    videoUrl: z.string().url('Video URL must be valid').trim().optional(),
    durationSeconds: z.coerce.number().int().min(0).optional(),
    orderIndex: z.coerce.number().int().positive().optional(),
    isPreview: z.coerce.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one field is required',
      });
    }
  });

export const reorderCourseLessonsSchema = z.object({
  lessonOrders: z
    .array(
      z.object({
        lessonId: z.string().regex(/^\d+$/, 'Invalid lesson ID'),
        orderIndex: z.coerce.number().int().positive(),
      }),
    )
    .min(1, 'At least one lesson order is required')
    .superRefine((items, ctx) => {
      const lessonIds = new Set<string>();
      const orderIndexes = new Set<number>();

      items.forEach((item, index) => {
        if (lessonIds.has(item.lessonId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, 'lessonId'],
            message: 'Duplicate lessonId is not allowed',
          });
        }
        lessonIds.add(item.lessonId);

        if (orderIndexes.has(item.orderIndex)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index, 'orderIndex'],
            message: 'Duplicate orderIndex is not allowed',
          });
        }
        orderIndexes.add(item.orderIndex);
      });
    }),
});

export const createLessonResourceSchema = z.object({
  fileName: z
    .string()
    .min(1, 'Resource fileName is required')
    .max(255, 'Resource fileName must be at most 255 characters')
    .trim(),
  fileUrl: z.string().url('Resource fileUrl must be valid').trim(),
  resourceType: z.enum(lessonResourceTypeValues).optional(),
  orderIndex: z.coerce.number().int().positive().optional(),
});

export const updateLessonResourceSchema = z
  .object({
    fileName: z
      .string()
      .min(1, 'Resource fileName is required')
      .max(255, 'Resource fileName must be at most 255 characters')
      .trim()
      .optional(),
    fileUrl: z.string().url('Resource fileUrl must be valid').trim().optional(),
    resourceType: z.enum(lessonResourceTypeValues).optional(),
    orderIndex: z.coerce.number().int().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one field is required',
      });
    }
  });

export const courseIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid course ID format'),
});

export const courseDetailQuerySchema = z.object({
  expand: z
    .string()
    .trim()
    .optional()
    .default('')
    .transform((value) =>
      value
        ? [
            ...new Set(
              value
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean),
            ),
          ]
        : [],
    )
    .refine(
      (items) =>
        items.every((item) => expandableCourseRelations.includes(item as CourseExpandValue)),
      {
        message: `Expand must only contain: ${expandableCourseRelations.join(', ')}`,
      },
    ),
});

export const courseTagParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid course ID format'),
  tagId: z.string().regex(/^\d+$/, 'Invalid tag ID'),
});

export const courseModuleParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid course ID format'),
  moduleId: z.string().regex(/^\d+$/, 'Invalid module ID'),
});

export const courseLessonParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid course ID format'),
  moduleId: z.string().regex(/^\d+$/, 'Invalid module ID'),
  lessonId: z.string().regex(/^\d+$/, 'Invalid lesson ID'),
});

export const lessonResourceParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid course ID format'),
  moduleId: z.string().regex(/^\d+$/, 'Invalid module ID'),
  lessonId: z.string().regex(/^\d+$/, 'Invalid lesson ID'),
  resourceId: z.string().regex(/^\d+$/, 'Invalid resource ID'),
});

export const courseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'publishedAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  search: z.string().trim().optional(),
  trainerId: z.string().regex(/^\d+$/, 'Invalid trainer ID').optional(),
  categoryId: z.string().regex(/^\d+$/, 'Invalid category ID').optional(),
  ownerDepartmentId: z.string().regex(/^\d+$/, 'Invalid department ID').optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type UpdateCourseStatusInput = z.infer<typeof updateCourseStatusSchema>;
export type AddCourseTagInput = z.infer<typeof addCourseTagSchema>;
export type CreateCourseModuleInput = z.infer<typeof createCourseModuleSchema>;
export type UpdateCourseModuleInput = z.infer<typeof updateCourseModuleSchema>;
export type ReorderCourseModulesInput = z.infer<typeof reorderCourseModulesSchema>;
export type CreateCourseLessonInput = z.infer<typeof createCourseLessonSchema>;
export type UpdateCourseLessonInput = z.infer<typeof updateCourseLessonSchema>;
export type ReorderCourseLessonsInput = z.infer<typeof reorderCourseLessonsSchema>;
export type CreateLessonResourceInput = z.infer<typeof createLessonResourceSchema>;
export type UpdateLessonResourceInput = z.infer<typeof updateLessonResourceSchema>;
export type CourseQuery = z.infer<typeof courseQuerySchema>;
export type CourseDetailQuery = z.infer<typeof courseDetailQuerySchema>;
type CourseExpandValue = (typeof expandableCourseRelations)[number];
