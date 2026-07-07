import { useEffect, useState } from 'react'
import { Loader2, Users as UsersIcon, CheckSquare, BarChart2 } from 'lucide-react'
import { formatOrderAmount } from '../../services/orderService'
import { subscribeToAllUsers } from '../../services/superAdminService'
import useSiteContent from '../../hooks/useSiteContent'

function DonutChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  if (total === 0) {
    return <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '1rem 0' }}>მონაცემები არ არის</p>
  }

  let accumulatedPercent = 0
  const radius = 50
  const strokeWidth = 12
  const circumference = 2 * Math.PI * radius

  return (
    <div className="donut-chart-container" style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
        {data.map((item, idx) => {
          if (item.value === 0) return null
          const percent = item.value / total
          const strokeLength = percent * circumference
          const strokeOffset = circumference - (accumulatedPercent * circumference)
          accumulatedPercent += percent

          return (
            <circle
              key={idx}
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
              strokeDashoffset={strokeOffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease', cursor: 'pointer' }}
              title={`${item.label}: ${item.value}`}
            />
          )
        })}
        <circle cx="70" cy="70" r={radius - strokeWidth/2 - 1} fill="var(--color-navy-soft)" />
      </svg>
      
      <div className="donut-chart-legend" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', flex: 1, minWidth: '180px' }}>
        {data.map((item, idx) => {
          if (item.value === 0) return null
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.8125rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.color, flexShrink: 0 }} />
              <span style={{ color: 'var(--text-color)', fontWeight: '600' }}>{item.label}:</span>
              <span style={{ color: 'var(--color-copper)', fontWeight: '700', marginLeft: 'auto' }}>
                {item.value} ({Math.round((item.value / total) * 100)}%)
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BarChart({ data }) {
  const maxVal = Math.max(...data.map(item => item.value), 1)

  return (
    <div className="bar-chart-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', marginTop: '1.25rem' }}>
      {data.map((item, idx) => {
        if (item.value === 0) return null
        const percent = (item.value / maxVal) * 100
        return (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 30px', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-color)', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.label}>
              {item.label}
            </span>
            <div style={{ height: '8px', background: 'var(--color-border-strong)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${percent}%`,
                  background: 'linear-gradient(90deg, var(--color-copper-glow), var(--color-copper))',
                  boxShadow: '0 0 8px var(--color-copper-glow)',
                  borderRadius: '4px',
                  transition: 'width 0.6s ease'
                }}
              />
            </div>
            <span style={{ fontSize: '0.8125rem', fontWeight: '800', color: 'var(--color-copper)', textAlign: 'right' }}>
              {item.value}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function UserStatsGrid({ role, stats, orders = [], userProfile, loading }) {
  const [users, setUsers] = useState([])
  const { content } = useSiteContent()

  useEffect(() => {
    if (role === 'admin') {
      const unsubscribe = subscribeToAllUsers(
        (data) => setUsers(data),
        (err) => console.error(err)
      )
      return () => unsubscribe()
    }
  }, [role])

  if (loading) {
    return (
      <div className="profile-stats profile-stats--loading" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={18} />
        იტვირთება სტატისტიკა...
      </div>
    )
  }

  if (!stats) return null

  // Helper: map service IDs to names
  const getServiceLabel = (serviceId) => {
    const srv = content?.services?.find(s => s.id === serviceId)
    if (srv) return srv.title_ka || srv.title
    if (serviceId === 'computer-repair') return 'ტექნიკის შეკეთება'
    if (serviceId === 'website') return 'ვებსაიტის დამზადება'
    if (serviceId === 'technical-consultation') return 'კონსულტაცია'
    if (serviceId === 'it-support-business') return 'IT მხარდაჭერა'
    if (serviceId === 'gadget-repair') return 'გაჯეტის შეკეთება'
    return 'სხვა'
  }

  // Filter manager-specific orders
  const managerOrders = orders.filter(
    (o) =>
      o.managerId === userProfile?.id ||
      (content?.services
        ?.filter((s) => s.managerId === userProfile?.id)
        ?.map((s) => s.id) || []
      ).includes(o.serviceId)
  )

  const relevantOrders = role === 'manager' ? managerOrders : orders

  // Compute status distributions
  const statusesData = [
    { label: 'ახალი', value: relevantOrders.filter(o => o.status === 'new').length, color: '#60a5fa' },
    { label: 'ფასი შეთავაზებული', value: relevantOrders.filter(o => o.status === 'quote_offered').length, color: '#fb923c' },
    { label: 'ფასი დადასტურებული', value: relevantOrders.filter(o => o.status === 'quote_confirmed').length, color: '#f59e0b' },
    { label: 'მინიჭებული', value: relevantOrders.filter(o => o.status === 'assigned').length, color: '#a78bfa' },
    { label: 'მიმდინარე', value: relevantOrders.filter(o => o.status === 'in_progress').length, color: '#f43f5e' },
    { label: 'შემოწმებაზეა', value: relevantOrders.filter(o => o.status === 'waiting_approval').length, color: '#38bdf8' },
    { label: 'დასრულებული', value: relevantOrders.filter(o => o.status === 'completed').length, color: '#00ff88' },
    { label: 'გაუქმებული', value: relevantOrders.filter(o => o.status === 'cancelled').length, color: '#ef4444' }
  ]

  // Compute categories distribution
  const uniqueCategories = Array.from(new Set(relevantOrders.map(o => o.serviceId || 'other')))
  const categoriesData = uniqueCategories.map(cat => ({
    label: getServiceLabel(cat),
    value: relevantOrders.filter(o => (o.serviceId || 'other') === cat).length
  })).sort((a, b) => b.value - a.value)

  // Compute Admin user role distribution
  const userRolesData = [
    { label: 'ბიზნესი (კლიენტი)', value: users.filter(u => (u.role || 'customer') === 'customer').length, color: '#00ff88' },
    { label: 'მენეჯერი', value: users.filter(u => u.role === 'manager').length, color: '#f59e0b' },
    { label: 'შემსრულებელი', value: users.filter(u => u.role === 'developer').length, color: '#38bdf8' },
    { label: 'ადმინისტრატორი', value: users.filter(u => u.role === 'admin').length, color: '#ef4444' }
  ]

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
    <>
      <div className="profile-stats__grid" style={{ marginBottom: '2rem' }}>
        <div className="profile-stat">
          <span className="profile-stat__value">{relevantOrders.length}</span>
          <span className="profile-stat__label">მართული შეკვეთა</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat__value">{relevantOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length}</span>
          <span className="profile-stat__label">აქტიური შეკვეთა</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat__value">{relevantOrders.filter(o => o.status === 'completed').length}</span>
          <span className="profile-stat__label">დასრულებული</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat__value">{stats.ordersWithNotes || 0}</span>
          <span className="profile-stat__label">კომენტარი შეკვეთებზე</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
        <div className="profile-card" style={{ padding: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--color-copper)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}>
            <CheckSquare size={16} />
            სტატუსების განაწილება
          </h3>
          <DonutChart data={statusesData} />
        </div>

        <div className="profile-card" style={{ padding: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--color-copper)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0' }}>
            <BarChart2 size={16} />
            კატეგორიების სტატისტიკა
          </h3>
          <BarChart data={categoriesData} />
        </div>
      </div>
    </>
  )

  const renderAdminStats = () => (
    <>
      <div className="profile-stats__grid" style={{ marginBottom: '2rem' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
        <div className="profile-card" style={{ padding: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--color-copper)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}>
            <UsersIcon size={16} />
            მომხმარებლების როლები
          </h3>
          <DonutChart data={userRolesData} />
        </div>

        <div className="profile-card" style={{ padding: '1.5rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--color-copper)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}>
            <CheckSquare size={16} />
            შეკვეთების სტატუსები
          </h3>
          <DonutChart data={statusesData} />
        </div>
      </div>
    </>
  )

  return (
    <div className="profile-stats">
      <h2 className="profile-section__title" style={{ margin: '0 0 1.25rem 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>პლატფორმის აქტივობა</h2>
      {role === 'customer' && renderCustomerStats()}
      {role === 'developer' && renderDeveloperStats()}
      {role === 'manager' && renderManagerStats()}
      {role === 'admin' && renderAdminStats()}
    </div>
  )
}
