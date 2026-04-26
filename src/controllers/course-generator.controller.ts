import type { Response, NextFunction } from 'express';
import { CourseGeneratorService } from '@/services/course-generator.service';
import { catchAsync, sendSuccess, sendCreated } from '@/utils';
import type { AuthRequest } from '@/interfaces';

export class CourseGeneratorController {
  static generateOutline = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const result = await CourseGeneratorService.generateOutline(req.body);
      sendSuccess(res, result, 'AI course outline generated successfully');
    },
  );

  static generateLessonContent = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const result = await CourseGeneratorService.generateLessonContent(req.body);
      sendSuccess(res, result, 'AI lesson content generated successfully');
    },
  );

  static save = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await CourseGeneratorService.saveFromOutline(req.body, req.user!.userId);
    sendCreated(res, result, 'Course created from AI outline');
  });
}
