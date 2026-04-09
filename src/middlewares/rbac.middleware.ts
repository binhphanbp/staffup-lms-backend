import type { NextFunction, Response } from 'express';
import { AppError } from '@/utils';
import type { AuthRequest } from '@/interfaces';

type PermissionMatchMode = 'any' | 'all';

interface PermissionGuardOptions {
  match?: PermissionMatchMode;
}

const ensureAuthenticatedUser = (req: AuthRequest) => {
  if (!req.user) {
    throw new AppError('You are not logged in.', 401);
  }

  return req.user;
};

export const hasRole = (req: AuthRequest, ...roles: string[]) => {
  const user = ensureAuthenticatedUser(req);
  return roles.some((role) => user.roleCodes.includes(role));
};

export const hasPermission = (
  req: AuthRequest,
  permissions: string[],
  options: PermissionGuardOptions = {},
) => {
  const user = ensureAuthenticatedUser(req);
  const match = options.match ?? 'any';

  if (permissions.length === 0) {
    return true;
  }

  if (match === 'all') {
    return permissions.every((permission) => user.permissionCodes.includes(permission));
  }

  return permissions.some((permission) => user.permissionCodes.includes(permission));
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!hasRole(req, ...roles)) {
        return next(new AppError('You do not have permission to perform this action.', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requirePermission = (
  permissions: string | string[],
  options: PermissionGuardOptions = {},
) => {
  const normalizedPermissions = Array.isArray(permissions) ? permissions : [permissions];

  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    try {
      if (!hasPermission(req, normalizedPermissions, options)) {
        return next(new AppError('You do not have permission to perform this action.', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Backward-compatible alias for existing routes.
export const restrictTo = requireRole;
