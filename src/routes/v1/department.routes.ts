import { Router, type Router as ExpressRouter } from 'express';
import { DepartmentController } from '@/controllers/department.controller';
import { authenticate, validate, restrictTo } from '@/middlewares';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentIdParamSchema,
  getDepartmentUsersQuerySchema,
  assignManagerSchema,
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

// GET /:id/users — list users in a department with pagination & isActive filter
router
  .route('/:id/users')
  .all(validate(departmentIdParamSchema, 'params'))
  .get(
    restrictTo('admin', 'manager'),
    validate(getDepartmentUsersQuerySchema, 'query'),
    DepartmentController.getDepartmentUsers,
  );

// POST /:id/manager — assign manager to department
router
  .route('/:id/manager')
  .all(validate(departmentIdParamSchema, 'params'))
  .post(
    restrictTo('admin'),
    validate(assignManagerSchema),
    DepartmentController.assignManager,
  )
  .delete(restrictTo('admin'), DepartmentController.removeManager);

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
