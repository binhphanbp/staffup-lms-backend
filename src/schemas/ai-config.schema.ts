import { z } from 'zod';

const promptField = z
  .string()
  .min(20, 'Prompt phải có ít nhất 20 ký tự')
  .max(8000, 'Prompt không được vượt quá 8000 ký tự')
  .nullable()
  .optional();

export const updateAiConfigSchema = z
  .object({
    provider: z.enum(['gemini', 'openai', 'claude']).optional(),
    chatModel: z.string().min(1).max(100).optional(),
    embeddingModel: z.string().min(1).max(100).optional(),
    topKResults: z.coerce.number().int().min(1).max(20).optional(),
    maxMessagesPerMinute: z.coerce.number().int().min(1).max(120).optional(),
    temperature: z.coerce.number().min(0).max(2).optional(),
    modules: z
      .object({
        chatbot: z.boolean().optional(),
        dropoutPrediction: z.boolean().optional(),
        autoGrader: z.boolean().optional(),
        questionGenerator: z.boolean().optional(),
      })
      .optional(),
    prompts: z
      .object({
        systemPrompt: promptField,
        learningSystemPrompt: promptField,
        gradingSystemPrompt: promptField,
        questionGenerationSystemPrompt: promptField,
        courseOutlineSystemPrompt: promptField,
        lessonContentSystemPrompt: promptField,
        learningRecommendationSystemPrompt: promptField,
        codeLabReviewSystemPrompt: promptField,
      })
      .optional(),
  })
  .strict();

export type UpdateAiConfigDto = z.infer<typeof updateAiConfigSchema>;
