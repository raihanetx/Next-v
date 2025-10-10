import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Set DATABASE_URL for production if not provided
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_xTdKREGCMq56@ep-fragrant-block-a1zra3ey-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : false,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db