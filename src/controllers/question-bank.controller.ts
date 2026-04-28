import type { Response, NextFunction } from 'express';
import { QuestionBankService } from '@/services/question-bank.service';
import { catchAsync, sendSuccess, sendCreated, sendNoContent } from '@/utils';
import type { AuthRequest } from '@/interfaces';
import type { ListQuestionBanksQuery } from '@/schemas/question-bank.schema';

export class QuestionBankController {
  static create = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const bank = await QuestionBankService.create(req.body, req.user!.userId);
    sendCreated(res, bank, 'Question bank created successfully');
  });

  static findAll = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    // Express 5: req.query is read-only, so the validate() middleware stores
    // the Zod-coerced query (with proper int types for page/limit) in
    // res.locals.validatedQuery. Fall back to req.query for safety.
    const query = ((res.locals as { validatedQuery?: unknown }).validatedQuery ??
      req.query) as ListQuestionBanksQuery;
    const result = await QuestionBankService.findAll(query, req.user!.userId, req.user!.roleCodes);
    sendSuccess(res, result, 'Question banks retrieved successfully');
  });

  static findById = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const bank = await QuestionBankService.findById(String(req.params.id));
    sendSuccess(res, bank, 'Question bank retrieved successfully');
  });

  static update = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const bank = await QuestionBankService.update(
      String(req.params.id),
      req.body,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, bank, 'Question bank updated successfully');
  });

  static delete = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    await QuestionBankService.delete(String(req.params.id), req.user!.userId, req.user!.roleCodes);
    sendNoContent(res);
  });
}
