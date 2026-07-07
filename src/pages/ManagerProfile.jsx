import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, CheckCircle } from 'lucide-react'
import { subscribeToOrders } from '../services/orderService'
import { useAuth } from '../context/AuthContext'
import usePageMeta from '../hooks/usePageMeta'
import useSiteContent from '../hooks/useSiteContent'
import { pageTitle } from '../constants/brand'
import './Managers.css'

function ManagerProfile() {
  const { managerId } = useParams()
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { content } = useSiteContent()
  const { userProfile } = useAuth()

  const userRole = userProfile?.role || 'customer'
  const isStaffUser = ['manager', 'admin'].includes(userRole)

  useEffect(() => {
    let cancelled = false

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`/api/users/${managerId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (!cancelled) {
          if (res.ok) {
            const data = await res.json()
            setProfile(data)
          } else {
            setError('მენეჯერი ვერ მოიძებნა.')
          }
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'პროფილის ჩატვირთვა ვერ მოხერხდა.')
          setLoading(false)
        }
      }
    }

    fetchProfile()

    let unsubscribeOrders = () => {}
    if (isStaffUser) {
      unsubscribeOrders = subscribeToOrders(
        'all',
        (list) => {
          if (!cancelled) {
            setOrders(list)
          }
        },
        (err) => {
          console.error('შეკვეთების ჩატვირთვა ვერ მოხერხდა:', err)
        }
      )
    }

    return () => {
      cancelled = true
      unsubscribeOrders()
    }
  }, [managerId, isStaffUser])

  const getCompletedCount = () => {
    if (!profile) return 0
    if (isStaffUser) {
      const managerId = profile.id
      
      // Count orders assigned to this manager that are completed
      const directCount = orders.filter(
        (o) => o.managerId === managerId && o.status === 'completed'
      ).length

      // Fallback: count completed orders of categories assigned to this manager
      const managedCategories = content?.services
        ?.filter((s) => s.managerId === managerId)
        ?.map((s) => s.id) || []

      const fallbackCount = orders.filter(
        (o) =>
          o.status === 'completed' &&
          o.managerId !== managerId &&
          o.serviceId &&
          managedCategories.includes(o.serviceId)
      ).length

      return directCount + fallbackCount
    }

    return profile.completedTasksCount || 0
  }

  usePageMeta(
    pageTitle(profile?.name ? `${profile.name} — მენეჯერი` : 'მენეჯერი'),
    'DIGIT — მენეჯერის პროფილი და შესრულებული ტასკები.'
  )

  const completedCount = getCompletedCount()

  return (
    <div className="page managers-page">
      <div className="container managers-page__inner">
        <Link to="/managers" className="managers-page__back">
          <ArrowLeft size={16} />
          ყველა მენეჯერი
        </Link>

        {error && <div className="managers-page__error">{error}</div>}

        {loading ? (
          <p className="managers-page__empty">იტვირთება...</p>
        ) : profile ? (
          <div className="dev-pub-profile">
            <div className="dev-pub-card">
              <div className="dev-pub-card__header">
                <div className="dev-pub-card__avatar">
                  <User size={36} />
                </div>
                <div className="dev-pub-card__identity">
                  <h1 style={{ textTransform: 'uppercase', fontSize: '1.4rem' }}>{profile.name || profile.email}</h1>
                  <span className="manager-card__completed" style={{ marginTop: '0.5rem' }}>
                    <CheckCircle size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '3px' }} />
                    შესრულებული ტასკები: {completedCount}
                  </span>
                </div>
              </div>

              <dl className="dev-pub-card__details" style={{ marginTop: '1.5rem' }}>
                {profile.email && (
                  <div>
                    <dt style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={12} />
                      ელ.ფოსტა
                    </dt>
                    <dd style={{ fontSize: '0.9375rem' }}>{profile.email}</dd>
                  </div>
                )}
                {profile.phone && (
                  <div>
                    <dt style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Phone size={12} />
                      ტელეფონი
                    </dt>
                    <dd style={{ fontSize: '0.9375rem' }}>{profile.phone}</dd>
                  </div>
                )}
              </dl>

              {profile.bio && (
                <div className="dev-pub-card__bio" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
                  <h3 style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--color-copper)', letterSpacing: '0.05em' }}>
                    ბიოგრაფია / ჩემს შესახებ
                  </h3>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9375rem', lineHeight: '1.6' }}>{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default ManagerProfile
