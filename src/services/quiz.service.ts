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
    // Hide correct answers and scores when attempt is in progress
    const isInProgress = attempt.status === 'in_progress';

    const questions = attempt.attemptQuestions.map((aq: any) => {
      const questionSnapshot = aq.questionSnapshot as {
        questionText: string;
        questionType: 'single_choice' | 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
        explanation: string | null;
      };

      // Hide explanation when in progress
      const sanitizedSnapshot = {
        ...questionSnapshot,
        explanation: isInProgress ? null : questionSnapshot.explanation,
      };

      return {
        id: aq.id.toString(),
        displayOrder: aq.displayOrder,
        maxPoints: aq.maxPoints,
        questionSnapshot: sanitizedSnapshot,
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
              // Hide correct answer info when in progress
              isCorrect: isInProgress ? null : aq.response.isCorrect,
              awardedPoints: isInProgress ? null : Number(aq.response.awardedPoints),
              gradedAt: aq.response.gradedAt ? aq.response.gradedAt.toISOString() : null,
            }
          : null,
      };
    });

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

  /**
   * Start a new quiz attempt
   * Validates max attempts, creates quiz_attempt, generates attempt_no
   */
  static async startQuizAttempt(quizId: string, enrollmentId: string, userId: string) {
    const db = prisma as any;

    // 1. Verify enrollment belongs to user (outside transaction for validation)
    const enrollment = await db.enrollment.findUnique({
      where: { id: BigInt(enrollmentId) },
      include: {
        course: {
          include: {
            quizzes: {
              where: { id: BigInt(quizId) },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    if (enrollment.userId.toString() !== userId) {
      throw new AppError('You do not have permission to access this enrollment', 403);
    }

    // 2. Verify quiz belongs to this course
    if (enrollment.course.quizzes.length === 0) {
      throw new AppError('Quiz not found in this course', 404);
    }

    const quiz = enrollment.course.quizzes[0];

    // 3. Check if there's an in-progress attempt
    const inProgressAttempt = await db.quizAttempt.findFirst({
      where: {
        enrollmentId: BigInt(enrollmentId),
        quizId: BigInt(quizId),
        status: 'in_progress',
      },
    });

    if (inProgressAttempt) {
      throw new AppError(
        'You already have an in-progress attempt for this quiz. Please complete or abandon it first.',
        400,
      );
    }

    // 4. Check max attempts limit
    if (quiz.maxAttempts !== null) {
      const previousAttempts = await db.quizAttempt.count({
        where: {
          enrollmentId: BigInt(enrollmentId),
          quizId: BigInt(quizId),
        },
      });

      if (previousAttempts >= quiz.maxAttempts) {
        throw new AppError(`Maximum attempts (${quiz.maxAttempts}) reached for this quiz`, 400);
      }
    }

    // 5. Get quiz questions (outside transaction for validation)
    const quizQuestions = await db.quizQuestion.findMany({
      where: { quizId: BigInt(quizId) },
      include: {
        question: {
          include: {
            options: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    if (quizQuestions.length === 0) {
      throw new AppError('This quiz has no questions', 400);
    }

    // 6. Shuffle questions if needed
    let orderedQuestions = quizQuestions;
    if (quiz.shuffleQuestions) {
      orderedQuestions = [...quizQuestions].sort(() => Math.random() - 0.5);
    }

    // 7. Use transaction to create attempt and snapshot questions atomically
    const result = await db.$transaction(async (tx: any) => {
      // Generate attempt_no
      const lastAttempt = await tx.quizAttempt.findFirst({
        where: {
          enrollmentId: BigInt(enrollmentId),
          quizId: BigInt(quizId),
        },
        orderBy: {
          attemptNo: 'desc',
        },
      });

      const attemptNo = lastAttempt ? lastAttempt.attemptNo + 1 : 1;

      // Create quiz attempt
      const attempt = await tx.quizAttempt.create({
        data: {
          enrollmentId: BigInt(enrollmentId),
          quizId: BigInt(quizId),
          attemptNo,
          status: 'in_progress',
          startedAt: new Date(),
        },
      });

      // Create attempt questions with snapshots
      const attemptQuestions = await Promise.all(
        orderedQuestions.map(async (qq: any, index: number) => {
          const question = qq.question;

          // Shuffle options if needed
          let options = question.options;
          if (quiz.shuffleOptions && options.length > 0) {
            options = [...options].sort(() => Math.random() - 0.5);
          }

          // Create question snapshot
          const questionSnapshot = {
            questionText: question.questionText,
            questionType: question.questionType,
            explanation: question.explanation,
          };

          // Create options snapshot (only for choice-based questions)
          const optionsSnapshot = ['single_choice', 'multiple_choice', 'true_false'].includes(
            question.questionType,
          )
            ? options.map((opt: any) => ({
                optionId: opt.id.toString(),
                optionText: opt.optionText,
                orderIndex: opt.orderIndex,
              }))
            : null;

          return tx.quizAttemptQuestion.create({
            data: {
              attemptId: attempt.id,
              quizQuestionId: qq.id,
              questionId: question.id,
              displayOrder: index + 1,
              maxPoints: qq.points,
              questionSnapshot,
              optionsSnapshot,
            },
          });
        }),
      );

      return {
        attempt,
        attemptQuestions,
      };
    });

    return {
      attemptId: result.attempt.id.toString(),
      attemptNo: result.attempt.attemptNo,
      quizId: quiz.id.toString(),
      quizTitle: quiz.title,
      timeLimitMinutes: quiz.timeLimitMinutes,
      totalQuestions: result.attemptQuestions.length,
      startedAt: result.attempt.startedAt.toISOString(),
    };
  }
}
