import { DEFAULT_SITE_CONTENT, mergeSiteContent } from '../data/defaultSiteContent'

const SITE_DOC_ID = 'default'

export function subscribeToSiteContent(onContent, onError) {
  let active = true
  
  const poll = async () => {
    try {
      const res = await fetch(`/api/site-content/${SITE_DOC_ID}`)
      if (!res.ok) throw new Error('Failed to fetch site content')
      const data = await res.json()
      if (active) {
        onContent(mergeSiteContent(data))
      }
    } catch (err) {
      if (active) onError(err)
    }
  }

  poll()
  const interval = setInterval(poll, 5000)

  return () => {
    active = false
    clearInterval(interval)
  }
}

export async function updateSiteContent(content, adminId) {
  const token = localStorage.getItem('token')
  const res = await fetch(`/api/site-content/${SITE_DOC_ID}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ...content,
      updatedBy: adminId
    })
  })

  if (!res.ok) {
    const errData = await res.json()
    throw new Error(errData.message || 'სისტემური ტექსტების განახლება ვერ მოხერხდა.')
  }
}

export function getDefaultSiteContent() {
  return { ...DEFAULT_SITE_CONTENT }
}
