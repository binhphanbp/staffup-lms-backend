import type { Response, NextFunction } from 'express';
import { CourseService } from '@/services/course.service';
import { catchAsync, sendSuccess, sendCreated, sendNoContent } from '@/utils';
import type { AuthRequest } from '@/interfaces';
import type { CourseQuery } from '@/schemas/course.schema';
export class CourseController {
  /**
   * POST /api/v1/courses
   */
  static create = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const course = await CourseService.create(req.body, req.user!.userId);
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
    const course = await CourseService.findById(req.params.id as string);
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
    );
    sendSuccess(res, course, 'Course updated successfully');
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
      const course = await CourseService.getCourseDetail(req.params.id as string);
      sendSuccess(res, course, 'Course detail retrieved successfully');
    },
  );
}
