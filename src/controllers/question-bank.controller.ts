import type { Response, NextFunction } from 'express';
import { QuestionBankService } from '@/services/question-bank.service';
import { catchAsync, sendSuccess, sendCreated, sendNoContent } from '@/utils';
import type { AuthRequest } from '@/interfaces';

export class QuestionBankController {
  static create = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const bank = await QuestionBankService.create(req.body, req.user!.userId);
    sendCreated(res, bank, 'Question bank created successfully');
  });

  static findAll = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await QuestionBankService.findAll(
      req.query as any,
      req.user!.userId,
      req.user!.roleCodes,
    );
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
