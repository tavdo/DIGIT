import EmbeddedPostgres from 'embedded-postgres'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import net from 'net'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_DIR = path.join(__dirname, '..', 'data', 'postgres')
const DB_PORT = 5434
const DB_USER = 'postgres'
const DB_PASSWORD = 'digit123'

let pgInstance = null

function isPortOpen(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    socket.setTimeout(1000)
    socket.once('connect', () => {
      socket.destroy()
      resolve(true)
    })
    socket.once('timeout', () => {
      socket.destroy()
      resolve(false)
    })
    socket.once('error', () => resolve(false))
    socket.connect(port, '127.0.0.1')
  })
}

function removeStalePostmasterLock() {
  const lockFile = path.join(DB_DIR, 'postmaster.pid')
  if (!fs.existsSync(lockFile)) return

  try {
    const pid = Number.parseInt(fs.readFileSync(lockFile, 'utf8').split('\n')[0], 10)
    if (!pid || Number.isNaN(pid)) {
      fs.unlinkSync(lockFile)
      return
    }
    try {
      process.kill(pid, 0)
    } catch {
      fs.unlinkSync(lockFile)
    }
  } catch {
    try {
      fs.unlinkSync(lockFile)
    } catch {
      // ignore
    }
  }
}

export async function startEmbeddedPostgres() {
  if (pgInstance) return pgInstance

  if (await isPortOpen(DB_PORT)) {
    console.log('[PostgreSQL] Embedded database already running on port', DB_PORT)
    pgInstance = { alreadyRunning: true }
    return pgInstance
  }

  const pg = new EmbeddedPostgres({
    databaseDir: DB_DIR,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    persistent: true,
    initdbFlags: ['--encoding=UTF8', '--locale=C']
  })

  if (!fs.existsSync(DB_DIR)) {
    await pg.initialise()
    await pg.start()
    await pg.createDatabase('digit')
  } else {
    removeStalePostmasterLock()
    await pg.start()
  }

  pgInstance = pg
  return pg
}

export async function stopEmbeddedPostgres() {
  if (pgInstance && !pgInstance.alreadyRunning) {
    await pgInstance.stop()
  }
  pgInstance = null
}

export function getEmbeddedDatabaseUrl() {
  return `postgresql://${DB_USER}:${DB_PASSWORD}@localhost:${DB_PORT}/digit`
}
