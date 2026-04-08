import type { Response, NextFunction } from 'express';
import { QuestionService } from '@/services/question.service';
import { catchAsync, sendSuccess, sendCreated } from '@/utils';
import type { AuthRequest } from '@/interfaces';

export class QuestionController {
  static create = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const question = await QuestionService.create(
      { ...req.body, questionBankId: req.params.bankId },
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendCreated(res, question, 'Question created successfully');
  });

  static findAll = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await QuestionService.findAll(
      req.params.bankId,
      req.query as any,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, result, 'Questions retrieved successfully');
  });

  static findById = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const question = await QuestionService.findById(
      req.params.bankId,
      req.params.id,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, question, 'Question retrieved successfully');
  });

  static update = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const question = await QuestionService.update(
      req.params.bankId,
      req.params.id,
      req.body,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, question, 'Question updated successfully');
  });

  static deactivate = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const question = await QuestionService.deactivate(
      req.params.bankId,
      req.params.id,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, question, 'Question deactivated successfully');
  });
}
