import type { Response, NextFunction } from 'express';
import { QuestionGeneratorService } from '@/services/question-generator.service';
import { catchAsync, sendSuccess, sendCreated } from '@/utils';
import type { AuthRequest } from '@/interfaces';

export class QuestionGeneratorController {
  static generate = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await QuestionGeneratorService.generate(
      String(req.params.bankId),
      req.body,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendSuccess(res, result, 'AI question drafts generated successfully');
  });

  static save = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await QuestionGeneratorService.saveDrafts(
      String(req.params.bankId),
      req.body,
      req.user!.userId,
      req.user!.roleCodes,
    );
    sendCreated(res, result, 'AI-generated questions saved to bank');
  });
}
