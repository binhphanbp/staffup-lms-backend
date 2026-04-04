import { z } from 'zod';

export const registerSchema = z.object({
  departmentId: z.coerce.bigint(),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(150, 'Full name must be at most 150 characters'),
  positionTitle: z.string().max(150, 'Position title must be at most 150 characters').optional(),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number',
    ),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token cannot be empty').optional(),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
