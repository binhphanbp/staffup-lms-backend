import { z } from 'zod';

export const listRiskAssessmentsQuerySchema = z.object({
  riskLevel: z.enum(['low', 'medium', 'high']).optional(),
  enrollmentId: z.string().regex(/^\d+$/, 'Enrollment ID must be a valid number').optional(),
  userId: z.string().regex(/^\d+$/, 'User ID must be a valid number').optional(),
  courseId: z.string().regex(/^\d+$/, 'Course ID must be a valid number').optional(),
  latestOnly: z.enum(['true', 'false']).optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a valid number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a valid number').optional(),
});

export const ingestRiskAssessmentSchema = z.object({
  enrollmentId: z.string().regex(/^\d+$/, 'Enrollment ID must be a valid number'),
  riskScore: z.number().min(0).max(100, 'Risk score must be between 0 and 100'),
  riskLevel: z.enum(['low', 'medium', 'high'] as const, {
    error: 'Risk level must be low, medium, or high',
  }),
  modelVersion: z.string().max(50).optional(),
  reasons: z.any().optional(),
  recommendations: z.string().optional(),
  interventions: z.string().optional(),
  calculatedAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const enrollmentIdParamsSchema = z.object({
  enrollmentId: z.string().regex(/^\d+$/, 'Enrollment ID must be a valid number'),
});

export const assessmentHistoryQuerySchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a valid number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a valid number').optional(),
});

export type ListRiskAssessmentsQuery = z.infer<typeof listRiskAssessmentsQuerySchema>;
export type IngestRiskAssessmentBody = z.infer<typeof ingestRiskAssessmentSchema>;
export type EnrollmentIdParams = z.infer<typeof enrollmentIdParamsSchema>;
export type AssessmentHistoryQuery = z.infer<typeof assessmentHistoryQuerySchema>;
