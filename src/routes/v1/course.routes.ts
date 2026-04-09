import { Router, type Router as ExpressRouter } from 'express';
import { CourseController } from '@/controllers/course.controller';
import { authenticate, requirePermission, validate } from '@/middlewares';
import {
  createCourseSchema,
  updateCourseSchema,
  updateCourseStatusSchema,
  addCourseTagSchema,
  createCourseModuleSchema,
  reorderCourseModulesSchema,
  updateCourseModuleSchema,
  createCourseLessonSchema,
  updateCourseLessonSchema,
  reorderCourseLessonsSchema,
  createLessonResourceSchema,
  updateLessonResourceSchema,
  courseIdParamSchema,
  courseTagParamsSchema,
  courseModuleParamsSchema,
  courseLessonParamsSchema,
  lessonResourceParamsSchema,
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
  .route('/:id/modules')
  .get(
    requirePermission('course.read'),
    validate(courseIdParamSchema, 'params'),
    CourseController.listModules,
  )
  .post(
    requirePermission('course.update'),
    validate(courseIdParamSchema, 'params'),
    validate(createCourseModuleSchema),
    CourseController.createModule,
  );

router.post(
  '/:id/modules/reorder',
  requirePermission('course.update'),
  validate(courseIdParamSchema, 'params'),
  validate(reorderCourseModulesSchema),
  CourseController.reorderModules,
);

router
  .route('/:id/modules/:moduleId')
  .patch(
    requirePermission('course.update'),
    validate(courseModuleParamsSchema, 'params'),
    validate(updateCourseModuleSchema),
    CourseController.updateModule,
  )
  .delete(
    requirePermission('course.update'),
    validate(courseModuleParamsSchema, 'params'),
    CourseController.deleteModule,
  );

router
  .route('/:id/modules/:moduleId/lessons')
  .get(
    requirePermission('course.read'),
    validate(courseModuleParamsSchema, 'params'),
    CourseController.listLessons,
  )
  .post(
    requirePermission('course.update'),
    validate(courseModuleParamsSchema, 'params'),
    validate(createCourseLessonSchema),
    CourseController.createLesson,
  );

router.post(
  '/:id/modules/:moduleId/lessons/reorder',
  requirePermission('course.update'),
  validate(courseModuleParamsSchema, 'params'),
  validate(reorderCourseLessonsSchema),
  CourseController.reorderLessons,
);

router
  .route('/:id/modules/:moduleId/lessons/:lessonId/resources')
  .get(
    requirePermission('course.read'),
    validate(courseLessonParamsSchema, 'params'),
    CourseController.listLessonResources,
  )
  .post(
    requirePermission('course.update'),
    validate(courseLessonParamsSchema, 'params'),
    validate(createLessonResourceSchema),
    CourseController.createLessonResource,
  );

router
  .route('/:id/modules/:moduleId/lessons/:lessonId/resources/:resourceId')
  .patch(
    requirePermission('course.update'),
    validate(lessonResourceParamsSchema, 'params'),
    validate(updateLessonResourceSchema),
    CourseController.updateLessonResource,
  )
  .delete(
    requirePermission('course.update'),
    validate(lessonResourceParamsSchema, 'params'),
    CourseController.deleteLessonResource,
  );

router
  .route('/:id/modules/:moduleId/lessons/:lessonId')
  .patch(
    requirePermission('course.update'),
    validate(courseLessonParamsSchema, 'params'),
    validate(updateCourseLessonSchema),
    CourseController.updateLesson,
  )
  .delete(
    requirePermission('course.update'),
    validate(courseLessonParamsSchema, 'params'),
    CourseController.deleteLesson,
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
