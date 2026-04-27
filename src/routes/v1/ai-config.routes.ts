import { Router } from 'express';
import { getConfig, updateConfig, resetConfig } from '@/controllers/ai-config.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/rbac.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { updateAiConfigSchema } from '@/schemas/ai-config.schema';

const router: Router = Router();

router.use(authenticate, restrictTo('admin'));

router.get('/', getConfig);
router.patch('/', validate(updateAiConfigSchema), updateConfig);
router.post('/reset', resetConfig);

export default router;
