import argon2 from 'argon2';
import { Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';
import { prisma, type TransactionClient } from '@/config/database';
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

type SerializedUserRecord = Prisma.UserGetPayload<{
  select: typeof USER_SELECT;
}>;

function serializeUser(user: SerializedUserRecord) {
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
    roles: user.userRoles.map((ur) => ({
      id: ur.role.id.toString(),
      code: ur.role.code,
      name: ur.role.name,
    })),
  };
}

const DEFAULT_IMPORT_PASSWORD = 'staffup.site';

interface RawImportedUserRow {
  rowNumber: number;
  fullName: string;
  email: string;
  password: string;
  departmentName: string;
  positionTitle: string | null;
  avatarUrl: string | null;
  roleCode: string;
  isActiveRaw: unknown;
}

const normalizeHeader = (header: unknown) =>
  String(header ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

const normalizeCell = (value: unknown) => String(value ?? '').trim();

const normalizeDepartmentKey = (value: string) => value.trim().toLowerCase();

const parseBooleanCell = (value: unknown, defaultValue: boolean) => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();

  if (['true', '1', 'yes', 'y', 'active'].includes(normalized)) {
    return true;
  }

  if (['false', '0', 'no', 'n', 'inactive'].includes(normalized)) {
    return false;
  }

  throw new AppError(`Invalid boolean value "${value}"`, 400);
};

const parseExcelRows = (buffer: Buffer): RawImportedUserRow[] => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new AppError('Excel file does not contain any worksheet', 400);
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
    raw: false,
  });

  if (rows.length === 0) {
    throw new AppError('Excel file does not contain any data rows', 400);
  }

  return rows.map((row, index) => {
    const normalizedRow = Object.fromEntries(
      Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]),
    );

    const fullName =
      normalizeCell(normalizedRow.fullname) ||
      normalizeCell(normalizedRow.name) ||
      normalizeCell(normalizedRow.hoten);
    const email = normalizeCell(normalizedRow.email).toLowerCase();
    const password = normalizeCell(normalizedRow.password) || DEFAULT_IMPORT_PASSWORD;
    const departmentName =
      normalizeCell(normalizedRow.department) ||
      normalizeCell(normalizedRow.departmentname) ||
      normalizeCell(normalizedRow.phongban);
    const positionTitle =
      normalizeCell(normalizedRow.positiontitle) ||
      normalizeCell(normalizedRow.position) ||
      normalizeCell(normalizedRow.chucvu) ||
      '';
    const avatarUrl = normalizeCell(normalizedRow.avatarurl) || '';
    const roleCode =
      normalizeCell(normalizedRow.rolecode) || normalizeCell(normalizedRow.role) || 'employee';

    return {
      rowNumber: index + 2,
      fullName,
      email,
      password,
      departmentName,
      positionTitle: positionTitle || null,
      avatarUrl: avatarUrl || null,
      roleCode: roleCode.toLowerCase(),
      isActiveRaw: normalizedRow.isactive ?? normalizedRow.active ?? normalizedRow.trangthai,
    };
  });
};

export class UserService {
  // ─── List users ────────────────────────────────────────────────────────────

  static async listUsers(query: ListUsersQuery) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const { search, departmentId, roleCode, isActive } = query;
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;
    const skip = (safePage - 1) * safeLimit;

    const where: Prisma.UserWhereInput = {};

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
      prisma.user.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { createdAt: 'desc' },
        select: USER_SELECT,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users.map(serializeUser),
      meta: { total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) },
    };
  }

  // ─── Get single user ───────────────────────────────────────────────────────

  static async getUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: USER_SELECT,
    });

    if (!user) throw new AppError('User not found', 404);

    return serializeUser(user);
  }

  // ─── Create user ───────────────────────────────────────────────────────────

  static async createUser(data: CreateUserInput) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) throw new AppError('A user with this email already exists', 409);

    const department = await prisma.department.findUnique({
      where: { id: BigInt(data.departmentId) },
    });
    if (!department) throw new AppError('Department not found', 404);

    const role = await prisma.role.findUnique({
      where: { code: data.roleCode ?? 'employee' },
      select: { id: true, code: true, name: true },
    });
    if (!role) throw new AppError(`Role '${data.roleCode}' not found`, 404);

    const passwordHash = await argon2.hash(data.password);

    const user = await prisma.user.create({
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
    const user = await prisma.user.findUnique({ where: { id: BigInt(userId) } });
    if (!user) throw new AppError('User not found', 404);

    if (data.departmentId) {
      const dept = await prisma.department.findUnique({ where: { id: BigInt(data.departmentId) } });
      if (!dept) throw new AppError('Department not found', 404);
    }

    const updateData: Prisma.UserUncheckedUpdateInput = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.departmentId !== undefined) updateData.departmentId = BigInt(data.departmentId);
    if (data.positionTitle !== undefined) updateData.positionTitle = data.positionTitle;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await prisma.user.update({
      where: { id: BigInt(userId) },
      data: updateData,
      select: USER_SELECT,
    });

    return serializeUser(updated);
  }

  static async deleteUser(userId: string) {
    const targetUserId = BigInt(userId);
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        userRoles: {
          select: {
            role: {
              select: {
                code: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            roadmapAssignments: true,
            assignedRoadmaps: true,
            trainerCourses: true,
            questionBanks: true,
            assignedEnrollments: true,
            gradedQuizAttempts: true,
            gradedAttemptResponses: true,
            authSessions: true,
            userRoles: true,
            chatSessions: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const roleCodes = user.userRoles.map((assignment) => assignment.role.code);
    if (roleCodes.includes('admin')) {
      throw new AppError('Cannot delete an admin account', 400);
    }

    const blockingRelations = [
      ['enrollments', user._count.enrollments],
      ['roadmap assignments', user._count.roadmapAssignments],
      ['assigned roadmaps', user._count.assignedRoadmaps],
      ['trainer courses', user._count.trainerCourses],
      ['question banks', user._count.questionBanks],
      ['assigned enrollments', user._count.assignedEnrollments],
      ['graded quiz attempts', user._count.gradedQuizAttempts],
      ['graded attempt responses', user._count.gradedAttemptResponses],
      ['chat sessions', user._count.chatSessions],
    ].filter(([, count]) => (count as number) > 0) as Array<[string, number]>;

    if (blockingRelations.length > 0) {
      throw new AppError(
        `Cannot delete user because related data exists: ${blockingRelations.map(([label]) => label).join(', ')}`,
        400,
      );
    }

    try {
      await prisma.$transaction(async (tx: TransactionClient) => {
        await tx.authSession.deleteMany({
          where: { userId: targetUserId },
        });

        await tx.userRole.deleteMany({
          where: { userId: targetUserId },
        });

        await tx.user.delete({
          where: { id: targetUserId },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new AppError('Cannot delete user because related records still exist', 400);
      }

      throw error;
    }

    return {
      id: user.id.toString(),
      email: user.email,
    };
  }

  static async importUsersFromExcel(fileBuffer: Buffer, importedByUserId: string) {
    const parsedRows = parseExcelRows(fileBuffer);

    const existingDepartments = await prisma.department.findMany({
      select: { id: true, name: true },
    });
    const departmentMap = new Map<string, { id: bigint; name: string }>(
      existingDepartments.map((department) => [
        normalizeDepartmentKey(department.name),
        { id: department.id, name: department.name },
      ]),
    );

    const roles = await prisma.role.findMany({
      select: { id: true, code: true, name: true },
    });
    const roleMap = new Map<string, { id: bigint; code: string; name: string }>(
      roles.map((role) => [role.code.toLowerCase(), role]),
    );

    const seenEmails = new Set<string>();
    const createdUsers: Array<Record<string, unknown>> = [];
    const errors: Array<{ row: number; email: string; reason: string }> = [];
    const createdDepartments = new Set<string>();

    for (const row of parsedRows) {
      try {
        if (!row.fullName) {
          throw new AppError('fullName is required', 400);
        }

        if (!row.email) {
          throw new AppError('email is required', 400);
        }

        if (!row.departmentName) {
          throw new AppError('department is required', 400);
        }

        const isActive = parseBooleanCell(row.isActiveRaw, true);

        if (seenEmails.has(row.email)) {
          throw new AppError(`Duplicate email "${row.email}" in import file`, 400);
        }
        seenEmails.add(row.email);

        const existingUser = await prisma.user.findUnique({
          where: { email: row.email },
          select: { id: true },
        });

        if (existingUser) {
          throw new AppError(`User with email "${row.email}" already exists`, 409);
        }

        let department = departmentMap.get(normalizeDepartmentKey(row.departmentName));
        if (!department) {
          const createdDepartment = await prisma.department.create({
            data: {
              name: row.departmentName,
              isActive: true,
            },
            select: { id: true, name: true },
          });

          department = createdDepartment;
          departmentMap.set(normalizeDepartmentKey(createdDepartment.name), createdDepartment);
          createdDepartments.add(createdDepartment.name);
        }

        if (!department) {
          throw new AppError(`Failed to resolve department "${row.departmentName}"`, 500);
        }

        const resolvedDepartment = department;

        const role = roleMap.get(row.roleCode);
        if (!role) {
          throw new AppError(`Role "${row.roleCode}" not found`, 404);
        }

        const passwordHash = await argon2.hash(row.password);

        const createdUser = await prisma.$transaction(async (tx: TransactionClient) => {
          return tx.user.create({
            data: {
              fullName: row.fullName,
              email: row.email,
              passwordHash,
              departmentId: resolvedDepartment.id,
              positionTitle: row.positionTitle,
              avatarUrl: row.avatarUrl,
              isActive,
              userRoles: {
                create: {
                  roleId: role.id,
                  assignedByUserId: BigInt(importedByUserId),
                },
              },
            },
            select: USER_SELECT,
          });
        });

        createdUsers.push({
          row: row.rowNumber,
          user: serializeUser(createdUser),
        });
      } catch (error) {
        errors.push({
          row: row.rowNumber,
          email: row.email,
          reason: error instanceof Error ? error.message : 'Unknown import error',
        });
      }
    }

    return {
      summary: {
        totalRows: parsedRows.length,
        successCount: createdUsers.length,
        errorCount: errors.length,
        createdDepartmentCount: createdDepartments.size,
      },
      createdDepartments: Array.from(createdDepartments),
      createdUsers,
      errors,
      acceptedColumns: [
        'fullName | name | hoten',
        'email',
        'password',
        'department | departmentName | phongban',
        'positionTitle | position | chucvu',
        'avatarUrl',
        'roleCode | role',
        'isActive | active | trangthai',
      ],
    };
  }
}
