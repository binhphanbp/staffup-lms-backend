import { prisma } from '@/config/database';
import { AppError } from '@/utils';

export class QuizManagementService {
  /**
   * Create quiz
   */
  static async createQuiz(
    data: {
      courseId: string;
      lessonId?: string;
      title: string;
      description?: string;
      selectionMode?: 'fixed' | 'random_pool';
      passScorePercent?: number;
      timeLimitMinutes?: number;
      maxAttempts?: number;
      questionsToPull?: number;
      shuffleQuestions?: boolean;
      shuffleOptions?: boolean;
      questions?: Array<{
        questionId: string;
        orderIndex?: number;
        points?: number;
        isRequired?: boolean;
      }>;
    },
    userId: string,
  ) {
    const db = prisma as any;

    // Check permission: admin or trainer of the course
    const course = await db.course.findUnique({
      where: { id: BigInt(data.courseId) },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

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
    const isCourseTrainer = course.trainerUserId.toString() === userId;

    if (!isAdmin && !(isTrainer && isCourseTrainer)) {
      throw new AppError('You do not have permission to create quiz for this course', 403);
    }

    // Validate lesson if provided
    if (data.lessonId) {
      const lesson = await db.lesson.findUnique({
        where: { id: BigInt(data.lessonId) },
      });

      if (!lesson || lesson.moduleId === null) {
        throw new AppError('Lesson not found', 404);
      }

      // Check if lesson belongs to course
      const module = await db.module.findUnique({
        where: { id: lesson.moduleId },
      });

      if (module.courseId.toString() !== data.courseId) {
        throw new AppError('Lesson does not belong to this course', 400);
      }
    }

    // Validate quiz config
    if (data.passScorePercent !== undefined) {
      if (data.passScorePercent < 0 || data.passScorePercent > 100) {
        throw new AppError('Pass score percent must be between 0 and 100', 400);
      }
    }

    if (data.timeLimitMinutes !== undefined && data.timeLimitMinutes <= 0) {
      throw new AppError('Time limit must be greater than 0', 400);
    }

    if (data.maxAttempts !== undefined && data.maxAttempts <= 0) {
      throw new AppError('Max attempts must be greater than 0', 400);
    }

    if (data.questionsToPull !== undefined && data.questionsToPull <= 0) {
      throw new AppError('Questions to pull must be greater than 0', 400);
    }

    // Validate random_pool mode
    if (data.selectionMode === 'random_pool') {
      if (!data.questionsToPull) {
        throw new AppError('Questions to pull is required for random_pool selection mode', 400);
      }

      // Check if we have enough questions in the pool
      if (data.questions && data.questions.length < data.questionsToPull) {
        throw new AppError(
          `Not enough questions in pool. Need at least ${data.questionsToPull} questions, but only ${data.questions.length} provided`,
          400,
        );
      }
    }

    // Create quiz
    const quiz = await db.quiz.create({
      data: {
        courseId: BigInt(data.courseId),
        lessonId: data.lessonId ? BigInt(data.lessonId) : null,
        title: data.title,
        description: data.description || null,
        selectionMode: data.selectionMode || 'fixed',
        passScorePercent: data.passScorePercent || 70,
        timeLimitMinutes: data.timeLimitMinutes || null,
        maxAttempts: data.maxAttempts || null,
        questionsToPull: data.questionsToPull || null,
        shuffleQuestions: data.shuffleQuestions ?? true,
        shuffleOptions: data.shuffleOptions ?? true,
      },
    });

    // Add questions if provided
    if (data.questions && data.questions.length > 0) {
      await db.quizQuestion.createMany({
        data: data.questions.map((q, index) => ({
          quizId: quiz.id,
          questionId: BigInt(q.questionId),
          orderIndex: q.orderIndex ?? index + 1,
          points: q.points || 1,
          isRequired: q.isRequired ?? true,
        })),
      });
    }

    return this.getQuizById(quiz.id.toString(), userId);
  }

  /**
   * Update quiz
   */
  static async updateQuiz(
    quizId: string,
    data: {
      title?: string;
      description?: string;
      selectionMode?: 'fixed' | 'random_pool';
      passScorePercent?: number;
      timeLimitMinutes?: number;
      maxAttempts?: number;
      questionsToPull?: number;
      shuffleQuestions?: boolean;
      shuffleOptions?: boolean;
    },
    userId: string,
  ) {
    const db = prisma as any;

    const quiz = await db.quiz.findUnique({
      where: { id: BigInt(quizId) },
      include: {
        course: true,
      },
    });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    // Check permission
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
    const isCourseTrainer = quiz.course.trainerUserId.toString() === userId;

    if (!isAdmin && !(isTrainer && isCourseTrainer)) {
      throw new AppError('You do not have permission to update this quiz', 403);
    }

    // Validate quiz config
    if (data.passScorePercent !== undefined) {
      if (data.passScorePercent < 0 || data.passScorePercent > 100) {
        throw new AppError('Pass score percent must be between 0 and 100', 400);
      }
    }

    if (data.timeLimitMinutes !== undefined && data.timeLimitMinutes <= 0) {
      throw new AppError('Time limit must be greater than 0', 400);
    }

    if (data.maxAttempts !== undefined && data.maxAttempts <= 0) {
      throw new AppError('Max attempts must be greater than 0', 400);
    }

    if (data.questionsToPull !== undefined && data.questionsToPull <= 0) {
      throw new AppError('Questions to pull must be greater than 0', 400);
    }

    // Validate random_pool mode
    if (data.selectionMode === 'random_pool') {
      if (!data.questionsToPull && !quiz.questionsToPull) {
        throw new AppError('Questions to pull is required for random_pool selection mode', 400);
      }

      // Check if we have enough questions in the pool
      const questionsToPull = data.questionsToPull || quiz.questionsToPull;
      const currentQuestionsCount = await db.quizQuestion.count({
        where: { quizId: BigInt(quizId) },
      });

      if (currentQuestionsCount < questionsToPull) {
        throw new AppError(
          `Not enough questions in pool. Need at least ${questionsToPull} questions, but only ${currentQuestionsCount} available`,
          400,
        );
      }
    }

    // Update quiz
    await db.quiz.update({
      where: { id: BigInt(quizId) },
      data: {
        title: data.title,
        description: data.description,
        selectionMode: data.selectionMode,
        passScorePercent: data.passScorePercent,
        timeLimitMinutes: data.timeLimitMinutes,
        maxAttempts: data.maxAttempts,
        questionsToPull: data.questionsToPull,
        shuffleQuestions: data.shuffleQuestions,
        shuffleOptions: data.shuffleOptions,
      },
    });

    return this.getQuizById(quizId, userId);
  }

  /**
   * Delete quiz
   */
  static async deleteQuiz(quizId: string, userId: string) {
    const db = prisma as any;

    const quiz = await db.quiz.findUnique({
      where: { id: BigInt(quizId) },
      include: {
        course: true,
      },
    });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    // Check permission
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
    const isCourseTrainer = quiz.course.trainerUserId.toString() === userId;

    if (!isAdmin && !(isTrainer && isCourseTrainer)) {
      throw new AppError('You do not have permission to delete this quiz', 403);
    }

    // Delete quiz (cascade will handle quiz_questions, attempts, etc.)
    await db.quiz.delete({
      where: { id: BigInt(quizId) },
    });

    return { quizId, deleted: true };
  }

  /**
   * Get quiz by ID
   */
  static async getQuizById(quizId: string, userId: string) {
    const db = prisma as any;

    const quiz = await db.quiz.findUnique({
      where: { id: BigInt(quizId) },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            trainerUserId: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
        quizQuestions: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    // Check permission: admin, trainer, or enrolled student
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
    const isCourseTrainer = quiz.course.trainerUserId.toString() === userId;

    // Check if user is enrolled
    const enrollment = await db.enrollment.findFirst({
      where: {
        userId: BigInt(userId),
        courseId: quiz.courseId,
      },
    });

    if (!isAdmin && !(isTrainer && isCourseTrainer) && !enrollment) {
      throw new AppError('You do not have permission to view this quiz', 403);
    }

    return {
      id: quiz.id.toString(),
      courseId: quiz.courseId.toString(),
      lessonId: quiz.lessonId?.toString() || null,
      title: quiz.title,
      description: quiz.description,
      selectionMode: quiz.selectionMode,
      passScorePercent: Number(quiz.passScorePercent),
      timeLimitMinutes: quiz.timeLimitMinutes,
      maxAttempts: quiz.maxAttempts,
      questionsToPull: quiz.questionsToPull,
      shuffleQuestions: quiz.shuffleQuestions,
      shuffleOptions: quiz.shuffleOptions,
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
      course: {
        id: quiz.course.id.toString(),
        title: quiz.course.title,
        slug: quiz.course.slug,
      },
      lesson: quiz.lesson
        ? {
            id: quiz.lesson.id.toString(),
            title: quiz.lesson.title,
          }
        : null,
      questions: quiz.quizQuestions.map((qq: any) => ({
        id: qq.id.toString(),
        questionId: qq.questionId.toString(),
        orderIndex: qq.orderIndex,
        points: qq.points,
        isRequired: qq.isRequired,
        question: {
          id: qq.question.id.toString(),
          kind: qq.question.kind,
          text: qq.question.text,
          optionsCount: qq.question.options.length,
        },
      })),
    };
  }

  /**
   * List quizzes with filters
   */
  static async listQuizzes(
    filters: {
      courseId?: string;
      lessonId?: string;
      selectionMode?: 'fixed' | 'random_pool';
      page?: number;
      limit?: number;
    },
    userId: string,
  ) {
    const db = prisma as any;

    const { courseId, lessonId, selectionMode, page = 1, limit = 20 } = filters;

    const where: any = {};

    if (courseId) {
      where.courseId = BigInt(courseId);
    }

    if (lessonId) {
      where.lessonId = BigInt(lessonId);
    }

    if (selectionMode) {
      where.selectionMode = selectionMode;
    }

    // Check permission: admin, trainer, or filter by enrolled courses
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

    if (!isAdmin && !isTrainer) {
      // Student: only show quizzes from enrolled courses
      const enrollments = await db.enrollment.findMany({
        where: { userId: BigInt(userId) },
        select: { courseId: true },
      });

      const enrolledCourseIds = enrollments.map((e: any) => e.courseId);

      if (enrolledCourseIds.length === 0) {
        return {
          quizzes: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        };
      }

      where.courseId = { in: enrolledCourseIds };
    } else if (isTrainer && !isAdmin) {
      // Trainer: only show quizzes from their courses
      where.course = {
        trainerUserId: BigInt(userId),
      };
    }

    const skip = (page - 1) * limit;

    const [quizzes, total] = await Promise.all([
      db.quiz.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          lesson: {
            select: {
              id: true,
              title: true,
            },
          },
          _count: {
            select: {
              quizQuestions: true,
            },
          },
        },
      }),
      db.quiz.count({ where }),
    ]);

    return {
      quizzes: quizzes.map((q: any) => ({
        id: q.id.toString(),
        courseId: q.courseId.toString(),
        lessonId: q.lessonId?.toString() || null,
        title: q.title,
        description: q.description,
        selectionMode: q.selectionMode,
        passScorePercent: Number(q.passScorePercent),
        timeLimitMinutes: q.timeLimitMinutes,
        maxAttempts: q.maxAttempts,
        questionsToPull: q.questionsToPull,
        questionsCount: q._count.quizQuestions,
        createdAt: q.createdAt.toISOString(),
        course: {
          id: q.course.id.toString(),
          title: q.course.title,
          slug: q.course.slug,
        },
        lesson: q.lesson
          ? {
              id: q.lesson.id.toString(),
              title: q.lesson.title,
            }
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Add question to quiz
   */
  static async addQuestionToQuiz(
    quizId: string,
    data: {
      questionId: string;
      orderIndex?: number;
      points?: number;
      isRequired?: boolean;
    },
    userId: string,
  ) {
    const db = prisma as any;

    const quiz = await db.quiz.findUnique({
      where: { id: BigInt(quizId) },
      include: {
        course: true,
        quizQuestions: true,
      },
    });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    // Check permission
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
    const isCourseTrainer = quiz.course.trainerUserId.toString() === userId;

    if (!isAdmin && !(isTrainer && isCourseTrainer)) {
      throw new AppError('You do not have permission to modify this quiz', 403);
    }

    // Check if question exists
    const question = await db.question.findUnique({
      where: { id: BigInt(data.questionId) },
    });

    if (!question) {
      throw new AppError('Question not found', 404);
    }

    // Check if question already in quiz
    const existing = await db.quizQuestion.findUnique({
      where: {
        quizId_questionId: {
          quizId: BigInt(quizId),
          questionId: BigInt(data.questionId),
        },
      },
    });

    if (existing) {
      throw new AppError('Question already added to this quiz', 400);
    }

    // Determine order index
    let orderIndex = data.orderIndex;
    if (!orderIndex) {
      const maxOrder = quiz.quizQuestions.reduce(
        (max: number, qq: any) => Math.max(max, qq.orderIndex || 0),
        0,
      );
      orderIndex = maxOrder + 1;
    } else {
      // Check if orderIndex already exists
      const existingOrder = quiz.quizQuestions.find((qq: any) => qq.orderIndex === orderIndex);
      if (existingOrder) {
        throw new AppError(`Order index ${orderIndex} is already used in this quiz`, 400);
      }
    }

    // Add question
    const quizQuestion = await db.quizQuestion.create({
      data: {
        quizId: BigInt(quizId),
        questionId: BigInt(data.questionId),
        orderIndex,
        points: data.points || 1,
        isRequired: data.isRequired ?? true,
      },
      include: {
        question: {
          include: {
            options: true,
          },
        },
      },
    });

    return {
      id: quizQuestion.id.toString(),
      quizId: quizQuestion.quizId.toString(),
      questionId: quizQuestion.questionId.toString(),
      orderIndex: quizQuestion.orderIndex,
      points: quizQuestion.points,
      isRequired: quizQuestion.isRequired,
      question: {
        id: quizQuestion.question.id.toString(),
        kind: quizQuestion.question.kind,
        text: quizQuestion.question.text,
        optionsCount: quizQuestion.question.options.length,
      },
    };
  }

  /**
   * Remove question from quiz
   */
  static async removeQuestionFromQuiz(quizId: string, questionId: string, userId: string) {
    const db = prisma as any;

    const quiz = await db.quiz.findUnique({
      where: { id: BigInt(quizId) },
      include: {
        course: true,
      },
    });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    // Check permission
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
    const isCourseTrainer = quiz.course.trainerUserId.toString() === userId;

    if (!isAdmin && !(isTrainer && isCourseTrainer)) {
      throw new AppError('You do not have permission to modify this quiz', 403);
    }

    // Check if question in quiz
    const quizQuestion = await db.quizQuestion.findUnique({
      where: {
        quizId_questionId: {
          quizId: BigInt(quizId),
          questionId: BigInt(questionId),
        },
      },
    });

    if (!quizQuestion) {
      throw new AppError('Question not found in this quiz', 404);
    }

    // Remove question
    await db.quizQuestion.delete({
      where: {
        quizId_questionId: {
          quizId: BigInt(quizId),
          questionId: BigInt(questionId),
        },
      },
    });

    return {
      quizId,
      questionId,
      removed: true,
    };
  }

  /**
   * Update quiz question settings
   */
  static async updateQuizQuestion(
    quizId: string,
    questionId: string,
    data: {
      orderIndex?: number;
      points?: number;
      isRequired?: boolean;
    },
    userId: string,
  ) {
    const db = prisma as any;

    const quiz = await db.quiz.findUnique({
      where: { id: BigInt(quizId) },
      include: {
        course: true,
      },
    });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    // Check permission
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
    const isCourseTrainer = quiz.course.trainerUserId.toString() === userId;

    if (!isAdmin && !(isTrainer && isCourseTrainer)) {
      throw new AppError('You do not have permission to modify this quiz', 403);
    }

    // Check if question in quiz
    const quizQuestion = await db.quizQuestion.findUnique({
      where: {
        quizId_questionId: {
          quizId: BigInt(quizId),
          questionId: BigInt(questionId),
        },
      },
    });

    if (!quizQuestion) {
      throw new AppError('Question not found in this quiz', 404);
    }

    // Update question
    const updated = await db.quizQuestion.update({
      where: {
        quizId_questionId: {
          quizId: BigInt(quizId),
          questionId: BigInt(questionId),
        },
      },
      data: {
        orderIndex: data.orderIndex,
        points: data.points,
        isRequired: data.isRequired,
      },
      include: {
        question: true,
      },
    });

    return {
      id: updated.id.toString(),
      quizId: updated.quizId.toString(),
      questionId: updated.questionId.toString(),
      orderIndex: updated.orderIndex,
      points: updated.points,
      isRequired: updated.isRequired,
      question: {
        id: updated.question.id.toString(),
        kind: updated.question.kind,
        text: updated.question.text,
      },
    };
  }

  /**
   * Reorder quiz questions
   */
  static async reorderQuizQuestions(
    quizId: string,
    questionOrders: Array<{ questionId: string; orderIndex: number }>,
    userId: string,
  ) {
    const db = prisma as any;

    const quiz = await db.quiz.findUnique({
      where: { id: BigInt(quizId) },
      include: {
        course: true,
      },
    });

    if (!quiz) {
      throw new AppError('Quiz not found', 404);
    }

    // Check permission
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
    const isCourseTrainer = quiz.course.trainerUserId.toString() === userId;

    if (!isAdmin && !(isTrainer && isCourseTrainer)) {
      throw new AppError('You do not have permission to modify this quiz', 403);
    }

    // Update order for each question
    await Promise.all(
      questionOrders.map((item) =>
        db.quizQuestion.update({
          where: {
            quizId_questionId: {
              quizId: BigInt(quizId),
              questionId: BigInt(item.questionId),
            },
          },
          data: {
            orderIndex: item.orderIndex,
          },
        }),
      ),
    );

    return {
      quizId,
      reordered: true,
      count: questionOrders.length,
    };
  }
}
