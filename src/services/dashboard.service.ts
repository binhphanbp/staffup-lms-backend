import { prisma } from '@/config/database';
import type {
  DashboardStats,
  ManagerDashboardStats,
  TrainerDashboardStats,
  EmployeeDashboardStats,
} from '@/interfaces/dashboard.types';

export class DashboardService {
  /**
   * Get admin dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    // Get user stats
    const [totalUsers, activeUsers, usersByRole] = await Promise.all([
      (prisma as any).user.count(),
      (prisma as any).user.count({ where: { isActive: true } }),
      (prisma as any).userRole.groupBy({
        by: ['roleId'],
        _count: true,
      }),
    ]);

    // Get role codes for grouping
    const roles = await (prisma as any).role.findMany({
      select: { id: true, code: true },
    });
    const roleMap = new Map(roles.map((r: any) => [r.id.toString(), r.code]));

    const userRoleCounts = {
      admin: 0,
      trainer: 0,
      employee: 0,
      student: 0,
    };

    usersByRole.forEach((ur: any) => {
      const roleCode = roleMap.get(ur.roleId.toString());
      if (roleCode === 'admin') userRoleCounts.admin += ur._count;
      else if (roleCode === 'trainer') userRoleCounts.trainer += ur._count;
      else if (roleCode === 'employee') userRoleCounts.employee += ur._count;
      else if (roleCode === 'student') userRoleCounts.student += ur._count;
    });

    // Get course stats
    const [totalCourses, coursesByStatus] = await Promise.all([
      (prisma as any).course.count(),
      (prisma as any).course.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    const courseStats = {
      total: totalCourses,
      published: 0,
      draft: 0,
      archived: 0,
    };

    coursesByStatus.forEach((cs: any) => {
      if (cs.status === 'published') courseStats.published = cs._count;
      else if (cs.status === 'draft') courseStats.draft = cs._count;
      else if (cs.status === 'archived') courseStats.archived = cs._count;
    });

    // Get enrollment stats
    const [totalEnrollments, enrollmentsByStatus] = await Promise.all([
      (prisma as any).enrollment.count(),
      (prisma as any).enrollment.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    const enrollmentStats = {
      total: totalEnrollments,
      assigned: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      expired: 0,
    };

    enrollmentsByStatus.forEach((es: any) => {
      if (es.status === 'assigned') enrollmentStats.assigned = es._count;
      else if (es.status === 'in_progress') enrollmentStats.inProgress = es._count;
      else if (es.status === 'completed') enrollmentStats.completed = es._count;
      else if (es.status === 'cancelled') enrollmentStats.cancelled = es._count;
      else if (es.status === 'expired') enrollmentStats.expired = es._count;
    });

    const completionRate =
      totalEnrollments > 0
        ? Math.round((enrollmentStats.completed / totalEnrollments) * 100 * 10) / 10
        : 0;

    // Get risk assessment stats
    const [totalRisks, risksByLevel] = await Promise.all([
      (prisma as any).learnerRiskAssessment.count(),
      (prisma as any).learnerRiskAssessment.groupBy({
        by: ['riskLevel'],
        _count: true,
      }),
    ]);

    const riskStats = {
      total: totalRisks,
      high: 0,
      medium: 0,
      low: 0,
    };

    risksByLevel.forEach((rs: any) => {
      if (rs.riskLevel === 'high') riskStats.high = rs._count;
      else if (rs.riskLevel === 'medium') riskStats.medium = rs._count;
      else if (rs.riskLevel === 'low') riskStats.low = rs._count;
    });

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        byRole: userRoleCounts,
      },
      courses: courseStats,
      enrollments: {
        ...enrollmentStats,
        completionRate,
      },
      riskSummary: riskStats,
    };
  }

  /**
   * Get manager dashboard statistics for a specific department
   */
  static async getManagerDashboardStats(departmentId: bigint): Promise<ManagerDashboardStats> {
    const now = new Date();

    // Get learners in the department
    const [totalLearners, activeLearners] = await Promise.all([
      (prisma as any).user.count({
        where: {
          departmentId,
          userRoles: {
            some: {
              role: { code: 'employee' },
            },
          },
        },
      }),
      (prisma as any).user.count({
        where: {
          departmentId,
          isActive: true,
          userRoles: {
            some: {
              role: { code: 'employee' },
            },
          },
        },
      }),
    ]);

    // Get overdue enrollments
    const overdueEnrollments = await (prisma as any).enrollment.findMany({
      where: {
        user: { departmentId },
        dueAt: { lt: now },
        status: { in: ['assigned', 'in_progress'] },
      },
      select: {
        userId: true,
        courseId: true,
        dueAt: true,
        user: {
          select: {
            fullName: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { dueAt: 'asc' },
    });

    const overdueData = overdueEnrollments.map((e: any) => ({
      userId: e.userId,
      userName: e.user.fullName,
      courseId: e.courseId,
      courseTitle: e.course.title,
      dueAt: e.dueAt,
      daysOverdue: Math.floor((now.getTime() - e.dueAt.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    // Get roadmap completion stats
    const roadmapAssignments = await (prisma as any).roadmapAssignment.groupBy({
      by: ['status'],
      where: {
        user: { departmentId },
      },
      _count: true,
    });

    const roadmapStats = {
      totalAssignments: 0,
      completed: 0,
      inProgress: 0,
      assigned: 0,
    };

    roadmapAssignments.forEach((ra: any) => {
      roadmapStats.totalAssignments += ra._count;
      if (ra.status === 'completed') roadmapStats.completed = ra._count;
      else if (ra.status === 'in_progress') roadmapStats.inProgress = ra._count;
      else if (ra.status === 'assigned') roadmapStats.assigned = ra._count;
    });

    const roadmapCompletionRate =
      roadmapStats.totalAssignments > 0
        ? Math.round((roadmapStats.completed / roadmapStats.totalAssignments) * 100 * 10) / 10
        : 0;

    // Get risk assessments
    const [riskCounts, highRiskLearners] = await Promise.all([
      (prisma as any).learnerRiskAssessment.groupBy({
        by: ['riskLevel'],
        where: {
          enrollment: {
            user: { departmentId },
          },
          expiresAt: { gte: now },
        },
        _count: true,
      }),
      (prisma as any).learnerRiskAssessment.findMany({
        where: {
          enrollment: {
            user: { departmentId },
          },
          riskLevel: { in: ['high', 'medium'] },
          expiresAt: { gte: now },
        },
        select: {
          riskLevel: true,
          riskScore: true,
          enrollment: {
            select: {
              userId: true,
              user: {
                select: {
                  fullName: true,
                },
              },
              course: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
        orderBy: [{ riskLevel: 'desc' }, { riskScore: 'desc' }],
        take: 20,
      }),
    ]);

    const riskStats = {
      total: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    riskCounts.forEach((rc: any) => {
      riskStats.total += rc._count;
      if (rc.riskLevel === 'high') riskStats.high = rc._count;
      else if (rc.riskLevel === 'medium') riskStats.medium = rc._count;
      else if (rc.riskLevel === 'low') riskStats.low = rc._count;
    });

    const riskLearnersData = highRiskLearners.map((rl: any) => ({
      userId: rl.enrollment.userId,
      userName: rl.enrollment.user.fullName,
      riskLevel: rl.riskLevel,
      riskScore: Number(rl.riskScore),
      courseTitle: rl.enrollment.course.title,
    }));

    return {
      learners: {
        total: totalLearners,
        active: activeLearners,
        inactive: totalLearners - activeLearners,
      },
      overdue: {
        total: overdueEnrollments.length,
        enrollments: overdueData,
      },
      roadmapCompletion: {
        ...roadmapStats,
        completionRate: roadmapCompletionRate,
      },
      risks: {
        ...riskStats,
        learners: riskLearnersData,
      },
    };
  }

  /**
   * Get trainer dashboard statistics for courses they manage
   */
  static async getTrainerDashboardStats(trainerId: bigint): Promise<TrainerDashboardStats> {
    const now = new Date();

    // Get courses managed by trainer
    const [totalCourses, coursesByStatus] = await Promise.all([
      (prisma as any).course.count({
        where: { trainerUserId: trainerId },
      }),
      (prisma as any).course.groupBy({
        by: ['status'],
        where: { trainerUserId: trainerId },
        _count: true,
      }),
    ]);

    const courseStats = {
      total: totalCourses,
      published: 0,
      draft: 0,
      archived: 0,
    };

    coursesByStatus.forEach((cs: any) => {
      if (cs.status === 'published') courseStats.published = cs._count;
      else if (cs.status === 'draft') courseStats.draft = cs._count;
      else if (cs.status === 'archived') courseStats.archived = cs._count;
    });

    // Get pending grading (quiz attempts that need manual grading)
    const pendingAttempts = await (prisma as any).quizAttempt.findMany({
      where: {
        quiz: {
          course: {
            trainerUserId: trainerId,
          },
        },
        status: 'submitted',
        gradedAt: null,
      },
      select: {
        id: true,
        submittedAt: true,
        enrollment: {
          select: {
            userId: true,
            user: {
              select: {
                fullName: true,
              },
            },
            courseId: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        },
        quiz: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { submittedAt: 'asc' },
      take: 20,
    });

    const pendingGradingData = pendingAttempts.map((pa: any) => ({
      attemptId: pa.id,
      studentId: pa.enrollment.userId,
      studentName: pa.enrollment.user.fullName,
      courseId: pa.enrollment.courseId,
      courseTitle: pa.enrollment.course.title,
      quizTitle: pa.quiz.title,
      submittedAt: pa.submittedAt,
      daysWaiting: Math.floor((now.getTime() - pa.submittedAt.getTime()) / (1000 * 60 * 60 * 24)),
    }));

    // Get enrollment stats for trainer's courses
    const [totalEnrollments, enrollmentsByStatus, avgProgress] = await Promise.all([
      (prisma as any).enrollment.count({
        where: {
          course: { trainerUserId: trainerId },
        },
      }),
      (prisma as any).enrollment.groupBy({
        by: ['status'],
        where: {
          course: { trainerUserId: trainerId },
        },
        _count: true,
      }),
      (prisma as any).enrollment.aggregate({
        where: {
          course: { trainerUserId: trainerId },
        },
        _avg: {
          progressPercentCache: true,
        },
      }),
    ]);

    const enrollmentStats = {
      total: totalEnrollments,
      assigned: 0,
      inProgress: 0,
      completed: 0,
    };

    enrollmentsByStatus.forEach((es: any) => {
      if (es.status === 'assigned') enrollmentStats.assigned = es._count;
      else if (es.status === 'in_progress') enrollmentStats.inProgress = es._count;
      else if (es.status === 'completed') enrollmentStats.completed = es._count;
    });

    const averageProgress = avgProgress._avg.progressPercentCache
      ? Math.round(Number(avgProgress._avg.progressPercentCache) * 10) / 10
      : 0;

    // Get pass rate from quiz attempts
    const [totalAttempts, passedAttempts] = await Promise.all([
      (prisma as any).quizAttempt.count({
        where: {
          quiz: {
            course: { trainerUserId: trainerId },
          },
          status: 'graded',
          isPassed: { not: null },
        },
      }),
      (prisma as any).quizAttempt.count({
        where: {
          quiz: {
            course: { trainerUserId: trainerId },
          },
          status: 'graded',
          isPassed: true,
        },
      }),
    ]);

    const passRate = {
      totalAttempts,
      passed: passedAttempts,
      failed: totalAttempts - passedAttempts,
      passPercentage:
        totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100 * 10) / 10 : 0,
    };

    return {
      courses: courseStats,
      pendingGrading: {
        total: pendingAttempts.length,
        quizAttempts: pendingGradingData,
      },
      enrollments: {
        ...enrollmentStats,
        averageProgress,
      },
      passRate,
    };
  }

  /**
   * Get employee dashboard statistics for the current user
   */
  static async getEmployeeDashboardStats(userId: bigint): Promise<EmployeeDashboardStats> {
    const now = new Date();

    // Get my courses with enrollment details
    const enrollments = await (prisma as any).enrollment.findMany({
      where: { userId },
      select: {
        id: true,
        courseId: true,
        status: true,
        progressPercentCache: true,
        dueAt: true,
        enrolledAt: true,
        completedAt: true,
        timeSpentSecondsCache: true,
        completedLessonsCountCache: true,
        lastActivityAt: true,
        course: {
          select: {
            title: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const courseStats = {
      total: enrollments.length,
      assigned: 0,
      inProgress: 0,
      completed: 0,
    };

    const coursesData = enrollments.map((e: any) => {
      if (e.status === 'assigned') courseStats.assigned++;
      else if (e.status === 'in_progress') courseStats.inProgress++;
      else if (e.status === 'completed') courseStats.completed++;

      return {
        enrollmentId: e.id,
        courseId: e.courseId,
        courseTitle: e.course.title,
        courseThumbnail: e.course.thumbnailUrl,
        status: e.status,
        progress: Number(e.progressPercentCache),
        dueAt: e.dueAt,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
      };
    });

    // Get my roadmaps with assignment details
    const roadmapAssignments = await (prisma as any).roadmapAssignment.findMany({
      where: { userId },
      select: {
        id: true,
        roadmapId: true,
        status: true,
        assignedAt: true,
        completedAt: true,
        roadmap: {
          select: {
            title: true,
            targetPosition: true,
            roadmapCourses: {
              select: {
                courseId: true,
              },
            },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    const roadmapStats = {
      total: roadmapAssignments.length,
      assigned: 0,
      inProgress: 0,
      completed: 0,
    };

    const roadmapsData = await Promise.all(
      roadmapAssignments.map(async (ra: any) => {
        if (ra.status === 'assigned') roadmapStats.assigned++;
        else if (ra.status === 'in_progress') roadmapStats.inProgress++;
        else if (ra.status === 'completed') roadmapStats.completed++;

        const totalCourses = ra.roadmap.roadmapCourses.length;
        const courseIds = ra.roadmap.roadmapCourses.map((rc: any) => rc.courseId);

        // Count completed courses in this roadmap
        const completedCourses = await (prisma as any).enrollment.count({
          where: {
            userId,
            courseId: { in: courseIds },
            status: 'completed',
          },
        });

        const progressPercent =
          totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

        return {
          assignmentId: ra.id,
          roadmapId: ra.roadmapId,
          roadmapTitle: ra.roadmap.title,
          targetPosition: ra.roadmap.targetPosition,
          status: ra.status,
          totalCourses,
          completedCourses,
          progressPercent,
          assignedAt: ra.assignedAt,
          completedAt: ra.completedAt,
        };
      }),
    );

    // Calculate progress summary
    const totalTimeSpentSeconds = enrollments.reduce(
      (sum: number, e: any) => sum + e.timeSpentSecondsCache,
      0,
    );
    const totalCompletedLessons = enrollments.reduce(
      (sum: number, e: any) => sum + e.completedLessonsCountCache,
      0,
    );
    const avgProgress =
      enrollments.length > 0
        ? Math.round(
            enrollments.reduce((sum: number, e: any) => sum + Number(e.progressPercentCache), 0) /
              enrollments.length,
          )
        : 0;

    const recentActivity = enrollments.length > 0 ? enrollments[0].lastActivityAt : null;

    // Get upcoming deadlines (courses with due dates in the future)
    const upcomingDeadlines = enrollments
      .filter((e: any) => e.dueAt && e.dueAt > now && e.status !== 'completed')
      .map((e: any) => ({
        courseId: e.courseId,
        courseTitle: e.course.title,
        dueAt: e.dueAt,
        daysRemaining: Math.ceil((e.dueAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        currentProgress: Number(e.progressPercentCache),
      }))
      .sort((a: any, b: any) => a.dueAt.getTime() - b.dueAt.getTime())
      .slice(0, 5);

    // Get certificates
    const certificates = await (prisma as any).certificate.findMany({
      where: {
        enrollment: { userId },
        revokedAt: null,
      },
      select: {
        id: true,
        certificateCode: true,
        pdfUrl: true,
        issuedAt: true,
        enrollment: {
          select: {
            courseId: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    const certificatesData = certificates.map((c: any) => ({
      certificateId: c.id,
      certificateCode: c.certificateCode,
      courseId: c.enrollment.courseId,
      courseTitle: c.enrollment.course.title,
      issuedAt: c.issuedAt,
      pdfUrl: c.pdfUrl,
    }));

    return {
      myCourses: {
        ...courseStats,
        courses: coursesData,
      },
      myRoadmaps: {
        ...roadmapStats,
        roadmaps: roadmapsData,
      },
      progressSummary: {
        totalTimeSpentMinutes: Math.round(totalTimeSpentSeconds / 60),
        completedLessons: totalCompletedLessons,
        averageProgress: avgProgress,
        recentActivity,
        upcomingDeadlines,
      },
      certificates: {
        total: certificates.length,
        certificates: certificatesData,
      },
    };
  }
}
