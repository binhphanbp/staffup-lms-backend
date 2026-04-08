require('dotenv/config');

const { seedAdmin } = require('./seeds/core/admin.seed');
const { seedAdminDepartment } = require('./seeds/core/departments.seed');
const { seedRbac } = require('./seeds/core/rbac.seed');
const { runDemoSeed } = require('./seeds/demo/full-demo.seed');
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

  console.log('\nCore seed completed successfully.');
  console.log(`
Summary:
- Department: ${department.name}
- Roles: ${roles.length}
- Permissions: ${permissions.length}
- Admin user: ${config.email}

Seed scope:
- System roles and permissions
- Admin department
- First admin user
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
