import { z } from 'zod';

const permissionSegmentSchema = z
  .string()
  .trim()
  .min(1, 'Value is required')
  .max(50, 'Value must be at most 50 characters')
  .regex(
    /^[a-z][a-z0-9_]*$/,
    'Value must start with a lowercase letter and contain only lowercase letters, numbers, and underscores',
  )
  .transform((value) => value.toLowerCase());

const permissionCodeSchema = z
  .string()
  .trim()
  .min(3, 'Permission code must be at least 3 characters')
  .max(100, 'Permission code must be at most 100 characters')
  .regex(
    /^[a-z][a-z0-9_.]*$/,
    'Permission code must start with a lowercase letter and contain only lowercase letters, numbers, underscores, and dots',
  )
  .transform((value) => value.toLowerCase());

const descriptionSchema = z
  .union([z.string().trim().max(500, 'Description must be at most 500 characters'), z.null()])
  .transform((value) => {
    if (value === null) {
      return null;
    }

    return value.length > 0 ? value : null;
  });

export const createPermissionSchema = z
  .object({
    code: permissionCodeSchema,
    module: permissionSegmentSchema,
    action: permissionSegmentSchema,
    description: descriptionSchema.optional(),
  })
  .refine((data) => data.code === `${data.module}.${data.action}`, {
    message: 'Permission code must match the format `module.action`',
    path: ['code'],
  });

export const updatePermissionSchema = z
  .object({
    code: permissionCodeSchema.optional(),
    module: permissionSegmentSchema.optional(),
    action: permissionSegmentSchema.optional(),
    description: descriptionSchema.optional(),
  })
  .refine(
    (data) =>
      data.code !== undefined ||
      data.module !== undefined ||
      data.action !== undefined ||
      data.description !== undefined,
    {
      message: 'At least one field must be provided',
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
        message: 'When updating code, module, or action, you must provide all three fields',
        path: [],
      });
      return;
    }

    if (data.code !== `${data.module}.${data.action}`) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Permission code must match the format `module.action`',
        path: ['code'],
      });
    }
  });

export const permissionIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid permission ID format'),
});

export const permissionListQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  module: permissionSegmentSchema.optional(),
  action: permissionSegmentSchema.optional(),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>;
export type PermissionListQuery = z.infer<typeof permissionListQuerySchema>;
