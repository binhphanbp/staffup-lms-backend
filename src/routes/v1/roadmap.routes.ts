import { Router, type Router as ExpressRouter } from 'express';
import { RoadmapController } from '@/controllers/roadmap.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { roadmapIdParamSchema } from '@/schemas/roadmap.schema';

const router: ExpressRouter = Router();

/**
 * @route   GET /api/v1/roadmaps/:id/detail
 * @desc    Get roadmap detail with courses and user assignment status
 * @access  Private (authenticated users)
 */
router.get(
  '/:id/detail',
  authenticate,
  validate(roadmapIdParamSchema, 'params'),
  RoadmapController.getRoadmapDetail,
);

export default router;
