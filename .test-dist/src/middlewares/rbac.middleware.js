"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.requirePermission = exports.requireRole = exports.hasPermission = exports.hasRole = void 0;
const utils_1 = require("../utils");
const ensureAuthenticatedUser = (req) => {
    if (!req.user) {
        throw new utils_1.AppError('You are not logged in.', 401);
    }
    return req.user;
};
const hasRole = (req, ...roles) => {
    const user = ensureAuthenticatedUser(req);
    return roles.some((role) => user.roleCodes.includes(role));
};
exports.hasRole = hasRole;
const hasPermission = (req, permissions, options = {}) => {
    const user = ensureAuthenticatedUser(req);
    const match = options.match ?? 'any';
    if (permissions.length === 0) {
        return true;
    }
    if (match === 'all') {
        return permissions.every((permission) => user.permissionCodes.includes(permission));
    }
    return permissions.some((permission) => user.permissionCodes.includes(permission));
};
exports.hasPermission = hasPermission;
const requireRole = (...roles) => {
    return (req, _res, next) => {
        try {
            if (!(0, exports.hasRole)(req, ...roles)) {
                return next(new utils_1.AppError('You do not have permission to perform this action.', 403));
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireRole = requireRole;
const requirePermission = (permissions, options = {}) => {
    const normalizedPermissions = Array.isArray(permissions) ? permissions : [permissions];
    return (req, _res, next) => {
        try {
            if (!(0, exports.hasPermission)(req, normalizedPermissions, options)) {
                return next(new utils_1.AppError('You do not have permission to perform this action.', 403));
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requirePermission = requirePermission;
// Backward-compatible alias for existing routes.
exports.restrictTo = exports.requireRole;
