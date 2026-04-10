"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_config_1 = require("../config/jwt.config");
const database_1 = require("../config/database");
const utils_1 = require("../utils");
const authenticate = async (req, _res, next) => {
    try {
        const db = database_1.prisma;
        const [scheme, token] = req.headers.authorization?.split(' ') ?? [];
        if (scheme !== 'Bearer' || !token) {
            throw new utils_1.AppError('You are not logged in. Please log in to get access.', 401);
        }
        const decoded = (0, jwt_config_1.verifyToken)(token);
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
            throw new utils_1.AppError('The user belonging to this token no longer exists.', 401);
        }
        if (!user.isActive) {
            throw new utils_1.AppError('Your account has been deactivated. Please contact support.', 403);
        }
        const permissionCodes = [
            ...new Set(user.userRoles.flatMap((userRole) => userRole.role.rolePermissions.map((rolePermission) => rolePermission.permission.code))),
        ];
        req.user = {
            userId: user.id.toString(),
            email: user.email,
            roleCodes: user.userRoles.map((userRole) => userRole.role.code),
            permissionCodes,
            isActive: user.isActive,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
