"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignUserRolesSchema = exports.userIdParamSchema = exports.updateUserStatusSchema = exports.changePasswordSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const shared_schema_1 = require("../schemas/shared.schema");
exports.registerSchema = zod_1.z.object({
    departmentId: (0, shared_schema_1.numericIdToBigIntSchema)('Department ID'),
    fullName: (0, shared_schema_1.requiredStringSchema)('Full name', 2, 150),
    positionTitle: (0, shared_schema_1.optionalStringSchema)('Position title', 150),
    email: shared_schema_1.emailSchema,
    password: shared_schema_1.passwordSchema,
});
exports.loginSchema = zod_1.z.object({
    email: shared_schema_1.emailSchema,
    password: zod_1.z.string().min(1, 'Password is required.'),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().trim().min(1, 'Refresh token cannot be empty.').optional(),
});
exports.changePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required.'),
    newPassword: shared_schema_1.passwordSchema,
})
    .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password.',
    path: ['newPassword'],
});
exports.updateUserStatusSchema = zod_1.z.object({
    isActive: zod_1.z.boolean(),
});
exports.userIdParamSchema = zod_1.z.object({
    id: (0, shared_schema_1.numericIdStringSchema)('User ID'),
});
exports.assignUserRolesSchema = zod_1.z.object({
    roleCodes: (0, shared_schema_1.uniqueStringArraySchema)(shared_schema_1.roleCodeSchema, 'roleCodes', 1, 50),
});
