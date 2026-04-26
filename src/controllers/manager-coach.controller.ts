import type { Response } from 'express';
import type { AuthRequest } from '@/interfaces';
import * as managerCoachService from '@/services/manager-coach.service';
import { catchAsync, sendSuccess } from '@/utils';

const getDepartmentId = (req: AuthRequest): bigint => BigInt(req.user!.departmentId!);

export const getTeamOverview = catchAsync(async (req: AuthRequest, res: Response) => {
  const overview = await managerCoachService.getTeamOverview(getDepartmentId(req));
  sendSuccess(res, overview, 'Manager Coach team overview retrieved successfully');
});

export const chat = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await managerCoachService.chat(
    getDepartmentId(req),
    req.body.message,
    req.body.history ?? [],
  );

  sendSuccess(res, result, 'Manager Coach response generated successfully');
});

export const generateWeeklyBriefing = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await managerCoachService.generateWeeklyBriefing(
    getDepartmentId(req),
    req.body.focus,
  );

  sendSuccess(res, result, 'Manager Coach weekly briefing generated successfully');
});
