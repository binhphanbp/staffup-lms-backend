import { AppError } from '@/utils';

export interface PolicyActor {
  userId: string;
  roleCodes: string[];
  permissionCodes?: string[];
}

interface OwnershipPolicyInput {
  actor: PolicyActor;
  ownerUserId: string | bigint;
  bypassRoles?: string[];
  bypassPermissions?: string[];
}

interface DepartmentPolicyInput {
  actor: PolicyActor;
  departmentId: string | bigint;
  managedDepartmentIds: Array<string | bigint>;
  bypassRoles?: string[];
  bypassPermissions?: string[];
}

const normalizeId = (value: string | bigint) => value.toString();

export const hasAnyRole = (actor: PolicyActor, roles: string[]) =>
  roles.some((role) => actor.roleCodes.includes(role));

export const hasAnyPermission = (actor: PolicyActor, permissions: string[]) =>
  permissions.some((permission) => actor.permissionCodes?.includes(permission) ?? false);

export const isOwner = (actor: PolicyActor, ownerUserId: string | bigint) =>
  actor.userId === normalizeId(ownerUserId);

export const canAccessOwnedResource = ({
  actor,
  ownerUserId,
  bypassRoles = ['admin'],
  bypassPermissions = [],
}: OwnershipPolicyInput) =>
  isOwner(actor, ownerUserId) ||
  hasAnyRole(actor, bypassRoles) ||
  hasAnyPermission(actor, bypassPermissions);

export const canManageDepartmentResource = ({
  actor,
  departmentId,
  managedDepartmentIds,
  bypassRoles = ['admin'],
  bypassPermissions = [],
}: DepartmentPolicyInput) =>
  hasAnyRole(actor, bypassRoles) ||
  hasAnyPermission(actor, bypassPermissions) ||
  managedDepartmentIds.map(normalizeId).includes(normalizeId(departmentId));

export const assertPolicy = (allowed: boolean, message: string) => {
  if (!allowed) {
    throw new AppError(message, 403);
  }
};
