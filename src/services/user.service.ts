import argon2 from 'argon2';
import { prisma } from '@/config/database';
import { AppError } from '@/utils';
import type { CreateUserInput, UpdateUserInput, ListUsersQuery } from '@/schemas/user.schema';

const USER_SELECT = {
  id: true,
  fullName: true,
  email: true,
  positionTitle: true,
  avatarUrl: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  department: { select: { id: true, name: true } },
  userRoles: {
    select: { role: { select: { id: true, code: true, name: true } } },
  },
} as const;

function serializeUser(user: any) {
  return {
    id: user.id.toString(),
    fullName: user.fullName,
    email: user.email,
    positionTitle: user.positionTitle,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    department: user.department
      ? { id: user.department.id.toString(), name: user.department.name }
      : null,
    roles: user.userRoles.map((ur: any) => ({
      id: ur.role.id.toString(),
      code: ur.role.code,
      name: ur.role.name,
    })),
  };
}

export class UserService {
  // ─── List users ────────────────────────────────────────────────────────────

  static async listUsers(query: ListUsersQuery) {
    const db = prisma as any;
    const { page = 1, limit = 20, search, departmentId, roleCode, isActive } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { positionTitle: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (departmentId) where.departmentId = BigInt(departmentId);
    if (isActive !== undefined) where.isActive = isActive;
    if (roleCode) where.userRoles = { some: { role: { code: roleCode } } };

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: USER_SELECT,
      }),
      db.user.count({ where }),
    ]);

    return {
      data: users.map(serializeUser),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Get single user ───────────────────────────────────────────────────────

  static async getUser(userId: string) {
    const db = prisma as any;

    const user = await db.user.findUnique({
      where: { id: BigInt(userId) },
      select: USER_SELECT,
    });

    if (!user) throw new AppError('User not found', 404);

    return serializeUser(user);
  }

  // ─── Create user ───────────────────────────────────────────────────────────

  static async createUser(data: CreateUserInput) {
    const db = prisma as any;

    const existing = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) throw new AppError('A user with this email already exists', 409);

    const department = await db.department.findUnique({
      where: { id: BigInt(data.departmentId) },
    });
    if (!department) throw new AppError('Department not found', 404);

    const role = await db.role.findUnique({
      where: { code: data.roleCode ?? 'employee' },
      select: { id: true, code: true, name: true },
    });
    if (!role) throw new AppError(`Role '${data.roleCode}' not found`, 404);

    const passwordHash = await argon2.hash(data.password);

    const user = await db.user.create({
      data: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        passwordHash,
        departmentId: BigInt(data.departmentId),
        positionTitle: data.positionTitle ?? null,
        avatarUrl: data.avatarUrl ?? null,
        isActive: true,
        userRoles: { create: { roleId: role.id } },
      },
      select: USER_SELECT,
    });

    return serializeUser(user);
  }

  // ─── Update user ───────────────────────────────────────────────────────────

  static async updateUser(userId: string, data: UpdateUserInput) {
    const db = prisma as any;

    const user = await db.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user) throw new AppError('User not found', 404);

    if (data.departmentId) {
      const dept = await db.department.findUnique({ where: { id: BigInt(data.departmentId) } });
      if (!dept) throw new AppError('Department not found', 404);
    }

    const updateData: Record<string, any> = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.departmentId !== undefined) updateData.departmentId = BigInt(data.departmentId);
    if (data.positionTitle !== undefined) updateData.positionTitle = data.positionTitle;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await db.user.update({
      where: { id: BigInt(userId) },
      data: updateData,
      select: USER_SELECT,
    });

    return serializeUser(updated);
  }
}
