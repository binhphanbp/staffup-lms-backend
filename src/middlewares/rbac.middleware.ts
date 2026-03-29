import type { Response, NextFunction } from 'express';
import { AppError } from '@/utils';
import type { AuthRequest } from '@/interfaces';

/**
 * RBAC middleware factory — restricts route access to specific roles.
 *
 * @example
 * router.delete('/courses/:id', authenticate, restrictTo('admin', 'trainer'), deleteHandler);
 */
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('You are not logged in.', 401));
    }

    const hasMatchingRole = req.user.roleCodes.some((roleCode) => roles.includes(roleCode));

    if (!hasMatchingRole) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};
