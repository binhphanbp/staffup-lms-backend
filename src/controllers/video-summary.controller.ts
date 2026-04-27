import type { Response } from 'express';
import type { AuthRequest } from '@/interfaces';
import * as videoSummaryService from '@/services/video-summary.service';
import { catchAsync, sendSuccess, sendNoContent, AppError } from '@/utils';

const parseLessonId = (req: AuthRequest): bigint => {
  const raw = req.params.lessonId;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new AppError('Mã bài học không hợp lệ.', 400);
  }
  return BigInt(value);
};

const buildActor = (req: AuthRequest) => ({
  userId: BigInt(req.user!.userId),
  roleCodes: req.user!.roleCodes,
});

export const generateSummary = catchAsync(async (req: AuthRequest, res: Response) => {
  const lessonId = parseLessonId(req);
  const summary = await videoSummaryService.generateVideoSummary(
    buildActor(req),
    lessonId,
    req.body,
  );
  sendSuccess(res, summary, 'Tóm tắt video đã được sinh thành công.');
});

export const getSummary = catchAsync(async (req: AuthRequest, res: Response) => {
  const lessonId = parseLessonId(req);
  const summary = await videoSummaryService.getVideoSummary(buildActor(req), lessonId);
  sendSuccess(res, summary, summary ? 'Tóm tắt bài học' : 'Bài học chưa có tóm tắt.');
});

export const deleteSummary = catchAsync(async (req: AuthRequest, res: Response) => {
  const lessonId = parseLessonId(req);
  await videoSummaryService.deleteVideoSummary(buildActor(req), lessonId);
  sendNoContent(res);
});
