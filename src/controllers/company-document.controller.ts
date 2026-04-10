import type { Response, NextFunction } from 'express';
import { CompanyDocumentService } from '@/services/company-document.service';
import { catchAsync, sendSuccess, sendCreated, sendNoContent } from '@/utils';
import type { AuthRequest } from '@/interfaces';
import type { CompanyDocumentListQuery } from '@/schemas/company-document.schema';

export class CompanyDocumentController {
  /**
   * GET /api/v1/company-documents
   */
  static getDocuments = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await CompanyDocumentService.getDocuments(
      req.query as unknown as CompanyDocumentListQuery,
    );
    sendSuccess(res, result, 'Lấy danh sách tài liệu thành công');
  });

  /**
   * GET /api/v1/company-documents/categories
   */
  static getCategories = catchAsync(
    async (_req: AuthRequest, res: Response, _next: NextFunction) => {
      const categories = await CompanyDocumentService.getCategories();
      sendSuccess(res, categories, 'Lấy danh sách danh mục thành công');
    },
  );

  /**
   * GET /api/v1/company-documents/:id
   */
  static getDocumentById = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const doc = await CompanyDocumentService.getDocumentById(req.params.id as string);
      sendSuccess(res, doc, 'Lấy tài liệu thành công');
    },
  );

  /**
   * POST /api/v1/company-documents
   */
  static createDocument = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const userId = BigInt(req.user!.userId);
      const doc = await CompanyDocumentService.createDocument(req.body, userId);
      sendCreated(res, doc, 'Tạo tài liệu thành công');
    },
  );

  /**
   * PATCH /api/v1/company-documents/:id
   */
  static updateDocument = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const doc = await CompanyDocumentService.updateDocument(req.params.id as string, req.body);
      sendSuccess(res, doc, 'Cập nhật tài liệu thành công');
    },
  );

  /**
   * DELETE /api/v1/company-documents/:id
   */
  static deleteDocument = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      await CompanyDocumentService.deleteDocument(req.params.id as string);
      sendNoContent(res);
    },
  );
}
