import { Router, type Router as ExpressRouter } from 'express';
import { CourseController } from '@/controllers/course.controller';
import { authenticate, requirePermission, validate } from '@/middlewares';
import {
  createCourseSchema,
  updateCourseSchema,
  updateCourseStatusSchema,
  addCourseTagSchema,
  courseIdParamSchema,
  courseTagParamsSchema,
  courseDetailQuerySchema,
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
  validate(courseDetailQuerySchema, 'query'),
  CourseController.getCourseDetail,
);

router.patch(
  '/:id/status',
  requirePermission('course.update'),
  validate(courseIdParamSchema, 'params'),
  validate(updateCourseStatusSchema),
  CourseController.updateStatus,
);

router.post(
  '/:id/tags',
  requirePermission('course.update'),
  validate(courseIdParamSchema, 'params'),
  validate(addCourseTagSchema),
  CourseController.addTag,
);

router.delete(
  '/:id/tags/:tagId',
  requirePermission('course.update'),
  validate(courseTagParamsSchema, 'params'),
  CourseController.removeTag,
);

router
  .route('/:id')
  .get(
    requirePermission('course.read'),
    validate(courseIdParamSchema, 'params'),
    validate(courseDetailQuerySchema, 'query'),
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
