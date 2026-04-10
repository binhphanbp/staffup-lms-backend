import type { NextFunction, Response } from 'express';
import { catchAsync, sendCreated, sendSuccess } from '@/utils';
import type { AuthRequest } from '@/interfaces';
import * as chatService from '@/services/ai-chat.service';
import * as embeddingService from '@/services/embedding.service';
import * as learningAssistantService from '@/services/learning-assistant.service';
import * as aiGradingService from '@/services/ai-grading.service';
import { logger } from '@/config/logger';

// ========================
// Chat Session Endpoints
// ========================

export const createSession = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = BigInt(req.user!.userId);
    const { title } = req.body;

    const session = await chatService.createSession(userId, title);
    sendCreated(res, session, 'Tạo phiên trò chuyện thành công');
  },
);

export const getSessions = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = BigInt(req.user!.userId);
    const sessions = await chatService.getSessions(userId);
    sendSuccess(res, sessions, 'Lấy danh sách phiên trò chuyện thành công');
  },
);

export const getMessages = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = BigInt(req.user!.userId);
    const sessionId = BigInt(req.params['sessionId'] as string);

    const messages = await chatService.getMessages(sessionId, userId);
    sendSuccess(res, messages, 'Lấy lịch sử tin nhắn thành công');
  },
);

export const deleteSession = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = BigInt(req.user!.userId);
    const sessionId = BigInt(req.params['sessionId'] as string);

    await chatService.deleteSession(sessionId, userId);
    sendSuccess(res, null, 'Xoá phiên trò chuyện thành công');
  },
);

// ========================
// Chat Endpoint (Non-streaming)
// ========================

export const sendMessage = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = BigInt(req.user!.userId);
    const { message, sessionId } = req.body;

    const result = await chatService.chat(userId, sessionId ? BigInt(sessionId) : null, message);

    sendSuccess(res, result, 'Trả lời thành công');
  },
);

// ========================
// Chat Stream Endpoint (SSE)
// ========================

export const sendMessageStream = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = BigInt(req.user!.userId);
    const { message, sessionId } = req.body;

    // SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    try {
      const stream = chatService.chatStream(userId, sessionId ? BigInt(sessionId) : null, message);

      for await (const event of stream) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    } catch (error) {
      logger.error('SSE stream error:', error);
      res.write(
        `data: ${JSON.stringify({ type: 'error', data: 'Đã xảy ra lỗi. Vui lòng thử lại.' })}\n\n`,
      );
    }

    res.end();
  },
);

// ========================
// Admin: Document Management
// ========================

export const indexAllDocuments = catchAsync(
  async (_req: AuthRequest, res: Response, _next: NextFunction) => {
    const result = await embeddingService.indexAllDocuments();
    sendSuccess(res, result, 'Đánh chỉ mục tất cả tài liệu thành công');
  },
);

export const indexDocument = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const documentId = BigInt(req.params['documentId'] as string);
    const chunks = await embeddingService.indexCompanyDocument(documentId);
    sendSuccess(
      res,
      { documentId: documentId.toString(), chunks },
      'Đánh chỉ mục tài liệu thành công',
    );
  },
);

// ========================
// Admin: Course Lesson Indexing
// ========================

export const indexLesson = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const lessonId = BigInt(req.params['lessonId'] as string);
    const chunks = await embeddingService.indexCourseLesson(lessonId);
    sendSuccess(res, { lessonId: lessonId.toString(), chunks }, 'Đánh chỉ mục bài học thành công');
  },
);

export const indexCourseLessons = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const courseId = BigInt(req.params['courseId'] as string);
    const result = await embeddingService.indexCourseLessons(courseId);
    sendSuccess(
      res,
      { courseId: courseId.toString(), ...result },
      'Đánh chỉ mục tất cả bài học trong khóa học thành công',
    );
  },
);

// ========================
// Learning Assistant: Course Q&A
// ========================

export const askCourse = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = BigInt(req.user!.userId);
    const courseId = BigInt(req.params['courseId'] as string);
    const { question } = req.body;

    const result = await learningAssistantService.askAboutCourse(userId, courseId, question);
    sendSuccess(res, result, 'Trả lời thành công');
  },
);

export const askCourseStream = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const userId = BigInt(req.user!.userId);
    const courseId = BigInt(req.params['courseId'] as string);
    const { question } = req.body;

    // SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    try {
      const stream = learningAssistantService.askAboutCourseStream(userId, courseId, question);

      for await (const event of stream) {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      }
    } catch (error) {
      logger.error('Learning Assistant SSE stream error:', error);
      res.write(
        `data: ${JSON.stringify({ type: 'error', data: 'Đã xảy ra lỗi. Vui lòng thử lại.' })}\n\n`,
      );
    }

    res.end();
  },
);

// ========================
// AI Grading: Essay Auto-Grading
// ========================

export const gradeEssay = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const attemptQuestionId = BigInt(req.params['attemptQuestionId'] as string);
    const result = await aiGradingService.gradeEssay(attemptQuestionId);
    sendSuccess(res, result, 'Chấm bài tự luận thành công');
  },
);

export const gradeQuizEssays = catchAsync(
  async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const quizAttemptId = BigInt(req.params['quizAttemptId'] as string);
    const result = await aiGradingService.gradeQuizEssays(quizAttemptId);
    sendSuccess(res, result, 'Chấm tất cả câu tự luận thành công');
  },
);
