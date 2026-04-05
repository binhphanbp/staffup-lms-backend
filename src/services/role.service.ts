import type { Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import { AppError } from '@/utils';
import type { CreateRoleInput, RoleListQuery, UpdateRoleInput } from '@/schemas/role.schema';

interface PermissionRecord {
  id: bigint;
  code: string;
  module: string;
  action: string;
  description: string | null;
}

interface RolePermissionRecord {
  permission: PermissionRecord;
}

interface RoleRecord {
  id: bigint;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  rolePermissions: RolePermissionRecord[];
  _count: {
    userRoles: number;
    rolePermissions: number;
  };
}

const roleSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  isSystem: true,
  createdAt: true,
  updatedAt: true,
  rolePermissions: {
    select: {
      permission: {
        select: {
          id: true,
          code: true,
          module: true,
          action: true,
          description: true,
        },
      },
    },
  },
  _count: {
    select: {
      userRoles: true,
      rolePermissions: true,
    },
  },
} satisfies Prisma.RoleSelect;

export class RoleService {
  static async getRoles(query: Partial<RoleListQuery> = {}) {
    const roles = await prisma.role.findMany({
      where: this.buildRoleWhere(query),
      select: roleSelect,
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });

    return roles.map((role) => this.serializeRole(role));
  }

  static async getRoleById(id: string) {
    const role = await prisma.role.findUnique({
      where: { id: BigInt(id) },
      select: roleSelect,
    });

    if (!role) {
      throw new AppError('Role not found', 404);
    }

    return this.serializeRole(role);
  }

  static async createRole(data: CreateRoleInput) {
    const existingRole = await prisma.role.findUnique({
      where: { code: data.code },
      select: { id: true },
    });

    if (existingRole) {
      throw new AppError('Role code already exists', 409);
    }

    const permissions = await this.resolvePermissions(data.permissionCodes);

    const role = await prisma.role.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description ?? null,
        isSystem: false,
        ...(permissions.length > 0 && {
          rolePermissions: {
            create: permissions.map((permission) => ({
              permissionId: permission.id,
            })),
          },
        }),
      },
      select: roleSelect,
    });

    return this.serializeRole(role);
  }

  static async updateRole(id: string, data: UpdateRoleInput) {
    const roleId = BigInt(id);

    const existingRole = await prisma.role.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        code: true,
        isSystem: true,
      },
    });

    if (!existingRole) {
      throw new AppError('Role not found', 404);
    }

    if (existingRole.isSystem && data.code && data.code !== existingRole.code) {
      throw new AppError('Cannot change the code of a system role', 400);
    }

    if (data.code && data.code !== existingRole.code) {
      const duplicateRole = await prisma.role.findUnique({
        where: { code: data.code },
        select: { id: true },
      });

      if (duplicateRole) {
        throw new AppError('Role code already exists', 409);
      }
    }

    const permissions =
      data.permissionCodes !== undefined
        ? await this.resolvePermissions(data.permissionCodes)
        : undefined;

    const updatedRole = await prisma.$transaction(async (tx) => {
      if (data.code !== undefined || data.name !== undefined || data.description !== undefined) {
        await tx.role.update({
          where: { id: roleId },
          data: {
            ...(data.code !== undefined && { code: data.code }),
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
          },
        });
      }

      if (permissions !== undefined) {
        await tx.rolePermission.deleteMany({
          where: { roleId },
        });

        if (permissions.length > 0) {
          await tx.rolePermission.createMany({
            data: permissions.map((permission) => ({
              roleId,
              permissionId: permission.id,
            })),
            skipDuplicates: true,
          });
        }
      }

      return tx.role.findUnique({
        where: { id: roleId },
        select: roleSelect,
      });
    });

    if (!updatedRole) {
      throw new AppError('Role not found', 404);
    }

    return this.serializeRole(updatedRole);
  }

  static async deleteRole(id: string) {
    const roleId = BigInt(id);

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        isSystem: true,
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
    });

    if (!role) {
      throw new AppError('Role not found', 404);
    }

    if (role.isSystem) {
      throw new AppError('Cannot delete a system role', 400);
    }

    if (role._count.userRoles > 0) {
      throw new AppError('Cannot delete a role that is currently assigned to users', 400);
    }

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({
        where: { roleId },
      }),
      prisma.role.delete({
        where: { id: roleId },
      }),
    ]);
  }

  private static buildRoleWhere(query: Partial<RoleListQuery>): Prisma.RoleWhereInput {
    const where: Prisma.RoleWhereInput = {};

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.isSystem !== undefined) {
      where.isSystem = query.isSystem;
    }

    return where;
  }

  private static async resolvePermissions(permissionCodes: string[]) {
    const uniquePermissionCodes = [...new Set(permissionCodes)];

    if (uniquePermissionCodes.length === 0) {
      return [];
    }

    const permissions = await prisma.permission.findMany({
      where: {
        code: {
          in: uniquePermissionCodes,
        },
      },
      select: {
        id: true,
        code: true,
      },
    });

    if (permissions.length !== uniquePermissionCodes.length) {
      const foundCodes = new Set(permissions.map((permission) => permission.code));
      const missingCodes = uniquePermissionCodes.filter((code) => !foundCodes.has(code));

      throw new AppError(`Invalid permission code(s): ${missingCodes.join(', ')}`, 400);
    }

    return permissions;
  }

  private static serializeRole(role: RoleRecord) {
    const permissions = role.rolePermissions
      .map((rolePermission) => rolePermission.permission)
      .sort((left, right) => left.code.localeCompare(right.code));

    return {
      id: role.id.toString(),
      code: role.code,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      permissionCount: role._count.rolePermissions,
      userCount: role._count.userRoles,
      permissions: permissions.map((permission) => ({
        ...permission,
        id: permission.id.toString(),
      })),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}
