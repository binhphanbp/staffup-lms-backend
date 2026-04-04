import { Router, type Router as ExpressRouter } from 'express';
import { EnrollmentController } from '@/controllers/enrollment.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { getEnrollmentDetailSchema } from '@/schemas/enrollment.schema';

const router: ExpressRouter = Router();

/**
 * @route   GET /api/v1/enrollments/:id/detail
 * @desc    Get enrollment detail with progress and certificate info
 * @access  Private (authenticated user, must own the enrollment)
 */
router.get(
  '/:id/detail',
  authenticate,
  validate(getEnrollmentDetailSchema, 'all'),
  EnrollmentController.getEnrollmentDetail,
);

export default router;
