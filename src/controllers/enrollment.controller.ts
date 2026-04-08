import type { Response } from 'express';
import { EnrollmentService } from '@/services/enrollment.service';
import { catchAsync, sendSuccess, sendCreated } from '@/utils';
import type { AuthRequest } from '@/interfaces';

export class EnrollmentController {
  static getEnrollmentDetail = catchAsync(async (req: AuthRequest, res: Response) => {
    const enrollmentId = req.params.id as string;
    const userId = req.user!.userId;
    const enrollment = await EnrollmentService.getEnrollmentDetail(enrollmentId, userId);
    sendSuccess(res, enrollment, 'Enrollment detail retrieved successfully');
  });

  static enrollUsers = catchAsync(async (req: AuthRequest, res: Response) => {
    const courseId = req.params.courseId as string;
    const result = await EnrollmentService.enrollUsers(
      courseId,
      req.body,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendCreated(res, result, 'Users enrolled successfully');
  });
}
