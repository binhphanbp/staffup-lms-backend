const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const argon2 = require('argon2');

const { distPath, mockModule, loadFresh, clearModule } = require('./helpers/module-loader.cjs');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://unit:test@localhost:5432/unit?schema=public';
process.env.JWT_SECRET = 'unit-secret';
process.env.JWT_EXPIRES_IN = '7d';
process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS = '30';
process.env.REFRESH_TOKEN_COOKIE_NAME = 'staffup_refresh_token';

const authServicePath = distPath('src', 'services', 'auth.service.js');
const databasePath = distPath('src', 'config', 'database.js');
const jwtConfigPath = distPath('src', 'config', 'jwt.config.js');
const authCookiePath = distPath('src', 'config', 'auth-cookie.config.js');

const fixedRefreshToken = Buffer.alloc(48, 7).toString('hex');
const fixedRefreshExpiry = new Date('2026-12-31T00:00:00.000Z');

test.afterEach(() => {
  clearModule(authServicePath);
  clearModule(databasePath);
  clearModule(jwtConfigPath);
  clearModule(authCookiePath);
});

test('AuthService.login returns auth payload and creates session', async (t) => {
  const originalVerify = argon2.verify;
  const originalRandomBytes = crypto.randomBytes;

  let findUniqueArgs;
  let createdSessionArgs;

  mockModule(databasePath, {
    prisma: {
      user: {
        findUnique: async (args) => {
          findUniqueArgs = args;
          return {
            id: 15n,
            email: 'user@example.com',
            fullName: 'Unit Tester',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            isActive: true,
            passwordHash: 'stored-hash',
            userRoles: [{ role: { code: 'trainer' } }, { role: { code: 'admin' } }],
          };
        },
      },
      authSession: {
        create: async (args) => {
          createdSessionArgs = args;
          return { id: 99n };
        },
      },
    },
  });

  mockModule(jwtConfigPath, {
    signToken: (payload) => `signed:${payload.userId}:${payload.roleCodes.join(',')}`,
  });

  mockModule(authCookiePath, {
    getRefreshTokenExpiryDate: () => fixedRefreshExpiry,
  });

  argon2.verify = async (hash, password) => hash === 'stored-hash' && password === 'Password123';
  crypto.randomBytes = () => Buffer.alloc(48, 7);

  try {
    const { AuthService } = loadFresh(authServicePath);

    const result = await AuthService.login(
      { email: 'USER@EXAMPLE.COM', password: 'Password123' },
      { ipAddress: '127.0.0.1', userAgent: 'node:test' },
    );

    assert.equal(findUniqueArgs.where.email, 'user@example.com');
    assert.equal(result.user.id, '15');
    assert.deepEqual(result.user.roleCodes, ['trainer', 'admin']);
    assert.equal(result.token, 'signed:15:trainer,admin');
    assert.equal(result.refreshToken, fixedRefreshToken);
    assert.equal(result.refreshTokenExpiresAt.toISOString(), fixedRefreshExpiry.toISOString());
    assert.deepEqual(createdSessionArgs.data, {
      userId: 15n,
      tokenHash: crypto.createHash('sha256').update(fixedRefreshToken).digest('hex'),
      userAgent: 'node:test',
      ipAddress: '127.0.0.1',
      expiresAt: fixedRefreshExpiry,
    });
  } finally {
    argon2.verify = originalVerify;
    crypto.randomBytes = originalRandomBytes;
  }
});

test('AuthService.login rejects invalid password', async (t) => {
  const originalVerify = argon2.verify;

  mockModule(databasePath, {
    prisma: {
      user: {
        findUnique: async () => ({
          id: 15n,
          email: 'user@example.com',
          fullName: 'Unit Tester',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          isActive: true,
          passwordHash: 'stored-hash',
          userRoles: [{ role: { code: 'employee' } }],
        }),
      },
      authSession: {
        create: async () => {
          throw new Error('should not create session');
        },
      },
    },
  });

  mockModule(jwtConfigPath, { signToken: () => 'unused' });
  mockModule(authCookiePath, { getRefreshTokenExpiryDate: () => fixedRefreshExpiry });
  argon2.verify = async () => false;

  try {
    const { AuthService } = loadFresh(authServicePath);

    await assert.rejects(
      () => AuthService.login({ email: 'user@example.com', password: 'wrong' }),
      (error) => {
        assert.equal(error.message, 'Invalid email or password.');
        assert.equal(error.statusCode, 401);
        return true;
      },
    );
  } finally {
    argon2.verify = originalVerify;
  }
});

test('AuthService.refresh rotates refresh token and keeps session context', async (t) => {
  const originalRandomBytes = crypto.randomBytes;

  let updatedSessionArgs;

  mockModule(databasePath, {
    prisma: {
      authSession: {
        findUnique: async () => ({
          id: 20n,
          revokedAt: null,
          expiresAt: new Date('2026-06-01T00:00:00.000Z'),
          userAgent: 'old-agent',
          ipAddress: '10.0.0.1',
          user: {
            id: 7n,
            email: 'user@example.com',
            fullName: 'Unit Tester',
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            isActive: true,
            userRoles: [{ role: { code: 'employee' } }],
          },
        }),
        update: async (args) => {
          updatedSessionArgs = args;
          return { id: 20n };
        },
      },
    },
  });

  mockModule(jwtConfigPath, {
    signToken: (payload) => `refreshed:${payload.userId}`,
  });

  mockModule(authCookiePath, {
    getRefreshTokenExpiryDate: () => fixedRefreshExpiry,
  });

  crypto.randomBytes = () => Buffer.alloc(48, 7);

  try {
    const { AuthService } = loadFresh(authServicePath);

    const result = await AuthService.refresh('old-refresh-token', {
      userAgent: 'new-agent',
      ipAddress: '10.0.0.2',
    });

    assert.equal(result.token, 'refreshed:7');
    assert.equal(result.refreshToken, fixedRefreshToken);
    assert.equal(result.user.id, '7');
    assert.equal(updatedSessionArgs.where.id, 20n);
    assert.equal(
      updatedSessionArgs.data.tokenHash,
      crypto.createHash('sha256').update(fixedRefreshToken).digest('hex'),
    );
    assert.equal(updatedSessionArgs.data.userAgent, 'new-agent');
    assert.equal(updatedSessionArgs.data.ipAddress, '10.0.0.2');
    assert.equal(updatedSessionArgs.data.expiresAt.toISOString(), fixedRefreshExpiry.toISOString());
  } finally {
    crypto.randomBytes = originalRandomBytes;
  }
});

test('AuthService.getUserEffectivePermissions deduplicates and sorts permissions', async () => {
  mockModule(databasePath, {
    prisma: {
      user: {
        findUnique: async () => ({
          id: 9n,
          email: 'user@example.com',
          fullName: 'Unit Tester',
          isActive: true,
          userRoles: [
            {
              assignedAt: new Date('2026-01-03T00:00:00.000Z'),
              assignedByUser: null,
              role: {
                id: 2n,
                code: 'trainer',
                name: 'Trainer',
                description: null,
                isSystem: true,
                rolePermissions: [
                  {
                    permission: {
                      id: 4n,
                      code: 'course.update',
                      module: 'course',
                      action: 'update',
                      description: null,
                    },
                  },
                  {
                    permission: {
                      id: 3n,
                      code: 'course.read',
                      module: 'course',
                      action: 'read',
                      description: null,
                    },
                  },
                ],
              },
            },
            {
              assignedAt: new Date('2026-01-02T00:00:00.000Z'),
              assignedByUser: {
                id: 1n,
                email: 'admin@example.com',
                fullName: 'Admin',
              },
              role: {
                id: 1n,
                code: 'admin',
                name: 'Admin',
                description: null,
                isSystem: true,
                rolePermissions: [
                  {
                    permission: {
                      id: 4n,
                      code: 'course.update',
                      module: 'course',
                      action: 'update',
                      description: null,
                    },
                  },
                  {
                    permission: {
                      id: 5n,
                      code: 'user.manage',
                      module: 'user',
                      action: 'manage',
                      description: null,
                    },
                  },
                ],
              },
            },
          ],
        }),
      },
    },
  });

  const { AuthService } = loadFresh(authServicePath);

  const result = await AuthService.getUserEffectivePermissions('9');

  assert.deepEqual(result.roleCodes, ['admin', 'trainer']);
  assert.deepEqual(result.effectivePermissionCodes, [
    'course.read',
    'course.update',
    'user.manage',
  ]);
  assert.equal(result.roles[0].assignedByUser.fullName, 'Admin');
});
