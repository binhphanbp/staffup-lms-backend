import type { NextFunction, Response } from 'express';
import { catchAsync, sendCreated, sendSuccess } from '@/utils';
import type { AuthRequest } from '@/interfaces';
import * as chatService from '@/services/ai-chat.service';
import * as embeddingService from '@/services/embedding.service';
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
