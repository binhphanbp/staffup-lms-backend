const API_PREFIX = '/api/v1';

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Staffup LMS Backend API',
    version: '1.0.0',
    description:
      'OpenAPI document for the Staffup LMS backend. This spec covers health, authentication, roles, departments, categories, tags, and course management.',
  },
  servers: [
    {
      url: '/',
      description: 'Current server origin',
    },
  ],
  tags: [
    {
      name: 'System',
      description: 'Service health and operational endpoints.',
    },
    {
      name: 'Auth',
      description:
        'Authentication, password changes, refresh/logout session flow, and current user profile.',
    },
    {
      name: 'Courses',
      description: 'Course management endpoints.',
    },
    {
      name: 'Roadmaps',
      description: 'Learning roadmap endpoints.',
    },
    {
      name: 'Enrollments',
      description: 'Enrollment and learning progress endpoints.',
    },
    {
      name: 'Categories',
      description: 'Category management for Courses and Roadmaps.',
    },
    {
      name: 'Roles',
      description: 'RBAC role management and permission mapping.',
    },
    {
      name: 'Tags',
      description: 'Tag management for Course organization.',
    },
    {
      name: 'Quiz Attempts',
      description: 'Quiz attempt management and submission endpoints.',
    },
    {
      name: 'Quizzes',
      description: 'Quiz CRUD operations for course and lesson quizzes.',
    },
    {
      name: 'Certificates',
      description: 'Certificate issuance and management endpoints.',
    },
    {
      name: 'Risk Assessments',
      description: 'Learner risk assessment ingestion and retrieval endpoints.',
    },
    {
      name: 'Dashboard',
      description: 'Dashboard statistics for different user roles.',
    },
    {
      name: 'Users',
      description:
        'User management — create, list, view, and update users. Admin only for write operations.',
    },
    {
      name: 'Question Banks',
      description: 'Question bank management. Trainers manage their own banks; admins manage all.',
    },
    {
      name: 'Questions',
      description:
        'Question management within a bank. Supports single_choice, multiple_choice, and essay types.',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Send the JWT access token in the Authorization header.',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        required: ['success', 'status', 'message'],
        properties: {
          success: { type: 'boolean', example: false },
          status: { type: 'string', example: 'fail' },
          message: { type: 'string', example: 'Invalid email or password.' },
          error: {
            description: 'Detailed error payload returned in development mode.',
          },
          stack: {
            type: 'string',
            description: 'Stack trace returned in development mode.',
          },
        },
      },
      HealthResponse: {
        type: 'object',
        required: ['success', 'message', 'timestamp'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Staffup LMS API is running' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['departmentId', 'fullName', 'email', 'password'],
        properties: {
          departmentId: {
            type: 'string',
            pattern: '^\\d+$',
            example: '1',
            description: 'Department ID as a numeric string.',
          },
          fullName: {
            type: 'string',
            minLength: 2,
            maxLength: 150,
            example: 'Nguyen Van A',
          },
          positionTitle: {
            type: 'string',
            maxLength: 150,
            example: 'Software Engineer',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@staffup.local',
          },
          password: {
            type: 'string',
            minLength: 8,
            example: 'ChangeMe123',
            description:
              'Must contain at least one lowercase letter, one uppercase letter, and one number.',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'admin@staffup.local',
          },
          password: {
            type: 'string',
            example: 'ChangeMe123',
          },
        },
      },
      RefreshRequest: {
        type: 'object',
        properties: {
          refreshToken: {
            type: 'string',
            description:
              'Optional refresh token override. When omitted, the API reads the httpOnly refresh cookie.',
          },
        },
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: {
            type: 'string',
            example: 'ChangeMe123',
          },
          newPassword: {
            type: 'string',
            minLength: 8,
            example: 'NewSecure123',
            description:
              'Must contain at least one lowercase letter, one uppercase letter, and one number.',
          },
        },
      },
      AuthUser: {
        type: 'object',
        required: ['id', 'email', 'fullName', 'roleCodes'],
        properties: {
          id: {
            type: 'string',
            pattern: '^\\d+$',
            example: '1',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'admin@staffup.local',
          },
          fullName: {
            type: 'string',
            example: 'System Administrator',
          },
          roleCodes: {
            type: 'array',
            items: { type: 'string' },
            example: ['admin'],
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      AuthPayload: {
        type: 'object',
        required: ['user', 'token'],
        properties: {
          user: {
            $ref: '#/components/schemas/AuthUser',
          },
          token: {
            type: 'string',
            description: 'JWT access token.',
          },
          refreshTokenExpiresAt: {
            type: 'string',
            format: 'date-time',
            description: 'Expiration time of the rotated refresh session cookie.',
          },
        },
      },
      AuthSuccessResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Login successful' },
          data: {
            $ref: '#/components/schemas/AuthPayload',
          },
        },
      },
      DepartmentSummary: {
        type: 'object',
        required: ['id', 'name'],
        properties: {
          id: {
            type: 'string',
            pattern: '^\\d+$',
            example: '1',
          },
          name: {
            type: 'string',
            example: 'Engineering',
          },
        },
      },
      RoleSummary: {
        type: 'object',
        required: ['code', 'name'],
        properties: {
          code: {
            type: 'string',
            example: 'trainer',
          },
          name: {
            type: 'string',
            example: 'Trainer',
          },
        },
      },
      ProfileUser: {
        type: 'object',
        required: ['id', 'email', 'fullName', 'userRoles', 'createdAt', 'updatedAt'],
        properties: {
          id: {
            type: 'string',
            pattern: '^\\d+$',
            example: '1',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'trainer@staffup.local',
          },
          fullName: {
            type: 'string',
            example: 'Trainer User',
          },
          positionTitle: {
            type: 'string',
            nullable: true,
            example: 'Senior Trainer',
          },
          avatarUrl: {
            type: 'string',
            format: 'uri',
            nullable: true,
          },
          department: {
            anyOf: [{ $ref: '#/components/schemas/DepartmentSummary' }, { type: 'null' }],
          },
          userRoles: {
            type: 'array',
            items: { $ref: '#/components/schemas/RoleSummary' },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      ProfileSuccessResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Profile retrieved successfully' },
          data: {
            $ref: '#/components/schemas/ProfileUser',
          },
        },
      },
      AssignUserRolesRequest: {
        type: 'object',
        required: ['roleCodes'],
        properties: {
          roleCodes: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'string',
              pattern: '^[a-z][a-z0-9_]*$',
              example: 'trainer',
            },
            example: ['trainer', 'employee'],
          },
        },
      },
      EffectivePermission: {
        type: 'object',
        required: ['id', 'code', 'module', 'action'],
        properties: {
          id: { type: 'string', pattern: '^\\d+$', example: '12' },
          code: { type: 'string', example: 'course.read' },
          module: { type: 'string', example: 'course' },
          action: { type: 'string', example: 'read' },
          description: { type: 'string', nullable: true, example: 'Read course data' },
        },
      },
      AssignedRole: {
        type: 'object',
        required: ['id', 'code', 'name', 'isSystem', 'assignedAt'],
        properties: {
          id: { type: 'string', pattern: '^\\d+$', example: '2' },
          code: { type: 'string', example: 'trainer' },
          name: { type: 'string', example: 'Trainer' },
          description: { type: 'string', nullable: true, example: 'Course and quiz authoring' },
          isSystem: { type: 'boolean', example: true },
          assignedAt: { type: 'string', format: 'date-time' },
          assignedByUser: {
            anyOf: [
              {
                type: 'object',
                required: ['id', 'email', 'fullName'],
                properties: {
                  id: { type: 'string', pattern: '^\\d+$', example: '1' },
                  email: { type: 'string', format: 'email', example: 'admin@staffup.local' },
                  fullName: { type: 'string', example: 'System Administrator' },
                },
              },
              { type: 'null' },
            ],
          },
        },
      },
      EffectivePermissionsUser: {
        type: 'object',
        required: [
          'id',
          'email',
          'fullName',
          'isActive',
          'roleCodes',
          'roles',
          'effectivePermissionCodes',
          'effectivePermissions',
        ],
        properties: {
          id: { type: 'string', pattern: '^\\d+$', example: '5' },
          email: { type: 'string', format: 'email', example: 'trainer@staffup.local' },
          fullName: { type: 'string', example: 'Trainer User' },
          isActive: { type: 'boolean', example: true },
          roleCodes: {
            type: 'array',
            items: { type: 'string' },
            example: ['employee', 'trainer'],
          },
          roles: {
            type: 'array',
            items: { $ref: '#/components/schemas/AssignedRole' },
          },
          effectivePermissionCodes: {
            type: 'array',
            items: { type: 'string' },
            example: ['course.read', 'quiz.create', 'quiz.grade'],
          },
          effectivePermissions: {
            type: 'array',
            items: { $ref: '#/components/schemas/EffectivePermission' },
          },
        },
      },
      EffectivePermissionsSuccessResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Effective permissions retrieved successfully' },
          data: { $ref: '#/components/schemas/EffectivePermissionsUser' },
        },
      },
      MessageSuccessResponse: {
        type: 'object',
        required: ['success', 'message'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Logout successful' },
          data: {
            nullable: true,
            example: null,
          },
        },
      },
      TrainerSummary: {
        type: 'object',
        required: ['id', 'fullName'],
        properties: {
          id: {
            type: 'string',
            pattern: '^\\d+$',
            example: '2',
          },
          fullName: {
            type: 'string',
            example: 'Trainer User',
          },
          email: {
            type: 'string',
            format: 'email',
            nullable: true,
          },
        },
      },
      CourseCounts: {
        type: 'object',
        required: ['modules', 'enrollments'],
        properties: {
          modules: { type: 'integer', example: 6 },
          enrollments: { type: 'integer', example: 120 },
        },
      },
      CourseListItem: {
        type: 'object',
        required: ['id', 'trainerUserId', 'title', 'slug', 'status', 'createdAt', 'updatedAt'],
        properties: {
          id: {
            type: 'string',
            pattern: '^\\d+$',
            example: '10',
          },
          ownerDepartmentId: {
            type: 'string',
            pattern: '^\\d+$',
            nullable: true,
          },
          trainerUserId: {
            type: 'string',
            pattern: '^\\d+$',
            example: '2',
          },
          categoryId: {
            type: 'string',
            pattern: '^\\d+$',
            nullable: true,
          },
          title: {
            type: 'string',
            example: 'Node.js Basics',
          },
          slug: {
            type: 'string',
            example: 'node-js-basics',
          },
          description: {
            type: 'string',
            nullable: true,
          },
          thumbnailUrl: {
            type: 'string',
            format: 'uri',
            nullable: true,
          },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived'],
            example: 'draft',
          },
          estimatedDurationMinutes: {
            type: 'integer',
            nullable: true,
            example: 90,
          },
          publishedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
          trainerUser: {
            $ref: '#/components/schemas/TrainerSummary',
          },
          _count: {
            $ref: '#/components/schemas/CourseCounts',
          },
        },
      },
      Lesson: {
        type: 'object',
        required: ['id', 'moduleId', 'title', 'lessonType', 'durationSeconds', 'orderIndex'],
        properties: {
          id: {
            type: 'string',
            pattern: '^\\d+$',
            example: '100',
          },
          moduleId: {
            type: 'string',
            pattern: '^\\d+$',
            example: '20',
          },
          title: {
            type: 'string',
            example: 'Intro to the course',
          },
          lessonType: {
            type: 'string',
            enum: ['video', 'article', 'quiz'],
            example: 'video',
          },
          contentText: {
            type: 'string',
            nullable: true,
          },
          videoUrl: {
            type: 'string',
            format: 'uri',
            nullable: true,
          },
          durationSeconds: {
            type: 'integer',
            example: 420,
          },
          orderIndex: {
            type: 'integer',
            example: 1,
          },
          isPreview: {
            type: 'boolean',
            example: false,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      Module: {
        type: 'object',
        required: ['id', 'courseId', 'title', 'orderIndex', 'lessons'],
        properties: {
          id: {
            type: 'string',
            pattern: '^\\d+$',
            example: '20',
          },
          courseId: {
            type: 'string',
            pattern: '^\\d+$',
            example: '10',
          },
          title: {
            type: 'string',
            example: 'Getting Started',
          },
          orderIndex: {
            type: 'integer',
            example: 1,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
          lessons: {
            type: 'array',
            items: { $ref: '#/components/schemas/Lesson' },
          },
        },
      },
      CourseDetail: {
        allOf: [
          { $ref: '#/components/schemas/CourseListItem' },
          {
            type: 'object',
            properties: {
              modules: {
                type: 'array',
                items: { $ref: '#/components/schemas/Module' },
              },
            },
          },
        ],
      },
      PaginationMeta: {
        type: 'object',
        required: ['total', 'page', 'limit', 'totalPages'],
        properties: {
          total: { type: 'integer', example: 24 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 3 },
        },
      },
      UserResponse: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1' },
          fullName: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          positionTitle: { type: 'string', nullable: true, example: 'Software Engineer' },
          avatarUrl: { type: 'string', nullable: true },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          department: {
            type: 'object',
            nullable: true,
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
            },
          },
          roles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                code: { type: 'string' },
                name: { type: 'string' },
              },
            },
          },
        },
      },
      PaginatedCourses: {
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/CourseListItem' },
          },
          meta: {
            $ref: '#/components/schemas/PaginationMeta',
          },
        },
      },
      CourseListSuccessResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Courses retrieved successfully' },
          data: {
            $ref: '#/components/schemas/PaginatedCourses',
          },
        },
      },
      CourseSuccessResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Course retrieved successfully' },
          data: {
            $ref: '#/components/schemas/CourseDetail',
          },
        },
      },
      CreateCourseRequest: {
        type: 'object',
        required: ['title'],
        properties: {
          title: {
            type: 'string',
            minLength: 3,
            maxLength: 200,
            example: 'Node.js Basics',
          },
          description: {
            type: 'string',
            maxLength: 5000,
            example: 'Foundational backend concepts for internal engineers.',
          },
          thumbnailUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://cdn.example.com/images/node-course.png',
          },
          categoryId: {
            type: 'string',
            pattern: '^\\d+$',
            example: '3',
          },
          ownerDepartmentId: {
            type: 'string',
            pattern: '^\\d+$',
            example: '1',
          },
          estimatedDurationMinutes: {
            type: 'integer',
            minimum: 1,
            example: 90,
          },
        },
      },
      UpdateCourseRequest: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            minLength: 3,
            maxLength: 200,
            example: 'Node.js Basics Updated',
          },
          description: {
            type: 'string',
            maxLength: 5000,
          },
          thumbnailUrl: {
            type: 'string',
            format: 'uri',
          },
          categoryId: {
            type: 'string',
            pattern: '^\\d+$',
          },
          ownerDepartmentId: {
            type: 'string',
            pattern: '^\\d+$',
          },
          estimatedDurationMinutes: {
            type: 'integer',
            minimum: 1,
          },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived'],
          },
        },
      },
      Department: {
        type: 'object',
        required: ['id', 'name', 'isActive', 'createdAt', 'updatedAt'],
        properties: {
          id: {
            type: 'string',
            pattern: '^\\d+$',
            example: '1',
          },
          name: {
            type: 'string',
            example: 'Engineering',
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          managerUserId: {
            type: 'string',
            pattern: '^\\d+$',
            nullable: true,
            example: '1',
          },
          manager: {
            anyOf: [{ $ref: '#/components/schemas/TrainerSummary' }, { type: 'null' }],
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      DepartmentUser: {
        type: 'object',
        required: ['id', 'fullName', 'email', 'isActive', 'createdAt'],
        properties: {
          id: {
            type: 'string',
            pattern: '^\\d+$',
            example: '5',
          },
          fullName: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@staffup.local',
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
          roles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                role: { $ref: '#/components/schemas/RoleSummary' },
              },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      DepartmentRoadmap: {
        type: 'object',
        required: ['id', 'title'],
        properties: {
          id: {
            type: 'string',
            pattern: '^\\d+$',
            example: '1',
          },
          title: {
            type: 'string',
            example: 'Backend Roadmap',
          },
        },
      },
      DepartmentCourse: {
        type: 'object',
        required: ['id', 'title', 'slug', 'status'],
        properties: {
          id: {
            type: 'string',
            pattern: '^\\d+$',
            example: '10',
          },
          title: {
            type: 'string',
            example: 'Node.js Basics',
          },
          slug: {
            type: 'string',
            example: 'node-js-basics',
          },
          thumbnailUrl: {
            type: 'string',
            format: 'uri',
            nullable: true,
          },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived'],
          },
          estimatedDurationMinutes: {
            type: 'integer',
            nullable: true,
          },
        },
      },
      DepartmentDetail: {
        allOf: [
          { $ref: '#/components/schemas/Department' },
          {
            type: 'object',
            properties: {
              users: {
                type: 'array',
                items: { $ref: '#/components/schemas/TrainerSummary' },
              },
              roadmaps: {
                type: 'array',
                items: { $ref: '#/components/schemas/DepartmentRoadmap' },
              },
              ownedCourses: {
                type: 'array',
                items: { $ref: '#/components/schemas/DepartmentCourse' },
              },
            },
          },
        ],
      },
      PaginatedDepartmentUsers: {
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/DepartmentUser' },
          },
          meta: {
            $ref: '#/components/schemas/PaginationMeta',
          },
        },
      },
      CreateDepartmentRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            example: 'Marketing',
          },
          isActive: {
            type: 'boolean',
            default: true,
          },
          managerUserId: {
            type: 'string',
            pattern: '^\\d+$',
            nullable: true,
          },
        },
      },
      UpdateDepartmentRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
          },
          isActive: {
            type: 'boolean',
          },
          managerUserId: {
            type: 'string',
            pattern: '^\\d+$',
            nullable: true,
          },
        },
      },
      DepartmentListResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Departments retrieved successfully' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Department' },
          },
        },
      },
      DepartmentDetailResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Department retrieved successfully' },
          data: { $ref: '#/components/schemas/DepartmentDetail' },
        },
      },
      DepartmentUsersResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Department users retrieved successfully' },
          data: { $ref: '#/components/schemas/PaginatedDepartmentUsers' },
        },
      },
      RolePermission: {
        type: 'object',
        required: ['id', 'code', 'module', 'action'],
        properties: {
          id: {
            type: 'string',
            pattern: '^\\d+$',
            example: '1',
          },
          code: {
            type: 'string',
            example: 'course.read',
          },
          module: {
            type: 'string',
            example: 'course',
          },
          action: {
            type: 'string',
            example: 'read',
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Read course data',
          },
        },
      },
      RoleEntity: {
        type: 'object',
        required: [
          'id',
          'code',
          'name',
          'isSystem',
          'userCount',
          'permissionCount',
          'permissions',
          'createdAt',
          'updatedAt',
        ],
        properties: {
          id: {
            type: 'string',
            pattern: '^\\d+$',
            example: '5',
          },
          code: {
            type: 'string',
            example: 'qa_lead',
          },
          name: {
            type: 'string',
            example: 'QA Lead',
          },
          description: {
            type: 'string',
            nullable: true,
            example: 'Owns test strategy and release quality gates.',
          },
          isSystem: {
            type: 'boolean',
            example: false,
          },
          userCount: {
            type: 'integer',
            example: 2,
          },
          permissionCount: {
            type: 'integer',
            example: 3,
          },
          permissions: {
            type: 'array',
            items: { $ref: '#/components/schemas/RolePermission' },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      CreateRoleRequest: {
        type: 'object',
        required: ['code', 'name'],
        properties: {
          code: {
            type: 'string',
            pattern: '^[a-z][a-z0-9_]*$',
            example: 'qa_lead',
          },
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            example: 'QA Lead',
          },
          description: {
            type: 'string',
            maxLength: 500,
            nullable: true,
            example: 'Owns test strategy and release quality gates.',
          },
          permissionCodes: {
            type: 'array',
            items: {
              type: 'string',
              example: 'course.read',
            },
            example: ['course.read', 'user.read'],
          },
        },
      },
      UpdateRoleRequest: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            pattern: '^[a-z][a-z0-9_]*$',
            example: 'qa_manager',
          },
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 100,
            example: 'QA Manager',
          },
          description: {
            type: 'string',
            maxLength: 500,
            nullable: true,
          },
          permissionCodes: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['course.read', 'course.update', 'user.read'],
          },
        },
      },
      RoleListResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Roles retrieved successfully' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/RoleEntity' },
          },
        },
      },
      RoleDetailResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Role retrieved successfully' },
          data: { $ref: '#/components/schemas/RoleEntity' },
        },
      },
      PermissionEntity: {
        allOf: [
          { $ref: '#/components/schemas/RolePermission' },
          {
            type: 'object',
            required: ['roleCount', 'createdAt'],
            properties: {
              roleCount: {
                type: 'integer',
                example: 2,
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
        ],
      },
      CreatePermissionRequest: {
        type: 'object',
        required: ['code', 'module', 'action'],
        properties: {
          code: {
            type: 'string',
            pattern: '^[a-z][a-z0-9_.]*$',
            example: 'course.publish',
          },
          module: {
            type: 'string',
            pattern: '^[a-z][a-z0-9_]*$',
            example: 'course',
          },
          action: {
            type: 'string',
            pattern: '^[a-z][a-z0-9_]*$',
            example: 'publish',
          },
          description: {
            type: 'string',
            maxLength: 500,
            nullable: true,
            example: 'Publish courses',
          },
        },
      },
      UpdatePermissionRequest: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            pattern: '^[a-z][a-z0-9_.]*$',
            example: 'course.archive',
          },
          module: {
            type: 'string',
            pattern: '^[a-z][a-z0-9_]*$',
            example: 'course',
          },
          action: {
            type: 'string',
            pattern: '^[a-z][a-z0-9_]*$',
            example: 'archive',
          },
          description: {
            type: 'string',
            maxLength: 500,
            nullable: true,
            example: 'Archive courses',
          },
        },
      },
      PermissionListResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Permissions retrieved successfully' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/PermissionEntity' },
          },
        },
      },
      PermissionDetailResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Permission retrieved successfully' },
          data: { $ref: '#/components/schemas/PermissionEntity' },
        },
      },
      Category: {
        type: 'object',
        required: ['id', 'name', 'slug', 'isActive', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string', pattern: '^\\d+$', example: '1' },
          parentId: { type: 'string', pattern: '^\\d+$', nullable: true, example: null },
          name: { type: 'string', example: 'Software Engineering' },
          slug: { type: 'string', example: 'software-engineering' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          children: {
            type: 'array',
            items: { $ref: '#/components/schemas/Category' },
          },
          _count: {
            type: 'object',
            properties: {
              children: { type: 'integer', example: 2 },
              courses: { type: 'integer', example: 5 },
              roadmaps: { type: 'integer', example: 1 },
            },
          },
        },
      },
      CreateCategoryRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 150, example: 'Mobile Development' },
          parentId: { type: 'string', pattern: '^\\d+$', nullable: true },
          isActive: { type: 'boolean', default: true },
        },
      },
      UpdateCategoryRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 150 },
          parentId: { type: 'string', pattern: '^\\d+$', nullable: true },
          isActive: { type: 'boolean' },
        },
      },
      CategoryListResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Categories retrieved successfully' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Category' },
          },
        },
      },
      CategoryResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Category operation successful' },
          data: { $ref: '#/components/schemas/Category' },
        },
      },
      Tag: {
        type: 'object',
        required: ['id', 'name', 'slug', 'createdAt'],
        properties: {
          id: { type: 'string', pattern: '^\\d+$', example: '1' },
          name: { type: 'string', example: 'Node.js' },
          slug: { type: 'string', example: 'node-js' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateTagRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100, example: 'Node.js' },
        },
      },
      UpdateTagRequest: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100, example: 'TypeScript' },
        },
      },
      TagListResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Tags retrieved successfully' },
          data: {
            type: 'object',
            required: ['data', 'meta'],
            properties: {
              data: {
                type: 'array',
                items: { $ref: '#/components/schemas/Tag' },
              },
              meta: { $ref: '#/components/schemas/PaginationMeta' },
            },
          },
        },
      },
      TagResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Tag operation successful' },
          data: { $ref: '#/components/schemas/Tag' },
        },
      },
      QuestionOption: {
        type: 'object',
        required: ['id', 'questionId', 'content', 'isCorrect', 'orderIndex'],
        properties: {
          id: { type: 'string', example: '1' },
          questionId: { type: 'string', example: '10' },
          content: { type: 'string', example: 'Paris' },
          isCorrect: { type: 'boolean', example: true },
          orderIndex: { type: 'integer', example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Question: {
        type: 'object',
        required: ['id', 'questionBankId', 'questionType', 'content', 'defaultPoints', 'isActive'],
        properties: {
          id: { type: 'string', example: '10' },
          questionBankId: { type: 'string', example: '1' },
          questionType: {
            type: 'string',
            enum: ['single_choice', 'multiple_choice', 'essay'],
            example: 'single_choice',
          },
          content: { type: 'string', example: 'What is the capital of France?' },
          explanation: {
            type: 'string',
            nullable: true,
            example: 'Paris is the capital city of France.',
          },
          defaultPoints: { type: 'integer', example: 1 },
          isActive: { type: 'boolean', example: true },
          options: { type: 'array', items: { $ref: '#/components/schemas/QuestionOption' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      QuestionBank: {
        type: 'object',
        required: ['id', 'ownerTrainerId', 'title', 'isActive', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string', example: '1' },
          title: { type: 'string', example: 'JavaScript Fundamentals' },
          description: { type: 'string', nullable: true, example: 'Questions covering JS basics.' },
          categoryId: { type: 'string', nullable: true, example: '3' },
          ownerTrainerId: { type: 'string', example: '2' },
          isActive: { type: 'boolean', example: true },
          ownerTrainer: { $ref: '#/components/schemas/TrainerSummary' },
          category: {
            nullable: true,
            type: 'object',
            properties: {
              id: { type: 'string', example: '3' },
              name: { type: 'string', example: 'Programming' },
            },
          },
          _count: {
            type: 'object',
            properties: { questions: { type: 'integer', example: 20 } },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      PaginatedQuestionBanks: {
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/QuestionBank' } },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      PaginatedQuestions: {
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: { type: 'array', items: { $ref: '#/components/schemas/Question' } },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      CreateQuestionBankRequest: {
        type: 'object',
        required: ['title'],
        properties: {
          title: {
            type: 'string',
            minLength: 2,
            maxLength: 200,
            example: 'JavaScript Fundamentals',
          },
          description: { type: 'string', example: 'Questions covering JS basics.' },
          categoryId: { type: 'string', nullable: true, example: '3' },
          isActive: { type: 'boolean', default: true },
        },
      },
      UpdateQuestionBankRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 2, maxLength: 200 },
          description: { type: 'string', nullable: true },
          categoryId: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
        },
      },
      QuestionOptionInput: {
        type: 'object',
        required: ['content', 'isCorrect', 'orderIndex'],
        properties: {
          content: { type: 'string', example: 'Paris' },
          isCorrect: { type: 'boolean', example: true },
          orderIndex: { type: 'integer', example: 1 },
        },
      },
      CreateQuestionRequest: {
        type: 'object',
        required: ['questionType', 'content'],
        description:
          'Business rules: essay must NOT include options. single_choice/multiple_choice require at least 2 options. single_choice must have exactly 1 correct option. multiple_choice must have at least 1 correct option.',
        properties: {
          questionType: {
            type: 'string',
            enum: ['single_choice', 'multiple_choice', 'essay'],
            example: 'single_choice',
          },
          content: { type: 'string', example: 'What is the capital of France?' },
          explanation: { type: 'string', nullable: true },
          defaultPoints: { type: 'integer', minimum: 1, default: 1 },
          options: {
            type: 'array',
            items: { $ref: '#/components/schemas/QuestionOptionInput' },
            description:
              'Required for single_choice (exactly 1 correct) and multiple_choice (at least 1 correct). Must NOT be provided for essay.',
          },
        },
      },
      UpdateQuestionRequest: {
        type: 'object',
        description:
          'Updates question metadata only (content, explanation, defaultPoints). To manage options use the dedicated /options endpoints.',
        properties: {
          content: { type: 'string' },
          explanation: { type: 'string', nullable: true },
          defaultPoints: { type: 'integer', minimum: 1 },
        },
      },
      CreateOptionRequest: {
        type: 'object',
        required: ['content', 'isCorrect', 'orderIndex'],
        description:
          'Add an option to a single_choice or multiple_choice question. Business rules: essay questions cannot have options. single_choice cannot have more than 1 correct option.',
        properties: {
          content: { type: 'string', example: 'Paris' },
          isCorrect: { type: 'boolean', example: true },
          orderIndex: { type: 'integer', minimum: 1, example: 1 },
        },
      },
      UpdateOptionRequest: {
        type: 'object',
        description:
          'Update an option. Business rules: cannot unset the only correct option on single_choice. Cannot set isCorrect=true if another correct option already exists on single_choice.',
        properties: {
          content: { type: 'string', example: 'London' },
          isCorrect: { type: 'boolean', example: false },
          orderIndex: { type: 'integer', minimum: 1, example: 2 },
        },
      },
    },
  },
  paths: {
    [`${API_PREFIX}/health`]: {
      get: {
        tags: ['System'],
        summary: 'Health check',
        operationId: 'healthCheck',
        responses: {
          '200': {
            description: 'Service is healthy.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/auth/register`]: {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        operationId: 'registerUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RegisterRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User registered successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthSuccessResponse',
                },
              },
            },
          },
          '400': {
            description: 'Validation failed.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '409': {
            description: 'Email already exists.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/auth/login`]: {
      post: {
        tags: ['Auth'],
        summary: 'Log in with email and password',
        operationId: 'loginUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthSuccessResponse',
                },
              },
            },
          },
          '400': {
            description: 'Validation failed.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Invalid credentials.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Account is deactivated.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/auth/refresh`]: {
      post: {
        tags: ['Auth'],
        summary: 'Refresh the access token',
        description:
          'Rotates the refresh session and returns a fresh access token. By default the API reads the refresh token from the httpOnly cookie.',
        operationId: 'refreshAccessToken',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RefreshRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Token refreshed successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/AuthSuccessResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing, invalid, or expired refresh token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Account is deactivated.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/auth/logout`]: {
      post: {
        tags: ['Auth'],
        summary: 'Log out the current refresh session',
        description:
          'Revokes the current refresh session when a refresh token cookie or request body token is present, then clears the cookie.',
        operationId: 'logoutUser',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RefreshRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Logout completed successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageSuccessResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/auth/change-password`]: {
      patch: {
        tags: ['Auth'],
        summary: 'Change the current user password',
        description:
          'Requires a valid access token. Verifies the current password, updates the password hash, revokes all refresh sessions for the user, and clears the refresh cookie.',
        operationId: 'changePassword',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ChangePasswordRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Password changed successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MessageSuccessResponse',
                },
              },
            },
          },
          '400': {
            description:
              'Validation failed, current password is incorrect, or new password matches current password.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Account is deactivated.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/auth/me`]: {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        operationId: 'getCurrentUserProfile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Authenticated user profile.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProfileSuccessResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Account is deactivated.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/auth/me/effective-permissions`]: {
      get: {
        tags: ['Auth'],
        summary: 'Get current user effective permissions',
        operationId: 'getMyEffectivePermissions',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Current user effective permissions.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EffectivePermissionsSuccessResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Account is deactivated.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/auth/users/{id}/roles`]: {
      put: {
        tags: ['Auth'],
        summary: 'Assign roles to a user',
        description:
          'Requires the `admin` role. Replaces the user role set with the supplied role codes.',
        operationId: 'assignUserRoles',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AssignUserRolesRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User roles updated successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EffectivePermissionsSuccessResponse',
                },
              },
            },
          },
          '400': {
            description: 'Validation failed or one or more role codes are invalid.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Insufficient role.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'User not found.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/auth/users/{id}/effective-permissions`]: {
      get: {
        tags: ['Auth'],
        summary: 'Get a user effective permissions',
        description: 'Requires the `admin` role.',
        operationId: 'getUserEffectivePermissions',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
          },
        ],
        responses: {
          '200': {
            description: 'User effective permissions retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/EffectivePermissionsSuccessResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Insufficient role.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'User not found.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/courses`]: {
      get: {
        tags: ['Courses'],
        summary: 'List courses',
        operationId: 'listCourses',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
            description: 'Page number.',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            description: 'Items per page.',
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['title', 'createdAt', 'updatedAt'],
              default: 'createdAt',
            },
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['asc', 'desc'],
              default: 'desc',
            },
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
            },
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Course list returned successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CourseListSuccessResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Courses'],
        summary: 'Create a course',
        description: 'Requires the `admin` or `trainer` role.',
        operationId: 'createCourse',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateCourseRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Course created successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CourseSuccessResponse',
                },
              },
            },
          },
          '400': {
            description: 'Validation failed.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Insufficient role.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/courses/{id}`]: {
      get: {
        tags: ['Courses'],
        summary: 'Get a course by ID',
        operationId: 'getCourseById',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
            description: 'Course ID as a numeric string.',
          },
        ],
        responses: {
          '200': {
            description: 'Course returned successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CourseSuccessResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Course not found.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Courses'],
        summary: 'Update a course',
        description: 'Requires the `admin` role or ownership of the course.',
        operationId: 'updateCourse',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
            description: 'Course ID as a numeric string.',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateCourseRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Course updated successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CourseSuccessResponse',
                },
              },
            },
          },
          '400': {
            description: 'Validation failed.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Insufficient role or ownership.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Course not found.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Courses'],
        summary: 'Delete a course',
        description: 'Requires the `admin` role or ownership of the course.',
        operationId: 'deleteCourse',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
            description: 'Course ID as a numeric string.',
          },
        ],
        responses: {
          '204': {
            description: 'Course deleted successfully.',
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Insufficient role or ownership.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Course not found.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/courses/{id}/detail`]: {
      get: {
        tags: ['Courses'],
        summary: 'Get course detail with user enrollment',
        description:
          'Get detailed course information including modules, lessons, and user-specific enrollment data',
        operationId: 'getCourseDetail',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Course ID',
          },
        ],
        responses: {
          '200': {
            description: 'Course detail retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        slug: { type: 'string' },
                        description: { type: 'string', nullable: true },
                        thumbnailUrl: { type: 'string', nullable: true },
                        status: { type: 'string', enum: ['draft', 'published', 'archived'] },
                        estimatedDurationMinutes: { type: 'number', nullable: true },
                        publishedAt: { type: 'string', format: 'date-time', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        trainer: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            fullName: { type: 'string' },
                            email: { type: 'string' },
                            avatarUrl: { type: 'string', nullable: true },
                          },
                        },
                        category: {
                          type: 'object',
                          nullable: true,
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            slug: { type: 'string' },
                          },
                        },
                        ownerDepartment: {
                          type: 'object',
                          nullable: true,
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                          },
                        },
                        tags: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              name: { type: 'string' },
                              slug: { type: 'string' },
                            },
                          },
                        },
                        modules: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              title: { type: 'string' },
                              orderIndex: { type: 'number' },
                              lessons: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    id: { type: 'string' },
                                    title: { type: 'string' },
                                    lessonType: {
                                      type: 'string',
                                      enum: ['video', 'article', 'quiz'],
                                    },
                                    durationSeconds: { type: 'number' },
                                    orderIndex: { type: 'number' },
                                    isPreview: { type: 'boolean' },
                                    videoUrl: { type: 'string', nullable: true },
                                    contentText: { type: 'string', nullable: true },
                                    resources: {
                                      type: 'array',
                                      items: {
                                        type: 'object',
                                        properties: {
                                          id: { type: 'string' },
                                          fileName: { type: 'string' },
                                          fileUrl: { type: 'string' },
                                          resourceType: { type: 'string', nullable: true },
                                          orderIndex: { type: 'number' },
                                        },
                                      },
                                    },
                                    quiz: {
                                      type: 'object',
                                      nullable: true,
                                      properties: {
                                        id: { type: 'string' },
                                        title: { type: 'string' },
                                        description: { type: 'string', nullable: true },
                                        totalQuestions: { type: 'number' },
                                        passScorePercent: { type: 'number' },
                                        timeLimitMinutes: { type: 'number', nullable: true },
                                        maxAttempts: { type: 'number', nullable: true },
                                        shuffleQuestions: { type: 'boolean' },
                                        shuffleOptions: { type: 'boolean' },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        stats: {
                          type: 'object',
                          properties: {
                            totalModules: { type: 'number' },
                            totalLessons: { type: 'number' },
                            totalDurationMinutes: { type: 'number' },
                            totalEnrollments: { type: 'number' },
                          },
                        },
                        userEnrollment: {
                          type: 'object',
                          nullable: true,
                          properties: {
                            enrollmentId: { type: 'string' },
                            status: {
                              type: 'string',
                              enum: [
                                'assigned',
                                'in_progress',
                                'completed',
                                'cancelled',
                                'expired',
                              ],
                            },
                            progressPercent: { type: 'number' },
                            completedLessonsCount: { type: 'number' },
                            timeSpentSeconds: { type: 'number' },
                            enrolledAt: { type: 'string', format: 'date-time' },
                            startedAt: { type: 'string', format: 'date-time', nullable: true },
                            completedAt: { type: 'string', format: 'date-time', nullable: true },
                            assignmentNote: { type: 'string', nullable: true },
                            dueAt: { type: 'string', format: 'date-time', nullable: true },
                          },
                        },
                      },
                    },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Course not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/roadmaps`]: {
      get: {
        tags: ['Roadmaps'],
        summary: 'List roadmaps with filters',
        description:
          'Get list of roadmaps with optional filters by department, category, or active status.',
        operationId: 'listRoadmaps',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'departmentId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by department ID',
          },
          {
            name: 'categoryId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by category ID',
          },
          {
            name: 'isActive',
            in: 'query',
            schema: { type: 'string', enum: ['true', 'false'] },
            description: 'Filter by active status',
          },
          { name: 'page', in: 'query', schema: { type: 'string', default: '1' } },
          { name: 'limit', in: 'query', schema: { type: 'string', default: '20' } },
        ],
        responses: {
          '200': {
            description: 'Roadmaps retrieved successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
      post: {
        tags: ['Roadmaps'],
        summary: 'Create roadmap',
        description: 'Create a new learning roadmap. Only admin or department manager can create.',
        operationId: 'createRoadmap',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['departmentId', 'title'],
                properties: {
                  departmentId: { type: 'string', example: '162' },
                  categoryId: { type: 'string', example: '169' },
                  title: { type: 'string', example: 'Backend Developer Roadmap' },
                  description: {
                    type: 'string',
                    example: 'Complete learning path for backend developers',
                  },
                  targetPosition: { type: 'string', example: 'Senior Backend Developer' },
                  isActive: { type: 'boolean', default: true },
                  courses: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        courseId: { type: 'string', example: '155' },
                        orderIndex: { type: 'number', example: 1 },
                        isRequired: { type: 'boolean', default: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Roadmap created successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '403': { description: 'Permission denied - must be admin or department manager' },
          '404': { description: 'Department or category not found' },
        },
      },
    },
    [`${API_PREFIX}/roadmaps/{id}`]: {
      get: {
        tags: ['Roadmaps'],
        summary: 'Get roadmap by ID',
        description: 'Get roadmap details including courses and assignment count.',
        operationId: 'getRoadmapById',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Roadmap retrieved successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '404': { description: 'Roadmap not found' },
        },
      },
      put: {
        tags: ['Roadmaps'],
        summary: 'Update roadmap',
        description: 'Update roadmap settings. Only admin or department manager can update.',
        operationId: 'updateRoadmap',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  categoryId: { type: 'string' },
                  targetPosition: { type: 'string' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Roadmap updated successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '403': { description: 'Permission denied' },
          '404': { description: 'Roadmap not found' },
        },
      },
      delete: {
        tags: ['Roadmaps'],
        summary: 'Delete roadmap',
        description: 'Delete roadmap. Only admin or department manager can delete.',
        operationId: 'deleteRoadmap',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Roadmap deleted successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '403': { description: 'Permission denied' },
          '404': { description: 'Roadmap not found' },
        },
      },
    },
    [`${API_PREFIX}/roadmaps/{roadmapId}/courses`]: {
      post: {
        tags: ['Roadmaps'],
        summary: 'Add course to roadmap',
        description:
          'Add a course to roadmap. Prevents duplicates. Only admin or department manager can add.',
        operationId: 'addCourseToRoadmap',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'roadmapId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['courseId'],
                properties: {
                  courseId: { type: 'string', example: '155' },
                  orderIndex: { type: 'number', example: 1 },
                  isRequired: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Course added successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '400': { description: 'Course already in roadmap or order index conflict' },
          '403': { description: 'Permission denied' },
          '404': { description: 'Roadmap or course not found' },
        },
      },
    },
    [`${API_PREFIX}/roadmaps/{roadmapId}/courses/{courseId}`]: {
      put: {
        tags: ['Roadmaps'],
        summary: 'Update roadmap course settings',
        description: 'Update course order index or isRequired flag.',
        operationId: 'updateRoadmapCourse',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'roadmapId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'courseId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  orderIndex: { type: 'number' },
                  isRequired: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Roadmap course updated successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '400': { description: 'Order index conflict' },
          '403': { description: 'Permission denied' },
          '404': { description: 'Roadmap or course not found' },
        },
      },
      delete: {
        tags: ['Roadmaps'],
        summary: 'Remove course from roadmap',
        description: 'Remove a course from roadmap.',
        operationId: 'removeCourseFromRoadmap',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'roadmapId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'courseId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Course removed successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '403': { description: 'Permission denied' },
          '404': { description: 'Roadmap or course not found' },
        },
      },
    },
    [`${API_PREFIX}/roadmaps/{roadmapId}/courses/reorder`]: {
      post: {
        tags: ['Roadmaps'],
        summary: 'Reorder roadmap courses',
        description: 'Batch update course order indices. All courses must exist in roadmap.',
        operationId: 'reorderRoadmapCourses',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'roadmapId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['courseOrders'],
                properties: {
                  courseOrders: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        courseId: { type: 'string', example: '155' },
                        orderIndex: { type: 'number', example: 1 },
                      },
                    },
                    example: [
                      { courseId: '157', orderIndex: 1 },
                      { courseId: '161', orderIndex: 2 },
                    ],
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Courses reordered successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '403': { description: 'Permission denied' },
          '404': { description: 'Roadmap or courses not found' },
        },
      },
    },
    [`${API_PREFIX}/roadmaps/{roadmapId}/assign`]: {
      post: {
        tags: ['Roadmaps'],
        summary: 'Assign roadmap to users',
        description:
          'Assign a roadmap to one or multiple users. Prevents duplicate assignments. Requires Admin or Department Manager permission.',
        operationId: 'assignRoadmapToUsers',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'roadmapId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Roadmap ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userIds'],
                properties: {
                  userIds: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 1,
                    description: 'Array of user IDs to assign the roadmap to',
                    example: ['185', '186', '187'],
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Roadmap assigned to users successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        roadmapId: { type: 'string', example: '153' },
                        totalRequested: {
                          type: 'number',
                          example: 3,
                          description: 'Total number of users requested to assign',
                        },
                        newAssignments: {
                          type: 'number',
                          example: 2,
                          description: 'Number of new assignments created',
                        },
                        alreadyAssigned: {
                          type: 'number',
                          example: 1,
                          description: 'Number of users already assigned (skipped)',
                        },
                        skippedUserIds: {
                          type: 'array',
                          items: { type: 'string' },
                          example: ['185'],
                          description: 'User IDs that were already assigned',
                        },
                        assignments: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', example: '123' },
                              userId: { type: 'string', example: '186' },
                              status: {
                                type: 'string',
                                enum: ['assigned', 'in_progress', 'completed', 'dropped'],
                                example: 'assigned',
                              },
                              assignedAt: {
                                type: 'string',
                                format: 'date-time',
                                example: '2026-04-08T05:30:00.000Z',
                              },
                              user: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string', example: '186' },
                                  fullName: { type: 'string', example: 'John Doe' },
                                  email: { type: 'string', example: 'john.doe@example.com' },
                                },
                              },
                            },
                          },
                          description: 'List of newly created assignments',
                        },
                      },
                    },
                    message: { type: 'string', example: 'Roadmap assigned to users successfully' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: { type: 'string', example: 'At least one user ID is required' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Permission denied',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'You do not have permission to assign this roadmap',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Roadmap or users not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'Users not found: 999, 1000',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/roadmaps/assignments`]: {
      get: {
        tags: ['Roadmaps'],
        summary: 'List roadmap assignments',
        description:
          'List and filter roadmap assignments by user, roadmap, status, or department. Regular users see only their own assignments. Department Managers see assignments in their departments. Admins see all.',
        operationId: 'listRoadmapAssignments',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by user ID',
          },
          {
            name: 'roadmapId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by roadmap ID',
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['assigned', 'in_progress', 'completed', 'dropped'],
            },
            description: 'Filter by assignment status',
          },
          {
            name: 'departmentId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by department ID',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'string', default: '1' },
            description: 'Page number',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'string', default: '20' },
            description: 'Items per page',
          },
        ],
        responses: {
          '200': {
            description: 'Roadmap assignments retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        assignments: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', example: '123' },
                              userId: { type: 'string', example: '185' },
                              roadmapId: { type: 'string', example: '153' },
                              status: {
                                type: 'string',
                                enum: ['assigned', 'in_progress', 'completed', 'dropped'],
                                example: 'in_progress',
                              },
                              assignedAt: {
                                type: 'string',
                                format: 'date-time',
                                example: '2026-04-08T05:00:00.000Z',
                              },
                              startedAt: {
                                type: 'string',
                                format: 'date-time',
                                nullable: true,
                                example: '2026-04-08T06:00:00.000Z',
                              },
                              completedAt: {
                                type: 'string',
                                format: 'date-time',
                                nullable: true,
                                example: null,
                              },
                              droppedAt: {
                                type: 'string',
                                format: 'date-time',
                                nullable: true,
                                example: null,
                              },
                              user: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string', example: '185' },
                                  fullName: { type: 'string', example: 'John Doe' },
                                  email: { type: 'string', example: 'john.doe@example.com' },
                                  avatarUrl: {
                                    type: 'string',
                                    nullable: true,
                                    example: 'https://example.com/avatar.jpg',
                                  },
                                  department: {
                                    type: 'object',
                                    properties: {
                                      id: { type: 'string', example: '162' },
                                      name: { type: 'string', example: 'Engineering' },
                                    },
                                  },
                                },
                              },
                              roadmap: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string', example: '153' },
                                  title: { type: 'string', example: 'Backend Developer Path' },
                                  description: {
                                    type: 'string',
                                    example: 'Complete backend development roadmap',
                                  },
                                  targetPosition: {
                                    type: 'string',
                                    example: 'Backend Developer',
                                  },
                                  isActive: { type: 'boolean', example: true },
                                  department: {
                                    type: 'object',
                                    properties: {
                                      id: { type: 'string', example: '162' },
                                      name: { type: 'string', example: 'Engineering' },
                                    },
                                  },
                                  category: {
                                    type: 'object',
                                    nullable: true,
                                    properties: {
                                      id: { type: 'string', example: '169' },
                                      name: { type: 'string', example: 'Backend Development' },
                                      slug: { type: 'string', example: 'backend-development' },
                                    },
                                  },
                                  coursesCount: { type: 'number', example: 5 },
                                },
                              },
                              assignedBy: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                  id: { type: 'string', example: '1' },
                                  fullName: { type: 'string', example: 'Admin User' },
                                  email: { type: 'string', example: 'admin@staffup.local' },
                                },
                              },
                            },
                          },
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            page: { type: 'number', example: 1 },
                            limit: { type: 'number', example: 20 },
                            total: { type: 'number', example: 50 },
                            totalPages: { type: 'number', example: 3 },
                          },
                        },
                      },
                    },
                    message: {
                      type: 'string',
                      example: 'Roadmap assignments retrieved successfully',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/roadmaps/{id}/detail`]: {
      get: {
        tags: ['Roadmaps'],
        summary: 'Get roadmap detail with courses and user assignment',
        description:
          'Get detailed roadmap information including courses, user assignment status, and enrollment progress',
        operationId: 'getRoadmapDetail',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Roadmap ID',
          },
        ],
        responses: {
          '200': {
            description: 'Roadmap detail retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        description: { type: 'string', nullable: true },
                        targetPosition: { type: 'string', nullable: true },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        department: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                          },
                        },
                        category: {
                          type: 'object',
                          nullable: true,
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string' },
                            slug: { type: 'string' },
                          },
                        },
                        createdBy: {
                          type: 'object',
                          nullable: true,
                          properties: {
                            id: { type: 'string' },
                            fullName: { type: 'string' },
                            email: { type: 'string' },
                          },
                        },
                        courses: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              title: { type: 'string' },
                              slug: { type: 'string' },
                              description: { type: 'string', nullable: true },
                              thumbnailUrl: { type: 'string', nullable: true },
                              status: { type: 'string', enum: ['draft', 'published', 'archived'] },
                              estimatedDurationMinutes: { type: 'number', nullable: true },
                              orderIndex: { type: 'number' },
                              isRequired: { type: 'boolean' },
                              trainer: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string' },
                                  fullName: { type: 'string' },
                                  avatarUrl: { type: 'string', nullable: true },
                                },
                              },
                              stats: {
                                type: 'object',
                                properties: {
                                  totalModules: { type: 'number' },
                                  totalLessons: { type: 'number' },
                                  totalEnrollments: { type: 'number' },
                                },
                              },
                              userEnrollment: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                  enrollmentId: { type: 'string' },
                                  status: {
                                    type: 'string',
                                    enum: [
                                      'assigned',
                                      'in_progress',
                                      'completed',
                                      'cancelled',
                                      'expired',
                                    ],
                                  },
                                  progressPercent: { type: 'number' },
                                  completedLessonsCount: { type: 'number' },
                                  enrolledAt: { type: 'string', format: 'date-time' },
                                  startedAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    nullable: true,
                                  },
                                  completedAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    nullable: true,
                                  },
                                },
                              },
                            },
                          },
                        },
                        userAssignment: {
                          type: 'object',
                          nullable: true,
                          properties: {
                            assignmentId: { type: 'string' },
                            status: {
                              type: 'string',
                              enum: ['assigned', 'in_progress', 'completed', 'dropped'],
                            },
                            assignedAt: { type: 'string', format: 'date-time' },
                            startedAt: { type: 'string', format: 'date-time', nullable: true },
                            completedAt: { type: 'string', format: 'date-time', nullable: true },
                            droppedAt: { type: 'string', format: 'date-time', nullable: true },
                            assignedBy: {
                              type: 'object',
                              nullable: true,
                              properties: {
                                id: { type: 'string' },
                                fullName: { type: 'string' },
                              },
                            },
                          },
                        },
                        stats: {
                          type: 'object',
                          properties: {
                            totalCourses: { type: 'number' },
                            requiredCourses: { type: 'number' },
                            optionalCourses: { type: 'number' },
                            totalEstimatedMinutes: { type: 'number' },
                            totalAssignments: { type: 'number' },
                          },
                        },
                      },
                    },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Roadmap not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/roadmaps/assignments/{assignmentId}/status`]: {
      patch: {
        tags: ['Roadmaps'],
        summary: 'Update roadmap assignment status',
        description: [
          'Update the status of a roadmap assignment.',
          '**Status flow:** assigned → in_progress → completed | dropped',
          '**Timestamps auto-set:** startedAt (on in_progress), completedAt (on completed), droppedAt (on dropped).',
          '**Permissions:** Admin can set any status. Assigned user can only set in_progress or dropped.',
        ].join(' '),
        operationId: 'updateRoadmapAssignmentStatus',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'assignmentId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Assignment ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['assigned', 'in_progress', 'completed', 'dropped'],
                    example: 'in_progress',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Assignment status updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Assignment status updated successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        userId: { type: 'string' },
                        roadmapId: { type: 'string' },
                        status: {
                          type: 'string',
                          enum: ['assigned', 'in_progress', 'completed', 'dropped'],
                        },
                        assignedAt: { type: 'string', format: 'date-time' },
                        startedAt: { type: 'string', format: 'date-time', nullable: true },
                        completedAt: { type: 'string', format: 'date-time', nullable: true },
                        droppedAt: { type: 'string', format: 'date-time', nullable: true },
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            fullName: { type: 'string' },
                            email: { type: 'string' },
                          },
                        },
                        roadmap: {
                          type: 'object',
                          properties: { id: { type: 'string' }, title: { type: 'string' } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description:
              'Forbidden — user can only set in_progress or dropped on their own assignment',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Assignment not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/enrollments`]: {
      get: {
        tags: ['Enrollments'],
        summary: 'List enrollments',
        description: [
          'List enrollments with filters.',
          '**Access:** Admin sees all. Trainer sees enrollments for their courses. Learner sees only their own.',
          '**Filters:** userId, courseId, status, departmentId, overdue (boolean), search (user name/email/course title).',
        ].join(' '),
        operationId: 'listEnrollments',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          {
            name: 'userId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by user ID (admin/trainer only)',
          },
          { name: 'courseId', in: 'query', schema: { type: 'string' } },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['assigned', 'in_progress', 'completed', 'cancelled', 'expired'],
            },
          },
          { name: 'departmentId', in: 'query', schema: { type: 'string' } },
          {
            name: 'overdue',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Filter enrollments past dueAt and not completed/cancelled/expired',
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search by user name, email, or course title',
          },
        ],
        responses: {
          '200': {
            description: 'Enrollments retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Enrollments retrieved successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              userId: { type: 'string' },
                              courseId: { type: 'string' },
                              status: {
                                type: 'string',
                                enum: [
                                  'assigned',
                                  'in_progress',
                                  'completed',
                                  'cancelled',
                                  'expired',
                                ],
                              },
                              progressPercent: { type: 'number', example: 45.5 },
                              enrolledAt: { type: 'string', format: 'date-time' },
                              startedAt: { type: 'string', format: 'date-time', nullable: true },
                              completedAt: { type: 'string', format: 'date-time', nullable: true },
                              dueAt: { type: 'string', format: 'date-time', nullable: true },
                              isOverdue: { type: 'boolean' },
                              assignmentNote: { type: 'string', nullable: true },
                              user: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string' },
                                  fullName: { type: 'string' },
                                  email: { type: 'string' },
                                  avatarUrl: { type: 'string', nullable: true },
                                },
                              },
                              course: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string' },
                                  title: { type: 'string' },
                                  slug: { type: 'string' },
                                  thumbnailUrl: { type: 'string', nullable: true },
                                  trainer: {
                                    type: 'object',
                                    properties: {
                                      id: { type: 'string' },
                                      fullName: { type: 'string' },
                                    },
                                  },
                                },
                              },
                              assignedBy: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                  id: { type: 'string' },
                                  fullName: { type: 'string' },
                                },
                              },
                            },
                          },
                        },
                        meta: { $ref: '#/components/schemas/PaginationMeta' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/enrollments/{id}/status`]: {
      patch: {
        tags: ['Enrollments'],
        summary: 'Update enrollment status',
        description: [
          'Update enrollment status with transition rules.',
          '**Allowed transitions:**',
          '`assigned` → `in_progress`, `cancelled`',
          '`in_progress` → `completed`, `cancelled`',
          '`completed` → `in_progress` (admin only)',
          '`cancelled` → `assigned` (admin only)',
          '`expired` → `assigned` (admin only)',
          '**Auto timestamps:** startedAt set on in_progress, completedAt set on completed.',
          '**Permissions:** Admin can do any transition. Trainer (course owner) and learner (self) can do non-admin transitions.',
        ].join(' '),
        operationId: 'updateEnrollmentStatus',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Enrollment ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['assigned', 'in_progress', 'completed', 'cancelled', 'expired'],
                    example: 'in_progress',
                  },
                  dueAt: {
                    type: 'string',
                    format: 'date-time',
                    nullable: true,
                    description: 'Override due date',
                  },
                  startedAt: {
                    type: 'string',
                    format: 'date-time',
                    nullable: true,
                    description: 'Override started timestamp',
                  },
                  completedAt: {
                    type: 'string',
                    format: 'date-time',
                    nullable: true,
                    description: 'Override completed timestamp',
                  },
                  note: { type: 'string', maxLength: 500, nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Enrollment status updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Enrollment status updated successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        userId: { type: 'string' },
                        courseId: { type: 'string' },
                        status: {
                          type: 'string',
                          enum: ['assigned', 'in_progress', 'completed', 'cancelled', 'expired'],
                        },
                        progressPercent: { type: 'number' },
                        enrolledAt: { type: 'string', format: 'date-time' },
                        startedAt: { type: 'string', format: 'date-time', nullable: true },
                        completedAt: { type: 'string', format: 'date-time', nullable: true },
                        dueAt: { type: 'string', format: 'date-time', nullable: true },
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            fullName: { type: 'string' },
                            email: { type: 'string' },
                          },
                        },
                        course: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            slug: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden or admin-only transition',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Enrollment not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '422': {
            description: 'Invalid status transition',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: {
                      type: 'string',
                      example:
                        'Invalid transition: assigned → completed. Allowed: in_progress, cancelled',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/enrollments/{enrollmentId}/lessons/{lessonId}/start`]: {
      post: {
        tags: ['Enrollments'],
        summary: 'Start lesson / upsert lesson progress',
        description: [
          'Creates or updates a `LessonProgress` record when a learner begins a lesson.',
          'Validates that the lesson belongs to the enrollment course.',
          'Automatically transitions enrollment status from `assigned` → `in_progress` on first lesson start.',
          'If progress already exists (e.g. resuming), only `lastAccessedAt` is refreshed.',
        ].join(' '),
        operationId: 'startLesson',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'enrollmentId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Enrollment ID',
          },
          {
            name: 'lessonId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Lesson ID',
          },
        ],
        responses: {
          '200': {
            description: 'Lesson started / progress upserted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Lesson started successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        enrollmentId: { type: 'string' },
                        lessonId: { type: 'string' },
                        status: {
                          type: 'string',
                          enum: ['not_started', 'in_progress', 'completed', 'skipped'],
                        },
                        startedAt: { type: 'string', format: 'date-time', nullable: true },
                        lastAccessedAt: { type: 'string', format: 'date-time', nullable: true },
                        watchTimeSeconds: { type: 'integer' },
                        lastPositionSeconds: { type: 'integer' },
                        lesson: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            lessonType: { type: 'string', enum: ['video', 'article', 'quiz'] },
                            durationSeconds: { type: 'integer' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden or enrollment cancelled/expired',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Enrollment or lesson not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/enrollments/{enrollmentId}/lessons/{lessonId}/progress`]: {
      patch: {
        tags: ['Enrollments'],
        summary: 'Update lesson progress',
        description: [
          'Update `watchTimeSeconds`, `lastPositionSeconds`, and/or `status` for a lesson progress record.',
          'Used for video/article tracking. `watchTimeSeconds` only increases (max of current vs provided).',
          'Completing a lesson (`status: completed`) automatically recalculates enrollment progress caches.',
          'Requires `startLesson` to have been called first.',
        ].join(' '),
        operationId: 'updateLessonProgress',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'enrollmentId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Enrollment ID',
          },
          {
            name: 'lessonId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Lesson ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  watchTimeSeconds: {
                    type: 'integer',
                    minimum: 0,
                    description: 'Total seconds watched (monotonically increasing)',
                  },
                  lastPositionSeconds: {
                    type: 'integer',
                    minimum: 0,
                    description: 'Current playback position in seconds',
                  },
                  status: {
                    type: 'string',
                    enum: ['in_progress', 'completed', 'skipped'],
                    description: 'New progress status',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Lesson progress updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Lesson progress updated successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        enrollmentId: { type: 'string' },
                        lessonId: { type: 'string' },
                        status: {
                          type: 'string',
                          enum: ['not_started', 'in_progress', 'completed', 'skipped'],
                        },
                        watchTimeSeconds: { type: 'integer' },
                        lastPositionSeconds: { type: 'integer' },
                        startedAt: { type: 'string', format: 'date-time', nullable: true },
                        completedAt: { type: 'string', format: 'date-time', nullable: true },
                        lastAccessedAt: { type: 'string', format: 'date-time', nullable: true },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Enrollment or lesson progress not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/enrollments/{enrollmentId}/lessons/{lessonId}/complete`]: {
      post: {
        tags: ['Enrollments'],
        summary: 'Complete a lesson',
        description: [
          'Marks a lesson as `completed`, sets `completedAt` timestamp.',
          'Creates the `LessonProgress` record if it does not exist yet.',
          'Automatically recalculates `progressPercentCache`, `completedLessonsCountCache`, and `timeSpentSecondsCache` on the enrollment.',
          'Idempotent — calling again on an already-completed lesson is safe.',
        ].join(' '),
        operationId: 'completeLesson',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'enrollmentId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Enrollment ID',
          },
          {
            name: 'lessonId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Lesson ID',
          },
        ],
        responses: {
          '200': {
            description: 'Lesson marked as completed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Lesson completed successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        enrollmentId: { type: 'string' },
                        lessonId: { type: 'string' },
                        status: { type: 'string', example: 'completed' },
                        completedAt: { type: 'string', format: 'date-time' },
                        enrollment: {
                          type: 'object',
                          description: 'Updated enrollment progress caches',
                          properties: {
                            progressPercent: { type: 'number', example: 45.45 },
                            completedLessonsCount: { type: 'integer', example: 5 },
                            timeSpentSeconds: { type: 'integer', example: 3600 },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden or enrollment cancelled/expired',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Enrollment or lesson not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/enrollments/{enrollmentId}/progress`]: {
      get: {
        tags: ['Enrollments'],
        summary: 'Get enrollment progress',
        description: [
          'Returns overall progress summary plus per-lesson detail grouped by module.',
          'Serves the learning screen and dashboard progress widgets.',
          '**Permissions:** Enrollment owner, admin, or trainer.',
        ].join(' '),
        operationId: 'getEnrollmentProgress',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'enrollmentId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Enrollment ID',
          },
        ],
        responses: {
          '200': {
            description: 'Enrollment progress retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    data: {
                      type: 'object',
                      properties: {
                        enrollmentId: { type: 'string' },
                        courseId: { type: 'string' },
                        enrollmentStatus: {
                          type: 'string',
                          enum: ['assigned', 'in_progress', 'completed', 'cancelled', 'expired'],
                        },
                        summary: {
                          type: 'object',
                          properties: {
                            progressPercent: { type: 'number', example: 45.45 },
                            completedLessonsCount: { type: 'integer', example: 5 },
                            totalLessonsCount: { type: 'integer', example: 11 },
                            timeSpentSeconds: { type: 'integer', example: 3600 },
                            lastActivityAt: { type: 'string', format: 'date-time', nullable: true },
                          },
                        },
                        modules: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              title: { type: 'string' },
                              orderIndex: { type: 'integer' },
                              lessons: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    id: { type: 'string' },
                                    title: { type: 'string' },
                                    lessonType: {
                                      type: 'string',
                                      enum: ['video', 'article', 'quiz'],
                                    },
                                    durationSeconds: { type: 'integer' },
                                    orderIndex: { type: 'integer' },
                                    isPreview: { type: 'boolean' },
                                    progress: {
                                      type: 'object',
                                      properties: {
                                        status: {
                                          type: 'string',
                                          enum: [
                                            'not_started',
                                            'in_progress',
                                            'completed',
                                            'skipped',
                                          ],
                                        },
                                        watchTimeSeconds: { type: 'integer' },
                                        lastPositionSeconds: { type: 'integer' },
                                        startedAt: {
                                          type: 'string',
                                          format: 'date-time',
                                          nullable: true,
                                        },
                                        completedAt: {
                                          type: 'string',
                                          format: 'date-time',
                                          nullable: true,
                                        },
                                        lastAccessedAt: {
                                          type: 'string',
                                          format: 'date-time',
                                          nullable: true,
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Enrollment not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/enrollments/courses/{courseId}/enroll`]: {
      post: {
        tags: ['Enrollments'],
        summary: 'Enroll users into a course',
        description: [
          'Enroll one or multiple users into a course.',
          '**Duplicate prevention:** already-enrolled users are skipped (not an error).',
          '**Permissions:** Admin or the course trainer can enroll users.',
          'Response includes enrolled count, skipped count, and skipped user IDs.',
        ].join(' '),
        operationId: 'enrollUsers',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Course ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userIds'],
                properties: {
                  userIds: {
                    type: 'array',
                    items: { type: 'string' },
                    minItems: 1,
                    example: ['2', '3', '5'],
                    description: 'List of user IDs to enroll',
                  },
                  dueAt: {
                    type: 'string',
                    format: 'date-time',
                    nullable: true,
                    example: '2026-06-30T23:59:59Z',
                    description: 'Optional deadline for completing the course',
                  },
                  assignmentNote: {
                    type: 'string',
                    maxLength: 500,
                    nullable: true,
                    example: 'Required for Q2 performance review',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Users enrolled successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Users enrolled successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        courseId: { type: 'string', example: '10' },
                        totalRequested: { type: 'integer', example: 3 },
                        enrolled: {
                          type: 'integer',
                          example: 2,
                          description: 'Number of new enrollments created',
                        },
                        skipped: {
                          type: 'integer',
                          example: 1,
                          description: 'Already enrolled users skipped',
                        },
                        skippedUserIds: {
                          type: 'array',
                          items: { type: 'string' },
                          example: ['3'],
                        },
                        enrollments: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              userId: { type: 'string' },
                              status: { type: 'string', example: 'assigned' },
                              enrolledAt: { type: 'string', format: 'date-time' },
                              dueAt: { type: 'string', format: 'date-time', nullable: true },
                              assignmentNote: { type: 'string', nullable: true },
                              user: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string' },
                                  fullName: { type: 'string' },
                                  email: { type: 'string' },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden — only admin or course trainer can enroll users',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Course or users not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/enrollments/{id}/detail`]: {
      get: {
        tags: ['Enrollments'],
        summary: 'Get enrollment detail',
        description:
          'Get detailed enrollment information including progress summary and certificate state',
        operationId: 'getEnrollmentDetail',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Enrollment ID',
          },
        ],
        responses: {
          '200': {
            description: 'Enrollment detail retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        userId: { type: 'string' },
                        courseId: { type: 'string' },
                        status: {
                          type: 'string',
                          enum: ['assigned', 'in_progress', 'completed', 'cancelled', 'expired'],
                        },
                        enrolledAt: { type: 'string', format: 'date-time' },
                        startedAt: { type: 'string', format: 'date-time', nullable: true },
                        completedAt: { type: 'string', format: 'date-time', nullable: true },
                        lastActivityAt: { type: 'string', format: 'date-time', nullable: true },
                        dueAt: { type: 'string', format: 'date-time', nullable: true },
                        course: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            title: { type: 'string' },
                            slug: { type: 'string' },
                            description: { type: 'string' },
                            thumbnailUrl: { type: 'string', nullable: true },
                            estimatedDurationMinutes: { type: 'number' },
                            trainer: {
                              type: 'object',
                              properties: {
                                id: { type: 'string' },
                                fullName: { type: 'string' },
                                email: { type: 'string' },
                                avatarUrl: { type: 'string', nullable: true },
                              },
                            },
                          },
                        },
                        progressSummary: {
                          type: 'object',
                          properties: {
                            progressPercent: { type: 'number' },
                            completedLessonsCount: { type: 'number' },
                            totalLessonsCount: { type: 'number' },
                            timeSpentSeconds: { type: 'number' },
                            timeSpentFormatted: { type: 'string', example: '2h 30m' },
                            lastAccessedLesson: {
                              type: 'object',
                              nullable: true,
                              properties: {
                                id: { type: 'string' },
                                title: { type: 'string' },
                                moduleTitle: { type: 'string' },
                                lastAccessedAt: { type: 'string', format: 'date-time' },
                              },
                            },
                            quizProgress: {
                              type: 'object',
                              properties: {
                                totalQuizzes: { type: 'number' },
                                completedQuizzes: { type: 'number' },
                                passedQuizzes: { type: 'number' },
                                averageScore: { type: 'number', nullable: true },
                              },
                            },
                          },
                        },
                        certificate: {
                          type: 'object',
                          properties: {
                            isEligible: { type: 'boolean' },
                            isIssued: { type: 'boolean' },
                            certificateId: { type: 'string', nullable: true },
                            certificateCode: { type: 'string', nullable: true },
                            issuedAt: { type: 'string', format: 'date-time', nullable: true },
                            pdfUrl: { type: 'string', nullable: true },
                            isRevoked: { type: 'boolean' },
                            revokedAt: { type: 'string', format: 'date-time', nullable: true },
                            requirements: {
                              type: 'object',
                              properties: {
                                minProgressPercent: { type: 'number' },
                                currentProgressPercent: { type: 'number' },
                                minTimeSpentMinutes: { type: 'number' },
                                currentTimeSpentMinutes: { type: 'number' },
                                allLessonsCompleted: { type: 'boolean' },
                                allQuizzesPassed: { type: 'boolean' },
                              },
                            },
                          },
                        },
                        assignment: {
                          type: 'object',
                          properties: {
                            assignedBy: {
                              type: 'object',
                              nullable: true,
                              properties: {
                                id: { type: 'string' },
                                fullName: { type: 'string' },
                                email: { type: 'string' },
                              },
                            },
                            assignmentNote: { type: 'string', nullable: true },
                            dueAt: { type: 'string', format: 'date-time', nullable: true },
                            isOverdue: { type: 'boolean' },
                          },
                        },
                        riskAssessment: {
                          type: 'object',
                          nullable: true,
                          properties: {
                            riskScore: { type: 'number' },
                            riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
                            reasons: { type: 'object' },
                            recommendations: { type: 'string', nullable: true },
                            calculatedAt: { type: 'string', format: 'date-time' },
                          },
                        },
                      },
                    },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Permission denied',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Enrollment not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/categories`]: {
      get: {
        tags: ['Categories'],
        summary: 'List all categories',
        operationId: 'listCategories',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'tree',
            in: 'query',
            schema: { type: 'boolean', default: false },
            description: 'Return components in a hierarchical tree structure.',
          },
          {
            name: 'onlyActive',
            in: 'query',
            schema: { type: 'boolean', default: false },
            description: 'Filter categories by active status.',
          },
        ],
        responses: {
          '200': {
            description: 'Categories retrieved successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CategoryListResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create a new category',
        description: 'Requires the `admin` role. Slug is auto-generated.',
        operationId: 'createCategory',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCategoryRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Category created successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CategoryResponse' },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    [`${API_PREFIX}/categories/{id}`]: {
      get: {
        tags: ['Categories'],
        summary: 'Get category details',
        operationId: 'getCategoryById',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        responses: {
          '200': {
            description: 'Category details returned.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CategoryResponse' },
              },
            },
          },
          '404': { description: 'Category not found' },
        },
      },
      put: {
        tags: ['Categories'],
        summary: 'Update a category',
        description: 'Requires the `admin` role.',
        operationId: 'updateCategory',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateCategoryRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Category updated successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CategoryResponse' },
              },
            },
          },
          '403': { description: 'Forbidden' },
          '404': { description: 'Category not found' },
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete a category',
        description: 'Requires the `admin` role. Cannot delete if category has children or items.',
        operationId: 'deleteCategory',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        responses: {
          '204': { description: 'Category deleted successfully' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Category not found' },
        },
      },
    },
    [`${API_PREFIX}/roles`]: {
      get: {
        tags: ['Roles'],
        summary: 'List roles',
        description: 'Requires the `admin` role.',
        operationId: 'listRoles',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'search',
            in: 'query',
            schema: {
              type: 'string',
            },
            description: 'Case-insensitive search across role code, name, and description.',
          },
          {
            name: 'isSystem',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['true', 'false'],
            },
            description: 'Filter roles by system flag.',
          },
        ],
        responses: {
          '200': {
            description: 'Roles retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RoleListResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Insufficient role.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Roles'],
        summary: 'Create a role',
        description: 'Requires the `admin` role.',
        operationId: 'createRole',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateRoleRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Role created successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RoleDetailResponse',
                },
              },
            },
          },
          '400': {
            description: 'Validation failed or one or more permission codes are invalid.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Insufficient role.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '409': {
            description: 'Role code already exists.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/roles/{id}`]: {
      get: {
        tags: ['Roles'],
        summary: 'Get role details',
        description: 'Requires the `admin` role.',
        operationId: 'getRoleById',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Role retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RoleDetailResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Insufficient role.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Role not found.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Roles'],
        summary: 'Update a role',
        description:
          'Requires the `admin` role. System roles cannot change their code, and permission mappings are replaced when `permissionCodes` is provided.',
        operationId: 'updateRole',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdateRoleRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Role updated successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RoleDetailResponse',
                },
              },
            },
          },
          '400': {
            description:
              'Validation failed, permission codes are invalid, or a system role code change was attempted.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Insufficient role.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Role not found.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '409': {
            description: 'Role code already exists.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Roles'],
        summary: 'Delete a role',
        description:
          'Requires the `admin` role. System roles cannot be deleted, and roles assigned to users must be unassigned first.',
        operationId: 'deleteRole',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
          },
        ],
        responses: {
          '204': {
            description: 'Role deleted successfully.',
          },
          '400': {
            description: 'Role cannot be deleted due to system or assignment constraints.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Insufficient role.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Role not found.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/permissions`]: {
      get: {
        tags: ['Permissions'],
        summary: 'List permissions',
        description: 'Requires the `admin` role.',
        operationId: 'listPermissions',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'search',
            in: 'query',
            schema: {
              type: 'string',
            },
            description:
              'Case-insensitive search across permission code, module, action, and description.',
          },
          {
            name: 'module',
            in: 'query',
            schema: {
              type: 'string',
              pattern: '^[a-z][a-z0-9_]*$',
            },
          },
          {
            name: 'action',
            in: 'query',
            schema: {
              type: 'string',
              pattern: '^[a-z][a-z0-9_]*$',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Permissions retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PermissionListResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Insufficient role.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Permissions'],
        summary: 'Create a permission',
        description: 'Requires the `admin` role.',
        operationId: 'createPermission',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreatePermissionRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Permission created successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PermissionDetailResponse',
                },
              },
            },
          },
          '400': {
            description: 'Validation failed.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Insufficient role.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '409': {
            description: 'Permission code or module/action combination already exists.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/permissions/{id}`]: {
      get: {
        tags: ['Permissions'],
        summary: 'Get permission details',
        description: 'Requires the `admin` role.',
        operationId: 'getPermissionById',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Permission retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PermissionDetailResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Insufficient role.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Permission not found.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Permissions'],
        summary: 'Update a permission',
        description:
          'Requires the `admin` role. When changing permission identity, provide `code`, `module`, and `action` together.',
        operationId: 'updatePermission',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UpdatePermissionRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Permission updated successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PermissionDetailResponse',
                },
              },
            },
          },
          '400': {
            description: 'Validation failed.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Insufficient role.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Permission not found.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '409': {
            description: 'Permission code or module/action combination already exists.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Permissions'],
        summary: 'Delete a permission',
        description:
          'Requires the `admin` role. Permissions assigned to roles must be removed from those roles first.',
        operationId: 'deletePermission',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
          },
        ],
        responses: {
          '204': {
            description: 'Permission deleted successfully.',
          },
          '400': {
            description:
              'Permission cannot be deleted because it is assigned to one or more roles.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Insufficient role.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Permission not found.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/tags`]: {
      get: {
        tags: ['Tags'],
        summary: 'List all tags',
        operationId: 'listTags',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Tags retrieved successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TagListResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Tags'],
        summary: 'Create a new tag',
        description: 'Requires the `admin` role.',
        operationId: 'createTag',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTagRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Tag created successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TagResponse' },
              },
            },
          },
          '403': { description: 'Forbidden' },
          '409': { description: 'Tag already exists' },
        },
      },
    },
    [`${API_PREFIX}/tags/{id}`]: {
      get: {
        tags: ['Tags'],
        summary: 'Get tag details',
        operationId: 'getTagById',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        responses: {
          '200': {
            description: 'Tag details returned.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TagResponse' },
              },
            },
          },
          '404': { description: 'Tag not found' },
        },
      },
      put: {
        tags: ['Tags'],
        summary: 'Update a tag',
        description: 'Requires the `admin` role.',
        operationId: 'updateTag',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTagRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Tag updated successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TagResponse' },
              },
            },
          },
          '403': { description: 'Forbidden' },
          '404': { description: 'Tag not found' },
          '409': { description: 'Tag name already exists' },
        },
      },
      delete: {
        tags: ['Tags'],
        summary: 'Delete a tag',
        description: 'Requires the `admin` role.',
        operationId: 'deleteTag',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        responses: {
          '204': { description: 'Tag deleted successfully' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Tag not found' },
        },
      },
    },
    [`${API_PREFIX}/dashboard/employee`]: {
      get: {
        tags: ['Dashboard'],
        summary: 'Get employee dashboard statistics',
        operationId: 'getEmployeeDashboard',
        description:
          'Retrieve personal dashboard statistics for an employee/student, including enrolled courses, assigned roadmaps, progress summary, and earned certificates.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Employee dashboard statistics retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'data', 'message'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      required: ['myCourses', 'myRoadmaps', 'progressSummary', 'certificates'],
                      properties: {
                        myCourses: {
                          type: 'object',
                          required: ['total', 'assigned', 'inProgress', 'completed', 'courses'],
                          properties: {
                            total: { type: 'number', example: 2 },
                            assigned: { type: 'number', example: 0 },
                            inProgress: { type: 'number', example: 0 },
                            completed: { type: 'number', example: 2 },
                            courses: {
                              type: 'array',
                              items: {
                                type: 'object',
                                required: [
                                  'enrollmentId',
                                  'courseId',
                                  'courseTitle',
                                  'status',
                                  'progress',
                                  'enrolledAt',
                                ],
                                properties: {
                                  enrollmentId: { type: 'string', example: '154' },
                                  courseId: { type: 'string', example: '106' },
                                  courseTitle: { type: 'string', example: 'React Complete Guide' },
                                  courseThumbnail: {
                                    type: 'string',
                                    format: 'uri',
                                    nullable: true,
                                    example: 'https://images.unsplash.com/photo-1500000000001',
                                  },
                                  status: {
                                    type: 'string',
                                    enum: [
                                      'assigned',
                                      'in_progress',
                                      'completed',
                                      'cancelled',
                                      'expired',
                                    ],
                                    example: 'completed',
                                  },
                                  progress: {
                                    type: 'number',
                                    minimum: 0,
                                    maximum: 100,
                                    example: 100,
                                  },
                                  dueAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    nullable: true,
                                    example: null,
                                  },
                                  enrolledAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    example: '2026-04-01T12:35:47.869Z',
                                  },
                                  completedAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    nullable: true,
                                    example: '2026-04-05T12:35:47.869Z',
                                  },
                                },
                              },
                            },
                          },
                        },
                        myRoadmaps: {
                          type: 'object',
                          required: ['total', 'assigned', 'inProgress', 'completed', 'roadmaps'],
                          properties: {
                            total: { type: 'number', example: 1 },
                            assigned: { type: 'number', example: 1 },
                            inProgress: { type: 'number', example: 0 },
                            completed: { type: 'number', example: 0 },
                            roadmaps: {
                              type: 'array',
                              items: {
                                type: 'object',
                                required: [
                                  'assignmentId',
                                  'roadmapId',
                                  'roadmapTitle',
                                  'status',
                                  'totalCourses',
                                  'completedCourses',
                                  'progressPercent',
                                  'assignedAt',
                                ],
                                properties: {
                                  assignmentId: { type: 'string', example: '77' },
                                  roadmapId: { type: 'string', example: '103' },
                                  roadmapTitle: {
                                    type: 'string',
                                    example: 'Backend Developer Path',
                                  },
                                  targetPosition: {
                                    type: 'string',
                                    nullable: true,
                                    example: 'Backend Developer',
                                  },
                                  status: {
                                    type: 'string',
                                    enum: ['assigned', 'in_progress', 'completed', 'dropped'],
                                    example: 'assigned',
                                  },
                                  totalCourses: { type: 'number', example: 3 },
                                  completedCourses: { type: 'number', example: 1 },
                                  progressPercent: {
                                    type: 'number',
                                    minimum: 0,
                                    maximum: 100,
                                    example: 33,
                                  },
                                  assignedAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    example: '2026-03-27T12:35:48.108Z',
                                  },
                                  completedAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    nullable: true,
                                    example: null,
                                  },
                                },
                              },
                            },
                          },
                        },
                        progressSummary: {
                          type: 'object',
                          required: [
                            'totalTimeSpentMinutes',
                            'completedLessons',
                            'averageProgress',
                            'upcomingDeadlines',
                          ],
                          properties: {
                            totalTimeSpentMinutes: { type: 'number', example: 200 },
                            completedLessons: { type: 'number', example: 20 },
                            averageProgress: {
                              type: 'number',
                              minimum: 0,
                              maximum: 100,
                              example: 100,
                            },
                            recentActivity: {
                              type: 'string',
                              format: 'date-time',
                              nullable: true,
                              example: '2026-04-06T11:35:47.869Z',
                            },
                            upcomingDeadlines: {
                              type: 'array',
                              items: {
                                type: 'object',
                                required: [
                                  'courseId',
                                  'courseTitle',
                                  'dueAt',
                                  'daysRemaining',
                                  'currentProgress',
                                ],
                                properties: {
                                  courseId: { type: 'string', example: '106' },
                                  courseTitle: { type: 'string', example: 'React Complete Guide' },
                                  dueAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    example: '2026-04-13T00:00:00.000Z',
                                  },
                                  daysRemaining: { type: 'number', example: 7 },
                                  currentProgress: {
                                    type: 'number',
                                    minimum: 0,
                                    maximum: 100,
                                    example: 45,
                                  },
                                },
                              },
                            },
                          },
                        },
                        certificates: {
                          type: 'object',
                          required: ['total', 'certificates'],
                          properties: {
                            total: { type: 'number', example: 2 },
                            certificates: {
                              type: 'array',
                              items: {
                                type: 'object',
                                required: [
                                  'certificateId',
                                  'certificateCode',
                                  'courseId',
                                  'courseTitle',
                                  'issuedAt',
                                ],
                                properties: {
                                  certificateId: { type: 'string', example: '44' },
                                  certificateCode: {
                                    type: 'string',
                                    example: 'CERT-1775478947872-2',
                                  },
                                  courseId: { type: 'string', example: '106' },
                                  courseTitle: { type: 'string', example: 'React Complete Guide' },
                                  issuedAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    example: '2026-04-05T12:35:47.872Z',
                                  },
                                  pdfUrl: {
                                    type: 'string',
                                    format: 'uri',
                                    nullable: true,
                                    example: 'https://example.com/certificates/154.pdf',
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    message: {
                      type: 'string',
                      example: 'Employee dashboard statistics retrieved successfully',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Permission denied - employee or student role required',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/quizzes`]: {
      get: {
        tags: ['Quizzes'],
        summary: 'List quizzes with filters',
        description:
          'Get list of quizzes. Students see quizzes from enrolled courses, trainers see their courses, admins see all.',
        operationId: 'listQuizzes',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'courseId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by course ID',
          },
          {
            name: 'lessonId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by lesson ID',
          },
          {
            name: 'selectionMode',
            in: 'query',
            schema: { type: 'string', enum: ['fixed', 'random_pool'] },
          },
          { name: 'page', in: 'query', schema: { type: 'string', default: '1' } },
          { name: 'limit', in: 'query', schema: { type: 'string', default: '20' } },
        ],
        responses: {
          '200': {
            description: 'Quizzes retrieved successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
      post: {
        tags: ['Quizzes'],
        summary: 'Create quiz',
        description:
          'Create a new quiz for a course or lesson. Only admin or course trainer can create.',
        operationId: 'createQuiz',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['courseId', 'title'],
                properties: {
                  courseId: { type: 'string', example: '136' },
                  lessonId: { type: 'string', example: '1442' },
                  title: { type: 'string', example: 'React Basics Quiz' },
                  description: { type: 'string' },
                  selectionMode: {
                    type: 'string',
                    enum: ['fixed', 'random_pool'],
                    default: 'fixed',
                  },
                  passScorePercent: { type: 'number', default: 70 },
                  timeLimitMinutes: { type: 'number' },
                  maxAttempts: { type: 'number' },
                  questionsToPull: { type: 'number' },
                  shuffleQuestions: { type: 'boolean', default: true },
                  shuffleOptions: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Quiz created successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '403': { description: 'Permission denied' },
          '404': { description: 'Course or lesson not found' },
        },
      },
    },
    [`${API_PREFIX}/quizzes/{id}`]: {
      get: {
        tags: ['Quizzes'],
        summary: 'Get quiz detail',
        description: 'Get detailed quiz information including questions.',
        operationId: 'getQuizById',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Quiz retrieved successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '403': { description: 'Permission denied' },
          '404': { description: 'Quiz not found' },
        },
      },
      put: {
        tags: ['Quizzes'],
        summary: 'Update quiz',
        description: 'Update quiz settings. Only admin or course trainer can update.',
        operationId: 'updateQuiz',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  selectionMode: { type: 'string', enum: ['fixed', 'random_pool'] },
                  passScorePercent: { type: 'number', minimum: 0, maximum: 100 },
                  timeLimitMinutes: { type: 'number', minimum: 1 },
                  maxAttempts: { type: 'number', minimum: 1 },
                  questionsToPull: { type: 'number', minimum: 1 },
                  shuffleQuestions: { type: 'boolean' },
                  shuffleOptions: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Quiz updated successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '400': {
            description: 'Validation error - invalid config or not enough questions in pool',
          },
          '403': { description: 'Permission denied' },
          '404': { description: 'Quiz not found' },
        },
      },
      delete: {
        tags: ['Quizzes'],
        summary: 'Delete quiz',
        description: 'Delete quiz. Only admin or course trainer can delete.',
        operationId: 'deleteQuiz',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Quiz deleted successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '403': { description: 'Permission denied' },
          '404': { description: 'Quiz not found' },
        },
      },
    },
    [`${API_PREFIX}/quizzes/{quizId}/questions`]: {
      post: {
        tags: ['Quizzes'],
        summary: 'Add question to quiz',
        description:
          'Add a question to quiz. Prevents duplicates. Only admin or course trainer can add.',
        operationId: 'addQuestionToQuiz',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'quizId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['questionId'],
                properties: {
                  questionId: { type: 'string', example: '601' },
                  orderIndex: { type: 'number', example: 1 },
                  points: { type: 'number', example: 5, default: 1 },
                  isRequired: { type: 'boolean', default: true },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Question added successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '400': { description: 'Question already in quiz' },
          '403': { description: 'Permission denied' },
          '404': { description: 'Quiz or question not found' },
        },
      },
    },
    [`${API_PREFIX}/quizzes/{quizId}/questions/{questionId}`]: {
      put: {
        tags: ['Quizzes'],
        summary: 'Update quiz question settings',
        description: 'Update question points, order, or isRequired flag.',
        operationId: 'updateQuizQuestion',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'quizId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'questionId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  orderIndex: { type: 'number' },
                  points: { type: 'number' },
                  isRequired: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Quiz question updated successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '403': { description: 'Permission denied' },
          '404': { description: 'Quiz or question not found' },
        },
      },
      delete: {
        tags: ['Quizzes'],
        summary: 'Remove question from quiz',
        description: 'Remove a question from quiz.',
        operationId: 'removeQuestionFromQuiz',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'quizId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'questionId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Question removed successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '403': { description: 'Permission denied' },
          '404': { description: 'Quiz or question not found' },
        },
      },
    },
    [`${API_PREFIX}/quizzes/{quizId}/questions/reorder`]: {
      post: {
        tags: ['Quizzes'],
        summary: 'Reorder quiz questions',
        description: 'Batch update question order indices.',
        operationId: 'reorderQuizQuestions',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'quizId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['questionOrders'],
                properties: {
                  questionOrders: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        questionId: { type: 'string', example: '601' },
                        orderIndex: { type: 'number', example: 1 },
                      },
                    },
                    example: [
                      { questionId: '601', orderIndex: 1 },
                      { questionId: '602', orderIndex: 2 },
                    ],
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Questions reordered successfully',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
          '403': { description: 'Permission denied' },
          '404': { description: 'Quiz not found' },
        },
      },
    },
    [`${API_PREFIX}/quiz-attempts/start`]: {
      post: {
        tags: ['Quiz Attempts'],
        summary: 'Start a new quiz attempt',
        operationId: 'startQuizAttempt',
        description:
          'Start a new quiz attempt for a student. Validates max attempts, creates quiz_attempt record, generates attempt_no, and creates question snapshots.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['quizId', 'enrollmentId'],
                properties: {
                  quizId: {
                    type: 'string',
                    pattern: '^\\d+$',
                    example: '51',
                    description: 'Quiz ID as numeric string',
                  },
                  enrollmentId: {
                    type: 'string',
                    pattern: '^\\d+$',
                    example: '167',
                    description: 'Enrollment ID as numeric string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Quiz attempt started successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'data', 'message'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      required: [
                        'attemptId',
                        'attemptNo',
                        'quizId',
                        'quizTitle',
                        'totalQuestions',
                        'startedAt',
                      ],
                      properties: {
                        attemptId: {
                          type: 'string',
                          example: '124',
                          description: 'Created quiz attempt ID',
                        },
                        attemptNo: {
                          type: 'number',
                          example: 1,
                          description: 'Attempt number (1, 2, 3...)',
                        },
                        quizId: {
                          type: 'string',
                          example: '51',
                        },
                        quizTitle: {
                          type: 'string',
                          example: 'Node.js Fundamentals - Final Quiz',
                        },
                        timeLimitMinutes: {
                          type: 'number',
                          nullable: true,
                          example: 30,
                          description: 'Time limit in minutes, null if no limit',
                        },
                        totalQuestions: {
                          type: 'number',
                          example: 5,
                          description: 'Number of questions in this attempt',
                        },
                        startedAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2026-04-06T14:56:00.154Z',
                        },
                      },
                    },
                    message: {
                      type: 'string',
                      example: 'Quiz attempt started successfully',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request - validation failed or business rule violated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      enum: [
                        'You already have an in-progress attempt for this quiz. Please complete or abandon it first.',
                        'Maximum attempts (3) reached for this quiz',
                        'This quiz has no questions',
                      ],
                      example:
                        'You already have an in-progress attempt for this quiz. Please complete or abandon it first.',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Permission denied - enrollment does not belong to user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'You do not have permission to access this enrollment',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Enrollment or quiz not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      enum: ['Enrollment not found', 'Quiz not found in this course'],
                      example: 'Enrollment not found',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/quiz-attempts/{id}/detail`]: {
      get: {
        tags: ['Quiz Attempts'],
        summary: 'Get quiz attempt detail for taking quiz',
        operationId: 'getQuizAttemptDetail',
        description:
          'Get detailed quiz attempt information including questions with snapshots and saved responses. Does NOT expose correct answers or scores when attempt is in_progress.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
            description: 'Quiz attempt ID as numeric string',
          },
        ],
        responses: {
          '200': {
            description: 'Quiz attempt detail retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'data', 'message'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      required: [
                        'id',
                        'enrollmentId',
                        'quizId',
                        'attemptNo',
                        'status',
                        'startedAt',
                        'timeSpentSeconds',
                        'isTimedOut',
                        'quiz',
                        'questions',
                      ],
                      properties: {
                        id: { type: 'string', example: '124' },
                        enrollmentId: { type: 'string', example: '167' },
                        quizId: { type: 'string', example: '51' },
                        attemptNo: { type: 'number', example: 1 },
                        status: {
                          type: 'string',
                          enum: ['in_progress', 'submitted', 'graded'],
                          example: 'in_progress',
                        },
                        objectiveScore: {
                          type: 'number',
                          nullable: true,
                          example: null,
                          description: 'Auto-graded score, null if not submitted',
                        },
                        manualScore: {
                          type: 'number',
                          nullable: true,
                          example: null,
                          description: 'Manual score for essay/short answer, null if not graded',
                        },
                        totalScore: {
                          type: 'number',
                          nullable: true,
                          example: null,
                          description: 'Total score (objective + manual), null if not graded',
                        },
                        isPassed: {
                          type: 'boolean',
                          nullable: true,
                          example: null,
                          description: 'Whether student passed, null if not graded',
                        },
                        startedAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2026-04-06T14:56:00.154Z',
                        },
                        submittedAt: {
                          type: 'string',
                          format: 'date-time',
                          nullable: true,
                          example: null,
                        },
                        gradedAt: {
                          type: 'string',
                          format: 'date-time',
                          nullable: true,
                          example: null,
                        },
                        timeSpentSeconds: {
                          type: 'number',
                          example: 0,
                          description: 'Time spent so far in seconds',
                        },
                        timeLimitSeconds: {
                          type: 'number',
                          nullable: true,
                          example: 1800,
                          description: 'Time limit in seconds, null if no limit',
                        },
                        timeRemainingSeconds: {
                          type: 'number',
                          nullable: true,
                          example: 1800,
                          description:
                            'Time remaining in seconds (only for in_progress), null if no limit or not in progress',
                        },
                        isTimedOut: {
                          type: 'boolean',
                          example: false,
                          description: 'Whether time limit has been exceeded',
                        },
                        quiz: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: '51' },
                            title: { type: 'string', example: 'Node.js Fundamentals - Final Quiz' },
                            description: {
                              type: 'string',
                              nullable: true,
                              example: 'Assessment quiz for Node.js Fundamentals',
                            },
                            passScorePercent: { type: 'number', example: 70 },
                            timeLimitMinutes: { type: 'number', nullable: true, example: 30 },
                            maxAttempts: { type: 'number', nullable: true, example: 3 },
                            shuffleQuestions: { type: 'boolean', example: true },
                            shuffleOptions: { type: 'boolean', example: true },
                          },
                        },
                        questions: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: {
                                type: 'string',
                                example: '501',
                                description: 'Quiz attempt question ID',
                              },
                              displayOrder: { type: 'number', example: 1 },
                              maxPoints: { type: 'number', example: 10 },
                              questionSnapshot: {
                                type: 'object',
                                properties: {
                                  questionText: {
                                    type: 'string',
                                    example: 'What is Node.js?',
                                  },
                                  questionType: {
                                    type: 'string',
                                    enum: [
                                      'single_choice',
                                      'multiple_choice',
                                      'true_false',
                                      'short_answer',
                                      'essay',
                                    ],
                                    example: 'single_choice',
                                  },
                                  explanation: {
                                    type: 'string',
                                    nullable: true,
                                    example: null,
                                    description:
                                      'Explanation of correct answer. NULL when status=in_progress to prevent cheating',
                                  },
                                },
                              },
                              optionsSnapshot: {
                                type: 'array',
                                nullable: true,
                                items: {
                                  type: 'object',
                                  properties: {
                                    optionId: { type: 'string', example: '1001' },
                                    optionText: {
                                      type: 'string',
                                      example: 'A JavaScript runtime',
                                    },
                                    orderIndex: { type: 'number', example: 0 },
                                  },
                                },
                                description:
                                  'Shuffled options snapshot. NULL for short_answer/essay questions',
                              },
                              response: {
                                type: 'object',
                                nullable: true,
                                properties: {
                                  id: { type: 'string', example: '2001' },
                                  responseText: {
                                    type: 'string',
                                    nullable: true,
                                    example: null,
                                    description: 'Text answer for short_answer/essay',
                                  },
                                  selectedOptionIds: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    example: ['1001'],
                                    description: 'Selected option IDs for choice questions',
                                  },
                                  isCorrect: {
                                    type: 'boolean',
                                    nullable: true,
                                    example: null,
                                    description:
                                      'Whether answer is correct. NULL when status=in_progress to prevent cheating',
                                  },
                                  awardedPoints: {
                                    type: 'number',
                                    nullable: true,
                                    example: null,
                                    description:
                                      'Points awarded. NULL when status=in_progress to prevent cheating',
                                  },
                                  gradedAt: {
                                    type: 'string',
                                    format: 'date-time',
                                    nullable: true,
                                    example: null,
                                  },
                                },
                                description: 'Saved response if student has answered this question',
                              },
                            },
                          },
                        },
                        gradedBy: {
                          type: 'object',
                          nullable: true,
                          properties: {
                            id: { type: 'string', example: '5' },
                            fullName: { type: 'string', example: 'Teacher Name' },
                            email: { type: 'string', example: 'teacher@example.com' },
                          },
                          description: 'Grader info if manually graded',
                        },
                      },
                    },
                    message: {
                      type: 'string',
                      example: 'Quiz attempt detail retrieved successfully',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Permission denied - attempt does not belong to user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'You do not have permission to view this quiz attempt',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Quiz attempt not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'Quiz attempt not found',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/quiz-attempts/responses`]: {
      post: {
        tags: ['Quiz Attempts'],
        summary: 'Save or update quiz attempt response',
        operationId: 'saveQuizResponse',
        description:
          'Upsert response for a quiz question. Supports both text answers (essay/short_answer) and selected options (choice questions). Can be called multiple times to update answer.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['attemptQuestionId'],
                properties: {
                  attemptQuestionId: {
                    type: 'string',
                    pattern: '^\\d+$',
                    example: '501',
                    description: 'Quiz attempt question ID (from getQuizAttemptDetail response)',
                  },
                  responseText: {
                    type: 'string',
                    maxLength: 10000,
                    nullable: true,
                    example: 'Node.js is a JavaScript runtime built on Chrome V8 engine...',
                    description: 'Text answer for short_answer or essay questions',
                  },
                  selectedOptionIds: {
                    type: 'array',
                    items: {
                      type: 'string',
                      pattern: '^\\d+$',
                    },
                    example: ['1001'],
                    description:
                      'Array of selected option IDs for choice questions (single_choice, multiple_choice, true_false)',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Response saved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'data', 'message'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      required: [
                        'id',
                        'attemptQuestionId',
                        'responseText',
                        'selectedOptionIds',
                        'createdAt',
                        'updatedAt',
                      ],
                      properties: {
                        id: {
                          type: 'string',
                          example: '2001',
                          description: 'Quiz attempt response ID',
                        },
                        attemptQuestionId: {
                          type: 'string',
                          example: '501',
                        },
                        responseText: {
                          type: 'string',
                          nullable: true,
                          example: 'Node.js is a JavaScript runtime...',
                        },
                        selectedOptionIds: {
                          type: 'array',
                          items: { type: 'string' },
                          example: ['1001'],
                          description: 'Empty array for text-based questions',
                        },
                        createdAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2026-04-06T15:10:30.154Z',
                        },
                        updatedAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2026-04-06T15:10:30.154Z',
                        },
                      },
                    },
                    message: {
                      type: 'string',
                      example: 'Response saved successfully',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request - validation failed or attempt not in progress',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      enum: [
                        'Selected options are required for choice questions',
                        'Response text is required for text-based questions',
                        'Only one option can be selected for this question type',
                        'Cannot save response. Quiz attempt is not in progress',
                      ],
                      example: 'Selected options are required for choice questions',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Permission denied - attempt does not belong to user',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'You do not have permission to answer this question',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Quiz attempt question not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'Quiz attempt question not found',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/quiz-attempts/{attemptId}/submit`]: {
      post: {
        tags: ['Quiz Attempts'],
        summary: 'Submit quiz attempt',
        operationId: 'submitQuizAttempt',
        description:
          'Submit quiz attempt and mark as completed. Calculates time spent. Auto-grades objective questions if no essay/short_answer questions exist. Otherwise keeps status as submitted for manual grading.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'attemptId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
            description: 'Quiz attempt ID as numeric string',
          },
        ],
        responses: {
          '200': {
            description: 'Quiz attempt submitted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'data', 'message'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      required: [
                        'attemptId',
                        'status',
                        'submittedAt',
                        'timeSpentSeconds',
                        'autoGraded',
                        'requiresManualGrading',
                      ],
                      properties: {
                        attemptId: { type: 'string', example: '124' },
                        status: {
                          type: 'string',
                          enum: ['submitted', 'graded'],
                          example: 'graded',
                          description:
                            'graded if auto-graded (no essays), submitted if requires manual grading',
                        },
                        submittedAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2026-04-06T15:30:00.154Z',
                        },
                        timeSpentSeconds: {
                          type: 'number',
                          example: 1200,
                          description: 'Total time spent on quiz in seconds',
                        },
                        objectiveScore: {
                          type: 'number',
                          nullable: true,
                          example: 8,
                          description: 'Auto-graded score if no essays, null otherwise',
                        },
                        autoGraded: {
                          type: 'boolean',
                          example: true,
                          description: 'Whether quiz was auto-graded immediately',
                        },
                        requiresManualGrading: {
                          type: 'boolean',
                          example: false,
                          description: 'Whether quiz has essay/short_answer questions',
                        },
                      },
                    },
                    message: {
                      type: 'string',
                      example: 'Quiz attempt submitted successfully',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Quiz attempt has already been submitted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'Quiz attempt has already been submitted',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Permission denied',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'You do not have permission to submit this attempt',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Quiz attempt not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'Quiz attempt not found',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/quiz-attempts/{attemptId}/grade`]: {
      post: {
        tags: ['Quiz Attempts'],
        summary: 'Auto-grade objective questions',
        operationId: 'autoGradeObjectiveQuestions',
        description:
          'Automatically grade objective questions (single_choice, multiple_choice, true_false). Calculates isCorrect and awardedPoints for each response. Updates attempt with objective_score. Skips essay and short_answer questions.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'attemptId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
            description: 'Quiz attempt ID as numeric string',
          },
        ],
        responses: {
          '200': {
            description: 'Objective questions graded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'data', 'message'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      required: ['attemptId', 'objectiveScore', 'gradedQuestionsCount', 'status'],
                      properties: {
                        attemptId: { type: 'string', example: '124' },
                        objectiveScore: {
                          type: 'number',
                          example: 8,
                          description: 'Total score from objective questions',
                        },
                        gradedQuestionsCount: {
                          type: 'number',
                          example: 3,
                          description: 'Number of objective questions graded',
                        },
                        status: {
                          type: 'string',
                          example: 'graded',
                          description: 'Updated attempt status',
                        },
                      },
                    },
                    message: {
                      type: 'string',
                      example: 'Objective questions graded successfully',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Cannot grade attempt that is still in progress',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'Cannot grade attempt that is still in progress',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Permission denied',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'You do not have permission to grade this attempt',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Quiz attempt not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'Quiz attempt not found',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/quiz-attempts/history`]: {
      get: {
        tags: ['Quiz Attempts'],
        summary: 'Get quiz attempt history',
        operationId: 'getAttemptHistory',
        description:
          'Get list of quiz attempts filtered by enrollmentId or quizId. Returns attempt history with scores and status. User can only see their own attempts.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'enrollmentId',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
            description: 'Filter by enrollment ID to see all attempts for a specific enrollment',
          },
          {
            name: 'quizId',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
            description: 'Filter by quiz ID to see all attempts for a specific quiz',
          },
        ],
        responses: {
          '200': {
            description: 'Attempt history retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'data', 'message'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        required: [
                          'id',
                          'attemptNo',
                          'status',
                          'startedAt',
                          'timeSpentSeconds',
                          'quiz',
                          'enrollment',
                        ],
                        properties: {
                          id: { type: 'string', example: '124' },
                          attemptNo: { type: 'number', example: 2 },
                          status: {
                            type: 'string',
                            enum: ['in_progress', 'submitted', 'graded'],
                            example: 'graded',
                          },
                          objectiveScore: {
                            type: 'number',
                            nullable: true,
                            example: 8,
                            description: 'Score from objective questions',
                          },
                          manualScore: {
                            type: 'number',
                            nullable: true,
                            example: 5,
                            description: 'Score from manually graded questions',
                          },
                          totalScore: {
                            type: 'number',
                            nullable: true,
                            example: 13,
                            description: 'Total score (objective + manual)',
                          },
                          isPassed: {
                            type: 'boolean',
                            nullable: true,
                            example: true,
                            description: 'Whether student passed the quiz',
                          },
                          startedAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2026-04-06T14:56:00.154Z',
                          },
                          submittedAt: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            example: '2026-04-06T15:30:00.154Z',
                          },
                          gradedAt: {
                            type: 'string',
                            format: 'date-time',
                            nullable: true,
                            example: '2026-04-06T15:35:00.154Z',
                          },
                          timeSpentSeconds: {
                            type: 'number',
                            example: 1200,
                            description: 'Time spent on quiz in seconds',
                          },
                          quiz: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', example: '51' },
                              title: {
                                type: 'string',
                                example: 'Node.js Fundamentals - Final Quiz',
                              },
                              passScorePercent: { type: 'number', example: 70 },
                              timeLimitMinutes: { type: 'number', nullable: true, example: 30 },
                            },
                          },
                          enrollment: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', example: '167' },
                              user: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string', example: '130' },
                                  fullName: { type: 'string', example: 'Student Name' },
                                  email: { type: 'string', example: 'student1@example.com' },
                                },
                              },
                              course: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string', example: '115' },
                                  title: { type: 'string', example: 'Node.js Fundamentals' },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    message: {
                      type: 'string',
                      example: 'Attempt history retrieved successfully',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/quiz-attempts/responses/{responseId}/grade`]: {
      post: {
        tags: ['Quiz Attempts'],
        summary: 'Manual grade essay/short_answer response',
        operationId: 'manualGradeResponse',
        description:
          'Manually grade essay or short_answer question response. Set awarded points and mark as graded. Only trainer (course owner) or admin can grade. Automatically recalculates attempt total scores.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'responseId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
            description: 'Response ID as numeric string (from attempt detail)',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['awardedPoints'],
                properties: {
                  awardedPoints: {
                    type: 'number',
                    minimum: 0,
                    example: 1.5,
                    description:
                      'Points to award (must be between 0 and maxPoints for the question)',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Response graded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'data', 'message'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      required: [
                        'id',
                        'attemptQuestionId',
                        'awardedPoints',
                        'isCorrect',
                        'gradedAt',
                        'gradedBy',
                      ],
                      properties: {
                        id: {
                          type: 'string',
                          example: '562',
                          description: 'Response ID',
                        },
                        attemptQuestionId: {
                          type: 'string',
                          example: '562',
                        },
                        awardedPoints: {
                          type: 'number',
                          example: 1.5,
                          description: 'Points awarded by grader',
                        },
                        isCorrect: {
                          type: 'boolean',
                          example: false,
                          description: 'True if awarded full points (awardedPoints === maxPoints)',
                        },
                        gradedAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2026-04-06T17:59:41.505Z',
                        },
                        gradedBy: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: '128' },
                            fullName: { type: 'string', example: 'John Trainer' },
                          },
                        },
                      },
                    },
                    message: {
                      type: 'string',
                      example: 'Response graded successfully',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request - validation failed or invalid question type',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      enum: [
                        'Only essay and short_answer questions can be manually graded',
                        'Awarded points must be between 0 and 2 (max points for this question)',
                      ],
                      example: 'Only essay and short_answer questions can be manually graded',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Permission denied - must be trainer or admin',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'You do not have permission to grade this response',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Response not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'Response not found',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/quiz-attempts/{attemptId}/finalize`]: {
      post: {
        tags: ['Quiz Attempts'],
        summary: 'Finalize grading for quiz attempt',
        operationId: 'finalizeGrading',
        description:
          'Finalize grading after all manual grading is complete. Calculates final scores (objective + manual), determines pass/fail status, sets gradedAt and gradedBy. Only trainer (course owner) or admin can finalize.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'attemptId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              pattern: '^\\d+$',
            },
            description: 'Quiz attempt ID as numeric string',
          },
        ],
        responses: {
          '200': {
            description: 'Grading finalized successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['success', 'data', 'message'],
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      required: [
                        'attemptId',
                        'status',
                        'objectiveScore',
                        'manualScore',
                        'totalScore',
                        'totalMaxPoints',
                        'scorePercent',
                        'isPassed',
                        'gradedAt',
                        'gradedBy',
                      ],
                      properties: {
                        attemptId: { type: 'string', example: '124' },
                        status: { type: 'string', example: 'graded' },
                        objectiveScore: {
                          type: 'number',
                          example: 0,
                          description: 'Total score from objective questions',
                        },
                        manualScore: {
                          type: 'number',
                          example: 1.5,
                          description: 'Total score from manually graded questions',
                        },
                        totalScore: {
                          type: 'number',
                          example: 1.5,
                          description: 'Total score (objective + manual)',
                        },
                        totalMaxPoints: {
                          type: 'number',
                          example: 15,
                          description: 'Maximum possible points for this quiz',
                        },
                        scorePercent: {
                          type: 'number',
                          example: 10,
                          description: 'Score percentage (totalScore / totalMaxPoints * 100)',
                        },
                        isPassed: {
                          type: 'boolean',
                          example: false,
                          description: 'Whether student passed (scorePercent >= passScorePercent)',
                        },
                        gradedAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2026-04-06T18:09:23.691Z',
                        },
                        gradedBy: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: '128' },
                            fullName: { type: 'string', example: 'John Trainer' },
                          },
                        },
                      },
                    },
                    message: {
                      type: 'string',
                      example: 'Grading finalized successfully',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request - attempt in progress or questions not graded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      enum: [
                        'Cannot finalize grading for attempt that is still in progress',
                        'Cannot finalize grading. 2 question(s) still need to be graded',
                      ],
                      example: 'Cannot finalize grading. 2 question(s) still need to be graded',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Permission denied - must be trainer or admin',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'You do not have permission to finalize grading for this attempt',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Quiz attempt not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'Quiz attempt not found',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/certificates`]: {
      get: {
        tags: ['Certificates'],
        summary: 'List certificates with filters',
        description:
          'Get list of certificates with optional filters by userId, courseId, or enrollmentId. Only returns active (non-revoked) certificates.',
        operationId: 'listCertificates',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'query',
            required: false,
            description: 'Filter by user ID',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '1',
            },
          },
          {
            name: 'courseId',
            in: 'query',
            required: false,
            description: 'Filter by course ID',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '1',
            },
          },
          {
            name: 'enrollmentId',
            in: 'query',
            required: false,
            description: 'Filter by enrollment ID',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '1',
            },
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            description: 'Page number',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '1',
              default: '1',
            },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Items per page',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '20',
              default: '20',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Certificates retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        certificates: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', example: '1' },
                              certificateCode: { type: 'string', example: 'CERT-0001-0001-123456' },
                              pdfUrl: { type: 'string', nullable: true, example: null },
                              issuedAt: { type: 'string', format: 'date-time' },
                              enrollment: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string', example: '1' },
                                  user: {
                                    type: 'object',
                                    properties: {
                                      id: { type: 'string', example: '1' },
                                      fullName: { type: 'string', example: 'John Doe' },
                                      email: { type: 'string', example: 'john@example.com' },
                                    },
                                  },
                                  course: {
                                    type: 'object',
                                    properties: {
                                      id: { type: 'string', example: '1' },
                                      title: { type: 'string', example: 'Node.js Fundamentals' },
                                      slug: { type: 'string', example: 'nodejs-fundamentals' },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            page: { type: 'number', example: 1 },
                            limit: { type: 'number', example: 20 },
                            total: { type: 'number', example: 50 },
                            totalPages: { type: 'number', example: 3 },
                          },
                        },
                      },
                    },
                    message: { type: 'string', example: 'Certificates retrieved successfully' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/certificates/{id}`]: {
      get: {
        tags: ['Certificates'],
        summary: 'Get certificate detail by ID',
        description:
          'Get detailed information about a certificate. Only accessible by certificate owner, course trainer, or admin.',
        operationId: 'getCertificateById',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Certificate ID',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '1',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Certificate retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: '1' },
                        certificateCode: { type: 'string', example: 'CERT-0001-0001-123456' },
                        pdfUrl: { type: 'string', nullable: true, example: null },
                        issuedAt: { type: 'string', format: 'date-time' },
                        revokedAt: {
                          type: 'string',
                          format: 'date-time',
                          nullable: true,
                          example: null,
                        },
                        enrollment: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: '1' },
                            completedAt: { type: 'string', format: 'date-time', nullable: true },
                            user: {
                              type: 'object',
                              properties: {
                                id: { type: 'string', example: '1' },
                                fullName: { type: 'string', example: 'John Doe' },
                                email: { type: 'string', example: 'john@example.com' },
                                avatarUrl: { type: 'string', nullable: true },
                              },
                            },
                            course: {
                              type: 'object',
                              properties: {
                                id: { type: 'string', example: '1' },
                                title: { type: 'string', example: 'Node.js Fundamentals' },
                                slug: { type: 'string', example: 'nodejs-fundamentals' },
                                description: { type: 'string' },
                                thumbnailUrl: { type: 'string', nullable: true },
                                trainer: {
                                  type: 'object',
                                  properties: {
                                    id: { type: 'string', example: '128' },
                                    fullName: { type: 'string', example: 'John Trainer' },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    message: { type: 'string', example: 'Certificate retrieved successfully' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Permission denied',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'You do not have permission to view this certificate',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Certificate not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'Certificate not found',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/certificates/enrollment/{enrollmentId}`]: {
      get: {
        tags: ['Certificates'],
        summary: 'Get certificate by enrollment ID',
        description:
          'Get certificate for a specific enrollment. Only accessible by enrollment owner, course trainer, or admin.',
        operationId: 'getCertificateByEnrollment',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'enrollmentId',
            in: 'path',
            required: true,
            description: 'Enrollment ID',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '1',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Certificate retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: '1' },
                        certificateCode: { type: 'string', example: 'CERT-0001-0001-123456' },
                        pdfUrl: { type: 'string', nullable: true, example: null },
                        issuedAt: { type: 'string', format: 'date-time' },
                        revokedAt: {
                          type: 'string',
                          format: 'date-time',
                          nullable: true,
                          example: null,
                        },
                        enrollment: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: '1' },
                            user: {
                              type: 'object',
                              properties: {
                                id: { type: 'string', example: '1' },
                                fullName: { type: 'string', example: 'John Doe' },
                                email: { type: 'string', example: 'john@example.com' },
                              },
                            },
                            course: {
                              type: 'object',
                              properties: {
                                id: { type: 'string', example: '1' },
                                title: { type: 'string', example: 'Node.js Fundamentals' },
                                slug: { type: 'string', example: 'nodejs-fundamentals' },
                              },
                            },
                          },
                        },
                      },
                    },
                    message: { type: 'string', example: 'Certificate retrieved successfully' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Permission denied',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'You do not have permission to view this certificate',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Certificate not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'Certificate not found for this enrollment',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/certificates/issue/{enrollmentId}`]: {
      post: {
        tags: ['Certificates'],
        summary: 'Issue certificate for enrollment',
        description:
          'Check completion requirements and issue certificate if eligible. Only one active certificate per enrollment is allowed. Requirements: all lessons completed, all required quizzes passed.',
        operationId: 'issueCertificate',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'enrollmentId',
            in: 'path',
            required: true,
            description: 'Enrollment ID to issue certificate for',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '1',
            },
          },
        ],
        responses: {
          '201': {
            description: 'Certificate issued successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        certificateId: { type: 'string', example: '1' },
                        certificateCode: { type: 'string', example: 'CERT-0001-0001-123456' },
                        issuedAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2026-04-07T10:00:00.000Z',
                        },
                        enrollment: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: '1' },
                            user: {
                              type: 'object',
                              properties: {
                                id: { type: 'string', example: '1' },
                                fullName: { type: 'string', example: 'John Doe' },
                                email: { type: 'string', example: 'john@example.com' },
                              },
                            },
                            course: {
                              type: 'object',
                              properties: {
                                id: { type: 'string', example: '1' },
                                title: { type: 'string', example: 'Node.js Fundamentals' },
                              },
                            },
                          },
                        },
                      },
                    },
                    message: { type: 'string', example: 'Certificate issued successfully' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Certificate already issued or requirements not met',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example:
                        'Cannot issue certificate. Requirements not met: Complete all lessons (5/10 completed), Pass all required quizzes (0/2 passed)',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Permission denied - must be owner, trainer, or admin',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example:
                        'You do not have permission to issue certificate for this enrollment',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Enrollment not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'Enrollment not found',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/certificates/{id}/revoke`]: {
      delete: {
        tags: ['Certificates'],
        summary: 'Revoke certificate',
        description:
          'Revoke a certificate by setting revoked_at timestamp (soft delete). Only accessible by course trainer or admin. Cannot revoke already revoked certificates.',
        operationId: 'revokeCertificate',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Certificate ID to revoke',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '67',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Certificate revoked successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        certificateId: { type: 'string', example: '67' },
                        certificateCode: { type: 'string', example: 'CERT-0136-0166-362862' },
                        revokedAt: {
                          type: 'string',
                          format: 'date-time',
                          example: '2026-04-07T06:00:00.000Z',
                        },
                      },
                    },
                    message: { type: 'string', example: 'Certificate revoked successfully' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Certificate already revoked',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'Certificate is already revoked',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Permission denied - must be trainer or admin',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'You do not have permission to revoke this certificate',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Certificate not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'Certificate not found',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/risk-assessments`]: {
      get: {
        tags: ['Risk Assessments'],
        summary: 'List risk assessments with filters',
        description:
          'Get list of risk assessments with optional filters. Only accessible by admin or trainer. Trainers can only see assessments for their courses. Supports filtering by risk level, enrollment, user, course, and latest-only mode.',
        operationId: 'listRiskAssessments',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'riskLevel',
            in: 'query',
            required: false,
            description: 'Filter by risk level',
            schema: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              example: 'high',
            },
          },
          {
            name: 'enrollmentId',
            in: 'query',
            required: false,
            description: 'Filter by enrollment ID',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '196',
            },
          },
          {
            name: 'userId',
            in: 'query',
            required: false,
            description: 'Filter by user ID',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '166',
            },
          },
          {
            name: 'courseId',
            in: 'query',
            required: false,
            description: 'Filter by course ID',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '136',
            },
          },
          {
            name: 'latestOnly',
            in: 'query',
            required: false,
            description: 'Show only latest assessment per enrollment',
            schema: {
              type: 'string',
              enum: ['true', 'false'],
              example: 'true',
              default: 'false',
            },
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            description: 'Page number',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '1',
              default: '1',
            },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Items per page',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '20',
              default: '20',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Risk assessments retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        assessments: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', example: '115' },
                              enrollmentId: { type: 'string', example: '196' },
                              riskScore: { type: 'number', example: 75.5 },
                              riskLevel: { type: 'string', example: 'high' },
                              modelVersion: { type: 'string', example: 'v1.2.3' },
                              calculatedAt: { type: 'string', format: 'date-time' },
                              expiresAt: { type: 'string', format: 'date-time', nullable: true },
                              enrollment: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string', example: '196' },
                                  user: {
                                    type: 'object',
                                    properties: {
                                      id: { type: 'string', example: '166' },
                                      fullName: { type: 'string', example: 'Alice Student' },
                                      email: { type: 'string', example: 'student1@example.com' },
                                    },
                                  },
                                  course: {
                                    type: 'object',
                                    properties: {
                                      id: { type: 'string', example: '136' },
                                      title: { type: 'string', example: 'React Complete Guide' },
                                      slug: { type: 'string', example: 'react-complete-guide' },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            page: { type: 'number', example: 1 },
                            limit: { type: 'number', example: 20 },
                            total: { type: 'number', example: 50 },
                            totalPages: { type: 'number', example: 3 },
                          },
                        },
                      },
                    },
                    message: { type: 'string', example: 'Risk assessments retrieved successfully' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Permission denied - must be admin or trainer',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'You do not have permission to list risk assessments',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/risk-assessments/ingest`]: {
      post: {
        tags: ['Risk Assessments'],
        summary: 'Ingest learner risk assessment',
        description:
          'Ingest risk assessment data from external AI/ML system. Creates a new risk assessment record for an enrollment with score, level, and recommendations.',
        operationId: 'ingestRiskAssessment',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['enrollmentId', 'riskScore', 'riskLevel'],
                properties: {
                  enrollmentId: {
                    type: 'string',
                    pattern: '^\\d+$',
                    example: '196',
                    description: 'Enrollment ID',
                  },
                  riskScore: {
                    type: 'number',
                    minimum: 0,
                    maximum: 100,
                    example: 75.5,
                    description: 'Risk score (0-100)',
                  },
                  riskLevel: {
                    type: 'string',
                    enum: ['low', 'medium', 'high'],
                    example: 'high',
                    description: 'Risk level classification',
                  },
                  modelVersion: {
                    type: 'string',
                    maxLength: 50,
                    example: 'v1.2.3',
                    description: 'AI model version used',
                  },
                  reasons: {
                    type: 'object',
                    example: {
                      lowEngagement: true,
                      missedDeadlines: 3,
                      quizScores: [45, 50, 55],
                    },
                    description: 'JSON object with risk factors',
                  },
                  recommendations: {
                    type: 'string',
                    example: 'Schedule 1-on-1 meeting, provide additional resources',
                    description: 'Recommended actions',
                  },
                  interventions: {
                    type: 'string',
                    example: 'Assign mentor, extend deadline',
                    description: 'Suggested interventions',
                  },
                  calculatedAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2026-04-07T10:00:00Z',
                    description: 'When assessment was calculated',
                  },
                  expiresAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2026-04-14T10:00:00Z',
                    description: 'When assessment expires',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Risk assessment ingested successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: '1' },
                        enrollmentId: { type: 'string', example: '196' },
                        riskScore: { type: 'number', example: 75.5 },
                        riskLevel: { type: 'string', example: 'high' },
                        modelVersion: { type: 'string', example: 'v1.2.3' },
                        reasons: { type: 'object' },
                        recommendations: { type: 'string' },
                        interventions: { type: 'string' },
                        calculatedAt: { type: 'string', format: 'date-time' },
                        expiresAt: { type: 'string', format: 'date-time', nullable: true },
                        enrollment: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: '196' },
                            user: {
                              type: 'object',
                              properties: {
                                id: { type: 'string', example: '166' },
                                fullName: { type: 'string', example: 'Alice Student' },
                                email: { type: 'string', example: 'student1@example.com' },
                              },
                            },
                            course: {
                              type: 'object',
                              properties: {
                                id: { type: 'string', example: '136' },
                                title: { type: 'string', example: 'React Complete Guide' },
                              },
                            },
                          },
                        },
                      },
                    },
                    message: { type: 'string', example: 'Risk assessment ingested successfully' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error or invalid risk score',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'Risk score must be between 0 and 100',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: 'Enrollment not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'Enrollment not found',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/risk-assessments/enrollment/{enrollmentId}/latest`]: {
      get: {
        tags: ['Risk Assessments'],
        summary: 'Get latest risk assessment for enrollment',
        description:
          'Get the most recent risk assessment for an enrollment. Only accessible by enrollment owner, course trainer, or admin.',
        operationId: 'getLatestAssessment',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'enrollmentId',
            in: 'path',
            required: true,
            description: 'Enrollment ID',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '196',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Risk assessment retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: '1' },
                        enrollmentId: { type: 'string', example: '196' },
                        riskScore: { type: 'number', example: 75.5 },
                        riskLevel: { type: 'string', example: 'high' },
                        modelVersion: { type: 'string', example: 'v1.2.3' },
                        reasons: { type: 'object' },
                        recommendations: { type: 'string' },
                        interventions: { type: 'string' },
                        calculatedAt: { type: 'string', format: 'date-time' },
                        expiresAt: { type: 'string', format: 'date-time', nullable: true },
                      },
                    },
                    message: { type: 'string', example: 'Risk assessment retrieved successfully' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Permission denied',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'You do not have permission to view this risk assessment',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Enrollment or assessment not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'No risk assessment found for this enrollment',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/risk-assessments/enrollment/{enrollmentId}/history`]: {
      get: {
        tags: ['Risk Assessments'],
        summary: 'Get risk assessment history for enrollment',
        description:
          'Get paginated history of risk assessments for an enrollment. Only accessible by enrollment owner, course trainer, or admin.',
        operationId: 'getAssessmentHistory',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'enrollmentId',
            in: 'path',
            required: true,
            description: 'Enrollment ID',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '196',
            },
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            description: 'Page number',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '1',
              default: '1',
            },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            description: 'Items per page',
            schema: {
              type: 'string',
              pattern: '^\\d+$',
              example: '10',
              default: '10',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Risk assessment history retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        assessments: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', example: '1' },
                              riskScore: { type: 'number', example: 75.5 },
                              riskLevel: { type: 'string', example: 'high' },
                              modelVersion: { type: 'string', example: 'v1.2.3' },
                              calculatedAt: { type: 'string', format: 'date-time' },
                              expiresAt: { type: 'string', format: 'date-time', nullable: true },
                            },
                          },
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            page: { type: 'number', example: 1 },
                            limit: { type: 'number', example: 10 },
                            total: { type: 'number', example: 25 },
                            totalPages: { type: 'number', example: 3 },
                          },
                        },
                      },
                    },
                    message: {
                      type: 'string',
                      example: 'Risk assessment history retrieved successfully',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: 'Permission denied',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'You do not have permission to view this risk assessment history',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Enrollment not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'Enrollment not found',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    // ─── Question Banks ───────────────────────────────────────────────────────
    [`${API_PREFIX}/question-banks`]: {
      get: {
        tags: ['Question Banks'],
        summary: 'List question banks',
        description:
          'Admins see all banks. Trainers see only their own. Supports filtering by categoryId, ownerTrainerId, search, isActive.',
        operationId: 'listQuestionBanks',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
          { name: 'categoryId', in: 'query', schema: { type: 'string' } },
          {
            name: 'ownerTrainerId',
            in: 'query',
            schema: { type: 'string' },
            description: 'Admin only filter',
          },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          '200': {
            description: 'Question banks retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Question banks retrieved successfully' },
                    data: { $ref: '#/components/schemas/PaginatedQuestionBanks' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Question Banks'],
        summary: 'Create a question bank',
        description: 'Creates a new question bank. The authenticated trainer becomes the owner.',
        operationId: 'createQuestionBank',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateQuestionBankRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Question bank created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Question bank created successfully' },
                    data: { $ref: '#/components/schemas/QuestionBank' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/question-banks/{id}`]: {
      get: {
        tags: ['Question Banks'],
        summary: 'Get question bank by ID',
        operationId: 'getQuestionBank',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Question bank retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Question bank retrieved successfully' },
                    data: { $ref: '#/components/schemas/QuestionBank' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      put: {
        tags: ['Question Banks'],
        summary: 'Update a question bank',
        description: 'Only the owner trainer or admin can update.',
        operationId: 'updateQuestionBank',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateQuestionBankRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Question bank updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Question bank updated successfully' },
                    data: { $ref: '#/components/schemas/QuestionBank' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      delete: {
        tags: ['Question Banks'],
        summary: 'Delete a question bank',
        description: 'Only the owner trainer or admin can delete.',
        operationId: 'deleteQuestionBank',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '204': { description: 'Deleted successfully' },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    // ─── Questions ────────────────────────────────────────────────────────────
    [`${API_PREFIX}/question-banks/{bankId}/questions`]: {
      get: {
        tags: ['Questions'],
        summary: 'List questions in a bank',
        description:
          'Only the bank owner or admin can list questions. Supports filtering by questionType, search, isActive.',
        operationId: 'listQuestions',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'bankId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
          {
            name: 'questionType',
            in: 'query',
            schema: { type: 'string', enum: ['single_choice', 'multiple_choice', 'essay'] },
          },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          '200': {
            description: 'Questions retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Questions retrieved successfully' },
                    data: { $ref: '#/components/schemas/PaginatedQuestions' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Bank not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Questions'],
        summary: 'Create a question in a bank',
        description:
          'Only the bank owner or admin can add questions. single_choice requires exactly 1 correct option; multiple_choice requires at least 1; essay has no options.',
        operationId: 'createQuestion',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'bankId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateQuestionRequest' } },
          },
        },
        responses: {
          '201': {
            description: 'Question created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Question created successfully' },
                    data: { $ref: '#/components/schemas/Question' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Bank not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/question-banks/{bankId}/questions/{id}`]: {
      get: {
        tags: ['Questions'],
        summary: 'Get a question by ID',
        operationId: 'getQuestion',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'bankId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Question retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Question retrieved successfully' },
                    data: { $ref: '#/components/schemas/Question' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      put: {
        tags: ['Questions'],
        summary: 'Update a question',
        description:
          'Only the bank owner or admin can update. Providing options replaces all existing options.',
        operationId: 'updateQuestion',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'bankId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateQuestionRequest' } },
          },
        },
        responses: {
          '200': {
            description: 'Question updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Question updated successfully' },
                    data: { $ref: '#/components/schemas/Question' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/question-banks/{bankId}/questions/{id}/deactivate`]: {
      patch: {
        tags: ['Questions'],
        summary: 'Deactivate a question',
        description: 'Sets isActive to false. Only the bank owner or admin can deactivate.',
        operationId: 'deactivateQuestion',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'bankId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Question deactivated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Question deactivated successfully' },
                    data: { $ref: '#/components/schemas/Question' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    // ─── Question Options ─────────────────────────────────────────────────────
    [`${API_PREFIX}/question-banks/{bankId}/questions/{questionId}/options`]: {
      post: {
        tags: ['Questions'],
        summary: 'Add an option to a question',
        description: [
          'Adds a new option to a single_choice or multiple_choice question.',
          '**Business rules:**',
          '- essay questions cannot have options (422)',
          '- single_choice: adding isCorrect=true fails if another correct option already exists (422)',
          '- Only the bank owner or admin can modify options',
        ].join(' '),
        operationId: 'createQuestionOption',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'bankId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'questionId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateOptionRequest' } },
          },
        },
        responses: {
          '201': {
            description: 'Option created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Option created successfully' },
                    data: { $ref: '#/components/schemas/QuestionOption' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Question or bank not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '422': {
            description: 'Business rule violation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'essay questions cannot have options' },
                  },
                },
              },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/question-banks/{bankId}/questions/{questionId}/options/{optionId}`]: {
      put: {
        tags: ['Questions'],
        summary: 'Update an option',
        description: [
          'Updates content, isCorrect, or orderIndex of an option.',
          '**Business rules:**',
          '- single_choice: cannot set isCorrect=true if another correct option already exists',
          '- single_choice: cannot set isCorrect=false on the only correct option',
          '- Only the bank owner or admin can modify options',
        ].join(' '),
        operationId: 'updateQuestionOption',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'bankId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'questionId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'optionId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateOptionRequest' } },
          },
        },
        responses: {
          '200': {
            description: 'Option updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Option updated successfully' },
                    data: { $ref: '#/components/schemas/QuestionOption' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Option not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '422': {
            description: 'Business rule violation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: {
                      type: 'string',
                      example: 'single_choice question already has a correct option',
                    },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Questions'],
        summary: 'Delete an option',
        description: [
          'Deletes an option from a question.',
          '**Business rules:**',
          '- Cannot delete if question would have fewer than 2 options remaining',
          '- single_choice: cannot delete the correct option (set another to correct first)',
          '- multiple_choice: cannot delete the only remaining correct option',
          '- Only the bank owner or admin can delete options',
        ].join(' '),
        operationId: 'deleteQuestionOption',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'bankId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'questionId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'optionId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '204': { description: 'Option deleted successfully' },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Option not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '422': {
            description: 'Business rule violation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: {
                      type: 'string',
                      example:
                        'Cannot delete option: choice questions must have at least 2 options',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    // ─── Users ────────────────────────────────────────────────────────────────
    [`${API_PREFIX}/users`]: {
      get: {
        tags: ['Users'],
        summary: 'List users',
        description:
          'Paginated list of users with optional filters. Requires admin or manager role.',
        operationId: 'listUsers',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Search by name, email, or position',
          },
          { name: 'departmentId', in: 'query', schema: { type: 'string' } },
          {
            name: 'roleCode',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by role code (e.g. employee, trainer)',
          },
          { name: 'isActive', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          '200': {
            description: 'Users list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/UserResponse' },
                        },
                        meta: { $ref: '#/components/schemas/PaginationMeta' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create user',
        description:
          'Create a new user with hashed password. Email must be unique. Requires admin role.',
        operationId: 'createUser',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'password', 'departmentId'],
                properties: {
                  fullName: { type: 'string', minLength: 2, maxLength: 150, example: 'Jane Doe' },
                  email: { type: 'string', format: 'email', example: 'jane@example.com' },
                  password: { type: 'string', minLength: 8, example: 'Secret123' },
                  departmentId: { type: 'string', example: '1' },
                  positionTitle: { type: 'string', nullable: true, example: 'Software Engineer' },
                  avatarUrl: { type: 'string', format: 'uri', nullable: true },
                  roleCode: { type: 'string', default: 'employee', example: 'employee' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/UserResponse' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '409': {
            description: 'Email already exists',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/users/{id}`]: {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        operationId: 'getUser',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'User ID',
          },
        ],
        responses: {
          '200': {
            description: 'User detail',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/UserResponse' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      patch: {
        tags: ['Users'],
        summary: 'Update user',
        description:
          'Update user fields. Requires admin role. Password changes go through `/auth/change-password`.',
        operationId: 'updateUser',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'User ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  fullName: { type: 'string', minLength: 2, maxLength: 150 },
                  departmentId: { type: 'string' },
                  positionTitle: { type: 'string', nullable: true },
                  avatarUrl: { type: 'string', format: 'uri', nullable: true },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/UserResponse' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '401': {
            description: 'Unauthorized',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'User not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
  },
};
