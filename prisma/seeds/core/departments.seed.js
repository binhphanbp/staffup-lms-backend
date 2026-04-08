const DEFAULT_ADMIN_DEPARTMENT_NAME = 'General';

function getAdminDepartmentName() {
  return process.env.SEED_ADMIN_DEPARTMENT_NAME?.trim() || DEFAULT_ADMIN_DEPARTMENT_NAME;
}

async function seedAdminDepartment({ prisma }) {
  const name = getAdminDepartmentName();

  const department = await prisma.department.upsert({
    where: { name },
    update: { isActive: true },
    create: {
      name,
      isActive: true,
    },
  });

  return department;
}

module.exports = {
  getAdminDepartmentName,
  seedAdminDepartment,
};
