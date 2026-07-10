import EmbeddedPostgres from 'embedded-postgres'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_DIR = path.join(__dirname, '..', 'data', 'postgres')
const DB_PORT = 5434
const DB_USER = 'postgres'
const DB_PASSWORD = 'digit123'

let pgInstance = null

export async function startEmbeddedPostgres() {
  if (pgInstance) return pgInstance

  const pg = new EmbeddedPostgres({
    databaseDir: DB_DIR,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    persistent: true
  })

  if (!fs.existsSync(DB_DIR)) {
    await pg.initialise()
    await pg.start()
    await pg.createDatabase('digit')
  } else {
    await pg.start()
  }

  pgInstance = pg
  return pg
}

export async function stopEmbeddedPostgres() {
  if (pgInstance) {
    await pgInstance.stop()
    pgInstance = null
  }
}

export function getEmbeddedDatabaseUrl() {
  return `postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/digit`
}
