import { Router, type Router as ExpressRouter } from 'express';
import { UserController } from '@/controllers/user.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/rbac.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  createUserSchema,
  updateUserSchema,
  listUsersSchema,
  userIdParamSchema,
} from '@/schemas/user.schema';

const router: ExpressRouter = Router();

router.use(authenticate);

router
  .route('/')
  .get(
    requireRole('admin', 'manager'),
    validate(listUsersSchema, 'query'),
    UserController.listUsers,
  )
  .post(requireRole('admin'), validate(createUserSchema), UserController.createUser);

router
  .route('/:id')
  .all(validate(userIdParamSchema, 'params'))
  .get(requireRole('admin', 'manager'), UserController.getUser)
  .patch(requireRole('admin'), validate(updateUserSchema), UserController.updateUser);

export default router;
