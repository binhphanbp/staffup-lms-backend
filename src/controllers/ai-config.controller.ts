import type { Response } from 'express';
import type { AuthRequest } from '@/interfaces';
import * as aiConfigService from '@/services/ai-config.service';
import { catchAsync, sendSuccess } from '@/utils';

export const getConfig = catchAsync(async (_req: AuthRequest, res: Response) => {
  const config = await aiConfigService.getAdminConfig();
  sendSuccess(res, config, 'AI configuration loaded successfully');
});

export const updateConfig = catchAsync(async (req: AuthRequest, res: Response) => {
  const updatedBy = req.user?.userId ? BigInt(req.user.userId) : null;
  const config = await aiConfigService.updateAdminConfig(req.body, updatedBy);
  sendSuccess(res, config, 'AI configuration updated successfully');
});

export const resetConfig = catchAsync(async (req: AuthRequest, res: Response) => {
  const updatedBy = req.user?.userId ? BigInt(req.user.userId) : null;
  const config = await aiConfigService.resetAdminConfig(updatedBy);
  sendSuccess(res, config, 'AI configuration reset to defaults');
});
