import { Router, type Router as ExpressRouter } from 'express';
import { QuestionBankController } from '@/controllers/question-bank.controller';
import { QuestionController } from '@/controllers/question.controller';
import { authenticate, validate, restrictTo } from '@/middlewares';
import {
  createQuestionBankSchema,
  updateQuestionBankSchema,
  listQuestionBanksSchema,
} from '@/schemas/question-bank.schema';
import {
  createQuestionSchema,
  updateQuestionSchema,
  listQuestionsSchema,
} from '@/schemas/question.schema';
import { createOptionSchema, updateOptionSchema } from '@/schemas/question-option.schema';

const router: ExpressRouter = Router();

router.use(authenticate);
router.use(restrictTo('admin', 'trainer'));

// ─── Question Banks ───────────────────────────────────────────────────────────
router
  .route('/')
  .get(validate(listQuestionBanksSchema, 'query'), QuestionBankController.findAll)
  .post(validate(createQuestionBankSchema), QuestionBankController.create);

// ─── Nested: Questions under a bank ──────────────────────────────────────────
// IMPORTANT: these must come BEFORE /:id to avoid param conflict
router
  .route('/:bankId/questions')
  .get(validate(listQuestionsSchema, 'query'), QuestionController.findAll)
  .post(validate(createQuestionSchema), QuestionController.create);

router.patch('/:bankId/questions/:id/deactivate', QuestionController.deactivate);

router
  .route('/:bankId/questions/:id')
  .get(QuestionController.findById)
  .put(validate(updateQuestionSchema), QuestionController.update);

// ─── Nested: Options under a question ────────────────────────────────────────
router
  .route('/:bankId/questions/:questionId/options')
  .post(validate(createOptionSchema), QuestionController.createOption);

router
  .route('/:bankId/questions/:questionId/options/:optionId')
  .put(validate(updateOptionSchema), QuestionController.updateOption)
  .delete(QuestionController.deleteOption);

// ─── Question Bank by ID (must come LAST to avoid swallowing nested routes) ──
router
  .route('/:id')
  .get(QuestionBankController.findById)
  .put(validate(updateQuestionBankSchema), QuestionBankController.update)
  .delete(QuestionBankController.delete);

export default router;
