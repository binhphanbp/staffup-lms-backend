import { Router } from 'express';
import {
  abandonSession,
  adminListScenarios,
  createScenario,
  deleteScenario,
  endSession,
  getLeaderboard,
  getScenarioDetail,
  getSessionDetail,
  listMySessions,
  listScenarios,
  sendTurn,
  startSession,
  updateScenario,
} from '@/controllers/roleplay.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/rbac.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  createScenarioSchema,
  listSessionsQuerySchema,
  scenarioIdParamsSchema,
  sendTurnSchema,
  sessionIdParamsSchema,
  startSessionSchema,
  updateScenarioSchema,
} from '@/schemas/roleplay.schema';

const router: Router = Router();

router.use(authenticate);

// ----- Leaderboard -----
router.get('/leaderboard', getLeaderboard);

// ----- Scenarios (any authenticated user can list active scenarios) -----
router.get('/scenarios', listScenarios);
router.get('/scenarios/:id', validate(scenarioIdParamsSchema, 'params'), getScenarioDetail);

// ----- Sessions (student) -----
router.get('/sessions', validate(listSessionsQuerySchema, 'query'), listMySessions);
router.post('/sessions/start', validate(startSessionSchema), startSession);
router.get('/sessions/:sessionId', validate(sessionIdParamsSchema, 'params'), getSessionDetail);
router.post(
  '/sessions/:sessionId/turn',
  validate(sessionIdParamsSchema, 'params'),
  validate(sendTurnSchema),
  sendTurn,
);
router.post('/sessions/:sessionId/end', validate(sessionIdParamsSchema, 'params'), endSession);
router.post(
  '/sessions/:sessionId/abandon',
  validate(sessionIdParamsSchema, 'params'),
  abandonSession,
);

// ----- Admin/trainer scenario CRUD -----
router.get('/admin/scenarios', restrictTo('admin', 'trainer'), adminListScenarios);
router.post(
  '/admin/scenarios',
  restrictTo('admin', 'trainer'),
  validate(createScenarioSchema),
  createScenario,
);
router.patch(
  '/admin/scenarios/:id',
  restrictTo('admin', 'trainer'),
  validate(scenarioIdParamsSchema, 'params'),
  validate(updateScenarioSchema),
  updateScenario,
);
router.delete(
  '/admin/scenarios/:id',
  restrictTo('admin', 'trainer'),
  validate(scenarioIdParamsSchema, 'params'),
  deleteScenario,
);

export default router;
