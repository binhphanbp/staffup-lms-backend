const { createSeedContext, disposeSeedContext } = require('../shared/client');

/**
 * REALISTIC ROADMAP SEED
 * Dựa trên các courses thực tế có trong database
 */

const ROADMAPS_DATA = [
  {
    title: 'Lộ trình Backend Developer - Từ Cơ Bản đến Nâng Cao',
    description: `Lộ trình học Backend Development toàn diện từ cơ bản đến nâng cao.
    
    Bạn sẽ học:
    - Lập trình Python cơ bản
    - Lập trình C++ nâng cao
    - Node.js API Development
    - PHP & MySQL Web Development
    - DevOps và deployment
    
    Phù hợp cho: Junior đến Mid-level Backend Developer`,
    targetPosition: 'Backend Developer',
    isActive: true,
    courses: [
      { slug: 'python-programming-basics-advanced', order: 1, required: true },
      { slug: 'nodejs-api-fundamentals', order: 2, required: true },
      { slug: 'php-mysql-web-development', order: 3, required: false },
      { slug: 'cpp-programming-fundamentals', order: 4, required: false },
      { slug: 'devops-aws-complete-guide', order: 5, required: true },
    ],
  },
  {
    title: 'Lộ trình Frontend Developer - Modern Web',
    description: `Lộ trình học Frontend Development với các framework hiện đại.
    
    Bạn sẽ học:
    - Vue.js 3 - Progressive Framework
    - AngularJS Fundamentals
    - Next.js & TypeScript
    - UI/UX Design với Figma
    
    Phù hợp cho: Junior đến Mid-level Frontend Developer`,
    targetPosition: 'Frontend Developer',
    isActive: true,
    courses: [
      { slug: 'vuejs-progressive-framework', order: 1, required: true },
      { slug: 'angularjs-fundamentals', order: 2, required: true },
      { slug: 'nextjs-typescript-modern-web', order: 3, required: true },
      { slug: 'uiux-design-figma', order: 4, required: false },
    ],
  },
  {
    title: 'Lộ trình Full Stack Developer',
    description: `Lộ trình học Full Stack Development - Frontend + Backend + DevOps.
    
    Bạn sẽ học:
    - Python Programming
    - Node.js API
    - Next.js & TypeScript
    - Vue.js hoặc Angular
    - DevOps on AWS
    
    Phù hợp cho: Mid-level đến Senior Developer`,
    targetPosition: 'Full Stack Developer',
    isActive: true,
    courses: [
      { slug: 'python-programming-basics-advanced', order: 1, required: true },
      { slug: 'nodejs-api-fundamentals', order: 2, required: true },
      { slug: 'nextjs-typescript-modern-web', order: 3, required: true },
      { slug: 'vuejs-progressive-framework', order: 4, required: false },
      { slug: 'angularjs-fundamentals', order: 5, required: false },
      { slug: 'devops-aws-complete-guide', order: 6, required: true },
    ],
  },
  {
    title: 'Lộ trình DevOps Engineer',
    description: `Lộ trình học DevOps từ cơ bản đến nâng cao.
    
    Bạn sẽ học:
    - Python cho automation
    - DevOps on AWS
    - CI/CD với Jenkins
    
    Phù hợp cho: System Admin, Backend Developer chuyển sang DevOps`,
    targetPosition: 'DevOps Engineer',
    isActive: true,
    courses: [
      { slug: 'python-programming-basics-advanced', order: 1, required: true },
      { slug: 'devops-aws-complete-guide', order: 2, required: true },
    ],
  },
  {
    title: 'Lộ trình UI/UX Designer',
    description: `Lộ trình học UI/UX Design với các công cụ hiện đại.
    
    Bạn sẽ học:
    - UI/UX Design với Figma
    - Visily - AI-Powered Design Tool
    - Frontend basics để hiểu implementation
    
    Phù hợp cho: Designer, Product Designer`,
    targetPosition: 'UI/UX Designer',
    isActive: true,
    courses: [
      { slug: 'uiux-design-figma', order: 1, required: true },
      { slug: 'visily-ai-ui-design', order: 2, required: true },
      { slug: 'nextjs-typescript-modern-web', order: 3, required: false },
    ],
  },
  {
    title: 'Lộ trình Product Manager',
    description: `Lộ trình cho Product Manager hiểu về technical và design.
    
    Bạn sẽ học:
    - Product Discovery Workshop
    - UI/UX Design basics
    - Technical overview (Frontend/Backend)
    
    Phù hợp cho: Product Manager, Product Owner`,
    targetPosition: 'Product Manager',
    isActive: true,
    courses: [
      { slug: 'product-discovery-workshop', order: 1, required: true },
      { slug: 'uiux-design-figma', order: 2, required: true },
      { slug: 'nodejs-api-fundamentals', order: 3, required: false },
    ],
  },
  {
    title: 'Onboarding - Nhân Viên Kỹ Thuật Mới',
    description: `Lộ trình onboarding cho nhân viên kỹ thuật mới.
    
    Bạn sẽ học:
    - Python Programming cơ bản
    - Node.js API basics
    - UI/UX Design basics
    
    Phù hợp cho: New hire - Technical roles`,
    targetPosition: 'Software Engineer',
    isActive: true,
    courses: [
      { slug: 'python-programming-basics-advanced', order: 1, required: true },
      { slug: 'nodejs-api-fundamentals', order: 2, required: true },
      { slug: 'uiux-design-figma', order: 3, required: false },
    ],
  },
  {
    title: 'Onboarding - Product Team',
    description: `Lộ trình onboarding cho Product Team.
    
    Bạn sẽ học:
    - Product Discovery
    - UI/UX Design
    - Technical overview
    
    Phù hợp cho: New hire - Product roles`,
    targetPosition: 'Product Manager',
    isActive: true,
    courses: [
      { slug: 'product-discovery-workshop', order: 1, required: true },
      { slug: 'uiux-design-figma', order: 2, required: true },
    ],
  },
  {
    title: 'Nâng Cấp Kỹ Năng: Modern Frontend',
    description: `Nâng cấp kỹ năng Frontend với các framework mới nhất.
    
    Bạn sẽ học:
    - Next.js 15 & TypeScript
    - Vue.js 3
    - AngularJS
    
    Phù hợp cho: Frontend Developer muốn học framework mới`,
    targetPosition: 'Senior Frontend Developer',
    isActive: true,
    courses: [
      { slug: 'nextjs-typescript-modern-web', order: 1, required: true },
      { slug: 'vuejs-progressive-framework', order: 2, required: true },
      { slug: 'angularjs-fundamentals', order: 3, required: false },
    ],
  },
  {
    title: 'Nâng Cấp Kỹ Năng: Cloud & DevOps',
    description: `Nâng cấp kỹ năng Cloud và DevOps.
    
    Bạn sẽ học:
    - DevOps on AWS
    - Python cho automation
    
    Phù hợp cho: Developer muốn học DevOps`,
    targetPosition: 'DevOps Engineer',
    isActive: true,
    courses: [
      { slug: 'python-programming-basics-advanced', order: 1, required: false },
      { slug: 'devops-aws-complete-guide', order: 2, required: true },
    ],
  },
];

// Assignment scenarios cho tất cả users
const ASSIGNMENT_SCENARIOS = [
  {
    scenario: 'new_hire_backend',
    roadmapTitle: 'Onboarding - Nhân Viên Kỹ Thuật Mới',
    userEmails: ['trainer1@staffup.local', 'trainer2@staffup.local'],
    status: 'in_progress',
    dueInDays: 60,
  },
  {
    scenario: 'backend_learning',
    roadmapTitle: 'Lộ trình Backend Developer - Từ Cơ Bản đến Nâng Cao',
    userEmails: ['trainer1@staffup.local'],
    status: 'assigned',
    dueInDays: 180,
  },
  {
    scenario: 'frontend_learning',
    roadmapTitle: 'Lộ trình Frontend Developer - Modern Web',
    userEmails: ['trainer2@staffup.local'],
    status: 'in_progress',
    dueInDays: 150,
  },
  {
    scenario: 'fullstack_path',
    roadmapTitle: 'Lộ trình Full Stack Developer',
    userEmails: ['admin@staffup.local'],
    status: 'in_progress',
    dueInDays: 240,
  },
  {
    scenario: 'devops_upskill',
    roadmapTitle: 'Nâng Cấp Kỹ Năng: Cloud & DevOps',
    userEmails: ['trainer1@staffup.local', 'admin@staffup.local'],
    status: 'assigned',
    dueInDays: 90,
  },
  {
    scenario: 'uiux_learning',
    roadmapTitle: 'Lộ trình UI/UX Designer',
    userEmails: ['trainer2@staffup.local'],
    status: 'assigned',
    dueInDays: 90,
  },
  {
    scenario: 'product_onboarding',
    roadmapTitle: 'Onboarding - Product Team',
    userEmails: ['admin@staffup.local'],
    status: 'completed',
    dueInDays: null,
  },
  {
    scenario: 'modern_frontend',
    roadmapTitle: 'Nâng Cấp Kỹ Năng: Modern Frontend',
    userEmails: ['trainer1@staffup.local', 'trainer2@staffup.local'],
    status: 'assigned',
    dueInDays: 120,
  },
];

async function seedRealisticRoadmaps(context) {
  console.log('🚀 Starting realistic roadmap seeding...\n');

  const prisma = context.prisma;

  try {
    // Get all users
    const users = await prisma.user.findMany();
    console.log(`📊 Found ${users.length} users`);

    // Get department
    const department = await prisma.department.findFirst();
    console.log(`📊 Found department: ${department.name}`);

    // Get all published courses
    const courses = await prisma.course.findMany({
      where: { status: 'published' },
    });
    console.log(`📊 Found ${courses.length} published courses\n`);

    const createdRoadmaps = [];

    // Create roadmaps
    for (const roadmapData of ROADMAPS_DATA) {
      console.log(`📝 Creating roadmap: ${roadmapData.title}`);

      const roadmap = await prisma.roadmap.create({
        data: {
          departmentId: department.id,
          title: roadmapData.title,
          description: roadmapData.description,
          targetPosition: roadmapData.targetPosition,
          isActive: roadmapData.isActive,
        },
      });

      let coursesAdded = 0;

      // Add courses to roadmap
      for (const courseData of roadmapData.courses) {
        const course = courses.find(c => c.slug === courseData.slug);

        if (course) {
          await prisma.roadmapCourse.create({
            data: {
              roadmapId: roadmap.id,
              courseId: course.id,
              orderIndex: courseData.order,
              isRequired: courseData.required,
            },
          });
          coursesAdded++;
        } else {
          console.log(`   ⚠️  Course not found: ${courseData.slug}`);
        }
      }

      console.log(`   ✅ Added ${coursesAdded}/${roadmapData.courses.length} courses`);
      createdRoadmaps.push(roadmap);
    }

    console.log(`\n✅ Created ${createdRoadmaps.length} roadmaps\n`);

    // Create assignments
    console.log('👥 Creating roadmap assignments...\n');

    let totalAssignments = 0;

    for (const scenario of ASSIGNMENT_SCENARIOS) {
      const roadmap = createdRoadmaps.find(r => r.title === scenario.roadmapTitle);

      if (!roadmap) {
        console.log(`   ⚠️  Roadmap not found: ${scenario.roadmapTitle}`);
        continue;
      }

      for (const userEmail of scenario.userEmails) {
        const user = users.find(u => u.email === userEmail);

        if (!user) {
          console.log(`   ⚠️  User not found: ${userEmail}`);
          continue;
        }

        const assignmentData = {
          userId: user.id,
          roadmapId: roadmap.id,
          status: scenario.status,
          assignedAt: new Date(),
        };

        if (scenario.status === 'in_progress') {
          assignmentData.startedAt = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        }

        if (scenario.status === 'completed') {
          assignmentData.startedAt = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
          assignmentData.completedAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
        }

        // Note: dueDate field doesn't exist in schema

        await prisma.roadmapAssignment.create({
          data: assignmentData,
        });

        totalAssignments++;
      }

      console.log(`   ✅ ${scenario.scenario}: ${scenario.userEmails.length} assignments`);
    }

    console.log(`\n✅ Created ${totalAssignments} roadmap assignments\n`);

    console.log('🎉 Realistic roadmap seeding completed successfully!\n');

    return createdRoadmaps;
  } catch (error) {
    console.error('❌ Error seeding roadmaps:', error);
    throw error;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   REALISTIC ROADMAP SEED - STAFFUP LMS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const context = createSeedContext();

  try {
    await seedRealisticRoadmaps(context);

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

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { seedRealisticRoadmaps };
