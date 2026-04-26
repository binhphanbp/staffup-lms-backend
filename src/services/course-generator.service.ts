import { prisma } from '@/config/database';
import {
  genAI,
  CHAT_MODEL,
  COURSE_OUTLINE_SYSTEM_PROMPT,
  LESSON_CONTENT_SYSTEM_PROMPT,
} from '@/config/gemini.config';
import { logger } from '@/config/logger';
import { AppError, slugify } from '@/utils';
import type {
  GenerateCourseOutlineInput,
  GenerateLessonContentInput,
  SaveCourseFromOutlineInput,
} from '@/schemas/course-generator.schema';

// ========================
// Types
// ========================

type LessonType = 'article' | 'video' | 'quiz';

interface DraftLesson {
  tempId: string;
  title: string;
  description: string;
  lessonType: LessonType;
  estimatedDurationMinutes: number;
}

interface DraftModule {
  tempId: string;
  title: string;
  description: string;
  lessons: DraftLesson[];
}

interface DraftCourseMeta {
  title: string;
  description: string;
  estimatedDurationMinutes: number;
  learningObjectives: string[];
}

interface GenerateOutlineResult {
  course: DraftCourseMeta;
  modules: DraftModule[];
  model: string;
  generatedAt: string;
}

// ========================
// Helpers
// ========================

const stripCodeFences = (raw: string): string => {
  let text = raw.trim();
  if (text.startsWith('```json')) text = text.slice(7);
  else if (text.startsWith('```markdown')) text = text.slice(11);
  else if (text.startsWith('```')) text = text.slice(3);
  if (text.endsWith('```')) text = text.slice(0, -3);
  return text.trim();
};

const generateTempId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const LEVEL_LABEL: Record<GenerateCourseOutlineInput['level'], string> = {
  beginner: 'Sơ cấp — học viên chưa biết gì hoặc rất ít.',
  intermediate: 'Trung cấp — đã biết các khái niệm cơ bản, cần đào sâu áp dụng.',
  advanced: 'Nâng cao — học viên có kinh nghiệm, cần xử lý tình huống phức tạp.',
  mixed: 'Hỗn hợp — bắt đầu từ cơ bản và tiến dần lên nâng cao.',
};

const LENGTH_LABEL: Record<GenerateLessonContentInput['lengthHint'], string> = {
  short: 'Ngắn (~300-500 từ).',
  medium: 'Vừa (~600-1000 từ).',
  long: 'Dài (~1200-2000 từ).',
};

const buildOutlinePrompt = (input: GenerateCourseOutlineInput): string => {
  const lines: string[] = [];
  lines.push('**Yêu cầu thiết kế khóa học:**');
  lines.push(`- Chủ đề: ${input.topic}`);
  if (input.description) lines.push(`- Mô tả định hướng: ${input.description}`);
  if (input.audience) lines.push(`- Đối tượng học viên: ${input.audience}`);
  lines.push(`- Trình độ: ${LEVEL_LABEL[input.level]}`);
  lines.push(`- Số module mong muốn: ${input.moduleCount}`);
  lines.push(`- Số bài học mỗi module: ${input.lessonsPerModule}`);
  lines.push(`- Ngôn ngữ: ${input.language === 'en' ? 'English' : 'Tiếng Việt'}`);
  lines.push('');

  if (input.sourceContent) {
    lines.push('**Tài liệu nguồn (BÁM SÁT để xây nội dung):**');
    lines.push('---');
    lines.push(input.sourceContent);
    lines.push('---');
    lines.push('');
  }

  lines.push(
    `Hãy sinh khung khóa học với ~${input.moduleCount} module và ~${input.lessonsPerModule} bài học mỗi module. Trả về JSON đúng schema đã quy định.`,
  );

  return lines.join('\n');
};

const buildLessonContentPrompt = (input: GenerateLessonContentInput): string => {
  const lines: string[] = [];
  lines.push('**Ngữ cảnh khóa học:**');
  lines.push(`- Khóa học: ${input.courseTitle}`);
  if (input.courseDescription) lines.push(`- Mô tả khóa: ${input.courseDescription}`);
  lines.push(`- Module: ${input.moduleTitle}`);
  lines.push('');
  lines.push('**Bài học cần soạn:**');
  lines.push(`- Tiêu đề: ${input.lessonTitle}`);
  if (input.lessonDescription) lines.push(`- Tóm tắt mong muốn: ${input.lessonDescription}`);
  lines.push(`- Độ dài: ${LENGTH_LABEL[input.lengthHint]}`);
  lines.push(`- Ngôn ngữ: ${input.language === 'en' ? 'English' : 'Tiếng Việt'}`);
  lines.push('');
  if (input.sourceContent) {
    lines.push('**Tài liệu nguồn (BÁM SÁT khi soạn):**');
    lines.push('---');
    lines.push(input.sourceContent);
    lines.push('---');
    lines.push('');
  }
  lines.push(
    'Hãy soạn nội dung Markdown thuần cho bài học này theo nguyên tắc đã quy định. KHÔNG viết H1, KHÔNG bọc trong code fence.',
  );
  return lines.join('\n');
};

const sanitizeLessonType = (raw: unknown): LessonType => {
  if (raw === 'video' || raw === 'article' || raw === 'quiz') return raw;
  return 'article';
};

const sanitizeOutline = (
  raw: unknown,
  request: GenerateCourseOutlineInput,
): { course: DraftCourseMeta; modules: DraftModule[] } | null => {
  if (!raw || typeof raw !== 'object') return null;
  const root = raw as Record<string, unknown>;

  const courseRaw = (root.course ?? {}) as Record<string, unknown>;
  const courseTitle =
    typeof courseRaw.title === 'string' && courseRaw.title.trim().length > 0
      ? courseRaw.title.trim()
      : request.topic.trim();
  const courseDescription =
    typeof courseRaw.description === 'string' ? courseRaw.description.trim() : '';
  const courseDuration =
    typeof courseRaw.estimatedDurationMinutes === 'number' && courseRaw.estimatedDurationMinutes > 0
      ? Math.floor(courseRaw.estimatedDurationMinutes)
      : 0;
  const learningObjectives = Array.isArray(courseRaw.learningObjectives)
    ? courseRaw.learningObjectives
        .filter((o): o is string => typeof o === 'string' && o.trim().length > 0)
        .map((o) => o.trim())
    : [];

  const modulesRaw = Array.isArray(root.modules) ? root.modules : [];
  const modules: DraftModule[] = modulesRaw
    .map((m): DraftModule | null => {
      if (!m || typeof m !== 'object') return null;
      const mod = m as Record<string, unknown>;
      const title = typeof mod.title === 'string' ? mod.title.trim() : '';
      if (title.length === 0) return null;
      const description = typeof mod.description === 'string' ? mod.description.trim() : '';

      const lessonsRaw = Array.isArray(mod.lessons) ? mod.lessons : [];
      const lessons: DraftLesson[] = lessonsRaw
        .map((l): DraftLesson | null => {
          if (!l || typeof l !== 'object') return null;
          const les = l as Record<string, unknown>;
          const lTitle = typeof les.title === 'string' ? les.title.trim() : '';
          if (lTitle.length === 0) return null;
          const lDesc = typeof les.description === 'string' ? les.description.trim() : '';
          const lType = sanitizeLessonType(les.lessonType);
          const dur =
            typeof les.estimatedDurationMinutes === 'number' && les.estimatedDurationMinutes > 0
              ? Math.floor(les.estimatedDurationMinutes)
              : lType === 'video'
                ? 8
                : lType === 'quiz'
                  ? 10
                  : 12;
          return {
            tempId: generateTempId('lesson'),
            title: lTitle,
            description: lDesc,
            lessonType: lType,
            estimatedDurationMinutes: dur,
          };
        })
        .filter((l): l is DraftLesson => l !== null);

      if (lessons.length === 0) return null;

      return {
        tempId: generateTempId('module'),
        title,
        description,
        lessons,
      };
    })
    .filter((m): m is DraftModule => m !== null);

  if (modules.length === 0) return null;

  const totalLessonDuration = modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + l.estimatedDurationMinutes, 0),
    0,
  );

  return {
    course: {
      title: courseTitle,
      description: courseDescription,
      estimatedDurationMinutes: courseDuration > 0 ? courseDuration : totalLessonDuration,
      learningObjectives,
    },
    modules,
  };
};

// ========================
// Service
// ========================

export class CourseGeneratorService {
  /**
   * Generate a course outline (course meta + modules + lessons skeleton)
   * using Gemini. NOT persisted — caller must invoke `saveFromOutline`
   * with the trainer-curated outline to actually create DB records.
   */
  static async generateOutline(input: GenerateCourseOutlineInput): Promise<GenerateOutlineResult> {
    const userPrompt = buildOutlinePrompt(input);

    let aiResponse: string;
    try {
      const result = await genAI.models.generateContent({
        model: CHAT_MODEL,
        contents: [{ role: 'user' as const, parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction: COURSE_OUTLINE_SYSTEM_PROMPT,
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      });
      aiResponse = result.text ?? '';
    } catch (error) {
      logger.error('Gemini course-outline generation error:', error);
      throw new AppError('Lỗi khi gọi AI sinh khung khóa học. Vui lòng thử lại.', 500);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(stripCodeFences(aiResponse));
    } catch {
      logger.error('Failed to parse AI course outline response', { aiResponse });
      throw new AppError('AI trả về dữ liệu không hợp lệ. Vui lòng thử lại với mô tả khác.', 502);
    }

    const sanitized = sanitizeOutline(parsed, input);
    if (!sanitized) {
      throw new AppError(
        'AI không sinh được khung khóa học hợp lệ. Vui lòng cung cấp chủ đề / nội dung rõ ràng hơn.',
        422,
      );
    }

    return {
      course: sanitized.course,
      modules: sanitized.modules,
      model: CHAT_MODEL,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate Markdown content body for a single lesson based on its
   * title/description and the surrounding course context.
   */
  static async generateLessonContent(
    input: GenerateLessonContentInput,
  ): Promise<{ content: string; model: string; generatedAt: string }> {
    const userPrompt = buildLessonContentPrompt(input);

    let aiResponse: string;
    try {
      const result = await genAI.models.generateContent({
        model: CHAT_MODEL,
        contents: [{ role: 'user' as const, parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction: LESSON_CONTENT_SYSTEM_PROMPT,
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      });
      aiResponse = result.text ?? '';
    } catch (error) {
      logger.error('Gemini lesson-content generation error:', error);
      throw new AppError('Lỗi khi gọi AI sinh nội dung bài học. Vui lòng thử lại.', 500);
    }

    const content = stripCodeFences(aiResponse);
    if (content.trim().length === 0) {
      throw new AppError('AI không sinh được nội dung bài học. Vui lòng thử lại.', 422);
    }

    return {
      content,
      model: CHAT_MODEL,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Persist a trainer-curated outline as Course + Modules + Lessons.
   * Course is created in `draft` status with the requesting trainer as owner;
   * trainer can later publish via the existing /:id/status endpoint.
   */
  static async saveFromOutline(input: SaveCourseFromOutlineInput, requestUserId: string) {
    if (input.course.categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: BigInt(input.course.categoryId) },
        select: { id: true },
      });
      if (!cat) throw new AppError('Category not found.', 404);
    }
    if (input.course.ownerDepartmentId) {
      const dept = await prisma.department.findUnique({
        where: { id: BigInt(input.course.ownerDepartmentId) },
        select: { id: true },
      });
      if (!dept) throw new AppError('Department not found.', 404);
    }

    const slug = await generateUniqueSlug(input.course.title);

    const totalDuration =
      input.course.estimatedDurationMinutes ??
      input.modules.reduce(
        (sum, m) => sum + m.lessons.reduce((s, l) => s + (l.estimatedDurationMinutes ?? 0), 0),
        0,
      );

    const created = await prisma.$transaction(async (tx) => {
      const course = await tx.course.create({
        data: {
          title: input.course.title,
          slug,
          description: input.course.description ?? null,
          thumbnailUrl: input.course.thumbnailUrl ?? null,
          categoryId: input.course.categoryId ? BigInt(input.course.categoryId) : null,
          ownerDepartmentId: input.course.ownerDepartmentId
            ? BigInt(input.course.ownerDepartmentId)
            : null,
          estimatedDurationMinutes: totalDuration > 0 ? totalDuration : null,
          trainerUserId: BigInt(requestUserId),
          status: 'draft',
          publishedAt: null,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          createdAt: true,
        },
      });

      let moduleOrder = 1;
      const modulesCreated: { id: bigint; title: string; lessonCount: number }[] = [];
      for (const m of input.modules) {
        const moduleRow = await tx.module.create({
          data: {
            courseId: course.id,
            title: m.title,
            orderIndex: moduleOrder,
          },
          select: { id: true, title: true },
        });
        moduleOrder += 1;

        let lessonOrder = 1;
        for (const l of m.lessons) {
          await tx.lesson.create({
            data: {
              moduleId: moduleRow.id,
              title: l.title,
              lessonType: l.lessonType,
              contentText: l.contentText ?? null,
              durationSeconds: l.estimatedDurationMinutes ? l.estimatedDurationMinutes * 60 : 0,
              orderIndex: lessonOrder,
              isPreview: false,
            },
            select: { id: true },
          });
          lessonOrder += 1;
        }

        modulesCreated.push({
          id: moduleRow.id,
          title: moduleRow.title,
          lessonCount: m.lessons.length,
        });
      }

      return { course, modules: modulesCreated };
    });

    const totalLessons = created.modules.reduce((sum, m) => sum + m.lessonCount, 0);

    return {
      course: {
        id: created.course.id.toString(),
        title: created.course.title,
        slug: created.course.slug,
        status: created.course.status,
        createdAt: created.course.createdAt.toISOString(),
      },
      moduleCount: created.modules.length,
      lessonCount: totalLessons,
    };
  }
}

// ========================
// Slug helper (mirrors course.service.generateUniqueSlug)
// ========================

async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title);
  let candidate = baseSlug;
  let suffix = 1;
  while (true) {
    const existing = await prisma.course.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}
