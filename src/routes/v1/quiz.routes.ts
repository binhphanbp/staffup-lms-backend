import { Router, type Router as ExpressRouter } from 'express';
import { getQuizAttemptDetail, startQuizAttempt } from '@/controllers/quiz.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { getQuizAttemptDetailSchema, startQuizAttemptSchema } from '@/schemas/quiz.schema';

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

export default router;
