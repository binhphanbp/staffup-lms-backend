import type { Request, Response, NextFunction } from 'express';
import { TagService } from '@/services/tag.service';
import { catchAsync, sendSuccess, sendCreated, sendNoContent } from '@/utils';

export class TagController {
  /**
   * Get all tags
   */
  static getTags = catchAsync(async (_req: Request, res: Response, _next: NextFunction) => {
    const tags = await TagService.getTags();
    sendSuccess(res, tags, 'Tags retrieved successfully');
  });

  /**
   * Get a single tag by ID
   */
  static getTagById = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const tag = await TagService.getTagById(req.params.id as string);
    sendSuccess(res, tag, 'Tag retrieved successfully');
  });

  /**
   * Create a new tag
   */
  static createTag = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const tag = await TagService.createTag(req.body);
    sendCreated(res, tag, 'Tag created successfully');
  });

  /**
   * Update an existing tag
   */
  static updateTag = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    const tag = await TagService.updateTag(req.params.id as string, req.body);
    sendSuccess(res, tag, 'Tag updated successfully');
  });

  /**
   * Delete a tag
   */
  static deleteTag = catchAsync(async (req: Request, res: Response, _next: NextFunction) => {
    await TagService.deleteTag(req.params.id as string);
    sendNoContent(res);
  });
}
