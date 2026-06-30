import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, LogOut, ShieldCheck, User, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isAdminRole } from '../utils/roles'
import ManagerOrdersPanel from '../components/orders/ManagerOrdersPanel'
import usePageMeta from '../hooks/usePageMeta'
import { pageTitle } from '../constants/brand'
import './Dashboard.css'

function Dashboard() {
  usePageMeta(pageTitle('მენეჯერის პანელი'), 'DIGIT — თიქეტების მართვა.')

  const { userProfile, logout } = useAuth()
  const [error, setError] = useState('')

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header__brand">
          <span className="dashboard-header__badge">Manager</span>
          <h1 className="dashboard-header__title">თიქეტების პანელი</h1>
        </div>
        <div className="dashboard-header__actions">
          {isAdminRole(userProfile?.role) && (
            <Link to="/admin" className="dashboard-header__link">
              <ShieldCheck size={18} />
              ადმინი
            </Link>
          )}
          <Link to="/specialists" className="dashboard-header__link">
            <Users size={18} />
            შემსრულებლები
          </Link>
          <Link to="/profile" className="dashboard-header__link">
            <User size={18} />
            პროფილი
          </Link>
          <Link to="/" className="dashboard-header__link">
            <Home size={18} />
            საიტზე დაბრუნება
          </Link>
          <button type="button" className="dashboard-header__link" onClick={handleLogout}>
            <LogOut size={18} />
            გასვლა
          </button>
        </div>
      </header>

      {error && <div className="dashboard-error">{error}</div>}

      <ManagerOrdersPanel
        managerName={userProfile?.name || 'მენეჯერი'}
        onError={setError}
      />
    </div>
  )
}

export default Dashboard
