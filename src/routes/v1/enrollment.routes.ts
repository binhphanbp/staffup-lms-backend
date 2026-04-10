import { Router, type Router as ExpressRouter } from 'express';
import { EnrollmentController } from '@/controllers/enrollment.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  getEnrollmentDetailSchema,
  enrollCourseParamsSchema,
  enrollUsersSchema,
  selfEnrollSchema,
  listEnrollmentsSchema,
  updateEnrollmentStatusParamsSchema,
  updateEnrollmentStatusSchema,
  startLessonSchema,
  updateLessonProgressBodySchema,
  completeLessonSchema,
  getEnrollmentProgressSchema,
} from '@/schemas/enrollment.schema';

const router: ExpressRouter = Router();

router.use(authenticate);

// List enrollments — admin/trainer sees all (filtered), learner sees own
router.get('/', validate(listEnrollmentsSchema, 'query'), EnrollmentController.listEnrollments);

// Self-enroll into a course (for learners)
router.post(
  '/courses/:courseId/self-enroll',
  validate(selfEnrollSchema, 'params'),
  EnrollmentController.selfEnroll,
);

// Enroll users into a course (admin/trainer only)
router.post(
  '/courses/:courseId/enroll',
  validate(enrollCourseParamsSchema, 'params'),
  validate(enrollUsersSchema),
  EnrollmentController.enrollUsers,
);

// Get enrollment detail (owner only)
router.get(
  '/:id/detail',
  validate(getEnrollmentDetailSchema, 'params'),
  EnrollmentController.getEnrollmentDetail,
);

// Update enrollment status with transition rules
router.patch(
  '/:id/status',
  validate(updateEnrollmentStatusParamsSchema, 'params'),
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
  validate(startLessonSchema, 'params'),
  validate(updateLessonProgressBodySchema),
  EnrollmentController.updateLessonProgress,
);

// Complete a lesson — marks completed_at, triggers recalc
router.post(
  '/:enrollmentId/lessons/:lessonId/complete',
  validate(completeLessonSchema, 'params'),
  EnrollmentController.completeLesson,
);

// Get enrollment progress summary + per-lesson detail
router.get(
  '/:enrollmentId/progress',
  validate(getEnrollmentProgressSchema, 'params'),
  EnrollmentController.getEnrollmentProgress,
);

export default router;
