import { Router, type Router as ExpressRouter } from 'express';
import {
  createSession,
  deleteSession,
  getMessages,
  getSessions,
  indexAllDocuments,
  indexDocument,
  indexLesson,
  indexCourseLessons,
  sendMessage,
  sendMessageStream,
  askCourse,
  askCourseStream,
  gradeEssay,
  gradeQuizEssays,
} from '@/controllers/ai-chat.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { restrictTo } from '@/middlewares/rbac.middleware';
import {
  createSessionSchema,
  documentParamsSchema,
  sendMessageSchema,
  sessionParamsSchema,
  courseParamsSchema,
  lessonParamsSchema,
  courseAskSchema,
  attemptQuestionParamsSchema,
  quizAttemptParamsSchema,
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
// Chat Messages (Company Knowledge)
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
// Learning Assistant: Course Q&A
// ========================

/**
 * @route   POST /api/v1/ai-chat/course/:courseId/ask
 * @desc    Ask AI about course content (non-streaming)
 * @access  Private (enrolled users only)
 */
router.post(
  '/course/:courseId/ask',
  validate(courseParamsSchema, 'params'),
  validate(courseAskSchema),
  askCourse,
);

/**
 * @route   POST /api/v1/ai-chat/course/:courseId/ask/stream
 * @desc    Ask AI about course content (SSE streaming)
 * @access  Private (enrolled users only)
 */
router.post(
  '/course/:courseId/ask/stream',
  validate(courseParamsSchema, 'params'),
  validate(courseAskSchema),
  askCourseStream,
);

// ========================
// AI Grading: Essay Auto-Grading
// ========================

/**
 * @route   POST /api/v1/ai-chat/grade-essay/:attemptQuestionId
 * @desc    AI grades a single essay question
 * @access  Private (Admin, Trainer only)
 */
router.post(
  '/grade-essay/:attemptQuestionId',
  restrictTo('admin', 'trainer'),
  validate(attemptQuestionParamsSchema, 'params'),
  gradeEssay,
);

/**
 * @route   POST /api/v1/ai-chat/grade-quiz/:quizAttemptId
 * @desc    AI grades all essay questions in a quiz attempt
 * @access  Private (Admin, Trainer only)
 */
router.post(
  '/grade-quiz/:quizAttemptId',
  restrictTo('admin', 'trainer'),
  validate(quizAttemptParamsSchema, 'params'),
  gradeQuizEssays,
);

// ========================
// Admin: Document Indexing
// ========================

/**
 * @route   POST /api/v1/ai-chat/admin/index-all
 * @desc    Index all active company documents for RAG
 * @access  Private (Admin only)
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

// ========================
// Admin: Course Lesson Indexing
// ========================

/**
 * @route   POST /api/v1/ai-chat/admin/index-lesson/:lessonId
 * @desc    Index a specific course lesson for Learning Assistant
 * @access  Private (Admin, Trainer)
 */
router.post(
  '/admin/index-lesson/:lessonId',
  restrictTo('admin', 'trainer'),
  validate(lessonParamsSchema, 'params'),
  indexLesson,
);

/**
 * @route   POST /api/v1/ai-chat/admin/index-course-lessons/:courseId
 * @desc    Index all lessons in a course for Learning Assistant
 * @access  Private (Admin, Trainer)
 */
router.post(
  '/admin/index-course-lessons/:courseId',
  restrictTo('admin', 'trainer'),
  validate(courseParamsSchema, 'params'),
  indexCourseLessons,
);

export default router;
