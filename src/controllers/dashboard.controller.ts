import type { Request, Response } from 'express';
import { DashboardService } from '@/services/dashboard.service';
import { catchAsync, sendSuccess } from '@/utils';

export class DashboardController {
  static getDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await DashboardService.getDashboardStats();
    sendSuccess(res, stats, 'Dashboard statistics retrieved successfully');
  });

  static getManagerDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const departmentId = user.departmentId;

    const stats = await DashboardService.getManagerDashboardStats(departmentId);
    sendSuccess(res, stats, 'Manager dashboard statistics retrieved successfully');
  });

  static getTrainerDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const trainerId = user.userId;

    const stats = await DashboardService.getTrainerDashboardStats(trainerId);
    sendSuccess(res, stats, 'Trainer dashboard statistics retrieved successfully');
  });

  static getEmployeeDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const userId = user.userId;

    const stats = await DashboardService.getEmployeeDashboardStats(userId);
    sendSuccess(res, stats, 'Employee dashboard statistics retrieved successfully');
  });
}
