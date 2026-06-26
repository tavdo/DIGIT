import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { connectStorageEmulator, getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const PLACEHOLDER_PATTERNS = ['your_', 'placeholder']

function isMissingOrPlaceholder(value) {
  if (!value || typeof value !== 'string') return true
  const lower = value.toLowerCase()
  return PLACEHOLDER_PATTERNS.some((p) => lower.includes(p))
}

const missingKeys = Object.entries({
  VITE_FIREBASE_API_KEY: firebaseConfig.apiKey,
  VITE_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  VITE_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  VITE_FIREBASE_STORAGE_BUCKET: firebaseConfig.storageBucket,
  VITE_FIREBASE_MESSAGING_SENDER_ID: firebaseConfig.messagingSenderId,
  VITE_FIREBASE_APP_ID: firebaseConfig.appId,
})
  .filter(([, value]) => isMissingOrPlaceholder(value))
  .map(([key]) => key)

export const isFirebaseConfigured = missingKeys.length === 0
export const useFirebaseEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true'

let app = null
let auth = null
let db = null
let storage = null
let analytics = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)

  if (useFirebaseEmulator && import.meta.env.DEV) {
    const emulatorKey = '__HOMEWORK_FIREBASE_EMULATORS__'

    if (!globalThis[emulatorKey]) {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
      connectFirestoreEmulator(db, '127.0.0.1', 8080)
      connectStorageEmulator(storage, '127.0.0.1', 9199)
      globalThis[emulatorKey] = true

      if (import.meta.env.DEV) {
        console.info('[Firebase] Emulator mode: Auth :9099, Firestore :8080, Storage :9199, UI http://127.0.0.1:4000')
      }
    }
  } else if (firebaseConfig.measurementId && typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app)
      }
    })
  }
} else if (import.meta.env.DEV) {
  console.warn(
    `[Firebase] კონფიგურაცია არ არის დაყენებული: ${missingKeys.join(', ')}. ` +
      'შეავსე .env ფაილი და გადატვირთე dev server.',
  )
}

export { app, auth, db, storage, analytics }
