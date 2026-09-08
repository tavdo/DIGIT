import bcrypt from 'bcryptjs'
import prisma from '../db.js'

let prepared = false
let preparePromise = null

async function seedAdmin() {
  const adminEmail = 'admin@gmail.com'
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'admin123'
  const adminExists = await prisma.user.findUnique({ where: { email: adminEmail } })

  if (!adminExists) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 10),
        name: 'Admin',
        role: 'admin',
        developerRequestStatus: 'none'
      }
    })
    console.log(`[Seed] Seeded default administrator account: ${adminEmail}`)
    return
  }

  const passwordValid = await bcrypt.compare(adminPassword, adminExists.password)
  if (adminExists.role !== 'admin' || !passwordValid) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: 'admin',
        password: await bcrypt.hash(adminPassword, 10)
      }
    })
    console.log(`[Seed] Repaired administrator account: ${adminEmail}`)
  }
}

export async function prepareServer() {
  if (prepared) return
  if (preparePromise) return preparePromise

  preparePromise = (async () => {
    await prisma.$connect()
    await seedAdmin()
    prepared = true
    console.log('[PostgreSQL] Connected successfully.')
  })()

  return preparePromise
}
