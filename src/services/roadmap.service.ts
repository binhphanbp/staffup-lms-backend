import { prisma } from '@/config/database';
import { AppError } from '@/utils';

export class RoadmapService {
  /**
   * Create roadmap
   */
  static async createRoadmap(
    data: {
      departmentId: string;
      categoryId?: string;
      title: string;
      description?: string;
      targetPosition?: string;
      isActive?: boolean;
      courses?: Array<{
        courseId: string;
        orderIndex?: number;
        isRequired?: boolean;
      }>;
    },
    userId: string,
  ) {
    const db = prisma as any;

    // Check permission: admin or department manager
    const currentUser = await db.user.findUnique({
      where: { id: BigInt(userId) },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        managedDepartments: true,
      },
    });

    const isAdmin = currentUser?.userRoles.some((ur: any) => ur.role.code === 'admin');
    const isDepartmentManager = currentUser?.managedDepartments.some(
      (dept: any) => dept.id.toString() === data.departmentId,
    );

    if (!isAdmin && !isDepartmentManager) {
      throw new AppError('You do not have permission to create roadmap for this department', 403);
    }

    // Verify department exists
    const department = await db.department.findUnique({
      where: { id: BigInt(data.departmentId) },
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    // Verify category if provided
    if (data.categoryId) {
      const category = await db.category.findUnique({
        where: { id: BigInt(data.categoryId) },
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }
    }

    // Create roadmap
    const roadmap = await db.roadmap.create({
      data: {
        departmentId: BigInt(data.departmentId),
        categoryId: data.categoryId ? BigInt(data.categoryId) : null,
        title: data.title,
        description: data.description || null,
        targetPosition: data.targetPosition || null,
        isActive: data.isActive ?? true,
        createdByUserId: BigInt(userId),
      },
    });

    // Add courses if provided
    if (data.courses && data.courses.length > 0) {
      await db.roadmapCourse.createMany({
        data: data.courses.map((c, index) => ({
          roadmapId: roadmap.id,
          courseId: BigInt(c.courseId),
          orderIndex: c.orderIndex ?? index + 1,
          isRequired: c.isRequired ?? true,
        })),
      });
    }

    return this.getRoadmapById(roadmap.id.toString(), userId);
  }

  /**
   * Update roadmap
   */
  static async updateRoadmap(
    roadmapId: string,
    data: {
      title?: string;
      description?: string;
      categoryId?: string;
      targetPosition?: string;
      isActive?: boolean;
    },
    userId: string,
  ) {
    const db = prisma as any;

    const roadmap = await db.roadmap.findUnique({
      where: { id: BigInt(roadmapId) },
    });

    if (!roadmap) {
      throw new AppError('Roadmap not found', 404);
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
        managedDepartments: true,
      },
    });

    const isAdmin = currentUser?.userRoles.some((ur: any) => ur.role.code === 'admin');
    const isDepartmentManager = currentUser?.managedDepartments.some(
      (dept: any) => dept.id.toString() === roadmap.departmentId.toString(),
    );

    if (!isAdmin && !isDepartmentManager) {
      throw new AppError('You do not have permission to update this roadmap', 403);
    }

    // Verify category if provided
    if (data.categoryId) {
      const category = await db.category.findUnique({
        where: { id: BigInt(data.categoryId) },
      });

      if (!category) {
        throw new AppError('Category not found', 404);
      }
    }

    // Update roadmap
    await db.roadmap.update({
      where: { id: BigInt(roadmapId) },
      data: {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId ? BigInt(data.categoryId) : undefined,
        targetPosition: data.targetPosition,
        isActive: data.isActive,
      },
    });

    return this.getRoadmapById(roadmapId, userId);
  }

  /**
   * Delete roadmap
   */
  static async deleteRoadmap(roadmapId: string, userId: string) {
    const db = prisma as any;

    const roadmap = await db.roadmap.findUnique({
      where: { id: BigInt(roadmapId) },
    });

    if (!roadmap) {
      throw new AppError('Roadmap not found', 404);
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
        managedDepartments: true,
      },
    });

    const isAdmin = currentUser?.userRoles.some((ur: any) => ur.role.code === 'admin');
    const isDepartmentManager = currentUser?.managedDepartments.some(
      (dept: any) => dept.id.toString() === roadmap.departmentId.toString(),
    );

    if (!isAdmin && !isDepartmentManager) {
      throw new AppError('You do not have permission to delete this roadmap', 403);
    }

    // Delete roadmap (cascade will handle roadmap_courses, assignments)
    await db.roadmap.delete({
      where: { id: BigInt(roadmapId) },
    });

    return { roadmapId, deleted: true };
  }

  /**
   * Get roadmap by ID
   */
  static async getRoadmapById(roadmapId: string, userId: string) {
    const db = prisma as any;

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
          },
        },
        roadmapCourses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                thumbnailUrl: true,
                status: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: {
            assignments: true,
          },
        },
      },
    });

    if (!roadmap) {
      throw new AppError('Roadmap not found', 404);
    }

    return {
      id: roadmap.id.toString(),
      departmentId: roadmap.departmentId.toString(),
      categoryId: roadmap.categoryId?.toString() || null,
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
          }
        : null,
      courses: roadmap.roadmapCourses.map((rc: any) => ({
        id: rc.id.toString(),
        courseId: rc.courseId.toString(),
        orderIndex: rc.orderIndex,
        isRequired: rc.isRequired,
        course: {
          id: rc.course.id.toString(),
          title: rc.course.title,
          slug: rc.course.slug,
          thumbnailUrl: rc.course.thumbnailUrl,
          status: rc.course.status,
        },
      })),
      assignmentsCount: roadmap._count.assignments,
    };
  }

  /**
   * List roadmaps with filters
   */
  static async listRoadmaps(
    filters: {
      departmentId?: string;
      categoryId?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    },
    userId: string,
  ) {
    const db = prisma as any;

    const { departmentId, categoryId, isActive, page = 1, limit = 20 } = filters;

    const where: any = {};

    if (departmentId) {
      where.departmentId = BigInt(departmentId);
    }

    if (categoryId) {
      where.categoryId = BigInt(categoryId);
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const skip = (page - 1) * limit;

    const [roadmaps, total] = await Promise.all([
      db.roadmap.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
          _count: {
            select: {
              roadmapCourses: true,
              assignments: true,
            },
          },
        },
      }),
      db.roadmap.count({ where }),
    ]);

    return {
      roadmaps: roadmaps.map((r: any) => ({
        id: r.id.toString(),
        departmentId: r.departmentId.toString(),
        categoryId: r.categoryId?.toString() || null,
        title: r.title,
        description: r.description,
        targetPosition: r.targetPosition,
        isActive: r.isActive,
        createdAt: r.createdAt.toISOString(),
        department: {
          id: r.department.id.toString(),
          name: r.department.name,
        },
        category: r.category
          ? {
              id: r.category.id.toString(),
              name: r.category.name,
              slug: r.category.slug,
            }
          : null,
        coursesCount: r._count.roadmapCourses,
        assignmentsCount: r._count.assignments,
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
   * Add course to roadmap
   */
  static async addCourseToRoadmap(
    roadmapId: string,
    data: {
      courseId: string;
      orderIndex?: number;
      isRequired?: boolean;
    },
    userId: string,
  ) {
    const db = prisma as any;

    const roadmap = await db.roadmap.findUnique({
      where: { id: BigInt(roadmapId) },
      include: {
        roadmapCourses: true,
      },
    });

    if (!roadmap) {
      throw new AppError('Roadmap not found', 404);
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
        managedDepartments: true,
      },
    });

    const isAdmin = currentUser?.userRoles.some((ur: any) => ur.role.code === 'admin');
    const isDepartmentManager = currentUser?.managedDepartments.some(
      (dept: any) => dept.id.toString() === roadmap.departmentId.toString(),
    );

    if (!isAdmin && !isDepartmentManager) {
      throw new AppError('You do not have permission to modify this roadmap', 403);
    }

    // Check if course exists
    const course = await db.course.findUnique({
      where: { id: BigInt(data.courseId) },
    });

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check if course already in roadmap
    const existing = await db.roadmapCourse.findUnique({
      where: {
        roadmapId_courseId: {
          roadmapId: BigInt(roadmapId),
          courseId: BigInt(data.courseId),
        },
      },
    });

    if (existing) {
      throw new AppError('Course already added to this roadmap', 400);
    }

    // Determine order index
    let orderIndex = data.orderIndex;
    if (!orderIndex) {
      const maxOrder = roadmap.roadmapCourses.reduce(
        (max: number, rc: any) => Math.max(max, rc.orderIndex || 0),
        0,
      );
      orderIndex = maxOrder + 1;
    } else {
      // Check if orderIndex already exists
      const existingOrder = roadmap.roadmapCourses.find((rc: any) => rc.orderIndex === orderIndex);
      if (existingOrder) {
        throw new AppError(
          `Order index ${orderIndex} is already used by another course in this roadmap`,
          400,
        );
      }
    }

    // Add course
    const roadmapCourse = await db.roadmapCourse.create({
      data: {
        roadmapId: BigInt(roadmapId),
        courseId: BigInt(data.courseId),
        orderIndex,
        isRequired: data.isRequired ?? true,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            status: true,
          },
        },
      },
    });

    return {
      id: roadmapCourse.id.toString(),
      roadmapId: roadmapCourse.roadmapId.toString(),
      courseId: roadmapCourse.courseId.toString(),
      orderIndex: roadmapCourse.orderIndex,
      isRequired: roadmapCourse.isRequired,
      course: {
        id: roadmapCourse.course.id.toString(),
        title: roadmapCourse.course.title,
        slug: roadmapCourse.course.slug,
        thumbnailUrl: roadmapCourse.course.thumbnailUrl,
        status: roadmapCourse.course.status,
      },
    };
  }

  /**
   * Remove course from roadmap
   */
  static async removeCourseFromRoadmap(roadmapId: string, courseId: string, userId: string) {
    const db = prisma as any;

    const roadmap = await db.roadmap.findUnique({
      where: { id: BigInt(roadmapId) },
    });

    if (!roadmap) {
      throw new AppError('Roadmap not found', 404);
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
        managedDepartments: true,
      },
    });

    const isAdmin = currentUser?.userRoles.some((ur: any) => ur.role.code === 'admin');
    const isDepartmentManager = currentUser?.managedDepartments.some(
      (dept: any) => dept.id.toString() === roadmap.departmentId.toString(),
    );

    if (!isAdmin && !isDepartmentManager) {
      throw new AppError('You do not have permission to modify this roadmap', 403);
    }

    // Check if course in roadmap
    const roadmapCourse = await db.roadmapCourse.findUnique({
      where: {
        roadmapId_courseId: {
          roadmapId: BigInt(roadmapId),
          courseId: BigInt(courseId),
        },
      },
    });

    if (!roadmapCourse) {
      throw new AppError('Course not found in this roadmap', 404);
    }

    // Remove course
    await db.roadmapCourse.delete({
      where: {
        roadmapId_courseId: {
          roadmapId: BigInt(roadmapId),
          courseId: BigInt(courseId),
        },
      },
    });

    return {
      roadmapId,
      courseId,
      removed: true,
    };
  }

  /**
   * Update roadmap course settings
   */
  static async updateRoadmapCourse(
    roadmapId: string,
    courseId: string,
    data: {
      orderIndex?: number;
      isRequired?: boolean;
    },
    userId: string,
  ) {
    const db = prisma as any;

    const roadmap = await db.roadmap.findUnique({
      where: { id: BigInt(roadmapId) },
    });

    if (!roadmap) {
      throw new AppError('Roadmap not found', 404);
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
        managedDepartments: true,
      },
    });

    const isAdmin = currentUser?.userRoles.some((ur: any) => ur.role.code === 'admin');
    const isDepartmentManager = currentUser?.managedDepartments.some(
      (dept: any) => dept.id.toString() === roadmap.departmentId.toString(),
    );

    if (!isAdmin && !isDepartmentManager) {
      throw new AppError('You do not have permission to modify this roadmap', 403);
    }

    // Check if course in roadmap
    const roadmapCourse = await db.roadmapCourse.findUnique({
      where: {
        roadmapId_courseId: {
          roadmapId: BigInt(roadmapId),
          courseId: BigInt(courseId),
        },
      },
    });

    if (!roadmapCourse) {
      throw new AppError('Course not found in this roadmap', 404);
    }

    // Check if new orderIndex conflicts with existing
    if (data.orderIndex !== undefined) {
      const existingOrder = await db.roadmapCourse.findUnique({
        where: {
          roadmapId_orderIndex: {
            roadmapId: BigInt(roadmapId),
            orderIndex: data.orderIndex,
          },
        },
      });

      if (existingOrder && existingOrder.courseId.toString() !== courseId) {
        throw new AppError(
          `Order index ${data.orderIndex} is already used by another course in this roadmap`,
          400,
        );
      }
    }

    // Update course
    const updated = await db.roadmapCourse.update({
      where: {
        roadmapId_courseId: {
          roadmapId: BigInt(roadmapId),
          courseId: BigInt(courseId),
        },
      },
      data: {
        orderIndex: data.orderIndex,
        isRequired: data.isRequired,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return {
      id: updated.id.toString(),
      roadmapId: updated.roadmapId.toString(),
      courseId: updated.courseId.toString(),
      orderIndex: updated.orderIndex,
      isRequired: updated.isRequired,
      course: {
        id: updated.course.id.toString(),
        title: updated.course.title,
        slug: updated.course.slug,
      },
    };
  }

  /**
   * Reorder roadmap courses
   */
  static async reorderRoadmapCourses(
    roadmapId: string,
    courseOrders: Array<{ courseId: string; orderIndex: number }>,
    userId: string,
  ) {
    const db = prisma as any;

    const roadmap = await db.roadmap.findUnique({
      where: { id: BigInt(roadmapId) },
    });

    if (!roadmap) {
      throw new AppError('Roadmap not found', 404);
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
        managedDepartments: true,
      },
    });

    const isAdmin = currentUser?.userRoles.some((ur: any) => ur.role.code === 'admin');
    const isDepartmentManager = currentUser?.managedDepartments.some(
      (dept: any) => dept.id.toString() === roadmap.departmentId.toString(),
    );

    if (!isAdmin && !isDepartmentManager) {
      throw new AppError('You do not have permission to modify this roadmap', 403);
    }

    // Verify all courses exist in roadmap
    const existingCourses = await db.roadmapCourse.findMany({
      where: {
        roadmapId: BigInt(roadmapId),
        courseId: {
          in: courseOrders.map((item) => BigInt(item.courseId)),
        },
      },
    });

    if (existingCourses.length !== courseOrders.length) {
      const existingCourseIds = existingCourses.map((c: any) => c.courseId.toString());
      const missingCourseIds = courseOrders
        .map((item) => item.courseId)
        .filter((id) => !existingCourseIds.includes(id));

      throw new AppError(`Courses not found in roadmap: ${missingCourseIds.join(', ')}`, 404);
    }

    // Update order for each course
    await Promise.all(
      courseOrders.map((item) =>
        db.roadmapCourse.update({
          where: {
            roadmapId_courseId: {
              roadmapId: BigInt(roadmapId),
              courseId: BigInt(item.courseId),
            },
          },
          data: {
            orderIndex: item.orderIndex,
          },
        }),
      ),
    );

    return {
      roadmapId,
      reordered: true,
      count: courseOrders.length,
    };
  }

  /**
   * Assign roadmap to users
   */
  static async assignRoadmapToUsers(
    roadmapId: string,
    data: {
      userIds: string[];
    },
    assignedByUserId: string,
  ) {
    const db = prisma as any;

    const roadmap = await db.roadmap.findUnique({
      where: { id: BigInt(roadmapId) },
    });

    if (!roadmap) {
      throw new AppError('Roadmap not found', 404);
    }

    // Check permission
    const currentUser = await db.user.findUnique({
      where: { id: BigInt(assignedByUserId) },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        managedDepartments: true,
      },
    });

    const isAdmin = currentUser?.userRoles.some((ur: any) => ur.role.code === 'admin');
    const isDepartmentManager = currentUser?.managedDepartments.some(
      (dept: any) => dept.id.toString() === roadmap.departmentId.toString(),
    );

    if (!isAdmin && !isDepartmentManager) {
      throw new AppError('You do not have permission to assign this roadmap', 403);
    }

    // Verify all users exist
    const users = await db.user.findMany({
      where: {
        id: {
          in: data.userIds.map((id) => BigInt(id)),
        },
      },
    });

    if (users.length !== data.userIds.length) {
      const foundUserIds = users.map((u: any) => u.id.toString());
      const missingUserIds = data.userIds.filter((id) => !foundUserIds.includes(id));
      throw new AppError(`Users not found: ${missingUserIds.join(', ')}`, 404);
    }

    // Check for existing assignments
    const existingAssignments = await db.roadmapAssignment.findMany({
      where: {
        roadmapId: BigInt(roadmapId),
        userId: {
          in: data.userIds.map((id) => BigInt(id)),
        },
      },
    });

    const existingUserIds = existingAssignments.map((a: any) => a.userId.toString());
    const newUserIds = data.userIds.filter((id) => !existingUserIds.includes(id));

    // Create assignments for new users only
    const assignments = [];
    if (newUserIds.length > 0) {
      await db.roadmapAssignment.createMany({
        data: newUserIds.map((userId) => ({
          roadmapId: BigInt(roadmapId),
          userId: BigInt(userId),
          assignedByUserId: BigInt(assignedByUserId),
          status: 'assigned',
        })),
      });

      // Fetch created assignments
      const createdAssignments = await db.roadmapAssignment.findMany({
        where: {
          roadmapId: BigInt(roadmapId),
          userId: {
            in: newUserIds.map((id) => BigInt(id)),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      assignments.push(...createdAssignments);
    }

    return {
      roadmapId,
      totalRequested: data.userIds.length,
      newAssignments: newUserIds.length,
      alreadyAssigned: existingUserIds.length,
      skippedUserIds: existingUserIds,
      assignments: assignments.map((a: any) => ({
        id: a.id.toString(),
        userId: a.userId.toString(),
        status: a.status,
        assignedAt: a.assignedAt.toISOString(),
        user: {
          id: a.user.id.toString(),
          fullName: a.user.fullName,
          email: a.user.email,
        },
      })),
    };
  }

  /**
   * List roadmap assignments with filters
   */
  static async listRoadmapAssignments(
    filters: {
      userId?: string;
      roadmapId?: string;
      status?: string;
      departmentId?: string;
      page?: number;
      limit?: number;
    },
    requestUserId: string,
  ) {
    const db = prisma as any;

    const { userId, roadmapId, status, departmentId, page = 1, limit = 20 } = filters;

    // Check permission
    const currentUser = await db.user.findUnique({
      where: { id: BigInt(requestUserId) },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        managedDepartments: true,
      },
    });

    const isAdmin = currentUser?.userRoles.some((ur: any) => ur.role.code === 'admin');
    const isDepartmentManager = currentUser?.managedDepartments.length > 0;

    const where: any = {};

    // If not admin, filter by user's own assignments or managed departments
    if (!isAdmin) {
      if (isDepartmentManager) {
        const managedDeptIds = currentUser.managedDepartments.map((d: any) => d.id);
        where.OR = [
          { userId: BigInt(requestUserId) },
          {
            roadmap: {
              departmentId: {
                in: managedDeptIds,
              },
            },
          },
        ];
      } else {
        // Regular user can only see their own assignments
        where.userId = BigInt(requestUserId);
      }
    }

    // Apply filters
    if (userId) {
      where.userId = BigInt(userId);
    }

    if (roadmapId) {
      where.roadmapId = BigInt(roadmapId);
    }

    if (status) {
      where.status = status;
    }

    if (departmentId) {
      where.roadmap = {
        ...where.roadmap,
        departmentId: BigInt(departmentId),
      };
    }

    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      db.roadmapAssignment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { assignedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
              departmentId: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          roadmap: {
            select: {
              id: true,
              title: true,
              description: true,
              targetPosition: true,
              isActive: true,
              departmentId: true,
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
              _count: {
                select: {
                  roadmapCourses: true,
                },
              },
            },
          },
          assignedByUser: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
      db.roadmapAssignment.count({ where }),
    ]);

    return {
      assignments: assignments.map((a: any) => ({
        id: a.id.toString(),
        userId: a.userId.toString(),
        roadmapId: a.roadmapId.toString(),
        status: a.status,
        assignedAt: a.assignedAt.toISOString(),
        startedAt: a.startedAt?.toISOString() || null,
        completedAt: a.completedAt?.toISOString() || null,
        droppedAt: a.droppedAt?.toISOString() || null,
        user: {
          id: a.user.id.toString(),
          fullName: a.user.fullName,
          email: a.user.email,
          avatarUrl: a.user.avatarUrl,
          department: {
            id: a.user.department.id.toString(),
            name: a.user.department.name,
          },
        },
        roadmap: {
          id: a.roadmap.id.toString(),
          title: a.roadmap.title,
          description: a.roadmap.description,
          targetPosition: a.roadmap.targetPosition,
          isActive: a.roadmap.isActive,
          department: {
            id: a.roadmap.department.id.toString(),
            name: a.roadmap.department.name,
          },
          category: a.roadmap.category
            ? {
                id: a.roadmap.category.id.toString(),
                name: a.roadmap.category.name,
                slug: a.roadmap.category.slug,
              }
            : null,
          coursesCount: a.roadmap._count.roadmapCourses,
        },
        assignedBy: a.assignedByUser
          ? {
              id: a.assignedByUser.id.toString(),
              fullName: a.assignedByUser.fullName,
              email: a.assignedByUser.email,
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
}
