import { PrismaClient } from '@prisma/client'

if (process.env.POSTGRES_PRISMA_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL
} else if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED
}

let prisma

export function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}

export default getPrisma()
