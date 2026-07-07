export const ASSIGNABLE_ROLES = [
  { value: 'customer', label: 'ბიზნესი' },
  { value: 'manager', label: 'მენეჯერი' },
  { value: 'developer', label: 'შემსრულებელი' },
  { value: 'admin', label: 'ადმინი' },
]

export function subscribeToAllUsers(onUsers, onError) {
  let active = true

  const poll = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch all users')
      const users = await res.json()
      const sorted = users.sort((a, b) => (a.email || '').localeCompare(b.email || ''))
      if (active) {
        onUsers(sorted)
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

export function subscribeToPendingDeveloperRequests(onRequests, onError) {
  let active = true

  const poll = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/users?developerRequestStatus=pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Failed to fetch pending requests')
      const requests = await res.json()
      const sorted = requests.sort((a, b) => {
        const aTime = new Date(a.developerRequestedAt || 0).getTime()
        const bTime = new Date(b.developerRequestedAt || 0).getTime()
        return bTime - aTime
      })
      if (active) {
        onRequests(sorted)
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

export async function setUserRole(userId, role, adminId) {
  const token = localStorage.getItem('token')
  const payload = {
    role,
    updatedBy: adminId
  }

  if (role === 'developer') {
    payload.developerRequestStatus = 'approved'
    payload.developerReviewedAt = new Date()
    payload.developerReviewedBy = adminId
  } else {
    payload.developerRequestStatus = 'none'
  }

  const res = await fetch(`/api/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error('სტატუსის განახლება ვერ მოხერხდა.')
}

export async function approveDeveloperRequest(userId, adminId) {
  await setUserRole(userId, 'developer', adminId)
}

export async function rejectDeveloperRequest(userId, adminId) {
  const token = localStorage.getItem('token')
  const res = await fetch(`/api/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      role: 'customer',
      developerRequestStatus: 'rejected',
      developerReviewedAt: new Date(),
      developerReviewedBy: adminId,
      updatedBy: adminId
    })
  })
  if (!res.ok) throw new Error('მოთხოვნის უარყოფა ვერ მოხერხდა.')
}
