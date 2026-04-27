import { z } from 'zod';

const idParam = z.string().regex(/^\d+$/, 'ID không hợp lệ');

export const sessionIdParamsSchema = z.object({
  id: idParam,
});

export const startSessionSchema = z.object({
  questionBankId: idParam,
  maxQuestions: z.number().int().min(5).max(30).optional(),
});

export const submitAnswerSchema = z.object({
  itemId: idParam,
  selectedOptionIds: z.array(idParam).min(1, 'Phải chọn ít nhất 1 đáp án'),
  timeSpentMs: z
    .number()
    .int()
    .min(0)
    .max(10 * 60 * 1000)
    .optional(),
});

export const listSessionsQuerySchema = z.object({
  status: z.enum(['in_progress', 'completed', 'abandoned']).optional(),
  questionBankId: idParam.optional(),
});

export const bankIdParamsSchema = z.object({
  id: idParam,
});

export const bulkSetDifficultySchema = z.object({
  questionIds: z.array(idParam).min(1, 'Phải chọn ít nhất 1 câu hỏi').max(500),
  difficulty: z.number().int().min(1).max(5),
});

export const autoTuneSchema = z.object({
  strategy: z.enum(['spread', 'reset']),
});
