const argon2 = require('argon2');
const { basePermissions, rolePermissionCodes, systemRoles } = require('../shared/rbac.data');

// ============================================
// SEED DATA CONFIGURATION
// ============================================

const DEFAULT_PASSWORD = process.env.SEED_DEMO_PASSWORD?.trim() || 'Test1234';
let prisma;

// ============================================
// HELPER FUNCTIONS
// ============================================

async function clearDatabase() {
  console.log('🗑️  Clearing existing data...');

  // Delete in correct order (respecting foreign keys)
  await prisma.attemptResponseOption.deleteMany();
  await prisma.attemptResponse.deleteMany();
  await prisma.quizAttemptQuestion.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.questionOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.questionBank.deleteMany();
  await prisma.lessonProgress.deleteMany();
  await prisma.learnerRiskAssessment.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lessonResource.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.module.deleteMany();
  await prisma.roadmapAssignment.deleteMany();
  await prisma.roadmapCourse.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.courseTag.deleteMany();
  await prisma.course.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  console.log('✅ Database cleared');
}

async function seedDepartments() {
  console.log('🏢 Seeding departments...');

  const departments = await prisma.department.createMany({
    data: [
      { name: 'Engineering', isActive: true },
      { name: 'Product', isActive: true },
      { name: 'Design', isActive: true },
      { name: 'Marketing', isActive: true },
      { name: 'Sales', isActive: true },
      { name: 'Human Resources', isActive: true },
      { name: 'Finance', isActive: true },
      { name: 'Operations', isActive: true },
      { name: 'Customer Success', isActive: true },
      { name: 'Data Science', isActive: true },
    ],
  });

  const allDepartments = await prisma.department.findMany({
    orderBy: { id: 'asc' },
  });
  console.log(`✅ Created ${allDepartments.length} departments`);
  return allDepartments;
}

async function seedRolesAndPermissions() {
  console.log('🔐 Seeding roles and permissions...');

  // Create roles
  for (const role of systemRoles) {
    await prisma.role.create({
      data: { ...role, isSystem: true },
    });
  }

  // Create permissions
  for (const [code, module, action, description] of basePermissions) {
    await prisma.permission.create({
      data: { code, module, action, description },
    });
  }

  const roles = await prisma.role.findMany();
  const permissions = await prisma.permission.findMany();

  // Assign permissions to roles
  const roleMap = new Map(roles.map((r) => [r.code, r.id]));
  const permissionMap = new Map(permissions.map((p) => [p.code, p.id]));

  for (const [roleCode, permissionCodes] of Object.entries(rolePermissionCodes)) {
    const roleId = roleMap.get(roleCode);
    for (const permissionCode of permissionCodes) {
      const permissionId = permissionMap.get(permissionCode);
      await prisma.rolePermission.create({
        data: { roleId, permissionId },
      });
    }
  }

  console.log(`✅ Created ${roles.length} roles and ${permissions.length} permissions`);
  return { roles, permissions };
}

async function seedUsers(departments, roles) {
  console.log('👥 Seeding users...');

  const passwordHash = await argon2.hash(DEFAULT_PASSWORD);
  const adminRole = roles.find((r) => r.code === 'admin');
  const trainerRole = roles.find((r) => r.code === 'trainer');
  const employeeRole = roles.find((r) => r.code === 'employee');

  const usersData = [
    {
      fullName: 'Admin User',
      email: 'admin@example.com',
      positionTitle: 'System Administrator',
      departmentId: departments[0].id,
      roleId: adminRole.id,
    },
    {
      fullName: 'John Trainer',
      email: 'trainer1@example.com',
      positionTitle: 'Senior Trainer',
      departmentId: departments[0].id,
      roleId: trainerRole.id,
    },
    {
      fullName: 'Jane Trainer',
      email: 'trainer2@example.com',
      positionTitle: 'Lead Trainer',
      departmentId: departments[1].id,
      roleId: trainerRole.id,
    },
    {
      fullName: 'Alice Student',
      email: 'student1@example.com',
      positionTitle: 'Software Engineer',
      departmentId: departments[0].id,
      roleId: employeeRole.id,
    },
    {
      fullName: 'Bob Student',
      email: 'student2@example.com',
      positionTitle: 'Product Manager',
      departmentId: departments[1].id,
      roleId: employeeRole.id,
    },
    {
      fullName: 'Charlie Student',
      email: 'student3@example.com',
      positionTitle: 'Designer',
      departmentId: departments[2].id,
      roleId: employeeRole.id,
    },
    {
      fullName: 'David Student',
      email: 'student4@example.com',
      positionTitle: 'Marketing Specialist',
      departmentId: departments[3].id,
      roleId: employeeRole.id,
    },
    {
      fullName: 'Eve Student',
      email: 'student5@example.com',
      positionTitle: 'Sales Representative',
      departmentId: departments[4].id,
      roleId: employeeRole.id,
    },
    {
      fullName: 'Frank Student',
      email: 'student6@example.com',
      positionTitle: 'HR Manager',
      departmentId: departments[5].id,
      roleId: employeeRole.id,
    },
    {
      fullName: 'Grace Student',
      email: 'student7@example.com',
      positionTitle: 'Data Analyst',
      departmentId: departments[9].id,
      roleId: employeeRole.id,
    },
  ];

  const users = [];
  for (const userData of usersData) {
    const user = await prisma.user.create({
      data: {
        fullName: userData.fullName,
        email: userData.email,
        positionTitle: userData.positionTitle,
        departmentId: userData.departmentId,
        passwordHash,
        avatarUrl: `https://i.pravatar.cc/150?img=${users.length + 1}`,
        isActive: true,
      },
    });

    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: userData.roleId,
      },
    });

    users.push(user);
  }

  console.log(`✅ Created ${users.length} users (password: ${DEFAULT_PASSWORD})`);
  return users;
}

async function seedCategoriesAndTags() {
  console.log('🏷️  Seeding categories and tags...');

  const categories = await prisma.category.createMany({
    data: [
      { name: 'Backend Development', slug: 'backend-development' },
      { name: 'Frontend Development', slug: 'frontend-development' },
      { name: 'DevOps', slug: 'devops' },
      { name: 'Data Science', slug: 'data-science' },
      { name: 'Mobile Development', slug: 'mobile-development' },
      { name: 'Cloud Computing', slug: 'cloud-computing' },
      { name: 'Security', slug: 'security' },
      { name: 'Soft Skills', slug: 'soft-skills' },
      { name: 'Management', slug: 'management' },
      { name: 'Design', slug: 'design' },
    ],
  });

  const tags = await prisma.tag.createMany({
    data: [
      { name: 'JavaScript', slug: 'javascript' },
      { name: 'TypeScript', slug: 'typescript' },
      { name: 'Node.js', slug: 'nodejs' },
      { name: 'React', slug: 'react' },
      { name: 'Python', slug: 'python' },
      { name: 'Docker', slug: 'docker' },
      { name: 'AWS', slug: 'aws' },
      { name: 'PostgreSQL', slug: 'postgresql' },
      { name: 'MongoDB', slug: 'mongodb' },
      { name: 'Git', slug: 'git' },
    ],
  });

  const allCategories = await prisma.category.findMany({
    orderBy: { id: 'asc' },
  });
  const allTags = await prisma.tag.findMany({
    orderBy: { id: 'asc' },
  });

  console.log(`✅ Created ${allCategories.length} categories and ${allTags.length} tags`);
  return { categories: allCategories, tags: allTags };
}

async function seedCourses(users, departments, categories, tags) {
  console.log('📚 Seeding courses...');

  const trainer1 = users[1]; // John Trainer
  const trainer2 = users[2]; // Jane Trainer

  const coursesData = [
    {
      title: 'Node.js Fundamentals',
      slug: 'nodejs-fundamentals',
      description: 'Learn Node.js from basics to advanced',
      categoryId: categories[0].id,
      trainerId: trainer1.id,
      deptId: departments[0].id,
      duration: 600,
      tagIds: [tags[0].id, tags[2].id],
    },
    {
      title: 'React Complete Guide',
      slug: 'react-complete-guide',
      description: 'Master React.js for modern web apps',
      categoryId: categories[1].id,
      trainerId: trainer1.id,
      deptId: departments[0].id,
      duration: 720,
      tagIds: [tags[0].id, tags[3].id],
    },
    {
      title: 'TypeScript Mastery',
      slug: 'typescript-mastery',
      description: 'Advanced TypeScript patterns and practices',
      categoryId: categories[0].id,
      trainerId: trainer2.id,
      deptId: departments[0].id,
      duration: 480,
      tagIds: [tags[1].id, tags[2].id],
    },
    {
      title: 'Docker & Kubernetes',
      slug: 'docker-kubernetes',
      description: 'Container orchestration and deployment',
      categoryId: categories[2].id,
      trainerId: trainer2.id,
      deptId: departments[0].id,
      duration: 540,
      tagIds: [tags[5].id],
    },
    {
      title: 'AWS Cloud Practitioner',
      slug: 'aws-cloud-practitioner',
      description: 'AWS fundamentals and best practices',
      categoryId: categories[5].id,
      trainerId: trainer1.id,
      deptId: departments[0].id,
      duration: 600,
      tagIds: [tags[6].id],
    },
    {
      title: 'Python for Data Science',
      slug: 'python-data-science',
      description: 'Data analysis with Python',
      categoryId: categories[3].id,
      trainerId: trainer2.id,
      deptId: departments[9].id,
      duration: 660,
      tagIds: [tags[4].id],
    },
    {
      title: 'PostgreSQL Database Design',
      slug: 'postgresql-database-design',
      description: 'Database design and optimization',
      categoryId: categories[0].id,
      trainerId: trainer1.id,
      deptId: departments[0].id,
      duration: 420,
      tagIds: [tags[7].id],
    },
    {
      title: 'Git & GitHub Workflow',
      slug: 'git-github-workflow',
      description: 'Version control best practices',
      categoryId: categories[2].id,
      trainerId: trainer2.id,
      deptId: departments[0].id,
      duration: 300,
      tagIds: [tags[9].id],
    },
    {
      title: 'MongoDB Essentials',
      slug: 'mongodb-essentials',
      description: 'NoSQL database fundamentals',
      categoryId: categories[0].id,
      trainerId: trainer1.id,
      deptId: departments[0].id,
      duration: 360,
      tagIds: [tags[8].id],
    },
    {
      title: 'Leadership Skills',
      slug: 'leadership-skills',
      description: 'Develop leadership and management skills',
      categoryId: categories[8].id,
      trainerId: trainer2.id,
      deptId: departments[5].id,
      duration: 480,
      tagIds: [],
    },
  ];

  const courses = [];
  for (const courseData of coursesData) {
    const course = await prisma.course.create({
      data: {
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        categoryId: courseData.categoryId,
        trainerUserId: courseData.trainerId,
        ownerDepartmentId: courseData.deptId,
        estimatedDurationMinutes: courseData.duration,
        thumbnailUrl: `https://images.unsplash.com/photo-${1500000000000 + courses.length}`,
        status: 'published',
        publishedAt: new Date(),
      },
    });

    // Add tags
    for (const tagId of courseData.tagIds) {
      await prisma.courseTag.create({
        data: { courseId: course.id, tagId },
      });
    }

    courses.push(course);
  }

  console.log(`✅ Created ${courses.length} courses`);
  return courses;
}

async function seedModulesAndLessons(courses) {
  console.log('📖 Seeding modules and lessons...');

  let totalModules = 0;
  let totalLessons = 0;

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];

    // Create 3 modules per course
    for (let m = 1; m <= 3; m++) {
      const module = await prisma.module.create({
        data: {
          courseId: course.id,
          title: `Module ${m}: ${['Introduction', 'Core Concepts', 'Advanced Topics'][m - 1]}`,
          orderIndex: m,
        },
      });

      totalModules++;

      // Create 3-4 lessons per module
      const lessonCount = 3 + (m % 2);
      for (let l = 1; l <= lessonCount; l++) {
        const lessonType = ['video', 'article', 'quiz'][l % 3];

        await prisma.lesson.create({
          data: {
            moduleId: module.id,
            title: `Lesson ${l}: ${['Getting Started', 'Deep Dive', 'Practical Examples', 'Assessment'][l - 1] || 'Advanced'}`,
            lessonType,
            contentText: lessonType === 'article' ? 'Detailed article content here...' : null,
            videoUrl:
              lessonType === 'video'
                ? `https://example.com/videos/${course.slug}-m${m}-l${l}.mp4`
                : null,
            durationSeconds: lessonType === 'video' ? 600 + l * 120 : 300,
            orderIndex: l,
            isPreview: l === 1 && m === 1,
          },
        });

        totalLessons++;
      }
    }
  }

  console.log(`✅ Created ${totalModules} modules and ${totalLessons} lessons`);
}

async function seedRoadmaps(departments, categories, users, courses) {
  console.log('🗺️  Seeding roadmaps...');

  const admin = users[0];

  const roadmapsData = [
    {
      title: 'Backend Developer Path',
      description: 'Complete backend development roadmap',
      targetPosition: 'Backend Developer',
      deptId: departments[0].id,
      categoryId: categories[0].id,
      courseIds: [courses[0].id, courses[2].id, courses[6].id],
    },
    {
      title: 'Frontend Developer Path',
      description: 'Modern frontend development roadmap',
      targetPosition: 'Frontend Developer',
      deptId: departments[0].id,
      categoryId: categories[1].id,
      courseIds: [courses[1].id, courses[7].id],
    },
    {
      title: 'Full Stack Developer Path',
      description: 'Complete full stack roadmap',
      targetPosition: 'Full Stack Developer',
      deptId: departments[0].id,
      categoryId: categories[0].id,
      courseIds: [courses[0].id, courses[1].id, courses[2].id, courses[6].id],
    },
    {
      title: 'DevOps Engineer Path',
      description: 'DevOps and cloud infrastructure',
      targetPosition: 'DevOps Engineer',
      deptId: departments[0].id,
      categoryId: categories[2].id,
      courseIds: [courses[3].id, courses[4].id, courses[7].id],
    },
    {
      title: 'Data Scientist Path',
      description: 'Data science and analytics',
      targetPosition: 'Data Scientist',
      deptId: departments[9].id,
      categoryId: categories[3].id,
      courseIds: [courses[5].id, courses[8].id],
    },
    {
      title: 'Cloud Architect Path',
      description: 'Cloud architecture and design',
      targetPosition: 'Cloud Architect',
      deptId: departments[0].id,
      categoryId: categories[5].id,
      courseIds: [courses[3].id, courses[4].id],
    },
    {
      title: 'Database Administrator Path',
      description: 'Database management and optimization',
      targetPosition: 'DBA',
      deptId: departments[0].id,
      categoryId: categories[0].id,
      courseIds: [courses[6].id, courses[8].id],
    },
    {
      title: 'Team Lead Path',
      description: 'Leadership and management skills',
      targetPosition: 'Team Lead',
      deptId: departments[5].id,
      categoryId: categories[8].id,
      courseIds: [courses[9].id],
    },
    {
      title: 'Software Engineer Path',
      description: 'General software engineering',
      targetPosition: 'Software Engineer',
      deptId: departments[0].id,
      categoryId: categories[0].id,
      courseIds: [courses[0].id, courses[2].id, courses[7].id],
    },
    {
      title: 'Mobile Developer Path',
      description: 'Mobile app development',
      targetPosition: 'Mobile Developer',
      deptId: departments[0].id,
      categoryId: categories[4].id,
      courseIds: [courses[1].id, courses[7].id],
    },
  ];

  const roadmaps = [];
  for (const roadmapData of roadmapsData) {
    const roadmap = await prisma.roadmap.create({
      data: {
        title: roadmapData.title,
        description: roadmapData.description,
        targetPosition: roadmapData.targetPosition,
        departmentId: roadmapData.deptId,
        categoryId: roadmapData.categoryId,
        createdByUserId: admin.id,
        isActive: true,
      },
    });

    // Add courses to roadmap
    for (let i = 0; i < roadmapData.courseIds.length; i++) {
      await prisma.roadmapCourse.create({
        data: {
          roadmapId: roadmap.id,
          courseId: roadmapData.courseIds[i],
          orderIndex: i + 1,
          isRequired: i < 2, // First 2 courses are required
        },
      });
    }

    roadmaps.push(roadmap);
  }

  console.log(`✅ Created ${roadmaps.length} roadmaps`);
  return roadmaps;
}

async function seedEnrollmentsAndProgress(users, courses) {
  console.log('📝 Seeding enrollments and progress...');

  const students = users.slice(3); // Students only
  const admin = users[0];

  let enrollmentCount = 0;
  let certificateCount = 0;

  // Each student enrolls in 2-3 courses
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const coursesToEnroll = courses.slice(i % 3, (i % 3) + 2);

    for (const course of coursesToEnroll) {
      // Make some enrollments completed (100%)
      const progressPercent = i % 3 === 0 ? 100 : 20 + ((i * 10) % 80);
      const daysAgo = 5 + i * 3;
      const isCompleted = progressPercent >= 100;

      const enrollment = await prisma.enrollment.create({
        data: {
          userId: student.id,
          courseId: course.id,
          assignedByUserId: admin.id,
          status: isCompleted ? 'completed' : progressPercent > 0 ? 'in_progress' : 'assigned',
          progressPercentCache: progressPercent,
          completedLessonsCountCache: Math.floor(progressPercent / 10),
          timeSpentSecondsCache: progressPercent * 60,
          enrolledAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          startedAt:
            progressPercent > 0 ? new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000) : null,
          completedAt: isCompleted ? new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) : null,
          lastActivityAt: new Date(Date.now() - Math.floor(Math.random() * 24) * 60 * 60 * 1000),
        },
      });

      enrollmentCount++;

      // Create certificate for completed enrollments
      if (isCompleted) {
        await prisma.certificate.create({
          data: {
            enrollmentId: enrollment.id,
            certificateCode: `CERT-${Date.now()}-${enrollmentCount}`,
            pdfUrl: `https://example.com/certificates/${enrollment.id}.pdf`,
            issuedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        });
        certificateCount++;
      }

      // Create lesson progress for enrolled courses
      const modules = await prisma.module.findMany({
        where: { courseId: course.id },
        include: { lessons: true },
        orderBy: { orderIndex: 'asc' },
      });

      let completedLessons = 0;
      const targetCompleted = Math.floor(progressPercent / 10);

      for (const module of modules) {
        for (const lesson of module.lessons) {
          if (completedLessons < targetCompleted) {
            await prisma.lessonProgress.create({
              data: {
                enrollmentId: enrollment.id,
                lessonId: lesson.id,
                status: 'completed',
                watchTimeSeconds: lesson.durationSeconds,
                lastPositionSeconds: lesson.durationSeconds,
                startedAt: new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000),
                completedAt: new Date(Date.now() - (daysAgo - 2) * 24 * 60 * 60 * 1000),
                lastAccessedAt: new Date(
                  Date.now() - Math.floor(Math.random() * 48) * 60 * 60 * 1000,
                ),
              },
            });
            completedLessons++;
          } else if (completedLessons === targetCompleted && progressPercent < 100) {
            // Current lesson in progress
            await prisma.lessonProgress.create({
              data: {
                enrollmentId: enrollment.id,
                lessonId: lesson.id,
                status: 'in_progress',
                watchTimeSeconds: Math.floor(lesson.durationSeconds * 0.6),
                lastPositionSeconds: Math.floor(lesson.durationSeconds * 0.6),
                startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                lastAccessedAt: new Date(
                  Date.now() - Math.floor(Math.random() * 2) * 60 * 60 * 1000,
                ),
              },
            });
            completedLessons++;
            break;
          }
        }
        if (completedLessons > targetCompleted) break;
      }
    }
  }

  console.log(
    `✅ Created ${enrollmentCount} enrollments, ${certificateCount} certificates, with lesson progress`,
  );
}

async function seedRoadmapAssignments(users, roadmaps) {
  console.log('🎯 Seeding roadmap assignments...');

  const students = users.slice(3);
  const admin = users[0];

  let assignmentCount = 0;

  // Assign roadmaps to students
  for (let i = 0; i < Math.min(students.length, roadmaps.length); i++) {
    const student = students[i];
    const roadmap = roadmaps[i];
    const daysAgo = 10 + i * 2;
    const progress = ['assigned', 'in_progress', 'completed'][i % 3];

    await prisma.roadmapAssignment.create({
      data: {
        userId: student.id,
        roadmapId: roadmap.id,
        assignedByUserId: admin.id,
        status: progress,
        assignedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        startedAt:
          progress !== 'assigned'
            ? new Date(Date.now() - (daysAgo - 2) * 24 * 60 * 60 * 1000)
            : null,
        completedAt:
          progress === 'completed' ? new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) : null,
      },
    });

    assignmentCount++;
  }

  console.log(`✅ Created ${assignmentCount} roadmap assignments`);
}

async function seedLessonResources() {
  console.log('📎 Seeding lesson resources...');

  const lessons = await prisma.lesson.findMany({
    orderBy: { id: 'asc' },
    take: 20,
  });
  let resourceCount = 0;

  for (const lesson of lessons) {
    // Add 1-2 resources per lesson
    const numResources = 1 + (resourceCount % 2);

    for (let i = 1; i <= numResources; i++) {
      await prisma.lessonResource.create({
        data: {
          lessonId: lesson.id,
          fileName: `resource-${lesson.id}-${i}.pdf`,
          fileUrl: `https://example.com/resources/lesson-${lesson.id}-${i}.pdf`,
          resourceType: ['pdf', 'doc', 'slide'][i % 3],
          orderIndex: i,
        },
      });
      resourceCount++;
    }
  }

  console.log(`✅ Created ${resourceCount} lesson resources`);
}

async function seedQuestionBanksAndQuestions(users, categories) {
  console.log('❓ Seeding question banks and questions...');

  const trainers = users.slice(1, 3);

  const questionBanks = [];
  for (let i = 0; i < 10; i++) {
    const qb = await prisma.questionBank.create({
      data: {
        categoryId: categories[i % categories.length].id,
        ownerTrainerId: trainers[i % trainers.length].id,
        title: `Question Bank ${i + 1}`,
        description: `Collection of questions for ${categories[i % categories.length].name}`,
        isActive: true,
      },
    });
    questionBanks.push(qb);
  }

  let questionCount = 0;
  let optionCount = 0;

  for (const qb of questionBanks) {
    // Create 5 questions per bank
    for (let q = 1; q <= 5; q++) {
      const questionType = ['single_choice', 'multiple_choice', 'essay'][q % 3];

      const question = await prisma.question.create({
        data: {
          questionBankId: qb.id,
          questionType,
          content: `Question ${q}: What is the correct answer for topic ${qb.title}?`,
          explanation: `This is the explanation for question ${q}`,
          defaultPoints: q,
          isActive: true,
        },
      });

      questionCount++;

      // Create options for choice questions
      if (questionType !== 'essay') {
        const numOptions = 4;
        for (let o = 1; o <= numOptions; o++) {
          await prisma.questionOption.create({
            data: {
              questionId: question.id,
              content: `Option ${o}`,
              isCorrect: o === 1 || (questionType === 'multiple_choice' && o === 2),
              orderIndex: o,
            },
          });
          optionCount++;
        }
      }
    }
  }

  console.log(
    `✅ Created ${questionBanks.length} question banks, ${questionCount} questions, ${optionCount} options`,
  );
  return questionBanks;
}

async function seedQuizzesAndAttempts(courses, questionBanks, users) {
  console.log('📝 Seeding quizzes and attempts...');

  const students = users.slice(3);
  let quizCount = 0;
  let attemptCount = 0;
  let attemptQuestionCount = 0;
  let responseCount = 0;
  let responseOptionCount = 0;

  // Create quiz for first 5 courses
  for (let i = 0; i < Math.min(5, courses.length); i++) {
    const course = courses[i];
    const qb = questionBanks[i % questionBanks.length];

    const quiz = await prisma.quiz.create({
      data: {
        courseId: course.id,
        title: `${course.title} - Final Quiz`,
        description: `Assessment quiz for ${course.title}`,
        selectionMode: 'fixed',
        passScorePercent: 70,
        timeLimitMinutes: 30,
        maxAttempts: 3,
        questionsToPull: null,
        shuffleQuestions: true,
        shuffleOptions: true,
      },
    });

    quizCount++;

    // Add questions to quiz
    const questions = await prisma.question.findMany({
      where: { questionBankId: qb.id },
      include: { options: true },
      take: 5,
    });

    const quizQuestions = [];
    for (let q = 0; q < questions.length; q++) {
      const quizQuestion = await prisma.quizQuestion.create({
        data: {
          quizId: quiz.id,
          questionId: questions[q].id,
          orderIndex: q + 1,
          points: questions[q].defaultPoints,
          isRequired: true,
        },
      });
      quizQuestions.push({ ...quizQuestion, question: questions[q] });
    }

    // Create quiz attempts for some students
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: course.id },
      take: 3,
    });

    for (const enrollment of enrollments) {
      const score = 60 + Math.floor(Math.random() * 40);

      const attempt = await prisma.quizAttempt.create({
        data: {
          enrollmentId: enrollment.id,
          quizId: quiz.id,
          attemptNo: 1,
          status: 'graded',
          objectiveScore: score,
          totalScore: score,
          isPassed: score >= 70,
          startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
          gradedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000),
          timeSpentSeconds: 1800,
        },
      });

      attemptCount++;

      // Create attempt questions and responses
      for (let aq = 0; aq < quizQuestions.length; aq++) {
        const quizQuestion = quizQuestions[aq];
        const question = quizQuestion.question;

        const attemptQuestion = await prisma.quizAttemptQuestion.create({
          data: {
            attemptId: attempt.id,
            quizQuestionId: quizQuestion.id,
            questionId: question.id,
            displayOrder: aq + 1,
            maxPoints: quizQuestion.points,
            questionSnapshot: {
              content: question.content,
              type: question.questionType,
            },
            optionsSnapshot: question.options.map((opt) => ({
              id: opt.id.toString(),
              content: opt.content,
              orderIndex: opt.orderIndex,
            })),
          },
        });

        attemptQuestionCount++;

        // Create response
        if (question.questionType === 'essay') {
          // Essay response
          const response = await prisma.attemptResponse.create({
            data: {
              attemptQuestionId: attemptQuestion.id,
              responseText: 'This is a sample essay answer provided by the student.',
              isCorrect: Math.random() > 0.3,
              awardedPoints: Math.floor(quizQuestion.points * (0.6 + Math.random() * 0.4)),
              gradedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000),
            },
          });
          responseCount++;
        } else {
          // Choice response
          const correctOptions = question.options.filter((opt) => opt.isCorrect);
          const isCorrectAnswer = Math.random() > 0.3;

          const response = await prisma.attemptResponse.create({
            data: {
              attemptQuestionId: attemptQuestion.id,
              responseText: null,
              isCorrect: isCorrectAnswer,
              awardedPoints: isCorrectAnswer ? quizQuestion.points : 0,
              gradedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000),
            },
          });
          responseCount++;

          // Create response options
          if (question.questionType === 'single_choice') {
            // Select one option
            const selectedOption = isCorrectAnswer
              ? correctOptions[0]
              : question.options.find((opt) => !opt.isCorrect);

            if (selectedOption) {
              await prisma.attemptResponseOption.create({
                data: {
                  attemptResponseId: response.id,
                  questionOptionId: selectedOption.id,
                },
              });
              responseOptionCount++;
            }
          } else if (question.questionType === 'multiple_choice') {
            // Select multiple options
            const optionsToSelect = isCorrectAnswer ? correctOptions : question.options.slice(0, 2);

            for (const opt of optionsToSelect) {
              await prisma.attemptResponseOption.create({
                data: {
                  attemptResponseId: response.id,
                  questionOptionId: opt.id,
                },
              });
              responseOptionCount++;
            }
          }
        }
      }
    }
  }

  console.log(
    `✅ Created ${quizCount} quizzes, ${attemptCount} attempts, ${attemptQuestionCount} attempt questions, ${responseCount} responses, ${responseOptionCount} response options`,
  );
}

async function seedRiskAssessments() {
  console.log('⚠️  Seeding risk assessments...');

  const enrollments = await prisma.enrollment.findMany({
    where: { status: 'in_progress' },
    take: 10,
  });

  let riskCount = 0;

  for (const enrollment of enrollments) {
    const riskScore = 10 + Math.floor(Math.random() * 80);
    const riskLevel = riskScore < 30 ? 'low' : riskScore < 60 ? 'medium' : 'high';

    await prisma.learnerRiskAssessment.create({
      data: {
        enrollmentId: enrollment.id,
        riskScore,
        riskLevel,
        modelVersion: 'v1.0',
        reasons: {
          lowActivity: riskScore > 50,
          slowProgress: riskScore > 40,
          missedDeadlines: riskScore > 60,
        },
        recommendations:
          riskLevel === 'high' ? 'Immediate intervention needed' : 'Monitor progress',
        interventions: riskLevel === 'high' ? 'Contact learner, provide support' : null,
        calculatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    riskCount++;
  }

  console.log(`✅ Created ${riskCount} risk assessments`);
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function runDemoSeed(context) {
  prisma = context.prisma;
  console.log('Starting demo database seed...\n');

  await clearDatabase();

  const departments = await seedDepartments();
  const { roles, permissions } = await seedRolesAndPermissions();
  const users = await seedUsers(departments, roles);
  const { categories, tags } = await seedCategoriesAndTags();
  const courses = await seedCourses(users, departments, categories, tags);
  await seedModulesAndLessons(courses);
  await seedLessonResources();
  const roadmaps = await seedRoadmaps(departments, categories, users, courses);
  await seedEnrollmentsAndProgress(users, courses);
  await seedRoadmapAssignments(users, roadmaps);
  const questionBanks = await seedQuestionBanksAndQuestions(users, categories);
  await seedQuizzesAndAttempts(courses, questionBanks, users);
  await seedRiskAssessments();

  console.log('\nDemo seed completed successfully.');
  console.log(`
📊 Summary:
- Departments: ${departments.length}
- Users: ${users.length} (password: ${DEFAULT_PASSWORD})
- Roles: ${roles.length}
- Permissions: ${permissions.length}
- Categories: ${categories.length}
- Tags: ${tags.length}
- Courses: ${courses.length}
- Roadmaps: ${roadmaps.length}
- Question Banks: ${questionBanks.length}
- Quizzes: Created with attempts
- Lesson Resources: Added
- Lesson Progress: Added
- Risk Assessments: Added

🔑 Test Accounts:
- Admin: admin@example.com / ${DEFAULT_PASSWORD}
- Trainer: trainer1@example.com / ${DEFAULT_PASSWORD}
- Student: student1@example.com / ${DEFAULT_PASSWORD}
  `);
}

/* main()
  .catch((error) => {
    console.error('❌ Seed failed:');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  }); */

module.exports = {
  runDemoSeed,
};
