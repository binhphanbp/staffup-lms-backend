import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number',
  );

export const createUserSchema = z.object({
  fullName: z.string().min(2).max(150),
  email: z.string().email('Invalid email format'),
  password: passwordSchema,
  departmentId: z.string().regex(/^\d+$/, 'Department ID must be a valid number'),
  positionTitle: z.string().max(150).optional().nullable(),
  avatarUrl: z.string().url().max(500).optional().nullable(),
  roleCode: z.string().min(2).max(50).optional().default('employee'),
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2).max(150).optional(),
  departmentId: z.string().regex(/^\d+$/).optional(),
  positionTitle: z.string().max(150).optional().nullable(),
  avatarUrl: z.string().url().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  departmentId: z.string().regex(/^\d+$/).optional(),
  roleCode: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'User ID must be a valid number'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersSchema>;
