import { Router } from 'express';
import {
  getAssessmentHistory,
  getLatestAssessment,
  ingestRiskAssessment,
  listRiskAssessments,
  calculateSingleRisk,
  calculateBatchRisk,
} from '@/controllers/risk-assessment.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/rbac.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  assessmentHistoryQuerySchema,
  calculateRiskParamsSchema,
  enrollmentIdParamsSchema,
  ingestRiskAssessmentSchema,
  listRiskAssessmentsQuerySchema,
} from '@/schemas/risk-assessment.schema';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/risk-assessments
 * @desc List risk assessments with filters (for admin/trainer dashboard)
 * @access Private (Admin/Trainer)
 */
router.get('/', validate(listRiskAssessmentsQuerySchema, 'query'), listRiskAssessments);

/**
 * @route POST /api/v1/risk-assessments/ingest
 * @desc Ingest learner risk assessment from external AI/ML system
 * @access Private (Admin/System)
 */
router.post('/ingest', validate(ingestRiskAssessmentSchema, 'body'), ingestRiskAssessment);

/**
 * @route POST /api/v1/risk-assessments/calculate/:enrollmentId
 * @desc Calculate AI risk score for a single enrollment
 * @access Private (Admin/Manager)
 */
router.post(
  '/calculate/:enrollmentId',
  requireRole('admin', 'manager'),
  validate(calculateRiskParamsSchema, 'params'),
  calculateSingleRisk,
);

/**
 * @route POST /api/v1/risk-assessments/calculate-batch
 * @desc Trigger batch risk calculation for all active enrollments
 * @access Private (Admin only)
 */
router.post('/calculate-batch', requireRole('admin'), calculateBatchRisk);

/**
 * @route GET /api/v1/risk-assessments/enrollment/:enrollmentId/latest
 * @desc Get latest risk assessment for enrollment
 * @access Private (Owner/Trainer/Admin)
 */
router.get(
  '/enrollment/:enrollmentId/latest',
  validate(enrollmentIdParamsSchema, 'params'),
  getLatestAssessment,
);

/**
 * @route GET /api/v1/risk-assessments/enrollment/:enrollmentId/history
 * @desc Get risk assessment history for enrollment
 * @access Private (Owner/Trainer/Admin)
 */
router.get(
  '/enrollment/:enrollmentId/history',
  validate(enrollmentIdParamsSchema, 'params'),
  validate(assessmentHistoryQuerySchema, 'query'),
  getAssessmentHistory,
);

export default router;
