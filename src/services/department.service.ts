import { prisma } from '@/config/database';
import { AppError } from '@/utils';

export class DepartmentService {
  /**
   * Get all departments with their managers
   */
  static async getDepartments() {
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        isActive: true,
        manager: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return departments;
  }

  /**
   * Get department by ID with full details (users, roadmaps, courses)
   */
  static async getDepartmentById(id: string) {
    const departmentId = BigInt(id);

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: {
        id: true,
        name: true,
        isActive: true,
        manager: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        users: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        roadmaps: {
          select: {
            id: true,
            title: true,
          },
        },
        ownedCourses: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            status: true,
            estimatedDurationMinutes: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    return department;
  }

  /**
   * Get paginated users belonging to a department, with optional isActive filter
   */
  static async getUsersByDepartment(
    id: string,
    options: { page: number; limit: number; isActive?: boolean },
  ) {
    const departmentId = BigInt(id);
    const { page, limit, isActive } = options;

    // Verify department exists
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { id: true, name: true },
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    const where = {
      departmentId,
      ...(isActive !== undefined && { isActive }),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          isActive: true,
          userRoles: {
            select: {
              role: {
                select: { code: true, name: true },
              },
            },
          },
          createdAt: true,
        },
        orderBy: { fullName: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new department
   */
  static async createDepartment(data: {
    name: string;
    isActive?: boolean;
    managerUserId?: string | null;
  }) {
    // Check if duplicate name exists
    const existing = await prisma.department.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new AppError('Department name already exists', 400);
    }

    // Verify manager exists if provided
    if (data.managerUserId) {
      const user = await prisma.user.findUnique({
        where: { id: BigInt(data.managerUserId) },
      });
      if (!user) {
        throw new AppError('Manager user not found', 404);
      }
    }

    const newDepartment = await prisma.department.create({
      data: {
        name: data.name,
        isActive: data.isActive ?? true,
        managerUserId: data.managerUserId ? BigInt(data.managerUserId) : null,
      },
    });

    return newDepartment;
  }

  /**
   * Update an existing department
   */
  static async updateDepartment(
    id: string,
    data: { name?: string; isActive?: boolean; managerUserId?: string | null },
  ) {
    const departmentId = BigInt(id);

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    // Name collision check
    if (data.name && data.name !== department.name) {
      const existing = await prisma.department.findUnique({
        where: { name: data.name },
      });
      if (existing) {
        throw new AppError('Department name already exists', 400);
      }
    }

    // Verify manager if provided
    if (data.managerUserId) {
      const user = await prisma.user.findUnique({
        where: { id: BigInt(data.managerUserId) },
      });
      if (!user) {
        throw new AppError('Manager user not found', 404);
      }
    }

    const updatedDepartment = await prisma.department.update({
      where: { id: departmentId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.managerUserId !== undefined && {
          managerUserId: data.managerUserId ? BigInt(data.managerUserId) : null,
        }),
      },
    });

    return updatedDepartment;
  }

  /**
   * Delete a department by ID
   */
  static async deleteDepartment(id: string) {
    const departmentId = BigInt(id);

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    try {
      await prisma.department.delete({
        where: { id: departmentId },
      });
    } catch (err: any) {
      // Handle Foreign Key constraint errors (P2003)
      if (err.code === 'P2003') {
        throw new AppError(
          'Cannot delete department because it has associated users or courses. Please reassign or delete them first.',
          400,
        );
      }
      throw err;
    }
  }
}
