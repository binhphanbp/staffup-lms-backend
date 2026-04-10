"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withTransaction = exports.prisma = void 0;
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const pg_1 = require("pg");
const utils_1 = require("../utils");
const globalForPrisma = globalThis;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new utils_1.AppError('DATABASE_URL is required to initialize Prisma.', 500);
}
const pgPool = globalForPrisma.pgPool ?? new pg_1.Pool({ connectionString: databaseUrl });
const adapter = new adapter_pg_1.PrismaPg(pgPool);
exports.prisma = globalForPrisma.prisma ??
    new client_1.PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.pgPool = pgPool;
    globalForPrisma.prisma = exports.prisma;
}
const withTransaction = async (operation, options) => {
    if (typeof exports.prisma.$transaction !== 'function') {
        throw new utils_1.AppError('Prisma client is not initialized. Run `prisma generate` first.', 500);
    }
    return exports.prisma.$transaction((tx) => operation(tx), options);
};
exports.withTransaction = withTransaction;
