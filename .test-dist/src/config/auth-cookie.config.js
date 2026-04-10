"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearRefreshTokenCookie = exports.setRefreshTokenCookie = exports.getRefreshTokenExpiryDate = void 0;
const env_config_1 = require("../config/env.config");
const refreshTokenMaxAgeMs = env_config_1.env.REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000;
const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: env_config_1.env.NODE_ENV === 'production',
    sameSite: env_config_1.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/api/v1/auth',
    maxAge: refreshTokenMaxAgeMs,
};
const refreshTokenClearCookieOptions = {
    httpOnly: refreshTokenCookieOptions.httpOnly,
    secure: refreshTokenCookieOptions.secure,
    sameSite: refreshTokenCookieOptions.sameSite,
    path: refreshTokenCookieOptions.path,
};
const getRefreshTokenExpiryDate = () => new Date(Date.now() + refreshTokenMaxAgeMs);
exports.getRefreshTokenExpiryDate = getRefreshTokenExpiryDate;
const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie(env_config_1.env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshTokenCookieOptions);
};
exports.setRefreshTokenCookie = setRefreshTokenCookie;
const clearRefreshTokenCookie = (res) => {
    res.clearCookie(env_config_1.env.REFRESH_TOKEN_COOKIE_NAME, refreshTokenClearCookieOptions);
};
exports.clearRefreshTokenCookie = clearRefreshTokenCookie;
