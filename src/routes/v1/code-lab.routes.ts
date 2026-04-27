import { Router, type Router as ExpressRouter } from 'express';
import { CodeLabController } from '@/controllers/code-lab.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { evaluateCodeSchema, submitProblemSchema } from '@/schemas/code-lab.schema';

const router: ExpressRouter = Router();

router.use(authenticate);

// ----------------------------------------------------------------
// Multi-problem registry + persisted submissions
// ----------------------------------------------------------------

// GET /api/v1/code-lab/problems?language=&difficulty=&q= — list published problems
router.get('/problems', CodeLabController.listProblems);

// GET /api/v1/code-lab/problems/:slug — full problem detail
router.get('/problems/:slug', CodeLabController.getProblem);

// POST /api/v1/code-lab/problems/:slug/submit — evaluate + persist a submission
router.post(
  '/problems/:slug/submit',
  validate(submitProblemSchema),
  CodeLabController.submitProblem,
);

// GET /api/v1/code-lab/problems/:slug/submissions — admin/trainer view of all student submissions
router.get('/problems/:slug/submissions', CodeLabController.listProblemSubmissions);

// GET /api/v1/code-lab/problems/:slug/submissions/me — my submissions for this problem
router.get('/problems/:slug/submissions/me', CodeLabController.listMySubmissions);

// GET /api/v1/code-lab/submissions/me — all of my submissions across problems
router.get('/submissions/me', CodeLabController.listMySubmissions);

// GET /api/v1/code-lab/submissions/:submissionId — single submission detail
router.get('/submissions/:submissionId', CodeLabController.getSubmission);

// ----------------------------------------------------------------
// Legacy ad-hoc evaluate (kept for backward compat — does NOT persist)
// ----------------------------------------------------------------

// POST /api/v1/code-lab/evaluate
router.post('/evaluate', validate(evaluateCodeSchema), CodeLabController.evaluate);

export default router;
