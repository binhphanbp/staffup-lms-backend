import type { Response } from 'express';
import { ForumService } from '@/services/forum.service';
import { catchAsync, sendCreated, sendNoContent, sendSuccess } from '@/utils';
import type { AuthRequest } from '@/interfaces';
import type { ListThreadsQuery } from '@/schemas/forum.schema';

export const listThreads = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await ForumService.listThreads(
    req.params.courseId as string,
    req.query as unknown as ListThreadsQuery,
    req.user!.userId,
    req.user!.roleCodes,
  );
  sendSuccess(res, result, 'Discussion threads retrieved successfully');
});

export const createThread = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await ForumService.createThread(
    req.params.courseId as string,
    req.body,
    req.user!.userId,
    req.user!.roleCodes,
  );
  sendCreated(res, result, 'Discussion thread created successfully');
});

export const getThread = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await ForumService.getThread(
    req.params.threadId as string,
    req.user!.userId,
    req.user!.roleCodes,
  );
  sendSuccess(res, result, 'Discussion thread retrieved successfully');
});

export const updateThread = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await ForumService.updateThread(
    req.params.threadId as string,
    req.body,
    req.user!.userId,
    req.user!.roleCodes,
  );
  sendSuccess(res, result, 'Discussion thread updated successfully');
});

export const deleteThread = catchAsync(async (req: AuthRequest, res: Response) => {
  await ForumService.deleteThread(
    req.params.threadId as string,
    req.user!.userId,
    req.user!.roleCodes,
  );
  sendNoContent(res);
});

export const togglePin = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await ForumService.toggleThreadFlag(
    req.params.threadId as string,
    'isPinned',
    req.user!.userId,
    req.user!.roleCodes,
  );
  sendSuccess(res, result, 'Discussion pin status updated successfully');
});

export const toggleLock = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await ForumService.toggleThreadFlag(
    req.params.threadId as string,
    'isLocked',
    req.user!.userId,
    req.user!.roleCodes,
  );
  sendSuccess(res, result, 'Discussion lock status updated successfully');
});

export const toggleResolve = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await ForumService.toggleThreadFlag(
    req.params.threadId as string,
    'isResolved',
    req.user!.userId,
    req.user!.roleCodes,
  );
  sendSuccess(res, result, 'Discussion resolved status updated successfully');
});

export const createReply = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await ForumService.createReply(
    req.params.threadId as string,
    req.body,
    req.user!.userId,
    req.user!.roleCodes,
  );
  sendCreated(res, result, 'Discussion reply created successfully');
});

export const updateReply = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await ForumService.updateReply(
    req.params.replyId as string,
    req.body,
    req.user!.userId,
    req.user!.roleCodes,
  );
  sendSuccess(res, result, 'Discussion reply updated successfully');
});

export const deleteReply = catchAsync(async (req: AuthRequest, res: Response) => {
  await ForumService.deleteReply(
    req.params.replyId as string,
    req.user!.userId,
    req.user!.roleCodes,
  );
  sendNoContent(res);
});

export const toggleAcceptReply = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await ForumService.toggleAcceptedReply(
    req.params.replyId as string,
    req.user!.userId,
    req.user!.roleCodes,
  );
  sendSuccess(res, result, 'Accepted answer status updated successfully');
});
