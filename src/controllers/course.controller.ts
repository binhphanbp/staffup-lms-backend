import type { Response, NextFunction } from 'express';
import { CourseService } from '@/services/course.service';
import {
  catchAsync,
  sendSuccess,
  sendCreated,
  sendNoContent,
  getValidatedQuery,
  getValidatedParams,
} from '@/utils';
import type { AuthRequest } from '@/interfaces';
import type { CourseDetailQuery, CourseQuery } from '@/schemas/course.schema';
export class CourseController {
  /**
   * POST /api/v1/courses
   */
  static create = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const course = await CourseService.create(
      req.body,
      req.user!.userId,
      req.user!.roleCodes,
      req.user!.permissionCodes,
    );
    sendCreated(res, course, 'Course created successfully');
  });

  /**
   * GET /api/v1/courses
   */
  static findAll = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await CourseService.findAll(req.query as unknown as CourseQuery);
    sendSuccess(res, result, 'Courses retrieved successfully');
  });

  /**
   * GET /api/v1/courses/:id
   */
  static findById = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const query = getValidatedQuery(req, res);
    const params = getValidatedParams(req, res);
    const course = await CourseService.findById(params.id as string, query);
    sendSuccess(res, course, 'Course retrieved successfully');
  });

  /**
   * PATCH /api/v1/courses/:id
   */
  static update = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const course = await CourseService.update(
      req.params.id as string,
      req.body,
      req.user!.userId,
      req.user!.roleCodes,
      req.user!.permissionCodes,
    );
    sendSuccess(res, course, 'Course updated successfully');
  });

  /**
   * PATCH /api/v1/courses/:id/status
   */
  static updateStatus = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const course = await CourseService.updateStatus(
      req.params.id as string,
      req.body.status,
      req.user!.userId,
      req.user!.roleCodes,
      req.user!.permissionCodes,
    );
    sendSuccess(res, course, 'Course status updated successfully');
  });

  /**
   * POST /api/v1/courses/:id/tags
   */
  static addTag = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await CourseService.addTagToCourse(
      req.params.id as string,
      req.body.tagId as string,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendCreated(res, result, 'Tag added to course successfully');
  });

  /**
   * DELETE /api/v1/courses/:id/tags/:tagId
   */
  static removeTag = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await CourseService.removeTagFromCourse(
      req.params.id as string,
      req.params.tagId as string,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, result, 'Tag removed from course successfully');
  });

  /**
   * GET /api/v1/courses/:id/modules
   */
  static listModules = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await CourseService.listModules(req.params.id as string);
    sendSuccess(res, result, 'Course modules retrieved successfully');
  });

  /**
   * POST /api/v1/courses/:id/modules
   */
  static createModule = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await CourseService.createModule(
      req.params.id as string,
      req.body,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendCreated(res, result, 'Course module created successfully');
  });

  /**
   * PATCH /api/v1/courses/:id/modules/:moduleId
   */
  static updateModule = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await CourseService.updateModule(
      req.params.id as string,
      req.params.moduleId as string,
      req.body,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, result, 'Course module updated successfully');
  });

  /**
   * POST /api/v1/courses/:id/modules/reorder
   */
  static reorderModules = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const result = await CourseService.reorderModules(
        req.params.id as string,
        req.body.moduleOrders,
        req.user!.userId,
        req.user!.roleCodes,
      );
      sendSuccess(res, result, 'Course modules reordered successfully');
    },
  );

  /**
   * GET /api/v1/courses/:id/modules/:moduleId/lessons
   */
  static listLessons = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await CourseService.listLessons(
      req.params.id as string,
      req.params.moduleId as string,
    );
    sendSuccess(res, result, 'Module lessons retrieved successfully');
  });

  /**
   * POST /api/v1/courses/:id/modules/:moduleId/lessons
   */
  static createLesson = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await CourseService.createLesson(
      req.params.id as string,
      req.params.moduleId as string,
      req.body,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendCreated(res, result, 'Lesson created successfully');
  });

  /**
   * PATCH /api/v1/courses/:id/modules/:moduleId/lessons/:lessonId
   */
  static updateLesson = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await CourseService.updateLesson(
      req.params.id as string,
      req.params.moduleId as string,
      req.params.lessonId as string,
      req.body,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, result, 'Lesson updated successfully');
  });

  /**
   * POST /api/v1/courses/:id/modules/:moduleId/lessons/reorder
   */
  static reorderLessons = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const result = await CourseService.reorderLessons(
        req.params.id as string,
        req.params.moduleId as string,
        req.body.lessonOrders,
        req.user!.userId,
        req.user!.roleCodes,
      );
      sendSuccess(res, result, 'Module lessons reordered successfully');
    },
  );

  /**
   * GET /api/v1/courses/:id/modules/:moduleId/lessons/:lessonId/resources
   */
  static listLessonResources = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const result = await CourseService.listLessonResources(
        req.params.id as string,
        req.params.moduleId as string,
        req.params.lessonId as string,
      );
      sendSuccess(res, result, 'Lesson resources retrieved successfully');
    },
  );

  /**
   * POST /api/v1/courses/:id/modules/:moduleId/lessons/:lessonId/resources
   */
  static createLessonResource = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const result = await CourseService.createLessonResource(
        req.params.id as string,
        req.params.moduleId as string,
        req.params.lessonId as string,
        req.body,
        req.user!.userId,
        req.user!.roleCodes,
      );
      sendCreated(res, result, 'Lesson resource created successfully');
    },
  );

  /**
   * PATCH /api/v1/courses/:id/modules/:moduleId/lessons/:lessonId/resources/:resourceId
   */
  static updateLessonResource = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const result = await CourseService.updateLessonResource(
        req.params.id as string,
        req.params.moduleId as string,
        req.params.lessonId as string,
        req.params.resourceId as string,
        req.body,
        req.user!.userId,
        req.user!.roleCodes,
      );
      sendSuccess(res, result, 'Lesson resource updated successfully');
    },
  );

  /**
   * DELETE /api/v1/courses/:id/modules/:moduleId/lessons/:lessonId/resources/:resourceId
   */
  static deleteLessonResource = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const result = await CourseService.deleteLessonResource(
        req.params.id as string,
        req.params.moduleId as string,
        req.params.lessonId as string,
        req.params.resourceId as string,
        req.user!.userId,
        req.user!.roleCodes,
      );
      sendSuccess(res, result, 'Lesson resource deleted successfully');
    },
  );

  /**
   * DELETE /api/v1/courses/:id/modules/:moduleId/lessons/:lessonId
   */
  static deleteLesson = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await CourseService.deleteLesson(
      req.params.id as string,
      req.params.moduleId as string,
      req.params.lessonId as string,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, result, 'Lesson deleted successfully');
  });

  /**
   * DELETE /api/v1/courses/:id/modules/:moduleId
   */
  static deleteModule = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await CourseService.deleteModule(
      req.params.id as string,
      req.params.moduleId as string,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, result, 'Course module deleted successfully');
  });

  /**
   * DELETE /api/v1/courses/:id
   */
  static delete = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    await CourseService.delete(req.params.id as string, req.user!.userId, req.user!.roleCodes);
    sendNoContent(res);
  });
  /**
   * GET /api/v1/courses/:id/detail
   */
  static getCourseDetail = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const course = await CourseService.getCourseDetail(
        req.params.id as string,
        req.query as unknown as CourseDetailQuery,
      );
      sendSuccess(res, course, 'Course detail retrieved successfully');
    },
  );
}
