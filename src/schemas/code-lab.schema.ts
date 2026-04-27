import { z } from 'zod';

// ====================================================================
// AI Code Lab — Zod schemas
// ====================================================================

export const CODE_LAB_LANGUAGES = [
  'python',
  'javascript',
  'typescript',
  'java',
  'cpp',
  'c',
  'go',
  'csharp',
  'ruby',
  'sql',
] as const;

export const CODE_LAB_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export const evaluateCodeSchema = z.object({
  language: z.enum(CODE_LAB_LANGUAGES),
  code: z.string().min(1).max(20000),
  problemStatement: z.string().min(1).max(5000),
  testCases: z
    .array(
      z.object({
        input: z.string().max(2000),
        expectedOutput: z.string().max(2000),
        description: z.string().max(200).optional(),
      }),
    )
    .max(10)
    .optional(),
  // Optional context for tracking — service does NOT persist anything yet,
  // but accepting it lets us upgrade to attempt logging later without API churn.
  lessonId: z.string().regex(/^\d+$/).optional(),
  language_response: z.enum(['vi', 'en']).optional().default('vi'),
});

export const submitProblemSchema = z.object({
  language: z.enum(CODE_LAB_LANGUAGES),
  code: z.string().min(1).max(20000),
  language_response: z.enum(['vi', 'en']).optional().default('vi'),
});

export const listProblemsQuerySchema = z.object({
  language: z.enum(CODE_LAB_LANGUAGES).optional(),
  difficulty: z.enum(CODE_LAB_DIFFICULTIES).optional(),
  q: z.string().max(120).optional(),
});

export const listSubmissionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  status: z.enum(['passed', 'failed', 'partial', 'error']).optional(),
});

export type EvaluateCodeInput = z.infer<typeof evaluateCodeSchema>;
export type SubmitProblemInput = z.infer<typeof submitProblemSchema>;
export type ListProblemsQuery = z.infer<typeof listProblemsQuerySchema>;
export type ListSubmissionsQuery = z.infer<typeof listSubmissionsQuerySchema>;
export type CodeLabLanguage = (typeof CODE_LAB_LANGUAGES)[number];
export type CodeLabDifficulty = (typeof CODE_LAB_DIFFICULTIES)[number];
