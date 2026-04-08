import { Router, type Router as ExpressRouter } from 'express';
import { PermissionController } from '@/controllers/permission.controller';
import { authenticate, restrictTo, validate } from '@/middlewares';
import {
  createPermissionSchema,
  permissionIdParamSchema,
  permissionListQuerySchema,
  updatePermissionSchema,
} from '@/schemas/permission.schema';

const router: ExpressRouter = Router();

router.use(authenticate, restrictTo('admin'));

router
  .route('/')
  .get(validate(permissionListQuerySchema, 'query'), PermissionController.getPermissions)
  .post(validate(createPermissionSchema), PermissionController.createPermission);

router
  .route('/:id')
  .all(validate(permissionIdParamSchema, 'params'))
  .get(PermissionController.getPermission)
  .put(validate(updatePermissionSchema), PermissionController.updatePermission)
  .delete(PermissionController.deletePermission);

export default router;
