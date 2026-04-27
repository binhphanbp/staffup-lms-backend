require('dotenv/config');

const { seedAdmin } = require('./seeds/core/admin.seed');
const { seedCourseFixturesBundle } = require('./seeds/core/course-fixtures.seed');
const { seedAdminDepartment } = require('./seeds/core/departments.seed');
const { seedRbac } = require('./seeds/core/rbac.seed');
const { seedStudents } = require('./seeds/core/students.seed');
const { seedStudentEnrollments } = require('./seeds/core/student-enrollments.seed');
const { seedRoleplayScenarios } = require('./seeds/core/roleplay-scenarios.seed');
const { seedOnboardingTemplates } = require('./seeds/core/onboarding-templates.seed');
const { runDemoSeed } = require('./seeds/demo/full-demo.seed');
const { seedRealisticRoadmaps } = require('./seeds/demo/roadmap-realistic.seed');
const { seedCoursesFromCloudinary } = require('./seeds/demo/courses-from-cloudinary.seed');
const { seedQuestionQuiz } = require('./seeds/demo/question-quiz.seed');
const { createSeedContext, disposeSeedContext } = require('./seeds/shared/client');

function isDemoSeedEnabled() {
  const value = process.env.SEED_DEMO?.trim().toLowerCase();
  return value === '1' || value === 'true' || value === 'yes';
}

async function runCoreSeed(context) {
  console.log('Starting core database seed...\n');

  const department = await seedAdminDepartment(context);
  const { roles, permissions } = await seedRbac(context);
  const { config } = await seedAdmin(context, department);
  const courseFixtures = await seedCourseFixturesBundle(context, department);
  const studentData = await seedStudents(context);

  // Seed courses from Cloudinary
  console.log('\n🎬 Seeding courses from Cloudinary videos...');
  const cloudinaryCourses = await seedCoursesFromCloudinary(context);

  // Seed roadmaps (AFTER courses are created)
  console.log('\n📍 Seeding realistic roadmaps...');
  const roadmaps = await seedRealisticRoadmaps(context);

  // Seed student enrollments (AFTER courses and students are created)
  console.log('\n📚 Seeding student enrollments...');
  const enrollmentData = await seedStudentEnrollments(context);

  // Seed questions and quizzes (AFTER courses are created)
  console.log('\n🎯 Seeding questions and quizzes...');
  const quizData = await seedQuestionQuiz(context);

  // Seed voice roleplay scenarios
  console.log('\n🎭 Seeding voice roleplay scenarios...');
  const roleplayData = await seedRoleplayScenarios(context);

  // Seed onboarding templates
  console.log('\n🚀 Seeding onboarding templates...');
  const onboardingData = await seedOnboardingTemplates(context);

  console.log('\nCore seed completed successfully.');
  console.log(`
Summary:
- Department: ${department.name}
- Roles: ${roles.length}
- Permissions: ${permissions.length}
- Admin user: ${config.email}
- Trainer users: ${courseFixtures.trainers.length}
- Student users: ${studentData?.students?.length || 0}
- Categories: ${courseFixtures.categories.length}
- Tags: ${courseFixtures.tags.length}
- Courses: ${courseFixtures.courses.length}
- Cloudinary Courses: ${cloudinaryCourses?.length || 0}
- Roadmaps: ${roadmaps?.length || 0}
- Student Enrollments: ${enrollmentData?.enrollments || 0}
- Question Banks: ${quizData?.questionBanks || 0}
- Questions: ${quizData?.questions || 0}
- Quizzes: ${quizData?.quizzes || 0}
- Roleplay Scenarios: ${roleplayData?.total || 0} (${roleplayData?.created || 0} created, ${roleplayData?.updated || 0} updated)
- Onboarding Templates: ${onboardingData?.total || 0} (${onboardingData?.created || 0} created, ${onboardingData?.updated || 0} updated)

Seed scope:
- System roles and permissions
- Admin department
- First admin user
- Trainer fixtures
- Student fixtures
- Category and tag fixtures
- Sample courses for CRUD/filter testing
- Real courses with Cloudinary videos
- Realistic roadmaps with assignments for all users
- Student enrollments with progress tracking
- Question banks and questions for each course
- Quizzes for each module (1 quiz per module)

Sample credentials:
- Admin: admin@staffup.local / ChangeMe123
- Trainer: trainer1@staffup.local / ${courseFixtures.trainerPassword}
- Trainer: trainer2@staffup.local / ${courseFixtures.trainerPassword}
- Student: student1@staffup.local / ${studentData?.password || 'Student123'}
- Student: student2@staffup.local / ${studentData?.password || 'Student123'}
- Student: student3@staffup.local / ${studentData?.password || 'Student123'}
  `);
}

async function main() {
  const context = createSeedContext();

  try {
    if (isDemoSeedEnabled()) {
      await runDemoSeed(context);
      return;
    }

    await runCoreSeed(context);
  } finally {
    await disposeSeedContext(context);
  }
}

main().catch((error) => {
  console.error('Seed failed:');
  console.error(error);
  process.exitCode = 1;
});
