import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number',
  );

const roleCodeSchema = z
  .string()
  .trim()
  .min(2, 'Role code must be at least 2 characters')
  .max(50, 'Role code must be at most 50 characters')
  .regex(
    /^[a-z][a-z0-9_]*$/,
    'Role code must start with a lowercase letter and contain only lowercase letters, numbers, and underscores',
  )
  .transform((value) => value.toLowerCase());

export const registerSchema = z.object({
  departmentId: z.coerce.bigint(),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(150, 'Full name must be at most 150 characters'),
  positionTitle: z.string().max(150, 'Position title must be at most 150 characters').optional(),
  email: z.string().email('Invalid email format'),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token cannot be empty').optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const userIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid user ID format'),
});

export const assignUserRolesSchema = z.object({
  roleCodes: z
    .array(roleCodeSchema)
    .min(1, 'At least one role code is required')
    .max(50, 'Role codes must be at most 50 items'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type AssignUserRolesInput = z.infer<typeof assignUserRolesSchema>;
