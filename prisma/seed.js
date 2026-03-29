require('dotenv/config');

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const systemRoles = [
  {
    code: 'admin',
    name: 'Administrator',
    description: 'Full system access',
  },
  {
    code: 'manager',
    name: 'Manager',
    description: 'Department and assignment management',
  },
  {
    code: 'trainer',
    name: 'Trainer',
    description: 'Course and quiz authoring',
  },
  {
    code: 'employee',
    name: 'Employee',
    description: 'Learner access',
  },
];

const basePermissions = [
  ['course.create', 'course', 'create', 'Create courses'],
  ['course.read', 'course', 'read', 'Read course data'],
  ['course.update', 'course', 'update', 'Update course data'],
  ['course.publish', 'course', 'publish', 'Publish courses'],
  ['course.delete', 'course', 'delete', 'Delete courses'],
  ['roadmap.create', 'roadmap', 'create', 'Create roadmaps'],
  ['roadmap.assign', 'roadmap', 'assign', 'Assign roadmaps'],
  ['quiz.create', 'quiz', 'create', 'Create quizzes'],
  ['quiz.grade', 'quiz', 'grade', 'Grade quiz attempts'],
  ['user.read', 'user', 'read', 'Read user profiles'],
  ['user.assign_role', 'user', 'assign_role', 'Assign user roles'],
];

async function main() {
  await prisma.department.upsert({
    where: { name: 'General' },
    update: {},
    create: {
      name: 'General',
    },
  });

  for (const role of systemRoles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {
        name: role.name,
        description: role.description,
        isSystem: true,
      },
      create: {
        ...role,
        isSystem: true,
      },
    });
  }

  for (const [code, module, action, description] of basePermissions) {
    await prisma.permission.upsert({
      where: { code },
      update: {
        module,
        action,
        description,
      },
      create: {
        code,
        module,
        action,
        description,
      },
    });
  }

  const [adminRole, managerRole, trainerRole, employeeRole, permissions] = await Promise.all([
    prisma.role.findUnique({ where: { code: 'admin' } }),
    prisma.role.findUnique({ where: { code: 'manager' } }),
    prisma.role.findUnique({ where: { code: 'trainer' } }),
    prisma.role.findUnique({ where: { code: 'employee' } }),
    prisma.permission.findMany(),
  ]);

  if (!adminRole || !managerRole || !trainerRole || !employeeRole) {
    throw new Error('System roles were not seeded correctly.');
  }

  const permissionMap = new Map(permissions.map((permission) => [permission.code, permission.id]));

  const rolePermissionMap = [
    [adminRole.id, permissions.map((permission) => permission.id)],
    [
      managerRole.id,
      ['course.read', 'roadmap.create', 'roadmap.assign', 'user.read']
        .map((code) => permissionMap.get(code))
        .filter(Boolean),
    ],
    [
      trainerRole.id,
      [
        'course.create',
        'course.read',
        'course.update',
        'course.publish',
        'quiz.create',
        'quiz.grade',
      ]
        .map((code) => permissionMap.get(code))
        .filter(Boolean),
    ],
    [
      employeeRole.id,
      ['course.read', 'user.read'].map((code) => permissionMap.get(code)).filter(Boolean),
    ],
  ];

  for (const [roleId, permissionIds] of rolePermissionMap) {
    for (const permissionId of permissionIds) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId,
          permissionId,
        },
      });
    }
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Seed failed.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
