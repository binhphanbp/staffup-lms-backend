import { z } from 'zod';

export const createRoadmapSchema = z.object({
  departmentId: z.string().regex(/^\d+$/, 'Department ID must be a valid number'),
  categoryId: z.string().regex(/^\d+$/, 'Category ID must be a valid number').optional(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  targetPosition: z.string().max(150).optional(),
  isActive: z.boolean().optional(),
  courses: z
    .array(
      z.object({
        courseId: z.string().regex(/^\d+$/, 'Course ID must be a valid number'),
        orderIndex: z.number().int().positive().optional(),
        isRequired: z.boolean().optional(),
      }),
    )
    .optional(),
});

export const updateRoadmapSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  categoryId: z.string().regex(/^\d+$/, 'Category ID must be a valid number').optional(),
  targetPosition: z.string().max(150).optional(),
  isActive: z.boolean().optional(),
});

export const roadmapIdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Roadmap ID must be a valid number'),
});

export const listRoadmapsQuerySchema = z.object({
  departmentId: z.string().regex(/^\d+$/, 'Department ID must be a valid number').optional(),
  categoryId: z.string().regex(/^\d+$/, 'Category ID must be a valid number').optional(),
  isActive: z.enum(['true', 'false']).optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a valid number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a valid number').optional(),
});

export const addCourseToRoadmapSchema = z.object({
  courseId: z.string().regex(/^\d+$/, 'Course ID must be a valid number'),
  orderIndex: z.number().int().positive().optional(),
  isRequired: z.boolean().optional(),
});

export const updateRoadmapCourseSchema = z.object({
  orderIndex: z.number().int().positive().optional(),
  isRequired: z.boolean().optional(),
});

export const reorderRoadmapCoursesSchema = z.object({
  courseOrders: z.array(
    z.object({
      courseId: z.string().regex(/^\d+$/, 'Course ID must be a valid number'),
      orderIndex: z.number().int().positive(),
    }),
  ),
});

export const roadmapCourseParamsSchema = z.object({
  roadmapId: z.string().regex(/^\d+$/, 'Roadmap ID must be a valid number'),
  courseId: z.string().regex(/^\d+$/, 'Course ID must be a valid number'),
});

export const roadmapIdOnlyParamsSchema = z.object({
  roadmapId: z.string().regex(/^\d+$/, 'Roadmap ID must be a valid number'),
});

export const assignRoadmapToUsersSchema = z.object({
  userIds: z
    .array(z.string().regex(/^\d+$/, 'User ID must be a valid number'))
    .min(1, 'At least one user ID is required'),
});

export const listRoadmapAssignmentsQuerySchema = z.object({
  userId: z.string().regex(/^\d+$/, 'User ID must be a valid number').optional(),
  roadmapId: z.string().regex(/^\d+$/, 'Roadmap ID must be a valid number').optional(),
  status: z.enum(['assigned', 'in_progress', 'completed', 'dropped']).optional(),
  departmentId: z.string().regex(/^\d+$/, 'Department ID must be a valid number').optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a valid number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a valid number').optional(),
});

export type CreateRoadmapBody = z.infer<typeof createRoadmapSchema>;
export type UpdateRoadmapBody = z.infer<typeof updateRoadmapSchema>;
export type RoadmapIdParams = z.infer<typeof roadmapIdParamsSchema>;
export type ListRoadmapsQuery = z.infer<typeof listRoadmapsQuerySchema>;
export type AddCourseToRoadmapBody = z.infer<typeof addCourseToRoadmapSchema>;
export type UpdateRoadmapCourseBody = z.infer<typeof updateRoadmapCourseSchema>;
export type ReorderRoadmapCoursesBody = z.infer<typeof reorderRoadmapCoursesSchema>;
export type RoadmapCourseParams = z.infer<typeof roadmapCourseParamsSchema>;
export type RoadmapIdOnlyParams = z.infer<typeof roadmapIdOnlyParamsSchema>;
export type AssignRoadmapToUsersBody = z.infer<typeof assignRoadmapToUsersSchema>;
export type ListRoadmapAssignmentsQuery = z.infer<typeof listRoadmapAssignmentsQuerySchema>;
