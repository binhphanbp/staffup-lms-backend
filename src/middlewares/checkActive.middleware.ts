import type { Response, NextFunction } from 'express';
import { AppError } from '@/utils';
import type { AuthRequest } from '@/interfaces';

/**
 * Middleware to check if the authenticated user is active.
 * Should be used AFTER the authenticate middleware.
 */
export const checkActive = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (req.user && (req.user as any).isActive === false) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 403));
  }

  next();
};
