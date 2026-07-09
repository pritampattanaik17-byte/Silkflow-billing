import { PrismaClient } from '@prisma/client';

// Singleton PrismaClient to avoid multiple connection pools.
// In serverless environments (Vercel), attaching to globalThis prevents
// a new client from being created on every cold-start / hot-reload.

const globalForPrisma = globalThis;

const prisma = globalForPrisma.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

export default prisma;
