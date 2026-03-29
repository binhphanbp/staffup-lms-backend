import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z.string().max(5000, 'Description must be at most 5000 characters').optional(),
  thumbnailUrl: z.string().url('Thumbnail must be a valid URL').optional(),
  categoryId: z.coerce.bigint().optional(),
  ownerDepartmentId: z.coerce.bigint().optional(),
  estimatedDurationMinutes: z.coerce.number().int().positive().optional(),
});

export const updateCourseSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters')
    .optional(),
  description: z.string().max(5000, 'Description must be at most 5000 characters').optional(),
  thumbnailUrl: z.string().url('Thumbnail must be a valid URL').optional(),
  categoryId: z.coerce.bigint().optional(),
  ownerDepartmentId: z.coerce.bigint().optional(),
  estimatedDurationMinutes: z.coerce.number().int().positive().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const courseIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid course ID format'),
});

export const courseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  search: z.string().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseQuery = z.infer<typeof courseQuerySchema>;
