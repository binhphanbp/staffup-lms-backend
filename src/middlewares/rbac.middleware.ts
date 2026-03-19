import type { Response, NextFunction } from 'express';
import type { Role } from '@prisma/client';
import { AppError } from '@/utils';
import type { AuthRequest } from '@/interfaces';

/**
 * RBAC middleware factory — restricts route access to specific roles.
 *
 * @example
 * router.delete('/courses/:id', authenticate, restrictTo('ADMIN', 'INSTRUCTOR'), deleteHandler);
 */
export const restrictTo = (...roles: Role[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('You are not logged in.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};
