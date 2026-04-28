import type {
  CreateCourseModuleInput,
  ReorderCourseModulesInput,
  UpdateCourseModuleInput,
} from '@/schemas/course.schema';
import { AppError } from '@/utils';
import {
  assertModuleOrderIndexAvailable,
  getCourseModuleOrThrow,
  getCourseOrThrow,
  getDb,
  getOwnedCourseOrThrow,
  mapCourseModuleItem,
} from './course-helpers.service';

export class CourseModuleService {
  /**
   * List course modules
   */
  static async listModules(courseId: string) {
    await getCourseOrThrow(courseId);

    const db = getDb();
    const modules = await db.module.findMany({
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

    return modules.map((module: any) => mapCourseModuleItem(module));
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
    await getOwnedCourseOrThrow(courseId, userId, roleCodes);
    await assertModuleOrderIndexAvailable(courseId, data.orderIndex);

    const db = getDb();
    const module = await db.module.create({
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

    return mapCourseModuleItem(module);
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
    await getOwnedCourseOrThrow(courseId, userId, roleCodes);
    await getCourseModuleOrThrow(courseId, moduleId);

    if (data.orderIndex !== undefined) {
      await assertModuleOrderIndexAvailable(courseId, data.orderIndex, moduleId);
    }

    const db = getDb();
    const updatedModule = await db.module.update({
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

    return mapCourseModuleItem(updatedModule);
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
    await getOwnedCourseOrThrow(courseId, userId, roleCodes);
    const module = await getCourseModuleOrThrow(courseId, moduleId);

    if (module._count.lessons > 0) {
      throw new AppError('Cannot delete module because it already contains lessons.', 400);
    }

    const db = getDb();
    await db.module.delete({
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
    await getOwnedCourseOrThrow(courseId, userId, roleCodes);

    const db = getDb();
    const modules = await db.module.findMany({
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

    await db.$transaction(async (tx: any) => {
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

    const reorderedModules = await db.module.findMany({
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

    return reorderedModules.map((module: any) => mapCourseModuleItem(module));
  }
}
