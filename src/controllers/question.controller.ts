import type { Response, NextFunction } from 'express';
import { QuestionService } from '@/services/question.service';
import {
  catchAsync,
  sendSuccess,
  sendCreated,
  sendNoContent,
  getValidatedQuery,
  getValidatedParams,
} from '@/utils';
import type { AuthRequest } from '@/interfaces';

export class QuestionController {
  // ─── Questions ─────────────────────────────────────────────────────────────

  static create = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const question = await QuestionService.create(
      { ...req.body, questionBankId: req.params.bankId as string },
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendCreated(res, question, 'Question created successfully');
  });

  static findAll = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const query = getValidatedQuery(req, res);
    const params = getValidatedParams(req, res);
    const result = await QuestionService.findAll(
      params.bankId as string,
      query,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, result, 'Questions retrieved successfully');
  });

  static findById = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const question = await QuestionService.findById(
      req.params.bankId as string,
      req.params.id as string,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, question, 'Question retrieved successfully');
  });

  static update = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const question = await QuestionService.update(
      req.params.bankId as string,
      req.params.id as string,
      req.body,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, question, 'Question updated successfully');
  });

  static deactivate = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const question = await QuestionService.deactivate(
      req.params.bankId as string,
      req.params.id as string,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, question, 'Question deactivated successfully');
  });

  // ─── Options ───────────────────────────────────────────────────────────────

  static createOption = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const option = await QuestionService.createOption(
      req.params.bankId as string,
      req.params.questionId as string,
      req.body,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendCreated(res, option, 'Option created successfully');
  });

  static updateOption = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const option = await QuestionService.updateOption(
      req.params.bankId as string,
      req.params.questionId as string,
      req.params.optionId as string,
      req.body,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, option, 'Option updated successfully');
  });

  static deleteOption = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    await QuestionService.deleteOption(
      req.params.bankId as string,
      req.params.questionId as string,
      req.params.optionId as string,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendNoContent(res);
  });
}
