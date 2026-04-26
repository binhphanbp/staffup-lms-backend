import { Router, type Router as ExpressRouter } from 'express';
import { CodeLabController } from '@/controllers/code-lab.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { evaluateCodeSchema } from '@/schemas/code-lab.schema';

const router: ExpressRouter = Router();

router.use(authenticate);

// POST /api/v1/code-lab/evaluate — AI code review + simulated test runs
router.post('/evaluate', validate(evaluateCodeSchema), CodeLabController.evaluate);

export default router;
