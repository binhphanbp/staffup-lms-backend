import type { Response, NextFunction } from 'express';
import { CodeLabService } from '@/services/code-lab.service';
import { catchAsync, sendSuccess, AppError } from '@/utils';
import { listProblemsQuerySchema, listSubmissionsQuerySchema } from '@/schemas/code-lab.schema';
import type { AuthRequest } from '@/interfaces';

const buildActor = (req: AuthRequest) => ({
  userId: BigInt(req.user!.userId),
  roleCodes: req.user!.roleCodes,
});

const parseSubmissionId = (req: AuthRequest): bigint => {
  const raw = req.params.submissionId;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new AppError('Mã submission không hợp lệ.', 400);
  }
  return BigInt(value);
};

export class CodeLabController {
  // Legacy ad-hoc evaluate (kept for backward compat with existing FE).
  static evaluate = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await CodeLabService.evaluate(req.body);
    sendSuccess(res, result, 'Code evaluated by AI');
  });

  static listProblems = catchAsync(async (req: AuthRequest, res: Response) => {
    const query = listProblemsQuerySchema.parse(req.query);
    const problems = await CodeLabService.listProblems(query);
    sendSuccess(res, problems, 'Danh sách bài lab');
  });

  static getProblem = catchAsync(async (req: AuthRequest, res: Response) => {
    const slug = String(req.params.slug ?? '');
    if (!slug) throw new AppError('Slug không hợp lệ.', 400);
    const problem = await CodeLabService.getProblemBySlug(slug);
    sendSuccess(res, problem, 'Chi tiết bài lab');
  });

  static submitProblem = catchAsync(async (req: AuthRequest, res: Response) => {
    const slug = String(req.params.slug ?? '');
    if (!slug) throw new AppError('Slug không hợp lệ.', 400);
    const result = await CodeLabService.submitToProblem(buildActor(req), slug, req.body);
    sendSuccess(res, result, 'Bài làm đã được AI đánh giá và lưu lại.');
  });

  static listMySubmissions = catchAsync(async (req: AuthRequest, res: Response) => {
    const query = listSubmissionsQuerySchema.parse(req.query);
    const slugRaw = req.params.slug;
    const slug = typeof slugRaw === 'string' && slugRaw.length > 0 ? slugRaw : null;
    const rows = await CodeLabService.listMySubmissions(buildActor(req), slug, query);
    sendSuccess(res, rows, 'Lịch sử nộp bài của bạn');
  });

  static listProblemSubmissions = catchAsync(async (req: AuthRequest, res: Response) => {
    const slug = String(req.params.slug ?? '');
    if (!slug) throw new AppError('Slug không hợp lệ.', 400);
    const query = listSubmissionsQuerySchema.parse(req.query);
    const rows = await CodeLabService.listProblemSubmissions(buildActor(req), slug, query);
    sendSuccess(res, rows, 'Submission của tất cả học viên cho bài lab này');
  });

  static getSubmission = catchAsync(async (req: AuthRequest, res: Response) => {
    const submissionId = parseSubmissionId(req);
    const submission = await CodeLabService.getSubmission(buildActor(req), submissionId);
    sendSuccess(res, submission, 'Chi tiết submission');
  });
}
