import { Router, type Router as ExpressRouter } from 'express';
import { getQuizAttemptDetail } from '@/controllers/quiz.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { getQuizAttemptDetailSchema } from '@/schemas/quiz.schema';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/quiz-attempts/:id/detail
 * @desc    Get quiz attempt detail for UI (attempt info, questions, responses)
 * @access  Private (user must own the attempt)
 */
router.get('/:id/detail', validate(getQuizAttemptDetailSchema, 'params'), getQuizAttemptDetail);

export default router;
