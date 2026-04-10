import { z } from 'zod';

// ========================
// Chat Schemas
// ========================

export const sendMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Tin nhắn không được để trống')
    .max(2000, 'Tin nhắn không được vượt quá 2000 ký tự'),
  sessionId: z.string().optional().nullable(),
});

export const createSessionSchema = z.object({
  title: z.string().max(200, 'Tiêu đề không được vượt quá 200 ký tự').optional(),
});

export const sessionParamsSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

export const documentParamsSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
});

// ========================
// Learning Assistant Schemas
// ========================

export const courseParamsSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
});

export const lessonParamsSchema = z.object({
  lessonId: z.string().min(1, 'Lesson ID is required'),
});

export const courseAskSchema = z.object({
  question: z
    .string()
    .min(1, 'Câu hỏi không được để trống')
    .max(2000, 'Câu hỏi không được vượt quá 2000 ký tự'),
});

// ========================
// AI Grading Schemas
// ========================

export const attemptQuestionParamsSchema = z.object({
  attemptQuestionId: z.string().min(1, 'Attempt Question ID is required'),
});

export const quizAttemptParamsSchema = z.object({
  quizAttemptId: z.string().min(1, 'Quiz Attempt ID is required'),
});
