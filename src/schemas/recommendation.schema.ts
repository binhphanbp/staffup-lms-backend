import { z } from 'zod';

// ====================================================================
// Recommendation — Zod schemas
// ====================================================================

export const getMyRecommendationsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(10).default(5),
  language: z.enum(['vi', 'en']).default('vi'),
});

export type GetMyRecommendationsInput = z.infer<typeof getMyRecommendationsSchema>;
