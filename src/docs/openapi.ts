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
    {
      name: 'Media',
      description:
        'Media upload endpoints for Cloudinary-backed files such as videos and thumbnails.',
    },
    {
      name: 'Departments',
      description: 'Department management — CRUD, user listing, and manager assignment.',
    },
    {
      name: 'AI Chat',
      description: 'Company knowledge RAG chatbot — session management, messaging, and streaming.',
    },
    {
      name: 'AI Learning Assistant',
      description:
        'Course-scoped learning assistant — students ask questions about course content.',
    },
    {
      name: 'AI Grading',
      description: 'AI-powered auto-grading for essay questions using Gemini.',
    },
    {
      name: 'AI Admin',
      description:
        'Admin tools for indexing company documents and course lessons into the RAG vector store.',
    },
    {
      name: 'Company Documents',
      description:
        'Company policy document CRUD — admin manages documents used by the RAG chatbot.',
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
      MediaUploadResponseData: {
        type: 'object',
        required: [
          'assetId',
          'publicId',
          'version',
          'resourceType',
          'bytes',
          'originalFilename',
          'secureUrl',
          'playbackUrl',
        ],
        properties: {
          assetId: {
            type: 'string',
            example: '3b8f0a7f2fb9d7f22fd0e0c6d1f6ce12',
          },
          publicId: {
            type: 'string',
            example: 'staffup-lms/courses/module-1/lesson-1',
          },
          version: {
            type: 'integer',
            example: 1712750400,
          },
          width: {
            type: 'integer',
            nullable: true,
            example: 1920,
          },
          height: {
            type: 'integer',
            nullable: true,
            example: 1080,
          },
          format: {
            type: 'string',
            nullable: true,
            example: 'mp4',
          },
          resourceType: {
            type: 'string',
            example: 'video',
          },
          bytes: {
            type: 'integer',
            example: 10485760,
          },
          duration: {
            type: 'number',
            nullable: true,
            example: 326.42,
          },
          originalFilename: {
            type: 'string',
            example: 'lesson-1.mp4',
          },
          secureUrl: {
            type: 'string',
            format: 'uri',
            example:
              'https://res.cloudinary.com/demo/video/upload/v1712750400/staffup-lms/courses/module-1/lesson-1.mp4',
          },
          playbackUrl: {
            type: 'string',
            format: 'uri',
            example:
              'https://res.cloudinary.com/demo/video/upload/v1712750400/staffup-lms/courses/module-1/lesson-1.mp4',
          },
          folder: {
            type: 'string',
            nullable: true,
            example: 'staffup-lms/courses/module-1',
          },
        },
      },
      MediaUploadSuccessResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'File uploaded successfully' },
          data: {
            $ref: '#/components/schemas/MediaUploadResponseData',
          },
        },
      },
      MediaListItem: {
        type: 'object',
        required: [
          'assetId',
          'publicId',
          'version',
          'resourceType',
          'bytes',
          'secureUrl',
          'playbackUrl',
        ],
        properties: {
          assetId: { type: 'string', example: '3b8f0a7f2fb9d7f22fd0e0c6d1f6ce12' },
          publicId: {
            type: 'string',
            example: 'staffup-lms/courses/25/lesson-01-intro',
          },
          version: { type: 'integer', example: 1712750400 },
          width: { type: 'integer', nullable: true, example: 1920 },
          height: { type: 'integer', nullable: true, example: 1080 },
          format: { type: 'string', nullable: true, example: 'mp4' },
          resourceType: { type: 'string', example: 'video' },
          bytes: { type: 'integer', example: 10485760 },
          duration: { type: 'number', nullable: true, example: 326.42 },
          createdAt: {
            type: 'string',
            nullable: true,
            format: 'date-time',
            example: '2026-04-11T08:00:00Z',
          },
          secureUrl: {
            type: 'string',
            format: 'uri',
            example:
              'https://res.cloudinary.com/demo/video/upload/v1712750400/staffup-lms/courses/25/lesson-01-intro.mp4',
          },
          playbackUrl: {
            type: 'string',
            format: 'uri',
            example:
              'https://res.cloudinary.com/demo/video/upload/v1712750400/staffup-lms/courses/25/lesson-01-intro.mp4',
          },
          folder: {
            type: 'string',
            nullable: true,
            example: 'staffup-lms/courses/25',
          },
          originalFilename: {
            type: 'string',
            nullable: true,
            example: 'lesson-01-intro.mp4',
          },
        },
      },
      MediaListResponseData: {
        type: 'object',
        required: ['items', 'folder', 'resourceType', 'nextCursor'],
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/MediaListItem' },
          },
          nextCursor: {
            type: 'string',
            nullable: true,
            example: '6b7d8d9f0a1b2c3d4e',
          },
          folder: {
            type: 'string',
            example: 'staffup-lms/courses/25',
          },
          resourceType: {
            type: 'string',
            example: 'video',
          },
        },
      },
      MediaListSuccessResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Media retrieved successfully' },
          data: {
            $ref: '#/components/schemas/MediaListResponseData',
          },
        },
      },
      MediaFolderItem: {
        type: 'object',
        required: ['name', 'path'],
        properties: {
          name: {
            type: 'string',
            example: 'khóa học vuejs',
          },
          path: {
            type: 'string',
            example: 'khóa học vuejs',
          },
        },
      },
      MediaFolderListResponseData: {
        type: 'object',
        required: ['items', 'nextCursor', 'path'],
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/MediaFolderItem' },
          },
          nextCursor: {
            type: 'string',
            nullable: true,
            example: null,
          },
          path: {
            type: 'string',
            nullable: true,
            example: 'khóa học vuejs',
          },
        },
      },
      MediaFolderListSuccessResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Media folders retrieved successfully' },
          data: {
            $ref: '#/components/schemas/MediaFolderListResponseData',
          },
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
            minLength: 1,
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
            maxItems: 50,
            uniqueItems: true,
            items: {
              type: 'string',
              pattern: '^[a-z][a-z0-9_]*$',
              example: 'trainer',
            },
            example: ['trainer', 'employee'],
          },
        },
      },
      UpdateUserStatusRequest: {
        type: 'object',
        required: ['isActive'],
        properties: {
          isActive: {
            type: 'boolean',
            example: false,
          },
        },
      },
      UpdateUserStatusResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'User status updated successfully' },
          data: {
            type: 'object',
            required: ['id', 'email', 'fullName', 'isActive', 'updatedAt'],
            properties: {
              id: { type: 'string', pattern: '^\\d+$', example: '7' },
              email: { type: 'string', format: 'email', example: 'student1@example.com' },
              fullName: { type: 'string', example: 'Alice Student' },
              isActive: { type: 'boolean', example: false },
              updatedAt: { type: 'string', format: 'date-time' },
            },
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
      CourseCategorySummary: {
        type: 'object',
        required: ['id', 'name', 'slug'],
        properties: {
          id: { type: 'string', pattern: '^\\d+$', example: '3' },
          name: { type: 'string', example: 'Backend Development' },
          slug: { type: 'string', example: 'backend-development' },
        },
      },
      CourseOwnerDepartmentSummary: {
        type: 'object',
        required: ['id', 'name'],
        properties: {
          id: { type: 'string', pattern: '^\\d+$', example: '1' },
          name: { type: 'string', example: 'Engineering' },
        },
      },
      CourseTagSummary: {
        type: 'object',
        required: ['id', 'name', 'slug'],
        properties: {
          id: { type: 'string', pattern: '^\\d+$', example: '7' },
          name: { type: 'string', example: 'Node.js' },
          slug: { type: 'string', example: 'node-js' },
        },
      },
      CourseListItem: {
        type: 'object',
        required: [
          'id',
          'title',
          'slug',
          'status',
          'createdAt',
          'updatedAt',
          'trainer',
          'category',
          'ownerDepartment',
          'counts',
        ],
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
          trainer: {
            $ref: '#/components/schemas/TrainerSummary',
          },
          category: {
            anyOf: [{ $ref: '#/components/schemas/CourseCategorySummary' }, { type: 'null' }],
          },
          ownerDepartment: {
            anyOf: [
              { $ref: '#/components/schemas/CourseOwnerDepartmentSummary' },
              { type: 'null' },
            ],
          },
          counts: {
            $ref: '#/components/schemas/CourseCounts',
          },
        },
      },
      CourseDetailResource: {
        type: 'object',
        required: ['id', 'fileName', 'fileUrl', 'orderIndex'],
        properties: {
          id: { type: 'string', pattern: '^\\d+$', example: '88' },
          fileName: { type: 'string', example: 'slides.pdf' },
          fileUrl: { type: 'string', format: 'uri', example: 'https://cdn.example.com/slides.pdf' },
          resourceType: { type: 'string', nullable: true, example: 'pdf' },
          orderIndex: { type: 'integer', example: 1 },
        },
      },
      CourseDetailQuiz: {
        type: 'object',
        required: [
          'id',
          'title',
          'totalQuestions',
          'passScorePercent',
          'shuffleQuestions',
          'shuffleOptions',
        ],
        properties: {
          id: { type: 'string', pattern: '^\\d+$', example: '12' },
          title: { type: 'string', example: 'Knowledge Check' },
          description: { type: 'string', nullable: true, example: 'Basic backend quiz' },
          totalQuestions: { type: 'integer', example: 10 },
          passScorePercent: { type: 'number', example: 70 },
          timeLimitMinutes: { type: 'integer', nullable: true, example: 20 },
          maxAttempts: { type: 'integer', nullable: true, example: 3 },
          shuffleQuestions: { type: 'boolean', example: true },
          shuffleOptions: { type: 'boolean', example: false },
        },
      },
      CourseDetailLesson: {
        type: 'object',
        required: [
          'id',
          'title',
          'lessonType',
          'durationSeconds',
          'orderIndex',
          'isPreview',
          'videoUrl',
          'contentText',
          'resources',
        ],
        properties: {
          id: {
            type: 'string',
            pattern: '^\\d+$',
            example: '100',
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
          resources: {
            type: 'array',
            items: { $ref: '#/components/schemas/CourseDetailResource' },
          },
          quiz: {
            anyOf: [{ $ref: '#/components/schemas/CourseDetailQuiz' }, { type: 'null' }],
          },
        },
      },
      CourseDetailModule: {
        type: 'object',
        required: ['id', 'title', 'orderIndex', 'lessons'],
        properties: {
          id: {
            type: 'string',
            pattern: '^\\d+$',
            example: '20',
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
            items: { $ref: '#/components/schemas/CourseDetailLesson' },
          },
        },
      },
      CourseDetailStats: {
        type: 'object',
        required: ['totalModules', 'totalLessons', 'totalDurationMinutes', 'totalEnrollments'],
        properties: {
          totalModules: { type: 'integer', example: 6 },
          totalLessons: { type: 'integer', example: 24 },
          totalDurationMinutes: { type: 'integer', example: 95 },
          totalEnrollments: { type: 'integer', example: 120 },
        },
      },
      CourseDetail: {
        allOf: [
          {
            $ref: '#/components/schemas/CourseListItem',
          },
          {
            type: 'object',
            properties: {
              trainer: {
                type: 'object',
                required: ['id', 'fullName', 'email', 'avatarUrl'],
                properties: {
                  id: { type: 'string', pattern: '^\\d+$', example: '2' },
                  fullName: { type: 'string', example: 'Trainer User' },
                  email: { type: 'string', format: 'email', example: 'trainer@staffup.local' },
                  avatarUrl: { type: 'string', format: 'uri', nullable: true },
                },
              },
              tags: {
                type: 'array',
                items: { $ref: '#/components/schemas/CourseTagSummary' },
              },
              modules: {
                type: 'array',
                items: { $ref: '#/components/schemas/CourseDetailModule' },
              },
              stats: {
                $ref: '#/components/schemas/CourseDetailStats',
              },
            },
          },
        ],
      },
      CourseStatusUpdateRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived'],
            example: 'published',
          },
        },
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
      UserImportError: {
        type: 'object',
        required: ['row', 'email', 'reason'],
        properties: {
          row: { type: 'integer', example: 4 },
          email: { type: 'string', example: 'duplicate@staffup.local' },
          reason: {
            type: 'string',
            example: 'User with email "duplicate@staffup.local" already exists',
          },
        },
      },
      UserImportCreatedItem: {
        type: 'object',
        required: ['row', 'user'],
        properties: {
          row: { type: 'integer', example: 2 },
          user: { $ref: '#/components/schemas/UserResponse' },
        },
      },
      UserImportSummary: {
        type: 'object',
        required: ['totalRows', 'successCount', 'errorCount', 'createdDepartmentCount'],
        properties: {
          totalRows: { type: 'integer', example: 10 },
          successCount: { type: 'integer', example: 8 },
          errorCount: { type: 'integer', example: 2 },
          createdDepartmentCount: { type: 'integer', example: 1 },
        },
      },
      UserImportResponseData: {
        type: 'object',
        required: ['summary', 'createdDepartments', 'createdUsers', 'errors', 'acceptedColumns'],
        properties: {
          summary: { $ref: '#/components/schemas/UserImportSummary' },
          createdDepartments: {
            type: 'array',
            items: { type: 'string' },
            example: ['Engineering'],
          },
          createdUsers: {
            type: 'array',
            items: { $ref: '#/components/schemas/UserImportCreatedItem' },
          },
          errors: {
            type: 'array',
            items: { $ref: '#/components/schemas/UserImportError' },
          },
          acceptedColumns: {
            type: 'array',
            items: { type: 'string' },
            example: [
              'fullName | name | hoten',
              'email',
              'password',
              'department | departmentName | phongban',
              'positionTitle | position | chucvu',
              'avatarUrl',
              'roleCode | role',
              'isActive | active | trangthai',
            ],
          },
        },
      },
      UserImportSuccessResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'User import completed' },
          data: { $ref: '#/components/schemas/UserImportResponseData' },
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
          trainerUserId: {
            type: 'string',
            pattern: '^\\d+$',
            example: '2',
          },
          estimatedDurationMinutes: {
            type: 'integer',
            minimum: 1,
            example: 90,
          },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived'],
            example: 'draft',
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
          trainerUserId: {
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
      CourseTagAssignmentRequest: {
        type: 'object',
        required: ['tagId'],
        properties: {
          tagId: {
            type: 'string',
            pattern: '^\\d+$',
            example: '7',
          },
        },
      },
      CourseTagAssignmentResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Tag added to course successfully' },
          data: {
            allOf: [
              { $ref: '#/components/schemas/CourseListItem' },
              {
                type: 'object',
                required: ['tags'],
                properties: {
                  tags: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/CourseTagSummary' },
                  },
                },
              },
            ],
          },
        },
      },
      RemoveLinkResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Removed successfully' },
          data: {
            type: 'object',
            additionalProperties: true,
            example: { removed: true },
          },
        },
      },
      CourseModuleItem: {
        type: 'object',
        required: [
          'id',
          'courseId',
          'title',
          'orderIndex',
          'createdAt',
          'updatedAt',
          'lessonsCount',
        ],
        properties: {
          id: { type: 'string', pattern: '^\\d+$', example: '20' },
          courseId: { type: 'string', pattern: '^\\d+$', example: '10' },
          title: { type: 'string', example: 'Getting Started' },
          orderIndex: { type: 'integer', example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          lessonsCount: { type: 'integer', example: 3 },
        },
      },
      CreateCourseModuleRequest: {
        type: 'object',
        required: ['title', 'orderIndex'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200, example: 'Getting Started' },
          orderIndex: { type: 'integer', minimum: 1, example: 1 },
        },
      },
      UpdateCourseModuleRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200, example: 'Setup' },
          orderIndex: { type: 'integer', minimum: 1, example: 2 },
        },
      },
      ReorderCourseModulesRequest: {
        type: 'object',
        required: ['moduleOrders'],
        properties: {
          moduleOrders: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['moduleId', 'orderIndex'],
              properties: {
                moduleId: { type: 'string', pattern: '^\\d+$', example: '20' },
                orderIndex: { type: 'integer', minimum: 1, example: 1 },
              },
            },
          },
        },
      },
      CourseModuleListResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Course modules retrieved successfully' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/CourseModuleItem' },
          },
        },
      },
      CourseModuleResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Course module created successfully' },
          data: {
            $ref: '#/components/schemas/CourseModuleItem',
          },
        },
      },
      CourseLessonItem: {
        type: 'object',
        required: [
          'id',
          'moduleId',
          'title',
          'lessonType',
          'contentText',
          'videoUrl',
          'durationSeconds',
          'orderIndex',
          'isPreview',
          'createdAt',
          'updatedAt',
          'resourcesCount',
          'progressCount',
          'hasQuiz',
        ],
        properties: {
          id: { type: 'string', pattern: '^\\d+$', example: '100' },
          moduleId: { type: 'string', pattern: '^\\d+$', example: '20' },
          title: { type: 'string', example: 'Introduction Video' },
          lessonType: {
            type: 'string',
            enum: ['video', 'article', 'quiz'],
            example: 'video',
          },
          contentText: { type: 'string', nullable: true },
          videoUrl: { type: 'string', format: 'uri', nullable: true },
          durationSeconds: { type: 'integer', example: 300 },
          orderIndex: { type: 'integer', example: 1 },
          isPreview: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          resourcesCount: { type: 'integer', example: 0 },
          progressCount: { type: 'integer', example: 0 },
          hasQuiz: { type: 'boolean', example: false },
        },
      },
      CreateCourseLessonRequest: {
        type: 'object',
        required: ['title', 'lessonType', 'orderIndex'],
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200, example: 'Introduction Video' },
          lessonType: {
            type: 'string',
            enum: ['video', 'article', 'quiz'],
            example: 'video',
          },
          contentText: { type: 'string', maxLength: 50000, nullable: true },
          videoUrl: { type: 'string', format: 'uri', nullable: true },
          durationSeconds: { type: 'integer', minimum: 0, default: 0, example: 300 },
          orderIndex: { type: 'integer', minimum: 1, example: 1 },
          isPreview: { type: 'boolean', example: false },
        },
      },
      UpdateCourseLessonRequest: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1, maxLength: 200, example: 'Read Me First' },
          lessonType: { type: 'string', enum: ['video', 'article', 'quiz'] },
          contentText: { type: 'string', maxLength: 50000, nullable: true },
          videoUrl: { type: 'string', format: 'uri', nullable: true },
          durationSeconds: { type: 'integer', minimum: 0, example: 0 },
          orderIndex: { type: 'integer', minimum: 1, example: 2 },
          isPreview: { type: 'boolean', example: false },
        },
      },
      ReorderCourseLessonsRequest: {
        type: 'object',
        required: ['lessonOrders'],
        properties: {
          lessonOrders: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['lessonId', 'orderIndex'],
              properties: {
                lessonId: { type: 'string', pattern: '^\\d+$', example: '100' },
                orderIndex: { type: 'integer', minimum: 1, example: 1 },
              },
            },
          },
        },
      },
      CourseLessonListResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Module lessons retrieved successfully' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/CourseLessonItem' },
          },
        },
      },
      CourseLessonResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Lesson created successfully' },
          data: {
            $ref: '#/components/schemas/CourseLessonItem',
          },
        },
      },
      LessonResourceItem: {
        type: 'object',
        required: [
          'id',
          'lessonId',
          'fileName',
          'fileUrl',
          'resourceType',
          'orderIndex',
          'createdAt',
          'updatedAt',
        ],
        properties: {
          id: { type: 'string', pattern: '^\\d+$', example: '501' },
          lessonId: { type: 'string', pattern: '^\\d+$', example: '100' },
          fileName: { type: 'string', example: 'course-outline.pdf' },
          fileUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://cdn.example.com/course-outline.pdf',
          },
          resourceType: {
            type: 'string',
            enum: ['file', 'video', 'material'],
            nullable: true,
            example: 'file',
          },
          orderIndex: { type: 'integer', example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateLessonResourceRequest: {
        type: 'object',
        required: ['fileName', 'fileUrl'],
        properties: {
          fileName: { type: 'string', minLength: 1, maxLength: 255, example: 'course-outline.pdf' },
          fileUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://cdn.example.com/course-outline.pdf',
          },
          resourceType: {
            type: 'string',
            enum: ['file', 'video', 'material'],
            example: 'file',
          },
          orderIndex: { type: 'integer', minimum: 1, example: 1 },
        },
      },
      UpdateLessonResourceRequest: {
        type: 'object',
        properties: {
          fileName: {
            type: 'string',
            minLength: 1,
            maxLength: 255,
            example: 'updated-outline.pdf',
          },
          fileUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://cdn.example.com/updated-outline.pdf',
          },
          resourceType: {
            type: 'string',
            enum: ['file', 'video', 'material'],
            example: 'material',
          },
          orderIndex: { type: 'integer', minimum: 1, example: 2 },
        },
      },
      LessonResourceListResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Lesson resources retrieved successfully' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/LessonResourceItem' },
          },
        },
      },
      LessonResourceResponse: {
        type: 'object',
        required: ['success', 'message', 'data'],
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Lesson resource created successfully' },
          data: {
            $ref: '#/components/schemas/LessonResourceItem',
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
            maxItems: 200,
            uniqueItems: true,
            items: {
              type: 'string',
              pattern: '^[a-z][a-z0-9_.]*$',
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
            maxItems: 200,
            uniqueItems: true,
            items: {
              type: 'string',
              pattern: '^[a-z][a-z0-9_.]*$',
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
        description:
          'Permission code must match `module.action` exactly. Example: code=`course.publish`, module=`course`, action=`publish`.',
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
        description:
          'When changing permission identity, provide `code`, `module`, and `action` together. Permission code must match `module.action`.',
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
          categoryId: { type: 'string', pattern: '^\\d+$', nullable: true, example: '3' },
          isActive: { type: 'boolean', default: true },
        },
      },
      UpdateQuestionBankRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          title: { type: 'string', minLength: 2, maxLength: 200 },
          description: { type: 'string', maxLength: 500, nullable: true },
          categoryId: { type: 'string', pattern: '^\\d+$', nullable: true },
          isActive: { type: 'boolean' },
        },
      },
      QuestionOptionInput: {
        type: 'object',
        required: ['content', 'isCorrect', 'orderIndex'],
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 5000, example: 'Paris' },
          isCorrect: { type: 'boolean', example: true },
          orderIndex: { type: 'integer', minimum: 1, example: 1 },
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
          content: {
            type: 'string',
            minLength: 1,
            maxLength: 10000,
            example: 'What is the capital of France?',
          },
          explanation: { type: 'string', maxLength: 500, nullable: true },
          defaultPoints: { type: 'integer', minimum: 1, default: 1 },
          options: {
            type: 'array',
            items: { $ref: '#/components/schemas/QuestionOptionInput' },
            minItems: 2,
            description:
              'Required for single_choice (exactly 1 correct) and multiple_choice (at least 1 correct). Must NOT be provided for essay.',
          },
        },
      },
      UpdateQuestionRequest: {
        type: 'object',
        minProperties: 1,
        description:
          'Updates question metadata only (content, explanation, defaultPoints). To manage options use the dedicated /options endpoints.',
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 10000 },
          explanation: { type: 'string', maxLength: 500, nullable: true },
          defaultPoints: { type: 'integer', minimum: 1 },
        },
      },
      CreateOptionRequest: {
        type: 'object',
        required: ['content', 'isCorrect', 'orderIndex'],
        description:
          'Add an option to a single_choice or multiple_choice question. Business rules: essay questions cannot have options. single_choice cannot have more than 1 correct option.',
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 5000, example: 'Paris' },
          isCorrect: { type: 'boolean', example: true },
          orderIndex: { type: 'integer', minimum: 1, example: 1 },
        },
      },
      UpdateOptionRequest: {
        type: 'object',
        minProperties: 1,
        description:
          'Update an option. Business rules: cannot unset the only correct option on single_choice. Cannot set isCorrect=true if another correct option already exists on single_choice.',
        properties: {
          content: { type: 'string', minLength: 1, maxLength: 5000, example: 'London' },
          isCorrect: { type: 'boolean', example: false },
          orderIndex: { type: 'integer', minimum: 1, example: 2 },
        },
      },

      // ========================
      // AI Chat Schemas
      // ========================
      ChatSession: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1' },
          userId: { type: 'string', example: '3' },
          title: { type: 'string', nullable: true, example: 'Hỏi về chính sách công ty' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ChatMessage: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1' },
          sessionId: { type: 'string', example: '1' },
          role: { type: 'string', enum: ['user', 'assistant'], example: 'user' },
          content: { type: 'string', example: 'Chính sách nghỉ phép của công ty như thế nào?' },
          sources: {
            type: 'array',
            nullable: true,
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                similarity: { type: 'number' },
              },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      SendMessageRequest: {
        type: 'object',
        required: ['message'],
        properties: {
          message: {
            type: 'string',
            minLength: 1,
            maxLength: 2000,
            example: 'Chính sách nghỉ phép của công ty như thế nào?',
          },
          sessionId: {
            type: 'string',
            nullable: true,
            description: 'Session ID to continue conversation. Null to create new session.',
            example: '1',
          },
        },
      },
      CreateSessionRequest: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            maxLength: 200,
            example: 'Hỏi về quy trình onboarding',
          },
        },
      },
      CourseAskRequest: {
        type: 'object',
        required: ['question'],
        properties: {
          question: {
            type: 'string',
            minLength: 1,
            maxLength: 2000,
            example: 'Bài học này nói về gì?',
          },
        },
      },

      // ========================
      // Company Document Schemas
      // ========================
      CompanyDocument: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '1' },
          title: { type: 'string', example: 'Chính sách nghỉ phép 2026' },
          content: { type: 'string', example: 'Nhân viên được nghỉ phép tối đa 12 ngày/năm...' },
          category: { type: 'string', nullable: true, example: 'HR Policy' },
          isActive: { type: 'boolean', example: true },
          createdById: { type: 'string', example: '1' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateCompanyDocumentRequest: {
        type: 'object',
        required: ['title', 'content'],
        properties: {
          title: { type: 'string', minLength: 2, maxLength: 300, example: 'Chính sách bảo mật' },
          content: {
            type: 'string',
            minLength: 1,
            maxLength: 100000,
            example: 'Nội dung chính sách bảo mật thông tin...',
          },
          category: { type: 'string', maxLength: 100, example: 'Security' },
          isActive: { type: 'boolean', example: true },
        },
      },
      UpdateCompanyDocumentRequest: {
        type: 'object',
        minProperties: 1,
        description: 'At least one field must be provided.',
        properties: {
          title: { type: 'string', minLength: 2, maxLength: 300 },
          content: { type: 'string', minLength: 1, maxLength: 100000 },
          category: { type: 'string', maxLength: 100, nullable: true },
          isActive: { type: 'boolean' },
        },
      },

      // ========================
      // Dashboard Schemas
      // ========================
      AdminDashboardStats: {
        type: 'object',
        properties: {
          users: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 150 },
              active: { type: 'integer', example: 120 },
              inactive: { type: 'integer', example: 30 },
              byRole: {
                type: 'object',
                properties: {
                  admin: { type: 'integer', example: 2 },
                  trainer: { type: 'integer', example: 10 },
                  employee: { type: 'integer', example: 100 },
                  student: { type: 'integer', example: 38 },
                },
              },
            },
          },
          courses: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 25 },
              published: { type: 'integer', example: 18 },
              draft: { type: 'integer', example: 5 },
              archived: { type: 'integer', example: 2 },
            },
          },
          enrollments: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 500 },
              assigned: { type: 'integer', example: 100 },
              inProgress: { type: 'integer', example: 200 },
              completed: { type: 'integer', example: 150 },
              cancelled: { type: 'integer', example: 30 },
              expired: { type: 'integer', example: 20 },
              completionRate: { type: 'number', example: 30.0 },
            },
          },
          riskSummary: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 50 },
              high: { type: 'integer', example: 5 },
              medium: { type: 'integer', example: 15 },
              low: { type: 'integer', example: 30 },
            },
          },
        },
      },
      ManagerDashboardStats: {
        type: 'object',
        properties: {
          learners: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 30 },
              active: { type: 'integer', example: 25 },
              inactive: { type: 'integer', example: 5 },
            },
          },
          overdue: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 3 },
              enrollments: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    userId: { type: 'string' },
                    userName: { type: 'string', example: 'Nguyễn Văn A' },
                    courseId: { type: 'string' },
                    courseTitle: { type: 'string', example: 'Bảo mật thông tin' },
                    dueAt: { type: 'string', format: 'date-time' },
                    daysOverdue: { type: 'integer', example: 5 },
                  },
                },
              },
            },
          },
          roadmapCompletion: {
            type: 'object',
            properties: {
              totalAssignments: { type: 'integer', example: 20 },
              completed: { type: 'integer', example: 8 },
              inProgress: { type: 'integer', example: 10 },
              assigned: { type: 'integer', example: 2 },
              completionRate: { type: 'number', example: 40.0 },
            },
          },
          risks: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 10 },
              high: { type: 'integer', example: 2 },
              medium: { type: 'integer', example: 3 },
              low: { type: 'integer', example: 5 },
              learners: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    enrollmentId: { type: 'string' },
                    userId: { type: 'string' },
                    userName: { type: 'string' },
                    riskLevel: { type: 'string', enum: ['high', 'medium', 'low'] },
                    riskScore: { type: 'number', example: 78 },
                    courseTitle: { type: 'string' },
                    reasons: { nullable: true },
                    interventions: { nullable: true },
                    calculatedAt: { type: 'string', format: 'date-time', nullable: true },
                  },
                },
              },
            },
          },
        },
      },
      TrainerDashboardStats: {
        type: 'object',
        properties: {
          courses: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 5 },
              published: { type: 'integer', example: 3 },
              draft: { type: 'integer', example: 2 },
              archived: { type: 'integer', example: 0 },
            },
          },
          pendingGrading: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 4 },
              quizAttempts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    attemptId: { type: 'string' },
                    studentId: { type: 'string' },
                    studentName: { type: 'string', example: 'Trần Thị B' },
                    courseId: { type: 'string' },
                    courseTitle: { type: 'string' },
                    quizTitle: { type: 'string', example: 'Bài kiểm tra giữa kỳ' },
                    submittedAt: { type: 'string', format: 'date-time' },
                    daysWaiting: { type: 'integer', example: 2 },
                  },
                },
              },
            },
          },
          enrollments: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 80 },
              assigned: { type: 'integer', example: 15 },
              inProgress: { type: 'integer', example: 40 },
              completed: { type: 'integer', example: 25 },
              averageProgress: { type: 'number', example: 55.3 },
            },
          },
          passRate: {
            type: 'object',
            properties: {
              totalAttempts: { type: 'integer', example: 50 },
              passed: { type: 'integer', example: 35 },
              failed: { type: 'integer', example: 15 },
              passPercentage: { type: 'number', example: 70.0 },
            },
          },
        },
      },
      EmployeeDashboardStats: {
        type: 'object',
        properties: {
          myCourses: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 5 },
              assigned: { type: 'integer', example: 1 },
              inProgress: { type: 'integer', example: 2 },
              completed: { type: 'integer', example: 2 },
              courses: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    enrollmentId: { type: 'string' },
                    courseId: { type: 'string' },
                    courseTitle: { type: 'string' },
                    courseThumbnail: { type: 'string', nullable: true },
                    status: { type: 'string', enum: ['assigned', 'in_progress', 'completed'] },
                    progress: { type: 'number', example: 75 },
                    dueAt: { type: 'string', format: 'date-time', nullable: true },
                    enrolledAt: { type: 'string', format: 'date-time' },
                    completedAt: { type: 'string', format: 'date-time', nullable: true },
                  },
                },
              },
            },
          },
          myRoadmaps: {
            type: 'object',
            properties: {
              total: { type: 'integer' },
              assigned: { type: 'integer' },
              inProgress: { type: 'integer' },
              completed: { type: 'integer' },
              roadmaps: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    assignmentId: { type: 'string' },
                    roadmapId: { type: 'string' },
                    roadmapTitle: { type: 'string' },
                    targetPosition: { type: 'string', nullable: true },
                    status: { type: 'string' },
                    totalCourses: { type: 'integer' },
                    completedCourses: { type: 'integer' },
                    progressPercent: { type: 'number' },
                    assignedAt: { type: 'string', format: 'date-time' },
                    completedAt: { type: 'string', format: 'date-time', nullable: true },
                  },
                },
              },
            },
          },
          progressSummary: {
            type: 'object',
            properties: {
              totalTimeSpentMinutes: { type: 'integer', example: 1200 },
              completedLessons: { type: 'integer', example: 45 },
              averageProgress: { type: 'number', example: 68 },
              recentActivity: { type: 'string', format: 'date-time', nullable: true },
              upcomingDeadlines: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    courseId: { type: 'string' },
                    courseTitle: { type: 'string' },
                    dueAt: { type: 'string', format: 'date-time' },
                    daysRemaining: { type: 'integer', example: 5 },
                    currentProgress: { type: 'number', example: 40 },
                  },
                },
              },
            },
          },
          certificates: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 2 },
              certificates: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    certificateId: { type: 'string' },
                    certificateCode: { type: 'string', example: 'CERT-2026-001' },
                    courseId: { type: 'string' },
                    courseTitle: { type: 'string' },
                    issuedAt: { type: 'string', format: 'date-time' },
                    pdfUrl: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
        },
      },

      // ========================
      // AI Insights Schemas
      // ========================
      AiInsightItem: {
        type: 'object',
        required: ['type', 'title', 'description', 'suggestion'],
        properties: {
          type: {
            type: 'string',
            enum: ['warning', 'success', 'info', 'action'],
            example: 'warning',
          },
          title: { type: 'string', example: 'Tỷ lệ hoàn thành thấp' },
          description: {
            type: 'string',
            example: 'Khóa "Bảo mật thông tin" completion chỉ 23% — thấp hơn TB 45%.',
          },
          suggestion: {
            type: 'string',
            example: 'Cân nhắc chia nhỏ nội dung hoặc thêm quiz tương tác.',
          },
        },
      },
      AiInsightsResponse: {
        type: 'object',
        properties: {
          insights: {
            type: 'array',
            items: { $ref: '#/components/schemas/AiInsightItem' },
          },
          generatedAt: { type: 'string', format: 'date-time' },
          cached: { type: 'boolean', example: false },
          scope: { type: 'string', enum: ['admin', 'manager', 'trainer'], example: 'admin' },
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
    [`${API_PREFIX}/auth/users/{id}/status`]: {
      patch: {
        tags: ['Auth'],
        summary: 'Update user active status',
        description: 'Requires the `user.assign_role` permission.',
        operationId: 'updateUserStatus',
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
                $ref: '#/components/schemas/UpdateUserStatusRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User status updated successfully.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UpdateUserStatusResponse',
                },
              },
            },
          },
          '400': {
            description: 'Invalid request body or path parameters.',
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
            description: 'Insufficient permission.',
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
              enum: ['title', 'createdAt', 'updatedAt', 'publishedAt', 'status'],
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
          {
            name: 'trainerId',
            in: 'query',
            schema: { type: 'string', pattern: '^\\d+$' },
          },
          {
            name: 'categoryId',
            in: 'query',
            schema: { type: 'string', pattern: '^\\d+$' },
          },
          {
            name: 'ownerDepartmentId',
            in: 'query',
            schema: { type: 'string', pattern: '^\\d+$' },
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
        description: 'Create a course draft. Publishing is handled separately.',
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
          {
            name: 'expand',
            in: 'query',
            schema: {
              type: 'string',
              example: 'modules,lessons,resources',
            },
            description:
              'Comma-separated expand list: modules, lessons, resources, quiz, tags, all.',
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
        summary: 'Get course detail',
        description:
          'Get detailed course information, optionally expanded with nested modules, lessons, resources, quiz, and tags.',
        operationId: 'getCourseDetail',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Course ID as a numeric string.',
          },
          {
            name: 'expand',
            in: 'query',
            schema: {
              type: 'string',
              example: 'all',
            },
            description:
              'Comma-separated expand list: modules, lessons, resources, quiz, tags, all.',
          },
        ],
        responses: {
          '200': {
            description: 'Course detail retrieved successfully',
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
    [`${API_PREFIX}/courses/{id}/status`]: {
      patch: {
        tags: ['Courses'],
        summary: 'Update course status',
        description:
          'Publish, archive, or move a course back to draft. Publishing validates the course content first.',
        operationId: 'updateCourseStatus',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Course ID as a numeric string.',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CourseStatusUpdateRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Course status updated successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CourseSuccessResponse' },
              },
            },
          },
          '400': { description: 'Validation failed or course cannot be published yet.' },
          '401': { description: 'Missing or invalid token.' },
          '403': { description: 'Insufficient permission or ownership.' },
          '404': { description: 'Course not found.' },
        },
      },
    },
    [`${API_PREFIX}/courses/{id}/tags`]: {
      post: {
        tags: ['Courses'],
        summary: 'Assign tag to course',
        operationId: 'addCourseTag',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Course ID as a numeric string.',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CourseTagAssignmentRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Tag added to course successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CourseTagAssignmentResponse' },
              },
            },
          },
          '400': { description: 'Validation failed or tag already assigned.' },
          '401': { description: 'Missing or invalid token.' },
          '403': { description: 'Insufficient permission or ownership.' },
          '404': { description: 'Course or tag not found.' },
        },
      },
    },
    [`${API_PREFIX}/courses/{id}/tags/{tagId}`]: {
      delete: {
        tags: ['Courses'],
        summary: 'Remove tag from course',
        operationId: 'removeCourseTag',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
          {
            name: 'tagId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        responses: {
          '200': {
            description: 'Tag removed from course successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RemoveLinkResponse' },
              },
            },
          },
          '401': { description: 'Missing or invalid token.' },
          '403': { description: 'Insufficient permission or ownership.' },
          '404': { description: 'Course or course-tag link not found.' },
        },
      },
    },
    [`${API_PREFIX}/courses/{id}/modules`]: {
      get: {
        tags: ['Courses'],
        summary: 'List course modules',
        operationId: 'listCourseModules',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Course ID as a numeric string.',
          },
        ],
        responses: {
          '200': {
            description: 'Course modules retrieved successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CourseModuleListResponse' },
              },
            },
          },
          '401': { description: 'Missing or invalid token.' },
          '404': { description: 'Course not found.' },
        },
      },
      post: {
        tags: ['Courses'],
        summary: 'Create course module',
        operationId: 'createCourseModule',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Course ID as a numeric string.',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCourseModuleRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Course module created successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CourseModuleResponse' },
              },
            },
          },
          '400': { description: 'Validation failed or duplicate orderIndex.' },
          '401': { description: 'Missing or invalid token.' },
          '403': { description: 'Insufficient permission or ownership.' },
          '404': { description: 'Course not found.' },
        },
      },
    },
    [`${API_PREFIX}/courses/{id}/modules/reorder`]: {
      post: {
        tags: ['Courses'],
        summary: 'Reorder course modules',
        operationId: 'reorderCourseModules',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Course ID as a numeric string.',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReorderCourseModulesRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Course modules reordered successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CourseModuleListResponse' },
              },
            },
          },
          '400': { description: 'Validation failed.' },
          '401': { description: 'Missing or invalid token.' },
          '403': { description: 'Insufficient permission or ownership.' },
          '404': { description: 'Course or modules not found.' },
        },
      },
    },
    [`${API_PREFIX}/courses/{id}/modules/{moduleId}`]: {
      patch: {
        tags: ['Courses'],
        summary: 'Update course module',
        operationId: 'updateCourseModule',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
          {
            name: 'moduleId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateCourseModuleRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Course module updated successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CourseModuleResponse' },
              },
            },
          },
          '400': { description: 'Validation failed or duplicate orderIndex.' },
          '401': { description: 'Missing or invalid token.' },
          '403': { description: 'Insufficient permission or ownership.' },
          '404': { description: 'Course or module not found.' },
        },
      },
      delete: {
        tags: ['Courses'],
        summary: 'Delete course module',
        operationId: 'deleteCourseModule',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
          {
            name: 'moduleId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        responses: {
          '200': {
            description: 'Course module deleted successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RemoveLinkResponse' },
              },
            },
          },
          '400': { description: 'Module still contains lessons.' },
          '401': { description: 'Missing or invalid token.' },
          '403': { description: 'Insufficient permission or ownership.' },
          '404': { description: 'Course or module not found.' },
        },
      },
    },
    [`${API_PREFIX}/courses/{id}/modules/{moduleId}/lessons`]: {
      get: {
        tags: ['Courses'],
        summary: 'List module lessons',
        operationId: 'listCourseLessons',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
          {
            name: 'moduleId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        responses: {
          '200': {
            description: 'Module lessons retrieved successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CourseLessonListResponse' },
              },
            },
          },
          '401': { description: 'Missing or invalid token.' },
          '404': { description: 'Course or module not found.' },
        },
      },
      post: {
        tags: ['Courses'],
        summary: 'Create lesson in module',
        operationId: 'createCourseLesson',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
          {
            name: 'moduleId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCourseLessonRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Lesson created successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CourseLessonResponse' },
              },
            },
          },
          '400': { description: 'Validation failed or duplicate orderIndex.' },
          '401': { description: 'Missing or invalid token.' },
          '403': { description: 'Insufficient permission or ownership.' },
          '404': { description: 'Course or module not found.' },
        },
      },
    },
    [`${API_PREFIX}/courses/{id}/modules/{moduleId}/lessons/reorder`]: {
      post: {
        tags: ['Courses'],
        summary: 'Reorder module lessons',
        operationId: 'reorderCourseLessons',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^\\d+$' } },
          {
            name: 'moduleId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReorderCourseLessonsRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Module lessons reordered successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CourseLessonListResponse' },
              },
            },
          },
          '400': { description: 'Validation failed.' },
          '401': { description: 'Missing or invalid token.' },
          '403': { description: 'Insufficient permission or ownership.' },
          '404': { description: 'Course, module, or lessons not found.' },
        },
      },
    },
    [`${API_PREFIX}/courses/{id}/modules/{moduleId}/lessons/{lessonId}/resources`]: {
      get: {
        tags: ['Courses'],
        summary: 'List lesson resources',
        operationId: 'listLessonResources',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^\\d+$' } },
          {
            name: 'moduleId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
          {
            name: 'lessonId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        responses: {
          '200': {
            description: 'Lesson resources retrieved successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LessonResourceListResponse' },
              },
            },
          },
          '401': { description: 'Missing or invalid token.' },
          '404': { description: 'Course, module, or lesson not found.' },
        },
      },
      post: {
        tags: ['Courses'],
        summary: 'Create lesson resource metadata',
        description:
          'Creates metadata for a lesson resource. Supports file, video, and material types.',
        operationId: 'createLessonResource',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^\\d+$' } },
          {
            name: 'moduleId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
          {
            name: 'lessonId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateLessonResourceRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Lesson resource created successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LessonResourceResponse' },
              },
            },
          },
          '400': { description: 'Validation failed or duplicate orderIndex.' },
          '401': { description: 'Missing or invalid token.' },
          '403': { description: 'Insufficient permission or ownership.' },
          '404': { description: 'Course, module, or lesson not found.' },
        },
      },
    },
    [`${API_PREFIX}/courses/{id}/modules/{moduleId}/lessons/{lessonId}/resources/{resourceId}`]: {
      patch: {
        tags: ['Courses'],
        summary: 'Update lesson resource metadata',
        operationId: 'updateLessonResource',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^\\d+$' } },
          {
            name: 'moduleId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
          {
            name: 'lessonId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
          {
            name: 'resourceId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateLessonResourceRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Lesson resource updated successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LessonResourceResponse' },
              },
            },
          },
          '400': { description: 'Validation failed or duplicate orderIndex.' },
          '401': { description: 'Missing or invalid token.' },
          '403': { description: 'Insufficient permission or ownership.' },
          '404': { description: 'Course, module, lesson, or resource not found.' },
        },
      },
      delete: {
        tags: ['Courses'],
        summary: 'Delete lesson resource metadata',
        operationId: 'deleteLessonResource',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^\\d+$' } },
          {
            name: 'moduleId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
          {
            name: 'lessonId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
          {
            name: 'resourceId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        responses: {
          '200': {
            description: 'Lesson resource deleted successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RemoveLinkResponse' },
              },
            },
          },
          '401': { description: 'Missing or invalid token.' },
          '403': { description: 'Insufficient permission or ownership.' },
          '404': { description: 'Course, module, lesson, or resource not found.' },
        },
      },
    },
    [`${API_PREFIX}/courses/{id}/modules/{moduleId}/lessons/{lessonId}`]: {
      patch: {
        tags: ['Courses'],
        summary: 'Update lesson in module',
        operationId: 'updateCourseLesson',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^\\d+$' } },
          {
            name: 'moduleId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
          {
            name: 'lessonId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateCourseLessonRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Lesson updated successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CourseLessonResponse' },
              },
            },
          },
          '400': { description: 'Validation failed or duplicate orderIndex.' },
          '401': { description: 'Missing or invalid token.' },
          '403': { description: 'Insufficient permission or ownership.' },
          '404': { description: 'Course, module, or lesson not found.' },
        },
      },
      delete: {
        tags: ['Courses'],
        summary: 'Delete lesson in module',
        operationId: 'deleteCourseLesson',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', pattern: '^\\d+$' } },
          {
            name: 'moduleId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
          {
            name: 'lessonId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
          },
        ],
        responses: {
          '200': {
            description: 'Lesson deleted successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RemoveLinkResponse' },
              },
            },
          },
          '400': { description: 'Lesson is linked to resources, progress, or quiz.' },
          '401': { description: 'Missing or invalid token.' },
          '403': { description: 'Insufficient permission or ownership.' },
          '404': { description: 'Course, module, or lesson not found.' },
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
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Filter by user ID (admin/trainer only)',
          },
          { name: 'courseId', in: 'query', schema: { type: 'string', pattern: '^\\d+$' } },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['assigned', 'in_progress', 'completed', 'cancelled', 'expired'],
            },
          },
          {
            name: 'departmentId',
            in: 'query',
            schema: { type: 'string', pattern: '^\\d+$' },
          },
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
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Enrollment ID as numeric string',
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
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Enrollment ID as numeric string',
          },
          {
            name: 'lessonId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Lesson ID as numeric string',
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
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Enrollment ID as numeric string',
          },
          {
            name: 'lessonId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Lesson ID as numeric string',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                minProperties: 1,
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
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Enrollment ID as numeric string',
          },
          {
            name: 'lessonId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Lesson ID as numeric string',
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
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Enrollment ID as numeric string',
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
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Course ID as numeric string',
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
                    items: { type: 'string', pattern: '^\\d+$' },
                    minItems: 1,
                    maxItems: 500,
                    uniqueItems: true,
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
    [`${API_PREFIX}/enrollments/courses/{courseId}/self-enroll`]: {
      post: {
        tags: ['Enrollments'],
        summary: 'Self-enroll into a course',
        description: [
          'Allows a user to enroll themselves into a published course.',
          '**Requirements:** Course must have `status = published`.',
          '**Duplicate prevention:** Returns 409 error if user is already enrolled.',
          '**Auto-assignment:** The `assignedByUserId` is set to the user themselves.',
        ].join(' '),
        operationId: 'selfEnroll',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'courseId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Course ID as numeric string',
          },
        ],
        responses: {
          '201': {
            description: 'Successfully enrolled in course',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Successfully enrolled in course' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: '456' },
                        userId: { type: 'string', example: '123' },
                        courseId: { type: 'string', example: '1' },
                        status: { type: 'string', example: 'assigned' },
                        enrolledAt: { type: 'string', format: 'date-time' },
                        course: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: '1' },
                            title: { type: 'string', example: 'Introduction to Safety' },
                            slug: { type: 'string', example: 'introduction-to-safety' },
                            thumbnailUrl: {
                              type: 'string',
                              format: 'uri',
                              nullable: true,
                              example: 'https://images.unsplash.com/photo-1234',
                            },
                            description: {
                              type: 'string',
                              nullable: true,
                              example: 'Learn basic safety procedures...',
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
            description: 'Unauthorized - missing or invalid token',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Forbidden - course is not published or not available',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'This course is not available for enrollment',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Course not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '409': {
            description: 'Conflict - user is already enrolled in this course',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'You are already enrolled in this course',
                    },
                  },
                },
              },
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
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Enrollment ID as numeric string',
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
    [`${API_PREFIX}/tags`]: {
      get: {
        tags: ['Tags'],
        summary: 'List all tags',
        description: 'Get all tags with course count',
        operationId: 'getTags',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Tags retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: '1' },
                          name: { type: 'string', example: 'JavaScript' },
                          slug: { type: 'string', example: 'javascript' },
                          courseCount: { type: 'number', example: 5 },
                          createdAt: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                    message: { type: 'string', example: 'Tags retrieved successfully' },
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
      post: {
        tags: ['Tags'],
        summary: 'Create tag',
        description: 'Create a new tag. Slug is auto-generated. Requires admin role.',
        operationId: 'createTag',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', minLength: 1, maxLength: 100, example: 'TypeScript' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Tag created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: '10' },
                        name: { type: 'string', example: 'TypeScript' },
                        slug: { type: 'string', example: 'typescript' },
                        createdAt: { type: 'string', format: 'date-time' },
                      },
                    },
                    message: { type: 'string', example: 'Tag created successfully' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Tag with this name already exists',
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
            description: 'Forbidden - Admin role required',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/tags/{id}`]: {
      get: {
        tags: ['Tags'],
        summary: 'Get tag by ID',
        description: 'Get tag details with course count',
        operationId: 'getTagById',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Tag ID',
          },
        ],
        responses: {
          '200': {
            description: 'Tag retrieved successfully',
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
                        name: { type: 'string', example: 'JavaScript' },
                        slug: { type: 'string', example: 'javascript' },
                        courseCount: { type: 'number', example: 5 },
                        createdAt: { type: 'string', format: 'date-time' },
                      },
                    },
                    message: { type: 'string', example: 'Tag retrieved successfully' },
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
            description: 'Tag not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      put: {
        tags: ['Tags'],
        summary: 'Update tag',
        description: 'Update tag name. Slug is auto-regenerated. Requires admin role.',
        operationId: 'updateTag',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Tag ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 1, maxLength: 100, example: 'React.js' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Tag updated successfully',
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
                        name: { type: 'string', example: 'React.js' },
                        slug: { type: 'string', example: 'react-js' },
                        createdAt: { type: 'string', format: 'date-time' },
                      },
                    },
                    message: { type: 'string', example: 'Tag updated successfully' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Tag with this name already exists',
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
            description: 'Forbidden - Admin role required',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Tag not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      delete: {
        tags: ['Tags'],
        summary: 'Delete tag',
        description:
          'Delete a tag. Cannot delete if tag is linked to courses. Requires admin role.',
        operationId: 'deleteTag',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Tag ID',
          },
        ],
        responses: {
          '204': {
            description: 'Tag deleted successfully',
          },
          '400': {
            description: 'Cannot delete tag linked to courses',
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
            description: 'Forbidden - Admin role required',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Tag not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
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
                    maxItems: 100,
                    uniqueItems: true,
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
          { name: 'categoryId', in: 'query', schema: { type: 'string', pattern: '^\\d+$' } },
          {
            name: 'ownerTrainerId',
            in: 'query',
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Admin only filter',
          },
          { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 } },
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
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Question bank ID as numeric string',
          },
        ],
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
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Question bank ID as numeric string',
          },
        ],
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
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Question bank ID as numeric string',
          },
        ],
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
          {
            name: 'bankId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Question bank ID as numeric string',
          },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
          {
            name: 'questionType',
            in: 'query',
            schema: { type: 'string', enum: ['single_choice', 'multiple_choice', 'essay'] },
          },
          { name: 'search', in: 'query', schema: { type: 'string', maxLength: 100 } },
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
        parameters: [
          {
            name: 'bankId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Question bank ID as numeric string',
          },
        ],
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
          {
            name: 'bankId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Question bank ID as numeric string',
          },
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Question ID as numeric string',
          },
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
          {
            name: 'bankId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Question bank ID as numeric string',
          },
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Question ID as numeric string',
          },
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
          {
            name: 'bankId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Question bank ID as numeric string',
          },
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Question ID as numeric string',
          },
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
          {
            name: 'bankId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Question bank ID as numeric string',
          },
          {
            name: 'questionId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Question ID as numeric string',
          },
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
          {
            name: 'bankId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Question bank ID as numeric string',
          },
          {
            name: 'questionId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Question ID as numeric string',
          },
          {
            name: 'optionId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Option ID as numeric string',
          },
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
          {
            name: 'bankId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Question bank ID as numeric string',
          },
          {
            name: 'questionId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Question ID as numeric string',
          },
          {
            name: 'optionId',
            in: 'path',
            required: true,
            schema: { type: 'string', pattern: '^\\d+$' },
            description: 'Option ID as numeric string',
          },
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
    [`${API_PREFIX}/users/import`]: {
      post: {
        tags: ['Users'],
        summary: 'Import users from Excel',
        description: [
          'Imports users from an uploaded Excel file.',
          'Accepts `.xlsx` and `.xls` files via `multipart/form-data` using field name `file`.',
          'Departments are matched by name and auto-created when missing.',
          'Import is partial-success: invalid rows are skipped and returned in `errors`.',
          'Requires admin role.',
        ].join(' '),
        operationId: 'importUsers',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Excel file containing user rows to import.',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User import completed.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserImportSuccessResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid upload, malformed Excel file, or invalid row data.',
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
        },
      },
    },
    [`${API_PREFIX}/media/upload`]: {
      post: {
        tags: ['Media'],
        summary: 'Upload media file to Cloudinary',
        description: [
          'Uploads a single file to Cloudinary using `multipart/form-data` with field name `file`.',
          'Supported files include video, image, PDF, ZIP, Word, PowerPoint, and Excel.',
          'Use the returned `secureUrl` or `playbackUrl` in course `thumbnailUrl`, lesson `videoUrl`, or lesson resource `fileUrl`.',
          'Requires `course.update` permission.',
        ].join(' '),
        operationId: 'uploadMedia',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File to upload.',
                  },
                  folder: {
                    type: 'string',
                    example: 'staffup-lms/courses/module-1',
                    description: 'Optional Cloudinary folder override.',
                  },
                  publicId: {
                    type: 'string',
                    example: 'lesson-1',
                    description: 'Optional Cloudinary public ID without file extension.',
                  },
                  resourceType: {
                    type: 'string',
                    enum: ['auto', 'image', 'video', 'raw'],
                    example: 'video',
                    description:
                      'Optional Cloudinary resource type. When omitted, the backend infers it from the MIME type.',
                  },
                  overwrite: {
                    oneOf: [{ type: 'boolean' }, { type: 'string', enum: ['true', 'false'] }],
                    example: false,
                    description: 'Whether to overwrite an existing asset with the same public ID.',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'File uploaded successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MediaUploadSuccessResponse' },
              },
            },
          },
          '400': {
            description:
              'Invalid upload request, unsupported file type, or invalid multipart fields.',
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
          '500': {
            description: 'Cloudinary configuration or upstream upload failure.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/media`]: {
      get: {
        tags: ['Media'],
        summary: 'List media files from a Cloudinary folder',
        description: [
          'Returns uploaded assets from a Cloudinary folder prefix.',
          'Use this to fetch all videos of a course folder after manual upload or API upload.',
          'Defaults to `resourceType=video`.',
        ].join(' '),
        operationId: 'listMediaByFolder',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'folder',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Cloudinary folder prefix, for example `staffup-lms/courses/25`.',
          },
          {
            name: 'resourceType',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              enum: ['image', 'video', 'raw'],
              default: 'video',
            },
            description: 'Cloudinary resource type filter.',
          },
          {
            name: 'maxResults',
            in: 'query',
            required: false,
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 30,
            },
            description: 'Maximum number of assets to return per page.',
          },
          {
            name: 'nextCursor',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Pagination cursor returned by the previous request.',
          },
        ],
        responses: {
          '200': {
            description: 'Media retrieved successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MediaListSuccessResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid query parameters.',
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
          '500': {
            description: 'Cloudinary configuration or upstream API failure.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/media/folders`]: {
      get: {
        tags: ['Media'],
        summary: 'List Cloudinary folders',
        description: [
          'Returns folder names from Cloudinary.',
          'If `path` is omitted, the API returns root folders.',
          'If `path` is provided, the API returns subfolders inside that folder.',
        ].join(' '),
        operationId: 'listMediaFolders',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'path',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Optional parent folder path, for example `khóa học vuejs`.',
          },
          {
            name: 'maxResults',
            in: 'query',
            required: false,
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 100,
            },
            description: 'Maximum number of folders to return.',
          },
          {
            name: 'nextCursor',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Pagination cursor returned by the previous request.',
          },
        ],
        responses: {
          '200': {
            description: 'Media folders retrieved successfully.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MediaFolderListSuccessResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid query parameters.',
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
          '500': {
            description: 'Cloudinary configuration or upstream API failure.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
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
    [`${API_PREFIX}/departments`]: {
      get: {
        tags: ['Departments'],
        summary: 'List all departments',
        description: 'Get all departments with their managers',
        operationId: 'getDepartments',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Departments retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: '162' },
                          name: { type: 'string', example: 'Engineering' },
                          isActive: { type: 'boolean', example: true },
                          manager: {
                            type: 'object',
                            nullable: true,
                            properties: {
                              id: { type: 'string', example: '1' },
                              fullName: { type: 'string', example: 'John Manager' },
                              email: { type: 'string', example: 'manager@example.com' },
                            },
                          },
                          createdAt: { type: 'string', format: 'date-time' },
                          updatedAt: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                    message: { type: 'string', example: 'Departments retrieved successfully' },
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
      post: {
        tags: ['Departments'],
        summary: 'Create department',
        description: 'Create a new department. Requires admin role.',
        operationId: 'createDepartment',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', minLength: 2, maxLength: 100, example: 'Marketing' },
                  isActive: { type: 'boolean', example: true },
                  managerUserId: {
                    type: 'string',
                    nullable: true,
                    example: '5',
                    description: 'User ID of the department manager',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Department created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: '170' },
                        name: { type: 'string', example: 'Marketing' },
                        isActive: { type: 'boolean', example: true },
                        managerUserId: { type: 'string', nullable: true, example: '5' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                    message: { type: 'string', example: 'Department created successfully' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error or duplicate name',
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
            description: 'Forbidden - Admin role required',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Manager user not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/departments/{id}`]: {
      get: {
        tags: ['Departments'],
        summary: 'Get department by ID',
        description: 'Get department details including users, roadmaps, and courses',
        operationId: 'getDepartment',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Department ID',
          },
        ],
        responses: {
          '200': {
            description: 'Department retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: '162' },
                        name: { type: 'string', example: 'Engineering' },
                        isActive: { type: 'boolean', example: true },
                        manager: {
                          type: 'object',
                          nullable: true,
                          properties: {
                            id: { type: 'string' },
                            fullName: { type: 'string' },
                            email: { type: 'string' },
                          },
                        },
                        users: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              fullName: { type: 'string' },
                              email: { type: 'string' },
                            },
                          },
                        },
                        roadmaps: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              title: { type: 'string' },
                            },
                          },
                        },
                        ownedCourses: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              title: { type: 'string' },
                              slug: { type: 'string' },
                              thumbnailUrl: { type: 'string', nullable: true },
                              status: { type: 'string' },
                              estimatedDurationMinutes: { type: 'number', nullable: true },
                            },
                          },
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                    message: { type: 'string', example: 'Department retrieved successfully' },
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
            description: 'Department not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      put: {
        tags: ['Departments'],
        summary: 'Update department',
        description: 'Update department details. Requires admin or manager role.',
        operationId: 'updateDepartment',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Department ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 2, maxLength: 100 },
                  isActive: { type: 'boolean' },
                  managerUserId: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Department updated successfully',
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
                        name: { type: 'string' },
                        isActive: { type: 'boolean' },
                        managerUserId: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                    message: { type: 'string', example: 'Department updated successfully' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Validation error or duplicate name',
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
            description: 'Department or manager user not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      delete: {
        tags: ['Departments'],
        summary: 'Delete department',
        description:
          'Delete a department. Requires admin role. Cannot delete if department has users or courses.',
        operationId: 'deleteDepartment',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Department ID',
          },
        ],
        responses: {
          '200': {
            description: 'Department deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { type: 'null' },
                    message: { type: 'string', example: 'Department deleted successfully' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Cannot delete department with associated users or courses',
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
            description: 'Forbidden - Admin role required',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Department not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/departments/{id}/users`]: {
      get: {
        tags: ['Departments'],
        summary: 'Get department users',
        description:
          'Get paginated list of users in a department with optional isActive filter. Admins can view all departments. Managers can only view users in departments they manage.',
        operationId: 'getDepartmentUsers',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Department ID',
          },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'number', default: 1 },
            description: 'Page number',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'number', default: 20 },
            description: 'Items per page',
          },
          {
            name: 'isActive',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Filter by active status',
          },
        ],
        responses: {
          '200': {
            description: 'Department users retrieved successfully',
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
                          items: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', example: '185' },
                              fullName: { type: 'string', example: 'John Doe' },
                              email: { type: 'string', example: 'john.doe@example.com' },
                              positionTitle: {
                                type: 'string',
                                nullable: true,
                                example: 'Senior Developer',
                              },
                              avatarUrl: {
                                type: 'string',
                                nullable: true,
                                example: 'https://example.com/avatar.jpg',
                              },
                              isActive: { type: 'boolean', example: true },
                              roles: {
                                type: 'array',
                                items: {
                                  type: 'object',
                                  properties: {
                                    code: { type: 'string', example: 'employee' },
                                    name: { type: 'string', example: 'Employee' },
                                  },
                                },
                              },
                              createdAt: { type: 'string', format: 'date-time' },
                            },
                          },
                        },
                        meta: {
                          type: 'object',
                          properties: {
                            total: { type: 'number', example: 50 },
                            page: { type: 'number', example: 1 },
                            limit: { type: 'number', example: 20 },
                            totalPages: { type: 'number', example: 3 },
                          },
                        },
                      },
                    },
                    message: {
                      type: 'string',
                      example: 'Department users retrieved successfully',
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
            description: 'Forbidden - Manager can only view users in their own department',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    status: { type: 'string', example: 'fail' },
                    message: {
                      type: 'string',
                      example: 'You do not have permission to view users in this department',
                    },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Department not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/departments/{id}/manager`]: {
      post: {
        tags: ['Departments'],
        summary: 'Assign manager to department',
        description:
          'Assign a user as manager of the department. Manager must be active and belong to the same department. Requires admin role.',
        operationId: 'assignManager',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Department ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['managerUserId'],
                properties: {
                  managerUserId: {
                    type: 'string',
                    example: '5',
                    description: 'User ID to assign as manager',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Manager assigned successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: '162' },
                        name: { type: 'string', example: 'Engineering' },
                        isActive: { type: 'boolean', example: true },
                        manager: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: '5' },
                            fullName: { type: 'string', example: 'John Manager' },
                            email: { type: 'string', example: 'manager@example.com' },
                            positionTitle: {
                              type: 'string',
                              nullable: true,
                              example: 'Senior Manager',
                            },
                          },
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                    message: {
                      type: 'string',
                      example: 'Manager assigned to department successfully',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Manager is not active or not in the same department',
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
                        'Manager must belong to the same department. Please transfer the user to this department first.',
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
            description: 'Forbidden - Admin role required',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Department or manager user not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      delete: {
        tags: ['Departments'],
        summary: 'Remove manager from department',
        description: 'Remove the current manager from the department. Requires admin role.',
        operationId: 'removeManager',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Department ID',
          },
        ],
        responses: {
          '200': {
            description: 'Manager removed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: '162' },
                        name: { type: 'string', example: 'Engineering' },
                        isActive: { type: 'boolean', example: true },
                        manager: { type: 'null', example: null },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                    message: {
                      type: 'string',
                      example: 'Manager removed from department successfully',
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
            description: 'Forbidden - Admin role required',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Department not found',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },

    // ================================================================
    // Dashboard — Admin, Manager, Trainer, AI Insights
    // ================================================================

    [`${API_PREFIX}/dashboard`]: {
      get: {
        tags: ['Dashboard'],
        summary: 'Get admin dashboard statistics',
        operationId: 'getAdminDashboard',
        description:
          'Retrieve system-wide dashboard statistics for Admin: total users, courses, enrollments, risk summary.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Admin dashboard statistics retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/AdminDashboardStats' },
                    message: { type: 'string', example: 'Admin dashboard retrieved successfully' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - admin role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/dashboard/manager`]: {
      get: {
        tags: ['Dashboard'],
        summary: 'Get manager dashboard statistics',
        operationId: 'getManagerDashboard',
        description:
          'Retrieve department-scoped dashboard statistics for Manager: learner overview, overdue enrollments, roadmap completion, and risk summary.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Manager dashboard statistics retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/ManagerDashboardStats' },
                    message: {
                      type: 'string',
                      example: 'Manager dashboard retrieved successfully',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - manager role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/dashboard/trainer`]: {
      get: {
        tags: ['Dashboard'],
        summary: 'Get trainer dashboard statistics',
        operationId: 'getTrainerDashboard',
        description:
          'Retrieve trainer-scoped dashboard statistics: owned courses, pending grading, enrollment overview, and quiz pass rates.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Trainer dashboard statistics retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/TrainerDashboardStats' },
                    message: {
                      type: 'string',
                      example: 'Trainer dashboard retrieved successfully',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - trainer role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/dashboard/ai-insights`]: {
      get: {
        tags: ['Dashboard'],
        summary: 'Get AI-generated dashboard insights',
        operationId: 'getDashboardAiInsights',
        description:
          'Retrieve AI-generated insights based on dashboard statistics. Auto-scoped by user role (admin sees system-wide, manager sees department, trainer sees own courses). Results are cached for 1 hour. Pass `refresh=true` query param to force regeneration.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'refresh',
            schema: { type: 'boolean', default: false },
            description: 'Set to true to bypass the 1-hour cache and force AI regeneration.',
          },
        ],
        responses: {
          '200': {
            description: 'AI insights generated/retrieved successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/AiInsightsResponse' },
                    message: { type: 'string', example: 'AI insights generated successfully' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - admin, manager, or trainer role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },

    // ================================================================
    // AI Chat — Session Management
    // ================================================================

    [`${API_PREFIX}/ai-chat/sessions`]: {
      post: {
        tags: ['AI Chat'],
        summary: 'Create a new chat session',
        operationId: 'createChatSession',
        description: 'Create a new chat session for the authenticated user.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateSessionRequest' } },
          },
        },
        responses: {
          '201': {
            description: 'Chat session created.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/ChatSession' },
                    message: { type: 'string', example: 'Chat session created' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      get: {
        tags: ['AI Chat'],
        summary: 'List chat sessions',
        operationId: 'listChatSessions',
        description:
          'Retrieve all chat sessions for the authenticated user, ordered by most recent.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Chat sessions retrieved.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ChatSession' },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/ai-chat/sessions/{sessionId}/messages`]: {
      get: {
        tags: ['AI Chat'],
        summary: 'Get session messages',
        operationId: 'getChatSessionMessages',
        description:
          'Retrieve all messages in a specific chat session. User can only access their own sessions.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'sessionId',
            required: true,
            schema: { type: 'string' },
            description: 'Chat session ID',
          },
        ],
        responses: {
          '200': {
            description: 'Messages retrieved.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ChatMessage' },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Session not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/ai-chat/sessions/{sessionId}`]: {
      delete: {
        tags: ['AI Chat'],
        summary: 'Delete a chat session',
        operationId: 'deleteChatSession',
        description: 'Soft-delete a chat session. User can only delete their own sessions.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'sessionId',
            required: true,
            schema: { type: 'string' },
            description: 'Chat session ID',
          },
        ],
        responses: {
          '200': {
            description: 'Session deleted.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Chat session deleted' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Session not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },

    // ================================================================
    // AI Chat — Messaging (Company Knowledge RAG)
    // ================================================================

    [`${API_PREFIX}/ai-chat/message`]: {
      post: {
        tags: ['AI Chat'],
        summary: 'Send message (non-streaming)',
        operationId: 'sendChatMessage',
        description:
          'Send a message to the AI chatbot and receive a JSON response. AI uses RAG with company documents. If sessionId is provided, continues that session; otherwise creates a new one.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/SendMessageRequest' } },
          },
        },
        responses: {
          '200': {
            description: 'AI response received.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        sessionId: { type: 'string', example: '1' },
                        reply: {
                          type: 'string',
                          example:
                            'Theo chính sách công ty, nhân viên được nghỉ phép 12 ngày/năm...',
                        },
                        sources: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              title: { type: 'string' },
                              similarity: { type: 'number' },
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
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/ai-chat/message/stream`]: {
      post: {
        tags: ['AI Chat'],
        summary: 'Send message (SSE streaming)',
        operationId: 'sendChatMessageStream',
        description:
          'Send a message and receive the AI response via Server-Sent Events (SSE). The stream emits `data` events with JSON chunks containing token text. Final event includes sources.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/SendMessageRequest' } },
          },
        },
        responses: {
          '200': {
            description: 'SSE stream of AI response tokens.',
            content: {
              'text/event-stream': {
                schema: {
                  type: 'string',
                  description:
                    'Server-Sent Events stream. Events: `data` with JSON `{token}` or `{done, sources}`.',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },

    // ================================================================
    // AI Chat — Learning Assistant (Course Q&A)
    // ================================================================

    [`${API_PREFIX}/ai-chat/course/{courseId}/ask`]: {
      post: {
        tags: ['AI Learning Assistant'],
        summary: 'Ask about course content (non-streaming)',
        operationId: 'askCourse',
        description:
          'Ask the AI about course-specific content. Uses RAG with indexed course lessons. Only enrolled users can ask questions.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'courseId',
            required: true,
            schema: { type: 'string' },
            description: 'Course ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CourseAskRequest' } },
          },
        },
        responses: {
          '200': {
            description: 'AI response about course content.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        answer: { type: 'string' },
                        sources: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              title: { type: 'string' },
                              similarity: { type: 'number' },
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
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Not enrolled in this course.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/ai-chat/course/{courseId}/ask/stream`]: {
      post: {
        tags: ['AI Learning Assistant'],
        summary: 'Ask about course content (SSE streaming)',
        operationId: 'askCourseStream',
        description:
          'Ask the AI about course content with SSE streaming response. Only enrolled users can ask questions.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'courseId',
            required: true,
            schema: { type: 'string' },
            description: 'Course ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CourseAskRequest' } },
          },
        },
        responses: {
          '200': {
            description: 'SSE stream of AI response about course content.',
            content: {
              'text/event-stream': {
                schema: {
                  type: 'string',
                  description: 'Server-Sent Events stream with course-specific AI response.',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Not enrolled in this course.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },

    // ================================================================
    // AI Chat — Essay Auto-Grading
    // ================================================================

    [`${API_PREFIX}/ai-chat/grade-essay/{attemptQuestionId}`]: {
      post: {
        tags: ['AI Grading'],
        summary: 'AI grade a single essay question',
        operationId: 'gradeEssay',
        description:
          'Use AI to automatically grade a single essay/short-answer question response. Sets awarded points, feedback, and marks the question as graded.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'attemptQuestionId',
            required: true,
            schema: { type: 'string' },
            description: 'The quiz attempt question ID to grade.',
          },
        ],
        responses: {
          '200': {
            description: 'Essay graded successfully.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        awardedPoints: { type: 'number', example: 8 },
                        maxPoints: { type: 'number', example: 10 },
                        feedback: {
                          type: 'string',
                          example: 'Câu trả lời tốt, tuy nhiên cần bổ sung thêm ví dụ cụ thể.',
                        },
                        gradedBy: { type: 'string', example: 'ai' },
                      },
                    },
                    message: { type: 'string', example: 'Essay graded by AI' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - admin or trainer role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Attempt question not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/ai-chat/grade-quiz/{quizAttemptId}`]: {
      post: {
        tags: ['AI Grading'],
        summary: 'AI grade all essays in a quiz attempt',
        operationId: 'gradeQuizEssays',
        description:
          'Use AI to automatically grade all essay/short-answer questions in a quiz attempt. Processes in batch and recalculates total attempt score.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'quizAttemptId',
            required: true,
            schema: { type: 'string' },
            description: 'The quiz attempt ID whose essay questions will be graded.',
          },
        ],
        responses: {
          '200': {
            description: 'All essays in quiz attempt graded.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        gradedCount: { type: 'integer', example: 3 },
                        totalEssayQuestions: { type: 'integer', example: 3 },
                        results: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              questionId: { type: 'string' },
                              awardedPoints: { type: 'number' },
                              maxPoints: { type: 'number' },
                              feedback: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                    message: { type: 'string', example: 'Quiz essays graded by AI' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - admin or trainer role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Quiz attempt not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },

    // ================================================================
    // AI Chat — Admin Indexing Tools
    // ================================================================

    [`${API_PREFIX}/ai-chat/admin/index-all`]: {
      post: {
        tags: ['AI Admin'],
        summary: 'Index all company documents',
        operationId: 'indexAllCompanyDocuments',
        description:
          'Re-index all active company documents for RAG knowledge base. This clears existing chunks and re-generates embeddings. Admin only.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'All documents indexed.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        documentsProcessed: { type: 'integer', example: 12 },
                        chunksCreated: { type: 'integer', example: 87 },
                        errors: { type: 'array', items: { type: 'string' } },
                      },
                    },
                    message: { type: 'string', example: 'All documents indexed successfully' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - admin role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/ai-chat/admin/index/{documentId}`]: {
      post: {
        tags: ['AI Admin'],
        summary: 'Index a specific company document',
        operationId: 'indexSingleDocument',
        description: 'Re-index a specific company document by ID. Admin only.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'documentId',
            required: true,
            schema: { type: 'string' },
            description: 'Company document ID',
          },
        ],
        responses: {
          '200': {
            description: 'Document indexed.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        documentId: { type: 'string' },
                        chunksCreated: { type: 'integer', example: 5 },
                      },
                    },
                    message: { type: 'string', example: 'Document indexed successfully' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - admin role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Document not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/ai-chat/admin/index-lesson/{lessonId}`]: {
      post: {
        tags: ['AI Admin'],
        summary: 'Index a course lesson',
        operationId: 'indexLesson',
        description:
          'Index a specific course lesson for the Learning Assistant RAG. Admin or Trainer only.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'lessonId',
            required: true,
            schema: { type: 'string' },
            description: 'Lesson ID',
          },
        ],
        responses: {
          '200': {
            description: 'Lesson indexed.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        lessonId: { type: 'string' },
                        chunksCreated: { type: 'integer', example: 3 },
                      },
                    },
                    message: { type: 'string', example: 'Lesson indexed successfully' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - admin or trainer role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Lesson not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/ai-chat/admin/index-course-lessons/{courseId}`]: {
      post: {
        tags: ['AI Admin'],
        summary: 'Index all lessons in a course',
        operationId: 'indexCourseLessons',
        description:
          'Index all lessons in a course for the Learning Assistant. Admin or Trainer only.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'courseId',
            required: true,
            schema: { type: 'string' },
            description: 'Course ID',
          },
        ],
        responses: {
          '200': {
            description: 'All course lessons indexed.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        courseId: { type: 'string' },
                        lessonsProcessed: { type: 'integer', example: 8 },
                        totalChunks: { type: 'integer', example: 24 },
                        errors: { type: 'array', items: { type: 'string' } },
                      },
                    },
                    message: { type: 'string', example: 'Course lessons indexed successfully' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - admin or trainer role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Course not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },

    // ================================================================
    // Company Documents — CRUD + Categories
    // ================================================================

    [`${API_PREFIX}/company-documents`]: {
      get: {
        tags: ['Company Documents'],
        summary: 'List company documents',
        operationId: 'listCompanyDocuments',
        description: 'Get a paginated list of company documents with filters. Admin only.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 },
            description: 'Page number.',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 10 },
            description: 'Items per page.',
          },
          {
            in: 'query',
            name: 'search',
            schema: { type: 'string' },
            description: 'Search by title.',
          },
          {
            in: 'query',
            name: 'category',
            schema: { type: 'string' },
            description: 'Filter by category.',
          },
          {
            in: 'query',
            name: 'isActive',
            schema: { type: 'boolean' },
            description: 'Filter by active status.',
          },
        ],
        responses: {
          '200': {
            description: 'Paginated list of company documents.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CompanyDocument' },
                    },
                    pagination: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                        totalPages: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - admin role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      post: {
        tags: ['Company Documents'],
        summary: 'Create a company document',
        operationId: 'createCompanyDocument',
        description:
          'Create a new company document. The document is automatically indexed for RAG upon creation. Admin only.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCompanyDocumentRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Company document created and indexed.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/CompanyDocument' },
                    message: { type: 'string', example: 'Company document created and indexed' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - admin role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/company-documents/categories`]: {
      get: {
        tags: ['Company Documents'],
        summary: 'Get document categories',
        operationId: 'getCompanyDocumentCategories',
        description: 'Get distinct document categories for filter dropdowns. Admin only.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of distinct categories.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['HR Policy', 'Security', 'Onboarding', 'Benefits'],
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - admin role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/company-documents/{id}`]: {
      get: {
        tags: ['Company Documents'],
        summary: 'Get a company document',
        operationId: 'getCompanyDocument',
        description: 'Retrieve a single company document by ID with full content. Admin only.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Document ID',
          },
        ],
        responses: {
          '200': {
            description: 'Company document retrieved.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/CompanyDocument' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - admin role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Document not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      patch: {
        tags: ['Company Documents'],
        summary: 'Update a company document',
        operationId: 'updateCompanyDocument',
        description:
          'Update a company document. If content is changed, the document is automatically re-indexed for RAG. Admin only.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Document ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateCompanyDocumentRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Company document updated.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/CompanyDocument' },
                    message: { type: 'string', example: 'Company document updated' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - admin role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Document not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
      delete: {
        tags: ['Company Documents'],
        summary: 'Delete a company document',
        operationId: 'deleteCompanyDocument',
        description:
          'Soft-delete a company document and clean up associated RAG chunks. Admin only.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'Document ID',
          },
        ],
        responses: {
          '200': {
            description: 'Company document deleted.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Company document deleted' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - admin role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Document not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },

    // ================================================================
    // Risk Assessment — Calculate (single + batch)
    // ================================================================

    [`${API_PREFIX}/risk-assessments/calculate/{enrollmentId}`]: {
      post: {
        tags: ['Risk Assessment'],
        summary: 'Calculate risk for a single enrollment',
        operationId: 'calculateSingleRisk',
        description:
          'Trigger AI risk score calculation for a single enrollment. Uses learner engagement data, progress, and quiz performance to assess dropout risk. Admin or Manager only.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'enrollmentId',
            required: true,
            schema: { type: 'string' },
            description: 'Enrollment ID',
          },
        ],
        responses: {
          '200': {
            description: 'Risk assessment calculated.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        enrollmentId: { type: 'string' },
                        riskLevel: {
                          type: 'string',
                          enum: ['high', 'medium', 'low'],
                          example: 'medium',
                        },
                        riskScore: { type: 'number', example: 65 },
                        reasons: {
                          type: 'array',
                          items: { type: 'string' },
                          example: ['Low engagement', 'Missed deadlines'],
                        },
                        interventions: {
                          type: 'array',
                          items: { type: 'string' },
                          example: ['Gửi nhắc nhở', 'Lên lịch 1-on-1'],
                        },
                        calculatedAt: { type: 'string', format: 'date-time' },
                      },
                    },
                    message: { type: 'string', example: 'Risk assessment calculated' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - admin or manager role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '404': {
            description: 'Enrollment not found.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
    [`${API_PREFIX}/risk-assessments/calculate-batch`]: {
      post: {
        tags: ['Risk Assessment'],
        summary: 'Trigger batch risk calculation',
        operationId: 'calculateBatchRisk',
        description:
          'Trigger batch AI risk calculation for all active enrollments. Processes enrollments in parallel batches. Admin only. This is a long-running operation.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Batch risk calculation completed.',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        totalProcessed: { type: 'integer', example: 150 },
                        succeeded: { type: 'integer', example: 148 },
                        failed: { type: 'integer', example: 2 },
                        summary: {
                          type: 'object',
                          properties: {
                            high: { type: 'integer', example: 12 },
                            medium: { type: 'integer', example: 45 },
                            low: { type: 'integer', example: 91 },
                          },
                        },
                      },
                    },
                    message: { type: 'string', example: 'Batch risk calculation completed' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
          '403': {
            description: 'Permission denied - admin role required.',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
            },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
};
