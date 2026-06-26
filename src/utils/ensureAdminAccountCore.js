import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'

export const ADMIN_EMAIL = 'admin@gmail.com'
export const ADMIN_PASSWORD = 'admin123'
const ADMIN_NAME = 'Admin'

async function writeAdminProfile(firestore, uid) {
  await setDoc(doc(firestore, 'users', uid), {
    uid,
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    role: 'admin',
    developerRequestStatus: 'none',
    createdAt: serverTimestamp(),
  })
}

export async function ensureAdminAccountFor(authClient, firestore) {
  let uid

  try {
    const credential = await createUserWithEmailAndPassword(
      authClient,
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
    )
    uid = credential.user.uid
    await writeAdminProfile(firestore, uid)
  } catch (err) {
    if (err.code !== 'auth/email-already-in-use') throw err

    const credential = await signInWithEmailAndPassword(authClient, ADMIN_EMAIL, ADMIN_PASSWORD)
    uid = credential.user.uid

    const snapshot = await getDoc(doc(firestore, 'users', uid))
    if (!snapshot.exists()) {
      await writeAdminProfile(firestore, uid)
    } else if (snapshot.data().role !== 'admin') {
      await setDoc(
        doc(firestore, 'users', uid),
        {
          role: 'admin',
          developerRequestStatus: 'none',
        },
        { merge: true },
      )
    }
  } finally {
    if (authClient.currentUser) {
      await signOut(authClient)
    }
  }

  return { email: ADMIN_EMAIL, uid }
}
