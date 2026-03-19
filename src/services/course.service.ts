import { prisma } from '@/config/database';
import { AppError } from '@/utils';
import type { CreateCourseInput, UpdateCourseInput, CourseQuery } from '@/schemas/course.schema';
import type { PaginatedResult } from '@/interfaces';
import type { Course, Role } from '@prisma/client';

export class CourseService {
  /**
   * Create a new course
   */
  static async create(data: CreateCourseInput, instructorId: string) {
    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check for duplicate slug
    const existingCourse = await prisma.course.findUnique({
      where: { slug },
    });

    const finalSlug = existingCourse ? `${slug}-${Date.now()}` : slug;

    const course = await prisma.course.create({
      data: {
        ...data,
        slug: finalSlug,
        instructorId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return course;
  }

  /**
   * Get all courses with pagination, filtering, and search
   */
  static async findAll(query: CourseQuery): Promise<PaginatedResult<Course>> {
    const { page, limit, sortBy, sortOrder, status, search } = query;
    const skip = (page - 1) * limit;

    // Build where clause
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
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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
      prisma.course.count({ where }),
    ]);

    return {
      data: courses as unknown as Course[],
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
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
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
  static async update(id: string, data: UpdateCourseInput, userId: string, userRole: Role) {
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    // ADMIN can update any course; instructors can only update their own
    if (userRole !== 'ADMIN' && course.instructorId !== userId) {
      throw new AppError('You can only update your own courses.', 403);
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data,
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updatedCourse;
  }

  /**
   * Delete a course
   */
  static async delete(id: string, userId: string, userRole: Role) {
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    // ADMIN can delete any course; instructors can only delete their own
    if (userRole !== 'ADMIN' && course.instructorId !== userId) {
      throw new AppError('You can only delete your own courses.', 403);
    }

    await prisma.course.delete({ where: { id } });
  }
}
