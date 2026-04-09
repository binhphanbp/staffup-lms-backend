import { Router } from 'express';
import {
  addQuestionToQuiz,
  createQuiz,
  deleteQuiz,
  getQuizById,
  listQuizzes,
  removeQuestionFromQuiz,
  reorderQuizQuestions,
  updateQuiz,
  updateQuizQuestion,
} from '@/controllers/quiz-management.controller';
import { authenticate, requirePermission, validate } from '@/middlewares';
import {
  addQuestionToQuizSchema,
  createQuizSchema,
  listQuizzesQuerySchema,
  quizIdOnlyParamsSchema,
  quizIdParamsSchema,
  quizQuestionParamsSchema,
  reorderQuizQuestionsSchema,
  updateQuizQuestionSchema,
  updateQuizSchema,
} from '@/schemas/quiz-management.schema';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/quizzes
 * @desc List quizzes with filters
 * @access Private
 */
router.get('/', validate(listQuizzesQuerySchema, 'query'), listQuizzes);

/**
 * @route POST /api/v1/quizzes
 * @desc Create quiz
 * @access Private (Admin/Trainer)
 */
router.post('/', requirePermission('quiz.create'), validate(createQuizSchema), createQuiz);

/**
 * @route GET /api/v1/quizzes/:id
 * @desc Get quiz detail
 * @access Private
 */
router.get(
  '/:id',
  requirePermission('quiz.read'),
  validate(quizIdParamsSchema, 'params'),
  getQuizById,
);

/**
 * @route PUT /api/v1/quizzes/:id
 * @desc Update quiz
 * @access Private (Admin/Trainer)
 */
router.put(
  '/:id',
  requirePermission('quiz.update'),
  validate(quizIdParamsSchema, 'params'),
  validate(updateQuizSchema),
  updateQuiz,
);

/**
 * @route DELETE /api/v1/quizzes/:id
 * @desc Delete quiz
 * @access Private (Admin/Trainer)
 */
router.delete(
  '/:id',
  requirePermission('quiz.delete'),
  validate(quizIdParamsSchema, 'params'),
  deleteQuiz,
);

/**
 * @route POST /api/v1/quizzes/:quizId/questions
 * @desc Add question to quiz
 * @access Private (Admin/Trainer)
 */
router.post(
  '/:quizId/questions',
  requirePermission('quiz.update'),
  validate(quizIdOnlyParamsSchema, 'params'),
  validate(addQuestionToQuizSchema),
  addQuestionToQuiz,
);

/**
 * @route DELETE /api/v1/quizzes/:quizId/questions/:questionId
 * @desc Remove question from quiz
 * @access Private (Admin/Trainer)
 */
router.delete(
  '/:quizId/questions/:questionId',
  requirePermission('quiz.update'),
  validate(quizQuestionParamsSchema, 'params'),
  removeQuestionFromQuiz,
);

/**
 * @route PUT /api/v1/quizzes/:quizId/questions/:questionId
 * @desc Update quiz question settings (points, order, isRequired)
 * @access Private (Admin/Trainer)
 */
router.put(
  '/:quizId/questions/:questionId',
  requirePermission('quiz.update'),
  validate(quizQuestionParamsSchema, 'params'),
  validate(updateQuizQuestionSchema),
  updateQuizQuestion,
);

/**
 * @route POST /api/v1/quizzes/:quizId/questions/reorder
 * @desc Reorder quiz questions
 * @access Private (Admin/Trainer)
 */
router.post(
  '/:quizId/questions/reorder',
  requirePermission('quiz.update'),
  validate(quizIdOnlyParamsSchema, 'params'),
  validate(reorderQuizQuestionsSchema),
  reorderQuizQuestions,
);

export default router;
