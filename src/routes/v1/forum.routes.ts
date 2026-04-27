import { Router, type Router as ExpressRouter } from 'express';
import {
  createReply,
  createThread,
  deleteReply,
  deleteThread,
  getThread,
  listThreads,
  toggleAcceptReply,
  toggleLock,
  togglePin,
  toggleResolve,
  updateReply,
  updateThread,
} from '@/controllers/forum.controller';
import { authenticate, validate } from '@/middlewares';
import {
  courseForumParamsSchema,
  createReplySchema,
  createThreadSchema,
  listThreadsQuerySchema,
  replyParamsSchema,
  threadParamsSchema,
  updateReplySchema,
  updateThreadSchema,
} from '@/schemas/forum.schema';

const router: ExpressRouter = Router();

router.use(authenticate);

router
  .route('/courses/:courseId/forum/threads')
  .get(
    validate(courseForumParamsSchema, 'params'),
    validate(listThreadsQuerySchema, 'query'),
    listThreads,
  )
  .post(validate(courseForumParamsSchema, 'params'), validate(createThreadSchema), createThread);

router
  .route('/forum/threads/:threadId')
  .get(validate(threadParamsSchema, 'params'), getThread)
  .patch(validate(threadParamsSchema, 'params'), validate(updateThreadSchema), updateThread)
  .delete(validate(threadParamsSchema, 'params'), deleteThread);

router.post('/forum/threads/:threadId/pin', validate(threadParamsSchema, 'params'), togglePin);
router.post('/forum/threads/:threadId/lock', validate(threadParamsSchema, 'params'), toggleLock);
router.post(
  '/forum/threads/:threadId/resolve',
  validate(threadParamsSchema, 'params'),
  toggleResolve,
);
router.post(
  '/forum/threads/:threadId/replies',
  validate(threadParamsSchema, 'params'),
  validate(createReplySchema),
  createReply,
);

router
  .route('/forum/replies/:replyId')
  .patch(validate(replyParamsSchema, 'params'), validate(updateReplySchema), updateReply)
  .delete(validate(replyParamsSchema, 'params'), deleteReply);

router.post(
  '/forum/replies/:replyId/accept',
  validate(replyParamsSchema, 'params'),
  toggleAcceptReply,
);

export default router;
