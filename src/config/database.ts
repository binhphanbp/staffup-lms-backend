import * as Prisma from '@prisma/client';
const PrismaClient = (Prisma as { PrismaClient?: new (...args: any[]) => unknown })
  .PrismaClient as any;
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { AppError } from '@/utils';

const globalForPrisma = globalThis as unknown as {
  pgPool?: Pool;
  prisma?: typeof PrismaClient;
};

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.pgPool = pool;
  globalForPrisma.prisma = prisma;
}

export type TransactionClient = any;

interface TransactionOptions {
  timeout?: number;
  maxWait?: number;
  isolationLevel?: unknown;
}

export const withTransaction = async <T>(
  operation: (tx: TransactionClient) => Promise<T>,
  options?: TransactionOptions,
): Promise<T> => {
  if (typeof prisma.$transaction !== 'function') {
    throw new AppError('Prisma client is not initialized. Run `prisma generate` first.', 500);
  }

  return prisma.$transaction((tx: TransactionClient) => operation(tx), options);
};
