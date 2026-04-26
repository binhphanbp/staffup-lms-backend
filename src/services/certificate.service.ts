import { prisma } from '@/config/database';
import { AppError } from '@/utils';

export class CertificateService {
  /**
   * List certificates with filters
   */
  static async listCertificates(filters: {
    userId?: string;
    courseId?: string;
    enrollmentId?: string;
    page?: number;
    limit?: number;
  }) {
    const db = prisma as any;
    const { userId, courseId, enrollmentId, page = 1, limit = 20 } = filters;

    const where: any = {
      revokedAt: null, // Only active certificates
    };

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

    const skip = (page - 1) * limit;

    const [certificates, total] = await Promise.all([
      db.certificate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { issuedAt: 'desc' },
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
                  thumbnailUrl: true,
                },
              },
            },
          },
        },
      }),
      db.certificate.count({ where }),
    ]);

    return {
      certificates: certificates.map((cert: any) => ({
        id: cert.id.toString(),
        certificateCode: cert.certificateCode,
        pdfUrl: cert.pdfUrl,
        issuedAt: cert.issuedAt.toISOString(),
        enrollment: {
          id: cert.enrollment.id.toString(),
          user: {
            id: cert.enrollment.user.id.toString(),
            fullName: cert.enrollment.user.fullName,
            email: cert.enrollment.user.email,
          },
          course: {
            id: cert.enrollment.course.id.toString(),
            title: cert.enrollment.course.title,
            slug: cert.enrollment.course.slug,
            thumbnailUrl: cert.enrollment.course.thumbnailUrl,
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
   * Get certificate detail by ID
   */
  static async getCertificateById(certificateId: string, userId: string) {
    const db = prisma as any;

    const certificate = await db.certificate.findUnique({
      where: { id: BigInt(certificateId) },
      include: {
        enrollment: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                thumbnailUrl: true,
                trainerUserId: true,
                trainerUser: {
                  select: {
                    id: true,
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!certificate) {
      throw new AppError('Certificate not found', 404);
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
    const isCourseTrainer = certificate.enrollment.course.trainerUserId.toString() === userId;
    const isOwner = certificate.enrollment.user.id.toString() === userId;

    if (!isAdmin && !(isTrainer && isCourseTrainer) && !isOwner) {
      throw new AppError('You do not have permission to view this certificate', 403);
    }

    return {
      id: certificate.id.toString(),
      certificateCode: certificate.certificateCode,
      pdfUrl: certificate.pdfUrl,
      issuedAt: certificate.issuedAt.toISOString(),
      revokedAt: certificate.revokedAt?.toISOString() || null,
      enrollment: {
        id: certificate.enrollment.id.toString(),
        completedAt: certificate.enrollment.completedAt?.toISOString() || null,
        user: {
          id: certificate.enrollment.user.id.toString(),
          fullName: certificate.enrollment.user.fullName,
          email: certificate.enrollment.user.email,
          avatarUrl: certificate.enrollment.user.avatarUrl,
        },
        course: {
          id: certificate.enrollment.course.id.toString(),
          title: certificate.enrollment.course.title,
          slug: certificate.enrollment.course.slug,
          description: certificate.enrollment.course.description,
          thumbnailUrl: certificate.enrollment.course.thumbnailUrl,
          trainer: {
            id: certificate.enrollment.course.trainerUser.id.toString(),
            fullName: certificate.enrollment.course.trainerUser.fullName,
          },
        },
      },
    };
  }

  /**
   * Get certificate by enrollment ID
   */
  static async getCertificateByEnrollment(enrollmentId: string, userId: string) {
    const db = prisma as any;

    const certificate = await db.certificate.findUnique({
      where: { enrollmentId: BigInt(enrollmentId) },
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
                trainerUserId: true,
              },
            },
          },
        },
      },
    });

    if (!certificate) {
      throw new AppError('Certificate not found for this enrollment', 404);
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
    const isCourseTrainer = certificate.enrollment.course.trainerUserId.toString() === userId;
    const isOwner = certificate.enrollment.user.id.toString() === userId;

    if (!isAdmin && !(isTrainer && isCourseTrainer) && !isOwner) {
      throw new AppError('You do not have permission to view this certificate', 403);
    }

    return {
      id: certificate.id.toString(),
      certificateCode: certificate.certificateCode,
      pdfUrl: certificate.pdfUrl,
      issuedAt: certificate.issuedAt.toISOString(),
      revokedAt: certificate.revokedAt?.toISOString() || null,
      enrollment: {
        id: certificate.enrollment.id.toString(),
        user: {
          id: certificate.enrollment.user.id.toString(),
          fullName: certificate.enrollment.user.fullName,
          email: certificate.enrollment.user.email,
        },
        course: {
          id: certificate.enrollment.course.id.toString(),
          title: certificate.enrollment.course.title,
          slug: certificate.enrollment.course.slug,
        },
      },
    };
  }

  /**
   * Revoke certificate (soft delete)
   */
  static async revokeCertificate(certificateId: string, userId: string) {
    const db = prisma as any;

    // Get certificate
    const certificate = await db.certificate.findUnique({
      where: { id: BigInt(certificateId) },
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
    });

    if (!certificate) {
      throw new AppError('Certificate not found', 404);
    }

    // Check if already revoked
    if (certificate.revokedAt) {
      throw new AppError('Certificate is already revoked', 400);
    }

    // Check permission: only admin or course trainer can revoke
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
    const isCourseTrainer = certificate.enrollment.course.trainerUserId.toString() === userId;

    if (!isAdmin && !(isTrainer && isCourseTrainer)) {
      throw new AppError('You do not have permission to revoke this certificate', 403);
    }

    // Revoke certificate (soft delete)
    const revokedCertificate = await db.certificate.update({
      where: { id: BigInt(certificateId) },
      data: {
        revokedAt: new Date(),
      },
    });

    return {
      certificateId: revokedCertificate.id.toString(),
      certificateCode: revokedCertificate.certificateCode,
      revokedAt: revokedCertificate.revokedAt.toISOString(),
    };
  }

  /**
   * Issue certificate for enrollment
   * Check completion requirements and issue certificate if eligible
   */
  static async issueCertificate(enrollmentId: string, userId: string) {
    const db = prisma as any;

    // 1. Get enrollment with course and progress
    const enrollment = await db.enrollment.findUnique({
      where: { id: BigInt(enrollmentId) },
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
            trainerUserId: true,
            modules: {
              include: {
                lessons: true,
              },
            },
            quizzes: true,
          },
        },
        lessonProgress: true,
        quizAttempts: {
          where: {
            status: 'graded',
          },
        },
        certificate: true,
      },
    });

    if (!enrollment) {
      throw new AppError('Enrollment not found', 404);
    }

    // 2. Verify user owns this enrollment or is admin/trainer
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
    const isOwner = enrollment.user.id.toString() === userId;

    if (!isAdmin && !(isTrainer && isCourseTrainer) && !isOwner) {
      throw new AppError(
        'You do not have permission to issue certificate for this enrollment',
        403,
      );
    }

    // 3. Check if certificate already exists
    if (enrollment.certificate && !enrollment.certificate.revokedAt) {
      throw new AppError('Certificate already issued for this enrollment', 400);
    }

    // 4. Check completion requirements
    const requirements = this.checkCompletionRequirements(enrollment);

    if (!requirements.isEligible) {
      throw new AppError(
        `Cannot issue certificate. Requirements not met: ${requirements.missingRequirements.join(', ')}`,
        400,
      );
    }

    // 5. Generate unique certificate code
    const certificateCode = await this.generateCertificateCode(enrollment);

    // 6. Issue certificate
    const certificate = await db.certificate.create({
      data: {
        enrollmentId: BigInt(enrollmentId),
        certificateCode,
        issuedAt: new Date(),
      },
    });

    // 7. Update enrollment status to completed if not already
    if (enrollment.status !== 'completed') {
      await db.enrollment.update({
        where: { id: BigInt(enrollmentId) },
        data: {
          status: 'completed',
          completedAt: new Date(),
        },
      });
    }

    return {
      certificateId: certificate.id.toString(),
      certificateCode: certificate.certificateCode,
      issuedAt: certificate.issuedAt.toISOString(),
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
   * Check if enrollment meets certificate requirements
   */
  private static checkCompletionRequirements(enrollment: any) {
    const missingRequirements: string[] = [];

    // Calculate total lessons
    const totalLessons = enrollment.course.modules.reduce(
      (sum: number, module: any) => sum + module.lessons.length,
      0,
    );

    // Check lesson completion
    const completedLessons = enrollment.lessonProgress.filter(
      (lp: any) => lp.status === 'completed',
    ).length;

    if (completedLessons < totalLessons) {
      missingRequirements.push(
        `Complete all lessons (${completedLessons}/${totalLessons} completed)`,
      );
    }

    // Check quiz completion
    const requiredQuizzes = enrollment.course.quizzes.filter((q: any) => q.isRequired);
    const passedQuizzes = enrollment.quizAttempts.filter((qa: any) => qa.isPassed);

    if (requiredQuizzes.length > 0) {
      const passedQuizIds = new Set(passedQuizzes.map((qa: any) => qa.quizId.toString()));
      const allRequiredPassed = requiredQuizzes.every((q: any) =>
        passedQuizIds.has(q.id.toString()),
      );

      if (!allRequiredPassed) {
        missingRequirements.push(
          `Pass all required quizzes (${passedQuizIds.size}/${requiredQuizzes.length} passed)`,
        );
      }
    }

    // Check enrollment status
    if (enrollment.status === 'cancelled' || enrollment.status === 'expired') {
      missingRequirements.push('Enrollment must be active or completed');
    }

    return {
      isEligible: missingRequirements.length === 0,
      missingRequirements,
      completedLessons,
      totalLessons,
      passedQuizzes: passedQuizzes.length,
      requiredQuizzes: requiredQuizzes.length,
    };
  }

  /**
   * Generate unique certificate code
   */
  private static async generateCertificateCode(enrollment: any): Promise<string> {
    const db = prisma as any;

    // Format: CERT-COURSEID-USERID-TIMESTAMP
    const courseId = enrollment.course.id.toString().padStart(4, '0');
    const userId = enrollment.user.id.toString().padStart(4, '0');
    const timestamp = Date.now().toString().slice(-6);

    let code = `CERT-${courseId}-${userId}-${timestamp}`;

    // Ensure uniqueness
    let exists = await db.certificate.findUnique({
      where: { certificateCode: code },
    });

    let counter = 1;
    while (exists) {
      code = `CERT-${courseId}-${userId}-${timestamp}-${counter}`;
      exists = await db.certificate.findUnique({
        where: { certificateCode: code },
      });
      counter++;
    }

    return code;
  }
}
