import type { NextFunction, Request, Response } from 'express';
import { RoleService } from '@/services/role.service';
import { catchAsync, sendCreated, sendNoContent, sendSuccess } from '@/utils';
import type { RoleListQuery } from '@/schemas/role.schema';

export class RoleController {
  static getRoles = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const roles = await RoleService.getRoles(req.query as unknown as RoleListQuery);
    sendSuccess(res, roles, 'Roles retrieved successfully');
  });

  static getRole = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const role = await RoleService.getRoleById(req.params.id as string);
    sendSuccess(res, role, 'Role retrieved successfully');
  });

  static createRole = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const role = await RoleService.createRole(req.body);
    sendCreated(res, role, 'Role created successfully');
  });

  static updateRole = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const role = await RoleService.updateRole(req.params.id as string, req.body);
    sendSuccess(res, role, 'Role updated successfully');
  });

  static deleteRole = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    await RoleService.deleteRole(req.params.id as string);
    sendNoContent(res);
  });
}
