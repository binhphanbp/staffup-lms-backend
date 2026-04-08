import type { Response } from 'express';
import type { AuthRequest } from '@/interfaces';
import { CertificateService } from '@/services/certificate.service';
import { catchAsync, sendSuccess } from '@/utils';

export const listCertificates = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId, courseId, enrollmentId, page, limit } = req.query;

  const result = await CertificateService.listCertificates({
    userId: userId as string,
    courseId: courseId as string,
    enrollmentId: enrollmentId as string,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  sendSuccess(res, result, 'Certificates retrieved successfully');
});

export const getCertificateById = catchAsync(async (req: AuthRequest, res: Response) => {
  const certificateId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = req.user!.userId;

  const certificate = await CertificateService.getCertificateById(certificateId, userId);

  sendSuccess(res, certificate, 'Certificate retrieved successfully');
});

export const getCertificateByEnrollment = catchAsync(async (req: AuthRequest, res: Response) => {
  const enrollmentId = Array.isArray(req.params.enrollmentId)
    ? req.params.enrollmentId[0]
    : req.params.enrollmentId;
  const userId = req.user!.userId;

  const certificate = await CertificateService.getCertificateByEnrollment(enrollmentId, userId);

  sendSuccess(res, certificate, 'Certificate retrieved successfully');
});

export const revokeCertificate = catchAsync(async (req: AuthRequest, res: Response) => {
  const certificateId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = req.user!.userId;

  const result = await CertificateService.revokeCertificate(certificateId, userId);

  sendSuccess(res, result, 'Certificate revoked successfully');
});

export const issueCertificate = catchAsync(async (req: AuthRequest, res: Response) => {
  const enrollmentId = Array.isArray(req.params.enrollmentId)
    ? req.params.enrollmentId[0]
    : req.params.enrollmentId;
  const userId = req.user!.userId;

  const certificate = await CertificateService.issueCertificate(enrollmentId, userId);

  sendSuccess(res, certificate, 'Certificate issued successfully', 201);
});
