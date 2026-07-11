import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

async function ensureDatabase() {
  const isEmbeddedUrl = (url) => url && (url.includes('localhost:5434') || url.includes('127.0.0.1:5434'))

  if (process.env.DATABASE_URL && !isEmbeddedUrl(process.env.DATABASE_URL)) {
    console.log('[Bootstrap] Using DATABASE_URL from environment.')
    return
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('DATABASE_URL is required in production. Add a PostgreSQL database on Render.')
  }

  const { startEmbeddedPostgres, getEmbeddedDatabaseUrl } = await import('./lib/embeddedPostgres.js')
  await startEmbeddedPostgres()
  process.env.DATABASE_URL = getEmbeddedDatabaseUrl()

  const envPath = path.join(__dirname, '.env')
  if (!fs.existsSync(envPath)) {
    const envLines = [
      `DATABASE_URL=${process.env.DATABASE_URL}`,
      `JWT_SECRET=${process.env.JWT_SECRET || 'digit_secret_pass_123'}`,
      `PORT=${process.env.PORT || 5000}`
    ]
    if (process.env.MONGO_URI) envLines.push(`MONGO_URI=${process.env.MONGO_URI}`)
    fs.writeFileSync(envPath, envLines.join('\n') + '\n')
    console.log('[Bootstrap] Wrote server/.env')
  }

  console.log('[Bootstrap] Embedded PostgreSQL ready on port 5434')
}

async function runMigrations() {
  console.log('[Bootstrap] Running database migrations...')
  execSync('npx prisma migrate deploy', {
    cwd: __dirname,
    env: { ...process.env },
    stdio: 'inherit'
  })
}

async function maybeImportMongo() {
  const { default: prisma } = await import('./db.js')
  const userCount = await prisma.user.count()
  if (userCount > 0) {
    console.log('[Bootstrap] Database already has data, skipping MongoDB import.')
    return
  }

  console.log('[Bootstrap] Importing data from MongoDB...')
  try {
    const { importFromMongo } = await import('./scripts/migrate-from-mongo.js')
    await importFromMongo()
  } catch (err) {
    console.warn('[Bootstrap] MongoDB import skipped:', err.message)
    console.warn('[Bootstrap] Starting with a fresh PostgreSQL database.')
  }
}

async function main() {
  await ensureDatabase()
  await runMigrations()
  await maybeImportMongo()

  const { startServer } = await import('./server.js')
  await startServer()
}

main().catch(err => {
  console.error('[Bootstrap] Failed:', err?.message || err)
  process.exit(1)
})
