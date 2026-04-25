const { createSeedContext, disposeSeedContext } = require('../shared/client');

/**
 * ROADMAP SEED DATA - CHI TIẾT ĐẦY ĐỦ
 * 
 * Kế hoạch seed bao gồm:
 * 1. Roadmaps cho các vị trí kỹ thuật (Technical Roles)
 * 2. Roadmaps cho các vị trí quản lý (Management Roles)
 * 3. Roadmaps cho các vị trí chuyên môn (Specialized Roles)
 * 4. Roadmaps onboarding cho nhân viên mới
 * 5. Roadmap assignments với các trạng thái khác nhau
 */

// ============================================================================
// ROADMAP DATA STRUCTURE
// ============================================================================

const ROADMAP_CATEGORIES = {
  TECHNICAL: 'technical',
  MANAGEMENT: 'management',
  SPECIALIZED: 'specialized',
  ONBOARDING: 'onboarding',
  UPSKILLING: 'upskilling',
};

const ROADMAPS_DATA = [
  // ─── TECHNICAL ROADMAPS ───────────────────────────────────────────────────
  {
    title: 'Lộ trình Backend Developer - Junior đến Senior',
    description: `Lộ trình toàn diện từ Junior đến Senior Backend Developer.
    
    Bao gồm:
    - Nền tảng lập trình và cơ sở dữ liệu
    - RESTful API và GraphQL
    - Microservices và System Design
    - Performance optimization và Security
    - Cloud deployment và DevOps practices`,
    targetPosition: 'Senior Backend Developer',
    category: ROADMAP_CATEGORIES.TECHNICAL,
    departmentName: 'Engineering',
    categorySlug: 'backend-development',
    isActive: true,
    courses: [
      { title: 'Node.js & Express Fundamentals', order: 1, required: true },
      { title: 'TypeScript cho Backend', order: 2, required: true },
      { title: 'Database Design & PostgreSQL', order: 3, required: true },
      { title: 'RESTful API Best Practices', order: 4, required: true },
      { title: 'Authentication & Authorization', order: 5, required: true },
      { title: 'Microservices Architecture', order: 6, required: false },
      { title: 'System Design Fundamentals', order: 7, required: false },
      { title: 'Performance Optimization', order: 8, required: false },
    ],
  },
  
  {
    title: 'Lộ trình Frontend Developer - React & Next.js',
    description: `Trở thành Frontend Developer chuyên nghiệp với React ecosystem.
    
    Nội dung:
    - HTML, CSS, JavaScript hiện đại
    - React hooks và state management
    - Next.js và Server-Side Rendering
    - TypeScript cho Frontend
    - UI/UX best practices
    - Performance và Accessibility`,
    targetPosition: 'Senior Frontend Developer',
    category: ROADMAP_CATEGORIES.TECHNICAL,
    departmentName: 'Engineering',
    categorySlug: 'frontend-development',
    isActive: true,
    courses: [
      { title: 'Modern JavaScript ES6+', order: 1, required: true },
      { title: 'React Fundamentals', order: 2, required: true },
      { title: 'React Hooks & Context', order: 3, required: true },
      { title: 'Next.js Framework', order: 4, required: true },
      { title: 'TypeScript cho Frontend', order: 5, required: true },
      { title: 'State Management với Redux', order: 6, required: false },
      { title: 'CSS-in-JS & Tailwind', order: 7, required: false },
      { title: 'Web Performance Optimization', order: 8, required: false },
    ],
  },

  {
    title: 'Lộ trình Full Stack Developer',
    description: `Lộ trình toàn diện cho Full Stack Developer.
    
    Kỹ năng:
    - Backend: Node.js, Express, Database
    - Frontend: React, Next.js, TypeScript
    - DevOps: Docker, CI/CD
    - System Design và Architecture
    - Testing và Quality Assurance`,
    targetPosition: 'Full Stack Developer',
    category: ROADMAP_CATEGORIES.TECHNICAL,
    departmentName: 'Engineering',
    categorySlug: 'full-stack-development',
    isActive: true,
    courses: [
      { title: 'Node.js & Express Fundamentals', order: 1, required: true },
      { title: 'React Fundamentals', order: 2, required: true },
      { title: 'TypeScript Full Stack', order: 3, required: true },
      { title: 'Database Design & PostgreSQL', order: 4, required: true },
      { title: 'RESTful API Development', order: 5, required: true },
      { title: 'Next.js Full Stack', order: 6, required: true },
      { title: 'Docker & Containerization', order: 7, required: false },
      { title: 'Testing: Unit, Integration, E2E', order: 8, required: false },
      { title: 'CI/CD Pipeline', order: 9, required: false },
    ],
  },

  {
    title: 'Lộ trình DevOps Engineer',
    description: `Trở thành DevOps Engineer với kiến thức về infrastructure và automation.
    
    Bao gồm:
    - Linux và Shell scripting
    - Docker và Kubernetes
    - CI/CD pipelines
    - AWS Cloud Services
    - Infrastructure as Code (Terraform)
    - Monitoring và Logging`,
    targetPosition: 'DevOps Engineer',
    category: ROADMAP_CATEGORIES.TECHNICAL,
    departmentName: 'Infrastructure',
    categorySlug: 'devops',
    isActive: true,
    courses: [
      { title: 'Linux System Administration', order: 1, required: true },
      { title: 'Docker Fundamentals', order: 2, required: true },
      { title: 'Kubernetes Essentials', order: 3, required: true },
      { title: 'AWS Cloud Practitioner', order: 4, required: true },
      { title: 'CI/CD với Jenkins/GitLab', order: 5, required: true },
      { title: 'Terraform Infrastructure as Code', order: 6, required: false },
      { title: 'Monitoring với Prometheus & Grafana', order: 7, required: false },
      { title: 'Security Best Practices', order: 8, required: false },
    ],
  },

  {
    title: 'Lộ trình Data Engineer',
    description: `Xây dựng data pipelines và data infrastructure.
    
    Nội dung:
    - Python cho Data Engineering
    - SQL và Database optimization
    - ETL/ELT processes
    - Big Data technologies (Spark, Kafka)
    - Data Warehousing
    - Cloud data services`,
    targetPosition: 'Data Engineer',
    category: ROADMAP_CATEGORIES.TECHNICAL,
    departmentName: 'Data',
    categorySlug: 'data-engineering',
    isActive: true,
    courses: [
      { title: 'Python for Data Engineering', order: 1, required: true },
      { title: 'Advanced SQL & Query Optimization', order: 2, required: true },
      { title: 'ETL Pipeline Development', order: 3, required: true },
      { title: 'Apache Spark Fundamentals', order: 4, required: true },
      { title: 'Data Warehousing Concepts', order: 5, required: false },
      { title: 'Apache Kafka Streaming', order: 6, required: false },
      { title: 'AWS Data Services', order: 7, required: false },
    ],
  },

  // ─── MANAGEMENT ROADMAPS ──────────────────────────────────────────────────
  {
    title: 'Lộ trình Engineering Manager',
    description: `Phát triển kỹ năng quản lý cho Engineering Manager.
    
    Kỹ năng:
    - Team leadership và people management
    - Technical decision making
    - Agile và Scrum practices
    - Performance management
    - Hiring và onboarding
    - Stakeholder communication`,
    targetPosition: 'Engineering Manager',
    category: ROADMAP_CATEGORIES.MANAGEMENT,
    departmentName: 'Engineering',
    categorySlug: 'engineering-management',
    isActive: true,
    courses: [
      { title: 'Leadership Fundamentals', order: 1, required: true },
      { title: 'Agile & Scrum for Managers', order: 2, required: true },
      { title: 'Performance Management', order: 3, required: true },
      { title: 'Technical Decision Making', order: 4, required: true },
      { title: 'Hiring & Interviewing', order: 5, required: false },
      { title: 'Conflict Resolution', order: 6, required: false },
      { title: 'Strategic Planning', order: 7, required: false },
    ],
  },

  {
    title: 'Lộ trình Product Manager',
    description: `Trở thành Product Manager chuyên nghiệp.
    
    Nội dung:
    - Product discovery và validation
    - User research và analytics
    - Product roadmap planning
    - Agile product development
    - Stakeholder management
    - Go-to-market strategy`,
    targetPosition: 'Product Manager',
    category: ROADMAP_CATEGORIES.MANAGEMENT,
    departmentName: 'Product',
    categorySlug: 'product-management',
    isActive: true,
    courses: [
      { title: 'Product Management Fundamentals', order: 1, required: true },
      { title: 'User Research Methods', order: 2, required: true },
      { title: 'Product Analytics', order: 3, required: true },
      { title: 'Agile Product Development', order: 4, required: true },
      { title: 'Product Roadmap Planning', order: 5, required: true },
      { title: 'Go-to-Market Strategy', order: 6, required: false },
      { title: 'A/B Testing & Experimentation', order: 7, required: false },
    ],
  },

  // ─── SPECIALIZED ROADMAPS ─────────────────────────────────────────────────
  {
    title: 'Lộ trình Security Engineer',
    description: `Chuyên gia bảo mật ứng dụng và hạ tầng.
    
    Kỹ năng:
    - Application security fundamentals
    - Penetration testing
    - Security compliance (OWASP, ISO)
    - Incident response
    - Security automation
    - Cloud security`,
    targetPosition: 'Security Engineer',
    category: ROADMAP_CATEGORIES.SPECIALIZED,
    departmentName: 'Security',
    categorySlug: 'security',
    isActive: true,
    courses: [
      { title: 'Application Security Basics', order: 1, required: true },
      { title: 'OWASP Top 10', order: 2, required: true },
      { title: 'Penetration Testing', order: 3, required: true },
      { title: 'Security Compliance', order: 4, required: true },
      { title: 'Cloud Security (AWS)', order: 5, required: false },
      { title: 'Incident Response', order: 6, required: false },
      { title: 'Security Automation', order: 7, required: false },
    ],
  },

  {
    title: 'Lộ trình UI/UX Designer',
    description: `Thiết kế trải nghiệm người dùng chuyên nghiệp.
    
    Nội dung:
    - Design thinking và user research
    - Wireframing và prototyping
    - Visual design principles
    - Figma và design tools
    - Design systems
    - Usability testing`,
    targetPosition: 'UI/UX Designer',
    category: ROADMAP_CATEGORIES.SPECIALIZED,
    departmentName: 'Design',
    categorySlug: 'ui-ux-design',
    isActive: true,
    courses: [
      { title: 'Design Thinking Fundamentals', order: 1, required: true },
      { title: 'User Research Methods', order: 2, required: true },
      { title: 'Wireframing & Prototyping', order: 3, required: true },
      { title: 'Visual Design Principles', order: 4, required: true },
      { title: 'Figma Mastery', order: 5, required: true },
      { title: 'Design Systems', order: 6, required: false },
      { title: 'Usability Testing', order: 7, required: false },
      { title: 'Accessibility Design', order: 8, required: false },
    ],
  },

  {
    title: 'Lộ trình QA Engineer',
    description: `Quality Assurance và Testing chuyên nghiệp.
    
    Bao gồm:
    - Manual testing fundamentals
    - Test automation
    - API testing
    - Performance testing
    - CI/CD integration
    - Test strategy và planning`,
    targetPosition: 'QA Engineer',
    category: ROADMAP_CATEGORIES.SPECIALIZED,
    departmentName: 'Quality Assurance',
    categorySlug: 'qa-testing',
    isActive: true,
    courses: [
      { title: 'Software Testing Fundamentals', order: 1, required: true },
      { title: 'Test Automation với Selenium', order: 2, required: true },
      { title: 'API Testing với Postman', order: 3, required: true },
      { title: 'Performance Testing', order: 4, required: true },
      { title: 'CI/CD for QA', order: 5, required: false },
      { title: 'Test Strategy & Planning', order: 6, required: false },
    ],
  },

  // ─── ONBOARDING ROADMAPS ──────────────────────────────────────────────────
  {
    title: 'Onboarding - Nhân viên kỹ thuật mới',
    description: `Chương trình onboarding cho nhân viên kỹ thuật mới.
    
    Nội dung:
    - Giới thiệu công ty và văn hóa
    - Quy trình làm việc và tools
    - Codebase overview
    - Development workflow
    - Security và compliance
    - Team collaboration`,
    targetPosition: 'All Technical Roles',
    category: ROADMAP_CATEGORIES.ONBOARDING,
    departmentName: 'Engineering',
    categorySlug: 'onboarding',
    isActive: true,
    courses: [
      { title: 'Company Culture & Values', order: 1, required: true },
      { title: 'Development Tools Setup', order: 2, required: true },
      { title: 'Git Workflow & Best Practices', order: 3, required: true },
      { title: 'Codebase Architecture Overview', order: 4, required: true },
      { title: 'Security Policies', order: 5, required: true },
      { title: 'Agile Practices at StaffUp', order: 6, required: true },
    ],
  },

  {
    title: 'Onboarding - Product Team',
    description: `Onboarding cho Product Managers và Product Designers mới.
    
    Bao gồm:
    - Product vision và strategy
    - User personas và research
    - Product development process
    - Tools và workflows
    - Stakeholder management`,
    targetPosition: 'Product Team',
    category: ROADMAP_CATEGORIES.ONBOARDING,
    departmentName: 'Product',
    categorySlug: 'onboarding',
    isActive: true,
    courses: [
      { title: 'Product Vision & Strategy', order: 1, required: true },
      { title: 'User Research at StaffUp', order: 2, required: true },
      { title: 'Product Development Process', order: 3, required: true },
      { title: 'Product Tools & Workflows', order: 4, required: true },
      { title: 'Stakeholder Communication', order: 5, required: true },
    ],
  },

  // ─── UPSKILLING ROADMAPS ──────────────────────────────────────────────────
  {
    title: 'Nâng cấp kỹ năng: AI & Machine Learning',
    description: `Học AI và Machine Learning cho developers.
    
    Nội dung:
    - Python for AI/ML
    - Machine Learning fundamentals
    - Deep Learning basics
    - AI integration trong applications
    - LLMs và Generative AI`,
    targetPosition: 'AI/ML Engineer',
    category: ROADMAP_CATEGORIES.UPSKILLING,
    departmentName: 'Engineering',
    categorySlug: 'ai-machine-learning',
    isActive: true,
    courses: [
      { title: 'Python for AI/ML', order: 1, required: true },
      { title: 'Machine Learning Fundamentals', order: 2, required: true },
      { title: 'Deep Learning Basics', order: 3, required: true },
      { title: 'Natural Language Processing', order: 4, required: false },
      { title: 'LLMs & Generative AI', order: 5, required: false },
      { title: 'AI Integration in Apps', order: 6, required: false },
    ],
  },

  {
    title: 'Nâng cấp kỹ năng: Cloud Architecture',
    description: `Trở thành Cloud Architect với AWS.
    
    Kỹ năng:
    - AWS core services
    - Cloud architecture patterns
    - Serverless computing
    - Cost optimization
    - High availability và disaster recovery
    - Security best practices`,
    targetPosition: 'Cloud Architect',
    category: ROADMAP_CATEGORIES.UPSKILLING,
    departmentName: 'Infrastructure',
    categorySlug: 'cloud-architecture',
    isActive: true,
    courses: [
      { title: 'AWS Solutions Architect', order: 1, required: true },
      { title: 'Cloud Architecture Patterns', order: 2, required: true },
      { title: 'Serverless với AWS Lambda', order: 3, required: true },
      { title: 'AWS Cost Optimization', order: 4, required: false },
      { title: 'High Availability Design', order: 5, required: false },
      { title: 'Cloud Security', order: 6, required: false },
    ],
  },

  {
    title: 'Nâng cấp kỹ năng: Microservices Architecture',
    description: `Thiết kế và triển khai Microservices.
    
    Nội dung:
    - Microservices patterns
    - Service communication
    - API Gateway
    - Event-driven architecture
    - Distributed tracing
    - Service mesh`,
    targetPosition: 'Solutions Architect',
    category: ROADMAP_CATEGORIES.UPSKILLING,
    departmentName: 'Engineering',
    categorySlug: 'microservices',
    isActive: true,
    courses: [
      { title: 'Microservices Fundamentals', order: 1, required: true },
      { title: 'Service Communication Patterns', order: 2, required: true },
      { title: 'API Gateway Design', order: 3, required: true },
      { title: 'Event-Driven Architecture', order: 4, required: true },
      { title: 'Distributed Tracing', order: 5, required: false },
      { title: 'Service Mesh với Istio', order: 6, required: false },
    ],
  },
];

// ============================================================================
// ASSIGNMENT SCENARIOS
// ============================================================================

const ASSIGNMENT_SCENARIOS = [
  {
    scenario: 'new_hire_backend',
    description: 'Nhân viên Backend mới vào',
    roadmapTitle: 'Lộ trình Backend Developer - Junior đến Senior',
    status: 'in_progress',
    daysAgo: 7,
  },
  {
    scenario: 'new_hire_frontend',
    description: 'Nhân viên Frontend mới vào',
    roadmapTitle: 'Lộ trình Frontend Developer - React & Next.js',
    status: 'assigned',
    daysAgo: 3,
  },
  {
    scenario: 'upskilling_ai',
    description: 'Nhân viên muốn học AI/ML',
    roadmapTitle: 'Nâng cấp kỹ năng: AI & Machine Learning',
    status: 'in_progress',
    daysAgo: 30,
  },
  {
    scenario: 'promotion_to_manager',
    description: 'Thăng chức lên Engineering Manager',
    roadmapTitle: 'Lộ trình Engineering Manager',
    status: 'assigned',
    daysAgo: 5,
  },
  {
    scenario: 'completed_fullstack',
    description: 'Hoàn thành lộ trình Full Stack',
    roadmapTitle: 'Lộ trình Full Stack Developer',
    status: 'completed',
    daysAgo: 90,
  },
  {
    scenario: 'onboarding_tech',
    description: 'Onboarding nhân viên kỹ thuật',
    roadmapTitle: 'Onboarding - Nhân viên kỹ thuật mới',
    status: 'in_progress',
    daysAgo: 2,
  },
];

// ============================================================================
// SEED FUNCTIONS
// ============================================================================

async function seedDetailedRoadmaps(context) {
  console.log('🚀 Starting detailed roadmap seeding...\n');

  const prisma = context.prisma;

  try {
    // Get required data
    const departments = await prisma.department.findMany();
    const categories = await prisma.category.findMany();
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@staffup.local' },
    });
    const courses = await prisma.course.findMany();

    if (!admin) {
      console.log('⚠️  Admin user not found. Skipping roadmap seed.');
      return [];
    }

    console.log(`📊 Found ${departments.length} departments`);
    console.log(`📊 Found ${categories.length} categories`);
    console.log(`📊 Found ${courses.length} courses\n`);

    // Create roadmaps
    const createdRoadmaps = [];
    
    for (const roadmapData of ROADMAPS_DATA) {
      console.log(`📝 Creating roadmap: ${roadmapData.title}`);

      // Find department
      const department = departments.find(
        d => d.name.toLowerCase().includes(roadmapData.departmentName.toLowerCase())
      ) || departments[0];

      // Find category
      const category = categories.find(
        c => c.slug === roadmapData.categorySlug
      );

      // Create roadmap
      const roadmap = await prisma.roadmap.create({
        data: {
          title: roadmapData.title,
          description: roadmapData.description,
          targetPosition: roadmapData.targetPosition,
          departmentId: department.id,
          categoryId: category?.id,
          createdByUserId: admin.id,
          isActive: roadmapData.isActive,
        },
      });

      // Add courses to roadmap
      let coursesAdded = 0;
      const addedCourseIds = new Set();
      
      for (const courseData of roadmapData.courses) {
        // Find course by title (fuzzy match)
        const course = courses.find(c => 
          c.title.toLowerCase().includes(courseData.title.toLowerCase().split(' ')[0])
        );

        if (course && !addedCourseIds.has(course.id)) {
          await prisma.roadmapCourse.create({
            data: {
              roadmapId: roadmap.id,
              courseId: course.id,
              orderIndex: courseData.order,
              isRequired: courseData.required,
            },
          });
          addedCourseIds.add(course.id);
          coursesAdded++;
        }
      }

      console.log(`   ✅ Added ${coursesAdded}/${roadmapData.courses.length} courses`);
      createdRoadmaps.push(roadmap);
    }

    console.log(`\n✅ Created ${createdRoadmaps.length} roadmaps\n`);

    // Create roadmap assignments
    await seedRoadmapAssignments(prisma, createdRoadmaps, admin);

    console.log('\n🎉 Detailed roadmap seeding completed successfully!\n');
    
    return createdRoadmaps;
  } catch (error) {
    console.error('❌ Error seeding roadmaps:', error);
    return [];
  }
}

async function seedRoadmapAssignments(prisma, roadmaps, admin) {
  console.log('👥 Creating roadmap assignments...\n');

  const users = await prisma.user.findMany({
    where: {
      email: { not: 'admin@staffup.local' },
    },
    take: 20,
  });

  if (users.length === 0) {
    console.log('⚠️  No users found for assignments. Skipping...');
    return;
  }

  let assignmentCount = 0;

  for (const scenario of ASSIGNMENT_SCENARIOS) {
    const roadmap = roadmaps.find(r => r.title === scenario.roadmapTitle);
    
    if (!roadmap) {
      console.log(`⚠️  Roadmap not found: ${scenario.roadmapTitle}`);
      continue;
    }

    // Assign to multiple users
    const usersToAssign = users.slice(
      assignmentCount % users.length,
      (assignmentCount % users.length) + 3
    );

    for (const user of usersToAssign) {
      const assignedAt = new Date();
      assignedAt.setDate(assignedAt.getDate() - scenario.daysAgo);

      const assignmentData = {
        userId: user.id,
        roadmapId: roadmap.id,
        assignedByUserId: admin.id,
        status: scenario.status,
        assignedAt,
      };

      // Add timestamps based on status
      if (scenario.status === 'in_progress') {
        const startedAt = new Date(assignedAt);
        startedAt.setDate(startedAt.getDate() + 1);
        assignmentData.startedAt = startedAt;
      } else if (scenario.status === 'completed') {
        const startedAt = new Date(assignedAt);
        startedAt.setDate(startedAt.getDate() + 1);
        const completedAt = new Date(startedAt);
        completedAt.setDate(completedAt.getDate() + 60);
        assignmentData.startedAt = startedAt;
        assignmentData.completedAt = completedAt;
      }

      try {
        await prisma.roadmapAssignment.create({
          data: assignmentData,
        });
        assignmentCount++;
      } catch (error) {
        // Skip if assignment already exists
        if (!error.message.includes('Unique constraint')) {
          console.error(`   ❌ Error assigning roadmap to user ${user.id}:`, error.message);
        }
      }
    }

    console.log(`   ✅ ${scenario.scenario}: ${usersToAssign.length} assignments`);
  }

  console.log(`\n✅ Created ${assignmentCount} roadmap assignments`);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function cleanupRoadmaps(prisma) {
  console.log('🧹 Cleaning up existing roadmap data...\n');
  
  await prisma.roadmapAssignment.deleteMany();
  await prisma.roadmapCourse.deleteMany();
  await prisma.roadmap.deleteMany();
  
  console.log('✅ Cleanup completed\n');
}

async function getRoadmapStats(prisma) {
  const roadmapCount = await prisma.roadmap.count();
  const assignmentCount = await prisma.roadmapAssignment.count();
  const roadmapCourseCount = await prisma.roadmapCourse.count();

  console.log('\n📊 ROADMAP STATISTICS:');
  console.log(`   Total Roadmaps: ${roadmapCount}`);
  console.log(`   Total Assignments: ${assignmentCount}`);
  console.log(`   Total Roadmap Courses: ${roadmapCourseCount}`);

  const roadmapsByCategory = await prisma.roadmap.groupBy({
    by: ['isActive'],
    _count: true,
  });

  console.log('\n   By Status:');
  roadmapsByCategory.forEach(stat => {
    console.log(`   - ${stat.isActive ? 'Active' : 'Inactive'}: ${stat._count}`);
  });

  const assignmentsByStatus = await prisma.roadmapAssignment.groupBy({
    by: ['status'],
    _count: true,
  });

  console.log('\n   Assignments by Status:');
  assignmentsByStatus.forEach(stat => {
    console.log(`   - ${stat.status}: ${stat._count}`);
  });
}

// ============================================================================
// MAIN EXECUTION (for standalone run)
// ============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   ROADMAP DETAILED SEED - STAFFUP LMS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const { createSeedContext, disposeSeedContext } = require('../shared/client');
  const context = createSeedContext();

  try {
    // Cleanup existing data
    await cleanupRoadmaps(context.prisma);

    // Seed roadmaps
    await seedDetailedRoadmaps(context);

    // Show statistics
    await getRoadmapStats(context.prisma);

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
  main()
    .catch(console.error);
}

// Export for use in other seed files
module.exports = {
  seedDetailedRoadmaps,
  seedRoadmapAssignments,
  cleanupRoadmaps,
  ROADMAPS_DATA,
  ASSIGNMENT_SCENARIOS,
};
