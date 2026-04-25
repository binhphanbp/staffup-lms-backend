import type { Response, NextFunction } from 'express';
import { verifyToken } from '@/config/jwt.config';
import { prisma } from '@/config/database';
import { AppError } from '@/utils';
import type { AuthRequest } from '@/interfaces';

interface RoleCodeRecord {
  role: {
    code: string;
    rolePermissions: {
      permission: {
        code: string;
      };
    }[];
  };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const db = prisma;

    const [scheme, token] = req.headers.authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      throw new AppError('You are not logged in. Please log in to get access.', 401);
    }

    const decoded = verifyToken(token);

    const user = await db.user.findUnique({
      where: { id: BigInt(decoded.userId) },
      select: {
        id: true,
        email: true,
        departmentId: true,
        isActive: true,
        userRoles: {
          select: {
            role: {
              select: {
                code: true,
                rolePermissions: {
                  select: {
                    permission: {
                      select: {
                        code: true,
                      },
                    },
                  },
                },
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

    const permissionCodes = [
      ...new Set(
        user.userRoles.flatMap((userRole: RoleCodeRecord) =>
          userRole.role.rolePermissions.map((rolePermission) => rolePermission.permission.code),
        ),
      ),
    ];

    req.user = {
      userId: user.id.toString(),
      email: user.email,
      departmentId: user.departmentId.toString(),
      roleCodes: user.userRoles.map((userRole: RoleCodeRecord) => userRole.role.code),
      permissionCodes,
      isActive: user.isActive,
    };

    next();
  } catch (error) {
    next(error);
  }
};
