"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleListQuerySchema = exports.roleIdParamSchema = exports.updateRoleSchema = exports.createRoleSchema = void 0;
const zod_1 = require("zod");
const shared_schema_1 = require("../schemas/shared.schema");
const roleNameSchema = (0, shared_schema_1.requiredStringSchema)('Role name', 2, 100);
exports.createRoleSchema = zod_1.z.object({
    code: shared_schema_1.roleCodeSchema,
    name: roleNameSchema,
    description: shared_schema_1.optionalNullableDescriptionSchema.optional(),
    permissionCodes: (0, shared_schema_1.uniqueStringArraySchema)(shared_schema_1.permissionCodeSchema, 'permissionCodes', 0, 200)
        .optional()
        .default([]),
});
exports.updateRoleSchema = zod_1.z
    .object({
    code: shared_schema_1.roleCodeSchema.optional(),
    name: roleNameSchema.optional(),
    description: shared_schema_1.optionalNullableDescriptionSchema.optional(),
    permissionCodes: (0, shared_schema_1.uniqueStringArraySchema)(shared_schema_1.permissionCodeSchema, 'permissionCodes', 0, 200).optional(),
})
    .refine((data) => data.code !== undefined ||
    data.name !== undefined ||
    data.description !== undefined ||
    data.permissionCodes !== undefined, {
    message: 'At least one field must be provided.',
    path: [],
});
exports.roleIdParamSchema = zod_1.z.object({
    id: (0, shared_schema_1.numericIdStringSchema)('Role ID'),
});
exports.roleListQuerySchema = zod_1.z.object({
    search: shared_schema_1.searchQuerySchema,
    isSystem: shared_schema_1.optionalBooleanQuerySchema,
});
