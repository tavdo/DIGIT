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
  ORDER_PRIORITY_LABELS,
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
  const [review, setReview] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await submitOrderRating(order.id, order.assignedDeveloperId, { rating, review })
      onRated()
    } catch (err) {
      onError(err.message || 'შეფასება ვერ ჩაიწერა.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="my-request__rating" onSubmit={handleSubmit}>
      <p className="my-request__rating-label">შეაფასე შემსრულებელი:</p>
      <div className="my-request__stars">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className={`my-request__star ${rating >= value ? 'my-request__star--active' : ''}`}
            onClick={() => setRating(value)}
            aria-label={`${value} ვარსკვლავი`}
          >
            <Star size={20} />
          </button>
        ))}
      </div>
      <textarea
        className="my-request__review"
        rows={2}
        placeholder="კომენტარი (არასავალდებულო)"
        value={review}
        onChange={(e) => setReview(e.target.value)}
        disabled={submitting}
      />
      <button type="submit" className="btn btn--primary btn--sm" disabled={submitting}>
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
            {formatOrderDate(order.createdAt)} ·{' '}
            {ORDER_PRIORITY_LABELS[order.priority] ?? order.priority}
          </p>
        </div>
        <span className={`order-badge order-badge--${order.status}`}>
          {ORDER_STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <p className="my-request__description">{order.description}</p>

      <OrderAttachments attachments={order.attachments} />

      {order.price != null && order.status !== ORDER_STATUS.NEW && (
        <p className="my-request__price">
          შეთავაზებული ფასი: <strong>{formatOrderAmount(order.price)}</strong>
        </p>
      )}

      {order.assignedDeveloperName && (
        <p className="my-request__developer">
          შემსრულებელი: <strong>{order.assignedDeveloperName}</strong>
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
        <p className="my-request__rated">
          შენი შეფასება: {'★'.repeat(order.customerRating)}
        </p>
      )}
    </article>
  )
}

function MyRequests() {
  usePageMeta(pageTitle('ჩემი მოთხოვნები'), 'DIGIT — შენი მოთხოვნების სტატუსი.')

  const { user, isFirebaseConfigured } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.uid || !isFirebaseConfigured) {
      setLoading(false)
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
