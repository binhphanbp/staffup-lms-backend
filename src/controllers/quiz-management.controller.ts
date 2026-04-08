import type { Response } from 'express';
import type { AuthRequest } from '@/interfaces';
import { QuizManagementService } from '@/services/quiz-management.service';
import { catchAsync, sendSuccess } from '@/utils';

export const createQuiz = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const quiz = await QuizManagementService.createQuiz(req.body, userId);

  sendSuccess(res, quiz, 'Quiz created successfully', 201);
});

export const updateQuiz = catchAsync(async (req: AuthRequest, res: Response) => {
  const quizId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = req.user!.userId;

  const quiz = await QuizManagementService.updateQuiz(quizId, req.body, userId);

  sendSuccess(res, quiz, 'Quiz updated successfully');
});

export const deleteQuiz = catchAsync(async (req: AuthRequest, res: Response) => {
  const quizId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = req.user!.userId;

  const result = await QuizManagementService.deleteQuiz(quizId, userId);

  sendSuccess(res, result, 'Quiz deleted successfully');
});

export const getQuizById = catchAsync(async (req: AuthRequest, res: Response) => {
  const quizId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = req.user!.userId;

  const quiz = await QuizManagementService.getQuizById(quizId, userId);

  sendSuccess(res, quiz, 'Quiz retrieved successfully');
});

export const listQuizzes = catchAsync(async (req: AuthRequest, res: Response) => {
  const { courseId, lessonId, selectionMode, page, limit } = req.query;
  const userId = req.user!.userId;

  const result = await QuizManagementService.listQuizzes(
    {
      courseId: courseId as string,
      lessonId: lessonId as string,
      selectionMode: selectionMode as 'fixed' | 'random_pool' | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    },
    userId,
  );

  sendSuccess(res, result, 'Quizzes retrieved successfully');
});

export const addQuestionToQuiz = catchAsync(async (req: AuthRequest, res: Response) => {
  const quizId = Array.isArray(req.params.quizId) ? req.params.quizId[0] : req.params.quizId;
  const userId = req.user!.userId;

  const result = await QuizManagementService.addQuestionToQuiz(quizId, req.body, userId);

  sendSuccess(res, result, 'Question added to quiz successfully', 201);
});

export const removeQuestionFromQuiz = catchAsync(async (req: AuthRequest, res: Response) => {
  const quizId = Array.isArray(req.params.quizId) ? req.params.quizId[0] : req.params.quizId;
  const questionId = Array.isArray(req.params.questionId)
    ? req.params.questionId[0]
    : req.params.questionId;
  const userId = req.user!.userId;

  const result = await QuizManagementService.removeQuestionFromQuiz(quizId, questionId, userId);

  sendSuccess(res, result, 'Question removed from quiz successfully');
});

export const updateQuizQuestion = catchAsync(async (req: AuthRequest, res: Response) => {
  const quizId = Array.isArray(req.params.quizId) ? req.params.quizId[0] : req.params.quizId;
  const questionId = Array.isArray(req.params.questionId)
    ? req.params.questionId[0]
    : req.params.questionId;
  const userId = req.user!.userId;

  const result = await QuizManagementService.updateQuizQuestion(
    quizId,
    questionId,
    req.body,
    userId,
  );

  sendSuccess(res, result, 'Quiz question updated successfully');
});

export const reorderQuizQuestions = catchAsync(async (req: AuthRequest, res: Response) => {
  const quizId = Array.isArray(req.params.quizId) ? req.params.quizId[0] : req.params.quizId;
  const userId = req.user!.userId;

  const result = await QuizManagementService.reorderQuizQuestions(
    quizId,
    req.body.questionOrders,
    userId,
  );

  sendSuccess(res, result, 'Quiz questions reordered successfully');
});
