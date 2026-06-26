import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { uploadOrderAttachments } from './attachmentService'

export const ORDER_STATUS = {
  NEW: 'new',
  QUOTE_OFFERED: 'quote_offered',
  QUOTE_CONFIRMED: 'quote_confirmed',
  QUOTE_REJECTED: 'quote_rejected',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

export const ORDER_STATUS_LABELS = {
  new: 'ახალი',
  quote_offered: 'ფასი შეთავაზებული',
  quote_confirmed: 'ფასი დადასტურებული',
  quote_rejected: 'ფასი უარყოფილი',
  assigned: 'მინიჭებული',
  in_progress: 'მიმდინარე',
  completed: 'დასრულებული',
  cancelled: 'გაუქმებული',
}

export const ORDER_PRIORITY = {
  URGENT: 'urgent',
  TOMORROW: 'tomorrow',
  FLEXIBLE: 'flexible',
}

export const ORDER_PRIORITY_LABELS = {
  urgent: 'სასწრაფო',
  tomorrow: 'ხვალ',
  flexible: 'შეიძლება დაელოდოს',
}

const PRIORITY_SORT_WEIGHT = {
  [ORDER_PRIORITY.URGENT]: 0,
  [ORDER_PRIORITY.TOMORROW]: 1,
  [ORDER_PRIORITY.FLEXIBLE]: 2,
}

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
}

export const PAYMENT_STATUS_LABELS = {
  unpaid: 'გადაუხდელი',
  paid: 'გადახდილია',
}

export const PAYOUT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
}

export const PAYOUT_STATUS_LABELS = {
  pending: 'მოლოდინში',
  paid: 'გადარიცხულია',
}

function requireDb() {
  if (!db) {
    throw new Error('Firebase არ არის კონფიგურირებული.')
  }
  return db
}

export async function createTicket({
  customerId,
  customerName,
  serviceId,
  serviceType,
  description,
  priority,
  attachmentFiles = [],
}) {
  const firestore = requireDb()
  const ref = await addDoc(collection(firestore, 'orders'), {
    customerId,
    customerName,
    serviceId: serviceId || null,
    serviceType,
    description,
    priority,
    status: ORDER_STATUS.NEW,
    assignedDeveloperId: null,
    assignedDeveloperName: null,
    managerNotes: [],
    attachments: [],
    price: null,
    paymentStatus: PAYMENT_STATUS.UNPAID,
    developerPayout: null,
    payoutStatus: PAYOUT_STATUS.PENDING,
    customerRating: null,
    customerReview: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  if (attachmentFiles.length > 0) {
    try {
      await uploadOrderAttachments(ref.id, customerId, attachmentFiles)
    } catch (err) {
      await deleteDoc(ref)
      throw err
    }
  }

  return ref.id
}

export function subscribeToOrders(statusFilter, onOrders, onError) {
  const firestore = requireDb()
  const ordersQuery =
    statusFilter === 'all'
      ? query(collection(firestore, 'orders'), orderBy('updatedAt', 'desc'))
      : query(
          collection(firestore, 'orders'),
          where('status', '==', statusFilter),
          orderBy('updatedAt', 'desc'),
        )

  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      const orders = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      onOrders(sortOrdersByPriority(orders))
    },
    onError,
  )
}

export function subscribeToCustomerOrders(customerId, onOrders, onError) {
  const firestore = requireDb()
  const ordersQuery = query(
    collection(firestore, 'orders'),
    where('customerId', '==', customerId),
    orderBy('updatedAt', 'desc'),
  )

  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      const orders = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      onOrders(orders)
    },
    onError,
  )
}

export function subscribeToOrder(orderId, onOrder, onError) {
  const firestore = requireDb()
  return onSnapshot(
    doc(firestore, 'orders', orderId),
    (snapshot) => {
      onOrder(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null)
    },
    onError,
  )
}

export function subscribeToDevelopers(onDevelopers, onError) {
  const firestore = requireDb()
  const developersQuery = query(
    collection(firestore, 'users'),
    where('role', '==', 'developer'),
  )

  return onSnapshot(
    developersQuery,
    (snapshot) => {
      const developers = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ka'))
      onDevelopers(developers)
    },
    onError,
  )
}

export function subscribeToDeveloperOrders(developerId, onOrders, onError) {
  const firestore = requireDb()
  const ordersQuery = query(
    collection(firestore, 'orders'),
    where('assignedDeveloperId', '==', developerId),
    orderBy('updatedAt', 'desc'),
  )

  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      const orders = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }))
      onOrders(orders)
    },
    onError,
  )
}

export const ACTIVE_ORDER_STATUSES = [
  ORDER_STATUS.ASSIGNED,
  ORDER_STATUS.IN_PROGRESS,
]
export const ARCHIVED_ORDER_STATUSES = [
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.QUOTE_REJECTED,
]

const STATUS_SORT_WEIGHT = {
  [ORDER_STATUS.IN_PROGRESS]: 0,
  [ORDER_STATUS.ASSIGNED]: 1,
  [ORDER_STATUS.QUOTE_CONFIRMED]: 2,
  [ORDER_STATUS.QUOTE_OFFERED]: 3,
  [ORDER_STATUS.NEW]: 4,
  [ORDER_STATUS.COMPLETED]: 5,
  [ORDER_STATUS.CANCELLED]: 6,
  [ORDER_STATUS.QUOTE_REJECTED]: 7,
}

export function sortOrdersByPriority(orders) {
  return [...orders].sort((a, b) => {
    const priorityDiff =
      (PRIORITY_SORT_WEIGHT[a.priority] ?? 99) -
      (PRIORITY_SORT_WEIGHT[b.priority] ?? 99)
    if (priorityDiff !== 0) return priorityDiff
    return (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0)
  })
}

export function partitionDeveloperOrders(orders) {
  const active = orders
    .filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status))
    .sort((a, b) => {
      const weightDiff =
        (STATUS_SORT_WEIGHT[a.status] ?? 99) - (STATUS_SORT_WEIGHT[b.status] ?? 99)
      if (weightDiff !== 0) return weightDiff
      return (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0)
    })

  const archived = orders
    .filter((order) => ARCHIVED_ORDER_STATUSES.includes(order.status))
    .sort(
      (a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0),
    )

  return { active, archived }
}

export function getDeveloperOrderStats(orders) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const activeCount = orders.filter((order) =>
    ACTIVE_ORDER_STATUSES.includes(order.status),
  ).length

  const completedThisMonth = orders.filter((order) => {
    if (order.status !== ORDER_STATUS.COMPLETED) return false
    const updated =
      typeof order.updatedAt?.toDate === 'function'
        ? order.updatedAt.toDate()
        : order.updatedAt
          ? new Date(order.updatedAt)
          : null
    return updated && updated >= monthStart
  }).length

  return { activeCount, completedThisMonth }
}

function getOrderUpdatedDate(order) {
  const updated =
    typeof order.updatedAt?.toDate === 'function'
      ? order.updatedAt.toDate()
      : order.updatedAt
        ? new Date(order.updatedAt)
        : null
  return updated && !Number.isNaN(updated.getTime()) ? updated : null
}

function getPayoutAmount(order) {
  return typeof order.developerPayout === 'number' && order.developerPayout > 0
    ? order.developerPayout
    : 0
}

export function getDeveloperPayoutStats(orders) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  let pendingTotal = 0
  let paidTotal = 0
  let paidThisMonth = 0

  for (const order of orders) {
    const amount = getPayoutAmount(order)
    if (amount <= 0) continue

    const payoutStatus = order.payoutStatus ?? PAYOUT_STATUS.PENDING

    if (payoutStatus === PAYOUT_STATUS.PENDING) {
      pendingTotal += amount
    } else if (payoutStatus === PAYOUT_STATUS.PAID) {
      paidTotal += amount
      const updated = getOrderUpdatedDate(order)
      if (updated && updated >= monthStart) {
        paidThisMonth += amount
      }
    }
  }

  return { pendingTotal, paidTotal, paidThisMonth }
}

export function formatOrderAmount(amount) {
  if (amount == null || amount === '') return '—'
  const value = Number(amount)
  if (Number.isNaN(value)) return '—'
  return `${value.toLocaleString('ka-GE', { maximumFractionDigits: 2 })} ₾`
}

export function formatDeveloperRating(developer) {
  const avg = developer?.ratingAvg
  const count = developer?.ratingCount ?? 0
  if (!count || avg == null) return 'ახალი'
  return `${avg.toFixed(1)} ★ (${count})`
}

export function parseOrderAmountInput(raw) {
  if (raw == null || String(raw).trim() === '') return null
  const value = Number(String(raw).replace(',', '.').trim())
  if (Number.isNaN(value) || value < 0) {
    throw new Error('შეიყვანეთ სწორი თანხა (0 ან მეტი).')
  }
  return value
}

export function resolvePaymentStatus(order) {
  return order.paymentStatus === PAYMENT_STATUS.PAID
    ? PAYMENT_STATUS.PAID
    : PAYMENT_STATUS.UNPAID
}

export function resolvePayoutStatus(order) {
  return order.payoutStatus === PAYOUT_STATUS.PAID
    ? PAYOUT_STATUS.PAID
    : PAYOUT_STATUS.PENDING
}

export function filterOrdersByCompensation(orders, compensationFilter) {
  if (compensationFilter === 'all') return orders

  return orders.filter((order) => {
    const paymentStatus = resolvePaymentStatus(order)
    const payoutStatus = resolvePayoutStatus(order)

    switch (compensationFilter) {
      case 'payment_unpaid':
        return paymentStatus === PAYMENT_STATUS.UNPAID
      case 'payment_paid':
        return paymentStatus === PAYMENT_STATUS.PAID
      case 'payout_pending':
        return payoutStatus === PAYOUT_STATUS.PENDING && getPayoutAmount(order) > 0
      case 'payout_paid':
        return payoutStatus === PAYOUT_STATUS.PAID && getPayoutAmount(order) > 0
      default:
        return true
    }
  })
}

export async function offerOrderPrice(orderId, price) {
  if (price == null || price <= 0) {
    throw new Error('შეიყვანეთ სწორი ფასი.')
  }

  const firestore = requireDb()
  await updateDoc(doc(firestore, 'orders', orderId), {
    price,
    status: ORDER_STATUS.QUOTE_OFFERED,
    updatedAt: serverTimestamp(),
  })
}

export async function confirmOrderPrice(orderId) {
  const firestore = requireDb()
  await updateDoc(doc(firestore, 'orders', orderId), {
    status: ORDER_STATUS.QUOTE_CONFIRMED,
    updatedAt: serverTimestamp(),
  })
}

export async function rejectOrderPrice(orderId) {
  const firestore = requireDb()
  await updateDoc(doc(firestore, 'orders', orderId), {
    status: ORDER_STATUS.QUOTE_REJECTED,
    updatedAt: serverTimestamp(),
  })
}

export async function submitOrderRating(orderId, developerId, { rating, review }) {
  const value = Number(rating)
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error('რეიტინგი უნდა იყოს 1-დან 5-მდე.')
  }

  const firestore = requireDb()
  const orderRef = doc(firestore, 'orders', orderId)
  const orderSnap = await getDoc(orderRef)

  if (!orderSnap.exists()) {
    throw new Error('შეკვეთა ვერ მოიძებნა.')
  }

  const order = orderSnap.data()
  if (order.status !== ORDER_STATUS.COMPLETED) {
    throw new Error('რეიტინგი მხოლოდ დასრულებულ შეკვეთაზე შეიძლება.')
  }
  if (order.customerRating != null) {
    throw new Error('ამ შეკვეთაზე უკვე გაქვს შეფასება.')
  }

  await updateDoc(orderRef, {
    customerRating: value,
    customerReview: review?.trim() || '',
    updatedAt: serverTimestamp(),
  })

  if (developerId) {
    const devRef = doc(firestore, 'users', developerId)
    const devSnap = await getDoc(devRef)
    if (devSnap.exists()) {
      const data = devSnap.data()
      const count = (data.ratingCount ?? 0) + 1
      const sum = (data.ratingSum ?? 0) + value
      await updateDoc(devRef, {
        ratingCount: count,
        ratingSum: sum,
        ratingAvg: sum / count,
      })
    }
  }
}

export async function updateOrderCompensation(orderId, { price, developerPayout }) {
  const firestore = requireDb()
  const payload = { updatedAt: serverTimestamp() }

  if (price !== undefined) {
    payload.price = price
  }
  if (developerPayout !== undefined) {
    payload.developerPayout = developerPayout
  }

  await updateDoc(doc(firestore, 'orders', orderId), payload)
}

export async function updateOrderPaymentStatus(orderId, paymentStatus) {
  if (!Object.values(PAYMENT_STATUS).includes(paymentStatus)) {
    throw new Error('paymentStatus უნდა იყოს unpaid ან paid.')
  }

  const firestore = requireDb()
  await updateDoc(doc(firestore, 'orders', orderId), {
    paymentStatus,
    updatedAt: serverTimestamp(),
  })
}

export async function updateOrderPayoutStatus(orderId, payoutStatus) {
  if (!Object.values(PAYOUT_STATUS).includes(payoutStatus)) {
    throw new Error('payoutStatus უნდა იყოს pending ან paid.')
  }

  const firestore = requireDb()
  await updateDoc(doc(firestore, 'orders', orderId), {
    payoutStatus,
    updatedAt: serverTimestamp(),
  })
}

export function formatOrderDate(timestamp) {
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

export async function updateDeveloperOrderStatus(orderId, status) {
  if (![ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.COMPLETED].includes(status)) {
    throw new Error('დეველოპერს მხოლოდ in_progress ან completed სტატუსის დაყენება შეუძლია.')
  }

  return updateOrderStatus(orderId, status)
}

export async function assignDeveloperToOrder(orderId, { developerId, developerName }) {
  const firestore = requireDb()
  const orderSnap = await getDoc(doc(firestore, 'orders', orderId))
  if (!orderSnap.exists()) {
    throw new Error('შეკვეთა ვერ მოიძებნა.')
  }
  if (orderSnap.data().status !== ORDER_STATUS.QUOTE_CONFIRMED) {
    throw new Error('მინიჭება შესაძლებელია მხოლოდ ფასის დადასტურების შემდეგ.')
  }

  await updateDoc(doc(firestore, 'orders', orderId), {
    assignedDeveloperId: developerId,
    assignedDeveloperName: developerName,
    status: ORDER_STATUS.ASSIGNED,
    updatedAt: serverTimestamp(),
  })
}

export async function updateOrderStatus(orderId, status) {
  const firestore = requireDb()
  await updateDoc(doc(firestore, 'orders', orderId), {
    status,
    updatedAt: serverTimestamp(),
  })
}

export async function addOrderNote(orderId, { text, authorName }) {
  const firestore = requireDb()
  await updateDoc(doc(firestore, 'orders', orderId), {
    managerNotes: arrayUnion({
      text: text.trim(),
      authorName,
      createdAt: Timestamp.now(),
    }),
    updatedAt: serverTimestamp(),
  })
}

export function formatOrderNoteTime(timestamp) {
  if (!timestamp) return ''

  const date =
    typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp)

  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('ka-GE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function canAssignDeveloper(order) {
  return order?.status === ORDER_STATUS.QUOTE_CONFIRMED
}

export function canOfferPrice(order) {
  return order?.status === ORDER_STATUS.NEW || order?.status === ORDER_STATUS.QUOTE_REJECTED
}
