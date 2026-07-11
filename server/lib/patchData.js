const USER_PATCH_FIELDS = new Set([
  'name',
  'role',
  'developerRequestStatus',
  'companyName',
  'phone',
  'bio',
  'experienceCategories',
  'experienceYears',
  'ratingAvg',
  'ratingCount',
  'ratingSum',
  'completedTasksCount',
  'developerRequestedAt',
  'developerReviewedAt',
  'developerReviewedBy',
  'updatedBy'
])

const ORDER_PATCH_FIELDS = new Set([
  'customerId',
  'customerName',
  'managerId',
  'managerName',
  'assignedDeveloperId',
  'assignedDeveloperName',
  'assignedDeveloperComment',
  'serviceId',
  'serviceType',
  'description',
  'priority',
  'status',
  'price',
  'priceExplanation',
  'paymentStatus',
  'developerPayout',
  'payoutStatus',
  'customerRating',
  'companyRating',
  'customerReview',
  'attachments',
  'completionAttachment',
  'quoteConfirmedAt',
  'assignedAt',
  'viewedAt',
  'confirmedAt',
  'arrivedAt',
  'startedAt',
  'completedAt',
  'managerApprovedAt'
])

const DATE_FIELDS = new Set([
  'developerRequestedAt',
  'developerReviewedAt',
  'quoteConfirmedAt',
  'assignedAt',
  'viewedAt',
  'confirmedAt',
  'arrivedAt',
  'startedAt',
  'completedAt',
  'managerApprovedAt'
])

const USER_NUMERIC_FIELDS = new Set([
  'ratingAvg',
  'ratingCount',
  'ratingSum',
  'completedTasksCount'
])

const ORDER_NUMERIC_FIELDS = new Set([
  'price',
  'developerPayout',
  'customerRating',
  'companyRating'
])

function coerceDate(value) {
  if (value == null || value === '') return null
  if (value instanceof Date) return value
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function coerceNumber(value) {
  if (value == null || value === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export function pickUserPatchData(body) {
  const data = {}
  for (const [key, value] of Object.entries(body || {})) {
    if (!USER_PATCH_FIELDS.has(key) || value === undefined) continue
    if (DATE_FIELDS.has(key)) {
      data[key] = coerceDate(value)
    } else if (USER_NUMERIC_FIELDS.has(key)) {
      data[key] = coerceNumber(value)
    } else {
      data[key] = value
    }
  }
  return data
}

export function pickOrderPatchData(body) {
  const data = {}
  for (const [key, value] of Object.entries(body || {})) {
    if (!ORDER_PATCH_FIELDS.has(key) || value === undefined) continue
    if (DATE_FIELDS.has(key)) {
      data[key] = coerceDate(value)
    } else if (ORDER_NUMERIC_FIELDS.has(key)) {
      data[key] = coerceNumber(value)
    } else {
      data[key] = value
    }
  }
  if (data.paymentStatus === 'pending') {
    data.paymentStatus = 'unpaid'
  }
  return data
}

export function pickSignupData(body) {
  const allowed = new Set([
    'companyName',
    'phone',
    'bio',
    'experienceCategories',
    'experienceYears',
    'developerRequestedAt'
  ])
  const data = {}
  for (const [key, value] of Object.entries(body || {})) {
    if (!allowed.has(key) || value === undefined) continue
    data[key] = DATE_FIELDS.has(key) ? coerceDate(value) : value
  }
  if (body?.role === 'developer' && !data.developerRequestedAt) {
    data.developerRequestedAt = new Date()
  }
  return data
}
