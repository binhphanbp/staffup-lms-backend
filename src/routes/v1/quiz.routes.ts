import { Router, type Router as ExpressRouter } from 'express';
import {
  autoGradeObjectiveQuestions,
  finalizeGrading,
  getAllAttemptsAdmin,
  getAttemptHistory,
  getQuizAttemptDetail,
  manualGradeResponse,
  saveQuizResponse,
  startQuizAttempt,
  submitQuizAttempt,
} from '@/controllers/quiz.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/rbac.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  autoGradeObjectiveSchema,
  finalizeGradingSchema,
  getAllAttemptsSchema,
  getAttemptHistorySchema,
  getQuizAttemptDetailSchema,
  manualGradeResponseBodySchema,
  manualGradeResponseSchema,
  saveQuizResponseSchema,
  startQuizAttemptSchema,
  submitQuizAttemptSchema,
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
 * @route   GET /api/v1/quiz-attempts/history
 * @desc    Get quiz attempt history (filter by enrollmentId or quizId)
 * @access  Private
 */
router.get('/history', validate(getAttemptHistorySchema, 'query'), getAttemptHistory);

/**
 * @route   GET /api/v1/quiz-attempts/admin
 * @desc    List all quiz attempts with server-side filters + pagination (grading dashboard)
 * @access  Private (admin/trainer only)
 */
router.get(
  '/admin',
  restrictTo('admin', 'trainer'),
  validate(getAllAttemptsSchema, 'query'),
  getAllAttemptsAdmin,
);

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
 * @route   POST /api/v1/quiz-attempts/:attemptId/submit
 * @desc    Submit quiz attempt (auto-grade if no essay questions)
 * @access  Private (user must own the attempt)
 */
router.post('/:attemptId/submit', validate(submitQuizAttemptSchema, 'params'), submitQuizAttempt);

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

/**
 * @route   POST /api/v1/quiz-attempts/:attemptId/finalize
 * @desc    Finalize grading - calculate final scores and mark as complete
 * @access  Private (trainer/admin only)
 */
router.post('/:attemptId/finalize', validate(finalizeGradingSchema, 'params'), finalizeGrading);

/**
 * @route   POST /api/v1/quiz-attempts/responses/:responseId/grade
 * @desc    Manual grade essay/short_answer response
 * @access  Private (trainer/admin only)
 */
router.post(
  '/responses/:responseId/grade',
  validate(manualGradeResponseSchema, 'params'),
  validate(manualGradeResponseBodySchema),
  manualGradeResponse,
);

export default router;
