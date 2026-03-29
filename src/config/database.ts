import * as Prisma from '@prisma/client';
import { AppError } from '@/utils';

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

const PrismaClient = (Prisma as { PrismaClient?: new (...args: any[]) => unknown }).PrismaClient;

export const prisma =
  globalForPrisma.prisma ??
  (PrismaClient
    ? new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
    : ({} as any));

if (process.env.NODE_ENV !== 'production') {
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
