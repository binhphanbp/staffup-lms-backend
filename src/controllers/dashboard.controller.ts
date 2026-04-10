import type { Request, Response } from 'express';
import { DashboardService } from '@/services/dashboard.service';
import * as aiInsightsService from '@/services/ai-insights.service';
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

  // ========================
  // AI Insights
  // ========================

  /**
   * GET /api/v1/dashboard/ai-insights
   * Returns AI-generated insights scoped to the user's role.
   * - Admin: system-wide insights
   * - Manager: department-scoped insights
   * - Trainer: course-scoped insights
   *
   * Query params:
   * - refresh=true → bypass cache and force regeneration
   */
  static getAiInsights = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const roleCodes: string[] = user.roleCodes || [];
    const forceRefresh = req.query['refresh'] === 'true';

    let result;

    if (roleCodes.includes('admin')) {
      result = await aiInsightsService.generateAdminInsights(forceRefresh);
    } else if (roleCodes.includes('manager')) {
      const departmentId = user.departmentId;
      if (!departmentId) {
        return sendSuccess(
          res,
          { insights: [], generatedAt: new Date().toISOString(), cached: false, scope: 'manager' },
          'Không tìm thấy phòng ban. Vui lòng liên hệ quản trị viên.',
        );
      }
      result = await aiInsightsService.generateManagerInsights(departmentId, forceRefresh);
    } else if (roleCodes.includes('trainer')) {
      const trainerId = user.userId;
      result = await aiInsightsService.generateTrainerInsights(trainerId, forceRefresh);
    } else {
      return sendSuccess(
        res,
        { insights: [], generatedAt: new Date().toISOString(), cached: false, scope: 'admin' },
        'AI Insights chưa hỗ trợ role này.',
      );
    }

    sendSuccess(res, result, 'AI Insights retrieved successfully');
  });
}
