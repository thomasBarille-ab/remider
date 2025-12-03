import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Debugging: Check DATABASE_URL format safely
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("CRITICAL ERROR: DATABASE_URL is missing in environment variables.");
} else if (!dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("postgres://")) {
  console.error(
    "CRITICAL ERROR: DATABASE_URL appears malformed. It must start with 'postgresql://' or 'postgres://'. Received start:",
    dbUrl.substring(0, 15) + "..."
  );
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
