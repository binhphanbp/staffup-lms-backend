import type { Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import { AppError } from '@/utils';
import type {
  CreatePermissionInput,
  PermissionListQuery,
  UpdatePermissionInput,
} from '@/schemas/permission.schema';

interface PermissionRecord {
  id: bigint;
  code: string;
  module: string;
  action: string;
  description: string | null;
  createdAt: Date;
  _count: {
    rolePermissions: number;
  };
}

const permissionSelect = {
  id: true,
  code: true,
  module: true,
  action: true,
  description: true,
  createdAt: true,
  _count: {
    select: {
      rolePermissions: true,
    },
  },
} satisfies Prisma.PermissionSelect;

export class PermissionService {
  static async getPermissions(query: Partial<PermissionListQuery> = {}) {
    const permissions = await prisma.permission.findMany({
      where: this.buildPermissionWhere(query),
      select: permissionSelect,
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });

    return permissions.map((permission) => this.serializePermission(permission));
  }

  static async getPermissionById(id: string) {
    const permission = await prisma.permission.findUnique({
      where: { id: BigInt(id) },
      select: permissionSelect,
    });

    if (!permission) {
      throw new AppError('Permission not found', 404);
    }

    return this.serializePermission(permission);
  }

  static async createPermission(data: CreatePermissionInput) {
    await this.ensurePermissionUniqueness(data.code, data.module, data.action);

    const permission = await prisma.permission.create({
      data: {
        code: data.code,
        module: data.module,
        action: data.action,
        description: data.description ?? null,
      },
      select: permissionSelect,
    });

    return this.serializePermission(permission);
  }

  static async updatePermission(id: string, data: UpdatePermissionInput) {
    const permissionId = BigInt(id);

    const existingPermission = await prisma.permission.findUnique({
      where: { id: permissionId },
      select: {
        id: true,
        code: true,
        module: true,
        action: true,
      },
    });

    if (!existingPermission) {
      throw new AppError('Permission not found', 404);
    }

    const nextCode = data.code ?? existingPermission.code;
    const nextModule = data.module ?? existingPermission.module;
    const nextAction = data.action ?? existingPermission.action;

    if (
      nextCode !== existingPermission.code ||
      nextModule !== existingPermission.module ||
      nextAction !== existingPermission.action
    ) {
      await this.ensurePermissionUniqueness(nextCode, nextModule, nextAction, permissionId);
    }

    const updatedPermission = await prisma.permission.update({
      where: { id: permissionId },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.module !== undefined && { module: data.module }),
        ...(data.action !== undefined && { action: data.action }),
        ...(data.description !== undefined && { description: data.description }),
      },
      select: permissionSelect,
    });

    return this.serializePermission(updatedPermission);
  }

  static async deletePermission(id: string) {
    const permissionId = BigInt(id);

    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
      select: {
        id: true,
        _count: {
          select: {
            rolePermissions: true,
          },
        },
      },
    });

    if (!permission) {
      throw new AppError('Permission not found', 404);
    }

    if (permission._count.rolePermissions > 0) {
      throw new AppError('Cannot delete a permission that is currently assigned to roles', 400);
    }

    await prisma.permission.delete({
      where: { id: permissionId },
    });
  }

  private static buildPermissionWhere(
    query: Partial<PermissionListQuery>,
  ): Prisma.PermissionWhereInput {
    const where: Prisma.PermissionWhereInput = {};

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { module: { contains: query.search, mode: 'insensitive' } },
        { action: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.module) {
      where.module = { equals: query.module, mode: 'insensitive' };
    }

    if (query.action) {
      where.action = { equals: query.action, mode: 'insensitive' };
    }

    return where;
  }

  private static async ensurePermissionUniqueness(
    code: string,
    module: string,
    action: string,
    excludeId?: bigint,
  ) {
    const duplicateCode = await prisma.permission.findFirst({
      where: {
        code,
        ...(excludeId !== undefined && { NOT: { id: excludeId } }),
      },
      select: { id: true },
    });

    if (duplicateCode) {
      throw new AppError('Permission code already exists', 409);
    }

    const duplicateModuleAction = await prisma.permission.findFirst({
      where: {
        module,
        action,
        ...(excludeId !== undefined && { NOT: { id: excludeId } }),
      },
      select: { id: true },
    });

    if (duplicateModuleAction) {
      throw new AppError('Permission module/action combination already exists', 409);
    }
  }

  private static serializePermission(permission: PermissionRecord) {
    return {
      id: permission.id.toString(),
      code: permission.code,
      module: permission.module,
      action: permission.action,
      description: permission.description,
      roleCount: permission._count.rolePermissions,
      createdAt: permission.createdAt,
    };
  }
}
