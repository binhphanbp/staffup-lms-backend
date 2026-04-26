import { Router, type Router as ExpressRouter } from 'express';
import { RecommendationController } from '@/controllers/recommendation.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { getMyRecommendationsSchema } from '@/schemas/recommendation.schema';

const router: ExpressRouter = Router();

router.use(authenticate);

// GET /api/v1/recommendations/me — AI-personalized course recommendations
router.get(
  '/me',
  validate(getMyRecommendationsSchema, 'query'),
  RecommendationController.getMyRecommendations,
);

export default router;
