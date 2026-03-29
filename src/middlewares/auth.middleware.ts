import type { Response, NextFunction } from 'express';
import { verifyToken } from '@/config/jwt.config';
import { prisma } from '@/config/database';
import { AppError } from '@/utils';
import type { AuthRequest } from '@/interfaces';

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const db = prisma as any;

    // 1) Extract token from Authorization header
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      throw new AppError('You are not logged in. Please log in to get access.', 401);
    }

    // 2) Verify the token
    const decoded = verifyToken(token);

    // 3) Check if user still exists
    const user = await db.user.findUnique({
      where: { id: BigInt(decoded.userId) },
      select: {
        id: true,
        email: true,
        isActive: true,
        userRoles: {
          select: {
            role: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403);
    }

    // 4) Attach user payload to request
    req.user = {
      userId: user.id.toString(),
      email: user.email,
      roleCodes: user.userRoles.map((userRole: { role: { code: string } }) => userRole.role.code),
    };

    next();
  } catch (error) {
    next(error);
  }
};
