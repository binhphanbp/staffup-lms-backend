import type { Response, NextFunction } from 'express';
import { RecommendationService } from '@/services/recommendation.service';
import { catchAsync, sendSuccess } from '@/utils';
import type { AuthRequest } from '@/interfaces';
import type { GetMyRecommendationsInput } from '@/schemas/recommendation.schema';

export class RecommendationController {
  static getMyRecommendations = catchAsync(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const input = req.query as unknown as GetMyRecommendationsInput;
      const result = await RecommendationService.getMyRecommendations(req.user!.userId, input);
      sendSuccess(res, result, 'AI personalized recommendations generated');
    },
  );
}
