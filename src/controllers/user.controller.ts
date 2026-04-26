import type { Response, Request } from 'express';
import { UserService } from '@/services/user.service';
import { AppError, catchAsync, sendSuccess, sendCreated, sendNoContent } from '@/utils';
import type { AuthRequest } from '@/interfaces';
import type { ListUsersQuery } from '@/schemas/user.schema';

export class UserController {
  static listUsers = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await UserService.listUsers(req.query as unknown as ListUsersQuery);
    sendSuccess(res, result, 'Users retrieved successfully');
  });

  static getUser = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await UserService.getUser(String(req.params.id));
    sendSuccess(res, result, 'User retrieved successfully');
  });

  static createUser = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await UserService.createUser(req.body);
    sendCreated(res, result, 'User created successfully');
  });

  static updateUser = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await UserService.updateUser(String(req.params.id), req.body);
    sendSuccess(res, result, 'User updated successfully');
  });

  static deleteUser = catchAsync(async (req: AuthRequest, res: Response) => {
    await UserService.deleteUser(String(req.params.id));
    sendNoContent(res);
  });

  static importUsers = catchAsync(async (req: AuthRequest & Request, res: Response) => {
    if (!req.file) {
      throw new AppError('Excel file is required. Use form-data field "file".', 400);
    }

    const importedByUserId = req.user?.userId;

    if (!importedByUserId) {
      throw new AppError('You are not logged in.', 401);
    }

    const result = await UserService.importUsersFromExcel(req.file.buffer, importedByUserId);
    sendCreated(res, result, 'User import completed');
  });
}
