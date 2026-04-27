import { z } from 'zod';

const idParam = z.string().regex(/^\d+$/, 'Invalid lesson id');

export const lessonIdParamSchema = z.object({
  lessonId: idParam,
});

export const generateVideoSummarySchema = z.object({
  transcriptHint: z.string().max(20000, 'Transcript hint quá dài (tối đa 20000 ký tự)').optional(),
  language: z.enum(['vi', 'en']).default('vi'),
  flashcardCount: z.number().int().min(3).max(20).default(8),
  chapterCount: z.number().int().min(2).max(15).default(5),
  focusKeyPoints: z.boolean().default(true),
  regenerate: z.boolean().default(false),
});

export type GenerateVideoSummaryInput = z.infer<typeof generateVideoSummarySchema>;
export type LessonIdParam = z.infer<typeof lessonIdParamSchema>;
