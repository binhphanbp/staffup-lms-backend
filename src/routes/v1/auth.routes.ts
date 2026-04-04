import { Router, type Router as ExpressRouter } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authenticate, validate } from '@/middlewares';
import { loginSchema, refreshTokenSchema, registerSchema } from '@/schemas/auth.schema';

const router: ExpressRouter = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);
router.post('/logout', validate(refreshTokenSchema), AuthController.logout);
router.get('/me', authenticate, AuthController.getProfile);

export default router;
