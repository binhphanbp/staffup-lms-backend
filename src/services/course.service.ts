import { prisma } from '@/config/database';
import type { PaginatedResult } from '@/interfaces';
import type { CourseDetailResponse, CourseExpand } from '@/interfaces/course.types';
import { assertPolicy, canAccessOwnedResource } from '@/policies';
import type {
  CourseDetailQuery,
  CourseQuery,
  CreateCourseInput,
  UpdateCourseInput,
} from '@/schemas/course.schema';
import { AppError, slugify } from '@/utils';

type CourseStatus = 'draft' | 'published' | 'archived';

type CourseEntity = Awaited<ReturnType<(typeof CourseService)['getCourseOrThrow']>>;

interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  status: CourseStatus;
  estimatedDurationMinutes: number | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  trainer: {
    id: string;
    fullName: string;
    email?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  ownerDepartment: {
    id: string;
    name: string;
  } | null;
  counts: {
    modules: number;
    enrollments: number;
  };
}

const DEFAULT_DETAIL_EXPANDS: CourseExpand[] = ['all'];

export class CourseService {
  private static get db() {
    return prisma as any;
  }

  private static isAdmin(roleCodes: string[]) {
    return roleCodes.includes('admin');
  }

  private static assertCanAssignTrainer(
    requestedTrainerUserId: string | undefined,
    actorUserId: string,
    roleCodes: string[],
  ) {
    if (!requestedTrainerUserId || requestedTrainerUserId === actorUserId) {
      return;
    }

    if (!this.isAdmin(roleCodes)) {
      throw new AppError('Only admin can assign a different trainer to a course.', 403);
    }
  }

  private static assertCanPublish(status: CourseStatus | undefined, permissionCodes: string[]) {
    if (status !== 'published') {
      return;
    }

    if (!permissionCodes.includes('course.publish')) {
      throw new AppError('You do not have permission to publish courses.', 403);
    }
  }

  private static async ensureTrainerExists(trainerUserId: string) {
    const trainer = await this.db.user.findUnique({
      where: { id: BigInt(trainerUserId) },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!trainer) {
      throw new AppError('Trainer not found.', 404);
    }

    const isTrainer = trainer.userRoles.some((userRole: any) => userRole.role.code === 'trainer');
    if (!isTrainer) {
      throw new AppError('Selected user is not a trainer.', 400);
    }

    return trainer;
  }

  private static async ensureCategoryExists(categoryId: string) {
    const category = await this.db.category.findUnique({
      where: { id: BigInt(categoryId) },
    });

    if (!category) {
      throw new AppError('Category not found.', 404);
    }
  }

  private static async ensureDepartmentExists(ownerDepartmentId: string) {
    const department = await this.db.department.findUnique({
      where: { id: BigInt(ownerDepartmentId) },
    });

    if (!department) {
      throw new AppError('Department not found.', 404);
    }
  }

  private static async generateUniqueSlug(title: string, excludeCourseId?: string) {
    const baseSlug = slugify(title);
    let candidate = baseSlug;
    let suffix = 1;

    while (true) {
      const existing = await this.db.course.findUnique({
        where: { slug: candidate },
        select: { id: true },
      });

      if (!existing || existing.id.toString() === excludeCourseId) {
        return candidate;
      }

      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  }

  private static getPublishedAtUpdate(
    currentStatus: CourseStatus,
    nextStatus: CourseStatus | undefined,
    currentPublishedAt: Date | null,
  ) {
    if (!nextStatus || nextStatus === currentStatus) {
      return undefined;
    }

    if (nextStatus === 'published') {
      return currentPublishedAt ?? new Date();
    }

    if (currentStatus === 'published') {
      return null;
    }

    return undefined;
  }

  private static mapCourseListItem(course: any): CourseListItem {
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
      counts: {
        modules: course._count.modules,
        enrollments: course._count.enrollments,
      },
    };
  }

  private static normalizeExpand(expandItems: CourseExpand[] = []) {
    const expanded = new Set<CourseExpand>(expandItems);

    if (expanded.has('all')) {
      expanded.add('tags');
      expanded.add('modules');
      expanded.add('lessons');
      expanded.add('resources');
      expanded.add('quiz');
    }

    if (expanded.has('resources')) {
      expanded.add('lessons');
      expanded.add('modules');
    }

    if (expanded.has('quiz')) {
      expanded.add('lessons');
      expanded.add('modules');
    }

    if (expanded.has('lessons')) {
      expanded.add('modules');
    }

    return expanded;
  }

  private static buildCourseInclude(expands: Set<CourseExpand>) {
    const include: Record<string, unknown> = {
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
      _count: {
        select: {
          enrollments: true,
        },
      },
    };

    if (expands.has('tags')) {
      include.courseTags = {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      };
    }

    if (expands.has('modules')) {
      const lessonInclude: Record<string, unknown> = {};

      if (expands.has('resources')) {
        lessonInclude.resources = {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            resourceType: true,
            orderIndex: true,
          },
        };
      }

      if (expands.has('quiz')) {
        lessonInclude.quiz = {
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
        };
      }

      include.modules = {
        orderBy: { orderIndex: 'asc' },
        include: expands.has('lessons')
          ? {
              lessons: {
                orderBy: { orderIndex: 'asc' },
                include: lessonInclude,
              },
            }
          : undefined,
      };
    }

    return include;
  }

  private static async getCourseOrThrow(id: string, expandItems: CourseExpand[] = []) {
    const expands = this.normalizeExpand(expandItems);
    const course = await this.db.course.findUnique({
      where: { id: BigInt(id) },
      include: this.buildCourseInclude(expands),
    });

    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    return course;
  }

  /**
   * Create a new course
   */
  static async create(
    data: CreateCourseInput,
    requestUserId: string,
    roleCodes: string[],
    permissionCodes: string[],
  ) {
    const trainerUserId = data.trainerUserId ?? requestUserId;
    this.assertCanAssignTrainer(trainerUserId, requestUserId, roleCodes);

    await this.ensureTrainerExists(trainerUserId);

    if (data.categoryId) {
      await this.ensureCategoryExists(data.categoryId);
    }

    if (data.ownerDepartmentId) {
      await this.ensureDepartmentExists(data.ownerDepartmentId);
    }

    const status = data.status ?? 'draft';
    this.assertCanPublish(status, permissionCodes);
    const slug = await this.generateUniqueSlug(data.title);

    const created = await this.db.course.create({
      data: {
        title: data.title,
        slug,
        description: data.description ?? null,
        thumbnailUrl: data.thumbnailUrl ?? null,
        categoryId: data.categoryId ? BigInt(data.categoryId) : null,
        ownerDepartmentId: data.ownerDepartmentId ? BigInt(data.ownerDepartmentId) : null,
        estimatedDurationMinutes: data.estimatedDurationMinutes ?? null,
        trainerUserId: BigInt(trainerUserId),
        status,
        publishedAt: status === 'published' ? new Date() : null,
      },
      include: {
        trainerUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
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
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
    });

    return this.mapCourseListItem(created);
  }

  /**
   * Get all courses with pagination, filtering, and search
   */
  static async findAll(query: CourseQuery): Promise<PaginatedResult<CourseListItem>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      search,
      trainerId,
      categoryId,
      ownerDepartmentId,
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (trainerId) {
      where.trainerUserId = BigInt(trainerId);
    }

    if (categoryId) {
      where.categoryId = BigInt(categoryId);
    }

    if (ownerDepartmentId) {
      where.ownerDepartmentId = BigInt(ownerDepartmentId);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      this.db.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          trainerUser: {
            select: {
              id: true,
              fullName: true,
              email: true,
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
          _count: {
            select: {
              modules: true,
              enrollments: true,
            },
          },
        },
      }),
      this.db.course.count({ where }),
    ]);

    return {
      data: courses.map((course: any) => this.mapCourseListItem(course)),
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
  static async findById(id: string, query: CourseDetailQuery = { expand: [] }) {
    const course = await this.getCourseOrThrow(id, query.expand);

    return this.mapCourseDetail(course, query.expand);
  }

  /**
   * Update a course
   */
  static async update(
    id: string,
    data: UpdateCourseInput,
    userId: string,
    roleCodes: string[],
    permissionCodes: string[],
  ) {
    const existingCourse = await this.db.course.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingCourse) {
      throw new AppError('Course not found.', 404);
    }

    assertPolicy(
      canAccessOwnedResource({
        actor: { userId, roleCodes },
        ownerUserId: existingCourse.trainerUserId,
      }),
      'You can only update your own courses.',
    );

    const nextTrainerUserId = data.trainerUserId ?? existingCourse.trainerUserId.toString();
    this.assertCanAssignTrainer(nextTrainerUserId, userId, roleCodes);
    this.assertCanPublish(data.status, permissionCodes);

    if (data.trainerUserId) {
      await this.ensureTrainerExists(data.trainerUserId);
    }

    if (data.categoryId) {
      await this.ensureCategoryExists(data.categoryId);
    }

    if (data.ownerDepartmentId) {
      await this.ensureDepartmentExists(data.ownerDepartmentId);
    }

    const nextSlug =
      data.title && data.title !== existingCourse.title
        ? await this.generateUniqueSlug(data.title, id)
        : undefined;

    const publishedAt = this.getPublishedAtUpdate(
      existingCourse.status,
      data.status,
      existingCourse.publishedAt,
    );

    const updated = await this.db.course.update({
      where: { id: BigInt(id) },
      data: {
        title: data.title,
        slug: nextSlug,
        description: data.description,
        thumbnailUrl: data.thumbnailUrl,
        categoryId: data.categoryId ? BigInt(data.categoryId) : undefined,
        ownerDepartmentId: data.ownerDepartmentId ? BigInt(data.ownerDepartmentId) : undefined,
        estimatedDurationMinutes: data.estimatedDurationMinutes,
        trainerUserId: data.trainerUserId ? BigInt(data.trainerUserId) : undefined,
        status: data.status,
        publishedAt,
      },
      include: {
        trainerUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
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
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
    });

    return this.mapCourseListItem(updated);
  }

  /**
   * Delete a course
   */
  static async delete(id: string, userId: string, roleCodes: string[]) {
    const course = await this.db.course.findUnique({
      where: { id: BigInt(id) },
      include: {
        _count: {
          select: {
            modules: true,
            enrollments: true,
            quizzes: true,
            roadmapCourses: true,
          },
        },
      },
    });

    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    assertPolicy(
      canAccessOwnedResource({
        actor: { userId, roleCodes },
        ownerUserId: course.trainerUserId,
      }),
      'You can only delete your own courses.',
    );

    if (
      course._count.modules > 0 ||
      course._count.enrollments > 0 ||
      course._count.quizzes > 0 ||
      course._count.roadmapCourses > 0
    ) {
      throw new AppError(
        'Cannot delete course because it is linked to modules, enrollments, quizzes, or roadmaps.',
        400,
      );
    }

    await this.db.course.delete({
      where: { id: BigInt(id) },
    });
  }

  /**
   * Get course detail with full structure for learning UI
   */
  static async getCourseDetail(
    id: string,
    query: CourseDetailQuery = { expand: DEFAULT_DETAIL_EXPANDS },
  ): Promise<CourseDetailResponse> {
    const expandItems = query.expand.length > 0 ? query.expand : DEFAULT_DETAIL_EXPANDS;
    const course = await this.getCourseOrThrow(id, expandItems);

    return this.mapCourseDetail(course, expandItems);
  }

  private static mapCourseDetail(
    course: CourseEntity,
    expandItems: CourseExpand[] = [],
  ): CourseDetailResponse {
    const expands = this.normalizeExpand(expandItems);
    const modules = Array.isArray(course.modules) ? course.modules : [];
    const totalModules = modules.length;
    const totalLessons = expands.has('lessons')
      ? modules.reduce((sum: number, module: any) => sum + module.lessons.length, 0)
      : 0;
    const totalDurationSeconds = expands.has('lessons')
      ? modules.reduce(
          (sum: number, module: any) =>
            sum +
            module.lessons.reduce(
              (lessonSum: number, lesson: any) => lessonSum + lesson.durationSeconds,
              0,
            ),
          0,
        )
      : 0;

    const response: CourseDetailResponse = {
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
    };

    if (expands.has('tags') && Array.isArray(course.courseTags)) {
      response.tags = course.courseTags.map((courseTag: any) => ({
        id: courseTag.tag.id.toString(),
        name: courseTag.tag.name,
        slug: courseTag.tag.slug,
      }));
    }

    if (expands.has('modules')) {
      response.modules = modules.map((module: any) => ({
        id: module.id.toString(),
        title: module.title,
        orderIndex: module.orderIndex,
        lessons: expands.has('lessons')
          ? module.lessons.map((lesson: any) => {
              const mappedLesson: CourseDetailResponse['modules'][number]['lessons'][number] = {
                id: lesson.id.toString(),
                title: lesson.title,
                lessonType: lesson.lessonType,
                durationSeconds: lesson.durationSeconds,
                orderIndex: lesson.orderIndex,
                isPreview: lesson.isPreview,
                videoUrl: lesson.videoUrl,
                contentText: lesson.contentText,
                resources:
                  expands.has('resources') && Array.isArray(lesson.resources)
                    ? lesson.resources.map((resource: any) => ({
                        id: resource.id.toString(),
                        fileName: resource.fileName,
                        fileUrl: resource.fileUrl,
                        resourceType: resource.resourceType,
                        orderIndex: resource.orderIndex,
                      }))
                    : [],
              };

              if (expands.has('quiz') && lesson.quiz) {
                mappedLesson.quiz = {
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

              return mappedLesson;
            })
          : [],
      }));

      response.stats = {
        totalModules,
        totalLessons,
        totalDurationMinutes: Math.ceil(totalDurationSeconds / 60),
        totalEnrollments: course._count.enrollments,
      };
    }

    return response;
  }
}
