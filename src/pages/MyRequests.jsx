import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Plus, Star, XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import FirebaseSetupNotice from '../components/FirebaseSetupNotice'
import usePageMeta from '../hooks/usePageMeta'
import { pageTitle } from '../constants/brand'
import {
  confirmOrderPrice,
  formatOrderAmount,
  formatOrderDate,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  rejectOrderPrice,
  submitOrderRating,
  subscribeToCustomerOrders,
} from '../services/orderService'
import OrderAttachments from '../components/OrderAttachments'
import './MyRequests.css'

function RatingForm({ order, onRated, onError }) {
  const [rating, setRating] = useState(5)
  const [companyRating, setCompanyRating] = useState(5)
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await submitOrderRating(order.id, order.assignedDeveloperId, { rating, companyRating, review })
      onRated()
    } catch (err) {
      onError(err.message || 'შეფასება ვერ ჩაიწერა.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="my-request__rating" onSubmit={handleSubmit} style={{
      background: 'var(--color-navy-soft)',
      border: '1px solid var(--color-border-strong)',
      padding: '1.25rem',
      borderRadius: 'var(--radius-lg)',
      marginTop: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-royal)' }}>დავალება შესრულებულია! გთხოვთ შეაფასოთ:</h4>

      <div>
        <p className="my-request__rating-label" style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>შეაფასე შემსრულებელი ({order.assignedDeveloperName || 'სპეციალისტი'}):</p>
        <div className="my-request__stars" style={{ display: 'flex', gap: '0.25rem' }}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={`my-request__star ${rating >= value ? 'my-request__star--active' : ''}`}
              onClick={() => setRating(value)}
              aria-label={`${value} ვარსკვლავი`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: rating >= value ? '#ffd700' : 'var(--color-muted)' }}
            >
              <Star size={20} fill={rating >= value ? '#ffd700' : 'none'} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="my-request__rating-label" style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>შეაფასე კომპანია:</p>
        <div className="my-request__stars" style={{ display: 'flex', gap: '0.25rem' }}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={`my-request__star ${companyRating >= value ? 'my-request__star--active' : ''}`}
              onClick={() => setCompanyRating(value)}
              aria-label={`${value} ვარსკვლავი`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: companyRating >= value ? '#ffd700' : 'var(--color-muted)' }}
            >
              <Star size={20} fill={companyRating >= value ? '#ffd700' : 'none'} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="my-request__rating-label" style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>დატოვე კომენტარი შესრულებულ დავალებაზე:</p>
        <textarea
          className="my-request__review"
          rows={3}
          placeholder="კომენტარი (არასავალდებულო)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          disabled={submitting}
          style={{
            width: '100%',
            background: 'var(--color-paper)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-color)',
            padding: '0.5rem',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>

      <button type="submit" className="btn btn--primary btn--sm" disabled={submitting} style={{ alignSelf: 'flex-start' }}>
        შეფასების გაგზავნა
      </button>
    </form>
  )
}

function RequestCard({ order, onError }) {
  const [acting, setActing] = useState(false)

  const handleConfirm = async () => {
    setActing(true)
    try {
      await confirmOrderPrice(order.id)
    } catch (err) {
      onError(err.message || 'დადასტურება ვერ მოხერხდა.')
    } finally {
      setActing(false)
    }
  }

  const handleReject = async () => {
    setActing(true)
    try {
      await rejectOrderPrice(order.id)
    } catch (err) {
      onError(err.message || 'უარყოფა ვერ მოხერხდა.')
    } finally {
      setActing(false)
    }
  }

  return (
    <article className="my-request">
      <div className="my-request__header">
        <div>
          <h2 className="my-request__title">{order.serviceType}</h2>
          <p className="my-request__meta">
            {formatOrderDate(order.createdAt)}
          </p>
        </div>
        <span className={`order-badge order-badge--${order.status}`}>
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <p className="my-request__description">{order.description}</p>

      <OrderAttachments attachments={order.attachments} />

      {order.price != null && order.status !== ORDER_STATUS.NEW && (
        <div className="my-request__price-box" style={{
          background: 'var(--color-navy-soft)',
          border: '1px solid var(--color-border)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          margin: '1rem 0'
        }}>
          <p className="my-request__price" style={{ margin: 0 }}>
            შეთავაზებული ფასი: <strong>{formatOrderAmount(order.price)}</strong>
          </p>
          {order.priceExplanation && (
            <p className="my-request__price-explanation" style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--color-muted)' }}>
              რატომ ჯდება ეს ფასი: <em>{order.priceExplanation}</em>
            </p>
          )}
        </div>
      )}

      {order.assignedDeveloperName && (
        <p className="my-request__developer">
          შემსრულებელი:{' '}
          {order.assignedDeveloperId ? (
            <Link to={`/specialists/${order.assignedDeveloperId}`}>
              <strong>{order.assignedDeveloperName}</strong>
            </Link>
          ) : (
            <strong>{order.assignedDeveloperName}</strong>
          )}
        </p>
      )}

      {order.status === ORDER_STATUS.QUOTE_OFFERED && (
        <div className="my-request__actions">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={handleConfirm}
            disabled={acting}
          >
            <CheckCircle2 size={16} />
            ფასს ვეთანხმები
          </button>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={handleReject}
            disabled={acting}
          >
            <XCircle size={16} />
            უარი
          </button>
        </div>
      )}

      {order.status === ORDER_STATUS.COMPLETED && order.customerRating == null && (
        <RatingForm order={order} onRated={() => {}} onError={onError} />
      )}

      {order.customerRating != null && (
        <div className="my-request__rated" style={{
          background: 'var(--color-navy-soft)',
          border: '1px solid var(--color-border)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginTop: '1rem',
          fontSize: '0.9rem'
        }}>
          <p style={{ margin: '0 0 0.25rem 0' }}>შენი შეფასება სპეციალისტს: <strong>{'★'.repeat(order.customerRating)}</strong></p>
          {order.companyRating != null && (
            <p style={{ margin: '0 0 0.25rem 0' }}>შენი შეფასება კომპანიას: <strong>{'★'.repeat(order.companyRating)}</strong></p>
          )}
          {order.customerReview && (
            <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--color-muted)' }}>"{order.customerReview}"</p>
          )}
        </div>
      )}
    </article>
  )
}

function MyRequests() {
  usePageMeta(pageTitle('ჩემი მოთხოვნები'), 'DIGIT — შენი მოთხოვნების სტატუსი.')

  const { user, isFirebaseConfigured } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(() => !!(user?.uid && isFirebaseConfigured))
  const [error, setError] = useState('')

  const [prevUserUid, setPrevUserUid] = useState(user?.uid)
  const [prevFirebaseConfigured, setPrevFirebaseConfigured] = useState(isFirebaseConfigured)

  if (user?.uid !== prevUserUid || isFirebaseConfigured !== prevFirebaseConfigured) {
    setPrevUserUid(user?.uid)
    setPrevFirebaseConfigured(isFirebaseConfigured)
    if (!user?.uid || !isFirebaseConfigured) {
      setLoading(false)
    } else {
      setLoading(true)
    }
  }

  useEffect(() => {
    if (!user?.uid || !isFirebaseConfigured) {
      return undefined
    }

    const unsubscribe = subscribeToCustomerOrders(
      user.uid,
      (list) => {
        setOrders(list)
        setLoading(false)
      },
      (err) => {
        setError(err.message || 'მოთხოვნების ჩატვირთვა ვერ მოხერხდა.')
        setLoading(false)
      },
    )

    return unsubscribe
  }, [user?.uid, isFirebaseConfigured])

  return (
    <>
      <section className="page-hero page-hero--compact">
        <div className="container">
          <h1 className="page-hero__title">ჩემი მოთხოვნები</h1>
          <p className="page-hero__text">აკონტროლე შენი თიქეტების სტატუსი და ფასის დადასტურება.</p>
        </div>
      </section>

      <div className="page my-requests-page">
        <div className="container">
          {!isFirebaseConfigured && <FirebaseSetupNotice />}
          {error && <div className="my-requests-page__error">{error}</div>}

          <div className="my-requests-page__toolbar">
            <Link to="/contact" className="btn btn--primary">
              <Plus size={18} />
              ახალი მოთხოვნა
            </Link>
          </div>

          {loading ? (
            <p className="my-requests-page__empty">იტვირთება...</p>
          ) : orders.length === 0 ? (
            <div className="my-requests-page__empty">
              <p>მოთხოვნები ჯერ არ გაქვს.</p>
              <Link to="/contact" className="btn btn--outline">
                გამოიძახე დახმარება
              </Link>
            </div>
          ) : (
            <div className="my-requests-list">
              {orders.map((order) => (
                <RequestCard key={order.id} order={order} onError={setError} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default MyRequests
