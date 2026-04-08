import { z } from 'zod';

export const listCertificatesQuerySchema = z.object({
  userId: z.string().regex(/^\d+$/, 'User ID must be a valid number').optional(),
  courseId: z.string().regex(/^\d+$/, 'Course ID must be a valid number').optional(),
  enrollmentId: z.string().regex(/^\d+$/, 'Enrollment ID must be a valid number').optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a valid number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a valid number').optional(),
});

export const certificateIdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Certificate ID must be a valid number'),
});

export const revokeCertificateParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Certificate ID must be a valid number'),
});

export const enrollmentIdParamsSchema = z.object({
  enrollmentId: z.string().regex(/^\d+$/, 'Enrollment ID must be a valid number'),
});

export const issueCertificateParamsSchema = z.object({
  enrollmentId: z.string().regex(/^\d+$/, 'Enrollment ID must be a valid number'),
});

export type ListCertificatesQuery = z.infer<typeof listCertificatesQuerySchema>;
export type CertificateIdParams = z.infer<typeof certificateIdParamsSchema>;
export type RevokeCertificateParams = z.infer<typeof revokeCertificateParamsSchema>;
export type EnrollmentIdParams = z.infer<typeof enrollmentIdParamsSchema>;
export type IssueCertificateParams = z.infer<typeof issueCertificateParamsSchema>;
