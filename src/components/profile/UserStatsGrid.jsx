import { formatDeveloperRating, formatOrderAmount } from '../../services/orderService'

function StatCard({ label, value, hint }) {
  return (
    <div className="profile-stat">
      <span className="profile-stat__value">{value}</span>
      <span className="profile-stat__label">{label}</span>
      {hint && <span className="profile-stat__hint">{hint}</span>}
    </div>
  )
}

function CustomerStats({ stats }) {
  return (
    <>
      <StatCard label="სულ მოთხოვნა" value={stats.total} />
      <StatCard label="აქტიური" value={stats.active} />
      <StatCard label="დასრულებული" value={stats.completed} />
      <StatCard label="გადახდილი ჯამი" value={formatOrderAmount(stats.totalSpent)} />
    </>
  )
}

function DeveloperStats({ stats, userProfile }) {
  return (
    <>
      <StatCard label="რეიტინგი" value={formatDeveloperRating(userProfile)} />
      <StatCard label="აქტიური ტასკი" value={stats.activeCount} />
      <StatCard label="დასრულებული" value={stats.completed} />
      <StatCard label="ამ თვეში" value={stats.completedThisMonth} hint="დასრულებული" />
      <StatCard label="მოლოდინში" value={formatOrderAmount(stats.pendingTotal)} hint="ანაზღაურება" />
      <StatCard label="გადარიცხული" value={formatOrderAmount(stats.paidTotal)} />
    </>
  )
}

function ManagerStats({ stats }) {
  return (
    <>
      <StatCard label="სულ თიქეტი" value={stats.totalOrders} />
      <StatCard label="აქტიური" value={stats.activeOrders} />
      <StatCard label="დასრულებული" value={stats.completedOrders} />
      <StatCard label="შენიშვნები" value={stats.notesAdded} hint={`${stats.ordersWithNotes} თიქეტზე`} />
    </>
  )
}

function AdminStats({ stats }) {
  return (
    <>
      <StatCard label="სულ თიქეტი" value={stats.totalOrders} />
      <StatCard label="აქტიური" value={stats.activeOrders} />
      <StatCard label="დასრულებული" value={stats.completedOrders} />
      <StatCard label="შემოსავალი" value={formatOrderAmount(stats.revenue)} hint="გადახდილი" />
    </>
  )
}

export default function UserStatsGrid({ role, stats, userProfile, loading }) {
  if (loading) {
    return <div className="profile-stats profile-stats--loading">სტატისტიკა იტვირთება...</div>
  }

  if (!stats) return null

  return (
    <section className="profile-stats" aria-label="სტატისტიკა">
      <h2 className="profile-section__title">სტატისტიკა</h2>
      <div className="profile-stats__grid">
        {role === 'customer' && <CustomerStats stats={stats} />}
        {role === 'developer' && <DeveloperStats stats={stats} userProfile={userProfile} />}
        {role === 'manager' && <ManagerStats stats={stats} />}
        {role === 'admin' && <AdminStats stats={stats} />}
      </div>
    </section>
  )
}
