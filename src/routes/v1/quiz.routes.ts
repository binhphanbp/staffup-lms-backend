import { Router, type Router as ExpressRouter } from 'express';
import {
  autoGradeObjectiveQuestions,
  getQuizAttemptDetail,
  saveQuizResponse,
  startQuizAttempt,
} from '@/controllers/quiz.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  autoGradeObjectiveSchema,
  getQuizAttemptDetailSchema,
  saveQuizResponseSchema,
  startQuizAttemptSchema,
} from '@/schemas/quiz.schema';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/quiz-attempts/start
 * @desc    Start a new quiz attempt
 * @access  Private (student/employee)
 */
router.post('/start', validate(startQuizAttemptSchema), startQuizAttempt);

/**
 * @route   GET /api/v1/quiz-attempts/:id/detail
 * @desc    Get quiz attempt detail for UI (attempt info, questions, responses)
 * @access  Private (user must own the attempt)
 */
router.get('/:id/detail', validate(getQuizAttemptDetailSchema, 'params'), getQuizAttemptDetail);

/**
 * @route   POST /api/v1/quiz-attempts/responses
 * @desc    Save or update quiz attempt response (upsert)
 * @access  Private (user must own the attempt)
 */
router.post('/responses', validate(saveQuizResponseSchema), saveQuizResponse);

/**
 * @route   POST /api/v1/quiz-attempts/:attemptId/grade
 * @desc    Auto-grade objective questions (single/multiple choice)
 * @access  Private (user must own the attempt)
 */
router.post(
  '/:attemptId/grade',
  validate(autoGradeObjectiveSchema, 'params'),
  autoGradeObjectiveQuestions,
);

export default router;
