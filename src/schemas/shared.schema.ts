import { z } from 'zod';

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
const ROLE_CODE_REGEX = /^[a-z][a-z0-9_]*$/;
const PERMISSION_SEGMENT_REGEX = /^[a-z][a-z0-9_]*$/;
const PERMISSION_CODE_REGEX = /^[a-z][a-z0-9_.]*$/;

export const normalizeOptionalText = (value: string | null | undefined) => {
  if (value === null || value === undefined) {
    return value ?? null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

export const numericIdStringSchema = (label: string) =>
  z.string().trim().regex(/^\d+$/, `${label} is invalid.`);

export const numericIdToBigIntSchema = (label: string) =>
  numericIdStringSchema(label).transform((value) => BigInt(value));

export const emailSchema = z
  .string()
  .trim()
  .email('Email is invalid.')
  .transform((value) => value.toLowerCase());

export const requiredStringSchema = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .min(min, `${label} must be at least ${min} characters long.`)
    .max(max, `${label} must be at most ${max} characters long.`);

export const optionalStringSchema = (label: string, max: number) =>
  z.string().trim().max(max, `${label} must be at most ${max} characters long.`).optional();

export const optionalNullableDescriptionSchema = z
  .union([z.string().trim().max(500, 'Description must be at most 500 characters long.'), z.null()])
  .transform((value) => normalizeOptionalText(value));

export const searchQuerySchema = z
  .string()
  .trim()
  .max(100, 'Search must be at most 100 characters long.')
  .transform((value) => (value.length > 0 ? value : undefined))
  .optional();

export const passwordSchema = z
  .string()
  .min(1, 'Password is required.')
  .min(8, 'Password must be at least 8 characters long.')
  .regex(
    PASSWORD_COMPLEXITY_REGEX,
    'Password must contain at least one lowercase letter, one uppercase letter, and one number.',
  );

export const roleCodeSchema = z
  .string()
  .trim()
  .min(2, 'Role code must be at least 2 characters long.')
  .max(50, 'Role code must be at most 50 characters long.')
  .regex(
    ROLE_CODE_REGEX,
    'Role code must start with a lowercase letter and contain only lowercase letters, numbers, and underscores.',
  )
  .transform((value) => value.toLowerCase());

export const permissionSegmentSchema = z
  .string()
  .trim()
  .min(1, 'Value is required.')
  .max(50, 'Value must be at most 50 characters long.')
  .regex(
    PERMISSION_SEGMENT_REGEX,
    'Value must start with a lowercase letter and contain only lowercase letters, numbers, and underscores.',
  )
  .transform((value) => value.toLowerCase());

export const permissionCodeSchema = z
  .string()
  .trim()
  .min(3, 'Permission code must be at least 3 characters long.')
  .max(100, 'Permission code must be at most 100 characters long.')
  .regex(
    PERMISSION_CODE_REGEX,
    'Permission code must start with a lowercase letter and contain only lowercase letters, numbers, underscores, and dots.',
  )
  .transform((value) => value.toLowerCase());

export const uniqueStringArraySchema = (
  itemSchema: z.ZodType<string>,
  fieldLabel: string,
  min: number,
  max: number,
) =>
  z
    .array(itemSchema)
    .min(min, `At least ${min} ${fieldLabel} item${min > 1 ? 's are' : ' is'} required.`)
    .max(max, `${fieldLabel} must contain at most ${max} items.`)
    .superRefine((items, ctx) => {
      const seen = new Set<string>();

      items.forEach((item, index) => {
        if (seen.has(item)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index],
            message: `Duplicate ${fieldLabel} is not allowed.`,
          });
          return;
        }

        seen.add(item);
      });
    });

export const optionalBooleanQuerySchema = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .optional();

export const paginationPageQuerySchema = z.coerce
  .number()
  .int()
  .min(1, 'Page must be at least 1.')
  .default(1);

export const paginationLimitQuerySchema = z.coerce
  .number()
  .int()
  .min(1, 'Limit must be at least 1.')
  .max(100, 'Limit must be at most 100.')
  .default(10);
