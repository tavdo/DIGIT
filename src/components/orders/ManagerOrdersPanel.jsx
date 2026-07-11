import { useEffect, useState } from 'react'
import {
  subscribeToOrders,
  subscribeToDevelopers,
  updateOrderCompensation,
  updateOrderPaymentStatus,
  updateOrderPayoutStatus,
  assignDeveloperToOrder,
  updateOrderStatus,
  addOrderNote,
  formatOrderDate,
  formatOrderNoteTime,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYOUT_STATUS,
  PAYOUT_STATUS_LABELS,
  offerOrderPrice,
  approveOrderCompletion,
} from '../../services/orderService'
import OrderAttachments from '../OrderAttachments'
import {
  Loader2,
  Send,
  User,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  Clock,
} from 'lucide-react'

const ACTIVE_STATUSES = [
  ORDER_STATUS.NEW,
  ORDER_STATUS.QUOTE_OFFERED,
  ORDER_STATUS.QUOTE_CONFIRMED,
  ORDER_STATUS.ASSIGNED,
  ORDER_STATUS.IN_PROGRESS,
  ORDER_STATUS.WAITING_APPROVAL,
]

export default function ManagerOrdersPanel({ managerName, onError }) {
  const [orders, setOrders] = useState([])
  const [developers, setDevelopers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [filterType, setFilterType] = useState('active') // 'active' | 'completed' | 'all'

  // Pricing form state
  const [priceInput, setPriceInput] = useState('')
  const [priceExplanationInput, setPriceExplanationInput] = useState('')
  const [payoutInput, setPayoutInput] = useState('')
  const [compensationSaving, setCompensationSaving] = useState(false)

  // Assignment state
  const [selectedDevId, setSelectedDevId] = useState('')
  const [assignedDeveloperCommentInput, setAssignedDeveloperCommentInput] = useState('')
  const [assigning, setAssigning] = useState(false)

  // Note state
  const [noteText, setNoteText] = useState('')
  const [noteAdding, setNoteAdding] = useState(false)

  // Status updating state
  const [statusUpdating, setStatusUpdating] = useState(false)

  const [prevOnError, setPrevOnError] = useState(() => onError)
  if (onError !== prevOnError) {
    setPrevOnError(() => onError)
    setLoading(true)
  }

  useEffect(() => {
    const unsubscribeOrders = subscribeToOrders(
      'all',
      (data) => {
        setOrders(data)
        setLoading(false)
      },
      (err) => {
        onError?.(err.message || 'შეკვეთების ჩატვირთვა ვერ მოხერხდა')
        setLoading(false)
      }
    )

    const unsubscribeDevs = subscribeToDevelopers(
      (data) => {
        setDevelopers(data)
      },
      (err) => {
        onError?.(err.message || 'დეველოპერების ჩატვირთვა ვერ მოხერხდა')
      }
    )

    return () => {
      unsubscribeOrders()
      unsubscribeDevs()
    }
  }, [onError])

  // Get currently selected order
  const selectedOrder = orders.find((o) => o.id === selectedOrderId)

  // Sync form inputs when selected order changes during render
  const [prevSelectedOrderId, setPrevSelectedOrderId] = useState(null)
  if (selectedOrderId !== prevSelectedOrderId) {
    setPrevSelectedOrderId(selectedOrderId)
    if (selectedOrder) {
      setPriceInput(selectedOrder.price != null ? String(selectedOrder.price) : '')
      setPriceExplanationInput(selectedOrder.priceExplanation || '')
      setPayoutInput(
        selectedOrder.developerPayout != null ? String(selectedOrder.developerPayout) : ''
      )
      setSelectedDevId(selectedOrder.assignedDeveloperId || '')
      setAssignedDeveloperCommentInput(selectedOrder.assignedDeveloperComment || '')
    }
  }

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    if (filterType === 'active') return ACTIVE_STATUSES.includes(order.status)
    if (filterType === 'completed') return order.status === ORDER_STATUS.COMPLETED
    return true
  })

  // Handle compensation submit
  const handleUpdateCompensation = async (e) => {
    e.preventDefault()
    if (!selectedOrder) return

    setCompensationSaving(true)
    try {
      const price = parseFloat(priceInput) || 0
      const developerPayout = parseFloat(payoutInput) || 0
      await updateOrderCompensation(selectedOrder.id, { price, developerPayout })
    } catch (err) {
      onError?.(err.message || 'ფასის განახლება ვერ მოხერხდა')
    } finally {
      setCompensationSaving(false)
    }
  }

  // Handle price offer suggestion with explanation text
  const handleOfferPrice = async (e) => {
    e.preventDefault()
    if (!selectedOrder) return

    setCompensationSaving(true)
    try {
      const price = parseFloat(priceInput) || 0
      await offerOrderPrice(selectedOrder.id, price, priceExplanationInput)
    } catch (err) {
      onError?.(err.message || 'ფასის შეთავაზება ვერ მოხერხდა')
    } finally {
      setCompensationSaving(false)
    }
  }

  // Handle developer assign with comment
  const handleAssignDeveloper = async (e) => {
    e.preventDefault()
    if (!selectedOrder || !selectedDevId) return

    const dev = developers.find((d) => d.id === selectedDevId)
    if (!dev) return

    setAssigning(true)
    try {
      await assignDeveloperToOrder(selectedOrder.id, {
        developerId: dev.id,
        developerName: dev.displayName || dev.name || dev.email,
        comment: assignedDeveloperCommentInput,
      })
    } catch (err) {
      onError?.(err.message || 'შემსრულებლის მიბმა ვერ მოხერხდა')
    } finally {
      setAssigning(false)
    }
  }

  // Handle approval of completion
  const handleApproveCompletion = async () => {
    if (!selectedOrder) return
    setStatusUpdating(true)
    try {
      await approveOrderCompletion(selectedOrder.id)
    } catch (err) {
      onError?.(err.message || 'დასრულების დადასტურება ვერ მოხერხდა')
    } finally {
      setStatusUpdating(false)
    }
  }

  // Handle order status update
  const handleUpdateStatus = async (status) => {
    if (!selectedOrder) return
    setStatusUpdating(true)
    try {
      await updateOrderStatus(selectedOrder.id, status)
    } catch (err) {
      onError?.(err.message || 'სტატუსის განახლება ვერ მოხერხდა')
    } finally {
      setStatusUpdating(false)
    }
  }

  // Handle payment/payout status update
  const handleUpdatePaymentStatus = async (status) => {
    if (!selectedOrder) return
    try {
      await updateOrderPaymentStatus(selectedOrder.id, status)
    } catch (err) {
      onError?.(err.message || 'გადახდის სტატუსის განახლება ვერ მოხერხდა')
    }
  }

  const handleUpdatePayoutStatus = async (status) => {
    if (!selectedOrder) return
    try {
      await updateOrderPayoutStatus(selectedOrder.id, status)
    } catch (err) {
      onError?.(err.message || 'ჰონორარის სტატუსის განახლება ვერ მოხერხდა')
    }
  }

  // Handle note submit
  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!selectedOrder || !noteText.trim()) return

    setNoteAdding(true)
    try {
      await addOrderNote(selectedOrder.id, {
        text: noteText.trim(),
        authorName: managerName,
      })
      setNoteText('')
    } catch (err) {
      onError?.(err.message || 'შენიშვნის დამატება ვერ მოხერხდა')
    } finally {
      setNoteAdding(false)
    }
  }

  return (
    <div className="dashboard-body">
      {/* Sidebar Section */}
      <div className="dashboard-sidebar">
        <div className="dashboard-filters">
          <button
            type="button"
            className={`dashboard-filter ${filterType === 'active' ? 'dashboard-filter--active' : ''}`}
            onClick={() => setFilterType('active')}
          >
            აქტიური
          </button>
          <button
            type="button"
            className={`dashboard-filter ${filterType === 'completed' ? 'dashboard-filter--active' : ''}`}
            onClick={() => setFilterType('completed')}
          >
            დასრულებული
          </button>
          <button
            type="button"
            className={`dashboard-filter ${filterType === 'all' ? 'dashboard-filter--active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            ყველა
          </button>
        </div>

        <div className="dashboard-list">
          {loading ? (
            <div className="dashboard-list__empty">
              <Loader2 className="animate-spin" style={{ margin: '0 auto' }} size={20} />
              <p style={{ marginTop: '0.5rem' }}>იტვირთება...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="dashboard-list__empty">შეკვეთები არ არის</div>
          ) : (
            filteredOrders.map((order) => {
              const isActive = order.id === selectedOrderId
              const isOpen = order.status !== ORDER_STATUS.COMPLETED
              return (
                <button
                  key={order.id}
                  type="button"
                  className={`dashboard-conv ${isActive ? 'dashboard-conv--active' : ''}`}
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  <div className="dashboard-conv__top">
                    <span className="dashboard-conv__name">
                      {order.customerName || 'კლიენტი'}
                    </span>
                    <span
                      className={`dashboard-conv__status ${isOpen ? 'dashboard-conv__status--open' : 'dashboard-conv__status--closed'}`}
                    >
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <div className="dashboard-conv__preview">
                    {order.serviceType} &middot; {order.description || 'აღწერის გარეშე'}
                  </div>
                  <div className="dashboard-conv__time">
                    {formatOrderDate(order.createdAt)}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Main Order Details Section */}
      <div className="dashboard-chat">
        {!selectedOrder ? (
          <div className="dashboard-chat__placeholder">
            აირჩიეთ შეკვეთა სიიდან დეტალების სანახავად
          </div>
        ) : (
          <>
            {/* Detail Header */}
            <div className="dashboard-chat__header">
              <div>
                <h2 className="dashboard-chat__title">{selectedOrder.serviceType}</h2>
                <div className="dashboard-chat__meta">
                  შემკვეთი: {selectedOrder.customerName || 'უცნობი'} &middot;
                  სტატუსი: <strong>{ORDER_STATUS_LABELS[selectedOrder.status] || selectedOrder.status}</strong>
                </div>
              </div>
              <div className="dashboard-chat__header-actions">
                {selectedOrder.status === ORDER_STATUS.WAITING_APPROVAL && (
                  <button
                    type="button"
                    className="dashboard-chat__close-btn"
                    style={{ background: 'var(--color-royal)', color: '#000000', fontWeight: 'bold', border: '1px solid var(--color-royal)' }}
                    disabled={statusUpdating}
                    onClick={handleApproveCompletion}
                  >
                    დასრულების დადასტურება
                  </button>
                )}
                {selectedOrder.status !== ORDER_STATUS.COMPLETED && selectedOrder.status !== ORDER_STATUS.WAITING_APPROVAL && (
                  <button
                    type="button"
                    className="dashboard-chat__close-btn"
                    disabled={statusUpdating}
                    onClick={() => handleUpdateStatus(ORDER_STATUS.COMPLETED)}
                  >
                    დასრულებულად მონიშვნა
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable details and logs */}
            <div className="dashboard-chat__messages" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Core Order Info Card */}
              <div className="profile-card" style={{ boxShadow: 'none', margin: 0 }}>
                <h3 className="profile-section__title" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <FileText size={16} /> დეტალური ინფორმაცია
                </h3>
                <p style={{ fontSize: '0.925rem', lineHeight: '1.65', whiteSpace: 'pre-wrap', margin: '0.5rem 0' }}>
                  {selectedOrder.description || 'აღწერის გარეშე'}
                </p>
                <div className="profile-meta" style={{ borderBottom: 'none', paddingBottom: 0, marginTop: '1rem' }}>
                  <div>
                    <dt><Calendar size={12} style={{ display: 'inline', marginRight: '0.25rem' }} /> თარიღი</dt>
                    <dd>{formatOrderDate(selectedOrder.createdAt)}</dd>
                  </div>
                  <div>
                    <dt><AlertCircle size={12} style={{ display: 'inline', marginRight: '0.25rem' }} /> პრიორიტეტი</dt>
                    <dd style={{ textTransform: 'capitalize' }}>{selectedOrder.priority || 'ნორმალური'}</dd>
                  </div>
                </div>

                {/* Attachments */}
                {selectedOrder.attachments?.length > 0 && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                    <OrderAttachments attachments={selectedOrder.attachments} title="მიბმული ფაილები" />
                  </div>
                )}
              </div>

              {/* Performer Completion Photo Section */}
              {selectedOrder.completionAttachment && (
                <div className="profile-card" style={{ boxShadow: 'none', margin: 0, border: '1px solid var(--color-royal)' }}>
                  <h3 className="profile-section__title" style={{ color: 'var(--color-royal)' }}>
                    შემსრულებლის რეპორტი (სამუშაო დასრულებულია)
                  </h3>
                  <div style={{ marginTop: '0.75rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                    <img
                      src={selectedOrder.completionAttachment.url}
                      alt="Completion Proof"
                      style={{ width: '100%', display: 'block', maxHeight: '350px', objectFit: 'contain', background: '#0a0a0c' }}
                    />
                  </div>
                  {selectedOrder.status === ORDER_STATUS.WAITING_APPROVAL && (
                    <button
                      type="button"
                      className="btn btn--accent btn--lg"
                      onClick={handleApproveCompletion}
                      disabled={statusUpdating}
                      style={{ width: '100%', marginTop: '1rem', background: 'var(--color-royal)', color: '#000000', fontWeight: 'bold' }}
                    >
                      დასრულების დადასტურება (მომხმარებელთან გაგზავნა)
                    </button>
                  )}
                </div>
              )}

              {/* Visual Timeline Section */}
              <div className="profile-card" style={{ boxShadow: 'none', margin: 0 }}>
                <h3 className="profile-section__title" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Clock size={16} /> დავალების თაიმლაინი
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  marginTop: '1rem',
                  position: 'relative',
                  paddingLeft: '1.25rem',
                  borderLeft: '2px solid var(--color-border)'
                }}>
                  {[
                    { key: 'createdAt', label: 'პრობლემის გაგზავნა', time: selectedOrder.createdAt },
                    { key: 'priceExplanation', label: 'ფასის შეთავაზება მენეჯერისგან', time: selectedOrder.price != null ? (selectedOrder.quoteConfirmedAt || selectedOrder.updatedAt) : null, extra: selectedOrder.price ? `${selectedOrder.price} ₾` : null },
                    { key: 'quoteConfirmedAt', label: 'ფასის დადასტურება მომხმარებლისგან', time: selectedOrder.quoteConfirmedAt },
                    { key: 'assignedAt', label: 'შემსრულებლის დავალებაზე მიბმა', time: selectedOrder.assignedAt, extra: selectedOrder.assignedDeveloperName },
                    { key: 'viewedAt', label: 'შემსრულებელმა მიიღო/ნახა დავალება', time: selectedOrder.viewedAt },
                    { key: 'confirmedAt', label: 'შემსრულებელმა დაადასტურა დავალება', time: selectedOrder.confirmedAt },
                    { key: 'arrivedAt', label: 'შემსრულებელი მივიდა ადგილზე', time: selectedOrder.arrivedAt },
                    { key: 'startedAt', label: 'შემსრულებელმა დაიწყო მუშაობა', time: selectedOrder.startedAt },
                    { key: 'completedAt', label: 'შემსრულებელმა დაასრულა და გაგზავნა ფოტო', time: selectedOrder.completedAt },
                    { key: 'managerApprovedAt', label: 'მენეჯერმა დაადასტურა შესრულება', time: selectedOrder.managerApprovedAt },
                  ].map((ev, i) => {
                    const hasTime = !!ev.time
                    const formatted = ev.time ? (typeof ev.time.toDate === 'function' ? ev.time.toDate() : new Date(ev.time)).toLocaleString('ka-GE', {
                      hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short'
                    }) : null

                    return (
                      <div key={i} style={{ position: 'relative', opacity: hasTime ? 1 : 0.35 }}>
                        <div style={{
                          position: 'absolute',
                          left: '-26px',
                          top: '5px',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: hasTime ? 'var(--color-royal)' : 'var(--color-slate)',
                          boxShadow: hasTime ? '0 0 8px var(--color-royal)' : 'none'
                        }} />
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{ev.label}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '2px' }}>
                          <span>{ev.extra ? `(${ev.extra})` : ''}</span>
                          <span>{formatted || 'ჯერ არ მომხდარა'}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Price & Payout Management Form */}
              {(selectedOrder.status === ORDER_STATUS.NEW || selectedOrder.status === ORDER_STATUS.QUOTE_REJECTED) ? (
                <div className="profile-card" style={{ boxShadow: 'none', margin: 0 }}>
                  <h3 className="profile-section__title" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <DollarSign size={16} /> საფასურის შეთავაზება კლიენტისთვის
                  </h3>
                  <form onSubmit={handleOfferPrice} className="profile-form" style={{ marginTop: '0.5rem', paddingTop: 0, borderTop: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="profile-form__field">
                      <span>ფასი მომხმარებელს (₾)</span>
                      <input
                        type="number"
                        placeholder="მაგ: 150"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        disabled={compensationSaving}
                        required
                      />
                    </div>
                    <div className="profile-form__field">
                      <span>რატომ ჯდება ეს ფასი? (განმარტება)</span>
                      <textarea
                        rows={2}
                        placeholder="მაგ: მოითხოვს სადენების სრულ გამოცვლას და სპეც. ხელსაწყოების გამოყენებას..."
                        value={priceExplanationInput}
                        onChange={(e) => setPriceExplanationInput(e.target.value)}
                        disabled={compensationSaving}
                        required
                        style={{ width: '100%', background: 'var(--color-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-color)', padding: '0.5rem', fontFamily: 'inherit' }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn--accent btn--sm"
                      disabled={compensationSaving || !priceInput || !priceExplanationInput.trim()}
                      style={{ alignSelf: 'flex-end' }}
                    >
                      {compensationSaving ? 'იგზავნება...' : 'ფასის შეთავაზება'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="profile-card" style={{ boxShadow: 'none', margin: 0 }}>
                  <h3 className="profile-section__title" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <DollarSign size={16} /> ფინანსური მართვა
                  </h3>
                  
                  {selectedOrder.priceExplanation && (
                    <div style={{ fontSize: '0.85rem', marginBottom: '1rem', padding: '0.75rem', background: 'var(--color-navy-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                      <span style={{ fontWeight: 'bold', display: 'block', color: 'var(--color-royal)' }}>ფასის განმარტება:</span>
                      <span style={{ fontStyle: 'italic' }}>"{selectedOrder.priceExplanation}"</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdateCompensation} className="profile-form" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="profile-form__field">
                        <span>კლიენტის ფასი (₾)</span>
                        <input
                          type="number"
                          placeholder="მაგ: 150"
                          value={priceInput}
                          onChange={(e) => setPriceInput(e.target.value)}
                          disabled={compensationSaving}
                        />
                      </div>
                      <div className="profile-form__field">
                        <span>შემსრულებლის ჰონორარი (₾)</span>
                        <input
                          type="number"
                          placeholder="მაგ: 100"
                          value={payoutInput}
                          onChange={(e) => setPayoutInput(e.target.value)}
                          disabled={compensationSaving}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn btn--outline btn--sm"
                      disabled={compensationSaving}
                      style={{ alignSelf: 'flex-end', marginTop: '0.5rem' }}
                    >
                      {compensationSaving ? 'ინახება...' : 'ფასების განახლება'}
                    </button>
                  </form>

                  {/* Payment & Payout dropdown updates */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                    <div className="profile-form__field">
                      <span>გადახდის სტატუსი</span>
                      <select
                        className="admin-table__select"
                        style={{ width: '100%' }}
                        value={selectedOrder.paymentStatus || PAYMENT_STATUS.UNPAID}
                        onChange={(e) => handleUpdatePaymentStatus(e.target.value)}
                      >
                        {Object.entries(PAYMENT_STATUS_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="profile-form__field">
                      <span>ჰონორარის გაცემა</span>
                      <select
                        className="admin-table__select"
                        style={{ width: '100%' }}
                        value={selectedOrder.payoutStatus || PAYOUT_STATUS.PENDING}
                        onChange={(e) => handleUpdatePayoutStatus(e.target.value)}
                      >
                        {Object.entries(PAYOUT_STATUS_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Developer Assignment Section */}
              <div className="profile-card" style={{ boxShadow: 'none', margin: 0 }}>
                <h3 className="profile-section__title" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <User size={16} /> შემსრულებლის მიბმა
                </h3>
                {selectedOrder.assignedDeveloperId ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.9rem' }}>
                        მიბმულია: <strong>{selectedOrder.assignedDeveloperName || 'სახელის გარეშე'}</strong>
                      </div>
                      {selectedOrder.status !== ORDER_STATUS.COMPLETED && (
                        <button
                          type="button"
                          className="btn btn--outline btn--sm"
                          onClick={() => setSelectedDevId('')}
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        >
                          შეცვლა
                        </button>
                      )}
                    </div>
                    {selectedOrder.assignedDeveloperComment && (
                      <div style={{ fontSize: '0.85rem', fontStyle: 'italic', padding: '0.5rem', background: 'var(--color-navy-soft)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginTop: '0.25rem' }}>
                        შემსრულებლის კომენტარი: "{selectedOrder.assignedDeveloperComment}"
                      </div>
                    )}
                  </div>
                ) : null}

                {(!selectedOrder.assignedDeveloperId || selectedDevId === '') && (
                  <form onSubmit={handleAssignDeveloper} className="profile-form" style={{ marginTop: '0.5rem', paddingTop: 0, borderTop: 'none', display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <div className="profile-form__field" style={{ flex: 1 }}>
                        <span>აირჩიეთ დეველოპერი</span>
                        <select
                          className="admin-table__select"
                          style={{ width: '100%' }}
                          value={selectedDevId}
                          onChange={(e) => setSelectedDevId(e.target.value)}
                          disabled={assigning}
                        >
                          <option value="">აირჩიეთ შემსრულებელი</option>
                          {developers.map((dev) => (
                            <option key={dev.id} value={dev.id}>
                              {dev.displayName || dev.name || dev.email}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="btn btn--accent btn--sm"
                        disabled={assigning || !selectedDevId}
                        style={{ height: '38px' }}
                      >
                        მიბმა
                      </button>
                    </div>

                    <div className="profile-form__field">
                      <span>კომენტარი შემსრულებელს (ინსტრუქცია)</span>
                      <textarea
                        rows={2}
                        placeholder="მაგ: შეამოწმე კაბელები, დაზიანება სავარაუდოდ გარეთა კედელზეა..."
                        value={assignedDeveloperCommentInput}
                        onChange={(e) => setAssignedDeveloperCommentInput(e.target.value)}
                        disabled={assigning}
                        style={{ width: '100%', background: 'var(--color-paper)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-color)', padding: '0.5rem', fontFamily: 'inherit' }}
                      />
                    </div>
                  </form>
                )}
              </div>

              {/* Notes / Logs History */}
              <div style={{ marginTop: '1rem' }}>
                <h3 className="profile-section__title">მენეჯერის შენიშვნები</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(!selectedOrder.managerNotes || selectedOrder.managerNotes.length === 0) ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>
                      შენიშვნები ჯერ არ არის დამატებული.
                    </p>
                  ) : (
                    selectedOrder.managerNotes.map((note, index) => (
                      <div
                        key={index}
                        className="dashboard-bubble dashboard-bubble--customer"
                        style={{ maxWidth: '100%', alignSelf: 'stretch', background: 'var(--bg-color)' }}
                      >
                        <p>{note.text}</p>
                        <span className="dashboard-bubble__time">
                          {note.authorName} &middot; {formatOrderNoteTime(note.createdAt)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Note text field input */}
            <form onSubmit={handleAddNote} className="dashboard-chat__input">
              <input
                type="text"
                className="dashboard-chat__field"
                placeholder="დაამატე ახალი შენიშვნა შეკვეთაზე..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                disabled={noteAdding}
              />
              <button
                type="submit"
                className="btn btn--accent dashboard-chat__send"
                disabled={noteAdding || !noteText.trim()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {noteAdding ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
