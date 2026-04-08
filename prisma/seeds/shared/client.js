const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

function createSeedContext() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to run database seeds.');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  return { prisma, pool };
}

async function disposeSeedContext(context) {
  await context.prisma.$disconnect();
  await context.pool.end();
}

module.exports = {
  createSeedContext,
  disposeSeedContext,
};
