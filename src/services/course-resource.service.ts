import type { CreateLessonResourceInput, UpdateLessonResourceInput } from '@/schemas/course.schema';
import {
  assertLessonResourceOrderIndexAvailable,
  getDb,
  getLessonInModuleOrThrow,
  getNextLessonResourceOrderIndex,
  getOwnedCourseOrThrow,
  getResourceInLessonOrThrow,
  mapLessonResourceItem,
} from './course-helpers.service';

export class CourseResourceService {
  /**
   * List lesson resources
   */
  static async listLessonResources(courseId: string, moduleId: string, lessonId: string) {
    await getLessonInModuleOrThrow(courseId, moduleId, lessonId);

    const db = getDb();
    const resources = await db.lessonResource.findMany({
      where: { lessonId: BigInt(lessonId) },
      orderBy: { orderIndex: 'asc' },
    });

    return resources.map((resource: any) => mapLessonResourceItem(resource));
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
    await getOwnedCourseOrThrow(courseId, userId, roleCodes);
    await getLessonInModuleOrThrow(courseId, moduleId, lessonId);

    const orderIndex = data.orderIndex ?? (await getNextLessonResourceOrderIndex(lessonId));
    await assertLessonResourceOrderIndexAvailable(lessonId, orderIndex);

    const db = getDb();
    const resource = await db.lessonResource.create({
      data: {
        lessonId: BigInt(lessonId),
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        resourceType: data.resourceType ?? null,
        orderIndex,
      },
    });

    return mapLessonResourceItem(resource);
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
    await getOwnedCourseOrThrow(courseId, userId, roleCodes);
    await getResourceInLessonOrThrow(courseId, moduleId, lessonId, resourceId);

    if (data.orderIndex !== undefined) {
      await assertLessonResourceOrderIndexAvailable(lessonId, data.orderIndex, resourceId);
    }

    const db = getDb();
    const updatedResource = await db.lessonResource.update({
      where: { id: BigInt(resourceId) },
      data: {
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        resourceType: data.resourceType,
        orderIndex: data.orderIndex,
      },
    });

    return mapLessonResourceItem(updatedResource);
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
    await getOwnedCourseOrThrow(courseId, userId, roleCodes);
    await getResourceInLessonOrThrow(courseId, moduleId, lessonId, resourceId);

    const db = getDb();
    await db.lessonResource.delete({
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
}
