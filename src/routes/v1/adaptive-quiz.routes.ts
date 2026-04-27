import { Router, type Router as ExpressRouter } from 'express';
import {
  abandonSession,
  autoTuneBank,
  bulkSetDifficulty,
  endSession,
  getAdminBank,
  getLeaderboard,
  getSession,
  listAdminBanks,
  listEligibleBanks,
  listMySessions,
  startSession,
  submitAnswer,
} from '@/controllers/adaptive-quiz.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/rbac.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  autoTuneSchema,
  bankIdParamsSchema,
  bulkSetDifficultySchema,
  listSessionsQuerySchema,
  sessionIdParamsSchema,
  startSessionSchema,
  submitAnswerSchema,
} from '@/schemas/adaptive-quiz.schema';

const router: ExpressRouter = Router();

router.use(authenticate);

// ---------- Admin / trainer endpoints ----------
router.get('/admin/banks', requireRole('admin', 'trainer', 'manager'), listAdminBanks);
router.get(
  '/admin/banks/:id',
  requireRole('admin', 'trainer', 'manager'),
  validate(bankIdParamsSchema, 'params'),
  getAdminBank,
);
router.patch(
  '/admin/questions/bulk-difficulty',
  requireRole('admin', 'trainer', 'manager'),
  validate(bulkSetDifficultySchema, 'body'),
  bulkSetDifficulty,
);
router.post(
  '/admin/banks/:id/auto-tune',
  requireRole('admin', 'trainer', 'manager'),
  validate(bankIdParamsSchema, 'params'),
  validate(autoTuneSchema, 'body'),
  autoTuneBank,
);

// ---------- Leaderboard ----------
router.get('/leaderboard', getLeaderboard);

// ---------- Student endpoints ----------
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
