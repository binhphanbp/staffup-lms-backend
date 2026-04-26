import { z } from 'zod';

const QUESTION_TYPES = ['single_choice', 'multiple_choice', 'essay'] as const;
const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard', 'mixed'] as const;
const LANGUAGES = ['vi', 'en'] as const;

// ─── Generate (preview) request ──────────────────────────────────────────────

export const generateQuestionsSchema = z
  .object({
    topic: z.string().trim().min(1).max(5000).optional(),
    sourceContent: z.string().trim().min(1).max(20000).optional(),
    count: z.coerce.number().int().min(1).max(15).default(5),
    difficulty: z.enum(DIFFICULTY_LEVELS).default('mixed'),
    questionTypes: z.array(z.enum(QUESTION_TYPES)).min(1).max(3).default(['single_choice']),
    language: z.enum(LANGUAGES).default('vi'),
  })
  .refine((data) => Boolean(data.topic) || Boolean(data.sourceContent), {
    message: 'Vui lòng cung cấp `topic` hoặc `sourceContent`.',
    path: ['topic'],
  });

export type GenerateQuestionsInput = z.infer<typeof generateQuestionsSchema>;

// ─── Save (persist preview) request ──────────────────────────────────────────

const draftOptionSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  isCorrect: z.boolean(),
  orderIndex: z.coerce.number().int().min(1),
});

const draftQuestionSchema = z
  .object({
    questionType: z.enum(QUESTION_TYPES),
    content: z.string().trim().min(1).max(10000),
    explanation: z.string().trim().max(5000).nullable().optional(),
    defaultPoints: z.coerce.number().int().positive().default(1),
    options: z.array(draftOptionSchema).optional(),
  })
  .refine(
    (data) =>
      data.questionType === 'essay'
        ? !data.options || data.options.length === 0
        : Array.isArray(data.options) && data.options.length >= 2,
    {
      message: 'Câu trắc nghiệm cần ít nhất 2 lựa chọn; câu tự luận không được có lựa chọn.',
      path: ['options'],
    },
  )
  .refine(
    (data) =>
      data.questionType !== 'single_choice' ||
      (data.options ?? []).filter((o) => o.isCorrect).length === 1,
    {
      message: 'Câu chọn 1 đáp án phải có đúng 1 lựa chọn đúng.',
      path: ['options'],
    },
  )
  .refine(
    (data) =>
      data.questionType !== 'multiple_choice' ||
      (data.options ?? []).filter((o) => o.isCorrect).length >= 1,
    {
      message: 'Câu chọn nhiều đáp án phải có ít nhất 1 lựa chọn đúng.',
      path: ['options'],
    },
  );

export const saveAiQuestionsSchema = z.object({
  questions: z.array(draftQuestionSchema).min(1).max(15),
});

export type SaveAiQuestionsInput = z.infer<typeof saveAiQuestionsSchema>;
export type DraftQuestionInput = z.infer<typeof draftQuestionSchema>;
