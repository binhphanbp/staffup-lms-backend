import { Router, type Router as ExpressRouter } from 'express';
import { generateSummary, getSummary, deleteSummary } from '@/controllers/video-summary.controller';
import { authenticate, validate } from '@/middlewares';
import { generateVideoSummarySchema } from '@/schemas/video-summary.schema';

const router: ExpressRouter = Router();

router.use(authenticate);

router.get('/:lessonId', getSummary);
router.post('/:lessonId/generate', validate(generateVideoSummarySchema), generateSummary);
router.delete('/:lessonId', deleteSummary);

export default router;
