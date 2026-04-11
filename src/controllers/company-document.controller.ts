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

  /**
   * POST /api/v1/company-documents/extract-text
   */
  static extractTextFromFile = catchAsync(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const file = req.file;
      if (!file) {
        return next(new (await import('@/utils')).AppError('Vui lòng trỏ file cần upload', 400));
      }

      let text: string;
      const ext = file.originalname.split('.').pop()?.toLowerCase();

      try {
        if (ext === 'pdf') {
          const pdfParse = (await import('pdf-parse')).default || (await import('pdf-parse'));
          const data = await (typeof pdfParse === 'function'
            ? pdfParse(file.buffer)
            : (pdfParse as any).default(file.buffer));
          text = data.text;
        } else if (ext === 'docx') {
          const mammoth = (await import('mammoth')).default || (await import('mammoth'));
          const result = await mammoth.extractRawText({ buffer: file.buffer });
          text = result.value;
        } else if (ext === 'txt' || ext === 'md' || ext === 'csv') {
          text = file.buffer.toString('utf-8');
        } else {
          return next(
            new (await import('@/utils')).AppError(
              'Định dạng file không được hỗ trợ (chỉ hỗ trợ pdf, docx, txt, md, csv).',
              400,
            ),
          );
        }

        sendSuccess(res, { text }, 'Trích xuất văn bản thành công');
      } catch (error) {
        console.error('File extract error:', error);
        return next(
          new (await import('@/utils')).AppError(
            'Không thể trích xuất văn bản từ file này. Có thể file bị lỗi hoặc có mật khẩu.',
            500,
          ),
        );
      }
    },
  );
}
