import bcrypt from 'bcryptjs'
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import prisma from '../db.js'

const serverRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

let prepared = false
let preparePromise = null

function shouldRunMigrations() {
  return Boolean(process.env.VERCEL || process.env.NODE_ENV === 'production')
}

async function runMigrations() {
  if (!shouldRunMigrations()) return

  const migrationUrl =
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL_NO_SSL ||
    process.env.DATABASE_URL

  if (!migrationUrl) return

  console.log('[PostgreSQL] Running migrations...')
  execSync('npx prisma migrate deploy --schema=prisma/schema.prisma', {
    cwd: serverRoot,
    env: { ...process.env, DATABASE_URL: migrationUrl },
    stdio: 'inherit'
  })
}

const LEGACY_HERO_TITLE_KA = 'შენ არ ეძებ სპეციალისტს.'

const HERO_COPY = {
  heroEyebrow_ka: 'DIGIT · dispatch desk',
  heroEyebrow_en: 'DIGIT · dispatch desk',
  heroTitle_ka: 'აღწერე პრობლემა.',
  heroTitle_en: 'Describe the problem.',
  heroTitleAccent_ka: 'მენეჯერი გზაშია.',
  heroTitleAccent_en: 'Your manager is on it.',
  heroSubtitle_ka:
    'IT სერვისი ისევე მარტივად, როგორც ტაქსის გამოძახება — ფასი, შემსრულებელი და სტატუსი ერთ ეკრანზე.',
  heroSubtitle_en:
    'IT support as easy as calling a taxi — price, specialist, and status on one screen.'
}

async function migrateHeroCopy() {
  const doc = await prisma.siteContent.findUnique({ where: { docId: 'default' } })
  if (!doc) return

  const content = doc.content
  if (!content || typeof content !== 'object' || Array.isArray(content)) return
  if (content.heroTitle_ka !== LEGACY_HERO_TITLE_KA) return

  await prisma.siteContent.update({
    where: { docId: 'default' },
    data: {
      content: {
        ...content,
        ...HERO_COPY
      }
    }
  })
  console.log('[Seed] Updated legacy hero copy to new slogan.')
}

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
    try {
      await runMigrations()
    } catch (err) {
      console.warn('[PostgreSQL] Migration warning:', err?.message || err)
    }
    await prisma.$connect()
    await seedAdmin()
    await migrateHeroCopy()
    prepared = true
    console.log('[PostgreSQL] Connected successfully.')
  })()

  return preparePromise
}
