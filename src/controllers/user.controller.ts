import type { Response } from 'express';
import { UserService } from '@/services/user.service';
import { catchAsync, sendSuccess, sendCreated } from '@/utils';
import type { AuthRequest } from '@/interfaces';

export class UserController {
  static listUsers = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await UserService.listUsers(req.query as any);
    sendSuccess(res, result, 'Users retrieved successfully');
  });

  static getUser = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await UserService.getUser(req.params.id);
    sendSuccess(res, result, 'User retrieved successfully');
  });

  static createUser = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await UserService.createUser(req.body);
    sendCreated(res, result, 'User created successfully');
  });

  static updateUser = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await UserService.updateUser(req.params.id, req.body);
    sendSuccess(res, result, 'User updated successfully');
  });
}
