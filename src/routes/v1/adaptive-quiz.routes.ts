import { Router, type Router as ExpressRouter } from 'express';
import {
  abandonSession,
  endSession,
  getSession,
  listEligibleBanks,
  listMySessions,
  startSession,
  submitAnswer,
} from '@/controllers/adaptive-quiz.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  listSessionsQuerySchema,
  sessionIdParamsSchema,
  startSessionSchema,
  submitAnswerSchema,
} from '@/schemas/adaptive-quiz.schema';

const router: ExpressRouter = Router();

router.use(authenticate);

router.get('/banks', listEligibleBanks);
router.get('/sessions', validate(listSessionsQuerySchema, 'query'), listMySessions);
router.post('/sessions/start', validate(startSessionSchema, 'body'), startSession);
router.get('/sessions/:id', validate(sessionIdParamsSchema, 'params'), getSession);
router.post(
  '/sessions/:id/answer',
  validate(sessionIdParamsSchema, 'params'),
  validate(submitAnswerSchema, 'body'),
  submitAnswer,
);
router.post('/sessions/:id/end', validate(sessionIdParamsSchema, 'params'), endSession);
router.post('/sessions/:id/abandon', validate(sessionIdParamsSchema, 'params'), abandonSession);

export default router;
