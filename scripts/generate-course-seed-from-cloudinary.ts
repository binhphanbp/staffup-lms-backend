import 'dotenv/config';
import { getCloudinaryClient } from '../src/config/cloudinary.config';
import * as fs from 'fs';

interface CloudinaryResource {
  public_id: string;
  format: string;
  secure_url: string;
  duration?: number;
  folder: string;
}

// Map course names from Cloudinary folders
const COURSE_MAPPING: Record<
  string,
  {
    title: string;
    slug: string;
    description: string;
    categorySlug: string;
    tags: string[];
    estimatedDurationMinutes: number;
  }
> = {
  pythonSrcVideo: {
    title: 'Python Programming - From Basics to Advanced',
    slug: 'python-programming-basics-advanced',
    description: `Khóa học Python toàn diện từ cơ bản đến nâng cao.
    
    Nội dung:
    - Cài đặt Python và PyCharm
    - Biến và kiểu dữ liệu
    - Cấu trúc dữ liệu: List, Tuple, Dictionary
    - Functions và modules
    - Lệnh điều kiện và vòng lặp
    - Xử lý file và exception handling`,
    categorySlug: 'programming-languages',
    tags: ['python', 'programming', 'beginner'],
    estimatedDurationMinutes: 480,
  },
  CplusplusSrcVideo: {
    title: 'C++ Programming Fundamentals',
    slug: 'cpp-programming-fundamentals',
    description: `Học lập trình C++ từ cơ bản.
    
    Bạn sẽ học:
    - Compiler và Linker
    - IDE và môi trường phát triển
    - Cú pháp cơ bản C++
    - Debugging và testing
    - C++ Standard versions`,
    categorySlug: 'programming-languages',
    tags: ['cpp', 'c++', 'programming'],
    estimatedDurationMinutes: 600,
  },
  aws: {
    title: 'DevOps on AWS - Complete Guide',
    slug: 'devops-aws-complete-guide',
    description: `Khóa học DevOps trên AWS cho người mới bắt đầu.
    
    Nội dung:
    - Giới thiệu DevOps và AWS
    - EC2, VPC, RDS
    - Jenkins CI/CD
    - Docker và containerization
    - Security best practices
    - Cost management`,
    categorySlug: 'devops',
    tags: ['aws', 'devops', 'cloud', 'jenkins'],
    estimatedDurationMinutes: 900,
  },
  UIUX: {
    title: 'UI/UX Design with Figma',
    slug: 'uiux-design-figma',
    description: `Thiết kế UI/UX chuyên nghiệp với Figma.
    
    Bạn sẽ học:
    - Figma fundamentals
    - Components và Auto Layout
    - Design systems
    - Prototyping và animation
    - Collaboration và handoff`,
    categorySlug: 'design',
    tags: ['figma', 'uiux', 'design'],
    estimatedDurationMinutes: 720,
  },
  'PHP và SQL': {
    title: 'PHP & MySQL Web Development',
    slug: 'php-mysql-web-development',
    description: `Lập trình web với PHP và MySQL.
    
    Nội dung:
    - PHP basics và syntax
    - Variables và data types
    - Operators và control structures
    - MySQL database integration
    - CRUD operations`,
    categorySlug: 'backend-development',
    tags: ['php', 'mysql', 'web-development'],
    estimatedDurationMinutes: 540,
  },
  'nextjs-typescript': {
    title: 'Next.js 15 & TypeScript - Modern Web Development',
    slug: 'nextjs-typescript-modern-web',
    description: `Xây dựng ứng dụng web hiện đại với Next.js 15 và TypeScript.
    
    Bạn sẽ học:
    - Next.js App Router
    - Server Components
    - TypeScript integration
    - Data fetching strategies
    - Form handling với Shadcn
    - Deployment`,
    categorySlug: 'frontend-development',
    tags: ['nextjs', 'typescript', 'react', 'frontend'],
    estimatedDurationMinutes: 840,
  },
  'Git-Github': {
    title: 'Git & GitHub - Version Control Mastery',
    slug: 'git-github-version-control',
    description: `Làm chủ Git và GitHub cho team collaboration.
    
    Nội dung:
    - Git fundamentals
    - Branching và merging
    - Rebase và reset
    - GitHub workflow
    - Pull requests và code review
    - GitHub Desktop và VS Code integration`,
    categorySlug: 'tools',
    tags: ['git', 'github', 'version-control'],
    estimatedDurationMinutes: 960,
  },
  'khóa học vuejs': {
    title: 'Vue.js 3 - Progressive JavaScript Framework',
    slug: 'vuejs-progressive-framework',
    description: `Học Vue.js 3 từ cơ bản đến nâng cao.
    
    Bạn sẽ học:
    - Vue fundamentals
    - Composition API
    - Reactivity system
    - Components và props
    - Computed properties
    - Directives và binding`,
    categorySlug: 'frontend-development',
    tags: ['vuejs', 'vue', 'javascript', 'frontend'],
    estimatedDurationMinutes: 600,
  },
  Angular: {
    title: 'AngularJS Fundamentals',
    slug: 'angularjs-fundamentals',
    description: `Học AngularJS cơ bản.
    
    Nội dung:
    - Modules và Controllers
    - Directives
    - Data binding
    - Services và HTTP
    - Filters và sorting`,
    categorySlug: 'frontend-development',
    tags: ['angular', 'angularjs', 'javascript'],
    estimatedDurationMinutes: 480,
  },
  visilySrcVideo: {
    title: 'Visily - AI-Powered UI Design Tool',
    slug: 'visily-ai-ui-design',
    description: `Thiết kế UI nhanh chóng với Visily AI.
    
    Bạn sẽ học:
    - Visily basics
    - AI features
    - Screenshot to design
    - Prototyping
    - Collaboration`,
    categorySlug: 'design',
    tags: ['visily', 'ui-design', 'ai'],
    estimatedDurationMinutes: 300,
  },
};

async function fetchAllVideos(): Promise<CloudinaryResource[]> {
  const cloudinary = getCloudinaryClient();

  const result = await cloudinary.api.resources({
    type: 'upload',
    resource_type: 'video',
    max_results: 500,
  });

  return result.resources;
}

function groupVideosByFolder(videos: CloudinaryResource[]): Record<string, CloudinaryResource[]> {
  const grouped: Record<string, CloudinaryResource[]> = {};

  videos.forEach((video) => {
    // Extract course name from public_id
    const publicId = video.public_id;
    let courseKey = 'root';

    // Match patterns in video names
    if (publicId.includes('Python')) {
      courseKey = 'pythonSrcVideo';
    } else if (publicId.includes('C_-_Bài') || publicId.includes('Cplusplus')) {
      courseKey = 'CplusplusSrcVideo';
    } else if (
      publicId.includes('DevOps') ||
      publicId.includes('aws') ||
      publicId.startsWith('Bài_')
    ) {
      courseKey = 'aws';
    } else if (
      publicId.includes('Figma') ||
      publicId.includes('UIUX') ||
      publicId.match(/^\d+\._Bài_\d+_tự_học_Figma/)
    ) {
      courseKey = 'UIUX';
    } else if (publicId.includes('PHP') || publicId.includes('MYSQL')) {
      courseKey = 'PHP và SQL';
    } else if (publicId.includes('NextJS') || publicId.includes('Notion_Clone')) {
      courseKey = 'nextjs-typescript';
    } else if (
      publicId.includes('Git') ||
      publicId.includes('Github') ||
      publicId.includes('GitHub')
    ) {
      courseKey = 'Git-Github';
    } else if (publicId.includes('Vue') || publicId.includes('Vuejs')) {
      courseKey = 'khóa học vuejs';
    } else if (publicId.includes('Angular')) {
      courseKey = 'Angular';
    } else if (publicId.includes('Visily')) {
      courseKey = 'visilySrcVideo';
    }

    if (!grouped[courseKey]) {
      grouped[courseKey] = [];
    }
    grouped[courseKey].push(video);
  });

  return grouped;
}

function generateSeedCode(groupedVideos: Record<string, CloudinaryResource[]>): string {
  let code = `const { createSeedContext, disposeSeedContext } = require('../shared/client');

/**
 * COURSE SEED FROM CLOUDINARY VIDEOS
 * Auto-generated from actual Cloudinary videos
 */

const COURSES_DATA = [\n`;

  Object.entries(groupedVideos).forEach(([folder, videos]) => {
    const courseInfo = COURSE_MAPPING[folder];
    if (!courseInfo || videos.length === 0) return;

    code += `  {\n`;
    code += `    title: '${courseInfo.title}',\n`;
    code += `    slug: '${courseInfo.slug}',\n`;
    code += `    description: \`${courseInfo.description}\`,\n`;
    code += `    categorySlug: '${courseInfo.categorySlug}',\n`;
    code += `    tags: ${JSON.stringify(courseInfo.tags)},\n`;
    code += `    estimatedDurationMinutes: ${courseInfo.estimatedDurationMinutes},\n`;
    code += `    thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/courses/${courseInfo.slug}-thumb.jpg',\n`;
    code += `    status: 'published',\n`;
    code += `    modules: [\n`;

    // Group videos into modules (every 5 videos = 1 module)
    const modulesCount = Math.ceil(videos.length / 5);

    for (let i = 0; i < modulesCount; i++) {
      const moduleVideos = videos.slice(i * 5, (i + 1) * 5);

      code += `      {\n`;
      code += `        title: 'Module ${i + 1}',\n`;
      code += `        orderIndex: ${i + 1},\n`;
      code += `        lessons: [\n`;

      moduleVideos.forEach((video, idx) => {
        const lessonTitle =
          video.public_id.split('/').pop()?.replace(/_/g, ' ').substring(0, 100) ||
          `Lesson ${idx + 1}`;
        const duration = video.duration || 600;

        code += `          {\n`;
        code += `            title: '${lessonTitle.replace(/'/g, "\\'")}',\n`;
        code += `            lessonType: 'video',\n`;
        code += `            contentText: 'Video lesson',\n`;
        code += `            videoUrl: '${video.secure_url}',\n`;
        code += `            durationSeconds: ${Math.floor(duration)},\n`;
        code += `            orderIndex: ${idx + 1},\n`;
        code += `            isPreview: ${idx === 0 && i === 0},\n`;
        code += `          },\n`;
      });

      code += `        ],\n`;
      code += `      },\n`;
    }

    code += `    ],\n`;
    code += `  },\n\n`;
  });

  code += `];\n\n`;

  // Add seed functions
  code += `
async function seedCoursesFromCloudinary(context) {
  console.log('🎓 Seeding courses from Cloudinary videos...\\n');

  const prisma = context.prisma;

  try {
    const departments = await prisma.department.findMany();
    const categories = await prisma.category.findMany();
    const tags = await prisma.tag.findMany();
    
    const trainers = await prisma.user.findMany({
      where: { email: { contains: 'trainer' } },
      take: 3,
    });

    if (trainers.length === 0) {
      console.log('⚠️  No trainers found. Skipping...');
      return [];
    }

    const createdCourses = [];
    let courseIndex = 0;

    for (const courseData of COURSES_DATA) {
      console.log(\`📝 Creating course: \${courseData.title}\`);

      const category = categories.find(c => c.slug === courseData.categorySlug);
      const trainer = trainers[courseIndex % trainers.length];
      const department = departments[courseIndex % departments.length];

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
          mediaFolder: \`staffup-lms/courses/\${courseData.slug}\`,
        },
      });

      // Add tags
      if (courseData.tags && courseData.tags.length > 0) {
        for (const tagName of courseData.tags) {
          const tag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
          if (tag) {
            await prisma.courseTag.create({
              data: { courseId: course.id, tagId: tag.id },
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

        for (const lessonData of moduleData.lessons) {
          await prisma.lesson.create({
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
          totalLessons++;
        }
      }

      console.log(\`   ✅ Created \${courseData.modules.length} modules, \${totalLessons} lessons\`);
      createdCourses.push(course);
      courseIndex++;
    }

    console.log(\`\\n✅ Created \${createdCourses.length} courses from Cloudinary\\n\`);
    return createdCourses;
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    throw error;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   CLOUDINARY COURSE SEED - STAFFUP LMS');
  console.log('═══════════════════════════════════════════════════════════════\\n');

  const context = createSeedContext();

  try {
    await seedCoursesFromCloudinary(context);

    console.log('\\n═══════════════════════════════════════════════════════════════');
    console.log('   ✅ SEED COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════════\\n');
  } catch (error) {
    console.error('\\n❌ SEED FAILED:', error);
    process.exit(1);
  } finally {
    await disposeSeedContext(context);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedCoursesFromCloudinary, COURSES_DATA };
`;

  return code;
}

async function main() {
  // eslint-disable-next-line no-console
  console.log('🔍 Fetching videos from Cloudinary...\n');

  const videos = await fetchAllVideos();
  // eslint-disable-next-line no-console
  console.log(`✅ Found ${videos.length} videos\n`);

  const grouped = groupVideosByFolder(videos);
  // eslint-disable-next-line no-console
  console.log('📁 Grouped by folders:\n');

  Object.entries(grouped).forEach(([folder, folderVideos]) => {
    const courseInfo = COURSE_MAPPING[folder];
    if (courseInfo) {
      // eslint-disable-next-line no-console
      console.log(`   ✓ ${folder}: ${folderVideos.length} videos → ${courseInfo.title}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`   - ${folder}: ${folderVideos.length} videos (not mapped)`);
    }
  });

  // eslint-disable-next-line no-console
  console.log('\n📝 Generating seed code...\n');

  const seedCode = generateSeedCode(grouped);

  const outputPath = 'prisma/seeds/demo/courses-from-cloudinary.seed.js';
  fs.writeFileSync(outputPath, seedCode);

  // eslint-disable-next-line no-console
  console.log(`✅ Seed file generated: ${outputPath}\n`);
  // eslint-disable-next-line no-console
  console.log(
    'Run with: docker compose exec api node prisma/seeds/demo/courses-from-cloudinary.seed.js',
  );
}

main();
