import { prisma } from '@/config/database';
import { AppError } from '@/utils';
import type { RoadmapDetailResponse } from '@/interfaces/roadmap.types';

export class RoadmapService {
  /**
   * Get roadmap detail with courses and user assignment status
   */
  static async getRoadmapDetail(roadmapId: string, userId: string): Promise<RoadmapDetailResponse> {
    const db = prisma as any;

    // 1. Load roadmap with all relations
    const roadmap = await db.roadmap.findUnique({
      where: { id: BigInt(roadmapId) },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        roadmapCourses: {
          orderBy: { orderIndex: 'asc' },
          include: {
            course: {
              include: {
                trainerUser: {
                  select: {
                    id: true,
                    fullName: true,
                    avatarUrl: true,
                  },
                },
                modules: {
                  include: {
                    _count: {
                      select: {
                        lessons: true,
                      },
                    },
                  },
                },
                _count: {
                  select: {
                    enrollments: true,
                  },
                },
              },
            },
          },
        },
        assignments: {
          where: {
            userId: BigInt(userId),
          },
          include: {
            assignedByUser: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        _count: {
          select: {
            assignments: true,
          },
        },
      },
    });

    if (!roadmap) {
      throw new AppError('Roadmap not found.', 404);
    }

    // 2. Load user enrollments for all courses in roadmap
    const courseIds = roadmap.roadmapCourses.map((rc: any) => rc.course.id);

    const userEnrollments = await db.enrollment.findMany({
      where: {
        userId: BigInt(userId),
        courseId: { in: courseIds },
      },
      select: {
        id: true,
        courseId: true,
        status: true,
        progressPercentCache: true,
        completedLessonsCountCache: true,
        enrolledAt: true,
        startedAt: true,
        completedAt: true,
      },
    });

    // 3. Map enrollments by courseId
    const enrollmentMap = new Map(userEnrollments.map((e: any) => [e.courseId.toString(), e]));

    // 4. Transform courses data
    const courses = roadmap.roadmapCourses.map((rc: any) => {
      const course = rc.course;
      const enrollment = enrollmentMap.get(course.id.toString()) as any;

      // Calculate stats
      const totalModules = course.modules.length;
      const totalLessons = course.modules.reduce(
        (sum: number, module: any) => sum + module._count.lessons,
        0,
      );

      const courseData: any = {
        id: course.id.toString(),
        title: course.title,
        slug: course.slug,
        description: course.description,
        thumbnailUrl: course.thumbnailUrl,
        status: course.status,
        estimatedDurationMinutes: course.estimatedDurationMinutes,
        orderIndex: rc.orderIndex,
        isRequired: rc.isRequired,

        trainer: {
          id: course.trainerUser.id.toString(),
          fullName: course.trainerUser.fullName,
          avatarUrl: course.trainerUser.avatarUrl,
        },

        stats: {
          totalModules,
          totalLessons,
          totalEnrollments: course._count.enrollments,
        },
      };

      // Add enrollment info if user enrolled
      if (enrollment) {
        courseData.userEnrollment = {
          enrollmentId: enrollment.id.toString(),
          status: enrollment.status,
          progressPercent: Number(enrollment.progressPercentCache),
          completedLessonsCount: enrollment.completedLessonsCountCache,
          enrolledAt: enrollment.enrolledAt.toISOString(),
          startedAt: enrollment.startedAt?.toISOString() || null,
          completedAt: enrollment.completedAt?.toISOString() || null,
        };
      }

      return courseData;
    });

    // 5. Get user assignment
    const assignment = roadmap.assignments[0] || null;
    const userAssignment = assignment
      ? {
          assignmentId: assignment.id.toString(),
          status: assignment.status,
          assignedAt: assignment.assignedAt.toISOString(),
          startedAt: assignment.startedAt?.toISOString() || null,
          completedAt: assignment.completedAt?.toISOString() || null,
          droppedAt: assignment.droppedAt?.toISOString() || null,
          assignedBy: assignment.assignedByUser
            ? {
                id: assignment.assignedByUser.id.toString(),
                fullName: assignment.assignedByUser.fullName,
              }
            : null,
        }
      : null;

    // 6. Calculate stats
    const requiredCourses = courses.filter((c: any) => c.isRequired).length;
    const optionalCourses = courses.length - requiredCourses;
    const totalEstimatedMinutes = courses.reduce(
      (sum: number, c: any) => sum + (c.estimatedDurationMinutes || 0),
      0,
    );

    // 7. Build response
    return {
      id: roadmap.id.toString(),
      title: roadmap.title,
      description: roadmap.description,
      targetPosition: roadmap.targetPosition,
      isActive: roadmap.isActive,
      createdAt: roadmap.createdAt.toISOString(),
      updatedAt: roadmap.updatedAt.toISOString(),

      department: {
        id: roadmap.department.id.toString(),
        name: roadmap.department.name,
      },

      category: roadmap.category
        ? {
            id: roadmap.category.id.toString(),
            name: roadmap.category.name,
            slug: roadmap.category.slug,
          }
        : null,

      createdBy: roadmap.createdByUser
        ? {
            id: roadmap.createdByUser.id.toString(),
            fullName: roadmap.createdByUser.fullName,
            email: roadmap.createdByUser.email,
          }
        : null,

      courses,
      userAssignment,

      stats: {
        totalCourses: courses.length,
        requiredCourses,
        optionalCourses,
        totalEstimatedMinutes,
        totalAssignments: roadmap._count.assignments,
      },
    };
  }
}
