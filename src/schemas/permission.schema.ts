import { z } from 'zod';
import {
  numericIdStringSchema,
  optionalNullableDescriptionSchema,
  permissionCodeSchema,
  permissionSegmentSchema,
  searchQuerySchema,
} from '@/schemas/shared.schema';

export const createPermissionSchema = z
  .object({
    code: permissionCodeSchema,
    module: permissionSegmentSchema,
    action: permissionSegmentSchema,
    description: optionalNullableDescriptionSchema.optional(),
  })
  .refine((data) => data.code === `${data.module}.${data.action}`, {
    message: 'Permission code must match the format `module.action`.',
    path: ['code'],
  });

export const updatePermissionSchema = z
  .object({
    code: permissionCodeSchema.optional(),
    module: permissionSegmentSchema.optional(),
    action: permissionSegmentSchema.optional(),
    description: optionalNullableDescriptionSchema.optional(),
  })
  .refine(
    (data) =>
      data.code !== undefined ||
      data.module !== undefined ||
      data.action !== undefined ||
      data.description !== undefined,
    {
      message: 'At least one field must be provided.',
      path: [],
    },
  )
  .superRefine((data, ctx) => {
    const hasAnyIdentityField =
      data.code !== undefined || data.module !== undefined || data.action !== undefined;

    if (!hasAnyIdentityField) {
      return;
    }

    if (data.code === undefined || data.module === undefined || data.action === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'When updating code, module, or action, you must provide all three fields.',
        path: [],
      });
      return;
    }

    if (data.code !== `${data.module}.${data.action}`) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Permission code must match the format `module.action`.',
        path: ['code'],
      });
    }
  });

export const permissionIdParamSchema = z.object({
  id: numericIdStringSchema('Permission ID'),
});

export const permissionListQuerySchema = z.object({
  search: searchQuerySchema,
  module: permissionSegmentSchema.optional(),
  action: permissionSegmentSchema.optional(),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
export type PermissionListQuery = z.infer<typeof permissionListQuerySchema>;
