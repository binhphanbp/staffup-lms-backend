import { Router, type Router as ExpressRouter } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authenticate, validate, restrictTo, checkActive } from '@/middlewares';
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  updateUserStatusSchema,
} from '@/schemas/auth.schema';

const router: ExpressRouter = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), checkActive, AuthController.login);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);
router.post('/logout', validate(refreshTokenSchema), AuthController.logout);
router.get('/me', authenticate, checkActive, AuthController.getProfile);

// Update user active status (Admin only)
router.patch(
  '/users/:id/status',
  authenticate,
  restrictTo('admin'),
  validate(updateUserStatusSchema),
  AuthController.updateStatus,
);

export default router;
