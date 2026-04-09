import type { Request, Response, NextFunction } from 'express';
import { CategoryService } from '@/services/category.service';
import { catchAsync, sendSuccess, sendCreated, sendNoContent } from '@/utils';
import type { CategoryListQuery } from '@/schemas/category.schema';

export class CategoryController {
  /**
   * Get all categories
   */
  static getCategories = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const { tree, activeOnly } = req.query as unknown as CategoryListQuery;
    const isTree = tree ?? false;
    const onlyActive = activeOnly ?? false;
    const categories = await CategoryService.getCategories(isTree, onlyActive);
    sendSuccess(res, categories, 'Categories retrieved successfully');
  });

  /**
   * Get a single category by ID
   */
  static getCategoryById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const category = await CategoryService.getCategoryById(req.params.id as string);
    sendSuccess(res, category, 'Category retrieved successfully');
  });

  /**
   * Create a new category
   */
  static createCategory = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const category = await CategoryService.createCategory(req.body);
    sendCreated(res, category, 'Category created successfully');
  });

  /**
   * Update an existing category
   */
  static updateCategory = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const category = await CategoryService.updateCategory(req.params.id as string, req.body);
    sendSuccess(res, category, 'Category updated successfully');
  });

  /**
   * Delete a category
   */
  static deleteCategory = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    await CategoryService.deleteCategory(req.params.id as string);
    sendNoContent(res);
  });
}
