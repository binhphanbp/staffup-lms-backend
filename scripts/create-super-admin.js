require('dotenv/config');

const argon2 = require('argon2');
const { createSeedContext, disposeSeedContext } = require('../prisma/seeds/shared/client');
const { basePermissions, rolePermissionCodes, systemRoles } = require('../prisma/seeds/shared/rbac.data');

const DEFAULT_ACCOUNT = {
  email: 'superadmin1@staffup.local',
  password: 'Admin@123456',
  fullName: 'Super Admin',
  positionTitle: 'System Administrator',
  departmentName: 'Administration',
};

async function ensureDepartment(prisma, departmentName) {
  return prisma.department.upsert({
    where: { name: departmentName },
    update: {
      isActive: true,
    },
    create: {
      name: departmentName,
      isActive: true,
    },
  });
}

async function ensureRbac(prisma) {
  const roles = [];

  for (const role of systemRoles) {
    const savedRole = await prisma.role.upsert({
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

    roles.push(savedRole);
  }

  const permissions = [];

  for (const [code, module, action, description] of basePermissions) {
    const savedPermission = await prisma.permission.upsert({
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

    permissions.push(savedPermission);
  }

  const roleIdByCode = new Map(roles.map((role) => [role.code, role.id]));
  const permissionIdByCode = new Map(permissions.map((permission) => [permission.code, permission.id]));
  const rolePermissionsToCreate = [];

  for (const [roleCode, permissionCodes] of Object.entries(rolePermissionCodes)) {
    const roleId = roleIdByCode.get(roleCode);
    if (!roleId) {
      continue;
    }

    for (const permissionCode of permissionCodes) {
      const permissionId = permissionIdByCode.get(permissionCode);
      if (!permissionId) {
        continue;
      }

      rolePermissionsToCreate.push({
        roleId,
        permissionId,
      });
    }
  }

  if (rolePermissionsToCreate.length > 0) {
    await prisma.rolePermission.createMany({
      data: rolePermissionsToCreate,
      skipDuplicates: true,
    });
  }

  const adminRole = roles.find((role) => role.code === 'admin');

  if (!adminRole) {
    throw new Error('Could not bootstrap admin role.');
  }

  return adminRole;
}

async function main() {
  const context = createSeedContext();
  const { prisma } = context;
  const email = process.argv[2]?.trim() || DEFAULT_ACCOUNT.email;
  const password = process.argv[3] || DEFAULT_ACCOUNT.password;
  const fullName = process.argv[4]?.trim() || DEFAULT_ACCOUNT.fullName;

  try {
    const department = await ensureDepartment(prisma, DEFAULT_ACCOUNT.departmentName);
    const adminRole = await ensureRbac(prisma);
    const passwordHash = await argon2.hash(password);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            departmentId: department.id,
            fullName,
            positionTitle: DEFAULT_ACCOUNT.positionTitle,
            passwordHash,
            isActive: true,
          },
        })
      : await prisma.user.create({
          data: {
            departmentId: department.id,
            fullName,
            positionTitle: DEFAULT_ACCOUNT.positionTitle,
            email,
            passwordHash,
            isActive: true,
          },
        });

    const allRoles = await prisma.role.findMany({
      select: {
        id: true,
        code: true,
      },
    });

    await prisma.userRole.createMany({
      data: allRoles.map((role) => ({
        userId: user.id,
        roleId: role.id,
      })),
      skipDuplicates: true,
    });

    console.log(`Super admin ready`);
    console.log(`email=${email}`);
    console.log(`password=${password}`);
    console.log(`roles=${allRoles.map((role) => role.code).join(',')}`);
  } finally {
    await disposeSeedContext(context);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
