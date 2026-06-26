import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  History,
  Loader2,
  LogOut,
  Pencil,
  Play,
  Save,
  User,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  formatExperienceCategories,
  formatExperienceYears,
  validateDeveloperCv,
} from '../utils/developerProfile'
import {
  formatDeveloperRating,
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
import { updateDeveloperProfile } from '../services/userService'
import DeveloperCvFields from '../components/DeveloperCvFields'
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
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState(userProfile?.bio || '')
  const [experienceCategories, setExperienceCategories] = useState(
    userProfile?.experienceCategories || [],
  )
  const [experienceYears, setExperienceYears] = useState(userProfile?.experienceYears || '')
  const [fieldErrors, setFieldErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    const errors = validateDeveloperCv({ bio, experienceCategories, experienceYears })
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
    try {
      await updateDeveloperProfile(user.uid, {
        bio: bio.trim(),
        experienceCategories,
        experienceYears,
      })
      setEditing(false)
    } catch (err) {
      onError(err.message || 'პროფილის შენახვა ვერ მოხერხდა.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="dev-app__screen dev-app__screen--profile">
      <div className="dev-profile-card">
        <div className="dev-profile-card__avatar">
          <User size={32} />
        </div>
        <h2>{userProfile?.name || 'შემსრულებელი'}</h2>
        <p className="dev-profile-card__email">{userProfile?.email || user?.email}</p>
        <p className="dev-profile-card__rating">{formatDeveloperRating(userProfile)}</p>
      </div>

      {!editing ? (
        <div className="dev-profile-view">
          <section className="dev-profile-view__section">
            <div className="dev-profile-view__head">
              <h3>ჩემს შესახებ</h3>
              <button
                type="button"
                className="dev-profile-view__edit"
                onClick={() => setEditing(true)}
              >
                <Pencil size={14} />
                რედაქტირება
              </button>
            </div>
            <p>{userProfile?.bio || 'აღწერა ჯერ არ არის შევსებული.'}</p>
          </section>
          <section className="dev-profile-view__section">
            <h3>გამოცდილება</h3>
            <p>{formatExperienceYears(userProfile?.experienceYears)}</p>
          </section>
          <section className="dev-profile-view__section">
            <h3>კატეგორიები</h3>
            <p>{formatExperienceCategories(userProfile?.experienceCategories)}</p>
          </section>
        </div>
      ) : (
        <form className="dev-profile-edit" onSubmit={handleSave}>
          <DeveloperCvFields
            idPrefix="dev-profile"
            bio={bio}
            onBioChange={setBio}
            experienceCategories={experienceCategories}
            onExperienceCategoriesChange={setExperienceCategories}
            experienceYears={experienceYears}
            onExperienceYearsChange={setExperienceYears}
            fieldErrors={fieldErrors}
            disabled={saving}
          />
          <div className="dev-profile-edit__actions">
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              გაუქმება
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? <Loader2 size={16} className="dev-app__spin" /> : <Save size={16} />}
              შენახვა
            </button>
          </div>
        </form>
      )}
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
