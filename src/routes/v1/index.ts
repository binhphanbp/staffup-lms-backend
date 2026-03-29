import { Router, type Router as ExpressRouter } from 'express';
import authRoutes from '@/routes/v1/auth.routes';
import courseRoutes from '@/routes/v1/course.routes';
import departmentRoutes from '@/routes/v1/department.routes';
const router: ExpressRouter = Router();

// Health check
router.get(['/', ''], (_req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Staffup LMS API v1',
  });
});

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
router.use('/departments', departmentRoutes);
export default router;
