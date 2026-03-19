import { Router } from 'express';
import authRoutes from '@/routes/v1/auth.routes';
import courseRoutes from '@/routes/v1/course.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Staffup LMS API is running 🚀',
    timestamp: new Date().toISOString(),
  });
});

// Mount module routes
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);

export default router;
