import { useEffect, useState } from 'react'
import { mergeSiteContent } from '../data/defaultSiteContent'
import { subscribeToSiteContent } from '../services/siteContentService'
import { isFirebaseConfigured } from '../firebase'

export default function useSiteContent() {
  const [content, setContent] = useState(() => mergeSiteContent(null))
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      return undefined
    }

    const unsubscribe = subscribeToSiteContent(
      (nextContent) => {
        setContent(nextContent)
        setLoading(false)
      },
      () => {
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  return { content, loading }
}
