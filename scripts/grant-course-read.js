require('dotenv/config');

const { createSeedContext, disposeSeedContext } = require('../prisma/seeds/shared/client');

async function main() {
  const context = createSeedContext();
  const { prisma } = context;
  const permissionCode = 'course.read';
  const requestedRoleCodes = process.argv.slice(2).map((value) => value.trim()).filter(Boolean);
  const roleCodes = requestedRoleCodes.length > 0 ? requestedRoleCodes : ['employee', 'student'];

  try {
    const permission = await prisma.permission.findUnique({
      where: { code: permissionCode },
    });

    if (!permission) {
      throw new Error(`Permission "${permissionCode}" was not found. Seed RBAC data first.`);
    }

    const roles = await prisma.role.findMany({
      where: {
        code: { in: roleCodes },
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    if (roles.length === 0) {
      throw new Error(`No roles found for codes: ${roleCodes.join(', ')}`);
    }

    await prisma.rolePermission.createMany({
      data: roles.map((role) => ({
        roleId: role.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });

    console.log(`Granted "${permissionCode}" to roles: ${roles.map((role) => role.code).join(', ')}`);
  } finally {
    await disposeSeedContext(context);
  }
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  });
