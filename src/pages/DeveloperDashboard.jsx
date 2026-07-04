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
  Camera,
  MapPin,
  CheckSquare,
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
  updateOrderTimelineEvent,
} from '../services/orderService'
import { uploadCompletionAttachment } from '../services/attachmentService'
import UserProfileEditor from '../components/profile/UserProfileEditor'
import UserStatsGrid from '../components/profile/UserStatsGrid'
import useUserOrderStats from '../hooks/useUserOrderStats'
import DigitMark from '../components/DigitMark'
import ThemeToggle from '../components/ThemeToggle'
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
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [completionFile, setCompletionFile] = useState(null)
  const [completionPreview, setCompletionPreview] = useState(null)

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

  // Automatically log viewed timestamp when order details are loaded
  useEffect(() => {
    if (loaded && order && !order.viewedAt && !readOnly) {
      updateOrderTimelineEvent(order.id, 'viewed').catch((err) => {
        console.error('Failed to log viewedAt:', err)
      })
    }
  }, [loaded, order, readOnly])

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      await updateOrderTimelineEvent(orderId, 'confirmed')
    } catch (err) {
      onError(err.message || 'დადასტურება ვერ მოხერხდა.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleArrive = async () => {
    setSubmitting(true)
    try {
      await updateOrderTimelineEvent(orderId, 'arrived')
    } catch (err) {
      onError(err.message || 'მისვლის დადასტურება ვერ მოხერხდა.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStart = async () => {
    setSubmitting(true)
    try {
      await updateOrderTimelineEvent(orderId, 'started', ORDER_STATUS.IN_PROGRESS)
    } catch (err) {
      onError(err.message || 'დაწყება ვერ მოხერხდა.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCompletionFile(file)
      setCompletionPreview(URL.createObjectURL(file))
    }
  }

  const handleCompleteSubmit = async () => {
    if (!completionFile) {
      onError('დასრულებისთვის აუცილებელია დამადასტურებელი ფოტოს ატვირთვა.')
      return
    }
    setSubmitting(true)
    try {
      // 1. Upload photo
      await uploadCompletionAttachment(orderId, user.uid, completionFile)
      // 2. Set status to waiting approval
      await updateOrderTimelineEvent(orderId, 'completed', ORDER_STATUS.WAITING_APPROVAL)
      onBack()
    } catch (err) {
      onError(err.message || 'დასრულება ვერ მოხერხდა.')
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

  // Timeline list for visual dashboard
  const timelineEvents = [
    { label: 'მინიჭება', time: order.assignedAt, done: !!order.assignedAt },
    { label: 'ნახვა', time: order.viewedAt, done: !!order.viewedAt },
    { label: 'დადასტურება', time: order.confirmedAt, done: !!order.confirmedAt },
    { label: 'მისვლა', time: order.arrivedAt, done: !!order.arrivedAt },
    { label: 'დაწყება', time: order.startedAt, done: !!order.startedAt },
    { label: 'დასრულება', time: order.completedAt, done: !!order.completedAt },
    { label: 'შემოწმება', time: order.managerApprovedAt, done: !!order.managerApprovedAt },
  ]

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

        {/* Timeline visualization bar */}
        <div className="dev-task-timeline" style={{
          display: 'flex',
          justifyContent: 'space-between',
          margin: '1.25rem 0',
          background: 'var(--color-navy-soft)',
          padding: '1rem 0.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          {timelineEvents.map((ev, idx) => (
            <div key={idx} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              minWidth: '60px',
              textAlign: 'center',
              opacity: ev.done ? 1 : 0.35
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: ev.done ? 'var(--color-royal)' : 'var(--color-slate)',
                color: ev.done ? '#000000' : 'var(--text-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                marginBottom: '0.25rem'
              }}>
                {idx + 1}
              </div>
              <span style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>{ev.label}</span>
              {ev.time && (
                <span style={{ fontSize: '0.5rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                  {new Date(ev.time.toDate ? ev.time.toDate() : ev.time).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Manager Comment block */}
        {order.assignedDeveloperComment && (
          <section className="dev-task-detail__block" style={{
            background: 'var(--color-navy-soft)',
            borderLeft: '4px solid var(--color-royal)',
            padding: '1rem',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            marginBottom: '1.25rem'
          }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--color-royal)', marginBottom: '0.25rem' }}>მენეჯერის კომენტარი:</h3>
            <p style={{ fontStyle: 'italic', fontSize: '0.9rem', margin: 0 }}>"{order.assignedDeveloperComment}"</p>
          </section>
        )}

        <section className="dev-task-detail__block">
          <h3>აღწერა</h3>
          <p>{order.description}</p>
        </section>

        <OrderAttachments attachments={order.attachments} title="კლიენტის ფოტო / ვიდეო" />

        <section className="dev-task-detail__block">
          <h3>დეტალები</h3>
          <dl className="dev-task-detail__facts">
            <div>
              <dt>კლიენტი</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div>
              <dt>შექმნის თარიღი</dt>
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

        {/* Showing completion photo if uploaded */}
        {order.completionAttachment && (
          <section className="dev-task-detail__block">
            <h3>დასრულების ფოტო</h3>
            <div style={{ marginTop: '0.5rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <img
                src={order.completionAttachment.url}
                alt="completion"
                style={{ width: '100%', display: 'block', maxHeight: '300px', objectFit: 'contain', background: '#0a0a0c' }}
              />
            </div>
          </section>
        )}
      </div>

      {/* Action buttons workflow */}
      {!readOnly && order.status !== ORDER_STATUS.COMPLETED && (
        <div className="dev-app__actions" style={{ padding: '1rem', background: 'var(--color-paper-deep)', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* 1. If not confirmed */}
          {!order.confirmedAt && (
            <button
              type="button"
              className="btn btn--primary btn--lg dev-app__action-btn"
              onClick={handleConfirm}
              disabled={submitting}
              style={{ width: '100%' }}
            >
              {submitting ? <Loader2 size={18} className="dev-app__spin animate-spin" /> : <CheckSquare size={18} />}
              დავალების დადასტურება
            </button>
          )}

          {/* 2. If confirmed but not arrived */}
          {order.confirmedAt && !order.arrivedAt && (
            <button
              type="button"
              className="btn btn--primary btn--lg dev-app__action-btn"
              onClick={handleArrive}
              disabled={submitting}
              style={{ width: '100%' }}
            >
              {submitting ? <Loader2 size={18} className="dev-app__spin animate-spin" /> : <MapPin size={18} />}
              ადგილზე მისვლა
            </button>
          )}

          {/* 3. If arrived but not started */}
          {order.arrivedAt && !order.startedAt && (
            <button
              type="button"
              className="btn btn--primary btn--lg dev-app__action-btn"
              onClick={handleStart}
              disabled={submitting}
              style={{ width: '100%' }}
            >
              {submitting ? <Loader2 size={18} className="dev-app__spin animate-spin" /> : <Play size={18} />}
              სამუშაოს დაწყება
            </button>
          )}

          {/* 4. If in progress, upload completion image */}
          {order.status === ORDER_STATUS.IN_PROGRESS && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
              <div style={{
                border: '2px dashed var(--color-border-strong)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                textAlign: 'center',
                background: 'var(--color-navy-soft)',
                position: 'relative',
                cursor: 'pointer'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    opacity: 0, cursor: 'pointer'
                  }}
                  disabled={submitting}
                />
                <Camera size={24} style={{ color: 'var(--color-royal)', marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>
                  {completionFile ? completionFile.name : 'გადაიღე/ატვირთე დასრულების ფოტო'}
                </p>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>ფოტო აუცილებელია დასრულებისთვის</span>
              </div>

              {completionPreview && (
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)', height: '120px' }}>
                  <img src={completionPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <button
                type="button"
                className="btn btn--primary btn--lg dev-app__action-btn"
                onClick={handleCompleteSubmit}
                disabled={submitting || !completionFile}
                style={{ width: '100%' }}
              >
                {submitting ? <Loader2 size={18} className="dev-app__spin animate-spin" /> : <CheckCircle2 size={18} />}
                დასრულება და გაგზავნა
              </button>
            </div>
          )}

          {/* 5. If waiting manager approval */}
          {order.status === ORDER_STATUS.WAITING_APPROVAL && (
            <div style={{
              background: 'rgba(0, 255, 102, 0.05)',
              border: '1px solid var(--color-royal)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              fontSize: '0.9rem',
              color: 'var(--color-royal)'
            }}>
              სამუშაო გაგზავნილია მენეჯერთან შესამოწმებლად. გთხოვთ დაელოდოთ დადასტურებას.
            </div>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle />
          <button type="button" className="dev-app__logout" onClick={logout} aria-label="გასვლა">
            <LogOut size={18} />
          </button>
        </div>
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
