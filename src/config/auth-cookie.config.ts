import type { CookieOptions, Response } from 'express';
import { env } from '@/config/env.config';

const refreshTokenMaxAgeMs = env.REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000;

const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/api/v1/auth',
  maxAge: refreshTokenMaxAgeMs,
};

const refreshTokenClearCookieOptions: CookieOptions = {
  httpOnly: refreshTokenCookieOptions.httpOnly,
  secure: refreshTokenCookieOptions.secure,
  sameSite: refreshTokenCookieOptions.sameSite,
  path: refreshTokenCookieOptions.path,
};

export const getRefreshTokenExpiryDate = (): Date => new Date(Date.now() + refreshTokenMaxAgeMs);

export const setRefreshTokenCookie = (res: Response, refreshToken: string): void => {
  res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshTokenCookieOptions);
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshTokenClearCookieOptions);
};
