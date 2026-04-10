import { Router, type Router as ExpressRouter } from 'express';
import {
  createSession,
  deleteSession,
  getMessages,
  getSessions,
  indexAllDocuments,
  indexDocument,
  sendMessage,
  sendMessageStream,
} from '@/controllers/ai-chat.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { restrictTo } from '@/middlewares/rbac.middleware';
import {
  createSessionSchema,
  documentParamsSchema,
  sendMessageSchema,
  sessionParamsSchema,
} from '@/schemas/ai-chat.schema';

const router: ExpressRouter = Router();

// All routes require authentication
router.use(authenticate);

// ========================
// Chat Session Management
// ========================

/**
 * @route   POST /api/v1/ai-chat/sessions
 * @desc    Create a new chat session
 * @access  Private
 */
router.post('/sessions', validate(createSessionSchema), createSession);

/**
 * @route   GET /api/v1/ai-chat/sessions
 * @desc    Get all chat sessions for current user
 * @access  Private
 */
router.get('/sessions', getSessions);

/**
 * @route   GET /api/v1/ai-chat/sessions/:sessionId/messages
 * @desc    Get messages for a specific chat session
 * @access  Private
 */
router.get('/sessions/:sessionId/messages', validate(sessionParamsSchema, 'params'), getMessages);

/**
 * @route   DELETE /api/v1/ai-chat/sessions/:sessionId
 * @desc    Delete (soft) a chat session
 * @access  Private
 */
router.delete('/sessions/:sessionId', validate(sessionParamsSchema, 'params'), deleteSession);

// ========================
// Chat Messages
// ========================

/**
 * @route   POST /api/v1/ai-chat/message
 * @desc    Send a message and get AI response (non-streaming)
 * @access  Private
 */
router.post('/message', validate(sendMessageSchema), sendMessage);

/**
 * @route   POST /api/v1/ai-chat/message/stream
 * @desc    Send a message and get AI response via SSE streaming
 * @access  Private
 */
router.post('/message/stream', validate(sendMessageSchema), sendMessageStream);

// ========================
// Admin: Document Indexing
// ========================

/**
 * @route   POST /api/v1/ai-chat/admin/index-all
 * @desc    Index all active company documents for RAG
 * @access  Private (Admin only — add authorize middleware as needed)
 */
router.post('/admin/index-all', restrictTo('admin'), indexAllDocuments);

/**
 * @route   POST /api/v1/ai-chat/admin/index/:documentId
 * @desc    Index a specific company document
 * @access  Private (Admin only)
 */
router.post(
  '/admin/index/:documentId',
  restrictTo('admin'),
  validate(documentParamsSchema, 'params'),
  indexDocument,
);

export default router;
