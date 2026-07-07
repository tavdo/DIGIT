import { uploadOrderAttachments } from './attachmentService'
import { saveDeveloperReview } from './developerReviewService'

export const ORDER_STATUS = {
  NEW: 'new',
  QUOTE_OFFERED: 'quote_offered',
  QUOTE_CONFIRMED: 'quote_confirmed',
  QUOTE_REJECTED: 'quote_rejected',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  WAITING_APPROVAL: 'waiting_approval',
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
  waiting_approval: 'შემოწმებაზეა',
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

export async function createTicket({
  customerId,
  customerName,
  serviceId,
  serviceType,
  description,
  priority,
  attachmentFiles = [],
  managerId = null,
  managerName = null,
}) {
  const token = localStorage.getItem('token')
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      customerId,
      customerName,
      serviceId,
      serviceType,
      description,
      priority,
      managerId,
      managerName
    })
  })

  if (!res.ok) {
    const errData = await res.json()
    throw new Error(errData.message || 'შეკვეთის შექმნა ვერ მოხერხდა.')
  }

  const order = await res.json()

  if (attachmentFiles.length > 0) {
    try {
      await uploadOrderAttachments(order.id, customerId, attachmentFiles)
    } catch (err) {
      console.error('ფაილების ატვირთვა ვერ მოხერხდა შეკვეთის შექმნისას:', err)
    }
  }

  return order.id
}

export function subscribeToOrders(statusFilter, onOrders, onError) {
  let active = true

  const poll = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch orders')
      let orders = await res.json()
      if (statusFilter !== 'all') {
        orders = orders.filter(o => o.status === statusFilter)
      }
      if (active) {
        onOrders(sortOrdersByPriority(orders))
      }
    } catch (err) {
      if (active) onError(err)
    }
  }

  poll()
  const interval = setInterval(poll, 4000)

  return () => {
    active = false
    clearInterval(interval)
  }
}

export function subscribeToCustomerOrders(customerId, onOrders, onError) {
  let active = true

  const poll = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/orders?customerId=${customerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch customer orders')
      const orders = await res.json()
      if (active) {
        onOrders(orders)
      }
    } catch (err) {
      if (active) onError(err)
    }
  }

  poll()
  const interval = setInterval(poll, 4000)

  return () => {
    active = false
    clearInterval(interval)
  }
}

export function subscribeToOrder(orderId, onOrder, onError) {
  let active = true

  const poll = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch order details')
      const order = await res.json()
      if (active) {
        onOrder(order)
      }
    } catch (err) {
      if (active) onError(err)
    }
  }

  poll()
  const interval = setInterval(poll, 4000)

  return () => {
    active = false
    clearInterval(interval)
  }
}

export function subscribeToDevelopers(onDevelopers, onError) {
  let active = true

  const poll = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/users?role=developer', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch developers')
      const developers = await res.json()
      const sorted = developers.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ka'))
      if (active) {
        onDevelopers(sorted)
      }
    } catch (err) {
      if (active) onError(err)
    }
  }

  poll()
  const interval = setInterval(poll, 4000)

  return () => {
    active = false
    clearInterval(interval)
  }
}

export function subscribeToManagers(onManagers, onError) {
  let active = true

  const poll = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/users?role=manager', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch managers')
      const managers = await res.json()
      const sorted = managers.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ka'))
      if (active) {
        onManagers(sorted)
      }
    } catch (err) {
      if (active) onError(err)
    }
  }

  poll()
  const interval = setInterval(poll, 4000)

  return () => {
    active = false
    clearInterval(interval)
  }
}

export function subscribeToDeveloperOrders(developerId, onOrders, onError) {
  let active = true

  const poll = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/orders?assignedDeveloperId=${developerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch developer orders')
      const orders = await res.json()
      if (active) {
        onOrders(orders)
      }
    } catch (err) {
      if (active) onError(err)
    }
  }

  poll()
  const interval = setInterval(poll, 4000)

  return () => {
    active = false
    clearInterval(interval)
  }
}

export const ACTIVE_ORDER_STATUSES = [
  ORDER_STATUS.ASSIGNED,
  ORDER_STATUS.IN_PROGRESS,
  ORDER_STATUS.WAITING_APPROVAL,
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
  [ORDER_STATUS.WAITING_APPROVAL]: 4.5,
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
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
}

export function partitionDeveloperOrders(orders) {
  const active = orders
    .filter((order) => ACTIVE_ORDER_STATUSES.includes(order.status))
    .sort((a, b) => {
      const weightDiff =
        (STATUS_SORT_WEIGHT[a.status] ?? 99) - (STATUS_SORT_WEIGHT[b.status] ?? 99)
      if (weightDiff !== 0) return weightDiff
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

  const archived = orders
    .filter((order) => ARCHIVED_ORDER_STATUSES.includes(order.status))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

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
    const updated = order.updatedAt ? new Date(order.updatedAt) : null
    return updated && updated >= monthStart
  }).length

  return { activeCount, completedThisMonth }
}

function getOrderUpdatedDate(order) {
  const updated = order.updatedAt ? new Date(order.updatedAt) : null
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

export async function offerOrderPrice(orderId, price, explanation) {
  if (price == null || price <= 0) {
    throw new Error('შეიყვანეთ სწორი ფასი.')
  }

  const token = localStorage.getItem('token')
  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      price,
      priceExplanation: explanation?.trim() || '',
      status: ORDER_STATUS.QUOTE_OFFERED
    })
  })

  if (!res.ok) {
    const errData = await res.json()
    throw new Error(errData.message || 'ფასის შეთავაზება ვერ მოხერხდა.')
  }
}

export async function confirmOrderPrice(orderId) {
  const token = localStorage.getItem('token')
  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status: ORDER_STATUS.QUOTE_CONFIRMED,
      quoteConfirmedAt: new Date()
    })
  })
  if (!res.ok) throw new Error('ფასის დადასტურება ვერ მოხერხდა.')
}

export async function rejectOrderPrice(orderId) {
  const token = localStorage.getItem('token')
  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status: ORDER_STATUS.QUOTE_REJECTED
    })
  })
  if (!res.ok) throw new Error('ფასის უარყოფა ვერ მოხერხდა.')
}

export async function submitOrderRating(orderId, developerId, { rating, companyRating, review }) {
  const value = Number(rating)
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error('რეიტინგი უნდა იყოს 1-დან 5-მდე.')
  }

  const compValue = Number(companyRating)
  if (!Number.isInteger(compValue) || compValue < 1 || compValue > 5) {
    throw new Error('კომპანიის რეიტინგი უნდა იყოს 1-დან 5-მდე.')
  }

  const token = localStorage.getItem('token')
  
  const getRes = await fetch(`/api/orders/${orderId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!getRes.ok) throw new Error('შეკვეთა ვერ მოიძებნა.')
  const order = await getRes.json()

  const patchRes = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      customerRating: value,
      companyRating: compValue,
      customerReview: review?.trim() || ''
    })
  })

  if (!patchRes.ok) throw new Error('შეფასების გაგზავნა ვერ მოხერხდა.')

  if (developerId) {
    await saveDeveloperReview(developerId, orderId, {
      rating: value,
      review: review?.trim() || '',
      customerName: order.customerName,
      serviceType: order.serviceType,
    })
  }
}

export async function updateOrderCompensation(orderId, { price, developerPayout }) {
  const token = localStorage.getItem('token')
  const payload = {}
  if (price !== undefined) payload.price = price
  if (developerPayout !== undefined) payload.developerPayout = developerPayout

  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('ჰონორარის განახლება ვერ მოხერხდა.')
}

export async function updateOrderPaymentStatus(orderId, paymentStatus) {
  if (!Object.values(PAYMENT_STATUS).includes(paymentStatus)) {
    throw new Error('paymentStatus უნდა იყოს unpaid ან paid.')
  }

  const token = localStorage.getItem('token')
  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ paymentStatus })
  })
  if (!res.ok) throw new Error('გადახდის სტატუსის განახლება ვერ მოხერხდა.')
}

export async function updateOrderPayoutStatus(orderId, payoutStatus) {
  if (!Object.values(PAYOUT_STATUS).includes(payoutStatus)) {
    throw new Error('payoutStatus უნდა იყოს pending ან paid.')
  }

  const token = localStorage.getItem('token')
  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ payoutStatus })
  })
  if (!res.ok) throw new Error('გადარიცხვის სტატუსის განახლება ვერ მოხერხდა.')
}

export function formatOrderDate(timestamp) {
  if (!timestamp) return '—'
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('ka-GE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export async function updateDeveloperOrderStatus(orderId, status) {
  if (![ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.WAITING_APPROVAL, ORDER_STATUS.COMPLETED].includes(status)) {
    throw new Error('დეველოპერს მხოლოდ შესაბამისი სტატუსების დაყენება შეუძლია.')
  }
  return updateOrderStatus(orderId, status)
}

export async function updateOrderTimelineEvent(orderId, eventName, nextStatus = null) {
  const token = localStorage.getItem('token')
  const payload = {
    [`${eventName}At`]: new Date()
  }
  if (nextStatus) {
    payload.status = nextStatus
  }
  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('Timeline-ის განახლება ვერ მოხერხდა.')
}

export async function approveOrderCompletion(orderId) {
  const token = localStorage.getItem('token')
  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status: ORDER_STATUS.COMPLETED,
      managerApprovedAt: new Date()
    })
  })
  if (!res.ok) throw new Error('შესრულების დადასტურება ვერ მოხერხდა.')
}

export async function assignDeveloperToOrder(orderId, { developerId, developerName, comment }) {
  const token = localStorage.getItem('token')
  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      assignedDeveloperId: developerId,
      assignedDeveloperName: developerName,
      assignedDeveloperComment: comment?.trim() || '',
      status: ORDER_STATUS.ASSIGNED,
      assignedAt: new Date()
    })
  })

  if (!res.ok) {
    const errData = await res.json()
    throw new Error(errData.message || 'შემსრულებლის მინიჭება ვერ მოხერხდა.')
  }
}

export async function updateOrderStatus(orderId, status) {
  const token = localStorage.getItem('token')
  const res = await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  })
  if (!res.ok) throw new Error('სტატუსის განახლება ვერ მოხერხდა.')
}

export async function addOrderNote(orderId, { text, authorName }) {
  const token = localStorage.getItem('token')
  const res = await fetch(`/api/orders/${orderId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ text, authorName })
  })
  if (!res.ok) throw new Error('შენიშვნის დამატება ვერ მოხერხდა.')
}

export function formatOrderNoteTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
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
