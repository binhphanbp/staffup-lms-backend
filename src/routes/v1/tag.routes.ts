import { Router, type Router as ExpressRouter } from 'express';
import { TagController } from '@/controllers/tag.controller';
import { authenticate, validate, restrictTo } from '@/middlewares';
import { createTagSchema, tagIdParamSchema, updateTagSchema } from '@/schemas/tag.schema';

const router: ExpressRouter = Router();

router.use(authenticate);

router
  .route('/')
  .get(TagController.getTags)
  .post(restrictTo('admin'), validate(createTagSchema), TagController.createTag);

router
  .route('/:id')
  .all(validate(tagIdParamSchema, 'params'))
  .get(TagController.getTagById)
  .put(restrictTo('admin'), validate(updateTagSchema), TagController.updateTag)
  .delete(restrictTo('admin'), TagController.deleteTag);

export default router;
