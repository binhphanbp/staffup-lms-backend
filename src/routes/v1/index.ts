import { Router, type Router as ExpressRouter } from 'express';
import authRoutes from '@/routes/v1/auth.routes';
import courseRoutes from '@/routes/v1/course.routes';
import departmentRoutes from '@/routes/v1/department.routes';
import permissionRoutes from '@/routes/v1/permission.routes';
import roleRoutes from '@/routes/v1/role.routes';
import roadmapRoutes from '@/routes/v1/roadmap.routes';
import categoryRoutes from '@/routes/v1/category.routes';
import tagRoutes from '@/routes/v1/tag.routes';
import enrollmentRoutes from '@/routes/v1/enrollment.routes';
import quizAttemptRoutes from '@/routes/v1/quiz.routes';
import quizManagementRoutes from '@/routes/v1/quiz-management.routes';
import dashboardRoutes from '@/routes/v1/dashboard.routes';
import certificateRoutes from '@/routes/v1/certificate.routes';
import riskAssessmentRoutes from '@/routes/v1/risk-assessment.routes';
import questionBankRoutes from '@/routes/v1/question-bank.routes';
import userRoutes from '@/routes/v1/user.routes';
import aiChatRoutes from '@/routes/v1/ai-chat.routes';
import mediaRoutes from '@/routes/v1/media.routes';
import companyDocumentRoutes from '@/routes/v1/company-document.routes';
import recommendationRoutes from '@/routes/v1/recommendation.routes';
import codeLabRoutes from '@/routes/v1/code-lab.routes';
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
router.use('/permissions', permissionRoutes);
router.use('/roles', roleRoutes);
router.use('/roadmaps', roadmapRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/quiz-attempts', quizAttemptRoutes);
router.use('/quizzes', quizManagementRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/certificates', certificateRoutes);
router.use('/risk-assessments', riskAssessmentRoutes);
router.use('/question-banks', questionBankRoutes);
router.use('/users', userRoutes);
router.use('/ai-chat', aiChatRoutes);
router.use('/media', mediaRoutes);
router.use('/company-documents', companyDocumentRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/code-lab', codeLabRoutes);
export default router;
