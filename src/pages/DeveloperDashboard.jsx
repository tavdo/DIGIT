import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  History,
  Loader2,
  LogOut,
  Play,
  User,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  formatOrderAmount,
  formatOrderDate,
  ORDER_PRIORITY_LABELS,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  partitionDeveloperOrders,
  subscribeToDeveloperOrders,
  subscribeToOrder,
  updateDeveloperOrderStatus,
} from '../services/orderService'
import UserProfileEditor from '../components/profile/UserProfileEditor'
import UserStatsGrid from '../components/profile/UserStatsGrid'
import useUserOrderStats from '../hooks/useUserOrderStats'
import DigitMark from '../components/DigitMark'
import OrderAttachments from '../components/OrderAttachments'
import usePageMeta from '../hooks/usePageMeta'
import { pageTitle } from '../constants/brand'
import './DeveloperDashboard.css'

function TaskCard({ order, onClick }) {
  return (
    <button type="button" className="dev-task-card" onClick={() => onClick(order.id)}>
      <div className="dev-task-card__top">
        <span className="dev-task-card__service">{order.serviceType}</span>
        <span className={`dev-task-card__status dev-task-card__status--${order.status}`}>
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>
      <p className="dev-task-card__description">{order.description}</p>
      <div className="dev-task-card__meta">
        <span>{ORDER_PRIORITY_LABELS[order.priority] ?? '—'}</span>
        {order.developerPayout > 0 && (
          <span className="dev-task-card__payout">{formatOrderAmount(order.developerPayout)}</span>
        )}
      </div>
    </button>
  )
}

function TaskDetailScreen({ orderId, onBack, onError, readOnly = false }) {
  const [order, setOrder] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!orderId) return undefined

    const unsubscribe = subscribeToOrder(
      orderId,
      (data) => {
        setOrder(data)
        setLoaded(true)
        if (!data) onBack()
      },
      (err) => onError(err.message || 'ტასკის ჩატვირთვა ვერ მოხერხდა.'),
    )

    return unsubscribe
  }, [orderId, onBack, onError])

  const handleStart = async () => {
    setSubmitting(true)
    try {
      await updateDeveloperOrderStatus(orderId, ORDER_STATUS.IN_PROGRESS)
    } catch (err) {
      onError(err.message || 'სტატუსის განახლება ვერ მოხერხდა.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleComplete = async () => {
    setSubmitting(true)
    try {
      await updateDeveloperOrderStatus(orderId, ORDER_STATUS.COMPLETED)
      onBack()
    } catch (err) {
      onError(err.message || 'სტატუსის განახლება ვერ მოხერხდა.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!loaded) {
    return (
      <div className="dev-app__screen">
        <div className="dev-app__loading">იტვირთება...</div>
      </div>
    )
  }

  if (!order) return null

  const canStart = !readOnly && order.status === ORDER_STATUS.ASSIGNED
  const canComplete = !readOnly && order.status === ORDER_STATUS.IN_PROGRESS

  return (
    <div className="dev-app__screen dev-app__screen--detail">
      <header className="dev-app__subheader">
        <button type="button" className="dev-app__back" onClick={onBack}>
          <ArrowLeft size={20} />
          უკან
        </button>
        <span className={`dev-task-card__status dev-task-card__status--${order.status}`}>
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </span>
      </header>

      <div className="dev-task-detail">
        <h2 className="dev-task-detail__title">{order.serviceType}</h2>
        <p className="dev-task-detail__priority">
          პრიორიტეტი: {ORDER_PRIORITY_LABELS[order.priority] ?? '—'}
        </p>
        <section className="dev-task-detail__block">
          <h3>აღწერა</h3>
          <p>{order.description}</p>
        </section>
        <OrderAttachments attachments={order.attachments} title="ფოტო / ვიდეო" />
        <section className="dev-task-detail__block">
          <h3>დეტალები</h3>
          <dl className="dev-task-detail__facts">
            <div>
              <dt>კლიენტი</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div>
              <dt>თარიღი</dt>
              <dd>{formatOrderDate(order.createdAt)}</dd>
            </div>
            {order.developerPayout > 0 && (
              <div>
                <dt>ანაზღაურება</dt>
                <dd className="dev-task-detail__payout">{formatOrderAmount(order.developerPayout)}</dd>
              </div>
            )}
          </dl>
        </section>
      </div>

      {(canStart || canComplete) && (
        <div className="dev-app__actions">
          {canStart && (
            <button
              type="button"
              className="btn btn--primary btn--lg dev-app__action-btn"
              onClick={handleStart}
              disabled={submitting}
            >
              {submitting ? <Loader2 size={18} className="dev-app__spin" /> : <Play size={18} />}
              სამუშაოს დაწყება
            </button>
          )}
          {canComplete && (
            <button
              type="button"
              className="btn btn--primary btn--lg dev-app__action-btn"
              onClick={handleComplete}
              disabled={submitting}
            >
              {submitting ? <Loader2 size={18} className="dev-app__spin" /> : <CheckCircle2 size={18} />}
              დასრულება
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function ProfileScreen({ user, userProfile, onError }) {
  const { stats, loading } = useUserOrderStats(user, userProfile)

  return (
    <div className="dev-app__screen dev-app__screen--profile">
      <UserProfileEditor onError={onError} />
      <div className="dev-profile-stats-wrap">
        <UserStatsGrid
          role="developer"
          stats={stats}
          userProfile={userProfile}
          loading={loading}
        />
      </div>
      <Link to="/profile" className="dev-profile-full-link">
        სრული პროფილი გვერდზე
      </Link>
    </div>
  )
}

function DeveloperDashboard() {
  usePageMeta(pageTitle('ჩემი ტასკები'), 'DIGIT — შემსრულებლის აპლიკაცია.')

  const { user, userProfile, logout } = useAuth()
  const [tab, setTab] = useState('tasks')
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [detailReadOnly, setDetailReadOnly] = useState(false)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.uid) return undefined

    const unsubscribe = subscribeToDeveloperOrders(
      user.uid,
      (list) => {
        setOrders(list)
        setLoading(false)
      },
      (err) => {
        setError(err.message || 'ტასკების ჩატვირთვა ვერ მოხერხდა.')
        setLoading(false)
      },
    )

    return unsubscribe
  }, [user?.uid])

  const { active, archived } = useMemo(() => partitionDeveloperOrders(orders), [orders])

  const openTask = useCallback((orderId, readOnly = false) => {
    setDetailReadOnly(readOnly)
    setSelectedOrderId(orderId)
    setError('')
  }, [])

  const closeTask = useCallback(() => {
    setSelectedOrderId(null)
    setDetailReadOnly(false)
  }, [])

  if (selectedOrderId) {
    return (
      <div className="dev-app">
        {error && <div className="dev-app__error">{error}</div>}
        <TaskDetailScreen
          orderId={selectedOrderId}
          onBack={closeTask}
          onError={setError}
          readOnly={detailReadOnly}
        />
      </div>
    )
  }

  return (
    <div className="dev-app">
      <header className="dev-app__header">
        <div className="dev-app__brand">
          <DigitMark size="sm" />
          <div>
            <span className="dev-app__label">შემსრულებელი</span>
            <strong>{userProfile?.name || 'ჩემი ტასკები'}</strong>
          </div>
        </div>
        <button type="button" className="dev-app__logout" onClick={logout} aria-label="გასვლა">
          <LogOut size={18} />
        </button>
      </header>

      {error && <div className="dev-app__error">{error}</div>}

      <main className="dev-app__main">
        {tab === 'tasks' && (
          <div className="dev-app__screen">
            <h1 className="dev-app__title">აქტიური ტასკები</h1>
            {loading ? (
              <div className="dev-app__empty">იტვირთება...</div>
            ) : active.length === 0 ? (
              <div className="dev-app__empty">
                <ClipboardList size={40} />
                <p>ახლა აქტიური ტასკები არ გაქვს.</p>
                <span>მენეჯერი მოგინიჭებს ახალ ტასკს, როცა მზად იქნება.</span>
              </div>
            ) : (
              <div className="dev-task-list">
                {active.map((order) => (
                  <TaskCard key={order.id} order={order} onClick={(id) => openTask(id, false)} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'completed' && (
          <div className="dev-app__screen">
            <h1 className="dev-app__title">შესრულებული ტასკები</h1>
            {loading ? (
              <div className="dev-app__empty">იტვირთება...</div>
            ) : archived.length === 0 ? (
              <div className="dev-app__empty">
                <History size={40} />
                <p>შესრულებული ტასკები ჯერ არ გაქვს.</p>
              </div>
            ) : (
              <div className="dev-task-list">
                {archived.map((order) => (
                  <TaskCard key={order.id} order={order} onClick={(id) => openTask(id, true)} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <ProfileScreen user={user} userProfile={userProfile} onError={setError} />
        )}
      </main>

      <nav className="dev-app__tabs" aria-label="ძირითადი ნავიგაცია">
        <button
          type="button"
          className={`dev-app__tab ${tab === 'tasks' ? 'dev-app__tab--active' : ''}`}
          onClick={() => setTab('tasks')}
        >
          <ClipboardList size={20} />
          <span>ტასკები</span>
          {active.length > 0 && <em className="dev-app__badge">{active.length}</em>}
        </button>
        <button
          type="button"
          className={`dev-app__tab ${tab === 'completed' ? 'dev-app__tab--active' : ''}`}
          onClick={() => setTab('completed')}
        >
          <History size={20} />
          <span>შესრულებული</span>
        </button>
        <button
          type="button"
          className={`dev-app__tab ${tab === 'profile' ? 'dev-app__tab--active' : ''}`}
          onClick={() => setTab('profile')}
        >
          <User size={20} />
          <span>პროფილი</span>
        </button>
      </nav>
    </div>
  )
}

export default DeveloperDashboard
