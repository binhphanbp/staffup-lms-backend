const argon2 = require('argon2');

/**
 * Seed student/employee users for testing
 */
async function seedStudents(context) {
  const { prisma } = context;

  console.log('Seeding student users...');

  // Get employee role
  const employeeRole = await prisma.role.findUnique({
    where: { code: 'employee' },
  });

  if (!employeeRole) {
    console.log('⚠️  Employee role not found. Skipping student seed.');
    return [];
  }

  // Get department
  const department = await prisma.department.findFirst();

  if (!department) {
    console.log('⚠️  No department found. Skipping student seed.');
    return [];
  }

  const DEFAULT_PASSWORD = 'Student123';
  const hashedPassword = await argon2.hash(DEFAULT_PASSWORD);

  const STUDENTS = [
    {
      fullName: 'Nguyễn Văn An',
      email: 'student1@staffup.local',
      positionTitle: 'Junior Developer',
    },
    {
      fullName: 'Trần Thị Bình',
      email: 'student2@staffup.local',
      positionTitle: 'Frontend Developer',
    },
    {
      fullName: 'Lê Minh Cường',
      email: 'student3@staffup.local',
      positionTitle: 'Backend Developer',
    },
  ];

  const students = [];

  for (const studentData of STUDENTS) {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: studentData.email },
    });

    if (existing) {
      console.log(`  ⚠️  Student ${studentData.email} already exists`);
      students.push(existing);
      continue;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName: studentData.fullName,
        email: studentData.email,
        passwordHash: hashedPassword,
        positionTitle: studentData.positionTitle,
        departmentId: department.id,
        isActive: true,
      },
    });

    // Assign employee role
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: employeeRole.id,
      },
    });

    students.push(user);
    console.log(`  ✓ Created student: ${user.email}`);
  }

  console.log(`Student users ready: ${students.length}\n`);

  return {
    students,
    password: DEFAULT_PASSWORD,
  };
}

module.exports = { seedStudents };
