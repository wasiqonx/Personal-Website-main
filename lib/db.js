import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Only log queries in development, errors only in production
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
    // Additional production safeguards
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// Only store prisma instance globally in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma