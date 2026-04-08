const { basePermissions, rolePermissionCodes, systemRoles } = require('../shared/rbac.data');

async function seedRbac({ prisma }) {
  console.log('Seeding system roles and permissions...');

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
      throw new Error(`Cannot seed role permissions: missing role "${roleCode}".`);
    }

    for (const permissionCode of permissionCodes) {
      const permissionId = permissionIdByCode.get(permissionCode);

      if (!permissionId) {
        throw new Error(`Cannot seed role permissions: missing permission "${permissionCode}".`);
      }

      rolePermissionsToCreate.push({ roleId, permissionId });
    }
  }

  if (rolePermissionsToCreate.length > 0) {
    await prisma.rolePermission.createMany({
      data: rolePermissionsToCreate,
      skipDuplicates: true,
    });
  }

  console.log(`Seeded ${roles.length} roles, ${permissions.length} permissions.`);

  return {
    roles,
    permissions,
  };
}

module.exports = {
  seedRbac,
};
