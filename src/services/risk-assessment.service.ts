import { prisma } from '@/config/database';
import { AppError } from '@/utils';

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
}
