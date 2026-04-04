const API_PREFIX = '/api/v1';

export const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Staffup LMS Backend API',
    version: '1.0.0',
    description:
      'OpenAPI document for the Staffup LMS backend. This spec currently covers health, authentication, refresh/logout session flow, and course endpoints.',
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
      description: 'Authentication, refresh/logout session flow, and current user profile.',
    },
    {
      name: 'Courses',
      description: 'Course management endpoints.',
    },
    {
      name: 'Departments',
      description: 'Department and organizational structure management.',
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
    [`${API_PREFIX}/departments`]: {
      get: {
        tags: ['Departments'],
        summary: 'List all departments',
        operationId: 'listDepartments',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Departments retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DepartmentListResponse',
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
        tags: ['Departments'],
        summary: 'Create a new department',
        description: 'Requires the `admin` role.',
        operationId: 'createDepartment',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/CreateDepartmentRequest',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Department created successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DepartmentDetailResponse',
                },
              },
            },
          },
          '400': {
            description: 'Validation failed or name already exists.',
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
    [`${API_PREFIX}/departments/{id}`]: {
      get: {
        tags: ['Departments'],
        summary: 'Get department details',
        operationId: 'getDepartmentById',
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
            description: 'Department details returned.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DepartmentDetailResponse',
                },
              },
            },
          },
          '404': {
            description: 'Department not found.',
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
        tags: ['Departments'],
        summary: 'Update a department',
        description: 'Requires the `admin` or `manager` role.',
        operationId: 'updateDepartment',
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
                $ref: '#/components/schemas/UpdateDepartmentRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Department updated successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DepartmentDetailResponse',
                },
              },
            },
          },
          '403': {
            description: 'Insufficient role.',
          },
          '404': {
            description: 'Department or Manager not found.',
          },
        },
      },
      delete: {
        tags: ['Departments'],
        summary: 'Delete a department',
        description: 'Requires the `admin` role.',
        operationId: 'deleteDepartment',
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
            description: 'Department deleted successfully.',
          },
          '400': {
            description: 'Cannot delete department due to content.',
          },
          '403': {
            description: 'Insufficient role.',
          },
        },
      },
    },
    [`${API_PREFIX}/departments/{id}/users`]: {
      get: {
        tags: ['Departments'],
        summary: 'List users in a department',
        operationId: 'getDepartmentUsers',
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
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10 },
          },
          {
            name: 'isActive',
            in: 'query',
            schema: { type: 'string', enum: ['true', 'false'] },
          },
        ],
        responses: {
          '200': {
            description: 'Department users returned successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/DepartmentUsersResponse',
                },
              },
            },
          },
        },
      },
    },
  },
};
