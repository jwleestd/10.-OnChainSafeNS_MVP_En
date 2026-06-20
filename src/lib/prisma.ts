// ============================================
// LIB-001: PrismaClient 싱글턴 (Prisma v7 adapter 패턴)
// SRS §3.5 — 공유 유틸리티
// ============================================
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { e2eMemoryPrisma } from './e2e-memory-prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma =
  process.env.E2E_MEMORY_DB === '1'
    ? (e2eMemoryPrisma as unknown as PrismaClient)
    : (globalForPrisma.prisma ?? createPrismaClient());

if (process.env.NODE_ENV !== 'production' && process.env.E2E_MEMORY_DB !== '1') {
  globalForPrisma.prisma = prisma;
}
