import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  getDeveloperOrderStats,
  getDeveloperPayoutStats,
  resolvePaymentStatus,
} from '../services/orderService'

const CUSTOMER_ACTIVE_STATUSES = [
  ORDER_STATUS.NEW,
  ORDER_STATUS.QUOTE_OFFERED,
  ORDER_STATUS.QUOTE_CONFIRMED,
  ORDER_STATUS.ASSIGNED,
  ORDER_STATUS.IN_PROGRESS,
]

const MANAGER_PIPELINE_STATUSES = [
  ORDER_STATUS.NEW,
  ORDER_STATUS.QUOTE_OFFERED,
  ORDER_STATUS.QUOTE_CONFIRMED,
  ORDER_STATUS.ASSIGNED,
  ORDER_STATUS.IN_PROGRESS,
]

export function getCustomerOrderStats(orders) {
  const list = orders ?? []
  const completed = list.filter((order) => order.status === ORDER_STATUS.COMPLETED)
  const active = list.filter((order) => CUSTOMER_ACTIVE_STATUSES.includes(order.status))

  let totalSpent = 0
  for (const order of completed) {
    if (resolvePaymentStatus(order) === PAYMENT_STATUS.PAID && typeof order.price === 'number') {
      totalSpent += order.price
    }
  }

  return {
    total: list.length,
    active: active.length,
    completed: completed.length,
    totalSpent,
  }
}

export function getManagerOrderStats(orders, managerName) {
  const list = orders ?? []
  const normalizedName = managerName?.trim() || ''

  const ordersWithNotes = normalizedName
    ? list.filter((order) =>
        (order.managerNotes ?? []).some((note) => note.authorName === normalizedName),
      )
    : []

  const notesAdded = normalizedName
    ? ordersWithNotes.reduce(
        (sum, order) =>
          sum +
          (order.managerNotes ?? []).filter((note) => note.authorName === normalizedName).length,
        0,
      )
    : 0

  return {
    totalOrders: list.length,
    activeOrders: list.filter((order) => MANAGER_PIPELINE_STATUSES.includes(order.status)).length,
    completedOrders: list.filter((order) => order.status === ORDER_STATUS.COMPLETED).length,
    ordersWithNotes: ordersWithNotes.length,
    notesAdded,
  }
}

export function getAdminPlatformStats(orders) {
  const list = orders ?? []
  const completed = list.filter((order) => order.status === ORDER_STATUS.COMPLETED)

  let revenue = 0
  for (const order of completed) {
    if (resolvePaymentStatus(order) === PAYMENT_STATUS.PAID && typeof order.price === 'number') {
      revenue += order.price
    }
  }

  return {
    totalOrders: list.length,
    activeOrders: list.filter((order) => MANAGER_PIPELINE_STATUSES.includes(order.status)).length,
    completedOrders: completed.length,
    revenue,
  }
}

export function getDeveloperStatsBundle(orders) {
  return {
    ...getDeveloperOrderStats(orders),
    ...getDeveloperPayoutStats(orders),
    total: orders?.length ?? 0,
    completed: (orders ?? []).filter((order) => order.status === ORDER_STATUS.COMPLETED).length,
  }
}

export function formatProfileMemberSince(timestamp) {
  if (!timestamp) return '—'

  const date =
    typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp)

  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('ka-GE', {
    month: 'long',
    year: 'numeric',
  })
}
