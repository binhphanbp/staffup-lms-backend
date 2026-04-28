import { prisma } from '@/config/database';
import type { CourseExpand } from '@/interfaces/course.types';
import { assertPolicy, canAccessOwnedResource } from '@/policies';
import { AppError, slugify } from '@/utils';

export type CourseStatus = 'draft' | 'published' | 'archived';

export interface CourseListItem {
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

export interface CourseModuleItem {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  lessonsCount: number;
}

export interface CourseLessonItem {
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

export interface LessonResourceItem {
  id: string;
  lessonId: string;
  fileName: string;
  fileUrl: string;
  resourceType: 'file' | 'video' | 'material' | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_DETAIL_EXPANDS: CourseExpand[] = ['all'];

export function getDb() {
  return prisma as any;
}

export function isAdmin(roleCodes: string[]) {
  return roleCodes.includes('admin');
}

export function assertCanAssignTrainer(
  requestedTrainerUserId: string | undefined,
  actorUserId: string,
  roleCodes: string[],
) {
  if (!requestedTrainerUserId || requestedTrainerUserId === actorUserId) {
    return;
  }

  if (!isAdmin(roleCodes)) {
    throw new AppError('Only admin can assign a different trainer to a course.', 403);
  }
}

export function assertCanPublish(status: CourseStatus | undefined, permissionCodes: string[]) {
  if (status !== 'published') {
    return;
  }

  if (!permissionCodes.includes('course.publish')) {
    throw new AppError('You do not have permission to publish courses.', 403);
  }
}

export async function ensureTrainerExists(trainerUserId: string) {
  const db = getDb();
  const trainer = await db.user.findUnique({
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

export async function ensureCategoryExists(categoryId: string) {
  const db = getDb();
  const category = await db.category.findUnique({
    where: { id: BigInt(categoryId) },
  });

  if (!category) {
    throw new AppError('Category not found.', 404);
  }
}

export async function ensureDepartmentExists(ownerDepartmentId: string) {
  const db = getDb();
  const department = await db.department.findUnique({
    where: { id: BigInt(ownerDepartmentId) },
  });

  if (!department) {
    throw new AppError('Department not found.', 404);
  }
}

export async function generateUniqueSlug(title: string, excludeCourseId?: string) {
  const db = getDb();
  const baseSlug = slugify(title);
  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await db.course.findUnique({
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

export function getPublishedAtUpdate(
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

export async function validatePublishEligibility(courseId: string) {
  const db = getDb();
  const course = await db.course.findUnique({
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

export function mapCourseListItem(course: any): CourseListItem {
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

export function mapCourseModuleItem(module: any): CourseModuleItem {
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

export function mapCourseLessonItem(lesson: any): CourseLessonItem {
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

export function mapLessonResourceItem(resource: any): LessonResourceItem {
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

export function normalizeExpand(expandItems: CourseExpand[] = []) {
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

export function buildCourseInclude(expands: Set<CourseExpand>) {
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
      include: {
        ...(expands.has('lessons')
          ? {
              lessons: {
                orderBy: { orderIndex: 'asc' },
                include: lessonInclude,
              },
            }
          : {}),
        // Include quizzes directly linked to modules
        quizzes: {
          select: {
            id: true,
            title: true,
            description: true,
            passScorePercent: true,
            timeLimitMinutes: true,
            maxAttempts: true,
            shuffleQuestions: true,
            shuffleOptions: true,
            selectionMode: true,
            questionsToPull: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                quizQuestions: true,
              },
            },
          },
        },
      },
    };
  }

  return include;
}

export async function getCourseOrThrow(id: string, expandItems: CourseExpand[] = []) {
  const db = getDb();
  const expands = normalizeExpand(expandItems);
  const course = await db.course.findUnique({
    where: { id: BigInt(id) },
    include: buildCourseInclude(expands),
  });

  if (!course) {
    throw new AppError('Course not found.', 404);
  }

  return course;
}

export async function getOwnedCourseOrThrow(id: string, userId: string, roleCodes: string[]) {
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

  return course;
}

export async function assertModuleOrderIndexAvailable(
  courseId: string,
  orderIndex: number,
  excludeModuleId?: string,
) {
  const db = getDb();
  const existingModule = await db.module.findUnique({
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

export async function getCourseModuleOrThrow(courseId: string, moduleId: string) {
  const db = getDb();
  const module = await db.module.findUnique({
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

export async function assertLessonOrderIndexAvailable(
  moduleId: string,
  orderIndex: number,
  excludeLessonId?: string,
) {
  const db = getDb();
  const existingLesson = await db.lesson.findUnique({
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

export function assertLessonContentRequirement(
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

export async function getLessonInModuleOrThrow(
  courseId: string,
  moduleId: string,
  lessonId: string,
) {
  const db = getDb();
  await getCourseModuleOrThrow(courseId, moduleId);

  const lesson = await db.lesson.findUnique({
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

export async function getResourceInLessonOrThrow(
  courseId: string,
  moduleId: string,
  lessonId: string,
  resourceId: string,
) {
  const db = getDb();
  await getLessonInModuleOrThrow(courseId, moduleId, lessonId);

  const resource = await db.lessonResource.findUnique({
    where: { id: BigInt(resourceId) },
  });

  if (!resource || resource.lessonId.toString() !== lessonId) {
    throw new AppError('Resource not found in this lesson.', 404);
  }

  return resource;
}

export async function assertLessonResourceOrderIndexAvailable(
  lessonId: string,
  orderIndex: number,
  excludeResourceId?: string,
) {
  const db = getDb();
  const existingResource = await db.lessonResource.findUnique({
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

export async function getNextLessonResourceOrderIndex(lessonId: string) {
  const db = getDb();
  const lastResource = await db.lessonResource.findFirst({
    where: { lessonId: BigInt(lessonId) },
    orderBy: { orderIndex: 'desc' },
    select: {
      orderIndex: true,
    },
  });

  return (lastResource?.orderIndex ?? 0) + 1;
}
