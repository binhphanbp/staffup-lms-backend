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

const router: ExpressRouter = Router();

router.use(authenticate);
router.use(restrictTo('admin', 'trainer'));

// Question Banks
router
  .route('/')
  .get(validate(listQuestionBanksSchema, 'query'), QuestionBankController.findAll)
  .post(validate(createQuestionBankSchema), QuestionBankController.create);

router
  .route('/:id')
  .get(QuestionBankController.findById)
  .put(validate(updateQuestionBankSchema), QuestionBankController.update)
  .delete(QuestionBankController.delete);

// Questions nested under a bank
router
  .route('/:bankId/questions')
  .get(validate(listQuestionsSchema, 'query'), QuestionController.findAll)
  .post(validate(createQuestionSchema), QuestionController.create);

router
  .route('/:bankId/questions/:id')
  .get(QuestionController.findById)
  .put(validate(updateQuestionSchema), QuestionController.update);

router.patch('/:bankId/questions/:id/deactivate', QuestionController.deactivate);

export default router;
