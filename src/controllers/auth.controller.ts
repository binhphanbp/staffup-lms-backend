import type { Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { catchAsync, sendSuccess, sendCreated } from '@/utils';
import type { AuthRequest } from '@/interfaces';

export class AuthController {
  static register = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await AuthService.register(req.body);
    sendCreated(res, result, 'User registered successfully');
  });

  static login = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await AuthService.login(req.body);
    sendSuccess(res, result, 'Login successful');
  });

  static getProfile = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const user = await AuthService.getProfile(req.user!.userId);
    sendSuccess(res, user, 'Profile retrieved successfully');
  });

  static updateStatus = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { isActive } = req.body;
    const result = await AuthService.updateUserStatus(id as string, isActive);
    sendSuccess(res, result, 'User status updated successfully');
  });
}
