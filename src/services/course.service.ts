import type { PaginatedResult } from '@/interfaces';
import type { CourseDetailResponse, CourseExpand } from '@/interfaces/course.types';
import { assertPolicy, canAccessOwnedResource } from '@/policies';
import type {
  CourseDetailQuery,
  CourseQuery,
  CreateCourseInput,
  UpdateCourseInput,
  UpdateCourseStatusInput,
} from '@/schemas/course.schema';
import { AppError } from '@/utils';
import {
  assertCanAssignTrainer,
  assertCanPublish,
  type CourseListItem,
  DEFAULT_DETAIL_EXPANDS,
  ensureCategoryExists,
  ensureDepartmentExists,
  ensureTrainerExists,
  generateUniqueSlug,
  getCourseOrThrow,
  getDb,
  getPublishedAtUpdate,
  mapCourseListItem,
  normalizeExpand,
  validatePublishEligibility,
} from './course-helpers.service';
import { CourseLessonService } from './course-lesson.service';
import { CourseModuleService } from './course-module.service';
import { CourseResourceService } from './course-resource.service';

type CourseEntity = Awaited<ReturnType<typeof getCourseOrThrow>>;

const COURSE_LIST_INCLUDE = {
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
} as const;

const COURSE_LIST_INCLUDE_WITH_TAGS = {
  ...COURSE_LIST_INCLUDE,
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
} as const;

export class CourseService {
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
    assertCanAssignTrainer(trainerUserId, requestUserId, roleCodes);

    await ensureTrainerExists(trainerUserId);

    if (data.categoryId) {
      await ensureCategoryExists(data.categoryId);
    }

    if (data.ownerDepartmentId) {
      await ensureDepartmentExists(data.ownerDepartmentId);
    }

    const status = data.status ?? 'draft';
    assertCanPublish(status, permissionCodes);
    if (status === 'published') {
      throw new AppError(
        'Course cannot be published during creation. Create the course first, then publish after adding content.',
        400,
      );
    }
    const slug = await generateUniqueSlug(data.title);

    const db = getDb();
    const created = await db.course.create({
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
      include: COURSE_LIST_INCLUDE,
    });

    return mapCourseListItem(created);
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

    const db = getDb();
    const [courses, total] = await Promise.all([
      db.course.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
        include: COURSE_LIST_INCLUDE,
      }),
      db.course.count({ where }),
    ]);

    return {
      data: courses.map((course: any) => mapCourseListItem(course)),
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
  static async findById(id: string, query: any = { expand: [] }) {
    // Parse expand parameter - already transformed by schema
    const expand: CourseExpand[] = Array.isArray(query.expand)
      ? (query.expand as CourseExpand[])
      : [];

    const course = await getCourseOrThrow(id, expand);

    return CourseService.mapCourseDetail(course, expand);
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
    const db = getDb();
    const existingCourse = await db.course.findUnique({
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
    assertCanAssignTrainer(nextTrainerUserId, userId, roleCodes);
    assertCanPublish(data.status, permissionCodes);

    if (data.trainerUserId) {
      await ensureTrainerExists(data.trainerUserId);
    }

    if (data.categoryId) {
      await ensureCategoryExists(data.categoryId);
    }

    if (data.ownerDepartmentId) {
      await ensureDepartmentExists(data.ownerDepartmentId);
    }

    const nextSlug =
      data.title && data.title !== existingCourse.title
        ? await generateUniqueSlug(data.title, id)
        : undefined;

    if (data.status === 'published') {
      await validatePublishEligibility(id);
    }

    const publishedAt = getPublishedAtUpdate(
      existingCourse.status,
      data.status,
      existingCourse.publishedAt,
    );

    const updated = await db.course.update({
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
      include: COURSE_LIST_INCLUDE,
    });

    return mapCourseListItem(updated);
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
    const db = getDb();
    const course = await db.course.findUnique({
      where: { id: BigInt(id) },
      include: COURSE_LIST_INCLUDE,
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

    assertCanPublish(status, permissionCodes);

    if (status === 'published') {
      await validatePublishEligibility(id);
    }

    const updated = await db.course.update({
      where: { id: BigInt(id) },
      data: {
        status,
        publishedAt: getPublishedAtUpdate(course.status, status, course.publishedAt),
      },
      include: COURSE_LIST_INCLUDE,
    });

    return mapCourseListItem(updated);
  }

  /**
   * Add tag to course
   */
  static async addTagToCourse(id: string, tagId: string, userId: string, roleCodes: string[]) {
    const db = getDb();
    const course = await db.course.findUnique({
      where: { id: BigInt(id) },
      include: COURSE_LIST_INCLUDE_WITH_TAGS,
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

    const tag = await db.tag.findUnique({
      where: { id: BigInt(tagId) },
    });

    if (!tag) {
      throw new AppError('Tag not found.', 404);
    }

    const existingCourseTag = await db.courseTag.findUnique({
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

    await db.courseTag.create({
      data: {
        courseId: BigInt(id),
        tagId: BigInt(tagId),
      },
    });

    const updatedCourse = await db.course.findUnique({
      where: { id: BigInt(id) },
      include: COURSE_LIST_INCLUDE_WITH_TAGS,
    });

    return {
      ...mapCourseListItem(updatedCourse),
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
    const db = getDb();
    const course = await db.course.findUnique({
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

    const existingCourseTag = await db.courseTag.findUnique({
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

    await db.courseTag.delete({
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
   * Delete a course
   */
  static async delete(id: string, userId: string, roleCodes: string[]) {
    const db = getDb();
    const course = await db.course.findUnique({
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

    await db.course.delete({
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
      query.expand && Array.isArray(query.expand) && query.expand.length > 0
        ? (query.expand as CourseExpand[])
        : DEFAULT_DETAIL_EXPANDS;
    const course = await getCourseOrThrow(id, expandItems);

    return CourseService.mapCourseDetail(course, expandItems);
  }

  private static mapCourseDetail(
    course: CourseEntity,
    expandItems: CourseExpand[] = [],
  ): CourseDetailResponse {
    const expands = normalizeExpand(expandItems);
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
        quizzes: Array.isArray(module.quizzes)
          ? module.quizzes.map((quiz: any) => ({
              id: quiz.id.toString(),
              title: quiz.title,
              description: quiz.description,
              totalQuestions: quiz._count.quizQuestions,
              passScorePercent: Number(quiz.passScorePercent),
              timeLimitMinutes: quiz.timeLimitMinutes,
              maxAttempts: quiz.maxAttempts,
              shuffleQuestions: quiz.shuffleQuestions,
              shuffleOptions: quiz.shuffleOptions,
              selectionMode: quiz.selectionMode,
              questionsToPull: quiz.questionsToPull,
              createdAt: quiz.createdAt,
              updatedAt: quiz.updatedAt,
            }))
          : [],
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

  // ---------------------------------------------------------------------------
  // Backward-compatible facade: re-expose module/lesson/resource operations so
  // existing callers using `CourseService.<methodName>` keep working without
  // having to update import sites. New code should prefer the granular
  // services directly.
  // ---------------------------------------------------------------------------

  static listModules = CourseModuleService.listModules;
  static createModule = CourseModuleService.createModule;
  static updateModule = CourseModuleService.updateModule;
  static deleteModule = CourseModuleService.deleteModule;
  static reorderModules = CourseModuleService.reorderModules;

  static listLessons = CourseLessonService.listLessons;
  static createLesson = CourseLessonService.createLesson;
  static updateLesson = CourseLessonService.updateLesson;
  static deleteLesson = CourseLessonService.deleteLesson;
  static reorderLessons = CourseLessonService.reorderLessons;

  static listLessonResources = CourseResourceService.listLessonResources;
  static createLessonResource = CourseResourceService.createLessonResource;
  static updateLessonResource = CourseResourceService.updateLessonResource;
  static deleteLessonResource = CourseResourceService.deleteLessonResource;
}

// Re-export granular services + helper types so callers can opt into them.
export { CourseLessonService, CourseModuleService, CourseResourceService };
export type {
  CourseLessonItem,
  CourseListItem,
  CourseModuleItem,
  CourseStatus,
  LessonResourceItem,
} from './course-helpers.service';
