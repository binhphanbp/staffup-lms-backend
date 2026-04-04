import { catchAsync, sendSuccess } from '@/utils';
import { RoadmapService } from '@/services/roadmap.service';
import type { AuthRequest } from '@/interfaces';

export class RoadmapController {
  /**
   * GET /api/v1/roadmaps/:id/detail
   * Get roadmap detail with courses and user progress
   */
  static getRoadmapDetail = catchAsync(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.userId;

    const roadmap = await RoadmapService.getRoadmapDetail(id as string, userId);

    sendSuccess(res, roadmap, 'Roadmap detail retrieved successfully');
  });
}
