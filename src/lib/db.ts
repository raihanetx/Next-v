import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Fallback DATABASE_URL for zero-configuration deployment
const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_xTdKREGCMq56@ep-fragrant-block-a1zra3ey-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db