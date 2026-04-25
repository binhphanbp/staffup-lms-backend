import { prisma } from '@/config/database';
import type { PaginatedResult } from '@/interfaces';
import type { CourseDetailResponse, CourseExpand } from '@/interfaces/course.types';
import { assertPolicy, canAccessOwnedResource } from '@/policies';
import type {
  CreateCourseModuleInput,
  CreateCourseLessonInput,
  CreateLessonResourceInput,
  CourseDetailQuery,
  CourseQuery,
  CreateCourseInput,
  ReorderCourseLessonsInput,
  ReorderCourseModulesInput,
  UpdateCourseStatusInput,
  UpdateCourseLessonInput,
  UpdateLessonResourceInput,
  UpdateCourseModuleInput,
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
  mediaFolder: string | null;
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

interface CourseModuleItem {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  lessonsCount: number;
}

interface CourseLessonItem {
  id: string;
  moduleId: string;
  title: string;
  lessonType: 'video' | 'article' | 'quiz';
  contentText: string | null;
  videoUrl: string | null;
  durationSeconds: number;
  orderIndex: number;
  isPreview: boolean;
  createdAt: string;
  updatedAt: string;
  resourcesCount: number;
  progressCount: number;
  hasQuiz: boolean;
}

interface LessonResourceItem {
  id: string;
  lessonId: string;
  fileName: string;
  fileUrl: string;
  resourceType: 'file' | 'video' | 'material' | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
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

  private static async validatePublishEligibility(courseId: string) {
    const course = await this.db.course.findUnique({
      where: { id: BigInt(courseId) },
      include: {
        modules: {
          include: {
            lessons: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    if (!course.description?.trim()) {
      throw new AppError('Course must have a description before publishing.', 400);
    }

    if (!course.thumbnailUrl?.trim()) {
      throw new AppError('Course must have a thumbnail before publishing.', 400);
    }

    if (!course.categoryId) {
      throw new AppError('Course must have a category before publishing.', 400);
    }

    if (!course.estimatedDurationMinutes || course.estimatedDurationMinutes <= 0) {
      throw new AppError('Course must have an estimated duration before publishing.', 400);
    }

    if (course.modules.length === 0) {
      throw new AppError('Course must contain at least one module before publishing.', 400);
    }

    const moduleWithoutLessons = course.modules.find((module: any) => module.lessons.length === 0);
    if (moduleWithoutLessons) {
      throw new AppError('Every module must contain at least one lesson before publishing.', 400);
    }

    return course;
  }

  private static mapCourseListItem(course: any): CourseListItem {
    return {
      id: course.id.toString(),
      title: course.title,
      slug: course.slug,
      description: course.description,
      mediaFolder: course.mediaFolder,
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

  private static mapCourseModuleItem(module: any): CourseModuleItem {
    return {
      id: module.id.toString(),
      courseId: module.courseId.toString(),
      title: module.title,
      orderIndex: module.orderIndex,
      createdAt: module.createdAt.toISOString(),
      updatedAt: module.updatedAt.toISOString(),
      lessonsCount: module._count?.lessons ?? 0,
    };
  }

  private static mapCourseLessonItem(lesson: any): CourseLessonItem {
    return {
      id: lesson.id.toString(),
      moduleId: lesson.moduleId.toString(),
      title: lesson.title,
      lessonType: lesson.lessonType,
      contentText: lesson.contentText,
      videoUrl: lesson.videoUrl,
      durationSeconds: lesson.durationSeconds,
      orderIndex: lesson.orderIndex,
      isPreview: lesson.isPreview,
      createdAt: lesson.createdAt.toISOString(),
      updatedAt: lesson.updatedAt.toISOString(),
      resourcesCount: lesson._count?.resources ?? 0,
      progressCount: lesson._count?.progress ?? 0,
      hasQuiz: Boolean(lesson.quiz),
    };
  }

  private static mapLessonResourceItem(resource: any): LessonResourceItem {
    return {
      id: resource.id.toString(),
      lessonId: resource.lessonId.toString(),
      fileName: resource.fileName,
      fileUrl: resource.fileUrl,
      resourceType: resource.resourceType,
      orderIndex: resource.orderIndex,
      createdAt: resource.createdAt.toISOString(),
      updatedAt: resource.updatedAt.toISOString(),
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

  private static async getOwnedCourseOrThrow(id: string, userId: string, roleCodes: string[]) {
    const course = await this.db.course.findUnique({
      where: { id: BigInt(id) },
    });

    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    assertPolicy(
      canAccessOwnedResource({
        actor: { userId, roleCodes },
        ownerUserId: course.trainerUserId,
      }),
      'You can only update your own courses.',
    );

    return course;
  }

  private static async assertModuleOrderIndexAvailable(
    courseId: string,
    orderIndex: number,
    excludeModuleId?: string,
  ) {
    const existingModule = await this.db.module.findUnique({
      where: {
        courseId_orderIndex: {
          courseId: BigInt(courseId),
          orderIndex,
        },
      },
    });

    if (existingModule && existingModule.id.toString() !== excludeModuleId) {
      throw new AppError(
        `Order index ${orderIndex} is already used by another module in this course.`,
        400,
      );
    }
  }

  private static async getCourseModuleOrThrow(courseId: string, moduleId: string) {
    const module = await this.db.module.findUnique({
      where: { id: BigInt(moduleId) },
      include: {
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    });

    if (!module || module.courseId.toString() !== courseId) {
      throw new AppError('Module not found in this course.', 404);
    }

    return module;
  }

  private static async assertLessonOrderIndexAvailable(
    moduleId: string,
    orderIndex: number,
    excludeLessonId?: string,
  ) {
    const existingLesson = await this.db.lesson.findUnique({
      where: {
        moduleId_orderIndex: {
          moduleId: BigInt(moduleId),
          orderIndex,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingLesson && existingLesson.id.toString() !== excludeLessonId) {
      throw new AppError(
        `Order index ${orderIndex} is already used by another lesson in this module.`,
        400,
      );
    }
  }

  private static assertLessonContentRequirement(
    lessonType: 'video' | 'article' | 'quiz',
    data: {
      contentText?: string | null;
      videoUrl?: string | null;
    },
  ) {
    if (lessonType === 'video' && !data.videoUrl?.trim()) {
      throw new AppError('videoUrl is required for video lessons.', 400);
    }

    if (lessonType === 'article' && !data.contentText?.trim()) {
      throw new AppError('contentText is required for article lessons.', 400);
    }
  }

  private static async getLessonInModuleOrThrow(
    courseId: string,
    moduleId: string,
    lessonId: string,
  ) {
    await this.getCourseModuleOrThrow(courseId, moduleId);

    const lesson = await this.db.lesson.findUnique({
      where: { id: BigInt(lessonId) },
      include: {
        quiz: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            resources: true,
            progress: true,
          },
        },
      },
    });

    if (!lesson || lesson.moduleId.toString() !== moduleId) {
      throw new AppError('Lesson not found in this module.', 404);
    }

    return lesson;
  }

  private static async getResourceInLessonOrThrow(
    courseId: string,
    moduleId: string,
    lessonId: string,
    resourceId: string,
  ) {
    await this.getLessonInModuleOrThrow(courseId, moduleId, lessonId);

    const resource = await this.db.lessonResource.findUnique({
      where: { id: BigInt(resourceId) },
    });

    if (!resource || resource.lessonId.toString() !== lessonId) {
      throw new AppError('Resource not found in this lesson.', 404);
    }

    return resource;
  }

  private static async assertLessonResourceOrderIndexAvailable(
    lessonId: string,
    orderIndex: number,
    excludeResourceId?: string,
  ) {
    const existingResource = await this.db.lessonResource.findUnique({
      where: {
        lessonId_orderIndex: {
          lessonId: BigInt(lessonId),
          orderIndex,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingResource && existingResource.id.toString() !== excludeResourceId) {
      throw new AppError(
        `Order index ${orderIndex} is already used by another resource in this lesson.`,
        400,
      );
    }
  }

  private static async getNextLessonResourceOrderIndex(lessonId: string) {
    const lastResource = await this.db.lessonResource.findFirst({
      where: { lessonId: BigInt(lessonId) },
      orderBy: { orderIndex: 'desc' },
      select: {
        orderIndex: true,
      },
    });

    return (lastResource?.orderIndex ?? 0) + 1;
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
    if (status === 'published') {
      throw new AppError(
        'Course cannot be published during creation. Create the course first, then publish after adding content.',
        400,
      );
    }
    const slug = await this.generateUniqueSlug(data.title);

    const created = await this.db.course.create({
      data: {
        title: data.title,
        slug,
        description: data.description ?? null,
        mediaFolder: data.mediaFolder ?? null,
        thumbnailUrl: data.thumbnailUrl ?? null,
        categoryId: data.categoryId ? BigInt(data.categoryId) : null,
        ownerDepartmentId: data.ownerDepartmentId ? BigInt(data.ownerDepartmentId) : null,
        estimatedDurationMinutes: data.estimatedDurationMinutes ?? null,
        trainerUserId: BigInt(trainerUserId),
        status,
        publishedAt: null,
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

    // Ensure page and limit are numbers
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
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
        take: limitNum,
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
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  /**
   * Get a single course by ID
   */
  static async findById(id: string, query: CourseDetailQuery = { expand: [] }) {
    const expand = query.expand as CourseExpand[];
    const course = await this.getCourseOrThrow(id, expand);

    return this.mapCourseDetail(course, expand);
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

    if (data.status === 'published') {
      await this.validatePublishEligibility(id);
    }

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
        mediaFolder: data.mediaFolder,
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
   * Update course status
   */
  static async updateStatus(
    id: string,
    status: UpdateCourseStatusInput['status'],
    userId: string,
    roleCodes: string[],
    permissionCodes: string[],
  ) {
    const course = await this.db.course.findUnique({
      where: { id: BigInt(id) },
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

    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    assertPolicy(
      canAccessOwnedResource({
        actor: { userId, roleCodes },
        ownerUserId: course.trainerUserId,
      }),
      'You can only update your own courses.',
    );

    this.assertCanPublish(status, permissionCodes);

    if (status === 'published') {
      await this.validatePublishEligibility(id);
    }

    const updated = await this.db.course.update({
      where: { id: BigInt(id) },
      data: {
        status,
        publishedAt: this.getPublishedAtUpdate(course.status, status, course.publishedAt),
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
   * Add tag to course
   */
  static async addTagToCourse(id: string, tagId: string, userId: string, roleCodes: string[]) {
    const course = await this.db.course.findUnique({
      where: { id: BigInt(id) },
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
        _count: {
          select: {
            modules: true,
            enrollments: true,
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
      'You can only update your own courses.',
    );

    const tag = await this.db.tag.findUnique({
      where: { id: BigInt(tagId) },
    });

    if (!tag) {
      throw new AppError('Tag not found.', 404);
    }

    const existingCourseTag = await this.db.courseTag.findUnique({
      where: {
        courseId_tagId: {
          courseId: BigInt(id),
          tagId: BigInt(tagId),
        },
      },
    });

    if (existingCourseTag) {
      throw new AppError('Tag is already assigned to this course.', 400);
    }

    await this.db.courseTag.create({
      data: {
        courseId: BigInt(id),
        tagId: BigInt(tagId),
      },
    });

    const updatedCourse = await this.db.course.findUnique({
      where: { id: BigInt(id) },
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
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
    });

    return {
      ...this.mapCourseListItem(updatedCourse),
      tags: updatedCourse.courseTags.map((courseTag: any) => ({
        id: courseTag.tag.id.toString(),
        name: courseTag.tag.name,
        slug: courseTag.tag.slug,
      })),
    };
  }

  /**
   * Remove tag from course
   */
  static async removeTagFromCourse(id: string, tagId: string, userId: string, roleCodes: string[]) {
    const course = await this.db.course.findUnique({
      where: { id: BigInt(id) },
    });

    if (!course) {
      throw new AppError('Course not found.', 404);
    }

    assertPolicy(
      canAccessOwnedResource({
        actor: { userId, roleCodes },
        ownerUserId: course.trainerUserId,
      }),
      'You can only update your own courses.',
    );

    const existingCourseTag = await this.db.courseTag.findUnique({
      where: {
        courseId_tagId: {
          courseId: BigInt(id),
          tagId: BigInt(tagId),
        },
      },
    });

    if (!existingCourseTag) {
      throw new AppError('Tag is not assigned to this course.', 404);
    }

    await this.db.courseTag.delete({
      where: {
        courseId_tagId: {
          courseId: BigInt(id),
          tagId: BigInt(tagId),
        },
      },
    });

    return {
      courseId: id,
      tagId,
      removed: true,
    };
  }

  /**
   * List course modules
   */
  static async listModules(courseId: string) {
    await this.getCourseOrThrow(courseId);

    const modules = await this.db.module.findMany({
      where: { courseId: BigInt(courseId) },
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    });

    return modules.map((module: any) => this.mapCourseModuleItem(module));
  }

  /**
   * Create course module
   */
  static async createModule(
    courseId: string,
    data: CreateCourseModuleInput,
    userId: string,
    roleCodes: string[],
  ) {
    await this.getOwnedCourseOrThrow(courseId, userId, roleCodes);
    await this.assertModuleOrderIndexAvailable(courseId, data.orderIndex);

    const module = await this.db.module.create({
      data: {
        courseId: BigInt(courseId),
        title: data.title,
        orderIndex: data.orderIndex,
      },
      include: {
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    });

    return this.mapCourseModuleItem(module);
  }

  /**
   * Update course module
   */
  static async updateModule(
    courseId: string,
    moduleId: string,
    data: UpdateCourseModuleInput,
    userId: string,
    roleCodes: string[],
  ) {
    await this.getOwnedCourseOrThrow(courseId, userId, roleCodes);
    const existingModule = await this.getCourseModuleOrThrow(courseId, moduleId);

    if (data.orderIndex !== undefined) {
      await this.assertModuleOrderIndexAvailable(courseId, data.orderIndex, moduleId);
    }

    const updatedModule = await this.db.module.update({
      where: { id: BigInt(moduleId) },
      data: {
        title: data.title,
        orderIndex: data.orderIndex,
      },
      include: {
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    });

    if (
      updatedModule.orderIndex !== existingModule.orderIndex ||
      updatedModule.title !== existingModule.title
    ) {
      return this.mapCourseModuleItem(updatedModule);
    }

    return this.mapCourseModuleItem(updatedModule);
  }

  /**
   * Delete course module
   */
  static async deleteModule(
    courseId: string,
    moduleId: string,
    userId: string,
    roleCodes: string[],
  ) {
    await this.getOwnedCourseOrThrow(courseId, userId, roleCodes);
    const module = await this.getCourseModuleOrThrow(courseId, moduleId);

    if (module._count.lessons > 0) {
      throw new AppError('Cannot delete module because it already contains lessons.', 400);
    }

    await this.db.module.delete({
      where: { id: BigInt(moduleId) },
    });

    return {
      courseId,
      moduleId,
      removed: true,
    };
  }

  /**
   * Reorder course modules
   */
  static async reorderModules(
    courseId: string,
    moduleOrders: ReorderCourseModulesInput['moduleOrders'],
    userId: string,
    roleCodes: string[],
  ) {
    await this.getOwnedCourseOrThrow(courseId, userId, roleCodes);

    const modules = await this.db.module.findMany({
      where: {
        courseId: BigInt(courseId),
        id: {
          in: moduleOrders.map((item) => BigInt(item.moduleId)),
        },
      },
      include: {
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    });

    if (modules.length !== moduleOrders.length) {
      const foundModuleIds = new Set(modules.map((module: any) => module.id.toString()));
      const missingModuleIds = moduleOrders
        .map((item) => item.moduleId)
        .filter((moduleId) => !foundModuleIds.has(moduleId));

      throw new AppError(`Modules not found in this course: ${missingModuleIds.join(', ')}`, 404);
    }

    await this.db.$transaction(async (tx: any) => {
      for (let index = 0; index < moduleOrders.length; index += 1) {
        const item = moduleOrders[index];
        await tx.module.update({
          where: { id: BigInt(item.moduleId) },
          data: {
            orderIndex: -1 * (index + 1),
          },
        });
      }

      for (const item of moduleOrders) {
        await tx.module.update({
          where: { id: BigInt(item.moduleId) },
          data: {
            orderIndex: item.orderIndex,
          },
        });
      }
    });

    const reorderedModules = await this.db.module.findMany({
      where: { courseId: BigInt(courseId) },
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: {
            lessons: true,
          },
        },
      },
    });

    return reorderedModules.map((module: any) => this.mapCourseModuleItem(module));
  }

  /**
   * List module lessons
   */
  static async listLessons(courseId: string, moduleId: string) {
    await this.getCourseModuleOrThrow(courseId, moduleId);

    const lessons = await this.db.lesson.findMany({
      where: { moduleId: BigInt(moduleId) },
      orderBy: { orderIndex: 'asc' },
      include: {
        quiz: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            resources: true,
            progress: true,
          },
        },
      },
    });

    return lessons.map((lesson: any) => this.mapCourseLessonItem(lesson));
  }

  /**
   * Create lesson in module
   */
  static async createLesson(
    courseId: string,
    moduleId: string,
    data: CreateCourseLessonInput,
    userId: string,
    roleCodes: string[],
  ) {
    await this.getOwnedCourseOrThrow(courseId, userId, roleCodes);
    await this.getCourseModuleOrThrow(courseId, moduleId);
    await this.assertLessonOrderIndexAvailable(moduleId, data.orderIndex);
    this.assertLessonContentRequirement(data.lessonType, {
      contentText: data.contentText,
      videoUrl: data.videoUrl,
    });

    const lesson = await this.db.lesson.create({
      data: {
        moduleId: BigInt(moduleId),
        title: data.title,
        lessonType: data.lessonType,
        contentText: data.contentText ?? null,
        videoUrl: data.videoUrl ?? null,
        durationSeconds: data.durationSeconds,
        orderIndex: data.orderIndex,
        isPreview: data.isPreview ?? false,
      },
      include: {
        quiz: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            resources: true,
            progress: true,
          },
        },
      },
    });

    return this.mapCourseLessonItem(lesson);
  }

  /**
   * Update lesson in module
   */
  static async updateLesson(
    courseId: string,
    moduleId: string,
    lessonId: string,
    data: UpdateCourseLessonInput,
    userId: string,
    roleCodes: string[],
  ) {
    await this.getOwnedCourseOrThrow(courseId, userId, roleCodes);
    const lesson = await this.getLessonInModuleOrThrow(courseId, moduleId, lessonId);

    if (data.orderIndex !== undefined) {
      await this.assertLessonOrderIndexAvailable(moduleId, data.orderIndex, lessonId);
    }

    const nextLessonType = data.lessonType ?? lesson.lessonType;
    this.assertLessonContentRequirement(nextLessonType, {
      contentText: data.contentText ?? lesson.contentText,
      videoUrl: data.videoUrl ?? lesson.videoUrl,
    });

    const updatedLesson = await this.db.lesson.update({
      where: { id: BigInt(lessonId) },
      data: {
        title: data.title,
        lessonType: data.lessonType,
        contentText: data.contentText,
        videoUrl: data.videoUrl,
        durationSeconds: data.durationSeconds,
        orderIndex: data.orderIndex,
        isPreview: data.isPreview,
      },
      include: {
        quiz: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            resources: true,
            progress: true,
          },
        },
      },
    });

    return this.mapCourseLessonItem(updatedLesson);
  }

  /**
   * Delete lesson in module
   */
  static async deleteLesson(
    courseId: string,
    moduleId: string,
    lessonId: string,
    userId: string,
    roleCodes: string[],
  ) {
    await this.getOwnedCourseOrThrow(courseId, userId, roleCodes);
    const lesson = await this.getLessonInModuleOrThrow(courseId, moduleId, lessonId);

    if (lesson._count.resources > 0 || lesson._count.progress > 0 || lesson.quiz) {
      throw new AppError(
        'Cannot delete lesson because it is linked to resources, learner progress, or a quiz.',
        400,
      );
    }

    await this.db.lesson.delete({
      where: { id: BigInt(lessonId) },
    });

    return {
      courseId,
      moduleId,
      lessonId,
      removed: true,
    };
  }

  /**
   * Reorder module lessons
   */
  static async reorderLessons(
    courseId: string,
    moduleId: string,
    lessonOrders: ReorderCourseLessonsInput['lessonOrders'],
    userId: string,
    roleCodes: string[],
  ) {
    await this.getOwnedCourseOrThrow(courseId, userId, roleCodes);
    await this.getCourseModuleOrThrow(courseId, moduleId);

    const lessons = await this.db.lesson.findMany({
      where: {
        moduleId: BigInt(moduleId),
        id: {
          in: lessonOrders.map((item) => BigInt(item.lessonId)),
        },
      },
      include: {
        quiz: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            resources: true,
            progress: true,
          },
        },
      },
    });

    if (lessons.length !== lessonOrders.length) {
      const foundLessonIds = new Set(lessons.map((lesson: any) => lesson.id.toString()));
      const missingLessonIds = lessonOrders
        .map((item) => item.lessonId)
        .filter((lessonId) => !foundLessonIds.has(lessonId));

      throw new AppError(`Lessons not found in this module: ${missingLessonIds.join(', ')}`, 404);
    }

    await this.db.$transaction(async (tx: any) => {
      for (let index = 0; index < lessonOrders.length; index += 1) {
        const item = lessonOrders[index];
        await tx.lesson.update({
          where: { id: BigInt(item.lessonId) },
          data: {
            orderIndex: -1 * (index + 1),
          },
        });
      }

      for (const item of lessonOrders) {
        await tx.lesson.update({
          where: { id: BigInt(item.lessonId) },
          data: {
            orderIndex: item.orderIndex,
          },
        });
      }
    });

    const reorderedLessons = await this.db.lesson.findMany({
      where: { moduleId: BigInt(moduleId) },
      orderBy: { orderIndex: 'asc' },
      include: {
        quiz: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            resources: true,
            progress: true,
          },
        },
      },
    });

    return reorderedLessons.map((lesson: any) => this.mapCourseLessonItem(lesson));
  }

  /**
   * List lesson resources
   */
  static async listLessonResources(courseId: string, moduleId: string, lessonId: string) {
    await this.getLessonInModuleOrThrow(courseId, moduleId, lessonId);

    const resources = await this.db.lessonResource.findMany({
      where: { lessonId: BigInt(lessonId) },
      orderBy: { orderIndex: 'asc' },
    });

    return resources.map((resource: any) => this.mapLessonResourceItem(resource));
  }

  /**
   * Create lesson resource metadata
   */
  static async createLessonResource(
    courseId: string,
    moduleId: string,
    lessonId: string,
    data: CreateLessonResourceInput,
    userId: string,
    roleCodes: string[],
  ) {
    await this.getOwnedCourseOrThrow(courseId, userId, roleCodes);
    await this.getLessonInModuleOrThrow(courseId, moduleId, lessonId);

    const orderIndex = data.orderIndex ?? (await this.getNextLessonResourceOrderIndex(lessonId));
    await this.assertLessonResourceOrderIndexAvailable(lessonId, orderIndex);

    const resource = await this.db.lessonResource.create({
      data: {
        lessonId: BigInt(lessonId),
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        resourceType: data.resourceType ?? null,
        orderIndex,
      },
    });

    return this.mapLessonResourceItem(resource);
  }

  /**
   * Update lesson resource metadata
   */
  static async updateLessonResource(
    courseId: string,
    moduleId: string,
    lessonId: string,
    resourceId: string,
    data: UpdateLessonResourceInput,
    userId: string,
    roleCodes: string[],
  ) {
    await this.getOwnedCourseOrThrow(courseId, userId, roleCodes);
    await this.getResourceInLessonOrThrow(courseId, moduleId, lessonId, resourceId);

    if (data.orderIndex !== undefined) {
      await this.assertLessonResourceOrderIndexAvailable(lessonId, data.orderIndex, resourceId);
    }

    const updatedResource = await this.db.lessonResource.update({
      where: { id: BigInt(resourceId) },
      data: {
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        resourceType: data.resourceType,
        orderIndex: data.orderIndex,
      },
    });

    return this.mapLessonResourceItem(updatedResource);
  }

  /**
   * Delete lesson resource metadata
   */
  static async deleteLessonResource(
    courseId: string,
    moduleId: string,
    lessonId: string,
    resourceId: string,
    userId: string,
    roleCodes: string[],
  ) {
    await this.getOwnedCourseOrThrow(courseId, userId, roleCodes);
    await this.getResourceInLessonOrThrow(courseId, moduleId, lessonId, resourceId);

    await this.db.lessonResource.delete({
      where: { id: BigInt(resourceId) },
    });

    return {
      courseId,
      moduleId,
      lessonId,
      resourceId,
      removed: true,
    };
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
    const expandItems =
      query.expand && (query.expand as CourseExpand[]).length > 0
        ? (query.expand as CourseExpand[])
        : DEFAULT_DETAIL_EXPANDS;
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
      mediaFolder: course.mediaFolder,
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
              const mappedLesson: NonNullable<
                CourseDetailResponse['modules']
              >[number]['lessons'][number] = {
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
