import { prisma } from '@/config/database';
import type { QuizAttemptDetailResponse } from '@/interfaces/quiz.types';
import { AppError } from '@/utils';

export class QuizService {
  /**
   * Get quiz attempt detail for UI
   * Includes attempt info, time limit, saved responses, and question snapshots
   */
  static async getQuizAttemptDetail(
    attemptId: string,
    userId: string,
  ): Promise<QuizAttemptDetailResponse> {
    const attempt = await (prisma as any).quizAttempt.findUnique({
      where: { id: BigInt(attemptId) },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            passScorePercent: true,
            timeLimitMinutes: true,
            maxAttempts: true,
            shuffleQuestions: true,
            shuffleOptions: true,
          },
        },
        enrollment: {
          select: {
            userId: true,
          },
        },
        attemptQuestions: {
          include: {
            response: {
              include: {
                selectedOptions: {
                  select: {
                    questionOptionId: true,
                  },
                },
              },
            },
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
        gradedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new AppError('Quiz attempt not found', 404);
    }

    // Check permission: user must own this attempt (unless admin)
    const currentUser = await (prisma as any).user.findUnique({
      where: { id: BigInt(userId) },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    const isAdmin = currentUser?.userRoles.some((ur: any) => ur.role.code === 'admin');
    if (!isAdmin && attempt.enrollment.userId.toString() !== userId) {
      throw new AppError('You do not have permission to view this quiz attempt', 403);
    }

    // Calculate time remaining
    const timeLimitSeconds = attempt.quiz.timeLimitMinutes
      ? attempt.quiz.timeLimitMinutes * 60
      : null;

    let timeRemainingSeconds: number | null = null;
    let isTimedOut = false;

    if (timeLimitSeconds && attempt.status === 'in_progress') {
      const elapsedSeconds = Math.floor(
        (new Date().getTime() - new Date(attempt.startedAt).getTime()) / 1000,
      );
      timeRemainingSeconds = Math.max(0, timeLimitSeconds - elapsedSeconds);
      isTimedOut = timeRemainingSeconds === 0;
    }

    // Map questions with responses
    const questions = attempt.attemptQuestions.map((aq: any) => ({
      id: aq.id.toString(),
      displayOrder: aq.displayOrder,
      maxPoints: aq.maxPoints,
      questionSnapshot: aq.questionSnapshot as {
        questionText: string;
        questionType: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
        explanation: string | null;
      },
      optionsSnapshot: aq.optionsSnapshot as Array<{
        optionId: string;
        optionText: string;
        orderIndex: number;
      }> | null,
      response: aq.response
        ? {
            id: aq.response.id.toString(),
            responseText: aq.response.responseText,
            selectedOptionIds: aq.response.selectedOptions.map((so: any) =>
              so.questionOptionId.toString(),
            ),
            isCorrect: aq.response.isCorrect,
            awardedPoints: Number(aq.response.awardedPoints),
            gradedAt: aq.response.gradedAt ? aq.response.gradedAt.toISOString() : null,
          }
        : null,
    }));

    return {
      id: attempt.id.toString(),
      enrollmentId: attempt.enrollmentId.toString(),
      quizId: attempt.quizId.toString(),
      attemptNo: attempt.attemptNo,
      status: attempt.status,
      objectiveScore: attempt.objectiveScore ? Number(attempt.objectiveScore) : null,
      manualScore: attempt.manualScore ? Number(attempt.manualScore) : null,
      totalScore: attempt.totalScore ? Number(attempt.totalScore) : null,
      isPassed: attempt.isPassed,
      startedAt: attempt.startedAt.toISOString(),
      submittedAt: attempt.submittedAt ? attempt.submittedAt.toISOString() : null,
      gradedAt: attempt.gradedAt ? attempt.gradedAt.toISOString() : null,
      timeSpentSeconds: attempt.timeSpentSeconds,
      timeLimitSeconds,
      timeRemainingSeconds,
      isTimedOut,
      quiz: {
        id: attempt.quiz.id.toString(),
        title: attempt.quiz.title,
        description: attempt.quiz.description,
        passScorePercent: Number(attempt.quiz.passScorePercent),
        timeLimitMinutes: attempt.quiz.timeLimitMinutes,
        maxAttempts: attempt.quiz.maxAttempts,
        shuffleQuestions: attempt.quiz.shuffleQuestions,
        shuffleOptions: attempt.quiz.shuffleOptions,
      },
      questions,
      gradedBy: attempt.gradedByUser
        ? {
            id: attempt.gradedByUser.id.toString(),
            fullName: attempt.gradedByUser.fullName,
            email: attempt.gradedByUser.email,
          }
        : null,
    };
  }
}
