import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  disconnectHandler?: boolean;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful shutdown - only add listener once
if (process.env.NODE_ENV !== 'production') {
  process.setMaxListeners(20);
}

if (!globalForPrisma.disconnectHandler) {
  globalForPrisma.disconnectHandler = true;
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}