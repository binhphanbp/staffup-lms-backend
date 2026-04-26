import type { Response, NextFunction } from 'express';
import { CodeLabService } from '@/services/code-lab.service';
import { catchAsync, sendSuccess } from '@/utils';
import type { AuthRequest } from '@/interfaces';

export class CodeLabController {
  static evaluate = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await CodeLabService.evaluate(req.body);
    sendSuccess(res, result, 'Code evaluated by AI');
  });
}
