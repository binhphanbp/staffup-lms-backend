import { prisma } from '@/config/database';
import { AppError } from '@/utils';
import type { EnrollmentDetailResponse } from '@/interfaces/enrollment.types';

export class EnrollmentService {
  static async getEnrollmentDetail(
    enrollmentId: string,
    userId: string,
  ): Promise<EnrollmentDetailResponse> {
    const enrollment = await (prisma as any).enrollment.findUnique({
      where: { id: BigInt(enrollmentId) },
      include: {
        course: {
          include: {
            trainerUser: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
            modules: {
              include: {
                lessons: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
            quizzes: {
              select: {
                id: true,
                passScorePercent: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        assignedByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        certificate: {
          select: {
            id: true,
            certificateCode: true,
            pdfUrl: true,
            issuedAt: true,
            revokedAt: true,
          },
        },
        lessonProgress: {
          include: {
            lesson: {
              include: {
                module: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
          orderBy: { lastAccessedAt: 'desc' },
        },
        quizAttempts: {
          include: {
            quiz: {
              select: {
                id: true,
                passScorePercent: true,
              },
            },
          },
          where: {
            status: 'graded',
          },
        },
        learnerRiskAssessments: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    // Check permission
    if (enrollment.userId.toString() !== userId) {
      throw new AppError('You do not have permission to view this enrollment', 403);
    }

    // Calculate total lessons
    const totalLessons = enrollment.course.modules.reduce(
      (sum: number, module: any) => sum + module.lessons.length,
      0,
    );

    // Get last accessed lesson
    const lastProgress = enrollment.lessonProgress[0];

    // Format time spent
    const timeSpentMinutes = Math.floor((enrollment.timeSpentSecondsCache || 0) / 60);
    const hours = Math.floor(timeSpentMinutes / 60);
    const minutes = timeSpentMinutes % 60;
    const timeSpentFormatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    // Quiz progress
    const totalQuizzes = enrollment.course.quizzes.length;
    const completedQuizzes = new Set(enrollment.quizAttempts.map((a: any) => a.quizId.toString()))
      .size;
    const passedQuizzes = enrollment.quizAttempts.filter((a: any) => a.isPassed === true).length;
    const averageScore =
      enrollment.quizAttempts.length > 0
        ? enrollment.quizAttempts.reduce(
            (sum: number, a: any) => sum + parseFloat(a.totalScore || 0),
            0,
          ) / enrollment.quizAttempts.length
        : null;

    // Certificate requirements
    const minProgressPercent = 100;
    const minTimeSpentMinutes = 30;
    const currentProgressPercent = parseFloat(enrollment.progressPercentCache || 0);
    const currentTimeSpentMinutes = timeSpentMinutes;
    const allLessonsCompleted = enrollment.completedLessonsCountCache === totalLessons;
    const allQuizzesPassed = totalQuizzes > 0 ? passedQuizzes === totalQuizzes : true;

    const isEligible =
      currentProgressPercent >= minProgressPercent &&
      currentTimeSpentMinutes >= minTimeSpentMinutes &&
      allLessonsCompleted &&
      allQuizzesPassed;

    const isIssued = !!enrollment.certificate;
    const isRevoked = !!enrollment.certificate?.revokedAt;

    // Check if overdue
    const now = new Date();
    const isOverdue = enrollment.dueAt ? new Date(enrollment.dueAt) < now : false;

    // Risk assessment
    const latestRisk = enrollment.learnerRiskAssessments[0];

    return {
      id: enrollment.id.toString(),
      userId: enrollment.userId.toString(),
      courseId: enrollment.courseId.toString(),
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt.toISOString(),
      startedAt: enrollment.startedAt?.toISOString() || null,
      completedAt: enrollment.completedAt?.toISOString() || null,
      lastActivityAt: enrollment.lastActivityAt?.toISOString() || null,
      dueAt: enrollment.dueAt?.toISOString() || null,

      course: {
        id: enrollment.course.id.toString(),
        title: enrollment.course.title,
        slug: enrollment.course.slug,
        description: enrollment.course.description || '',
        thumbnailUrl: enrollment.course.thumbnailUrl,
        estimatedDurationMinutes: enrollment.course.estimatedDurationMinutes || 0,
        trainer: {
          id: enrollment.course.trainerUser.id.toString(),
          fullName: enrollment.course.trainerUser.fullName,
          email: enrollment.course.trainerUser.email,
          avatarUrl: enrollment.course.trainerUser.avatarUrl,
        },
      },

      progressSummary: {
        progressPercent: currentProgressPercent,
        completedLessonsCount: enrollment.completedLessonsCountCache || 0,
        totalLessonsCount: totalLessons,
        timeSpentSeconds: enrollment.timeSpentSecondsCache || 0,
        timeSpentFormatted,
        lastAccessedLesson: lastProgress
          ? {
              id: lastProgress.lesson.id.toString(),
              title: lastProgress.lesson.title,
              moduleTitle: lastProgress.lesson.module.title,
              lastAccessedAt: lastProgress.lastAccessedAt.toISOString(),
            }
          : null,
        quizProgress: {
          totalQuizzes,
          completedQuizzes,
          passedQuizzes,
          averageScore: averageScore ? parseFloat(averageScore.toFixed(2)) : null,
        },
      },

      certificate: {
        isEligible,
        isIssued,
        certificateId: enrollment.certificate?.id.toString() || null,
        certificateCode: enrollment.certificate?.certificateCode || null,
        issuedAt: enrollment.certificate?.issuedAt?.toISOString() || null,
        pdfUrl: enrollment.certificate?.pdfUrl || null,
        isRevoked,
        revokedAt: enrollment.certificate?.revokedAt?.toISOString() || null,
        requirements: {
          minProgressPercent,
          currentProgressPercent,
          minTimeSpentMinutes,
          currentTimeSpentMinutes,
          allLessonsCompleted,
          allQuizzesPassed,
        },
      },

      assignment: {
        assignedBy: enrollment.assignedByUser
          ? {
              id: enrollment.assignedByUser.id.toString(),
              fullName: enrollment.assignedByUser.fullName,
              email: enrollment.assignedByUser.email,
            }
          : null,
        assignmentNote: enrollment.assignmentNote,
        dueAt: enrollment.dueAt?.toISOString() || null,
        isOverdue,
      },

      riskAssessment: latestRisk
        ? {
            riskScore: parseFloat(latestRisk.riskScore),
            riskLevel: latestRisk.riskLevel,
            reasons: latestRisk.reasons,
            recommendations: latestRisk.recommendations,
            calculatedAt: latestRisk.calculatedAt.toISOString(),
          }
        : null,
    };
  }
}
