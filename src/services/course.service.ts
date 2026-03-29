import { prisma } from '@/config/database';
import { AppError } from '@/utils';
import type { CreateCourseInput, UpdateCourseInput, CourseQuery } from '@/schemas/course.schema';
import type { PaginatedResult } from '@/interfaces';

type CourseListItem = Record<string, unknown>;

export class CourseService {
  /**
   * Create a new course
   */
  static async create(data: CreateCourseInput, trainerUserId: string) {
    const db = prisma as any;

    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const existingCourse = await db.course.findUnique({
      where: { slug },
    });

    const finalSlug = existingCourse ? `${slug}-${Date.now()}` : slug;

    return db.course.create({
      data: {
        title: data.title,
        slug: finalSlug,
        description: data.description,
        thumbnailUrl: data.thumbnailUrl,
        categoryId: data.categoryId,
        ownerDepartmentId: data.ownerDepartmentId,
        estimatedDurationMinutes: data.estimatedDurationMinutes,
        trainerUserId: BigInt(trainerUserId),
      },
      include: {
        trainerUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get all courses with pagination, filtering, and search
   */
  static async findAll(query: CourseQuery): Promise<PaginatedResult<CourseListItem>> {
    const db = prisma as any;
    const { page, limit, sortBy, sortOrder, status, search } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      db.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          trainerUser: {
            select: {
              id: true,
              fullName: true,
            },
          },
          _count: {
            select: {
              modules: true,
              enrollments: true,
            },
          },
        },
      }),
      db.course.count({ where }),
    ]);

    return {
      data: courses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single course by ID
   */
  static async findById(id: string) {
    const db = prisma as any;

    const course = await db.course.findUnique({
      where: { id: BigInt(id) },
      include: {
        trainerUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    return course;
  }

  /**
   * Update a course
   */
  static async update(id: string, data: UpdateCourseInput, userId: string, roleCodes: string[]) {
    const db = prisma as any;

    const course = await db.course.findUnique({
      where: { id: BigInt(id) },
    });

    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    if (!roleCodes.includes('admin') && course.trainerUserId !== BigInt(userId)) {
      throw new AppError('You can only update your own courses.', 403);
    }

    return db.course.update({
      where: { id: BigInt(id) },
      data: {
        title: data.title,
        description: data.description,
        thumbnailUrl: data.thumbnailUrl,
        categoryId: data.categoryId,
        ownerDepartmentId: data.ownerDepartmentId,
        estimatedDurationMinutes: data.estimatedDurationMinutes,
        status: data.status,
      },
      include: {
        trainerUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Delete a course
   */
  static async delete(id: string, userId: string, roleCodes: string[]) {
    const db = prisma as any;

    const course = await db.course.findUnique({
      where: { id: BigInt(id) },
    });

    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    if (!roleCodes.includes('admin') && course.trainerUserId !== BigInt(userId)) {
      throw new AppError('You can only delete your own courses.', 403);
    }

    await db.course.delete({
      where: { id: BigInt(id) },
    });
  }
}
