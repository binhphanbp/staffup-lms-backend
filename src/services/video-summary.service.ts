import type { Prisma } from '@prisma/client';
import { generateContentWithFallback } from '@/utils/ai-generate';
import { prisma } from '@/config/database';
import { genAI, CHAT_MODEL, VIDEO_SUMMARY_SYSTEM_PROMPT } from '@/config/gemini.config';
import { logger } from '@/config/logger';
import { AppError } from '@/utils';
import type { GenerateVideoSummaryInput } from '@/schemas/video-summary.schema';

// ========================
// Types
// ========================

export interface VideoSummaryChapter {
  startSec: number;
  endSec: number;
  title: string;
  summary: string;
}

export interface VideoSummaryFlashcard {
  front: string;
  back: string;
}

export interface VideoSummaryPayload {
  id: string;
  lessonId: string;
  transcript: string;
  chapters: VideoSummaryChapter[];
  keyPoints: string[];
  flashcards: VideoSummaryFlashcard[];
  source: string;
  model: string | null;
  generatedAt: string;
  updatedAt: string;
}

interface ActorContext {
  userId: bigint;
  roleCodes: string[];
}

// ========================
// Helpers
// ========================

const stripCodeFences = (raw: string): string => {
  let text = raw.trim();
  if (text.startsWith('```json')) text = text.slice(7);
  else if (text.startsWith('```')) text = text.slice(3);
  if (text.endsWith('```')) text = text.slice(0, -3);
  return text.trim();
};

const clampInt = (value: number, min: number, max: number): number =>
  Math.min(Math.max(Math.floor(value), min), max);

const isAdmin = (actor: ActorContext) => actor.roleCodes.includes('admin');
const canManageCourse = (actor: ActorContext) =>
  actor.roleCodes.includes('admin') || actor.roleCodes.includes('trainer');

const fetchLessonForGeneration = async (lessonId: bigint) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              trainerUserId: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw new AppError('Bài học không tồn tại.', 404);
  }
  if (lesson.lessonType !== 'video') {
    throw new AppError('Tóm tắt AI chỉ hỗ trợ bài học dạng video.', 400);
  }
  return lesson;
};

const fetchLessonForRead = async (lessonId: bigint) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            select: { id: true, trainerUserId: true },
          },
        },
      },
      videoSummary: true,
    },
  });

  if (!lesson) {
    throw new AppError('Bài học không tồn tại.', 404);
  }
  return lesson;
};

const assertCanGenerate = (actor: ActorContext, trainerUserId: bigint) => {
  if (isAdmin(actor)) return;
  if (actor.roleCodes.includes('trainer') && actor.userId.toString() === trainerUserId.toString()) {
    return;
  }
  throw new AppError('Chỉ admin hoặc trainer phụ trách khoá học mới được sinh tóm tắt AI.', 403);
};

const assertCanRead = async (
  actor: ActorContext,
  courseId: bigint,
  trainerUserId: bigint,
): Promise<void> => {
  if (canManageCourse(actor)) {
    if (actor.roleCodes.includes('trainer') && !isAdmin(actor)) {
      if (actor.userId.toString() !== trainerUserId.toString()) {
        // trainer chỉ được xem khoá mình phụ trách
        const enrollment = await prisma.enrollment.findFirst({
          where: { userId: actor.userId, courseId },
          select: { id: true },
        });
        if (!enrollment) {
          throw new AppError('Bạn không có quyền xem tóm tắt bài học này.', 403);
        }
      }
    }
    return;
  }
  // Manager / employee: cần có enrollment hợp lệ
  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: actor.userId, courseId },
    select: { id: true },
  });
  if (!enrollment) {
    throw new AppError('Bạn cần được ghi danh khoá học để xem tóm tắt bài học.', 403);
  }
};

const buildPrompt = (params: {
  input: GenerateVideoSummaryInput;
  lessonTitle: string;
  lessonDescription: string;
  lessonContent: string;
  durationSeconds: number;
  videoUrl: string | null;
  courseTitle: string;
  courseDescription: string;
  moduleTitle: string;
}): string => {
  const lines: string[] = [];
  lines.push('**Ngữ cảnh khoá học:**');
  lines.push(`- Khoá học: ${params.courseTitle}`);
  if (params.courseDescription) {
    lines.push(`- Mô tả khoá: ${params.courseDescription}`);
  }
  lines.push(`- Module: ${params.moduleTitle}`);
  lines.push('');
  lines.push('**Bài học video:**');
  lines.push(`- Tiêu đề: ${params.lessonTitle}`);
  if (params.lessonDescription) {
    lines.push(`- Mô tả: ${params.lessonDescription}`);
  }
  lines.push(`- Thời lượng: ${params.durationSeconds} giây`);
  if (params.videoUrl) {
    lines.push(`- Video URL: ${params.videoUrl}`);
  }
  if (params.lessonContent) {
    lines.push('- Ghi chú/Nội dung bổ trợ:');
    lines.push('---');
    lines.push(params.lessonContent.slice(0, 4000));
    lines.push('---');
  }
  if (params.input.transcriptHint) {
    lines.push('');
    lines.push('**Transcript / ghi chú do trainer cung cấp (BÁM SÁT khi tóm tắt):**');
    lines.push('---');
    lines.push(params.input.transcriptHint.slice(0, 12000));
    lines.push('---');
  }
  lines.push('');
  lines.push(`**Cấu hình output:**`);
  lines.push(`- Số chương mong muốn: ${params.input.chapterCount}`);
  lines.push(`- Số flashcards: ${params.input.flashcardCount}`);
  lines.push(`- Ngôn ngữ: ${params.input.language === 'en' ? 'English' : 'Tiếng Việt'}`);
  if (params.input.focusKeyPoints) {
    lines.push('- Ưu tiên rõ ràng các điểm cốt lõi học viên cần nhớ.');
  }
  lines.push('');
  lines.push(
    'Hãy sinh tóm tắt theo schema JSON đã quy định. KHÔNG bọc trong code fence, KHÔNG thêm text giải thích bên ngoài JSON.',
  );
  return lines.join('\n');
};

// ========================
// Sanitiser
// ========================

const sanitizeChapters = (
  raw: unknown,
  durationSeconds: number,
  desiredCount: number,
): VideoSummaryChapter[] => {
  const arr = Array.isArray(raw) ? raw : [];
  const cleaned: VideoSummaryChapter[] = [];

  for (const item of arr) {
    if (!item || typeof item !== 'object') continue;
    const obj = item as Record<string, unknown>;
    const startSec =
      typeof obj.startSec === 'number' && obj.startSec >= 0 ? Math.floor(obj.startSec) : null;
    const endSec = typeof obj.endSec === 'number' && obj.endSec > 0 ? Math.floor(obj.endSec) : null;
    const title = typeof obj.title === 'string' ? obj.title.trim() : '';
    const summary = typeof obj.summary === 'string' ? obj.summary.trim() : '';
    if (startSec === null || endSec === null || !title || endSec <= startSec) continue;
    cleaned.push({
      startSec,
      endSec,
      title: title.slice(0, 100),
      summary: summary.slice(0, 400),
    });
  }

  cleaned.sort((a, b) => a.startSec - b.startSec);

  // Drop overlaps (keep earlier)
  const noOverlap: VideoSummaryChapter[] = [];
  for (const ch of cleaned) {
    const last = noOverlap[noOverlap.length - 1];
    if (last && ch.startSec < last.endSec) {
      continue;
    }
    noOverlap.push(ch);
  }

  // Clamp to durationSeconds (with ±5s tolerance)
  if (durationSeconds > 0) {
    const filtered = noOverlap.filter((ch) => ch.startSec < durationSeconds);
    if (filtered.length > 0) {
      const last = filtered[filtered.length - 1];
      if (last.endSec > durationSeconds + 5) {
        last.endSec = durationSeconds;
      }
    }
    if (filtered.length > 0) return filtered;
  }

  // Fallback: synthesize evenly spaced chapters
  if (noOverlap.length === 0 && durationSeconds > 0) {
    const count = clampInt(desiredCount, 2, 10);
    const slice = Math.max(30, Math.floor(durationSeconds / count));
    const synth: VideoSummaryChapter[] = [];
    for (let i = 0; i < count; i++) {
      const s = i * slice;
      const e = i === count - 1 ? durationSeconds : (i + 1) * slice;
      synth.push({
        startSec: s,
        endSec: e,
        title: `Chương ${i + 1}`,
        summary: 'Nội dung chương đang được tóm tắt.',
      });
    }
    return synth;
  }

  return noOverlap;
};

const sanitizeKeyPoints = (raw: unknown): string[] => {
  const arr = Array.isArray(raw) ? raw : [];
  const out = arr
    .filter((x): x is string => typeof x === 'string')
    .map((x) => x.trim())
    .filter((x) => x.length > 0)
    .map((x) => x.slice(0, 280));
  return Array.from(new Set(out)).slice(0, 7);
};

const sanitizeFlashcards = (raw: unknown, desiredCount: number): VideoSummaryFlashcard[] => {
  const arr = Array.isArray(raw) ? raw : [];
  const seenFronts = new Set<string>();
  const cleaned: VideoSummaryFlashcard[] = [];
  for (const item of arr) {
    if (!item || typeof item !== 'object') continue;
    const obj = item as Record<string, unknown>;
    const front = typeof obj.front === 'string' ? obj.front.trim() : '';
    const back = typeof obj.back === 'string' ? obj.back.trim() : '';
    if (!front || !back) continue;
    const key = front.toLowerCase();
    if (seenFronts.has(key)) continue;
    seenFronts.add(key);
    cleaned.push({
      front: front.slice(0, 200),
      back: back.slice(0, 600),
    });
  }
  const max = clampInt(desiredCount + 2, 3, 20);
  return cleaned.slice(0, max);
};

const sanitizeSummary = (
  parsed: unknown,
  input: GenerateVideoSummaryInput,
  durationSeconds: number,
): {
  transcript: string;
  chapters: VideoSummaryChapter[];
  keyPoints: string[];
  flashcards: VideoSummaryFlashcard[];
} | null => {
  if (!parsed || typeof parsed !== 'object') return null;
  const root = parsed as Record<string, unknown>;
  const transcript = typeof root.transcript === 'string' ? root.transcript.trim() : '';
  if (transcript.length === 0) return null;
  const chapters = sanitizeChapters(root.chapters, durationSeconds, input.chapterCount);
  const keyPoints = sanitizeKeyPoints(root.keyPoints);
  const flashcards = sanitizeFlashcards(root.flashcards, input.flashcardCount);
  if (chapters.length === 0 || keyPoints.length === 0 || flashcards.length === 0) {
    return null;
  }
  return {
    transcript: transcript.slice(0, 12000),
    chapters,
    keyPoints,
    flashcards,
  };
};

// ========================
// Public API
// ========================

const toPayload = (record: {
  id: bigint;
  lessonId: bigint;
  transcript: string | null;
  chapters: Prisma.JsonValue;
  flashcards: Prisma.JsonValue;
  keyPoints: Prisma.JsonValue;
  source: string;
  model: string | null;
  generatedAt: Date;
  updatedAt: Date;
}): VideoSummaryPayload => ({
  id: record.id.toString(),
  lessonId: record.lessonId.toString(),
  transcript: record.transcript ?? '',
  chapters: (record.chapters as unknown as VideoSummaryChapter[] | null) ?? [],
  keyPoints: (record.keyPoints as unknown as string[] | null) ?? [],
  flashcards: (record.flashcards as unknown as VideoSummaryFlashcard[] | null) ?? [],
  source: record.source,
  model: record.model,
  generatedAt: record.generatedAt.toISOString(),
  updatedAt: record.updatedAt.toISOString(),
});

export const generateVideoSummary = async (
  actor: ActorContext,
  lessonId: bigint,
  input: GenerateVideoSummaryInput,
): Promise<VideoSummaryPayload> => {
  const lesson = await fetchLessonForGeneration(lessonId);
  assertCanGenerate(actor, lesson.module.course.trainerUserId);

  // Skip regenerate if existing and !regenerate
  if (!input.regenerate) {
    const existing = await prisma.videoLessonSummary.findUnique({
      where: { lessonId },
    });
    if (existing) {
      return toPayload(existing);
    }
  }

  const userPrompt = buildPrompt({
    input,
    lessonTitle: lesson.title,
    lessonDescription: '',
    lessonContent: lesson.contentText ?? '',
    durationSeconds: lesson.durationSeconds,
    videoUrl: lesson.videoUrl,
    courseTitle: lesson.module.course.title,
    courseDescription: lesson.module.course.description ?? '',
    moduleTitle: lesson.module.title,
  });

  let aiResponse: string;
  try {
    const result = await generateContentWithFallback({
      model: CHAT_MODEL,
      contents: [{ role: 'user' as const, parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: VIDEO_SUMMARY_SYSTEM_PROMPT,
        temperature: 0.5,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    });
    aiResponse = result.text ?? '';
  } catch (error) {
    logger.error('Gemini video-summary generation error:', error);
    throw new AppError('Lỗi khi gọi AI sinh tóm tắt video. Vui lòng thử lại.', 500);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripCodeFences(aiResponse));
  } catch {
    logger.error('Failed to parse AI video-summary response', { aiResponse });
    throw new AppError(
      'AI trả về dữ liệu không hợp lệ. Vui lòng thử lại với transcript rõ hơn.',
      502,
    );
  }

  const sanitized = sanitizeSummary(parsed, input, lesson.durationSeconds);
  if (!sanitized) {
    throw new AppError(
      'AI không sinh được tóm tắt hợp lệ. Vui lòng cung cấp transcript hoặc nội dung bài học chi tiết hơn.',
      422,
    );
  }

  const saved = await prisma.videoLessonSummary.upsert({
    where: { lessonId },
    create: {
      lessonId,
      transcript: sanitized.transcript,
      chapters: sanitized.chapters as unknown as Prisma.InputJsonValue,
      flashcards: sanitized.flashcards as unknown as Prisma.InputJsonValue,
      keyPoints: sanitized.keyPoints as unknown as Prisma.InputJsonValue,
      source: 'ai',
      model: CHAT_MODEL,
      generatedById: actor.userId,
      generatedAt: new Date(),
    },
    update: {
      transcript: sanitized.transcript,
      chapters: sanitized.chapters as unknown as Prisma.InputJsonValue,
      flashcards: sanitized.flashcards as unknown as Prisma.InputJsonValue,
      keyPoints: sanitized.keyPoints as unknown as Prisma.InputJsonValue,
      source: 'ai',
      model: CHAT_MODEL,
      generatedById: actor.userId,
      generatedAt: new Date(),
    },
  });

  return toPayload(saved);
};

export const getVideoSummary = async (
  actor: ActorContext,
  lessonId: bigint,
): Promise<VideoSummaryPayload | null> => {
  const lesson = await fetchLessonForRead(lessonId);
  if (lesson.lessonType !== 'video') {
    throw new AppError('Tóm tắt AI chỉ áp dụng cho bài học video.', 400);
  }
  await assertCanRead(actor, lesson.module.course.id, lesson.module.course.trainerUserId);
  if (!lesson.videoSummary) return null;
  return toPayload(lesson.videoSummary);
};

export const deleteVideoSummary = async (actor: ActorContext, lessonId: bigint): Promise<void> => {
  const lesson = await fetchLessonForGeneration(lessonId);
  assertCanGenerate(actor, lesson.module.course.trainerUserId);
  await prisma.videoLessonSummary.deleteMany({ where: { lessonId } });
};
