const test = require('node:test');
const assert = require('node:assert/strict');

const { distPath, loadFresh, clearModule } = require('./helpers/module-loader.cjs');

const middlewarePath = distPath('src', 'middlewares', 'rbac.middleware.js');

test.afterEach(() => {
  clearModule(middlewarePath);
});

test('hasPermission supports any and all match modes', () => {
  const { hasPermission } = loadFresh(middlewarePath);
  const req = {
    user: {
      userId: '1',
      email: 'user@example.com',
      roleCodes: ['trainer'],
      permissionCodes: ['course.read', 'course.update'],
      isActive: true,
    },
  };

  assert.equal(hasPermission(req, ['course.read']), true);
  assert.equal(hasPermission(req, ['course.read', 'user.manage']), true);
  assert.equal(hasPermission(req, ['course.read', 'course.update'], { match: 'all' }), true);
  assert.equal(hasPermission(req, ['course.read', 'user.manage'], { match: 'all' }), false);
});

test('requirePermission returns 401 when user is not authenticated', () => {
  const { requirePermission } = loadFresh(middlewarePath);
  const guard = requirePermission('course.read');

  let nextError;
  guard({}, {}, (error) => {
    nextError = error;
  });

  assert.equal(nextError.message, 'You are not logged in.');
  assert.equal(nextError.statusCode, 401);
});

test('requireRole returns 403 when role does not match', () => {
  const { requireRole } = loadFresh(middlewarePath);
  const guard = requireRole('admin');

  let nextError;
  guard(
    {
      user: {
        userId: '1',
        email: 'user@example.com',
        roleCodes: ['trainer'],
        permissionCodes: ['course.read'],
        isActive: true,
      },
    },
    {},
    (error) => {
      nextError = error;
    },
  );

  assert.equal(nextError.message, 'You do not have permission to perform this action.');
  assert.equal(nextError.statusCode, 403);
});
