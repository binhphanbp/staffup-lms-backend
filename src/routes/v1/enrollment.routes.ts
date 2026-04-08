import { Router, type Router as ExpressRouter } from 'express';
import { EnrollmentController } from '@/controllers/enrollment.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  getEnrollmentDetailSchema,
  enrollUsersSchema,
  listEnrollmentsSchema,
  updateEnrollmentStatusSchema,
  startLessonSchema,
  updateLessonProgressSchema,
} from '@/schemas/enrollment.schema';

const router: ExpressRouter = Router();

router.use(authenticate);

// List enrollments — admin/trainer sees all (filtered), learner sees own
router.get('/', validate(listEnrollmentsSchema, 'query'), EnrollmentController.listEnrollments);

// Enroll users into a course
router.post(
  '/courses/:courseId/enroll',
  validate(enrollUsersSchema),
  EnrollmentController.enrollUsers,
);

// Get enrollment detail (owner only)
router.get(
  '/:id/detail',
  validate(getEnrollmentDetailSchema, 'all'),
  EnrollmentController.getEnrollmentDetail,
);

// Update enrollment status with transition rules
router.patch(
  '/:id/status',
  validate(updateEnrollmentStatusSchema),
  EnrollmentController.updateStatus,
);

// Start lesson / upsert lesson progress
router.post(
  '/:enrollmentId/lessons/:lessonId/start',
  validate(startLessonSchema, 'params'),
  EnrollmentController.startLesson,
);

// Update lesson progress (watch time, position, status)
router.patch(
  '/:enrollmentId/lessons/:lessonId/progress',
  validate(updateLessonProgressSchema, 'all'),
  EnrollmentController.updateLessonProgress,
);

export default router;
