import type { Response } from 'express';
import type { AuthRequest } from '@/interfaces';
import { QuizService } from '@/services/quiz.service';
import { catchAsync, sendSuccess } from '@/utils';

export const getQuizAttemptDetail = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = req.user!.userId;

  const attemptDetail = await QuizService.getQuizAttemptDetail(id, userId);

  sendSuccess(res, attemptDetail, 'Quiz attempt detail retrieved successfully');
});

export const startQuizAttempt = catchAsync(async (req: AuthRequest, res: Response) => {
  const { quizId, enrollmentId } = req.body;
  const userId = req.user!.userId;

  const attempt = await QuizService.startQuizAttempt(quizId, enrollmentId, userId);

  sendSuccess(res, attempt, 'Quiz attempt started successfully');
});

export const saveQuizResponse = catchAsync(async (req: AuthRequest, res: Response) => {
  const { attemptQuestionId, responseText, selectedOptionIds } = req.body;
  const userId = req.user!.userId;

  const response = await QuizService.saveQuizResponse(
    attemptQuestionId,
    userId,
    responseText,
    selectedOptionIds,
  );

  sendSuccess(res, response, 'Response saved successfully');
});

export const autoGradeObjectiveQuestions = catchAsync(async (req: AuthRequest, res: Response) => {
  const attemptId = Array.isArray(req.params.attemptId)
    ? req.params.attemptId[0]
    : req.params.attemptId;
  const userId = req.user!.userId;

  const result = await QuizService.autoGradeObjectiveQuestions(attemptId, userId);

  sendSuccess(res, result, 'Objective questions graded successfully');
});

export const submitQuizAttempt = catchAsync(async (req: AuthRequest, res: Response) => {
  const attemptId = Array.isArray(req.params.attemptId)
    ? req.params.attemptId[0]
    : req.params.attemptId;
  const userId = req.user!.userId;

  const result = await QuizService.submitQuizAttempt(attemptId, userId);

  sendSuccess(res, result, 'Quiz attempt submitted successfully');
});
