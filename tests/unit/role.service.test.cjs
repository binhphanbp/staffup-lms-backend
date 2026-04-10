const test = require('node:test');
const assert = require('node:assert/strict');

const { distPath, mockModule, loadFresh, clearModule } = require('./helpers/module-loader.cjs');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://unit:test@localhost:5432/unit?schema=public';
process.env.JWT_SECRET = 'unit-secret';
process.env.JWT_EXPIRES_IN = '7d';

const roleServicePath = distPath('src', 'services', 'role.service.js');
const databasePath = distPath('src', 'config', 'database.js');

test.afterEach(() => {
  clearModule(roleServicePath);
  clearModule(databasePath);
});

test('RoleService.createRole rejects unknown permission codes', async () => {
  mockModule(databasePath, {
    prisma: {
      role: {
        findUnique: async () => null,
      },
      permission: {
        findMany: async () => [{ id: 1n, code: 'course.read' }],
      },
    },
  });

  const { RoleService } = loadFresh(roleServicePath);

  await assert.rejects(
    () =>
      RoleService.createRole({
        code: 'custom_trainer',
        name: 'Custom Trainer',
        description: null,
        permissionCodes: ['course.read', 'course.publish'],
      }),
    (error) => {
      assert.equal(error.message, 'Invalid permission code(s): course.publish');
      assert.equal(error.statusCode, 400);
      return true;
    },
  );
});

test('RoleService.updateRole prevents changing system role code', async () => {
  mockModule(databasePath, {
    prisma: {
      role: {
        findUnique: async () => ({
          id: 1n,
          code: 'admin',
          isSystem: true,
        }),
      },
    },
  });

  const { RoleService } = loadFresh(roleServicePath);

  await assert.rejects(
    () =>
      RoleService.updateRole('1', {
        code: 'super_admin',
      }),
    (error) => {
      assert.equal(error.message, 'Cannot change the code of a system role');
      assert.equal(error.statusCode, 400);
      return true;
    },
  );
});
