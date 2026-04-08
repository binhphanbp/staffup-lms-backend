import { Router, type Router as ExpressRouter } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authenticate, validate, restrictTo } from '@/middlewares';
import {
  assignUserRolesSchema,
  changePasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  userIdParamSchema,
  updateUserStatusSchema,
} from '@/schemas/auth.schema';

const router: ExpressRouter = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);
router.post('/logout', validate(refreshTokenSchema), AuthController.logout);
router.patch(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  AuthController.changePassword,
);
router.get('/me', authenticate, AuthController.getProfile);
router.get('/me/effective-permissions', authenticate, AuthController.getMyEffectivePermissions);

// Update user active status (Admin only)
router.patch(
  '/users/:id/status',
  authenticate,
  restrictTo('admin'),
  validate(userIdParamSchema, 'params'),
  validate(updateUserStatusSchema),
  AuthController.updateStatus,
);

router.put(
  '/users/:id/roles',
  authenticate,
  restrictTo('admin'),
  validate(userIdParamSchema, 'params'),
  validate(assignUserRolesSchema),
  AuthController.assignRoles,
);

router.get(
  '/users/:id/effective-permissions',
  authenticate,
  restrictTo('admin'),
  validate(userIdParamSchema, 'params'),
  AuthController.getUserEffectivePermissions,
);

export default router;
