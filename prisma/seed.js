require('dotenv/config');

const argon2 = require('argon2');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const DEFAULT_DEPARTMENT_NAME = 'General';

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

const rolePermissionCodes = {
  admin: basePermissions.map(([code]) => code),
  manager: ['course.read', 'roadmap.create', 'roadmap.assign', 'user.read'],
  trainer: [
    'course.create',
    'course.read',
    'course.update',
    'course.publish',
    'quiz.create',
    'quiz.grade',
  ],
  employee: ['course.read', 'user.read'],
};

const seedAdminConfig = {
  departmentName: process.env.SEED_ADMIN_DEPARTMENT_NAME || DEFAULT_DEPARTMENT_NAME,
  fullName: process.env.SEED_ADMIN_FULL_NAME || 'System Administrator',
  positionTitle: process.env.SEED_ADMIN_POSITION_TITLE || 'Administrator',
  email: (process.env.SEED_ADMIN_EMAIL || 'admin@staffup.local').toLowerCase(),
  password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123',
};

async function ensureDepartment(name) {
  return prisma.department.upsert({
    where: { name },
    update: {
      isActive: true,
    },
    create: {
      name,
    },
  });
}

async function ensureRoles() {
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

  return prisma.role.findMany();
}

async function ensurePermissions() {
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

  return prisma.permission.findMany();
}

async function ensureRolePermissions(roles, permissions) {
  const roleMap = new Map(roles.map((role) => [role.code, role.id]));
  const permissionMap = new Map(permissions.map((permission) => [permission.code, permission.id]));

  for (const [roleCode, permissionCodes] of Object.entries(rolePermissionCodes)) {
    const roleId = roleMap.get(roleCode);

    if (!roleId) {
      throw new Error(`Role \`${roleCode}\` was not seeded correctly.`);
    }

    for (const permissionCode of permissionCodes) {
      const permissionId = permissionMap.get(permissionCode);

      if (!permissionId) {
        throw new Error(`Permission \`${permissionCode}\` was not seeded correctly.`);
      }

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
}

async function ensureSeedAdmin(departmentId, adminRoleId) {
  const existingUser = await prisma.user.findUnique({
    where: { email: seedAdminConfig.email },
    select: {
      id: true,
    },
  });

  let adminUserId = existingUser?.id;

  if (!existingUser) {
    const passwordHash = await argon2.hash(seedAdminConfig.password);

    const adminUser = await prisma.user.create({
      data: {
        departmentId,
        fullName: seedAdminConfig.fullName,
        positionTitle: seedAdminConfig.positionTitle,
        email: seedAdminConfig.email,
        passwordHash,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    adminUserId = adminUser.id;
  } else {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        departmentId,
        fullName: seedAdminConfig.fullName,
        positionTitle: seedAdminConfig.positionTitle,
        isActive: true,
      },
    });
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUserId,
        roleId: adminRoleId,
      },
    },
    update: {},
    create: {
      userId: adminUserId,
      roleId: adminRoleId,
    },
  });

  return adminUserId;
}

async function main() {
  const department = await ensureDepartment(seedAdminConfig.departmentName);
  const [roles, permissions] = await Promise.all([ensureRoles(), ensurePermissions()]);

  const adminRole = roles.find((role) => role.code === 'admin');

  if (!adminRole) {
    throw new Error('System role `admin` was not seeded correctly.');
  }

  await ensureRolePermissions(roles, permissions);
  await ensureSeedAdmin(department.id, adminRole.id);

  console.log(`Seed completed successfully.
- Roles: ${systemRoles.map((role) => role.code).join(', ')}
- Permissions: ${basePermissions.length}
- Seed admin: ${seedAdminConfig.email}`);
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
