const test = require('node:test');
const assert = require('node:assert/strict');

const { distPath, mockModule, loadFresh, clearModule } = require('./helpers/module-loader.cjs');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://unit:test@localhost:5432/unit?schema=public';
process.env.JWT_SECRET = 'unit-secret';
process.env.JWT_EXPIRES_IN = '7d';

const middlewarePath = distPath('src', 'middlewares', 'auth.middleware.js');
const databasePath = distPath('src', 'config', 'database.js');
const jwtConfigPath = distPath('src', 'config', 'jwt.config.js');

test.afterEach(() => {
  clearModule(middlewarePath);
  clearModule(databasePath);
  clearModule(jwtConfigPath);
});

test('authenticate returns 401 when bearer token is missing', async () => {
  const { authenticate } = loadFresh(middlewarePath);
  const req = { headers: {} };

  let nextError;
  await authenticate(req, {}, (error) => {
    nextError = error;
  });

  assert.equal(nextError.message, 'You are not logged in. Please log in to get access.');
  assert.equal(nextError.statusCode, 401);
});

test('authenticate attaches resolved roleCodes and unique permissionCodes', async () => {
  mockModule(jwtConfigPath, {
    verifyToken: () => ({ userId: '11', email: 'user@example.com', roleCodes: ['ignored'] }),
  });

  mockModule(databasePath, {
    prisma: {
      user: {
        findUnique: async () => ({
          id: 11n,
          email: 'user@example.com',
          isActive: true,
          userRoles: [
            {
              role: {
                code: 'trainer',
                rolePermissions: [
                  { permission: { code: 'course.read' } },
                  { permission: { code: 'course.update' } },
                ],
              },
            },
            {
              role: {
                code: 'admin',
                rolePermissions: [
                  { permission: { code: 'course.update' } },
                  { permission: { code: 'user.manage' } },
                ],
              },
            },
          ],
        }),
      },
    },
  });

  const { authenticate } = loadFresh(middlewarePath);
  const req = { headers: { authorization: 'Bearer token-value' } };

  let nextError;
  let nextCalled = false;
  await authenticate(req, {}, (error) => {
    nextError = error;
    nextCalled = true;
  });

  assert.equal(nextError, undefined);
  assert.equal(nextCalled, true);
  assert.deepEqual(req.user, {
    userId: '11',
    email: 'user@example.com',
    roleCodes: ['trainer', 'admin'],
    permissionCodes: ['course.read', 'course.update', 'user.manage'],
    isActive: true,
  });
});
