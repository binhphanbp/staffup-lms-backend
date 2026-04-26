import { z } from 'zod';

const LANGUAGES = ['vi', 'en'] as const;
const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced', 'mixed'] as const;
const LESSON_TYPES = ['article', 'video', 'quiz'] as const;
const LENGTH_HINTS = ['short', 'medium', 'long'] as const;

// ─── Generate outline (preview) ──────────────────────────────────────────────

export const generateCourseOutlineSchema = z
  .object({
    topic: z.string().trim().min(3).max(500),
    description: z.string().trim().max(2000).optional(),
    audience: z.string().trim().max(500).optional(),
    level: z.enum(COURSE_LEVELS).default('mixed'),
    moduleCount: z.coerce.number().int().min(1).max(10).default(4),
    lessonsPerModule: z.coerce.number().int().min(1).max(8).default(4),
    sourceContent: z.string().trim().max(30000).optional(),
    language: z.enum(LANGUAGES).default('vi'),
  })
  .refine((d) => d.topic.length > 0 || (d.sourceContent && d.sourceContent.length > 0), {
    message: 'Vui lòng cung cấp `topic` hoặc `sourceContent`.',
    path: ['topic'],
  });

export type GenerateCourseOutlineInput = z.infer<typeof generateCourseOutlineSchema>;

// ─── Generate lesson content (per-lesson body) ───────────────────────────────

export const generateLessonContentSchema = z.object({
  courseTitle: z.string().trim().min(1).max(300),
  courseDescription: z.string().trim().max(2000).optional(),
  moduleTitle: z.string().trim().min(1).max(300),
  lessonTitle: z.string().trim().min(1).max(300),
  lessonDescription: z.string().trim().max(2000).optional(),
  sourceContent: z.string().trim().max(30000).optional(),
  language: z.enum(LANGUAGES).default('vi'),
  lengthHint: z.enum(LENGTH_HINTS).default('medium'),
});

export type GenerateLessonContentInput = z.infer<typeof generateLessonContentSchema>;

// ─── Save outline (persist) ──────────────────────────────────────────────────

const draftLessonSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  lessonType: z.enum(LESSON_TYPES).default('article'),
  contentText: z.string().trim().max(50000).nullable().optional(),
  estimatedDurationMinutes: z.coerce.number().int().min(0).max(600).optional(),
});

const draftModuleSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  lessons: z.array(draftLessonSchema).min(1).max(20),
});

export const saveCourseFromOutlineSchema = z.object({
  course: z.object({
    title: z.string().trim().min(3).max(200),
    description: z.string().trim().max(2000).optional(),
    estimatedDurationMinutes: z.coerce.number().int().min(0).max(100000).optional(),
    categoryId: z.string().regex(/^\d+$/).optional(),
    ownerDepartmentId: z.string().regex(/^\d+$/).optional(),
    thumbnailUrl: z.string().url().optional(),
  }),
  modules: z.array(draftModuleSchema).min(1).max(15),
});

export type SaveCourseFromOutlineInput = z.infer<typeof saveCourseFromOutlineSchema>;
