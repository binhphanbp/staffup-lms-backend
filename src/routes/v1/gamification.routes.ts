import { Router } from 'express';
import {
  getMyStats,
  getMyBadges,
  getMyXpTransactions,
  getLeaderboard,
} from '@/controllers/gamification.controller';
import { authenticate } from '@/middlewares/auth.middleware';

const router: Router = Router();

router.use(authenticate);

router.get('/me', getMyStats);
router.get('/me/badges', getMyBadges);
router.get('/me/transactions', getMyXpTransactions);
router.get('/leaderboard', getLeaderboard);

export default router;
