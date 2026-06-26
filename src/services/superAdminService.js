import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { DEVELOPER_REQUEST_STATUS } from '../utils/roles'

function requireDb() {
  if (!db) {
    throw new Error('Firebase არ არის კონფიგურირებული.')
  }
  return db
}

export const ASSIGNABLE_ROLES = [
  { value: 'customer', label: 'ბიზნესი' },
  { value: 'manager', label: 'მენეჯერი' },
  { value: 'developer', label: 'შემსრულებელი' },
  { value: 'admin', label: 'ადმინი' },
]

export function subscribeToAllUsers(onUsers, onError) {
  const firestore = requireDb()

  return onSnapshot(
    collection(firestore, 'users'),
    (snapshot) => {
      const users = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .sort((a, b) => (a.email || '').localeCompare(b.email || ''))
      onUsers(users)
    },
    onError,
  )
}

export function subscribeToPendingDeveloperRequests(onRequests, onError) {
  const firestore = requireDb()
  const pendingQuery = query(
    collection(firestore, 'users'),
    where('developerRequestStatus', '==', DEVELOPER_REQUEST_STATUS.PENDING),
  )

  return onSnapshot(
    pendingQuery,
    (snapshot) => {
      const requests = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .sort((a, b) => {
          const aTime = a.developerRequestedAt?.toMillis?.() ?? 0
          const bTime = b.developerRequestedAt?.toMillis?.() ?? 0
          return bTime - aTime
        })
      onRequests(requests)
    },
    onError,
  )
}

export async function setUserRole(userId, role, adminId) {
  const firestore = requireDb()
  const payload = {
    role,
    updatedAt: serverTimestamp(),
    updatedBy: adminId,
  }

  if (role === 'developer') {
    payload.developerRequestStatus = DEVELOPER_REQUEST_STATUS.APPROVED
    payload.developerReviewedAt = serverTimestamp()
    payload.developerReviewedBy = adminId
  } else if (role === 'customer') {
    payload.developerRequestStatus = DEVELOPER_REQUEST_STATUS.NONE
  } else {
    payload.developerRequestStatus = DEVELOPER_REQUEST_STATUS.NONE
  }

  await updateDoc(doc(firestore, 'users', userId), payload)
}

export async function approveDeveloperRequest(userId, adminId) {
  await setUserRole(userId, 'developer', adminId)
}

export async function rejectDeveloperRequest(userId, adminId) {
  const firestore = requireDb()
  await updateDoc(doc(firestore, 'users', userId), {
    role: 'customer',
    developerRequestStatus: DEVELOPER_REQUEST_STATUS.REJECTED,
    developerReviewedAt: serverTimestamp(),
    developerReviewedBy: adminId,
    updatedAt: serverTimestamp(),
    updatedBy: adminId,
  })
}
