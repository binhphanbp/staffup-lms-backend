import { z } from 'zod';
import {
  emailSchema,
  numericIdStringSchema,
  numericIdToBigIntSchema,
  optionalStringSchema,
  passwordSchema,
  requiredStringSchema,
  roleCodeSchema,
  uniqueStringArraySchema,
} from '@/schemas/shared.schema';

export const registerSchema = z.object({
  departmentId: numericIdToBigIntSchema('Department ID'),
  fullName: requiredStringSchema('Full name', 2, 150),
  positionTitle: optionalStringSchema('Position title', 150),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required.'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(1, 'Refresh token cannot be empty.').optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: passwordSchema,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password.',
    path: ['newPassword'],
  });

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const userIdParamSchema = z.object({
  id: numericIdStringSchema('User ID'),
});

export const assignUserRolesSchema = z.object({
  roleCodes: uniqueStringArraySchema(roleCodeSchema, 'roleCodes', 1, 50),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type AssignUserRolesInput = z.infer<typeof assignUserRolesSchema>;
