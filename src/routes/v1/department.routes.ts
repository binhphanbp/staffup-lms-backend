import { Router, type Router as ExpressRouter } from 'express';
import { DepartmentController } from '@/controllers/department.controller';
import { authenticate, validate, restrictTo } from '@/middlewares';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentIdParamSchema,
} from '@/schemas/department.schema';

const router: ExpressRouter = Router();

// Apply auth middleware to all department routes
router.use(authenticate);

router
  .route('/')
  .get(DepartmentController.getDepartments)
  .post(
    restrictTo('admin'),
    validate(createDepartmentSchema),
    DepartmentController.createDepartment,
  );

router
  .route('/:id')
  .all(validate(departmentIdParamSchema, 'params'))
  .get(DepartmentController.getDepartment)
  .put(
    restrictTo('admin', 'manager'),
    validate(updateDepartmentSchema),
    DepartmentController.updateDepartment,
  )
  .delete(restrictTo('admin'), DepartmentController.deleteDepartment);

export default router;
