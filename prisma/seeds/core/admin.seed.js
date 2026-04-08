const argon2 = require('argon2');

const DEFAULT_SEED_ADMIN = {
  fullName: 'System Administrator',
  positionTitle: 'Administrator',
  email: 'admin@staffup.local',
  password: 'ChangeMe123',
};

function getSeedAdminConfig() {
  return {
    fullName: process.env.SEED_ADMIN_FULL_NAME?.trim() || DEFAULT_SEED_ADMIN.fullName,
    positionTitle: process.env.SEED_ADMIN_POSITION_TITLE?.trim() || DEFAULT_SEED_ADMIN.positionTitle,
    email: process.env.SEED_ADMIN_EMAIL?.trim() || DEFAULT_SEED_ADMIN.email,
    password: process.env.SEED_ADMIN_PASSWORD || DEFAULT_SEED_ADMIN.password,
  };
}

async function seedAdmin({ prisma }, department) {
  console.log('Seeding first admin user...');

  const adminRole = await prisma.role.findUnique({
    where: { code: 'admin' },
  });

  if (!adminRole) {
    throw new Error('Admin role is missing. Seed RBAC data before seeding the admin user.');
  }

  const config = getSeedAdminConfig();
  const passwordHash = await argon2.hash(config.password);

  const existingUser = await prisma.user.findUnique({
    where: { email: config.email },
  });

  const adminUser = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          departmentId: department.id,
          fullName: config.fullName,
          positionTitle: config.positionTitle,
          isActive: true,
        },
      })
    : await prisma.user.create({
        data: {
          departmentId: department.id,
          fullName: config.fullName,
          positionTitle: config.positionTitle,
          email: config.email,
          passwordHash,
          isActive: true,
        },
      });

  await prisma.userRole.createMany({
    data: [
      {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log(`Admin user ready: ${config.email}`);

  return {
    adminUser,
    adminRole,
    config,
  };
}

module.exports = {
  getSeedAdminConfig,
  seedAdmin,
};
