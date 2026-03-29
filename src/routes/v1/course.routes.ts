import { Router, type Router as ExpressRouter } from 'express';
import { CourseController } from '@/controllers/course.controller';
import { authenticate, restrictTo, validate } from '@/middlewares';
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
  .get(validate(courseQuerySchema, 'query'), CourseController.findAll)
  .post(restrictTo('admin', 'trainer'), validate(createCourseSchema), CourseController.create);

router
  .route('/:id')
  .get(validate(courseIdParamSchema, 'params'), CourseController.findById)
  .patch(
    restrictTo('admin', 'trainer'),
    validate(courseIdParamSchema, 'params'),
    validate(updateCourseSchema),
    CourseController.update,
  )
  .delete(
    restrictTo('admin', 'trainer'),
    validate(courseIdParamSchema, 'params'),
    CourseController.delete,
  );

export default router;
