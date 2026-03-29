import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  isActive: z.boolean().optional(),
  managerUserId: z.string().regex(/^\d+$/, 'Invalid manager user ID format').nullable().optional(),
});

export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .optional(),
  isActive: z.boolean().optional(),
  managerUserId: z.string().regex(/^\d+$/, 'Invalid manager user ID format').nullable().optional(),
});

export const departmentIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid department ID format'),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
