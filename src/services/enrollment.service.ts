import { prisma } from '@/config/database';
import { AppError } from '@/utils';
import { recalculateEnrollmentCache } from '@/services/progress.service';
import type { EnrollmentDetailResponse } from '@/interfaces/enrollment.types';
import {
  ALLOWED_TRANSITIONS,
  type ListEnrollmentsQuery,
  type UpdateEnrollmentStatusInput,
} from '@/schemas/enrollment.schema';

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

  static async enrollUsers(
    courseId: string,
    data: { userIds: string[]; dueAt?: string | null; assignmentNote?: string | null },
    assignedByUserId: string,
    roleCodes: string[],
  ) {
    const db = prisma as any;

    const course = await db.course.findUnique({ where: { id: BigInt(courseId) } });
    if (!course) throw new AppError('Course not found', 404);

    const isAdmin = roleCodes.includes('admin');
    const isTrainer = roleCodes.includes('trainer');
    if (!isAdmin && !(isTrainer && course.trainerUserId.toString() === assignedByUserId)) {
      throw new AppError('You do not have permission to enroll users in this course', 403);
    }

    const users = await db.user.findMany({
      where: { id: { in: data.userIds.map((id) => BigInt(id)) } },
      select: { id: true, fullName: true, email: true },
    });
    if (users.length !== data.userIds.length) {
      const foundIds = users.map((u: any) => u.id.toString());
      const missing = data.userIds.filter((id) => !foundIds.includes(id));
      throw new AppError(`Users not found: ${missing.join(', ')}`, 404);
    }

    const existing = await db.enrollment.findMany({
      where: {
        courseId: BigInt(courseId),
        userId: { in: data.userIds.map((id) => BigInt(id)) },
      },
      select: { userId: true },
    });
    const existingUserIds = existing.map((e: any) => e.userId.toString());
    const newUserIds = data.userIds.filter((id) => !existingUserIds.includes(id));

    let created: any[] = [];
    if (newUserIds.length > 0) {
      await db.enrollment.createMany({
        data: newUserIds.map((userId) => ({
          courseId: BigInt(courseId),
          userId: BigInt(userId),
          assignedByUserId: BigInt(assignedByUserId),
          status: 'assigned',
          dueAt: data.dueAt ? new Date(data.dueAt) : null,
          assignmentNote: data.assignmentNote ?? null,
        })),
      });

      created = await db.enrollment.findMany({
        where: {
          courseId: BigInt(courseId),
          userId: { in: newUserIds.map((id) => BigInt(id)) },
        },
        include: { user: { select: { id: true, fullName: true, email: true } } },
      });
    }

    return {
      courseId,
      totalRequested: data.userIds.length,
      enrolled: newUserIds.length,
      skipped: existingUserIds.length,
      skippedUserIds: existingUserIds,
      enrollments: created.map((e: any) => ({
        id: e.id.toString(),
        userId: e.userId.toString(),
        status: e.status,
        enrolledAt: e.enrolledAt.toISOString(),
        dueAt: e.dueAt?.toISOString() || null,
        assignmentNote: e.assignmentNote,
        user: { id: e.user.id.toString(), fullName: e.user.fullName, email: e.user.email },
      })),
    };
  }

  // ─── List enrollments ──────────────────────────────────────────────────────

  static async listEnrollments(
    query: ListEnrollmentsQuery,
    requestUserId: string,
    roleCodes: string[],
  ) {
    const db = prisma as any;
    const { page = 1, limit = 20, userId, courseId, status, departmentId, overdue, search } = query;
    const skip = (page - 1) * limit;

    const isAdmin = roleCodes.includes('admin');
    const isTrainer = roleCodes.includes('trainer');

    const where: Record<string, any> = {};

    // Access control: learner sees only own enrollments
    if (!isAdmin && !isTrainer) {
      where.userId = BigInt(requestUserId);
    } else if (userId) {
      where.userId = BigInt(userId);
    }

    if (courseId) where.courseId = BigInt(courseId);
    if (status) where.status = status;

    if (departmentId) {
      where.user = { departmentId: BigInt(departmentId) };
    }

    if (overdue) {
      where.dueAt = { lt: new Date() };
      where.status = { notIn: ['completed', 'cancelled', 'expired'] };
    }

    if (search) {
      where.OR = [
        { user: { fullName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { course: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Trainer sees only enrollments for their courses
    if (isTrainer && !isAdmin) {
      where.course = { ...where.course, trainerUserId: BigInt(requestUserId) };
    }

    const [enrollments, total] = await Promise.all([
      db.enrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { enrolledAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnailUrl: true,
              trainerUser: { select: { id: true, fullName: true } },
            },
          },
          assignedByUser: { select: { id: true, fullName: true } },
        },
      }),
      db.enrollment.count({ where }),
    ]);

    const now = new Date();
    return {
      data: enrollments.map((e: any) => ({
        id: e.id.toString(),
        userId: e.userId.toString(),
        courseId: e.courseId.toString(),
        status: e.status,
        progressPercent: parseFloat(e.progressPercentCache ?? 0),
        enrolledAt: e.enrolledAt.toISOString(),
        startedAt: e.startedAt?.toISOString() || null,
        completedAt: e.completedAt?.toISOString() || null,
        dueAt: e.dueAt?.toISOString() || null,
        isOverdue: e.dueAt
          ? new Date(e.dueAt) < now && !['completed', 'cancelled', 'expired'].includes(e.status)
          : false,
        assignmentNote: e.assignmentNote,
        user: {
          id: e.user.id.toString(),
          fullName: e.user.fullName,
          email: e.user.email,
          avatarUrl: e.user.avatarUrl,
        },
        course: {
          id: e.course.id.toString(),
          title: e.course.title,
          slug: e.course.slug,
          thumbnailUrl: e.course.thumbnailUrl,
          trainer: {
            id: e.course.trainerUser.id.toString(),
            fullName: e.course.trainerUser.fullName,
          },
        },
        assignedBy: e.assignedByUser
          ? { id: e.assignedByUser.id.toString(), fullName: e.assignedByUser.fullName }
          : null,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Update enrollment status ──────────────────────────────────────────────

  static async updateEnrollmentStatus(
    enrollmentId: string,
    data: UpdateEnrollmentStatusInput,
    requestUserId: string,
    roleCodes: string[],
  ) {
    const db = prisma as any;

    const enrollment = await db.enrollment.findUnique({
      where: { id: BigInt(enrollmentId) },
      include: { course: { select: { trainerUserId: true } } },
    });
    if (!enrollment) throw new AppError('Enrollment not found', 404);

    const isAdmin = roleCodes.includes('admin');
    const isTrainer = roleCodes.includes('trainer');
    const isSelf = enrollment.userId.toString() === requestUserId;
    const isCourseTrainer = enrollment.course.trainerUserId.toString() === requestUserId;

    if (!isAdmin && !isSelf && !(isTrainer && isCourseTrainer)) {
      throw new AppError('You do not have permission to update this enrollment', 403);
    }

    // Transition validation
    const currentStatus = enrollment.status as string;
    const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];

    // Admin-only transitions
    const adminOnlyFrom = ['completed', 'cancelled', 'expired'];
    if (adminOnlyFrom.includes(currentStatus) && !isAdmin) {
      throw new AppError(`Only admin can change status from ${currentStatus}`, 403);
    }

    if (!allowed.includes(data.status)) {
      throw new AppError(
        `Invalid transition: ${currentStatus} → ${data.status}. Allowed: ${allowed.join(', ') || 'none'}`,
        422,
      );
    }

    // Auto-set timestamps if not provided
    const now = new Date();
    const updateData: Record<string, any> = { status: data.status };

    if (data.dueAt !== undefined) updateData.dueAt = data.dueAt ? new Date(data.dueAt) : null;
    if (data.startedAt !== undefined)
      updateData.startedAt = data.startedAt ? new Date(data.startedAt) : null;
    if (data.completedAt !== undefined)
      updateData.completedAt = data.completedAt ? new Date(data.completedAt) : null;

    if (data.status === 'in_progress' && !enrollment.startedAt && !data.startedAt) {
      updateData.startedAt = now;
    }
    if (data.status === 'completed' && !enrollment.completedAt && !data.completedAt) {
      updateData.completedAt = now;
      if (!enrollment.startedAt && !data.startedAt) updateData.startedAt = now;
    }
    if (data.status === 'assigned') {
      // Reset timestamps on re-enroll
      updateData.startedAt = null;
      updateData.completedAt = null;
    }

    const updated = await db.enrollment.update({
      where: { id: BigInt(enrollmentId) },
      data: updateData,
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
    });

    return {
      id: updated.id.toString(),
      userId: updated.userId.toString(),
      courseId: updated.courseId.toString(),
      status: updated.status,
      progressPercent: parseFloat(updated.progressPercentCache ?? 0),
      enrolledAt: updated.enrolledAt.toISOString(),
      startedAt: updated.startedAt?.toISOString() || null,
      completedAt: updated.completedAt?.toISOString() || null,
      dueAt: updated.dueAt?.toISOString() || null,
      user: {
        id: updated.user.id.toString(),
        fullName: updated.user.fullName,
        email: updated.user.email,
      },
      course: {
        id: updated.course.id.toString(),
        title: updated.course.title,
        slug: updated.course.slug,
      },
    };
  }

  // ─── Start lesson / upsert progress ───────────────────────────────────────

  static async startLesson(enrollmentId: string, lessonId: string, requestUserId: string) {
    const db = prisma as any;

    // Verify enrollment belongs to user
    const enrollment = await db.enrollment.findUnique({
      where: { id: BigInt(enrollmentId) },
      include: {
        course: {
          include: {
            modules: { include: { lessons: { select: { id: true } } } },
          },
        },
      },
    });
    if (!enrollment) throw new AppError('Enrollment not found', 404);
    if (enrollment.userId.toString() !== requestUserId) {
      throw new AppError('You do not have permission to access this enrollment', 403);
    }
    if (['cancelled', 'expired'].includes(enrollment.status)) {
      throw new AppError('Cannot start lesson on a cancelled or expired enrollment', 403);
    }

    // Validate lesson belongs to this course
    const allLessonIds = enrollment.course.modules.flatMap((m: any) =>
      m.lessons.map((l: any) => l.id.toString()),
    );
    if (!allLessonIds.includes(lessonId)) {
      throw new AppError('Lesson does not belong to this enrollment course', 404);
    }

    const now = new Date();

    // Upsert lesson progress
    const progress = await db.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: { enrollmentId: BigInt(enrollmentId), lessonId: BigInt(lessonId) },
      },
      create: {
        enrollmentId: BigInt(enrollmentId),
        lessonId: BigInt(lessonId),
        status: 'in_progress',
        startedAt: now,
        lastAccessedAt: now,
      },
      update: {
        lastAccessedAt: now,
        // Only move to in_progress if currently not_started; don't downgrade completed
        status: enrollment.status === 'not_started' ? 'in_progress' : undefined,
      },
      include: {
        lesson: { select: { id: true, title: true, lessonType: true, durationSeconds: true } },
      },
    });

    // Transition enrollment to in_progress if still assigned
    const enrollmentUpdates: Record<string, any> = { lastActivityAt: now };
    if (enrollment.status === 'assigned') {
      enrollmentUpdates.status = 'in_progress';
      enrollmentUpdates.startedAt = enrollment.startedAt ?? now;
    }
    await db.enrollment.update({ where: { id: BigInt(enrollmentId) }, data: enrollmentUpdates });

    return {
      enrollmentId,
      lessonId,
      status: progress.status,
      startedAt: progress.startedAt?.toISOString() || null,
      lastAccessedAt: progress.lastAccessedAt?.toISOString() || null,
      watchTimeSeconds: progress.watchTimeSeconds,
      lastPositionSeconds: progress.lastPositionSeconds,
      lesson: {
        id: progress.lesson.id.toString(),
        title: progress.lesson.title,
        lessonType: progress.lesson.lessonType,
        durationSeconds: progress.lesson.durationSeconds,
      },
    };
  }

  // ─── Update lesson progress (watch time / position) ───────────────────────

  static async updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    data: { watchTimeSeconds?: number; lastPositionSeconds?: number; status?: string },
    requestUserId: string,
  ) {
    const db = prisma as any;

    const enrollment = await db.enrollment.findUnique({
      where: { id: BigInt(enrollmentId) },
    });
    if (!enrollment) throw new AppError('Enrollment not found', 404);
    if (enrollment.userId.toString() !== requestUserId) {
      throw new AppError('You do not have permission to access this enrollment', 403);
    }

    const progress = await db.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: { enrollmentId: BigInt(enrollmentId), lessonId: BigInt(lessonId) },
      },
    });
    if (!progress) throw new AppError('Lesson progress not found. Call start lesson first.', 404);

    const now = new Date();
    const updateData: Record<string, any> = { lastAccessedAt: now };

    if (data.watchTimeSeconds !== undefined) {
      // Accumulate watch time (only increase)
      updateData.watchTimeSeconds = Math.max(progress.watchTimeSeconds, data.watchTimeSeconds);
    }
    if (data.lastPositionSeconds !== undefined) {
      updateData.lastPositionSeconds = data.lastPositionSeconds;
    }
    if (data.status && data.status !== 'not_started') {
      // Don't allow downgrading from completed
      if (progress.status !== 'completed' || data.status === 'completed') {
        updateData.status = data.status;
      }
      if (data.status === 'completed' && !progress.completedAt) {
        updateData.completedAt = now;
      }
    }

    const updated = await db.lessonProgress.update({
      where: {
        enrollmentId_lessonId: { enrollmentId: BigInt(enrollmentId), lessonId: BigInt(lessonId) },
      },
      data: updateData,
    });

    // Recalculate enrollment caches
    await recalculateEnrollmentCache(enrollmentId);

    return {
      enrollmentId,
      lessonId,
      status: updated.status,
      watchTimeSeconds: updated.watchTimeSeconds,
      lastPositionSeconds: updated.lastPositionSeconds,
      startedAt: updated.startedAt?.toISOString() || null,
      completedAt: updated.completedAt?.toISOString() || null,
      lastAccessedAt: updated.lastAccessedAt?.toISOString() || null,
    };
  }

  // ─── Complete lesson ───────────────────────────────────────────────────────

  static async completeLesson(enrollmentId: string, lessonId: string, requestUserId: string) {
    const db = prisma as any;

    const enrollment = await db.enrollment.findUnique({
      where: { id: BigInt(enrollmentId) },
      include: {
        course: {
          include: { modules: { include: { lessons: { select: { id: true } } } } },
        },
      },
    });
    if (!enrollment) throw new AppError('Enrollment not found', 404);
    if (enrollment.userId.toString() !== requestUserId) {
      throw new AppError('You do not have permission to access this enrollment', 403);
    }
    if (['cancelled', 'expired'].includes(enrollment.status)) {
      throw new AppError('Cannot update progress on a cancelled or expired enrollment', 403);
    }

    // Validate lesson belongs to this course
    const allLessonIds = enrollment.course.modules.flatMap((m: any) =>
      m.lessons.map((l: any) => l.id.toString()),
    );
    if (!allLessonIds.includes(lessonId)) {
      throw new AppError('Lesson does not belong to this enrollment course', 404);
    }

    const now = new Date();

    // Upsert — create if not exists, mark completed
    const progress = await db.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: { enrollmentId: BigInt(enrollmentId), lessonId: BigInt(lessonId) },
      },
      create: {
        enrollmentId: BigInt(enrollmentId),
        lessonId: BigInt(lessonId),
        status: 'completed',
        startedAt: now,
        completedAt: now,
        lastAccessedAt: now,
      },
      update: {
        status: 'completed',
        completedAt: now,
        lastAccessedAt: now,
      },
    });

    // Recalculate caches
    await recalculateEnrollmentCache(enrollmentId);

    // Fetch updated enrollment for response
    const updatedEnrollment = await db.enrollment.findUnique({
      where: { id: BigInt(enrollmentId) },
      select: {
        progressPercentCache: true,
        completedLessonsCountCache: true,
        timeSpentSecondsCache: true,
      },
    });

    return {
      enrollmentId,
      lessonId,
      status: progress.status,
      completedAt: progress.completedAt?.toISOString() || null,
      enrollment: {
        progressPercent: parseFloat(updatedEnrollment.progressPercentCache ?? 0),
        completedLessonsCount: updatedEnrollment.completedLessonsCountCache,
        timeSpentSeconds: updatedEnrollment.timeSpentSecondsCache,
      },
    };
  }

  // ─── Get enrollment progress (summary + per-lesson detail) ────────────────

  static async getEnrollmentProgress(
    enrollmentId: string,
    requestUserId: string,
    roleCodes: string[],
  ) {
    const db = prisma as any;

    const enrollment = await db.enrollment.findUnique({
      where: { id: BigInt(enrollmentId) },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { orderIndex: 'asc' },
              include: {
                lessons: {
                  orderBy: { orderIndex: 'asc' },
                  select: {
                    id: true,
                    title: true,
                    lessonType: true,
                    durationSeconds: true,
                    orderIndex: true,
                    isPreview: true,
                  },
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
            lastPositionSeconds: true,
            startedAt: true,
            completedAt: true,
            lastAccessedAt: true,
          },
        },
      },
    });

    if (!enrollment) throw new AppError('Enrollment not found', 404);

    const isAdmin = roleCodes.includes('admin');
    const isTrainer = roleCodes.includes('trainer');
    const isOwner = enrollment.userId.toString() === requestUserId;

    if (!isAdmin && !isTrainer && !isOwner) {
      throw new AppError('You do not have permission to view this enrollment', 403);
    }

    // Build a map for O(1) lookup
    const progressMap = new Map(
      enrollment.lessonProgress.map((lp: any) => [lp.lessonId.toString(), lp]),
    );

    const totalLessons = enrollment.course.modules.reduce(
      (sum: number, m: any) => sum + m.lessons.length,
      0,
    );

    // Build per-module breakdown
    const modules = enrollment.course.modules.map((module: any) => ({
      id: module.id.toString(),
      title: module.title,
      orderIndex: module.orderIndex,
      lessons: module.lessons.map((lesson: any) => {
        const lp = progressMap.get(lesson.id.toString()) as any;
        return {
          id: lesson.id.toString(),
          title: lesson.title,
          lessonType: lesson.lessonType,
          durationSeconds: lesson.durationSeconds,
          orderIndex: lesson.orderIndex,
          isPreview: lesson.isPreview,
          progress: lp
            ? {
                status: lp.status,
                watchTimeSeconds: lp.watchTimeSeconds,
                lastPositionSeconds: lp.lastPositionSeconds,
                startedAt: lp.startedAt?.toISOString() || null,
                completedAt: lp.completedAt?.toISOString() || null,
                lastAccessedAt: lp.lastAccessedAt?.toISOString() || null,
              }
            : {
                status: 'not_started',
                watchTimeSeconds: 0,
                lastPositionSeconds: 0,
                startedAt: null,
                completedAt: null,
                lastAccessedAt: null,
              },
        };
      }),
    }));

    return {
      enrollmentId,
      courseId: enrollment.courseId.toString(),
      enrollmentStatus: enrollment.status,
      summary: {
        progressPercent: parseFloat(enrollment.progressPercentCache ?? 0),
        completedLessonsCount: enrollment.completedLessonsCountCache,
        totalLessonsCount: totalLessons,
        timeSpentSeconds: enrollment.timeSpentSecondsCache,
        lastActivityAt: enrollment.lastActivityAt?.toISOString() || null,
      },
      modules,
    };
  }

  // ─── Recalculate enrollment progress caches ────────────────────────────────

  private static async recalculateEnrollmentCache(enrollmentId: string, db: any) {
    await recalculateEnrollmentCache(enrollmentId);
  }
}
