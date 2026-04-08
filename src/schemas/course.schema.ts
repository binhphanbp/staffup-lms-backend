import { z } from 'zod';

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
  categoryId: z.string().regex(/^\d+$/, 'Invalid category ID').optional(),
  ownerDepartmentId: z.string().regex(/^\d+$/, 'Invalid department ID').optional(),
  trainerUserId: z.string().regex(/^\d+$/, 'Invalid trainer ID').optional(),
  estimatedDurationMinutes: z.coerce.number().int().positive().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export const courseIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid course ID format'),
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
export type CourseQuery = z.infer<typeof courseQuerySchema>;
