import { Router } from 'express';
import { getDepartmentAnalytics } from '@/controllers/department-analytics.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/rbac.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { departmentAnalyticsQuerySchema } from '@/schemas/department-analytics.schema';

const router: Router = Router();

router.use(authenticate, restrictTo('manager', 'admin'));

router.get('/', validate(departmentAnalyticsQuerySchema, 'query'), getDepartmentAnalytics);

export default router;
