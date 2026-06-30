import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { auth, db } from '../firebase'

function requireDb() {
  if (!db) {
    throw new Error('Firebase არ არის კონფიგურირებული.')
  }
  return db
}

export async function updateUserProfile(userId, role, { name, companyName, phone, bio, experienceCategories, experienceYears }) {
  const firestore = requireDb()
  const payload = {
    name: name?.trim() || '',
    companyName: companyName?.trim() || '',
    phone: phone?.trim() || '',
    profileUpdatedAt: serverTimestamp(),
  }

  if (role === 'developer') {
    payload.bio = bio?.trim() || ''
    payload.experienceCategories = experienceCategories || []
    payload.experienceYears = experienceYears || ''
  }

  await updateDoc(doc(firestore, 'users', userId), payload)

  if (auth?.currentUser?.uid === userId && name?.trim()) {
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() })
    } catch {
      // displayName sync is optional
    }
  }
}

/** @deprecated use updateUserProfile */
export async function updateDeveloperProfile(userId, fields) {
  return updateUserProfile(userId, 'developer', fields)
}
