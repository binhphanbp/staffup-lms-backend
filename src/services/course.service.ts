import { prisma } from '@/config/database';
import { AppError } from '@/utils';
import type { CreateCourseInput, UpdateCourseInput, CourseQuery } from '@/schemas/course.schema';
import type { PaginatedResult } from '@/interfaces';
import type { CourseDetailResponse } from '@/interfaces/course.types';
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
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      search,
      trainerId,
      categoryId,
    } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (trainerId) {
      where.trainerUserId = BigInt(trainerId);
    }

    if (categoryId) {
      where.categoryId = BigInt(categoryId);
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
  /**
   * Get course detail with full structure for learning UI
   */
  static async getCourseDetail(id: string): Promise<CourseDetailResponse> {
    const db = prisma as any;
    const course = await db.course.findUnique({
      where: { id: BigInt(id) },
      include: {
        trainerUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        ownerDepartment: {
          select: {
            id: true,
            name: true,
          },
        },
        courseTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
              include: {
                resources: {
                  orderBy: { orderIndex: 'asc' },
                  select: {
                    id: true,
                    fileName: true,
                    fileUrl: true,
                    resourceType: true,
                    orderIndex: true,
                  },
                },
                quiz: {
                  select: {
                    id: true,
                    title: true,
                    description: true,
                    passScorePercent: true,
                    timeLimitMinutes: true,
                    maxAttempts: true,
                    shuffleQuestions: true,
                    shuffleOptions: true,
                    _count: {
                      select: {
                        quizQuestions: true,
                      },
                    },
                  },
                },
              },
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

    // Calculate stats
    const totalModules = course.modules.length;
    const totalLessons = course.modules.reduce(
      (sum: number, module: any) => sum + module.lessons.length,
      0,
    );
    const totalDurationSeconds = course.modules.reduce(
      (sum: number, module: any) =>
        sum +
        module.lessons.reduce(
          (lessonSum: number, lesson: any) => lessonSum + lesson.durationSeconds,
          0,
        ),
      0,
    );

    // Transform response
    return {
      id: course.id.toString(),
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      status: course.status,
      estimatedDurationMinutes: course.estimatedDurationMinutes,
      publishedAt: course.publishedAt?.toISOString() || null,
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),

      trainer: {
        id: course.trainerUser.id.toString(),
        fullName: course.trainerUser.fullName,
        email: course.trainerUser.email,
        avatarUrl: course.trainerUser.avatarUrl,
      },

      category: course.category
        ? {
            id: course.category.id.toString(),
            name: course.category.name,
            slug: course.category.slug,
          }
        : null,

      ownerDepartment: course.ownerDepartment
        ? {
            id: course.ownerDepartment.id.toString(),
            name: course.ownerDepartment.name,
          }
        : null,

      tags: course.courseTags.map((ct: any) => ({
        id: ct.tag.id.toString(),
        name: ct.tag.name,
        slug: ct.tag.slug,
      })),

      modules: course.modules.map((module: any) => ({
        id: module.id.toString(),
        title: module.title,
        orderIndex: module.orderIndex,
        lessons: module.lessons.map((lesson: any) => {
          const lessonData: any = {
            id: lesson.id.toString(),
            title: lesson.title,
            lessonType: lesson.lessonType,
            durationSeconds: lesson.durationSeconds,
            orderIndex: lesson.orderIndex,
            isPreview: lesson.isPreview,
            videoUrl: lesson.videoUrl,
            contentText: lesson.contentText,
            resources: lesson.resources.map((resource: any) => ({
              id: resource.id.toString(),
              fileName: resource.fileName,
              fileUrl: resource.fileUrl,
              resourceType: resource.resourceType,
              orderIndex: resource.orderIndex,
            })),
          };

          // Add quiz info if exists
          if (lesson.quiz) {
            lessonData.quiz = {
              id: lesson.quiz.id.toString(),
              title: lesson.quiz.title,
              description: lesson.quiz.description,
              totalQuestions: lesson.quiz._count.quizQuestions,
              passScorePercent: Number(lesson.quiz.passScorePercent),
              timeLimitMinutes: lesson.quiz.timeLimitMinutes,
              maxAttempts: lesson.quiz.maxAttempts,
              shuffleQuestions: lesson.quiz.shuffleQuestions,
              shuffleOptions: lesson.quiz.shuffleOptions,
            };
          }

          return lessonData;
        }),
      })),

      stats: {
        totalModules,
        totalLessons,
        totalDurationMinutes: Math.ceil(totalDurationSeconds / 60),
        totalEnrollments: course._count.enrollments,
      },
    };
  }
}
