import argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';
import { getRefreshTokenExpiryDate } from '@/config/auth-cookie.config';
import { prisma } from '@/config/database';
import { signToken } from '@/config/jwt.config';
import { AppError } from '@/utils';
import type { LoginInput, RegisterInput } from '@/schemas/auth.schema';

interface SessionContext {
  ipAddress?: string | null;
  userAgent?: string | null;
}

interface RoleCodeRecord {
  role: {
    code: string;
  };
}

interface AuthUserRecord {
  id: bigint;
  email: string;
  fullName: string;
  createdAt?: Date;
  userRoles: RoleCodeRecord[];
}

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterInput, sessionContext: SessionContext = {}) {
    const db = prisma;

    const existingUser = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('A user with this email already exists.', 409);
    }

    const passwordHash = await argon2.hash(data.password);

    const defaultRole = await db.role.findUnique({
      where: { code: 'employee' },
      select: { id: true, code: true },
    });

    if (!defaultRole) {
      throw new AppError('Default role `employee` was not found.', 500);
    }

    const user = await db.user.create({
      data: {
        departmentId: data.departmentId,
        fullName: data.fullName,
        positionTitle: data.positionTitle,
        email: data.email.toLowerCase(),
        passwordHash,
        userRoles: {
          create: {
            roleId: defaultRole.id,
          },
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
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

    return this.createAuthResult(user, sessionContext);
  }

  /**
   * Login with email and password
   */
  static async login(data: LoginInput, sessionContext: SessionContext = {}) {
    const db = prisma;

    const user = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        isActive: true,
        passwordHash: true,
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
      throw new AppError('Invalid email or password.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated.', 403);
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, data.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    return this.createAuthResult(user, sessionContext);
  }

  /**
   * Exchange a valid refresh token for a new access token and rotated refresh token
   */
  static async refresh(refreshToken: string | undefined, sessionContext: SessionContext = {}) {
    const db = prisma;

    if (!refreshToken) {
      throw new AppError('Refresh token is required.', 401);
    }

    const tokenHash = this.hashRefreshToken(refreshToken);
    const now = new Date();

    const session = await db.authSession.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            createdAt: true,
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
        },
      },
    });

    if (!session || session.revokedAt || session.expiresAt <= now) {
      if (session?.id && !session.revokedAt) {
        await db.authSession.update({
          where: { id: session.id },
          data: {
            revokedAt: now,
          },
        });
      }

      throw new AppError('Refresh token is invalid or expired.', 401);
    }

    if (!session.user) {
      await db.authSession.update({
        where: { id: session.id },
        data: {
          revokedAt: now,
        },
      });

      throw new AppError('The user belonging to this session no longer exists.', 401);
    }

    if (!session.user.isActive) {
      await db.authSession.update({
        where: { id: session.id },
        data: {
          revokedAt: now,
        },
      });

      throw new AppError('Your account has been deactivated.', 403);
    }

    const nextRefreshToken = this.generateRefreshToken();
    const nextRefreshTokenHash = this.hashRefreshToken(nextRefreshToken);
    const nextRefreshTokenExpiresAt = getRefreshTokenExpiryDate();

    await db.authSession.update({
      where: { id: session.id },
      data: {
        tokenHash: nextRefreshTokenHash,
        expiresAt: nextRefreshTokenExpiresAt,
        lastUsedAt: now,
        userAgent: sessionContext.userAgent ?? session.userAgent,
        ipAddress: sessionContext.ipAddress ?? session.ipAddress,
      },
    });

    return this.buildAuthPayload(session.user, nextRefreshToken, nextRefreshTokenExpiresAt);
  }

  /**
   * Revoke the refresh session associated with the supplied token
   */
  static async logout(refreshToken: string | undefined) {
    const db = prisma;

    if (!refreshToken) {
      return;
    }

    await db.authSession.updateMany({
      where: {
        tokenHash: this.hashRefreshToken(refreshToken),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Get current user profile
   */
  static async getProfile(userId: string) {
    const db = prisma;

    const user = await db.user.findUnique({
      where: { id: BigInt(userId) },
      select: {
        id: true,
        email: true,
        fullName: true,
        positionTitle: true,
        avatarUrl: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        userRoles: {
          select: {
            role: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return {
      ...user,
      id: user.id.toString(),
      userRoles: user.userRoles.map(
        (userRole: { role: { code: string; name: string } }) => userRole.role,
      ),
    };
  }

  private static async createAuthResult(user: AuthUserRecord, sessionContext: SessionContext) {
    const db = prisma;
    const refreshToken = this.generateRefreshToken();
    const refreshTokenExpiresAt = getRefreshTokenExpiryDate();

    await db.authSession.create({
      data: {
        userId: user.id,
        tokenHash: this.hashRefreshToken(refreshToken),
        userAgent: sessionContext.userAgent ?? null,
        ipAddress: sessionContext.ipAddress ?? null,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    return this.buildAuthPayload(user, refreshToken, refreshTokenExpiresAt);
  }

  private static buildAuthPayload(
    user: AuthUserRecord,
    refreshToken: string,
    refreshTokenExpiresAt: Date,
  ) {
    const roleCodes = this.extractRoleCodes(user.userRoles);

    return {
      user: {
        id: user.id.toString(),
        email: user.email,
        fullName: user.fullName,
        roleCodes,
        createdAt: user.createdAt,
      },
      token: signToken({
        userId: user.id.toString(),
        email: user.email,
        roleCodes,
      }),
      refreshToken,
      refreshTokenExpiresAt,
    };
  }

  private static extractRoleCodes(userRoles: RoleCodeRecord[]): string[] {
    return userRoles.map((userRole) => userRole.role.code);
  }

  private static generateRefreshToken(): string {
    return randomBytes(48).toString('hex');
  }

  private static hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }
  /**
   * Update user active status
   */
  static async updateUserStatus(userId: string, isActive: boolean) {
    const db = prisma as any;

    const user = await db.user.findUnique({
      where: { id: BigInt(userId) },
    });

    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const updatedUser = await db.user.update({
      where: { id: BigInt(userId) },
      data: { isActive },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return {
      ...updatedUser,
      id: updatedUser.id.toString(),
    };
  }
}
