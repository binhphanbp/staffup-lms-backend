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

export const getDepartmentUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(z.number().int().min(1, 'Page must be at least 1')),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 10))
    .pipe(z.number().int().min(1).max(100, 'Limit must be at most 100')),
  isActive: z
    .string()
    .optional()
    .transform((v) => {
      if (v === 'true') return true;
      if (v === 'false') return false;
      return undefined;
    }),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
export type GetDepartmentUsersQuery = z.infer<typeof getDepartmentUsersQuerySchema>;
