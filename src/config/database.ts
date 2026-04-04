import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma } from '@prisma/client';
import { Pool } from 'pg';
import { AppError } from '@/utils';

const globalForPrisma = globalThis as unknown as {
  pgPool?: Pool;
  prisma?: typeof PrismaClient;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new AppError('DATABASE_URL is required to initialize Prisma.', 500);
}

const pgPool = globalForPrisma.pgPool ?? new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pgPool);

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

export type TransactionClient = Prisma.TransactionClient;

interface TransactionOptions {
  timeout?: number;
  maxWait?: number;
  isolationLevel?: Prisma.TransactionIsolationLevel;
}

export const withTransaction = async <T>(
  operation: (tx: TransactionClient) => Promise<T>,
  options?: TransactionOptions,
): Promise<T> => {
  if (typeof prisma.$transaction !== 'function') {
    throw new AppError('Prisma client is not initialized. Run `prisma generate` first.', 500);
  }

  return prisma.$transaction((tx) => operation(tx as TransactionClient), options);
};
