import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, User } from 'lucide-react'
import { subscribeToManagers, subscribeToOrders } from '../services/orderService'
import usePageMeta from '../hooks/usePageMeta'
import useSiteContent from '../hooks/useSiteContent'
import { useAuth } from '../context/AuthContext'
import { pageTitle } from '../constants/brand'
import './Managers.css'

function Managers() {
  usePageMeta(pageTitle('მენეჯერები'), 'DIGIT — მენეჯერების პროფილები და შესრულებული ტასკები.')

  const [managers, setManagers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { content } = useSiteContent()
  const { userProfile } = useAuth()

  const userRole = userProfile?.role || 'customer'
  const isStaffUser = ['manager', 'admin'].includes(userRole)

  useEffect(() => {
    const unsubscribeManagers = subscribeToManagers(
      (list) => {
        setManagers(list)
        setLoading(false)
      },
      (err) => {
        setError(err.message || 'მენეჯერების ჩატვირთვა ვერ მოხერხდა.')
        setLoading(false)
      }
    )

    let unsubscribeOrders = () => {}
    if (isStaffUser) {
      unsubscribeOrders = subscribeToOrders(
        'all',
        (list) => {
          setOrders(list)
        },
        (err) => {
          console.error('შეკვეთების ჩატვირთვა ვერ მოხერხდა:', err)
        }
      )
    }

    return () => {
      unsubscribeManagers()
      unsubscribeOrders()
    }
  }, [isStaffUser])

  const getCompletedCount = (mgr) => {
    if (isStaffUser) {
      const managerId = mgr.id
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

    return mgr.completedTasksCount || 0
  }

  return (
    <div className="page managers-page">
      <div className="container">
        <header className="managers-page__header">
          <h1 className="page__title">მენეჯერები</h1>
          <p className="page__subtitle">
            გაეცანი DIGIT-ის მენეჯერებს, მათ პროფილებს და შესრულებულ ტასკებს.
          </p>
        </header>

        {error && <div className="managers-page__error">{error}</div>}

        {loading ? (
          <p className="managers-page__empty">იტვირთება...</p>
        ) : managers.length === 0 ? (
          <p className="managers-page__empty">მენეჯერები ჯერ არ არის დარეგისტრირებული.</p>
        ) : (
          <div className="managers-grid">
            {managers.map((mgr) => (
              <Link key={mgr.id} to={`/managers/${mgr.id}`} className="manager-card">
                <div className="manager-card__top">
                  <span className="manager-card__avatar">
                    <User size={18} />
                  </span>
                  <div>
                    <div className="manager-card__name">{mgr.name || mgr.email}</div>
                    <div className="manager-card__completed" style={{ marginTop: '0.25rem' }}>
                      <CheckCircle size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '3px' }} />
                      შესრულებული ტასკები: {getCompletedCount(mgr)}
                    </div>
                  </div>
                </div>
                {mgr.bio && <p className="manager-card__bio">{mgr.bio}</p>}
                <span className="manager-card__link">პროფილის ნახვა →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Managers
