import { Router } from 'express';
import {
  assignPlan,
  cloneTemplate,
  createTemplate,
  deletePlan,
  deleteTemplate,
  generateTemplate,
  getMyActivePlan,
  getPlan,
  getTemplate,
  listAssignableUsers,
  listPlans,
  listTemplates,
  updatePlan,
  updatePlanTaskStatus,
  updateTemplate,
} from '@/controllers/onboarding.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/rbac.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  aiGenerateTemplateSchema,
  assignPlanSchema,
  listPlansQuerySchema,
  listTemplatesQuerySchema,
  planIdParamsSchema,
  planTaskParamsSchema,
  templateIdParamsSchema,
  updatePlanSchema,
  updateTaskStatusSchema,
  upsertTemplateSchema,
} from '@/schemas/onboarding.schema';

const router: Router = Router();

router.use(authenticate);

// ----- Templates -----
router.get('/templates', validate(listTemplatesQuerySchema, 'query'), listTemplates);
router.post(
  '/templates',
  restrictTo('admin', 'manager', 'trainer'),
  validate(upsertTemplateSchema),
  createTemplate,
);
router.post(
  '/templates/ai-generate',
  restrictTo('admin', 'manager', 'trainer'),
  validate(aiGenerateTemplateSchema),
  generateTemplate,
);
router.get('/templates/:id', validate(templateIdParamsSchema, 'params'), getTemplate);
router.put(
  '/templates/:id',
  restrictTo('admin', 'manager', 'trainer'),
  validate(templateIdParamsSchema, 'params'),
  validate(upsertTemplateSchema),
  updateTemplate,
);
router.delete(
  '/templates/:id',
  restrictTo('admin', 'manager', 'trainer'),
  validate(templateIdParamsSchema, 'params'),
  deleteTemplate,
);
router.post(
  '/templates/:id/clone',
  restrictTo('admin', 'manager', 'trainer'),
  validate(templateIdParamsSchema, 'params'),
  cloneTemplate,
);

// ----- Plans -----
router.get('/plans', validate(listPlansQuerySchema, 'query'), listPlans);
router.get('/plans/me/active', getMyActivePlan);
router.post(
  '/plans/assign',
  restrictTo('admin', 'manager', 'trainer'),
  validate(assignPlanSchema),
  assignPlan,
);
router.get('/plans/:id', validate(planIdParamsSchema, 'params'), getPlan);
router.patch(
  '/plans/:id',
  restrictTo('admin', 'manager', 'trainer'),
  validate(planIdParamsSchema, 'params'),
  validate(updatePlanSchema),
  updatePlan,
);
router.delete(
  '/plans/:id',
  restrictTo('admin', 'manager', 'trainer'),
  validate(planIdParamsSchema, 'params'),
  deletePlan,
);
router.patch(
  '/plans/:id/tasks/:taskId/status',
  validate(planTaskParamsSchema, 'params'),
  validate(updateTaskStatusSchema),
  updatePlanTaskStatus,
);

// ----- Assignable users (for manager UI) -----
router.get('/assignable-users', restrictTo('admin', 'manager', 'trainer'), listAssignableUsers);

export default router;
