import { Router } from 'express';
import {
  getGraph,
  previewPath,
  generateEmail,
  addEdge,
  removeEdge,
  setTestResults,
  listEmployees,
} from '@/controllers/learning-path.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { restrictTo } from '@/middlewares/rbac.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  previewSchema,
  generateEmailSchema,
  addEdgeSchema,
  setTestResultsSchema,
} from '@/schemas/learning-path.schema';

const router: Router = Router();

router.use(authenticate);

// Read endpoints — mọi user authenticated đều xem được
router.get('/graph', getGraph);
router.get('/users', listEmployees);
router.post('/preview', validate(previewSchema, 'all'), previewPath);

// Generate email — admin / manager / trainer
router.post(
  '/generate-email',
  restrictTo('admin', 'manager', 'trainer'),
  validate(generateEmailSchema, 'all'),
  generateEmail,
);

// Admin CRUD (judge mode)
router.post('/edges', restrictTo('admin'), validate(addEdgeSchema, 'all'), addEdge);
router.delete('/edges/:id', restrictTo('admin'), removeEdge);
router.post(
  '/test-results',
  restrictTo('admin'),
  validate(setTestResultsSchema, 'all'),
  setTestResults,
);

export default router;
