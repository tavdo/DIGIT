import { Loader2 } from 'lucide-react'
import { formatOrderAmount } from '../../services/orderService'

export default function UserStatsGrid({ role, stats, loading }) {
  if (loading) {
    return (
      <div className="profile-stats profile-stats--loading" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={18} />
        იტვირთება სტატისტიკა...
      </div>
    )
  }

  if (!stats) return null

  const renderCustomerStats = () => (
    <div className="profile-stats__grid">
      <div className="profile-stat">
        <span className="profile-stat__value">{stats.total || 0}</span>
        <span className="profile-stat__label">სულ შეკვეთა</span>
      </div>
      <div className="profile-stat">
        <span className="profile-stat__value">{stats.active || 0}</span>
        <span className="profile-stat__label">აქტიური</span>
      </div>
      <div className="profile-stat">
        <span className="profile-stat__value">{stats.completed || 0}</span>
        <span className="profile-stat__label">დასრულებული</span>
      </div>
      <div className="profile-stat">
        <span className="profile-stat__value">{formatOrderAmount(stats.totalSpent)}</span>
        <span className="profile-stat__label">სულ გადახდილი</span>
      </div>
    </div>
  )

  const renderDeveloperStats = () => (
    <div className="profile-stats__grid">
      <div className="profile-stat">
        <span className="profile-stat__value">{stats.activeCount || 0}</span>
        <span className="profile-stat__label">აქტიური ტასკი</span>
      </div>
      <div className="profile-stat">
        <span className="profile-stat__value">{stats.completed || 0}</span>
        <span className="profile-stat__label">დასრულებული ტასკი</span>
        {stats.completedThisMonth > 0 && (
          <span className="profile-stat__hint">ამ თვეში: {stats.completedThisMonth}</span>
        )}
      </div>
      <div className="profile-stat">
        <span className="profile-stat__value">{formatOrderAmount(stats.pendingTotal)}</span>
        <span className="profile-stat__label">მისაღები ჰონორარი</span>
      </div>
      <div className="profile-stat">
        <span className="profile-stat__value">{formatOrderAmount(stats.paidTotal)}</span>
        <span className="profile-stat__label">გადახდილი ჰონორარი</span>
        {stats.paidThisMonth > 0 && (
          <span className="profile-stat__hint">ამ თვეში: {formatOrderAmount(stats.paidThisMonth)}</span>
        )}
      </div>
    </div>
  )

  const renderManagerStats = () => (
    <div className="profile-stats__grid">
      <div className="profile-stat">
        <span className="profile-stat__value">{stats.totalOrders || 0}</span>
        <span className="profile-stat__label">პლატფორმის შეკვეთები</span>
      </div>
      <div className="profile-stat">
        <span className="profile-stat__value">{stats.activeOrders || 0}</span>
        <span className="profile-stat__label">აქტიური შეკვეთები</span>
      </div>
      <div className="profile-stat">
        <span className="profile-stat__value">{stats.completedOrders || 0}</span>
        <span className="profile-stat__label">დასრულებული</span>
      </div>
      <div className="profile-stat">
        <span className="profile-stat__value">{stats.ordersWithNotes || 0}</span>
        <span className="profile-stat__label">შეკვეთები ჩემი შენიშვნით</span>
        {stats.notesAdded > 0 && (
          <span className="profile-stat__hint">სულ შენიშვნა: {stats.notesAdded}</span>
        )}
      </div>
    </div>
  )

  const renderAdminStats = () => (
    <div className="profile-stats__grid">
      <div className="profile-stat">
        <span className="profile-stat__value">{stats.totalOrders || 0}</span>
        <span className="profile-stat__label">სულ შეკვეთა</span>
      </div>
      <div className="profile-stat">
        <span className="profile-stat__value">{stats.activeOrders || 0}</span>
        <span className="profile-stat__label">აქტიური</span>
      </div>
      <div className="profile-stat">
        <span className="profile-stat__value">{stats.completedOrders || 0}</span>
        <span className="profile-stat__label">დასრულებული</span>
      </div>
      <div className="profile-stat">
        <span className="profile-stat__value">{formatOrderAmount(stats.revenue)}</span>
        <span className="profile-stat__label">საერთო ბრუნვა</span>
      </div>
    </div>
  )

  return (
    <div className="profile-stats">
      <h2 className="profile-section__title" style={{ margin: '0 0 1rem 0' }}>პლატფორმის აქტივობა</h2>
      {role === 'customer' && renderCustomerStats()}
      {role === 'developer' && renderDeveloperStats()}
      {role === 'manager' && renderManagerStats()}
      {role === 'admin' && renderAdminStats()}
    </div>
  )
}
