import argon2 from 'argon2';
import { prisma } from '@/config/database';
import { signToken } from '@/config/jwt.config';
import { AppError } from '@/utils';
import type { RegisterInput, LoginInput } from '@/schemas/auth.schema';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterInput) {
    const db = prisma as any;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('A user with this email already exists.', 409);
    }

    // Hash password
    const passwordHash = await argon2.hash(data.password);

    const defaultRole = await db.role.findUnique({
      where: { code: 'employee' },
      select: { id: true, code: true },
    });

    if (!defaultRole) {
      throw new AppError('Default role `employee` was not found.', 500);
    }

    // Create user
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

    const roleCodes = user.userRoles.map(
      (userRole: { role: { code: string } }) => userRole.role.code,
    );

    // Generate JWT
    const token = signToken({
      userId: user.id.toString(),
      email: user.email,
      roleCodes,
    });

    return {
      user: {
        id: user.id.toString(),
        email: user.email,
        fullName: user.fullName,
        roleCodes,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  /**
   * Login with email and password
   */
  static async login(data: LoginInput) {
    const db = prisma as any;

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: {
        userRoles: {
          include: {
            role: true,
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

    // Verify password
    const isPasswordValid = await argon2.verify(user.passwordHash, data.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    const roleCodes = user.userRoles.map(
      (userRole: { role: { code: string } }) => userRole.role.code,
    );

    // Generate JWT
    const token = signToken({
      userId: user.id.toString(),
      email: user.email,
      roleCodes,
    });

    return {
      user: {
        id: user.id.toString(),
        email: user.email,
        fullName: user.fullName,
        roleCodes,
      },
      token,
    };
  }

  /**
   * Get current user profile
   */
  static async getProfile(userId: string) {
    const db = prisma as any;

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
