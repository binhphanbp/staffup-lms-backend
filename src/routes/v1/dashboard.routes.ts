import { Router } from 'express';
import { DashboardController } from '@/controllers/dashboard.controller';
import { authenticate, restrictTo } from '@/middlewares';

const router: Router = Router();

// Admin only - get dashboard statistics
router.get('/', authenticate, restrictTo('admin'), DashboardController.getDashboardStats);

// Manager - get department dashboard statistics
router.get(
  '/manager',
  authenticate,
  restrictTo('manager'),
  DashboardController.getManagerDashboardStats,
);

// Trainer - get trainer dashboard statistics
router.get(
  '/trainer',
  authenticate,
  restrictTo('trainer'),
  DashboardController.getTrainerDashboardStats,
);

// Employee/Student - get personal dashboard statistics
router.get(
  '/employee',
  authenticate,
  restrictTo('employee'),
  DashboardController.getEmployeeDashboardStats,
);

// ========================
// AI Insights
// ========================

/**
 * @route   GET /api/v1/dashboard/ai-insights
 * @desc    Get AI-generated dashboard insights (auto-scoped by role)
 * @access  Private (Admin, Manager, Trainer)
 * @query   refresh=true  → force regeneration (bypass 1-hour cache)
 */
router.get(
  '/ai-insights',
  authenticate,
  restrictTo('admin', 'manager', 'trainer'),
  DashboardController.getAiInsights,
);

export default router;
