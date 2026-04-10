"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationLimitQuerySchema = exports.paginationPageQuerySchema = exports.optionalBooleanQuerySchema = exports.uniqueStringArraySchema = exports.permissionCodeSchema = exports.permissionSegmentSchema = exports.roleCodeSchema = exports.passwordSchema = exports.searchQuerySchema = exports.optionalNullableDescriptionSchema = exports.optionalStringSchema = exports.requiredStringSchema = exports.emailSchema = exports.numericIdToBigIntSchema = exports.numericIdStringSchema = exports.normalizeOptionalText = void 0;
const zod_1 = require("zod");
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
const ROLE_CODE_REGEX = /^[a-z][a-z0-9_]*$/;
const PERMISSION_SEGMENT_REGEX = /^[a-z][a-z0-9_]*$/;
const PERMISSION_CODE_REGEX = /^[a-z][a-z0-9_.]*$/;
const normalizeOptionalText = (value) => {
    if (value === null || value === undefined) {
        return value ?? null;
    }
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
};
exports.normalizeOptionalText = normalizeOptionalText;
const numericIdStringSchema = (label) => zod_1.z.string().trim().regex(/^\d+$/, `${label} is invalid.`);
exports.numericIdStringSchema = numericIdStringSchema;
const numericIdToBigIntSchema = (label) => (0, exports.numericIdStringSchema)(label).transform((value) => BigInt(value));
exports.numericIdToBigIntSchema = numericIdToBigIntSchema;
exports.emailSchema = zod_1.z
    .string()
    .trim()
    .email('Email is invalid.')
    .transform((value) => value.toLowerCase());
const requiredStringSchema = (label, min, max) => zod_1.z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .min(min, `${label} must be at least ${min} characters long.`)
    .max(max, `${label} must be at most ${max} characters long.`);
exports.requiredStringSchema = requiredStringSchema;
const optionalStringSchema = (label, max) => zod_1.z.string().trim().max(max, `${label} must be at most ${max} characters long.`).optional();
exports.optionalStringSchema = optionalStringSchema;
exports.optionalNullableDescriptionSchema = zod_1.z
    .union([zod_1.z.string().trim().max(500, 'Description must be at most 500 characters long.'), zod_1.z.null()])
    .transform((value) => (0, exports.normalizeOptionalText)(value));
exports.searchQuerySchema = zod_1.z
    .string()
    .trim()
    .max(100, 'Search must be at most 100 characters long.')
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional();
exports.passwordSchema = zod_1.z
    .string()
    .min(1, 'Password is required.')
    .min(8, 'Password must be at least 8 characters long.')
    .regex(PASSWORD_COMPLEXITY_REGEX, 'Password must contain at least one lowercase letter, one uppercase letter, and one number.');
exports.roleCodeSchema = zod_1.z
    .string()
    .trim()
    .min(2, 'Role code must be at least 2 characters long.')
    .max(50, 'Role code must be at most 50 characters long.')
    .regex(ROLE_CODE_REGEX, 'Role code must start with a lowercase letter and contain only lowercase letters, numbers, and underscores.')
    .transform((value) => value.toLowerCase());
exports.permissionSegmentSchema = zod_1.z
    .string()
    .trim()
    .min(1, 'Value is required.')
    .max(50, 'Value must be at most 50 characters long.')
    .regex(PERMISSION_SEGMENT_REGEX, 'Value must start with a lowercase letter and contain only lowercase letters, numbers, and underscores.')
    .transform((value) => value.toLowerCase());
exports.permissionCodeSchema = zod_1.z
    .string()
    .trim()
    .min(3, 'Permission code must be at least 3 characters long.')
    .max(100, 'Permission code must be at most 100 characters long.')
    .regex(PERMISSION_CODE_REGEX, 'Permission code must start with a lowercase letter and contain only lowercase letters, numbers, underscores, and dots.')
    .transform((value) => value.toLowerCase());
const uniqueStringArraySchema = (itemSchema, fieldLabel, min, max) => zod_1.z
    .array(itemSchema)
    .min(min, `At least ${min} ${fieldLabel} item${min > 1 ? 's are' : ' is'} required.`)
    .max(max, `${fieldLabel} must contain at most ${max} items.`)
    .superRefine((items, ctx) => {
    const seen = new Set();
    items.forEach((item, index) => {
        if (seen.has(item)) {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: [index],
                message: `Duplicate ${fieldLabel} is not allowed.`,
            });
            return;
        }
        seen.add(item);
    });
});
exports.uniqueStringArraySchema = uniqueStringArraySchema;
exports.optionalBooleanQuerySchema = zod_1.z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional();
exports.paginationPageQuerySchema = zod_1.z.coerce
    .number()
    .int()
    .min(1, 'Page must be at least 1.')
    .default(1);
exports.paginationLimitQuerySchema = zod_1.z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1.')
    .max(100, 'Limit must be at most 100.')
    .default(10);
