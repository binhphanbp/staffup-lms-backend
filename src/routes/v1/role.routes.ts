import { Router, type Router as ExpressRouter } from 'express';
import { RoleController } from '@/controllers/role.controller';
import { authenticate, restrictTo, validate } from '@/middlewares';
import {
  createRoleSchema,
  roleIdParamSchema,
  roleListQuerySchema,
  updateRoleSchema,
} from '@/schemas/role.schema';

const router: ExpressRouter = Router();

router.use(authenticate, restrictTo('admin'));

router
  .route('/')
  .get(validate(roleListQuerySchema, 'query'), RoleController.getRoles)
  .post(validate(createRoleSchema), RoleController.createRole);

router
  .route('/:id')
  .all(validate(roleIdParamSchema, 'params'))
  .get(RoleController.getRole)
  .put(validate(updateRoleSchema), RoleController.updateRole)
  .delete(RoleController.deleteRole);

export default router;
