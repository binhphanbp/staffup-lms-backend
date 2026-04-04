import type { NextFunction, Response } from 'express';
import { clearRefreshTokenCookie, setRefreshTokenCookie } from '@/config/auth-cookie.config';
import { env } from '@/config/env.config';
import { AuthService } from '@/services/auth.service';
import { catchAsync, sendCreated, sendSuccess } from '@/utils';
import type { AuthRequest } from '@/interfaces';

export class AuthController {
  static register = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await AuthService.register(req.body, AuthController.getSessionContext(req));
    setRefreshTokenCookie(res, result.refreshToken);
    sendCreated(res, AuthController.serializeAuthResult(result), 'User registered successfully');
  });

  static login = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await AuthService.login(req.body, AuthController.getSessionContext(req));
    setRefreshTokenCookie(res, result.refreshToken);
    sendSuccess(res, AuthController.serializeAuthResult(result), 'Login successful');
  });

  static refresh = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await AuthService.refresh(
      AuthController.extractRefreshToken(req),
      AuthController.getSessionContext(req),
    );
    setRefreshTokenCookie(res, result.refreshToken);
    sendSuccess(res, AuthController.serializeAuthResult(result), 'Token refreshed successfully');
  });

  static logout = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    await AuthService.logout(AuthController.extractRefreshToken(req));
    clearRefreshTokenCookie(res);
    sendSuccess(res, null, 'Logout successful');
  });

  static getProfile = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const user = await AuthService.getProfile(req.user!.userId);
    sendSuccess(res, user, 'Profile retrieved successfully');
  });

  private static extractRefreshToken(req: AuthRequest): string | undefined {
    const cookieToken = req.cookies?.[env.REFRESH_TOKEN_COOKIE_NAME];
    const bodyToken =
      typeof req.body?.refreshToken === 'string' && req.body.refreshToken.length > 0
        ? req.body.refreshToken
        : undefined;

    return cookieToken ?? bodyToken;
  }

  private static getSessionContext(req: AuthRequest) {
    return {
      ipAddress: req.ip,
      userAgent: req.get('user-agent') ?? null,
    };
  }

  private static serializeAuthResult(result: {
    user: unknown;
    token: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  }) {
    return {
      user: result.user,
      token: result.token,
      refreshTokenExpiresAt: result.refreshTokenExpiresAt,
    };
  }
}
