import { Router } from 'express';
import {
  getCertificateById,
  getCertificateByEnrollment,
  issueCertificate,
  listCertificates,
  revokeCertificate,
} from '@/controllers/certificate.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  certificateIdParamsSchema,
  enrollmentIdParamsSchema,
  issueCertificateParamsSchema,
  listCertificatesQuerySchema,
  revokeCertificateParamsSchema,
} from '@/schemas/certificate.schema';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /api/v1/certificates
 * @desc List certificates with filters
 * @access Private
 */
router.get('/', validate(listCertificatesQuerySchema, 'query'), listCertificates);

/**
 * @route GET /api/v1/certificates/:id
 * @desc Get certificate detail by ID
 * @access Private (Owner/Trainer/Admin)
 */
router.get('/:id', validate(certificateIdParamsSchema, 'params'), getCertificateById);

/**
 * @route GET /api/v1/certificates/enrollment/:enrollmentId
 * @desc Get certificate by enrollment ID
 * @access Private (Owner/Trainer/Admin)
 */
router.get(
  '/enrollment/:enrollmentId',
  validate(enrollmentIdParamsSchema, 'params'),
  getCertificateByEnrollment,
);

/**
 * @route POST /api/v1/certificates/issue/:enrollmentId
 * @desc Issue certificate for enrollment
 * @access Private (Student/Trainer/Admin)
 */
router.post(
  '/issue/:enrollmentId',
  validate(issueCertificateParamsSchema, 'params'),
  issueCertificate,
);

/**
 * @route DELETE /api/v1/certificates/:id/revoke
 * @desc Revoke certificate (soft delete)
 * @access Private (Trainer/Admin only)
 */
router.delete('/:id/revoke', validate(revokeCertificateParamsSchema, 'params'), revokeCertificate);

export default router;
