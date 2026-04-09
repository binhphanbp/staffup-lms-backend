import { z } from 'zod';
import {
  numericIdStringSchema,
  optionalBooleanQuerySchema,
  paginationLimitQuerySchema,
  paginationPageQuerySchema,
  requiredStringSchema,
} from '@/schemas/shared.schema';

export const createDepartmentSchema = z.object({
  name: requiredStringSchema('Name', 2, 100),
  isActive: z.boolean().optional(),
  managerUserId: numericIdStringSchema('Manager user ID').nullable().optional(),
});

export const updateDepartmentSchema = z
  .object({
    name: requiredStringSchema('Name', 2, 100).optional(),
    isActive: z.boolean().optional(),
    managerUserId: numericIdStringSchema('Manager user ID').nullable().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined || data.isActive !== undefined || data.managerUserId !== undefined,
    {
      message: 'At least one field must be provided.',
      path: [],
    },
  );

export const departmentIdParamSchema = z.object({
  id: numericIdStringSchema('Department ID'),
});

export const getDepartmentUsersQuerySchema = z.object({
  page: paginationPageQuerySchema,
  limit: paginationLimitQuerySchema,
  isActive: optionalBooleanQuerySchema,
});

export const assignManagerSchema = z.object({
  managerUserId: numericIdStringSchema('Manager user ID'),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type GetDepartmentUsersQuery = z.infer<typeof getDepartmentUsersQuerySchema>;
export type AssignManagerInput = z.infer<typeof assignManagerSchema>;
