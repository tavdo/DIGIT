export async function saveDeveloperReview(developerId, orderId, { rating, review, customerName, serviceType }) {
  const token = localStorage.getItem('token')
  const res = await fetch(`/api/reviews/${developerId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      orderId,
      rating,
      comment: review?.trim() || '',
      customerName: customerName?.trim() || 'კლიენტი',
      serviceType: serviceType || ''
    })
  })
  if (!res.ok) {
    const errData = await res.json()
    throw new Error(errData.message || 'შეფასების შენახვა ვერ მოხერხდა.')
  }
}

export function subscribeToDeveloperReviews(developerId, onReviews, onError) {
  let active = true

  const poll = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/reviews/${developerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch developer reviews')
      const data = await res.json()
      if (active) {
        const mapped = data.map(item => ({
          ...item,
          review: item.comment || ''
        }))
        onReviews(mapped)
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

export function subscribeToDeveloperReviewsFromOrders(developerId, onReviews, onError) {
  let active = true

  const poll = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/orders?assignedDeveloperId=${developerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch developer orders reviews')
      const data = await res.json()
      if (active) {
        const reviews = data
          .filter((order) => order.status === 'completed' && order.customerRating != null)
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

export async function fetchDeveloperProfile(developerId) {
  const token = localStorage.getItem('token')
  const res = await fetch(`/api/users/${developerId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!res.ok) return null
  const data = await res.json()
  if (data.role !== 'developer') return null
  return data
}

export function formatReviewDate(timestamp) {
  if (!timestamp) return '—'
  const date = new Date(timestamp)
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
