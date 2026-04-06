import { Router } from 'express';
import { DashboardController } from '@/controllers/dashboard.controller';
import { authenticate, restrictTo } from '@/middlewares';

const router = Router();

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
  restrictTo('employee', 'student'),
  DashboardController.getEmployeeDashboardStats,
);

export default router;
