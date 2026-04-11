import { Router, type Router as ExpressRouter } from 'express';
import { CompanyDocumentController } from '@/controllers/company-document.controller';
import { authenticate, restrictTo, validate } from '@/middlewares';
import {
  companyDocumentIdParamSchema,
  companyDocumentListQuerySchema,
  createCompanyDocumentSchema,
  updateCompanyDocumentSchema,
} from '@/schemas/company-document.schema';

import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const router: ExpressRouter = Router();

// All routes require authentication + admin role
router.use(authenticate);
router.use(restrictTo('admin'));

/**
 * @route   POST /api/v1/company-documents/extract-text
 * @desc    Upload file PDF/DOCX/TXT and extract text
 * @access  Private (Admin only)
 */
router.post('/extract-text', upload.single('file'), CompanyDocumentController.extractTextFromFile);

/**
 * @route   GET /api/v1/company-documents/categories
 * @desc    Get distinct document categories (for filter dropdown)
 * @access  Private (Admin only)
 */
router.get('/categories', CompanyDocumentController.getCategories);

router
  .route('/')
  /**
   * @route   GET /api/v1/company-documents
   * @desc    Get paginated list of company documents
   * @access  Private (Admin only)
   */
  .get(validate(companyDocumentListQuerySchema, 'query'), CompanyDocumentController.getDocuments)
  /**
   * @route   POST /api/v1/company-documents
   * @desc    Create a new company document (auto-indexes for RAG)
   * @access  Private (Admin only)
   */
  .post(validate(createCompanyDocumentSchema), CompanyDocumentController.createDocument);

router
  .route('/:id')
  .all(validate(companyDocumentIdParamSchema, 'params'))
  /**
   * @route   GET /api/v1/company-documents/:id
   * @desc    Get a single company document with content
   * @access  Private (Admin only)
   */
  .get(CompanyDocumentController.getDocumentById)
  /**
   * @route   PATCH /api/v1/company-documents/:id
   * @desc    Update a company document (re-indexes if content changed)
   * @access  Private (Admin only)
   */
  .patch(validate(updateCompanyDocumentSchema), CompanyDocumentController.updateDocument)
  /**
   * @route   DELETE /api/v1/company-documents/:id
   * @desc    Soft-delete a company document and clean up chunks
   * @access  Private (Admin only)
   */
  .delete(CompanyDocumentController.deleteDocument);

export default router;
