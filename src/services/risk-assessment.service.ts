import { prisma } from '@/config/database';
import { genAI } from '@/config/gemini.config';
import { ensureModuleEnabled, getEffectiveConfig } from '@/services/ai-config.service';
import { logger } from '@/config/logger';
import { AppError } from '@/utils';

// ========================
// Risk Scoring Constants
// ========================
const WEIGHTS = {
  engagement: 0.4,
  performance: 0.35,
  deadline: 0.25,
} as const;

/** Risk thresholds: ≥70 high, ≥40 medium, <40 low */
const RISK_THRESHOLDS = { high: 70, medium: 40 } as const;

/** Capped values to avoid extreme outliers */
const MAX_INACTIVE_DAYS = 30;
const RISK_EXPIRY_DAYS = 7;

/** Gemini system prompt for intervention generation */
const RISK_INTERVENTION_PROMPT = `Bạn là AI chuyên gia phân tích rủi ro đào tạo nội bộ tại hệ thống StaffUp LMS.

NHIỆM VỤ: Dựa trên dữ liệu hành vi học viên được cung cấp, phân tích và đề xuất kế hoạch can thiệp cụ thể để giảm rủi ro bỏ học.

OUTPUT FORMAT — trả về JSON hợp lệ, KHÔNG kèm markdown:
{
  "summary": "Tóm tắt 1-2 câu về tình trạng và nguyên nhân chính",
  "actions": [
    {
      "type": "email|meeting|mentoring|content_adjust|deadline_extend|reminder",
      "priority": "urgent|high|medium",
      "description": "Mô tả hành động can thiệp cụ thể, chi tiết"
    }
  ]
}

QUY TẮC:
1. Đề xuất 2-4 hành động can thiệp, sắp xếp theo mức độ ưu tiên giảm dần.
2. Ưu tiên hành động dễ thực hiện và tác động cao trước.
3. Ngôn ngữ chuyên nghiệp, empathetic, hướng đến người quản lý.
4. Với risk score rất cao (≥80): PHẢI có ít nhất 1 hành động "urgent".
5. Phân tích từng dimension (engagement, performance, deadline) để đề xuất phù hợp.
6. CHỈ trả về JSON thuần, không có \`\`\`json hay bất kỳ markdown nào.`;

// ========================
// Signal Interfaces
// ========================
interface EngagementSignals {
  daysInactive: number;
  lessonCompletionRate: number;
  watchTimeRatio: number;
}

interface PerformanceSignals {
  averageQuizScore: number;
  failRate: number;
  scoreVsClassAvg: number;
  quizScoreTrend: number;
}

interface DeadlineSignals {
  timeElapsedRatio: number;
  progressGap: number;
  daysRemaining: number | null;
  hasDeadline: boolean;
}

interface RiskSignals {
  engagement: EngagementSignals;
  performance: PerformanceSignals;
  deadline: DeadlineSignals;
  componentScores: {
    engagement: number;
    performance: number;
    deadline: number;
  };
}

interface RiskCalculationResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  signals: RiskSignals;
  interventions: string | null;
}

interface BatchResult {
  processed: number;
  highRisk: number;
  mediumRisk: number;
  lowRisk: number;
  errors: number;
  details: Array<{
    enrollmentId: string;
    riskScore: number;
    riskLevel: string;
    error?: string;
  }>;
}

export class RiskAssessmentService {
  /**
   * List risk assessments with filters (for admin dashboard)
   */
  static async listRiskAssessments(
    filters: {
      riskLevel?: 'low' | 'medium' | 'high';
      enrollmentId?: string;
      userId?: string;
      courseId?: string;
      latestOnly?: boolean;
      page?: number;
      limit?: number;
    },
    requestUserId: string,
  ) {
    const db = prisma as any;

    // Check if user is admin or trainer
    const currentUser = await db.user.findUnique({
      where: { id: BigInt(requestUserId) },
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
      throw new AppError('You do not have permission to list risk assessments', 403);
    }

    const {
      riskLevel,
      enrollmentId,
      userId,
      courseId,
      latestOnly = false,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {};

    if (riskLevel) {
      where.riskLevel = riskLevel;
    }

    if (enrollmentId) {
      where.enrollmentId = BigInt(enrollmentId);
    }

    if (userId || courseId) {
      where.enrollment = {};
      if (userId) {
        where.enrollment.userId = BigInt(userId);
      }
      if (courseId) {
        where.enrollment.courseId = BigInt(courseId);
      }
    }

    // If trainer (not admin), only show assessments for their courses
    if (isTrainer && !isAdmin) {
      where.enrollment = where.enrollment || {};
      where.enrollment.course = {
        trainerUserId: BigInt(requestUserId),
      };
    }

    const skip = (page - 1) * limit;

    let assessments: any[];
    let total: number;

    if (latestOnly) {
      // Get latest assessment per enrollment
      // This is more complex - need to group by enrollmentId and get max calculatedAt
      const allAssessments = await db.learnerRiskAssessment.findMany({
        where,
        include: {
          enrollment: {
            include: {
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
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { calculatedAt: 'desc' },
      });

      // Group by enrollmentId and keep only latest
      const latestMap = new Map();
      for (const assessment of allAssessments) {
        const enrollmentIdStr = assessment.enrollmentId.toString();
        if (!latestMap.has(enrollmentIdStr)) {
          latestMap.set(enrollmentIdStr, assessment);
        }
      }

      const latestAssessments = Array.from(latestMap.values());
      total = latestAssessments.length;
      assessments = latestAssessments.slice(skip, skip + limit);
    } else {
      // Get all assessments with pagination
      [assessments, total] = await Promise.all([
        db.learnerRiskAssessment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { calculatedAt: 'desc' },
          include: {
            enrollment: {
              include: {
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
                    slug: true,
                  },
                },
              },
            },
          },
        }),
        db.learnerRiskAssessment.count({ where }),
      ]);
    }

    return {
      assessments: assessments.map((a: any) => ({
        id: a.id.toString(),
        enrollmentId: a.enrollmentId.toString(),
        riskScore: Number(a.riskScore),
        riskLevel: a.riskLevel,
        modelVersion: a.modelVersion,
        calculatedAt: a.calculatedAt.toISOString(),
        expiresAt: a.expiresAt?.toISOString() || null,
        enrollment: {
          id: a.enrollment.id.toString(),
          user: {
            id: a.enrollment.user.id.toString(),
            fullName: a.enrollment.user.fullName,
            email: a.enrollment.user.email,
          },
          course: {
            id: a.enrollment.course.id.toString(),
            title: a.enrollment.course.title,
            slug: a.enrollment.course.slug,
          },
        },
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
   * Ingest learner risk assessment from external AI/ML system
   */
  static async ingestRiskAssessment(data: {
    enrollmentId: string;
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high';
    modelVersion?: string;
    reasons?: any;
    recommendations?: string;
    interventions?: string;
    calculatedAt?: string;
    expiresAt?: string;
  }) {
    const db = prisma as any;

    // Verify enrollment exists
    const enrollment = await db.enrollment.findUnique({
      where: { id: BigInt(data.enrollmentId) },
      include: {
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
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    // Validate risk score range (0-100)
    if (data.riskScore < 0 || data.riskScore > 100) {
      throw new AppError('Risk score must be between 0 and 100', 400);
    }

    // Create risk assessment
    const assessment = await db.learnerRiskAssessment.create({
      data: {
        enrollmentId: BigInt(data.enrollmentId),
        riskScore: data.riskScore,
        riskLevel: data.riskLevel,
        modelVersion: data.modelVersion || null,
        reasons: data.reasons || null,
        recommendations: data.recommendations || null,
        interventions: data.interventions || null,
        calculatedAt: data.calculatedAt ? new Date(data.calculatedAt) : new Date(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    return {
      id: assessment.id.toString(),
      enrollmentId: assessment.enrollmentId.toString(),
      riskScore: Number(assessment.riskScore),
      riskLevel: assessment.riskLevel,
      modelVersion: assessment.modelVersion,
      reasons: assessment.reasons,
      recommendations: assessment.recommendations,
      interventions: assessment.interventions,
      calculatedAt: assessment.calculatedAt.toISOString(),
      expiresAt: assessment.expiresAt?.toISOString() || null,
      enrollment: {
        id: enrollment.id.toString(),
        user: {
          id: enrollment.user.id.toString(),
          fullName: enrollment.user.fullName,
          email: enrollment.user.email,
        },
        course: {
          id: enrollment.course.id.toString(),
          title: enrollment.course.title,
        },
      },
    };
  }

  /**
   * Get latest risk assessment for enrollment
   */
  static async getLatestAssessment(enrollmentId: string, userId: string) {
    const db = prisma as any;

    // Verify enrollment exists and check permission
    const enrollment = await db.enrollment.findUnique({
      where: { id: BigInt(enrollmentId) },
      include: {
        course: {
          select: {
            trainerUserId: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    // Check permission: owner, trainer, or admin
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
    const isCourseTrainer = enrollment.course.trainerUserId.toString() === userId;
    const isOwner = enrollment.userId.toString() === userId;

    if (!isAdmin && !(isTrainer && isCourseTrainer) && !isOwner) {
      throw new AppError('You do not have permission to view this risk assessment', 403);
    }

    // Get latest assessment
    const assessment = await db.learnerRiskAssessment.findFirst({
      where: { enrollmentId: BigInt(enrollmentId) },
      orderBy: { calculatedAt: 'desc' },
    });

    if (!assessment) {
      throw new AppError('No risk assessment found for this enrollment', 404);
    }

    return {
      id: assessment.id.toString(),
      enrollmentId: assessment.enrollmentId.toString(),
      riskScore: Number(assessment.riskScore),
      riskLevel: assessment.riskLevel,
      modelVersion: assessment.modelVersion,
      reasons: assessment.reasons,
      recommendations: assessment.recommendations,
      interventions: assessment.interventions,
      calculatedAt: assessment.calculatedAt.toISOString(),
      expiresAt: assessment.expiresAt?.toISOString() || null,
    };
  }

  /**
   * Get risk assessment history for enrollment
   */
  static async getAssessmentHistory(enrollmentId: string, userId: string, page = 1, limit = 10) {
    const db = prisma as any;

    // Verify enrollment and check permission
    const enrollment = await db.enrollment.findUnique({
      where: { id: BigInt(enrollmentId) },
      include: {
        course: {
          select: {
            trainerUserId: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
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
    const isCourseTrainer = enrollment.course.trainerUserId.toString() === userId;
    const isOwner = enrollment.userId.toString() === userId;

    if (!isAdmin && !(isTrainer && isCourseTrainer) && !isOwner) {
      throw new AppError('You do not have permission to view this risk assessment history', 403);
    }

    const skip = (page - 1) * limit;

    const [assessments, total] = await Promise.all([
      db.learnerRiskAssessment.findMany({
        where: { enrollmentId: BigInt(enrollmentId) },
        skip,
        take: limit,
        orderBy: { calculatedAt: 'desc' },
      }),
      db.learnerRiskAssessment.count({
        where: { enrollmentId: BigInt(enrollmentId) },
      }),
    ]);

    return {
      assessments: assessments.map((a: any) => ({
        id: a.id.toString(),
        riskScore: Number(a.riskScore),
        riskLevel: a.riskLevel,
        modelVersion: a.modelVersion,
        calculatedAt: a.calculatedAt.toISOString(),
        expiresAt: a.expiresAt?.toISOString() || null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ================================================================
  // AI RISK PREDICTION ENGINE
  // ================================================================

  /**
   * Calculate risk score for a single enrollment using weighted multi-factor analysis.
   *
   * Scoring formula:
   *   riskScore = engagementScore × 0.40 + performanceScore × 0.35 + deadlineScore × 0.25
   *
   * Each component score is 0-100 where 100 = highest risk.
   *
   * For enrollments with risk ≥ medium (40), Gemini AI generates intervention suggestions.
   */
  static async calculateRiskScore(enrollmentId: string): Promise<RiskCalculationResult> {
    await ensureModuleEnabled('dropoutPrediction', 'Dự đoán nguy cơ bỏ học');
    const db = prisma as any;
    const now = new Date();

    // ── Step 1: Fetch enrollment with related data ──────────────────
    const enrollment = await db.enrollment.findUnique({
      where: { id: BigInt(enrollmentId) },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        course: {
          select: {
            id: true,
            title: true,
            estimatedDurationMinutes: true,
            modules: {
              select: {
                lessons: {
                  select: { id: true, durationSeconds: true },
                },
              },
            },
          },
        },
        lessonProgress: {
          select: {
            lessonId: true,
            status: true,
            watchTimeSeconds: true,
          },
        },
        quizAttempts: {
          select: {
            id: true,
            quizId: true,
            totalScore: true,
            isPassed: true,
            attemptNo: true,
            submittedAt: true,
          },
          orderBy: { submittedAt: 'asc' },
        },
      },
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    // ── Step 2: Compute engagement signals ──────────────────────────
    const engagementSignals = this.computeEngagementSignals(enrollment, now);

    // ── Step 3: Compute performance signals ─────────────────────────
    const performanceSignals = await this.computePerformanceSignals(enrollment, db);

    // ── Step 4: Compute deadline signals ────────────────────────────
    const deadlineSignals = this.computeDeadlineSignals(enrollment, now);

    // ── Step 5: Calculate component scores (0-100, higher = more risk) ─
    const engagementScore = this.scoreEngagement(engagementSignals);
    const performanceScore = this.scorePerformance(performanceSignals);
    const deadlineScore = this.scoreDeadline(deadlineSignals);

    // ── Step 6: Weighted final score ────────────────────────────────
    const rawScore =
      engagementScore * WEIGHTS.engagement +
      performanceScore * WEIGHTS.performance +
      deadlineScore * WEIGHTS.deadline;

    const riskScore = Math.round(Math.min(100, Math.max(0, rawScore)) * 100) / 100;
    const riskLevel = this.getRiskLevel(riskScore);

    const signals: RiskSignals = {
      engagement: engagementSignals,
      performance: performanceSignals,
      deadline: deadlineSignals,
      componentScores: {
        engagement: Math.round(engagementScore * 100) / 100,
        performance: Math.round(performanceScore * 100) / 100,
        deadline: Math.round(deadlineScore * 100) / 100,
      },
    };

    // ── Step 7: Generate AI interventions for medium+ risk ──────────
    let interventions: string | null = null;
    if (riskScore >= RISK_THRESHOLDS.medium) {
      interventions = await this.generateInterventions(riskScore, riskLevel, signals, {
        learnerName: enrollment.user.fullName,
        courseTitle: enrollment.course.title,
        enrollmentStatus: enrollment.status,
        progressPercent: Number(enrollment.progressPercentCache),
      });
    }

    // ── Step 8: Persist to database ─────────────────────────────────
    const expiresAt = new Date(now.getTime() + RISK_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await db.learnerRiskAssessment.create({
      data: {
        enrollmentId: BigInt(enrollmentId),
        riskScore,
        riskLevel,
        modelVersion: 'staffup-risk-v1.0',
        reasons: signals,
        recommendations: interventions ? JSON.parse(interventions).summary || null : null,
        interventions,
        calculatedAt: now,
        expiresAt,
      },
    });

    return { riskScore, riskLevel, signals, interventions };
  }

  /**
   * Batch-calculate risk scores for all active enrollments.
   * Processes sequentially with delay to respect Gemini rate limits.
   */
  static async calculateBatchRiskScores(): Promise<BatchResult> {
    await ensureModuleEnabled('dropoutPrediction', 'Dự đoán nguy cơ bỏ học');
    const db = prisma as any;

    const activeEnrollments = await db.enrollment.findMany({
      where: {
        status: { in: ['assigned', 'in_progress'] },
      },
      select: { id: true },
      orderBy: { id: 'asc' },
    });

    logger.info(
      `[RiskBatch] Starting batch risk calculation for ${activeEnrollments.length} enrollments`,
    );

    const result: BatchResult = {
      processed: 0,
      highRisk: 0,
      mediumRisk: 0,
      lowRisk: 0,
      errors: 0,
      details: [],
    };

    for (const enrollment of activeEnrollments) {
      const enrollmentId = enrollment.id.toString();
      try {
        const { riskScore, riskLevel } = await this.calculateRiskScore(enrollmentId);

        result.processed++;
        if (riskLevel === 'high') result.highRisk++;
        else if (riskLevel === 'medium') result.mediumRisk++;
        else result.lowRisk++;

        result.details.push({ enrollmentId, riskScore, riskLevel });

        // Rate limit: delay between Gemini calls (only medium+ triggers Gemini)
        if (riskScore >= RISK_THRESHOLDS.medium) {
          await this.delay(300);
        }
      } catch (error: any) {
        result.errors++;
        result.details.push({
          enrollmentId,
          riskScore: -1,
          riskLevel: 'error',
          error: error.message,
        });
        logger.error(`[RiskBatch] Error for enrollment ${enrollmentId}: ${error.message}`);
      }
    }

    logger.info(
      `[RiskBatch] Completed: ${result.processed} processed, ` +
        `${result.highRisk} high, ${result.mediumRisk} medium, ${result.lowRisk} low, ` +
        `${result.errors} errors`,
    );

    return result;
  }

  // ================================================================
  // PRIVATE — Signal Computation
  // ================================================================

  /**
   * Engagement signals: how actively is the learner interacting with the course?
   *
   * - daysInactive: calendar days since last activity (capped at 30)
   * - lessonCompletionRate: completed lessons / total lessons (0-1)
   * - watchTimeRatio: actual watch time / expected video duration (0-1+)
   */
  private static computeEngagementSignals(enrollment: any, now: Date): EngagementSignals {
    // Days inactive
    const lastActivity = enrollment.lastActivityAt || enrollment.enrolledAt;
    const daysInactive = Math.floor(
      (now.getTime() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24),
    );

    // Lesson completion rate
    const allLessons = enrollment.course.modules.flatMap((m: any) => m.lessons);
    const totalLessons = allLessons.length;
    const completedLessons = enrollment.lessonProgress.filter(
      (lp: any) => lp.status === 'completed',
    ).length;
    const lessonCompletionRate = totalLessons > 0 ? completedLessons / totalLessons : 0;

    // Watch time ratio: actual watch time vs total course video duration
    const totalExpectedSeconds = allLessons.reduce(
      (sum: number, l: any) => sum + (l.durationSeconds || 0),
      0,
    );
    const totalWatchedSeconds = enrollment.lessonProgress.reduce(
      (sum: number, lp: any) => sum + (lp.watchTimeSeconds || 0),
      0,
    );
    const watchTimeRatio =
      totalExpectedSeconds > 0 ? totalWatchedSeconds / totalExpectedSeconds : 0;

    return {
      daysInactive: Math.min(daysInactive, MAX_INACTIVE_DAYS),
      lessonCompletionRate: Math.round(lessonCompletionRate * 1000) / 1000,
      watchTimeRatio: Math.round(watchTimeRatio * 1000) / 1000,
    };
  }

  /**
   * Performance signals: how well is the learner performing on assessments?
   *
   * - averageQuizScore: mean of all quiz attempt scores (0-100)
   * - failRate: failed attempts / total graded attempts (0-1)
   * - scoreVsClassAvg: difference from class average (negative = below)
   * - quizScoreTrend: comparing recent half vs first half scores
   */
  private static async computePerformanceSignals(
    enrollment: any,
    db: any,
  ): Promise<PerformanceSignals> {
    const attempts = enrollment.quizAttempts.filter((a: any) => a.totalScore !== null);

    if (attempts.length === 0) {
      // No quiz data: neutral performance (doesn't increase or decrease risk)
      return {
        averageQuizScore: -1, // sentinel: no data
        failRate: 0,
        scoreVsClassAvg: 0,
        quizScoreTrend: 0,
      };
    }

    // Average quiz score
    const scores = attempts.map((a: any) => Number(a.totalScore));
    const averageQuizScore = scores.reduce((s: number, v: number) => s + v, 0) / scores.length;

    // Fail rate
    const gradedAttempts = attempts.filter((a: any) => a.isPassed !== null);
    const failedAttempts = gradedAttempts.filter((a: any) => a.isPassed === false).length;
    const failRate = gradedAttempts.length > 0 ? failedAttempts / gradedAttempts.length : 0;

    // Score vs class average — compare to all learners in same course's quizzes
    const quizIds = [...new Set(attempts.map((a: any) => a.quizId))] as bigint[];
    let scoreVsClassAvg = 0;
    if (quizIds.length > 0) {
      const classAvg = await db.quizAttempt.aggregate({
        where: {
          quizId: { in: quizIds },
          totalScore: { not: null },
        },
        _avg: { totalScore: true },
      });
      const classAvgScore = classAvg._avg.totalScore
        ? Number(classAvg._avg.totalScore)
        : averageQuizScore;
      // Positive = above average, negative = below average
      scoreVsClassAvg = averageQuizScore - classAvgScore;
    }

    // Quiz score trend: compare second half vs first half of attempts
    let quizScoreTrend = 0;
    if (scores.length >= 2) {
      const mid = Math.floor(scores.length / 2);
      const firstHalf = scores.slice(0, mid);
      const secondHalf = scores.slice(mid);
      const firstAvg = firstHalf.reduce((s: number, v: number) => s + v, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s: number, v: number) => s + v, 0) / secondHalf.length;
      // Positive = improving, negative = declining
      quizScoreTrend = secondAvg - firstAvg;
    }

    return {
      averageQuizScore: Math.round(averageQuizScore * 100) / 100,
      failRate: Math.round(failRate * 1000) / 1000,
      scoreVsClassAvg: Math.round(scoreVsClassAvg * 100) / 100,
      quizScoreTrend: Math.round(quizScoreTrend * 100) / 100,
    };
  }

  /**
   * Deadline signals: is the learner on track to finish before the deadline?
   *
   * - timeElapsedRatio: how much of the available time has passed (0-1+)
   * - progressGap: timeElapsedRatio - progressPercent/100 (positive = behind)
   * - daysRemaining: calendar days until deadline (negative = overdue)
   */
  private static computeDeadlineSignals(enrollment: any, now: Date): DeadlineSignals {
    const dueAt = enrollment.dueAt ? new Date(enrollment.dueAt) : null;

    if (!dueAt) {
      return {
        timeElapsedRatio: 0,
        progressGap: 0,
        daysRemaining: null,
        hasDeadline: false,
      };
    }

    const enrolledAt = new Date(enrollment.enrolledAt);
    const totalDuration = dueAt.getTime() - enrolledAt.getTime();
    const elapsed = now.getTime() - enrolledAt.getTime();

    const timeElapsedRatio = totalDuration > 0 ? elapsed / totalDuration : 1;
    const progressPercent = Number(enrollment.progressPercentCache) / 100;
    const progressGap = timeElapsedRatio - progressPercent;

    const daysRemaining = Math.ceil((dueAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      timeElapsedRatio: Math.round(timeElapsedRatio * 1000) / 1000,
      progressGap: Math.round(progressGap * 1000) / 1000,
      daysRemaining,
      hasDeadline: true,
    };
  }

  // ================================================================
  // PRIVATE — Score Calculation (0-100, higher = riskier)
  // ================================================================

  /**
   * Engagement risk score.
   *
   * Components (each 0-100):
   *   inactiveRisk = (daysInactive / 30) × 100           [40% of engagement]
   *   completionRisk = (1 - lessonCompletionRate) × 100   [35% of engagement]
   *   watchRisk = (1 - min(watchTimeRatio, 1)) × 100      [25% of engagement]
   */
  private static scoreEngagement(signals: EngagementSignals): number {
    const inactiveRisk = (signals.daysInactive / MAX_INACTIVE_DAYS) * 100;
    const completionRisk = (1 - signals.lessonCompletionRate) * 100;
    const watchRisk = (1 - Math.min(signals.watchTimeRatio, 1)) * 100;

    return inactiveRisk * 0.4 + completionRisk * 0.35 + watchRisk * 0.25;
  }

  /**
   * Performance risk score.
   *
   * If no quiz data exists, return 50 (neutral — doesn't inflate or deflate risk).
   *
   * Components (each 0-100):
   *   scoreRisk = (100 - averageQuizScore)                [35% of performance]
   *   failRisk = failRate × 100                            [30% of performance]
   *   classRisk = clamp(50 - scoreVsClassAvg, 0, 100)     [20% of performance]
   *   trendRisk = clamp(50 - quizScoreTrend, 0, 100)      [15% of performance]
   */
  private static scorePerformance(signals: PerformanceSignals): number {
    // No quiz data → neutral score
    if (signals.averageQuizScore === -1) {
      return 50;
    }

    const scoreRisk = 100 - signals.averageQuizScore;
    const failRisk = signals.failRate * 100;
    const classRisk = Math.max(0, Math.min(100, 50 - signals.scoreVsClassAvg));
    const trendRisk = Math.max(0, Math.min(100, 50 - signals.quizScoreTrend));

    return scoreRisk * 0.35 + failRisk * 0.3 + classRisk * 0.2 + trendRisk * 0.15;
  }

  /**
   * Deadline risk score.
   *
   * No deadline → 30 (mild default risk — some urgency is healthy).
   *
   * Components:
   *   progressGapRisk = clamp(progressGap × 100, 0, 100)  [50% of deadline]
   *   timeRisk = based on daysRemaining                     [50% of deadline]
   */
  private static scoreDeadline(signals: DeadlineSignals): number {
    if (!signals.hasDeadline) {
      return 30; // mild default — no deadline doesn't mean no risk
    }

    // Progress gap risk: how far behind schedule
    const progressGapRisk = Math.max(0, Math.min(100, signals.progressGap * 100));

    // Time pressure risk
    let timeRisk: number;
    if (signals.daysRemaining === null) {
      timeRisk = 50;
    } else if (signals.daysRemaining < 0) {
      // Overdue
      timeRisk = 100;
    } else if (signals.daysRemaining <= 3) {
      timeRisk = 90;
    } else if (signals.daysRemaining <= 7) {
      timeRisk = 70;
    } else if (signals.daysRemaining <= 14) {
      timeRisk = 50;
    } else if (signals.daysRemaining <= 30) {
      timeRisk = 30;
    } else {
      timeRisk = 10;
    }

    return progressGapRisk * 0.5 + timeRisk * 0.5;
  }

  // ================================================================
  // PRIVATE — Gemini AI Interventions
  // ================================================================

  /**
   * Generate intervention recommendations using Gemini AI.
   * Returns JSON string with summary and actionable items in Vietnamese.
   * Falls back gracefully on API errors.
   */
  private static async generateInterventions(
    riskScore: number,
    riskLevel: string,
    signals: RiskSignals,
    context: {
      learnerName: string;
      courseTitle: string;
      enrollmentStatus: string;
      progressPercent: number;
    },
  ): Promise<string | null> {
    try {
      const userPrompt = `Phân tích rủi ro bỏ học và đề xuất can thiệp:

=== THÔNG TIN HỌC VIÊN ===
- Họ tên: ${context.learnerName}
- Khóa học: ${context.courseTitle}
- Trạng thái: ${context.enrollmentStatus}
- Tiến độ: ${context.progressPercent}%

=== ĐIỂM RỦI RO ===
- Tổng điểm rủi ro: ${riskScore}/100 (${riskLevel})
- Engagement Score: ${signals.componentScores.engagement}/100
- Performance Score: ${signals.componentScores.performance}/100
- Deadline Score: ${signals.componentScores.deadline}/100

=== CHI TIẾT ENGAGEMENT ===
- Số ngày không hoạt động: ${signals.engagement.daysInactive}
- Tỷ lệ hoàn thành bài học: ${(signals.engagement.lessonCompletionRate * 100).toFixed(1)}%
- Tỷ lệ thời gian xem video: ${(signals.engagement.watchTimeRatio * 100).toFixed(1)}%

=== CHI TIẾT PERFORMANCE ===
- Điểm quiz trung bình: ${signals.performance.averageQuizScore === -1 ? 'Chưa có dữ liệu' : signals.performance.averageQuizScore}
- Tỷ lệ thi rớt: ${(signals.performance.failRate * 100).toFixed(1)}%
- So với trung bình lớp: ${signals.performance.scoreVsClassAvg > 0 ? '+' : ''}${signals.performance.scoreVsClassAvg}
- Xu hướng điểm: ${signals.performance.quizScoreTrend > 0 ? 'Cải thiện (+' + signals.performance.quizScoreTrend + ')' : signals.performance.quizScoreTrend < 0 ? 'Giảm sút (' + signals.performance.quizScoreTrend + ')' : 'Ổn định'}

=== CHI TIẾT DEADLINE ===
- Có deadline: ${signals.deadline.hasDeadline ? 'Có' : 'Không'}
- Số ngày còn lại: ${signals.deadline.daysRemaining !== null ? signals.deadline.daysRemaining + ' ngày' : 'N/A'}
- Gap tiến độ vs thời gian: ${(signals.deadline.progressGap * 100).toFixed(1)}%

Hãy phân tích và đề xuất kế hoạch can thiệp cụ thể.`;

      const cfg = await getEffectiveConfig();
      const response = await genAI.models.generateContent({
        model: cfg.chatModel,
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        config: {
          systemInstruction: RISK_INTERVENTION_PROMPT,
          temperature: 0.4,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() ?? null;
      if (!text) return null;

      // Strip markdown code fences (Gemini occasionally adds ```json ... ``` despite
      // the prompt + responseMimeType=application/json).
      const cleaned = text
        .replace(/```(?:json)?/gi, '')
        .replace(/```/g, '')
        .trim();

      // Try the cleaned text first, then fall back to a slice between { and } if needed.
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const objStart = cleaned.indexOf('{');
        const objEnd = cleaned.lastIndexOf('}');
        if (objStart !== -1 && objEnd > objStart) {
          try {
            parsed = JSON.parse(cleaned.slice(objStart, objEnd + 1));
          } catch {
            parsed = null;
          }
        }
      }

      if (parsed && typeof parsed === 'object') {
        // Re-stringify so callers always get a stable JSON string (no accidental
        // markdown fences, no nested escape characters).
        return JSON.stringify(parsed);
      }

      // Last-resort fallback: Gemini returned plain prose, wrap it as a
      // single-action plan. Use the truncated cleaned text in summary only.
      logger.warn(`[RiskAI] Non-JSON response from Gemini, wrapping: ${cleaned.substring(0, 100)}`);
      return JSON.stringify({
        summary: cleaned.substring(0, 200),
        actions: [
          {
            type: 'meeting',
            priority: riskScore >= RISK_THRESHOLDS.high ? 'urgent' : 'high',
            description: cleaned.substring(0, 500),
          },
        ],
      });
    } catch (error: any) {
      logger.error(`[RiskAI] Gemini intervention generation failed: ${error.message}`);
      return null;
    }
  }

  // ================================================================
  // PRIVATE — Utilities
  // ================================================================

  private static getRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= RISK_THRESHOLDS.high) return 'high';
    if (score >= RISK_THRESHOLDS.medium) return 'medium';
    return 'low';
  }

  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
