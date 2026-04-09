import type { NextFunction, Request, Response } from 'express';
import { PermissionService } from '@/services/permission.service';
import { catchAsync, sendCreated, sendNoContent, sendSuccess } from '@/utils';
import type { PermissionListQuery } from '@/schemas/permission.schema';

export class PermissionController {
  static getPermissions = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const permissions = await PermissionService.getPermissions(
      req.query as unknown as PermissionListQuery,
    );
    sendSuccess(res, permissions, 'Permissions retrieved successfully');
  });

  static getPermission = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const permission = await PermissionService.getPermissionById(req.params.id as string);
    sendSuccess(res, permission, 'Permission retrieved successfully');
  });

  static createPermission = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const permission = await PermissionService.createPermission(req.body);
    sendCreated(res, permission, 'Permission created successfully');
  });

  static updatePermission = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const permission = await PermissionService.updatePermission(req.params.id as string, req.body);
    sendSuccess(res, permission, 'Permission updated successfully');
  });

  static deletePermission = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    await PermissionService.deletePermission(req.params.id as string);
    sendNoContent(res);
  });
}
