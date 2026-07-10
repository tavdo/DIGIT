import { PrismaClient } from '@prisma/client'

let prisma

export function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}

export default getPrisma()
