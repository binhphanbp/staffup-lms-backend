import { Router, type Router as ExpressRouter } from 'express';
import { MediaController } from '@/controllers/media.controller';
import { mediaFolderListQuerySchema, mediaListQuerySchema } from '@/schemas/media.schema';
import { authenticate, mediaUpload, requirePermission, validate } from '@/middlewares';

const router: ExpressRouter = Router();

router.use(authenticate);

router.get(
  '/folders',
  requirePermission('course.read'),
  validate(mediaFolderListQuerySchema, 'query'),
  MediaController.listFolders,
);

router.get(
  '/',
  requirePermission('course.read'),
  validate(mediaListQuerySchema, 'query'),
  MediaController.listByFolder,
);

router.post(
  '/upload',
  requirePermission('course.update'),
  mediaUpload.single('file'),
  MediaController.upload,
);

export default router;
