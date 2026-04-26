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
  language_response: z.enum(['vi', 'en']).default('vi').optional(),
});

export type EvaluateCodeInput = z.infer<typeof evaluateCodeSchema>;
export type CodeLabLanguage = (typeof CODE_LAB_LANGUAGES)[number];
