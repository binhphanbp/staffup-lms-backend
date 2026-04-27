import { prisma } from '@/config/database';
import { genAI } from '@/config/gemini.config';
import { ensureModuleEnabled, getEffectiveConfig } from '@/services/ai-config.service';
import { searchSimilarChunksScoped, type SearchResult } from '@/services/embedding.service';
import { logger } from '@/config/logger';
import { AppError } from '@/utils';

// ========================
// Types
// ========================

interface LessonSource {
  lessonTitle: string;
  moduleTitle: string;
  courseTitle: string;
  snippet: string;
}

interface CourseAskResponse {
  content: string;
  sources: LessonSource[];
}

// ========================
// Context Builder
// ========================

/**
 * Build context from course-scoped chunks for the LLM prompt.
 */
const buildCourseContext = (
  chunks: SearchResult[],
): { context: string; sources: LessonSource[] } => {
  if (chunks.length === 0) {
    return { context: '', sources: [] };
  }

  const sources: LessonSource[] = [];
  const contextParts: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const meta = chunk.metadata as Record<string, string> | null;
    const lessonTitle = meta?.lessonTitle || 'Bài học không rõ';
    const moduleTitle = meta?.moduleTitle || 'Module không rõ';
    const courseTitle = meta?.courseTitle || 'Khóa học không rõ';

    contextParts.push(
      `--- Bài học: "${lessonTitle}" (Module: "${moduleTitle}") ---\n${chunk.content}`,
    );

    // Only add unique sources (by sourceId = lessonId)
    if (!sources.find((s) => s.lessonTitle === lessonTitle && s.moduleTitle === moduleTitle)) {
      sources.push({
        lessonTitle,
        moduleTitle,
        courseTitle,
        snippet: chunk.content.slice(0, 150) + '...',
      });
    }
  }

  return {
    context: contextParts.join('\n\n'),
    sources,
  };
};

// ========================
// Enrollment Verification
// ========================

/**
 * Verify that a user has an active enrollment in the course.
 */
const verifyEnrollment = async (userId: bigint, courseId: bigint): Promise<void> => {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      courseId,
      status: { in: ['assigned', 'in_progress', 'completed'] },
    },
    select: { id: true },
  });

  if (!enrollment) {
    throw new AppError('Bạn chưa được ghi danh vào khóa học này.', 403);
  }
};

// ========================
// Learning Assistant — Non-streaming
// ========================

/**
 * Ask a question about a specific course (non-streaming).
 * Uses RAG scoped to course lessons only.
 */
export const askAboutCourse = async (
  userId: bigint,
  courseId: bigint,
  question: string,
): Promise<CourseAskResponse> => {
  await ensureModuleEnabled('chatbot', 'Trợ lý Học tập trong Learning Room');
  const cfg = await getEffectiveConfig();
  // Verify enrollment
  await verifyEnrollment(userId, courseId);

  // Get course info for context
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { title: true },
  });

  if (!course) {
    throw new AppError('Khóa học không tồn tại.', 404);
  }

  // Search for relevant lesson chunks scoped to this course
  const relevantChunks = await searchSimilarChunksScoped(question, 'course_lesson', courseId, 5);

  const { context, sources } = buildCourseContext(relevantChunks);

  // Build the prompt
  const contextSection =
    context.length > 0
      ? `\n[NỘI DUNG BÀI HỌC]\nKhóa học: "${course.title}"\n\n${context}\n[/NỘI DUNG BÀI HỌC]`
      : `\n[Không tìm thấy nội dung bài học liên quan trong khóa học "${course.title}"]`;

  // Call Gemini
  const response = await genAI.models.generateContent({
    model: cfg.chatModel,
    contents: [
      {
        role: 'user' as const,
        parts: [{ text: `${contextSection}\n\nCâu hỏi của học viên: ${question}` }],
      },
    ],
    config: {
      systemInstruction: cfg.prompts.learningSystemPrompt,
      temperature: 0.4,
      maxOutputTokens: 2048,
    },
  });

  const aiContent = response.text ?? 'Xin lỗi, tôi không thể trả lời lúc này.';

  return {
    content: aiContent,
    sources,
  };
};

// ========================
// Learning Assistant — Streaming (SSE)
// ========================

/**
 * Ask a question about a specific course with streaming response.
 * Yields text chunks as they arrive from Gemini.
 */
export async function* askAboutCourseStream(
  userId: bigint,
  courseId: bigint,
  question: string,
): AsyncGenerator<{ type: 'text' | 'sources' | 'done' | 'error'; data: string }> {
  // Module guard
  try {
    await ensureModuleEnabled('chatbot', 'Trợ lý Học tập trong Learning Room');
  } catch (error) {
    yield {
      type: 'error',
      data: error instanceof AppError ? error.message : 'Tính năng AI đang tạm tắt.',
    };
    return;
  }
  const cfg = await getEffectiveConfig();
  // Verify enrollment
  try {
    await verifyEnrollment(userId, courseId);
  } catch (error) {
    yield {
      type: 'error',
      data: error instanceof AppError ? error.message : 'Lỗi xác thực quyền truy cập.',
    };
    return;
  }

  // Get course info
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { title: true },
  });

  if (!course) {
    yield { type: 'error', data: 'Khóa học không tồn tại.' };
    return;
  }

  // Search for relevant lesson chunks scoped to this course
  const relevantChunks = await searchSimilarChunksScoped(question, 'course_lesson', courseId, 5);
  const { context, sources } = buildCourseContext(relevantChunks);

  // Emit sources early
  if (sources.length > 0) {
    yield { type: 'sources', data: JSON.stringify(sources) };
  }

  // Build the prompt
  const contextSection =
    context.length > 0
      ? `\n[NỘI DUNG BÀI HỌC]\nKhóa học: "${course.title}"\n\n${context}\n[/NỘI DUNG BÀI HỌC]`
      : `\n[Không tìm thấy nội dung bài học liên quan trong khóa học "${course.title}"]`;

  // Stream from Gemini
  try {
    const response = await genAI.models.generateContentStream({
      model: cfg.chatModel,
      contents: [
        {
          role: 'user' as const,
          parts: [{ text: `${contextSection}\n\nCâu hỏi của học viên: ${question}` }],
        },
      ],
      config: {
        systemInstruction: cfg.prompts.learningSystemPrompt,
        temperature: 0.4,
        maxOutputTokens: 2048,
      },
    });

    for await (const chunk of response) {
      const text = chunk.text;
      if (text) {
        yield { type: 'text', data: text };
      }
    }
  } catch (error) {
    logger.error('Learning Assistant streaming error:', error);
    yield {
      type: 'text',
      data: 'Xin lỗi, đã xảy ra lỗi khi xử lý câu hỏi. Vui lòng thử lại.',
    };
  }

  yield { type: 'done', data: '' };
}
