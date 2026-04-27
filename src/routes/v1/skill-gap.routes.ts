import { Router, type Router as ExpressRouter } from 'express';
import * as ctrl from '@/controllers/skill-gap.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { requireRole } from '@/middlewares/rbac.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  aiSuggestSchema,
  createSkillSchema,
  departmentIdParamsSchema,
  idParamsSchema,
  listSkillsQuerySchema,
  managerAssessSchema,
  setMySkillSchema,
  setRecommendationSchema,
  skillIdParamsSchema,
  updateSkillSchema,
  upsertPositionSkillSchema,
  userIdParamsSchema,
} from '@/schemas/skill-gap.schema';

const router: ExpressRouter = Router();

router.use(authenticate);

// ---------- Skill catalog (admin/trainer/manager) ----------
router.get('/skills', validate(listSkillsQuerySchema, 'query'), ctrl.listSkills);
router.post(
  '/skills',
  requireRole('admin', 'trainer'),
  validate(createSkillSchema, 'body'),
  ctrl.createSkill,
);
router.patch(
  '/skills/:id',
  requireRole('admin', 'trainer'),
  validate(idParamsSchema, 'params'),
  validate(updateSkillSchema, 'body'),
  ctrl.updateSkill,
);
router.delete(
  '/skills/:id',
  requireRole('admin'),
  validate(idParamsSchema, 'params'),
  ctrl.deleteSkill,
);

// ---------- Position skill mapping (admin/manager) ----------
router.get('/positions', requireRole('admin', 'trainer', 'manager'), ctrl.listPositionTitles);
router.get('/position-skills', requireRole('admin', 'trainer', 'manager'), ctrl.listPositionSkills);
router.post(
  '/position-skills',
  requireRole('admin', 'trainer'),
  validate(upsertPositionSkillSchema, 'body'),
  ctrl.upsertPositionSkill,
);
router.delete(
  '/position-skills/:id',
  requireRole('admin', 'trainer'),
  validate(idParamsSchema, 'params'),
  ctrl.deletePositionSkill,
);

// ---------- User self-assessment ----------
router.get('/my-profile', ctrl.getMyProfile);
router.put(
  '/my-profile/:skillId',
  validate(skillIdParamsSchema, 'params'),
  validate(setMySkillSchema, 'body'),
  ctrl.setMySkillLevel,
);
router.get('/my-gap', ctrl.getMyGap);
router.get('/my-assessments', ctrl.listMyAssessmentHistory);

// ---------- Manager assessment ----------
router.post(
  '/manager-assess',
  requireRole('admin', 'manager'),
  validate(managerAssessSchema, 'body'),
  ctrl.managerAssess,
);
router.get(
  '/users/:userId/gap',
  requireRole('admin', 'manager'),
  validate(userIdParamsSchema, 'params'),
  ctrl.getUserGap,
);
router.get(
  '/team/:departmentId/roll-up',
  requireRole('admin', 'manager'),
  validate(departmentIdParamsSchema, 'params'),
  ctrl.getTeamRollUp,
);

// ---------- AI ----------
router.post(
  '/ai/suggest-skills',
  requireRole('admin', 'trainer'),
  validate(aiSuggestSchema, 'body'),
  ctrl.aiSuggestSkills,
);

// ---------- Course recommendations (admin/trainer) ----------
router.get(
  '/skills/:skillId/courses',
  requireRole('admin', 'trainer', 'manager'),
  validate(skillIdParamsSchema, 'params'),
  ctrl.listSkillRecommendations,
);
router.post(
  '/skills/:skillId/courses',
  requireRole('admin', 'trainer'),
  validate(skillIdParamsSchema, 'params'),
  validate(setRecommendationSchema, 'body'),
  ctrl.setSkillRecommendation,
);
router.delete(
  '/skills/:skillId/courses/:courseId',
  requireRole('admin', 'trainer'),
  ctrl.removeSkillRecommendation,
);

export default router;
