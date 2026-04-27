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
              // AI Grading fields (only show when not in progress)
              aiSuggestedScore: isInProgress
                ? null
                : aq.response.aiSuggestedScore !== null
                  ? Number(aq.response.aiSuggestedScore)
                  : null,
              aiFeedback: isInProgress ? null : aq.response.aiFeedback || null,
              aiGradedAt: isInProgress
                ? null
                : aq.response.aiGradedAt
                  ? aq.response.aiGradedAt.toISOString()
                  : null,
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
            questionText: question.content,
            questionType: question.questionType,
            explanation: question.explanation,
          };

          // Create options snapshot (only for choice-based questions)
          const optionsSnapshot = ['single_choice', 'multiple_choice', 'true_false'].includes(
            question.questionType,
          )
            ? options.map((opt: any) => ({
                optionId: opt.id.toString(),
                optionText: opt.content,
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

  /**
   * Submit quiz attempt
   * Marks attempt as submitted, calculates time spent
   * Auto-grades if no essay questions, otherwise waits for manual grading
   */
  static async submitQuizAttempt(attemptId: string, userId: string) {
    const db = prisma as any;

    // 1. Get attempt with questions
    const attempt = await db.quizAttempt.findUnique({
      where: { id: BigInt(attemptId) },
      include: {
        enrollment: {
          select: {
            userId: true,
          },
        },
        quiz: {
          select: {
            timeLimitMinutes: true,
          },
        },
        attemptQuestions: {
          include: {
            question: {
              select: {
                questionType: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new AppError('Quiz attempt not found', 404);
    }

    // 2. Verify user owns this attempt
    if (attempt.enrollment.userId.toString() !== userId) {
      throw new AppError('You do not have permission to submit this attempt', 403);
    }

    // 3. Verify attempt is in progress
    if (attempt.status !== 'in_progress') {
      throw new AppError('Quiz attempt has already been submitted', 400);
    }

    // 4. Calculate time spent
    const startedAt = new Date(attempt.startedAt);
    const submittedAt = new Date();
    const timeSpentSeconds = Math.floor((submittedAt.getTime() - startedAt.getTime()) / 1000);

    // 5. Check if there are any essay/short_answer questions
    const hasManualGradingQuestions = attempt.attemptQuestions.some((aq: any) =>
      ['essay', 'short_answer'].includes(aq.question.questionType),
    );

    // 6. Submit attempt
    const updatedAttempt = await db.quizAttempt.update({
      where: { id: BigInt(attemptId) },
      data: {
        status: 'submitted',
        submittedAt,
        timeSpentSeconds,
      },
    });

    // 7. Auto-grade if no manual grading needed
    let gradingResult = null;
    if (!hasManualGradingQuestions) {
      gradingResult = await this.autoGradeObjectiveQuestions(attemptId, userId);
    }

    return {
      attemptId: updatedAttempt.id.toString(),
      status: gradingResult ? gradingResult.status : updatedAttempt.status,
      submittedAt: updatedAttempt.submittedAt.toISOString(),
      timeSpentSeconds: updatedAttempt.timeSpentSeconds,
      objectiveScore: gradingResult ? gradingResult.objectiveScore : null,
      autoGraded: !hasManualGradingQuestions,
      requiresManualGrading: hasManualGradingQuestions,
    };
  }

  /**
   * Get quiz attempt history
   * List all attempts for a specific enrollment or quiz
   */
  static async getAttemptHistory(enrollmentId?: string, quizId?: string, userId?: string) {
    const db = prisma as any;

    // Build where clause
    const where: any = {};

    if (enrollmentId) {
      where.enrollmentId = BigInt(enrollmentId);
    }

    if (quizId) {
      where.quizId = BigInt(quizId);
    }

    // Get attempts
    const attempts = await db.quizAttempt.findMany({
      where,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            passScorePercent: true,
            timeLimitMinutes: true,
          },
        },
        enrollment: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    // If userId provided, filter to only user's attempts
    const filteredAttempts = userId
      ? attempts.filter((a: any) => a.enrollment.userId.toString() === userId)
      : attempts;

    return filteredAttempts.map((attempt: any) => QuizService.serializeAttempt(attempt));
  }

  /**
   * Admin/trainer-scoped listing of quiz attempts with server-side filter + pagination.
   * Does NOT filter by the calling user's userId — intended for grading dashboards.
   */
  static async getAllAttemptsAdmin(params: {
    status?: string;
    aiStatus?: 'all' | 'pending' | 'ai_graded' | 'finalized';
    courseId?: string;
    quizId?: string;
    search?: string;
    page: number;
    limit: number;
    sortBy: 'submittedAt' | 'startedAt' | 'gradedAt' | 'totalScore';
    sortOrder: 'asc' | 'desc';
  }) {
    const db = prisma as any;
    const { status, aiStatus, courseId, quizId, search, page, limit, sortBy, sortOrder } = params;

    const where: any = {};
    if (status) where.status = status;
    if (quizId) where.quizId = BigInt(quizId);
    if (courseId) where.enrollment = { courseId: BigInt(courseId) };

    // AI status is derived from (status, aiGradedAt via attempt_responses). We approximate:
    //   pending    → attempts whose status is 'submitted' AND no response has aiGradedAt set
    //   ai_graded  → attempts whose status is 'submitted' AND at least one response has aiGradedAt set
    //   finalized  → attempts whose status is 'graded'
    if (aiStatus && aiStatus !== 'all') {
      if (aiStatus === 'finalized') {
        where.status = 'graded';
      } else if (aiStatus === 'ai_graded') {
        where.status = 'submitted';
        where.attemptQuestions = {
          some: { response: { aiGradedAt: { not: null } } },
        };
      } else if (aiStatus === 'pending') {
        where.status = 'submitted';
        where.attemptQuestions = {
          none: { response: { aiGradedAt: { not: null } } },
        };
      }
    }

    if (search && search.trim().length > 0) {
      const s = search.trim();
      where.enrollment = {
        ...(where.enrollment ?? {}),
        user: {
          OR: [
            { fullName: { contains: s, mode: 'insensitive' } },
            { email: { contains: s, mode: 'insensitive' } },
          ],
        },
      };
    }

    const orderBy: any = (() => {
      const direction = sortOrder;
      switch (sortBy) {
        case 'startedAt':
          return { startedAt: direction };
        case 'gradedAt':
          return { gradedAt: direction };
        case 'totalScore':
          return { totalScore: direction };
        case 'submittedAt':
        default:
          return { submittedAt: direction };
      }
    })();

    const [total, attempts] = await Promise.all([
      db.quizAttempt.count({ where }),
      db.quizAttempt.findMany({
        where,
        include: {
          quiz: {
            select: {
              id: true,
              title: true,
              passScorePercent: true,
              timeLimitMinutes: true,
            },
          },
          enrollment: {
            select: {
              id: true,
              userId: true,
              user: { select: { id: true, fullName: true, email: true } },
              course: { select: { id: true, title: true } },
            },
          },
          attemptQuestions: {
            select: {
              id: true,
              question: { select: { questionType: true } },
              response: {
                select: { id: true, aiGradedAt: true, awardedPoints: true },
              },
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const items = attempts.map((attempt: any) => {
      const base = QuizService.serializeAttempt(attempt);
      const essayQuestions = (attempt.attemptQuestions ?? []).filter(
        (q: any) => q.question?.questionType === 'essay',
      );
      const totalEssay = essayQuestions.length;
      const aiGradedEssay = essayQuestions.filter((q: any) => !!q.response?.aiGradedAt).length;
      const manuallyGradedEssay = essayQuestions.filter(
        (q: any) => q.response?.awardedPoints !== null && q.response?.awardedPoints !== undefined,
      ).length;
      const hasAi = aiGradedEssay > 0;
      const derivedAiStatus: 'pending' | 'ai_graded' | 'finalized' =
        attempt.status === 'graded' ? 'finalized' : hasAi ? 'ai_graded' : 'pending';

      return {
        ...base,
        essayQuestionCount: totalEssay,
        aiGradedEssayCount: aiGradedEssay,
        manuallyGradedEssayCount: manuallyGradedEssay,
        derivedAiStatus,
      };
    });

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  /** Shared serializer for a single quiz attempt (history or admin view). */
  private static serializeAttempt(attempt: any) {
    return {
      id: attempt.id.toString(),
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
      quiz: {
        id: attempt.quiz.id.toString(),
        title: attempt.quiz.title,
        passScorePercent: Number(attempt.quiz.passScorePercent),
        timeLimitMinutes: attempt.quiz.timeLimitMinutes,
      },
      enrollment: {
        id: attempt.enrollment.id.toString(),
        user: {
          id: attempt.enrollment.user.id.toString(),
          fullName: attempt.enrollment.user.fullName,
          email: attempt.enrollment.user.email,
        },
        course: {
          id: attempt.enrollment.course.id.toString(),
          title: attempt.enrollment.course.title,
        },
      },
    };
  }

  /**
   * Manual grade essay/short_answer response
   * Trainer/admin can manually grade and set awarded points
   */
  static async manualGradeResponse(responseId: string, awardedPoints: number, userId: string) {
    const db = prisma as any;

    // 1. Get response with attempt question and attempt
    const response = await db.attemptResponse.findUnique({
      where: { id: BigInt(responseId) },
      include: {
        attemptQuestion: {
          include: {
            question: {
              select: {
                questionType: true,
              },
            },
            attempt: {
              include: {
                enrollment: {
                  include: {
                    course: {
                      select: {
                        trainerUserId: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!response) {
      throw new AppError('Response not found', 404);
    }

    // 2. Verify user is trainer/admin
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
    const isTrainer = currentUser?.userRoles.some((ur: any) => ur.role.code === 'trainer');
    const isCourseTrainer =
      response.attemptQuestion.attempt.enrollment.course.trainerUserId.toString() === userId;

    if (!isAdmin && !(isTrainer && isCourseTrainer)) {
      throw new AppError('You do not have permission to grade this response', 403);
    }

    // 3. Verify question type is essay or short_answer
    const questionType = response.attemptQuestion.question.questionType;
    if (!['essay', 'short_answer'].includes(questionType)) {
      throw new AppError('Only essay and short_answer questions can be manually graded', 400);
    }

    // 4. Validate awarded points
    const maxPoints = response.attemptQuestion.maxPoints;
    if (awardedPoints < 0 || awardedPoints > maxPoints) {
      throw new AppError(
        `Awarded points must be between 0 and ${maxPoints} (max points for this question)`,
        400,
      );
    }

    // 5. Update response with manual grade
    const updatedResponse = await db.attemptResponse.update({
      where: { id: BigInt(responseId) },
      data: {
        awardedPoints,
        isCorrect: awardedPoints === maxPoints, // Full points = correct
        gradedByUserId: BigInt(userId),
        gradedAt: new Date(),
      },
    });

    // 6. Recalculate attempt scores
    await this.recalculateAttemptScores(
      response.attemptQuestion.attempt.id.toString(),
      response.attemptQuestion.attempt.enrollment.course.trainerUserId.toString(),
    );

    return {
      id: updatedResponse.id.toString(),
      attemptQuestionId: updatedResponse.attemptQuestionId.toString(),
      awardedPoints: Number(updatedResponse.awardedPoints),
      isCorrect: updatedResponse.isCorrect,
      gradedAt: updatedResponse.gradedAt.toISOString(),
      gradedBy: {
        id: userId,
        fullName: currentUser.fullName,
      },
    };
  }

  /**
   * Recalculate attempt total scores after manual grading
   */
  private static async recalculateAttemptScores(attemptId: string, userId: string) {
    const db = prisma as any;

    // Get all responses for this attempt
    const attempt = await db.quizAttempt.findUnique({
      where: { id: BigInt(attemptId) },
      include: {
        attemptQuestions: {
          include: {
            response: true,
          },
        },
        quiz: {
          select: {
            passScorePercent: true,
          },
        },
      },
    });

    if (!attempt) return;

    // Calculate scores
    let objectiveScore = 0;
    let manualScore = 0;
    let totalMaxPoints = 0;

    for (const aq of attempt.attemptQuestions) {
      totalMaxPoints += aq.maxPoints;

      if (aq.response && aq.response.gradedAt) {
        const points = Number(aq.response.awardedPoints);

        // Determine if it's objective or manual
        const questionType = aq.question?.questionType;
        if (['single_choice', 'multiple_choice', 'true_false'].includes(questionType)) {
          objectiveScore += points;
        } else {
          manualScore += points;
        }
      }
    }

    const totalScore = objectiveScore + manualScore;
    const scorePercent = totalMaxPoints > 0 ? (totalScore / totalMaxPoints) * 100 : 0;
    const isPassed = scorePercent >= Number(attempt.quiz.passScorePercent);

    // Update attempt
    await db.quizAttempt.update({
      where: { id: BigInt(attemptId) },
      data: {
        objectiveScore,
        manualScore,
        totalScore,
        isPassed,
        status: 'graded',
      },
    });
  }

  /**
   * Finalize grading for quiz attempt
   * Calculate final scores, mark as passed/failed, set graded_at and graded_by
   * Used after all manual grading is complete
   */
  static async finalizeGrading(attemptId: string, userId: string) {
    const db = prisma as any;

    // 1. Get attempt with all responses
    const attempt = await db.quizAttempt.findUnique({
      where: { id: BigInt(attemptId) },
      include: {
        enrollment: {
          include: {
            course: {
              select: {
                trainerUserId: true,
              },
            },
          },
        },
        quiz: {
          select: {
            passScorePercent: true,
          },
        },
        attemptQuestions: {
          include: {
            question: {
              select: {
                questionType: true,
              },
            },
            response: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new AppError('Quiz attempt not found', 404);
    }

    // 2. Verify user is trainer/admin
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
    const isTrainer = currentUser?.userRoles.some((ur: any) => ur.role.code === 'trainer');
    const isCourseTrainer = attempt.enrollment.course.trainerUserId.toString() === userId;

    if (!isAdmin && !(isTrainer && isCourseTrainer)) {
      throw new AppError('You do not have permission to finalize grading for this attempt', 403);
    }

    // 3. Verify attempt is submitted
    if (attempt.status === 'in_progress') {
      throw new AppError('Cannot finalize grading for attempt that is still in progress', 400);
    }

    // 4. Check if all questions are graded
    const ungradedQuestions = attempt.attemptQuestions.filter(
      (aq: any) => aq.response && !aq.response.gradedAt,
    );

    if (ungradedQuestions.length > 0) {
      throw new AppError(
        `Cannot finalize grading. ${ungradedQuestions.length} question(s) still need to be graded`,
        400,
      );
    }

    // 5. Calculate final scores
    let objectiveScore = 0;
    let manualScore = 0;
    let totalMaxPoints = 0;

    for (const aq of attempt.attemptQuestions) {
      totalMaxPoints += aq.maxPoints;

      if (aq.response && aq.response.gradedAt) {
        const points = Number(aq.response.awardedPoints);

        if (['single_choice', 'multiple_choice', 'true_false'].includes(aq.question.questionType)) {
          objectiveScore += points;
        } else {
          manualScore += points;
        }
      }
    }

    const totalScore = objectiveScore + manualScore;
    const scorePercent = totalMaxPoints > 0 ? (totalScore / totalMaxPoints) * 100 : 0;
    const isPassed = scorePercent >= Number(attempt.quiz.passScorePercent);

    // 6. Update attempt with final grading
    const updatedAttempt = await db.quizAttempt.update({
      where: { id: BigInt(attemptId) },
      data: {
        objectiveScore,
        manualScore,
        totalScore,
        isPassed,
        status: 'graded',
        gradedAt: new Date(),
        gradedByUserId: BigInt(userId),
      },
    });

    return {
      attemptId: updatedAttempt.id.toString(),
      status: updatedAttempt.status,
      objectiveScore: Number(updatedAttempt.objectiveScore),
      manualScore: Number(updatedAttempt.manualScore),
      totalScore: Number(updatedAttempt.totalScore),
      totalMaxPoints,
      scorePercent: Math.round(scorePercent * 100) / 100,
      isPassed: updatedAttempt.isPassed,
      gradedAt: updatedAttempt.gradedAt.toISOString(),
      gradedBy: {
        id: userId,
        fullName: currentUser.fullName,
      },
    };
  }
}
