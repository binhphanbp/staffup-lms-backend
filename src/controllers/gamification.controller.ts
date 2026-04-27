import type { Response } from 'express';
import type { AuthRequest } from '@/interfaces';
import * as gamificationService from '@/services/gamification.service';
import { AppError, catchAsync, sendSuccess } from '@/utils';

const requireUserId = (req: AuthRequest): string => {
  if (!req.user?.userId) throw new AppError('Authentication required', 401);
  return req.user.userId;
};

export const getMyStats = catchAsync(async (req: AuthRequest, res: Response) => {
  const stats = await gamificationService.getUserStats(requireUserId(req));
  sendSuccess(res, stats, 'Gamification stats loaded');
});

export const getMyBadges = catchAsync(async (req: AuthRequest, res: Response) => {
  const badges = await gamificationService.listUserBadges(requireUserId(req));
  sendSuccess(res, badges, 'Badges loaded');
});

export const getMyXpTransactions = catchAsync(async (req: AuthRequest, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const txs = await gamificationService.listXpTransactions(requireUserId(req), limit);
  sendSuccess(res, txs, 'XP history loaded');
});

export const getLeaderboard = catchAsync(async (req: AuthRequest, res: Response) => {
  const scope = (req.query.scope as 'global' | 'department' | undefined) ?? 'global';
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const departmentId =
    scope === 'department'
      ? ((req.query.departmentId as string | undefined) ?? req.user?.departmentId ?? null)
      : null;
  const entries = await gamificationService.getLeaderboard({ scope, departmentId, limit });
  sendSuccess(res, entries, 'Leaderboard loaded');
});
