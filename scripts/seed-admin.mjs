import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { ADMIN_EMAIL, ADMIN_PASSWORD, ensureAdminAccountFor } from '../src/utils/ensureAdminAccountCore.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnvFile() {
  try {
    const envPath = resolve(__dirname, '../.env')
    const content = readFileSync(envPath, 'utf8')

    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const eq = trimmed.indexOf('=')
      if (eq === -1) continue

      const key = trimmed.slice(0, eq).trim()
      const value = trimmed.slice(eq + 1).trim()
      if (!process.env[key]) {
        process.env[key] = value
      }
    }
  } catch {
    // .env is optional when vars are already exported
  }
}

loadEnvFile()

const useEmulator = process.env.VITE_USE_FIREBASE_EMULATOR === 'true'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyForLocalEmulatorOnly123456',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-homework.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'demo-homework',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-homework.appspot.com',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abc123def456',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

if (useEmulator) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}

ensureAdminAccountFor(auth, db)
  .then(() => {
    console.log(`Admin account ready: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
    console.log('Role: admin')
    if (!useEmulator) {
      console.log('Login at /admin')
    }
  })
  .catch((err) => {
    console.error(`Admin seed failed: ${err.message}`)
    process.exit(1)
  })
