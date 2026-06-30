import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { ORDER_STATUS } from './orderService'

function requireDb() {
  if (!db) {
    throw new Error('Firebase არ არის კონფიგურებული.')
  }
  return db
}

export async function saveDeveloperReview(developerId, orderId, { rating, review, customerName, serviceType }) {
  const firestore = requireDb()
  await setDoc(doc(firestore, 'users', developerId, 'reviews', orderId), {
    orderId,
    rating,
    review: review?.trim() || '',
    customerName: customerName?.trim() || 'კლიენტი',
    serviceType: serviceType || '',
    createdAt: serverTimestamp(),
  })
}

export function subscribeToDeveloperReviews(developerId, onReviews, onError) {
  const firestore = requireDb()
  const reviewsQuery = query(
    collection(firestore, 'users', developerId, 'reviews'),
    orderBy('createdAt', 'desc'),
  )

  return onSnapshot(
    reviewsQuery,
    (snapshot) => {
      const reviews = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      onReviews(reviews)
    },
    onError,
  )
}

export function subscribeToDeveloperReviewsFromOrders(developerId, onReviews, onError) {
  const firestore = requireDb()
  const ordersQuery = query(
    collection(firestore, 'orders'),
    where('assignedDeveloperId', '==', developerId),
    orderBy('updatedAt', 'desc'),
  )

  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      const reviews = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
        .filter((order) => order.status === ORDER_STATUS.COMPLETED && order.customerRating != null)
        .map((order) => ({
          id: order.id,
          orderId: order.id,
          rating: order.customerRating,
          review: order.customerReview || '',
          customerName: order.customerName || 'კლიენტი',
          serviceType: order.serviceType || '',
          createdAt: order.updatedAt,
        }))
      onReviews(reviews)
    },
    onError,
  )
}

export async function fetchDeveloperProfile(developerId) {
  const firestore = requireDb()
  const snapshot = await getDoc(doc(firestore, 'users', developerId))
  if (!snapshot.exists() || snapshot.data().role !== 'developer') {
    return null
  }
  return { id: snapshot.id, ...snapshot.data() }
}

export function formatReviewDate(timestamp) {
  if (!timestamp) return '—'
  const date =
    typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('ka-GE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function renderStarRating(rating) {
  const value = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)))
  return '★'.repeat(value) + '☆'.repeat(5 - value)
}
