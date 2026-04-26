import type { Request, Response } from 'express';
import { logger } from '@/config/logger';
import { DashboardService } from '@/services/dashboard.service';
import * as aiInsightsService from '@/services/ai-insights.service';
import { catchAsync, sendSuccess } from '@/utils';

export class DashboardController {
  static getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
    const stats = await DashboardService.getDashboardStats();
    sendSuccess(res, stats, 'Dashboard statistics retrieved successfully');
  });

  static getManagerDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const departmentId = BigInt(user.departmentId);

    const stats = await DashboardService.getManagerDashboardStats(departmentId);
    sendSuccess(res, stats, 'Manager dashboard statistics retrieved successfully');
  });

  static getTrainerDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const trainerId = BigInt(user.userId);

    const stats = await DashboardService.getTrainerDashboardStats(trainerId);
    sendSuccess(res, stats, 'Trainer dashboard statistics retrieved successfully');
  });

  static getEmployeeDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const userId = BigInt(user.userId);

    const stats = await DashboardService.getEmployeeDashboardStats(userId);
    sendSuccess(res, stats, 'Employee dashboard statistics retrieved successfully');
  });

  static getAiInsights = catchAsync(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const roleCodes: string[] = user.roleCodes || [];
    const forceRefresh = req.query['refresh'] === 'true';

    try {
      let result;

      if (roleCodes.includes('admin')) {
        result = await aiInsightsService.generateAdminInsights(forceRefresh);
      } else if (roleCodes.includes('manager')) {
        if (!user.departmentId) {
          return sendSuccess(
            res,
            {
              insights: [],
              generatedAt: new Date().toISOString(),
              cached: false,
              scope: 'manager',
            },
            'Khong tim thay phong ban cho tai khoan nay.',
          );
        }

        result = await aiInsightsService.generateManagerInsights(
          BigInt(user.departmentId),
          forceRefresh,
        );
      } else if (roleCodes.includes('trainer')) {
        result = await aiInsightsService.generateTrainerInsights(BigInt(user.userId), forceRefresh);
      } else {
        return sendSuccess(
          res,
          { insights: [], generatedAt: new Date().toISOString(), cached: false, scope: 'admin' },
          'AI insights chua ho tro role nay.',
        );
      }

      sendSuccess(res, result, 'AI insights retrieved successfully');
    } catch (error) {
      logger.error(
        `AI insights fallback triggered: ${error instanceof Error ? error.message : String(error)}`,
      );

      sendSuccess(
        res,
        {
          insights: [
            {
              type: 'info',
              title: 'AI insights tam thoi khong kha dung',
              description: 'He thong khong tao duoc phan tich AI trong luc nay.',
              suggestion: 'Thu tai lai sau hoac kiem tra cau hinh AI backend.',
            },
          ],
          generatedAt: new Date().toISOString(),
          cached: false,
          scope: roleCodes.includes('manager')
            ? 'manager'
            : roleCodes.includes('trainer')
              ? 'trainer'
              : 'admin',
        },
        'AI insights fallback response returned',
      );
    }
  });
}
