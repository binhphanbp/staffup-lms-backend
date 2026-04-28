import type {
  CreateCourseLessonInput,
  ReorderCourseLessonsInput,
  UpdateCourseLessonInput,
} from '@/schemas/course.schema';
import { AppError } from '@/utils';
import {
  assertLessonContentRequirement,
  assertLessonOrderIndexAvailable,
  getCourseModuleOrThrow,
  getDb,
  getLessonInModuleOrThrow,
  getOwnedCourseOrThrow,
  mapCourseLessonItem,
} from './course-helpers.service';

export class CourseLessonService {
  /**
   * List module lessons
   */
  static async listLessons(courseId: string, moduleId: string) {
    await getCourseModuleOrThrow(courseId, moduleId);

    const db = getDb();
    const lessons = await db.lesson.findMany({
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

    return lessons.map((lesson: any) => mapCourseLessonItem(lesson));
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
    await getOwnedCourseOrThrow(courseId, userId, roleCodes);
    await getCourseModuleOrThrow(courseId, moduleId);
    await assertLessonOrderIndexAvailable(moduleId, data.orderIndex);
    assertLessonContentRequirement(data.lessonType, {
      contentText: data.contentText,
      videoUrl: data.videoUrl,
    });

    const db = getDb();
    const lesson = await db.lesson.create({
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

    return mapCourseLessonItem(lesson);
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
    await getOwnedCourseOrThrow(courseId, userId, roleCodes);
    const lesson = await getLessonInModuleOrThrow(courseId, moduleId, lessonId);

    if (data.orderIndex !== undefined) {
      await assertLessonOrderIndexAvailable(moduleId, data.orderIndex, lessonId);
    }

    const nextLessonType = data.lessonType ?? lesson.lessonType;
    assertLessonContentRequirement(nextLessonType, {
      contentText: data.contentText ?? lesson.contentText,
      videoUrl: data.videoUrl ?? lesson.videoUrl,
    });

    const db = getDb();
    const updatedLesson = await db.lesson.update({
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

    return mapCourseLessonItem(updatedLesson);
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
    await getOwnedCourseOrThrow(courseId, userId, roleCodes);
    const lesson = await getLessonInModuleOrThrow(courseId, moduleId, lessonId);

    if (lesson._count.resources > 0 || lesson._count.progress > 0 || lesson.quiz) {
      throw new AppError(
        'Cannot delete lesson because it is linked to resources, learner progress, or a quiz.',
        400,
      );
    }

    const db = getDb();
    await db.lesson.delete({
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
    await getOwnedCourseOrThrow(courseId, userId, roleCodes);
    await getCourseModuleOrThrow(courseId, moduleId);

    const db = getDb();
    const lessons = await db.lesson.findMany({
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

    await db.$transaction(async (tx: any) => {
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

    const reorderedLessons = await db.lesson.findMany({
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

    return reorderedLessons.map((lesson: any) => mapCourseLessonItem(lesson));
  }
}
