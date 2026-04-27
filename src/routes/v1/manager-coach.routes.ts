import { Router } from 'express';
import {
  chat,
  generateWeeklyBriefing,
  getTeamOverview,
} from '@/controllers/manager-coach.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/rbac.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { managerCoachChatSchema, weeklyBriefingSchema } from '@/schemas/manager-coach.schema';

const router: Router = Router();

router.use(authenticate, restrictTo('manager', 'admin'));

router.get('/team-overview', getTeamOverview);
router.post('/chat', validate(managerCoachChatSchema), chat);
router.post('/weekly-briefing/generate', validate(weeklyBriefingSchema), generateWeeklyBriefing);

export default router;
