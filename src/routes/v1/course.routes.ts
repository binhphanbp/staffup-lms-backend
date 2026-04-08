import { Router, type Router as ExpressRouter } from 'express';
import { CourseController } from '@/controllers/course.controller';
import { authenticate, requirePermission, validate } from '@/middlewares';
import {
  createCourseSchema,
  updateCourseSchema,
  courseIdParamSchema,
  courseQuerySchema,
} from '@/schemas/course.schema';

const router: ExpressRouter = Router();

// All course routes require authentication
router.use(authenticate);

router
  .route('/')
  .get(
    requirePermission('course.read'),
    validate(courseQuerySchema, 'query'),
    CourseController.findAll,
  )
  .post(requirePermission('course.create'), validate(createCourseSchema), CourseController.create);

router.get(
  '/:id/detail',
  requirePermission('course.read'),
  validate(courseIdParamSchema, 'params'),
  CourseController.getCourseDetail,
);

router
  .route('/:id')
  .get(
    requirePermission('course.read'),
    validate(courseIdParamSchema, 'params'),
    CourseController.findById,
  )
  .patch(
    requirePermission('course.update'),
    validate(courseIdParamSchema, 'params'),
    validate(updateCourseSchema),
    CourseController.update,
  )
  .delete(
    requirePermission('course.delete'),
    validate(courseIdParamSchema, 'params'),
    CourseController.delete,
  );

export default router;
