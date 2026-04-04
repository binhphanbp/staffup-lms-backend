import { z } from 'zod';
// Validate roadmap ID param
export const roadmapIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Invalid roadmap D format'),
});
export type RoadmapIdParam = z.infer<typeof roadmapIdParamSchema>;
