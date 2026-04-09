import { z } from 'zod';
import {
  numericIdStringSchema,
  optionalBooleanQuerySchema,
  optionalNullableDescriptionSchema,
  permissionCodeSchema,
  requiredStringSchema,
  roleCodeSchema,
  searchQuerySchema,
  uniqueStringArraySchema,
} from '@/schemas/shared.schema';

const roleNameSchema = requiredStringSchema('Role name', 2, 100);

export const createRoleSchema = z.object({
  code: roleCodeSchema,
  name: roleNameSchema,
  description: optionalNullableDescriptionSchema.optional(),
  permissionCodes: uniqueStringArraySchema(permissionCodeSchema, 'permissionCodes', 0, 200)
    .optional()
    .default([]),
});

export const updateRoleSchema = z
  .object({
    code: roleCodeSchema.optional(),
    name: roleNameSchema.optional(),
    description: optionalNullableDescriptionSchema.optional(),
    permissionCodes: uniqueStringArraySchema(
      permissionCodeSchema,
      'permissionCodes',
      0,
      200,
    ).optional(),
  })
  .refine(
    (data) =>
      data.code !== undefined ||
      data.name !== undefined ||
      data.description !== undefined ||
      data.permissionCodes !== undefined,
    {
      message: 'At least one field must be provided.',
      path: [],
    },
  );

export const roleIdParamSchema = z.object({
  id: numericIdStringSchema('Role ID'),
});

export const roleListQuerySchema = z.object({
  search: searchQuerySchema,
  isSystem: optionalBooleanQuerySchema,
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type RoleListQuery = z.infer<typeof roleListQuerySchema>;
