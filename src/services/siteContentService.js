import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { DEFAULT_SITE_CONTENT, mergeSiteContent } from '../data/defaultSiteContent'

const SITE_DOC_ID = 'main'

function requireDb() {
  if (!db) {
    throw new Error('Firebase არ არის კონფიგურირებული.')
  }
  return db
}

export function subscribeToSiteContent(onContent, onError) {
  const firestore = requireDb()
  const contentRef = doc(firestore, 'siteContent', SITE_DOC_ID)

  return onSnapshot(
    contentRef,
    (snapshot) => {
      onContent(mergeSiteContent(snapshot.exists() ? snapshot.data() : null))
    },
    onError,
  )
}

export async function updateSiteContent(content, adminId) {
  const firestore = requireDb()
  await setDoc(
    doc(firestore, 'siteContent', SITE_DOC_ID),
    {
      ...content,
      updatedAt: serverTimestamp(),
      updatedBy: adminId,
    },
    { merge: true },
  )
}

export function getDefaultSiteContent() {
  return { ...DEFAULT_SITE_CONTENT }
}
