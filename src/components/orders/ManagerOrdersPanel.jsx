import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Banknote,
  RefreshCw,
  Save,
  Send,
  StickyNote,
  UserCheck,
  Wallet,
} from 'lucide-react'
import OrderAttachments from '../OrderAttachments'
import {
  addOrderNote,
  assignDeveloperToOrder,
  canAssignDeveloper,
  canOfferPrice,
  filterOrdersByCompensation,
  formatDeveloperRating,
  formatOrderAmount,
  formatOrderDate,
  formatOrderNoteTime,
  offerOrderPrice,
  ORDER_PRIORITY_LABELS,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  parseOrderAmountInput,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYOUT_STATUS,
  PAYOUT_STATUS_LABELS,
  resolvePaymentStatus,
  resolvePayoutStatus,
  subscribeToDevelopers,
  subscribeToOrder,
  subscribeToOrders,
  updateOrderCompensation,
  updateOrderPaymentStatus,
  updateOrderPayoutStatus,
  updateOrderStatus,
} from '../../services/orderService'
import { MAX_NOTE_LENGTH, validateMessageLength } from '../../utils/validation'
import './ManagerOrdersPanel.css'

const STATUS_FILTERS = [
  { value: 'all', label: 'ყველა' },
  { value: ORDER_STATUS.NEW, label: ORDER_STATUS_LABELS.new },
  { value: ORDER_STATUS.QUOTE_OFFERED, label: ORDER_STATUS_LABELS.quote_offered },
  { value: ORDER_STATUS.QUOTE_CONFIRMED, label: ORDER_STATUS_LABELS.quote_confirmed },
  { value: ORDER_STATUS.ASSIGNED, label: ORDER_STATUS_LABELS.assigned },
  { value: ORDER_STATUS.IN_PROGRESS, label: ORDER_STATUS_LABELS.in_progress },
  { value: ORDER_STATUS.COMPLETED, label: ORDER_STATUS_LABELS.completed },
]

// TODO: ნამდვილი გადახდის ინტეგრაცია (Stripe ან მსგავსი) მომავალში — ხელით ფილტრაცია paymentStatus/payoutStatus-ით.
const COMPENSATION_FILTERS = [
  { value: 'all', label: 'ყველა გადახდა' },
  { value: 'payment_unpaid', label: 'გადასახდელი' },
  { value: 'payment_paid', label: 'ბიზნესისგან მიღებული' },
  { value: 'payout_pending', label: 'ანაზღაურება მოლოდინში' },
  { value: 'payout_paid', label: 'დეველოპერს გადარიცხული' },
]

const MANUAL_STATUS_OPTIONS = [
  ORDER_STATUS.IN_PROGRESS,
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.CANCELLED,
]

function PaymentStatusBadge({ order }) {
  const status = resolvePaymentStatus(order)
  return (
    <span className={`comp-badge comp-badge--payment-${status}`}>
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  )
}

function PayoutStatusBadge({ order }) {
  if (order.developerPayout == null || order.developerPayout <= 0) return null
  const status = resolvePayoutStatus(order)
  return (
    <span className={`comp-badge comp-badge--payout-${status}`}>
      {PAYOUT_STATUS_LABELS[status]}
    </span>
  )
}

function OrderDetail({ orderId, managerName, onError, onMissing }) {
  const [order, setOrder] = useState(null)
  const [orderLoaded, setOrderLoaded] = useState(false)
  const [developers, setDevelopers] = useState([])
  const [selectedDeveloperId, setSelectedDeveloperId] = useState('')
  const [noteText, setNoteText] = useState('')
  const [statusValue, setStatusValue] = useState('')
  const [priceInput, setPriceInput] = useState('')
  const [payoutInput, setPayoutInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!orderId) return undefined

    const unsubscribe = subscribeToOrder(
      orderId,
      (data) => {
        setOrder(data)
        setOrderLoaded(true)
        if (!data) {
          onMissing?.()
          return
        }
        setStatusValue(data.status ?? '')
        setSelectedDeveloperId(data.assignedDeveloperId ?? '')
        setPriceInput(data.price != null ? String(data.price) : '')
        setPayoutInput(data.developerPayout != null ? String(data.developerPayout) : '')
      },
      (err) => onError(err.message || 'შეკვეთის ჩატვირთვა ვერ მოხერხდა.'),
    )

    return unsubscribe
  }, [orderId, onError, onMissing])

  useEffect(() => {
    const unsubscribe = subscribeToDevelopers(setDevelopers, (err) =>
      onError(err.message || 'დეველოპერების ჩატვირთვა ვერ მოხერხდა.'),
    )
    return unsubscribe
  }, [onError])

  const handleOfferPrice = async () => {
    if (!orderId) return

    setSubmitting(true)
    try {
      const price = parseOrderAmountInput(priceInput)
      await offerOrderPrice(orderId, price)
    } catch (err) {
      onError(err.message || 'ფასის შეთავაზება ვერ მოხერხდა.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAssign = async () => {
    if (!orderId || !selectedDeveloperId) return
    const developer = developers.find((d) => d.id === selectedDeveloperId)
    if (!developer) return

    setSubmitting(true)
    try {
      await assignDeveloperToOrder(orderId, {
        developerId: developer.id,
        developerName: developer.name || developer.email,
      })
    } catch (err) {
      onError(err.message || 'დეველოპერის მინიჭება ვერ მოხერხდა.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async () => {
    if (!orderId || !statusValue || statusValue === order?.status) return

    setSubmitting(true)
    try {
      await updateOrderStatus(orderId, statusValue)
    } catch (err) {
      onError(err.message || 'სტატუსის განახლება ვერ მოხერხდა.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveCompensation = async () => {
    if (!orderId) return

    setSubmitting(true)
    try {
      const price = parseOrderAmountInput(priceInput)
      const developerPayout = parseOrderAmountInput(payoutInput)
      await updateOrderCompensation(orderId, { price, developerPayout })
    } catch (err) {
      onError(err.message || 'ანაზღაურების განახლება ვერ მოხერხდა.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTogglePaymentStatus = async () => {
    if (!orderId || !order) return
    const nextStatus =
      resolvePaymentStatus(order) === PAYMENT_STATUS.PAID
        ? PAYMENT_STATUS.UNPAID
        : PAYMENT_STATUS.PAID

    setSubmitting(true)
    try {
      await updateOrderPaymentStatus(orderId, nextStatus)
    } catch (err) {
      onError(err.message || 'გადახდის სტატუსის განახლება ვერ მოხერხდა.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleTogglePayoutStatus = async () => {
    if (!orderId || !order) return
    const nextStatus =
      resolvePayoutStatus(order) === PAYOUT_STATUS.PAID
        ? PAYOUT_STATUS.PENDING
        : PAYOUT_STATUS.PAID

    setSubmitting(true)
    try {
      await updateOrderPayoutStatus(orderId, nextStatus)
    } catch (err) {
      onError(err.message || 'ანაზღაურების სტატუსის განახლება ვერ მოხერხდა.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    const trimmed = noteText.trim()
    const lengthError = validateMessageLength(trimmed, MAX_NOTE_LENGTH)
    if (!orderId || !trimmed || lengthError) {
      if (lengthError) onError(lengthError)
      return
    }

    setSubmitting(true)
    try {
      await addOrderNote(orderId, {
        text: trimmed,
        authorName: managerName,
      })
      setNoteText('')
    } catch (err) {
      onError(err.message || 'შენიშვნის დამატება ვერ მოხერხდა.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!orderLoaded) {
    return <div className="orders-detail__empty">იტვირთება...</div>
  }

  if (!order) {
    return (
      <div className="orders-detail__empty">
        შეკვეთა აღარ არსებობს ან წაშლილია.
      </div>
    )
  }

  const notes = [...(order.managerNotes || [])].reverse()

  return (
    <div className="orders-detail">
      <div className="orders-detail__header">
        <div>
          <h2 className="orders-detail__title">{order.customerName}</h2>
          <p className="orders-detail__meta">{order.serviceType}</p>
        </div>
        <div className="orders-detail__badges-row">
          <span className={`priority-badge priority-badge--${order.priority}`}>
            {ORDER_PRIORITY_LABELS[order.priority] ?? order.priority}
          </span>
          <span className={`order-badge order-badge--${order.status}`}>
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>
      </div>

      <section className="orders-detail__section">
        <h3 className="orders-detail__section-title">აღწერა</h3>
        <p className="orders-detail__description">{order.description}</p>
        <OrderAttachments attachments={order.attachments} />
        <p className="orders-detail__meta">
          შექმნილია: {formatOrderDate(order.createdAt)}
          {order.assignedDeveloperName && (
            <>
              {' '}
              · შემსრულებელი:{' '}
              {order.assignedDeveloperId ? (
                <Link to={`/specialists/${order.assignedDeveloperId}`} className="orders-detail__dev-link">
                  {order.assignedDeveloperName}
                </Link>
              ) : (
                order.assignedDeveloperName
              )}
            </>
          )}
        </p>
      </section>

      <section className="orders-detail__section orders-detail__section--compensation">
        <h3 className="orders-detail__section-title">ფასის შეთავაზება</h3>
        <p className="orders-detail__hint">
          დააფიქსირე ფასი და გაუგზავნე ბიზნესს დადასტურებისთვის.
        </p>

        <div className="orders-detail__comp-grid">
          <label className="orders-detail__field">
            <span className="orders-detail__field-label">ფასი ბიზნესისთვის (₾)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="orders-detail__input"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              disabled={submitting}
              placeholder="0.00"
            />
          </label>
          <label className="orders-detail__field">
            <span className="orders-detail__field-label">შემსრულებლის ანაზღაურება (₾)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="orders-detail__input"
              value={payoutInput}
              onChange={(e) => setPayoutInput(e.target.value)}
              disabled={submitting}
              placeholder="0.00"
            />
          </label>
        </div>

        <div className="orders-detail__row orders-detail__row--actions">
          {canOfferPrice(order) && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={handleOfferPrice}
              disabled={submitting || !priceInput.trim()}
            >
              <Send size={16} />
              ფასის შეთავაზება
            </button>
          )}
          <button
            type="button"
            className="btn btn--outline btn--sm orders-detail__save-comp"
            onClick={handleSaveCompensation}
            disabled={submitting}
          >
            <Save size={16} />
            თანხების შენახვა
          </button>
        </div>

        {order.price != null && (
          <p className="orders-detail__meta orders-detail__meta--saved">
            შეთავაზებული ფასი: {formatOrderAmount(order.price)}
            {order.developerPayout != null && (
              <> · ანაზღაურება {formatOrderAmount(order.developerPayout)}</>
            )}
          </p>
        )}

        <div className="orders-detail__badges">
          <PaymentStatusBadge order={order} />
          <PayoutStatusBadge order={order} />
        </div>

        <div className="orders-detail__toggles">
          <button
            type="button"
            className={`orders-detail__toggle ${resolvePaymentStatus(order) === PAYMENT_STATUS.PAID ? 'orders-detail__toggle--active' : ''}`}
            onClick={handleTogglePaymentStatus}
            disabled={submitting}
          >
            <Banknote size={14} />
            ბიზნესისგან მიღებულია გადახდა
          </button>
          <button
            type="button"
            className={`orders-detail__toggle ${resolvePayoutStatus(order) === PAYOUT_STATUS.PAID ? 'orders-detail__toggle--active' : ''}`}
            onClick={handleTogglePayoutStatus}
            disabled={submitting}
          >
            <Wallet size={14} />
            შემსრულებლისთვის გადარიცხულია
          </button>
        </div>
      </section>

      <section className="orders-detail__section">
        <h3 className="orders-detail__section-title">შემსრულებლის მინიჭება</h3>
        {!canAssignDeveloper(order) && order.status !== ORDER_STATUS.ASSIGNED && (
          <p className="orders-detail__hint">
            მინიჭება შესაძლებელია მხოლოდ ფასის დადასტურების შემდეგ.
          </p>
        )}
        <div className="orders-detail__row">
          <select
            className="orders-detail__select"
            value={selectedDeveloperId}
            onChange={(e) => setSelectedDeveloperId(e.target.value)}
            disabled={submitting || !canAssignDeveloper(order)}
          >
            <option value="">აირჩიე შემსრულებელი</option>
            {developers.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.name || dev.email} — {formatDeveloperRating(dev)}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={handleAssign}
            disabled={submitting || !selectedDeveloperId || !canAssignDeveloper(order)}
          >
            <UserCheck size={16} />
            მინიჭება
          </button>
        </div>
        <ul className="orders-detail__dev-list">
          {developers.map((dev) => (
            <li key={dev.id}>
              <Link to={`/specialists/${dev.id}`} className="orders-detail__dev-link">
                {dev.name || dev.email}
              </Link>
              <span className="orders-detail__dev-rating">{formatDeveloperRating(dev)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="orders-detail__section">
        <h3 className="orders-detail__section-title">სტატუსის ცვლილება</h3>
        <div className="orders-detail__row">
          <select
            className="orders-detail__select"
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value)}
            disabled={submitting}
          >
            <option value={ORDER_STATUS.NEW}>{ORDER_STATUS_LABELS.new}</option>
            <option value={ORDER_STATUS.QUOTE_OFFERED}>{ORDER_STATUS_LABELS.quote_offered}</option>
            <option value={ORDER_STATUS.QUOTE_CONFIRMED}>{ORDER_STATUS_LABELS.quote_confirmed}</option>
            <option value={ORDER_STATUS.ASSIGNED}>{ORDER_STATUS_LABELS.assigned}</option>
            {MANUAL_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={handleStatusChange}
            disabled={submitting || statusValue === order.status}
          >
            <RefreshCw size={16} />
            განახლება
          </button>
        </div>
      </section>

      <section className="orders-detail__section">
        <h3 className="orders-detail__section-title">შიდა შენიშვნები</h3>
        <form className="orders-detail__note-form" onSubmit={handleAddNote}>
          <textarea
            className="orders-detail__textarea"
            rows={3}
            placeholder="ახალი შენიშვნა (მხოლოდ მენეჯერისთვის)..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            disabled={submitting}
            maxLength={MAX_NOTE_LENGTH}
          />
          <button
            type="submit"
            className="btn btn--primary btn--sm"
            disabled={submitting || !noteText.trim()}
          >
            <StickyNote size={16} />
            შენიშვნის დამატება
          </button>
        </form>

        {notes.length === 0 ? (
          <p className="orders-detail__empty-notes">შენიშვნები ჯერ არ არის.</p>
        ) : (
          <ul className="orders-notes">
            {notes.map((note, index) => (
              <li key={`${note.createdAt?.seconds ?? index}-${index}`} className="orders-note">
                <p>{note.text}</p>
                <span>
                  {note.authorName} · {formatOrderNoteTime(note.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function ManagerOrdersPanel({ managerName, initialOrderId, onError }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [compensationFilter, setCompensationFilter] = useState('all')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrderId ?? null)

  const visibleOrders = useMemo(
    () => filterOrdersByCompensation(orders, compensationFilter),
    [orders, compensationFilter],
  )

  const handleOrderMissing = useCallback(() => {
    setSelectedOrderId(null)
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToOrders(
      statusFilter,
      (list) => {
        setOrders(list)
        setLoading(false)
        setSelectedOrderId((prev) => {
          if (initialOrderId && list.some((order) => order.id === initialOrderId)) {
            return initialOrderId
          }
          if (prev && list.some((order) => order.id === prev)) return prev
          return list[0]?.id ?? null
        })
      },
      (err) => {
        onError(err.message || 'შეკვეთების ჩატვირთვა ვერ მოხერხდა.')
        setLoading(false)
      },
    )

    return unsubscribe
  }, [statusFilter, initialOrderId, onError])

  useEffect(() => {
    setSelectedOrderId((prev) => {
      if (prev && visibleOrders.some((order) => order.id === prev)) return prev
      return visibleOrders[0]?.id ?? null
    })
  }, [visibleOrders])

  return (
    <div className="orders-panel">
      <aside className="orders-panel__list">
        <div className="orders-panel__filter-bar">
          <label className="orders-panel__filter-field">
            <span className="orders-panel__filter-label">სტატუსი</span>
            <select
              className="orders-panel__filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setLoading(true)
              }}
              aria-label="სტატუსის ფილტრი"
            >
              {STATUS_FILTERS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="orders-panel__filter-field">
            <span className="orders-panel__filter-label">გადახდა</span>
            <select
              className="orders-panel__filter-select"
              value={compensationFilter}
              onChange={(e) => setCompensationFilter(e.target.value)}
              aria-label="გადახდის ფილტრი"
            >
              {COMPENSATION_FILTERS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="orders-panel__items">
          {loading ? (
            <p className="dashboard-list__empty">იტვირთება...</p>
          ) : visibleOrders.length === 0 ? (
            <p className="dashboard-list__empty">შეკვეთები არ არის.</p>
          ) : (
            visibleOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                className={`orders-item ${selectedOrderId === order.id ? 'orders-item--active' : ''}`}
                onClick={() => setSelectedOrderId(order.id)}
              >
                <div className="orders-item__top">
                  <span className="orders-item__name">{order.customerName}</span>
                  <span className={`priority-badge priority-badge--${order.priority}`}>
                    {ORDER_PRIORITY_LABELS[order.priority] ?? ''}
                  </span>
                </div>
                <div className="orders-item__top">
                  <span className={`order-badge order-badge--${order.status}`}>
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                <div className="orders-item__badges">
                  <PaymentStatusBadge order={order} />
                  <PayoutStatusBadge order={order} />
                </div>
                <p className="orders-item__service">{order.serviceType}</p>
                <p className="orders-item__meta">
                  {order.assignedDeveloperName
                    ? `დეველოპერი: ${order.assignedDeveloperName}`
                    : 'დეველოპერი არ არის მინიჭებული'}
                  {order.price != null && <> · {formatOrderAmount(order.price)}</>}
                </p>
              </button>
            ))
          )}
        </div>
      </aside>

      <main className="orders-panel__detail">
        {!selectedOrderId ? (
          <div className="orders-detail__empty">აირჩიეთ შეკვეთა სიიდან</div>
        ) : (
          <OrderDetail
            key={selectedOrderId}
            orderId={selectedOrderId}
            managerName={managerName}
            onError={onError}
            onMissing={handleOrderMissing}
          />
        )}
      </main>
    </div>
  )
}

export default ManagerOrdersPanel
