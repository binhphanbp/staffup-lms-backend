import { Router, type Router as ExpressRouter } from 'express';
import { CategoryController } from '@/controllers/category.controller';
import { authenticate, validate, restrictTo } from '@/middlewares';
import {
  categoryIdParamSchema,
  categoryListQuerySchema,
  createCategorySchema,
  updateCategorySchema,
} from '@/schemas/category.schema';

const router: ExpressRouter = Router();

// GET all categories and GET by ID are protected by authenticate but open to all roles
router.use(authenticate);

router
  .route('/')
  .get(validate(categoryListQuerySchema, 'query'), CategoryController.getCategories)
  .post(restrictTo('admin'), validate(createCategorySchema), CategoryController.createCategory);

router
  .route('/:id')
  .all(validate(categoryIdParamSchema, 'params'))
  .get(CategoryController.getCategoryById)
  .put(restrictTo('admin'), validate(updateCategorySchema), CategoryController.updateCategory)
  .delete(restrictTo('admin'), CategoryController.deleteCategory);

export default router;
