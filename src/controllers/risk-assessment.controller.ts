import type { Response } from 'express';
import type { AuthRequest } from '@/interfaces';
import { RiskAssessmentService } from '@/services/risk-assessment.service';
import { catchAsync, sendSuccess } from '@/utils';

export const listRiskAssessments = catchAsync(async (req: AuthRequest, res: Response) => {
  const { riskLevel, enrollmentId, userId, courseId, latestOnly, page, limit } = req.query;
  const requestUserId = req.user!.userId;

  const result = await RiskAssessmentService.listRiskAssessments(
    {
      riskLevel: riskLevel as 'low' | 'medium' | 'high' | undefined,
      enrollmentId: enrollmentId as string,
      userId: userId as string,
      courseId: courseId as string,
      latestOnly: latestOnly === 'true',
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    },
    requestUserId,
  );

  sendSuccess(res, result, 'Risk assessments retrieved successfully');
});

export const ingestRiskAssessment = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await RiskAssessmentService.ingestRiskAssessment(req.body);

  sendSuccess(res, result, 'Risk assessment ingested successfully', 201);
});

export const getLatestAssessment = catchAsync(async (req: AuthRequest, res: Response) => {
  const enrollmentId = Array.isArray(req.params.enrollmentId)
    ? req.params.enrollmentId[0]
    : req.params.enrollmentId;
  const userId = req.user!.userId;

  const assessment = await RiskAssessmentService.getLatestAssessment(enrollmentId, userId);

  sendSuccess(res, assessment, 'Risk assessment retrieved successfully');
});

export const getAssessmentHistory = catchAsync(async (req: AuthRequest, res: Response) => {
  const enrollmentId = Array.isArray(req.params.enrollmentId)
    ? req.params.enrollmentId[0]
    : req.params.enrollmentId;
  const userId = req.user!.userId;
  const { page, limit } = req.query;

  const result = await RiskAssessmentService.getAssessmentHistory(
    enrollmentId,
    userId,
    page ? Number(page) : undefined,
    limit ? Number(limit) : undefined,
  );

  sendSuccess(res, result, 'Risk assessment history retrieved successfully');
});
