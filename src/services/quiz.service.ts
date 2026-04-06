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

  /**
   * Save or update quiz attempt response
   * Supports both text answers (essay/short_answer) and selected options (choice questions)
   */
  static async saveQuizResponse(
    attemptQuestionId: string,
    userId: string,
    responseText: string | null | undefined,
    selectedOptionIds: string[] | undefined,
  ) {
    const db = prisma as any;

    // 1. Get attempt question with attempt and enrollment info
    const attemptQuestion = await db.quizAttemptQuestion.findUnique({
      where: { id: BigInt(attemptQuestionId) },
      include: {
        attempt: {
          include: {
            enrollment: {
              select: {
                userId: true,
              },
            },
          },
        },
        question: {
          select: {
            questionType: true,
          },
        },
      },
    });

    if (!attemptQuestion) {
      throw new AppError('Quiz attempt question not found', 404);
    }

    // 2. Verify user owns this attempt
    if (attemptQuestion.attempt.enrollment.userId.toString() !== userId) {
      throw new AppError('You do not have permission to answer this question', 403);
    }

    // 3. Verify attempt is still in progress
    if (attemptQuestion.attempt.status !== 'in_progress') {
      throw new AppError('Cannot save response. Quiz attempt is not in progress', 400);
    }

    // 4. Validate response based on question type
    const questionType = attemptQuestion.question.questionType;
    const isChoiceQuestion = ['single_choice', 'multiple_choice', 'true_false'].includes(
      questionType,
    );
    const isTextQuestion = ['short_answer', 'essay'].includes(questionType);

    if (isChoiceQuestion && (!selectedOptionIds || selectedOptionIds.length === 0)) {
      throw new AppError('Selected options are required for choice questions', 400);
    }

    if (isTextQuestion && !responseText) {
      throw new AppError('Response text is required for text-based questions', 400);
    }

    // 5. For single_choice and true_false, ensure only one option is selected
    if (
      ['single_choice', 'true_false'].includes(questionType) &&
      selectedOptionIds &&
      selectedOptionIds.length > 1
    ) {
      throw new AppError('Only one option can be selected for this question type', 400);
    }

    // 6. Upsert response using transaction
    const result = await db.$transaction(async (tx: any) => {
      // Check if response already exists
      const existingResponse = await tx.attemptResponse.findUnique({
        where: { attemptQuestionId: BigInt(attemptQuestionId) },
      });

      let response;

      if (existingResponse) {
        // Update existing response (updatedAt will be auto-updated)
        response = await tx.attemptResponse.update({
          where: { id: existingResponse.id },
          data: {
            responseText: responseText || null,
          },
        });

        // Delete old selected options
        await tx.attemptResponseOption.deleteMany({
          where: { attemptResponseId: existingResponse.id },
        });
      } else {
        // Create new response
        response = await tx.attemptResponse.create({
          data: {
            attemptQuestionId: BigInt(attemptQuestionId),
            responseText: responseText || null,
          },
        });
      }

      // Create selected options for choice questions
      if (isChoiceQuestion && selectedOptionIds && selectedOptionIds.length > 0) {
        await tx.attemptResponseOption.createMany({
          data: selectedOptionIds.map((optionId) => ({
            attemptResponseId: response.id,
            questionOptionId: BigInt(optionId),
          })),
        });
      }

      // Fetch complete response with selected options
      return tx.attemptResponse.findUnique({
        where: { id: response.id },
        include: {
          selectedOptions: {
            select: {
              questionOptionId: true,
            },
          },
        },
      });
    });

    return {
      id: result.id.toString(),
      attemptQuestionId: result.attemptQuestionId.toString(),
      responseText: result.responseText,
      selectedOptionIds: result.selectedOptions.map((so: any) => so.questionOptionId.toString()),
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  /**
   * Auto-grade objective questions (single_choice, multiple_choice, true_false)
   * Calculates isCorrect and awardedPoints for each response
   * Updates attempt with objective_score
   */
  static async autoGradeObjectiveQuestions(attemptId: string, userId: string) {
    const db = prisma as any;

    // 1. Get attempt with questions and responses
    const attempt = await db.quizAttempt.findUnique({
      where: { id: BigInt(attemptId) },
      include: {
        enrollment: {
          select: {
            userId: true,
          },
        },
        attemptQuestions: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
            response: {
              include: {
                selectedOptions: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new AppError('Quiz attempt not found', 404);
    }

    // 2. Verify user owns this attempt (or is admin)
    const currentUser = await db.user.findUnique({
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
      throw new AppError('You do not have permission to grade this attempt', 403);
    }

    // 3. Verify attempt is submitted (not in_progress)
    if (attempt.status === 'in_progress') {
      throw new AppError('Cannot grade attempt that is still in progress', 400);
    }

    // 4. Grade objective questions using transaction
    const result = await db.$transaction(async (tx: any) => {
      let totalObjectiveScore = 0;
      let gradedCount = 0;

      for (const aq of attempt.attemptQuestions) {
        const questionType = aq.question.questionType;
        const isObjective = ['single_choice', 'multiple_choice', 'true_false'].includes(
          questionType,
        );

        // Skip non-objective questions
        if (!isObjective || !aq.response) {
          continue;
        }

        // Get correct option IDs from question
        const correctOptionIds = aq.question.options
          .filter((opt: any) => opt.isCorrect)
          .map((opt: any) => opt.id.toString());

        // Get selected option IDs from response
        const selectedOptionIds = aq.response.selectedOptions.map((so: any) =>
          so.questionOptionId.toString(),
        );

        // Check if answer is correct
        let isCorrect = false;

        if (questionType === 'single_choice' || questionType === 'true_false') {
          // For single choice: must select exactly one correct option
          isCorrect =
            selectedOptionIds.length === 1 &&
            correctOptionIds.length === 1 &&
            selectedOptionIds[0] === correctOptionIds[0];
        } else if (questionType === 'multiple_choice') {
          // For multiple choice: must select all correct options and no incorrect ones
          const selectedSet = new Set(selectedOptionIds);
          const correctSet = new Set(correctOptionIds);

          isCorrect =
            selectedSet.size === correctSet.size &&
            [...selectedSet].every((id) => correctSet.has(id));
        }

        // Calculate awarded points
        const awardedPoints = isCorrect ? aq.maxPoints : 0;
        totalObjectiveScore += awardedPoints;
        gradedCount++;

        // Update response with grading result
        await tx.attemptResponse.update({
          where: { id: aq.response.id },
          data: {
            isCorrect,
            awardedPoints,
            gradedAt: new Date(),
          },
        });
      }

      // Update attempt with objective score
      const updatedAttempt = await tx.quizAttempt.update({
        where: { id: BigInt(attemptId) },
        data: {
          objectiveScore: totalObjectiveScore,
          status: 'graded', // Mark as graded (may need manual grading for essays)
        },
      });

      return {
        attemptId: updatedAttempt.id.toString(),
        objectiveScore: Number(updatedAttempt.objectiveScore),
        gradedQuestionsCount: gradedCount,
        status: updatedAttempt.status,
      };
    });

    return result;
  }
}
