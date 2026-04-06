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
