import { Router, type Router as ExpressRouter } from 'express';
import { EnrollmentController } from '@/controllers/enrollment.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { getEnrollmentDetailSchema, enrollUsersSchema } from '@/schemas/enrollment.schema';

const router: ExpressRouter = Router();

router.use(authenticate);

/**
 * @route   GET /api/v1/enrollments/:id/detail
 * @desc    Get enrollment detail with progress and certificate info
 * @access  Private (authenticated user, must own the enrollment)
 */
router.get(
  '/:id/detail',
  validate(getEnrollmentDetailSchema, 'all'),
  EnrollmentController.getEnrollmentDetail,
);

/**
 * @route   POST /api/v1/enrollments/courses/:courseId/enroll
 * @desc    Enroll one or multiple users into a course
 * @access  Private (admin or course trainer)
 */
router.post(
  '/courses/:courseId/enroll',
  validate(enrollUsersSchema),
  EnrollmentController.enrollUsers,
);

export default router;
