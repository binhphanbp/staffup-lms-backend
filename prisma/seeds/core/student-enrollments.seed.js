/**
 * Seed enrollments for student users
 * Assigns courses to students based on their learning paths
 */
async function seedStudentEnrollments(context) {
  const { prisma } = context;

  console.log('📚 Seeding student enrollments...');

  // Get students
  const students = await prisma.user.findMany({
    where: {
      email: {
        in: ['student1@staffup.local', 'student2@staffup.local', 'student3@staffup.local'],
      },
    },
  });

  if (students.length === 0) {
    console.log('  ⚠️  No students found. Skipping enrollment seed.');
    return { enrollments: 0 };
  }

  // Get admin as assigner
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@staffup.local' },
  });

  // Get courses by slug
  const courses = await prisma.course.findMany({
    where: {
      slug: {
        in: [
          'python-programming-basics-advanced',
          'nodejs-api-fundamentals',
          'uiux-design-figma',
          'vuejs-progressive-framework',
          'nextjs-typescript-modern-web',
          'php-mysql-web-development',
          'devops-aws-complete-guide',
        ],
      },
    },
  });

  const courseMap = {};
  courses.forEach((course) => {
    courseMap[course.slug] = course;
  });

  // Define enrollment scenarios for each student
  const ENROLLMENT_SCENARIOS = [
    // Student 1 - Junior Developer (Backend focus)
    {
      email: 'student1@staffup.local',
      enrollments: [
        {
          slug: 'python-programming-basics-advanced',
          status: 'in_progress',
          progressPercent: 45,
          startedDaysAgo: 14,
          note: 'Onboarding course - Backend fundamentals',
        },
        {
          slug: 'nodejs-api-fundamentals',
          status: 'in_progress',
          progressPercent: 20,
          startedDaysAgo: 7,
          note: 'Backend API development',
        },
        {
          slug: 'uiux-design-figma',
          status: 'assigned',
          progressPercent: 0,
          note: 'Optional - UI/UX basics',
        },
      ],
    },
    // Student 2 - Frontend Developer
    {
      email: 'student2@staffup.local',
      enrollments: [
        {
          slug: 'python-programming-basics-advanced',
          status: 'completed',
          progressPercent: 100,
          startedDaysAgo: 30,
          completedDaysAgo: 5,
          note: 'Onboarding course completed',
        },
        {
          slug: 'vuejs-progressive-framework',
          status: 'in_progress',
          progressPercent: 60,
          startedDaysAgo: 10,
          note: 'Frontend framework - Vue.js',
        },
        {
          slug: 'nextjs-typescript-modern-web',
          status: 'assigned',
          progressPercent: 0,
          note: 'Next course in learning path',
        },
        {
          slug: 'uiux-design-figma',
          status: 'in_progress',
          progressPercent: 35,
          startedDaysAgo: 12,
          note: 'UI/UX fundamentals',
        },
      ],
    },
    // Student 3 - Backend Developer
    {
      email: 'student3@staffup.local',
      enrollments: [
        {
          slug: 'python-programming-basics-advanced',
          status: 'in_progress',
          progressPercent: 70,
          startedDaysAgo: 20,
          note: 'Onboarding - Python fundamentals',
        },
        {
          slug: 'nodejs-api-fundamentals',
          status: 'assigned',
          progressPercent: 0,
          note: 'Backend API with Node.js',
        },
        {
          slug: 'php-mysql-web-development',
          status: 'assigned',
          progressPercent: 0,
          note: 'Backend - PHP & MySQL',
        },
        {
          slug: 'devops-aws-complete-guide',
          status: 'assigned',
          progressPercent: 0,
          note: 'DevOps fundamentals',
        },
      ],
    },
  ];

  let totalEnrollments = 0;

  for (const scenario of ENROLLMENT_SCENARIOS) {
    const student = students.find((s) => s.email === scenario.email);

    if (!student) {
      console.log(`  ⚠️  Student not found: ${scenario.email}`);
      continue;
    }

    console.log(`\n  👤 ${student.fullName} (${student.email})`);

    for (const enrollment of scenario.enrollments) {
      const course = courseMap[enrollment.slug];

      if (!course) {
        console.log(`     ⚠️  Course not found: ${enrollment.slug}`);
        continue;
      }

      // Check if enrollment already exists
      const existing = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: student.id,
            courseId: course.id,
          },
        },
      });

      if (existing) {
        console.log(`     ⚠️  Already enrolled: ${course.title}`);
        continue;
      }

      // Prepare enrollment data
      const enrollmentData = {
        userId: student.id,
        courseId: course.id,
        assignedByUserId: admin?.id,
        status: enrollment.status,
        progressPercentCache: enrollment.progressPercent,
        assignmentNote: enrollment.note,
        enrolledAt: new Date(),
      };

      // Set startedAt if in_progress or completed
      if (enrollment.startedDaysAgo) {
        enrollmentData.startedAt = new Date(
          Date.now() - enrollment.startedDaysAgo * 24 * 60 * 60 * 1000
        );
        enrollmentData.lastActivityAt = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // 1 day ago
      }

      // Set completedAt if completed
      if (enrollment.status === 'completed' && enrollment.completedDaysAgo) {
        enrollmentData.completedAt = new Date(
          Date.now() - enrollment.completedDaysAgo * 24 * 60 * 60 * 1000
        );
      }

      await prisma.enrollment.create({
        data: enrollmentData,
      });

      const statusEmoji = {
        assigned: '📋',
        in_progress: '🔄',
        completed: '✅',
      };

      console.log(
        `     ${statusEmoji[enrollment.status]} ${course.title} (${enrollment.progressPercent}%)`
      );
      totalEnrollments++;
    }
  }

  console.log(`\n✅ Created ${totalEnrollments} student enrollments\n`);

  return { enrollments: totalEnrollments };
}

module.exports = { seedStudentEnrollments };
