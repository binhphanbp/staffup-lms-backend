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

export const getAttemptHistory = catchAsync(async (req: AuthRequest, res: Response) => {
  const { enrollmentId, quizId } = req.query;
  const userId = req.user!.userId;

  const history = await QuizService.getAttemptHistory(
    enrollmentId as string | undefined,
    quizId as string | undefined,
    userId,
  );

  sendSuccess(res, history, 'Attempt history retrieved successfully');
});

export const getAllAttemptsAdmin = catchAsync(async (req: AuthRequest, res: Response) => {
  const { status, aiStatus, courseId, quizId, search, page, limit, sortBy, sortOrder } =
    req.query as Record<string, string | undefined>;

  const result = await QuizService.getAllAttemptsAdmin({
    status,
    aiStatus: aiStatus as 'all' | 'pending' | 'ai_graded' | 'finalized' | undefined,
    courseId,
    quizId,
    search,
    page: Number(page ?? 1),
    limit: Number(limit ?? 20),
    sortBy: (sortBy as 'submittedAt' | 'startedAt' | 'gradedAt' | 'totalScore') ?? 'submittedAt',
    sortOrder: (sortOrder as 'asc' | 'desc') ?? 'desc',
  });

  sendSuccess(res, result, 'Quiz attempts retrieved successfully');
});

export const manualGradeResponse = catchAsync(async (req: AuthRequest, res: Response) => {
  const responseId = Array.isArray(req.params.responseId)
    ? req.params.responseId[0]
    : req.params.responseId;
  const { awardedPoints } = req.body;
  const userId = req.user!.userId;

  const result = await QuizService.manualGradeResponse(responseId, awardedPoints, userId);

  sendSuccess(res, result, 'Response graded successfully');
});

export const finalizeGrading = catchAsync(async (req: AuthRequest, res: Response) => {
  const attemptId = Array.isArray(req.params.attemptId)
    ? req.params.attemptId[0]
    : req.params.attemptId;
  const userId = req.user!.userId;

  const result = await QuizService.finalizeGrading(attemptId, userId);

  sendSuccess(res, result, 'Grading finalized successfully');
});
