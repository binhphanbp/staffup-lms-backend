import type { Response } from 'express';
import { EnrollmentService } from '@/services/enrollment.service';
import { catchAsync, sendSuccess, sendCreated } from '@/utils';
import type { AuthRequest } from '@/interfaces';

export class EnrollmentController {
  static getEnrollmentDetail = catchAsync(async (req: AuthRequest, res: Response) => {
    const enrollment = await EnrollmentService.getEnrollmentDetail(
      req.params.id as string,
      req.user!.userId,
    );
    sendSuccess(res, enrollment, 'Enrollment detail retrieved successfully');
  });

  static enrollUsers = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await EnrollmentService.enrollUsers(
      req.params.courseId as string,
      req.body,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendCreated(res, result, 'Users enrolled successfully');
  });

  static listEnrollments = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await EnrollmentService.listEnrollments(
      req.query as any,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, result, 'Enrollments retrieved successfully');
  });

  static updateStatus = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await EnrollmentService.updateEnrollmentStatus(
      req.params.id as string,
      req.body,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, result, 'Enrollment status updated successfully');
  });
}
