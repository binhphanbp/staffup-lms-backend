import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '@/interfaces';
import type { MediaFolderListQuery, MediaListQuery } from '@/schemas/media.schema';
import { MediaService } from '@/services/media.service';
import { AppError, catchAsync, sendCreated, sendSuccess } from '@/utils';

const parseBooleanInput = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();

  if (['true', '1', 'yes'].includes(normalized)) {
    return true;
  }

  if (['false', '0', 'no'].includes(normalized)) {
    return false;
  }

  throw new AppError('overwrite must be a boolean value.', 400);
};

const parseResourceTypeInput = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value === 'auto' || value === 'image' || value === 'video' || value === 'raw') {
    return value;
  }

  throw new AppError('resourceType must be one of: auto, image, video, raw.', 400);
};

export class MediaController {
  static listFolders = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await MediaService.listFolders(req.query as unknown as MediaFolderListQuery);
    sendSuccess(res, result, 'Media folders retrieved successfully');
  });

  static listByFolder = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await MediaService.listByFolder(req.query as unknown as MediaListQuery);
    sendSuccess(res, result, 'Media retrieved successfully');
  });

  static upload = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    if (!req.file) {
      throw new AppError('A file upload is required. Use the "file" field.', 400);
    }

    const result = await MediaService.upload(req.file, {
      folder: typeof req.body?.folder === 'string' ? req.body.folder : undefined,
      publicId: typeof req.body?.publicId === 'string' ? req.body.publicId : undefined,
      resourceType: parseResourceTypeInput(req.body?.resourceType),
      overwrite: parseBooleanInput(req.body?.overwrite),
    });

    sendCreated(res, result, 'File uploaded successfully');
  });
}
