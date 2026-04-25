const { createSeedContext, disposeSeedContext } = require('../shared/client');

/**
 * FULL COURSE SEED - CHUYÊN NGHIỆP
 * 
 * Kế hoạch:
 * 1. Tạo courses với đầy đủ thông tin
 * 2. Tạo modules (chapters) cho mỗi course
 * 3. Tạo lessons với videos từ Cloudinary
 * 4. Tạo lesson resources (PDFs, slides, code samples)
 * 5. Tạo quizzes cho lessons
 * 6. Tạo enrollments với progress tracking
 */

// ============================================================================
// COURSE DATA STRUCTURE
// ============================================================================

const COURSES_DATA = [
  {
    title: 'Node.js & Express - Backend Development Fundamentals',
    slug: 'nodejs-express-backend-fundamentals',
    description: `Khóa học toàn diện về Node.js và Express framework.
    
    Bạn sẽ học:
    - Node.js core concepts và event loop
    - Express routing và middleware
    - RESTful API design patterns
    - Database integration với PostgreSQL
    - Authentication & Authorization
    - Error handling và logging
    - Testing với Jest
    - Deployment best practices`,
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/courses/nodejs-thumb.jpg',
    status: 'published',
    estimatedDurationMinutes: 1200, // 20 hours
    categorySlug: 'backend-development',
    tags: ['nodejs', 'express', 'backend', 'javascript'],
    modules: [
      {
        title: 'Module 1: Node.js Fundamentals',
        orderIndex: 1,
        lessons: [
          {
            title: 'Introduction to Node.js',
            lessonType: 'video',
            contentText: 'Giới thiệu về Node.js, event-driven architecture và use cases.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/nodejs/01-intro.mp4',
            durationSeconds: 900, // 15 mins
            orderIndex: 1,
            isPreview: true,
            resources: [
              {
                fileName: 'nodejs-slides.pdf',
                fileUrl: 'https://res.cloudinary.com/demo/raw/upload/v1/nodejs/slides-01.pdf',
                resourceType: 'pdf',
                orderIndex: 1,
              },
              {
                fileName: 'sample-code.zip',
                fileUrl: 'https://res.cloudinary.com/demo/raw/upload/v1/nodejs/code-01.zip',
                resourceType: 'code',
                orderIndex: 2,
              },
            ],
          },
          {
            title: 'Event Loop & Asynchronous Programming',
            lessonType: 'video',
            contentText: 'Hiểu về event loop, callbacks, promises và async/await.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/nodejs/02-event-loop.mp4',
            durationSeconds: 1200, // 20 mins
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'NPM & Package Management',
            lessonType: 'video',
            contentText: 'Quản lý dependencies với NPM, package.json và best practices.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/nodejs/03-npm.mp4',
            durationSeconds: 600, // 10 mins
            orderIndex: 3,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 2: Express Framework',
        orderIndex: 2,
        lessons: [
          {
            title: 'Express Setup & Basic Routing',
            lessonType: 'video',
            contentText: 'Cài đặt Express và tạo routes cơ bản.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/nodejs/04-express-basics.mp4',
            durationSeconds: 1500, // 25 mins
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: 'Middleware & Request Pipeline',
            lessonType: 'video',
            contentText: 'Middleware pattern, custom middleware và error handling.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/nodejs/05-middleware.mp4',
            durationSeconds: 1800, // 30 mins
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'RESTful API Design',
            lessonType: 'video',
            contentText: 'Thiết kế RESTful API với Express.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/nodejs/06-rest-api.mp4',
            durationSeconds: 2100, // 35 mins
            orderIndex: 3,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 3: Database Integration',
        orderIndex: 3,
        lessons: [
          {
            title: 'PostgreSQL with Prisma ORM',
            lessonType: 'video',
            contentText: 'Kết nối PostgreSQL và sử dụng Prisma ORM.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/nodejs/07-prisma.mp4',
            durationSeconds: 2400, // 40 mins
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: 'CRUD Operations & Transactions',
            lessonType: 'video',
            contentText: 'Thực hiện CRUD operations và database transactions.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/nodejs/08-crud.mp4',
            durationSeconds: 1800, // 30 mins
            orderIndex: 2,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 4: Authentication & Security',
        orderIndex: 4,
        lessons: [
          {
            title: 'JWT Authentication',
            lessonType: 'video',
            contentText: 'Implement JWT authentication với refresh tokens.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/nodejs/09-jwt.mp4',
            durationSeconds: 2700, // 45 mins
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: 'Security Best Practices',
            lessonType: 'video',
            contentText: 'CORS, helmet, rate limiting và input validation.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/nodejs/10-security.mp4',
            durationSeconds: 1500, // 25 mins
            orderIndex: 2,
            isPreview: false,
          },
        ],
      },
    ],
  },

  {
    title: 'React & Next.js - Modern Frontend Development',
    slug: 'react-nextjs-modern-frontend',
    description: `Khóa học React và Next.js từ cơ bản đến nâng cao.
    
    Nội dung:
    - React fundamentals và hooks
    - Component patterns và best practices
    - State management với Context API và Zustand
    - Next.js App Router và Server Components
    - Data fetching strategies
    - Performance optimization
    - SEO và accessibility
    - Deployment với Vercel`,
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/courses/react-thumb.jpg',
    status: 'published',
    estimatedDurationMinutes: 1500, // 25 hours
    categorySlug: 'frontend-development',
    tags: ['react', 'nextjs', 'frontend', 'javascript'],
    modules: [
      {
        title: 'Module 1: React Fundamentals',
        orderIndex: 1,
        lessons: [
          {
            title: 'React Introduction & JSX',
            lessonType: 'video',
            contentText: 'Giới thiệu React, JSX syntax và component basics.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/react/01-intro.mp4',
            durationSeconds: 1200, // 20 mins
            orderIndex: 1,
            isPreview: true,
          },
          {
            title: 'Components & Props',
            lessonType: 'video',
            contentText: 'Functional components, props và component composition.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/react/02-components.mp4',
            durationSeconds: 1500, // 25 mins
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'State & useState Hook',
            lessonType: 'video',
            contentText: 'Quản lý state với useState hook.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/react/03-state.mp4',
            durationSeconds: 1800, // 30 mins
            orderIndex: 3,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 2: React Hooks',
        orderIndex: 2,
        lessons: [
          {
            title: 'useEffect & Side Effects',
            lessonType: 'video',
            contentText: 'useEffect hook và lifecycle management.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/react/04-useeffect.mp4',
            durationSeconds: 2100, // 35 mins
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: 'useContext & Context API',
            lessonType: 'video',
            contentText: 'Global state management với Context API.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/react/05-context.mp4',
            durationSeconds: 1800, // 30 mins
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'Custom Hooks',
            lessonType: 'video',
            contentText: 'Tạo và sử dụng custom hooks.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/react/06-custom-hooks.mp4',
            durationSeconds: 1500, // 25 mins
            orderIndex: 3,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 3: Next.js Framework',
        orderIndex: 3,
        lessons: [
          {
            title: 'Next.js Setup & App Router',
            lessonType: 'video',
            contentText: 'Cài đặt Next.js và App Router architecture.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/react/07-nextjs-setup.mp4',
            durationSeconds: 1800, // 30 mins
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: 'Server Components & Client Components',
            lessonType: 'video',
            contentText: 'Phân biệt và sử dụng Server/Client Components.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/react/08-rsc.mp4',
            durationSeconds: 2400, // 40 mins
            orderIndex: 2,
            isPreview: false,
          },
          {
            title: 'Data Fetching & Caching',
            lessonType: 'video',
            contentText: 'Fetch data với Server Components và caching strategies.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/react/09-data-fetching.mp4',
            durationSeconds: 2700, // 45 mins
            orderIndex: 3,
            isPreview: false,
          },
        ],
      },
    ],
  },

  {
    title: 'TypeScript - Complete Guide',
    slug: 'typescript-complete-guide',
    description: `Học TypeScript từ cơ bản đến nâng cao.
    
    Bạn sẽ học:
    - TypeScript basics và type system
    - Interfaces và Type aliases
    - Generics và advanced types
    - Decorators và metadata
    - TypeScript với React
    - TypeScript với Node.js
    - Best practices và patterns`,
    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/courses/typescript-thumb.jpg',
    status: 'published',
    estimatedDurationMinutes: 900, // 15 hours
    categorySlug: 'programming-languages',
    tags: ['typescript', 'javascript', 'programming'],
    modules: [
      {
        title: 'Module 1: TypeScript Basics',
        orderIndex: 1,
        lessons: [
          {
            title: 'TypeScript Introduction',
            lessonType: 'video',
            contentText: 'Giới thiệu TypeScript và setup environment.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/typescript/01-intro.mp4',
            durationSeconds: 900, // 15 mins
            orderIndex: 1,
            isPreview: true,
          },
          {
            title: 'Basic Types',
            lessonType: 'video',
            contentText: 'Các kiểu dữ liệu cơ bản trong TypeScript.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/typescript/02-types.mp4',
            durationSeconds: 1200, // 20 mins
            orderIndex: 2,
            isPreview: false,
          },
        ],
      },
      {
        title: 'Module 2: Advanced Types',
        orderIndex: 2,
        lessons: [
          {
            title: 'Interfaces & Type Aliases',
            lessonType: 'video',
            contentText: 'Định nghĩa interfaces và type aliases.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/typescript/03-interfaces.mp4',
            durationSeconds: 1800, // 30 mins
            orderIndex: 1,
            isPreview: false,
          },
          {
            title: 'Generics',
            lessonType: 'video',
            contentText: 'Sử dụng generics để tạo reusable code.',
            videoUrl: 'https://res.cloudinary.com/demo/video/upload/v1/typescript/04-generics.mp4',
            durationSeconds: 2100, // 35 mins
            orderIndex: 2,
            isPreview: false,
          },
        ],
      },
    ],
  },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedFullCourses(context) {
  console.log('🎓 Starting full course seeding...\n');

  const prisma = context.prisma;

  try {
    // Get required data
    const departments = await prisma.department.findMany();
    const categories = await prisma.category.findMany();
    const tags = await prisma.tag.findMany();
    
    // Get trainers (users with trainer role)
    const trainers = await prisma.user.findMany({
      where: {
        email: {
          contains: 'trainer',
        },
      },
      take: 3,
    });

    if (trainers.length === 0) {
      console.log('⚠️  No trainers found. Creating default trainer...');
      const defaultDept = departments[0];
      const argon2 = require('argon2');
      const passwordHash = await argon2.hash('Trainer123');
      
      const trainer = await prisma.user.create({
        data: {
          departmentId: defaultDept.id,
          fullName: 'Default Trainer',
          email: 'trainer@staffup.local',
          passwordHash,
          positionTitle: 'Senior Instructor',
          isActive: true,
        },
      });
      trainers.push(trainer);
    }

    console.log(`📊 Found ${departments.length} departments`);
    console.log(`📊 Found ${categories.length} categories`);
    console.log(`📊 Found ${trainers.length} trainers\n`);

    const createdCourses = [];
    let courseIndex = 0;

    for (const courseData of COURSES_DATA) {
      console.log(`📝 Creating course: ${courseData.title}`);

      // Find category
      const category = categories.find(c => c.slug === courseData.categorySlug);
      const trainer = trainers[courseIndex % trainers.length];
      const department = departments[courseIndex % departments.length];

      // Create course
      const course = await prisma.course.create({
        data: {
          ownerDepartmentId: department.id,
          trainerUserId: trainer.id,
          categoryId: category?.id,
          title: courseData.title,
          slug: courseData.slug,
          description: courseData.description,
          thumbnailUrl: courseData.thumbnailUrl,
          status: courseData.status,
          estimatedDurationMinutes: courseData.estimatedDurationMinutes,
          publishedAt: new Date(),
          mediaFolder: `staffup-lms/courses/${courseData.slug}`,
        },
      });

      // Add tags
      if (courseData.tags && courseData.tags.length > 0) {
        for (const tagName of courseData.tags) {
          const tag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
          if (tag) {
            await prisma.courseTag.create({
              data: {
                courseId: course.id,
                tagId: tag.id,
              },
            });
          }
        }
      }

      // Create modules and lessons
      let totalLessons = 0;
      for (const moduleData of courseData.modules) {
        const module = await prisma.module.create({
          data: {
            courseId: course.id,
            title: moduleData.title,
            orderIndex: moduleData.orderIndex,
          },
        });

        // Create lessons
        for (const lessonData of moduleData.lessons) {
          const lesson = await prisma.lesson.create({
            data: {
              moduleId: module.id,
              title: lessonData.title,
              lessonType: lessonData.lessonType,
              contentText: lessonData.contentText,
              videoUrl: lessonData.videoUrl,
              durationSeconds: lessonData.durationSeconds,
              orderIndex: lessonData.orderIndex,
              isPreview: lessonData.isPreview,
            },
          });

          // Create lesson resources if any
          if (lessonData.resources && lessonData.resources.length > 0) {
            for (const resourceData of lessonData.resources) {
              await prisma.lessonResource.create({
                data: {
                  lessonId: lesson.id,
                  fileName: resourceData.fileName,
                  fileUrl: resourceData.fileUrl,
                  resourceType: resourceData.resourceType,
                  orderIndex: resourceData.orderIndex,
                },
              });
            }
          }

          totalLessons++;
        }
      }

      console.log(`   ✅ Created ${courseData.modules.length} modules, ${totalLessons} lessons`);
      createdCourses.push(course);
      courseIndex++;
    }

    console.log(`\n✅ Created ${createdCourses.length} courses with full content\n`);

    return createdCourses;
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    throw error;
  }
}

// ============================================================================
// ENROLLMENT & PROGRESS SEED
// ============================================================================

async function seedEnrollmentsWithProgress(context, courses) {
  console.log('👥 Creating enrollments with progress...\n');

  const prisma = context.prisma;

  try {
    const users = await prisma.user.findMany({
      where: {
        email: { not: { contains: 'admin' } },
      },
      take: 10,
    });

    if (users.length === 0) {
      console.log('⚠️  No users found for enrollments. Skipping...');
      return;
    }

    let enrollmentCount = 0;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const course = courses[i % courses.length];

      // Create enrollment
      const enrollment = await prisma.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          status: i % 3 === 0 ? 'completed' : i % 3 === 1 ? 'in_progress' : 'assigned',
          enrolledAt: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000),
          startedAt: i % 3 !== 2 ? new Date(Date.now() - (28 - i) * 24 * 60 * 60 * 1000) : null,
          completedAt: i % 3 === 0 ? new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000) : null,
        },
      });

      // Create lesson progress for in_progress and completed enrollments
      if (i % 3 !== 2) {
        const lessons = await prisma.lesson.findMany({
          where: {
            module: {
              courseId: course.id,
            },
          },
          take: i % 3 === 0 ? 100 : 3, // All lessons if completed, 3 if in_progress
        });

        for (const lesson of lessons) {
          await prisma.lessonProgress.create({
            data: {
              enrollmentId: enrollment.id,
              lessonId: lesson.id,
              status: i % 3 === 0 ? 'completed' : 'in_progress',
              watchTimeSeconds: lesson.durationSeconds,
              lastPositionSeconds: i % 3 === 0 ? lesson.durationSeconds : Math.floor(lesson.durationSeconds / 2),
              startedAt: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000),
              completedAt: i % 3 === 0 ? new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000) : null,
              lastAccessedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
            },
          });
        }
      }

      enrollmentCount++;
    }

    console.log(`✅ Created ${enrollmentCount} enrollments with progress\n`);
  } catch (error) {
    console.error('❌ Error seeding enrollments:', error);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   FULL COURSE SEED - STAFFUP LMS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const context = createSeedContext();

  try {
    const courses = await seedFullCourses(context);
    await seedEnrollmentsWithProgress(context, courses);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('   ✅ SEED COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ SEED FAILED:', error);
    process.exit(1);
  } finally {
    await disposeSeedContext(context);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

// Export for use in other seed files
module.exports = {
  seedFullCourses,
  seedEnrollmentsWithProgress,
  COURSES_DATA,
};
