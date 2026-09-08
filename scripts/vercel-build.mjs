import { execSync } from 'child_process'

const migrationUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL_NO_SSL ||
  process.env.DATABASE_URL

if (migrationUrl) {
  console.log('[Build] Running database migrations...')
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: migrationUrl },
    stdio: 'inherit'
  })
} else {
  console.warn('[Build] No database URL found, skipping migrations.')
}

execSync('npx prisma generate', { stdio: 'inherit' })
