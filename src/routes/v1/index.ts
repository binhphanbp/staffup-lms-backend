import { Router, type Router as ExpressRouter } from 'express';
import authRoutes from '@/routes/v1/auth.routes';
import courseRoutes from '@/routes/v1/course.routes';
import departmentRoutes from '@/routes/v1/department.routes';
import roleRoutes from '@/routes/v1/role.routes';
import roadmapRoutes from '@/routes/v1/roadmap.routes';
import categoryRoutes from '@/routes/v1/category.routes';
import tagRoutes from '@/routes/v1/tag.routes';
import enrollmentRoutes from '@/routes/v1/enrollment.routes';
import { openApiDocument } from '@/docs/openapi';
import { scalarCsp, scalarHtml } from '@/docs/scalar';

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

// OpenAPI and interactive docs
router.get('/openapi.json', (_req, res) => {
  res.json(openApiDocument);
});

router.get('/docs', (_req, res) => {
  res.setHeader('Content-Security-Policy', scalarCsp);
  res.type('html').send(scalarHtml);
});

// Mount module routes
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/departments', departmentRoutes);
router.use('/roles', roleRoutes);
router.use('/roadmaps', roadmapRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/enrollments', enrollmentRoutes);
export default router;
