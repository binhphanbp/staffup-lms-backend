import { z } from 'zod';

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

const roleNameSchema = z
  .string()
  .trim()
  .min(2, 'Role name must be at least 2 characters')
  .max(100, 'Role name must be at most 100 characters');

const descriptionSchema = z
  .union([z.string().trim().max(500, 'Description must be at most 500 characters'), z.null()])
  .transform((value) => {
    if (value === null) {
      return null;
    }

    return value.length > 0 ? value : null;
  });

const permissionCodeSchema = z
  .string()
  .trim()
  .min(1, 'Permission code is required')
  .max(100, 'Permission code must be at most 100 characters')
  .regex(
    /^[a-z][a-z0-9_.]*$/,
    'Permission code must start with a lowercase letter and contain only lowercase letters, numbers, underscores, and dots',
  )
  .transform((value) => value.toLowerCase());

export const createRoleSchema = z.object({
  code: roleCodeSchema,
  name: roleNameSchema,
  description: descriptionSchema.optional(),
  permissionCodes: z.array(permissionCodeSchema).max(200).optional().default([]),
});

export const updateRoleSchema = z
  .object({
    code: roleCodeSchema.optional(),
    name: roleNameSchema.optional(),
    description: descriptionSchema.optional(),
    permissionCodes: z.array(permissionCodeSchema).max(200).optional(),
  })
  .refine(
    (data) =>
      data.code !== undefined ||
      data.name !== undefined ||
      data.description !== undefined ||
      data.permissionCodes !== undefined,
    {
      message: 'At least one field must be provided',
      path: [],
    },
  );

export const roleIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid role ID format'),
});

export const roleListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  isSystem: z
    .string()
    .optional()
    .transform((value) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return undefined;
    }),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type RoleListQuery = z.infer<typeof roleListQuerySchema>;
