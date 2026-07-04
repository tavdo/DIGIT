import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { LogIn, LogOut, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { resolveUserRole } from '../utils/roles'
import DigitMark from './DigitMark'
import ThemeToggle from './ThemeToggle'
import { SITE_NAME } from '../constants/brand'
import './Navbar.css'

const PUBLIC_LINKS = [
  { to: '/', label: 'მთავარი', end: true },
  { to: '/services', label: 'სერვისები' },
  { to: '/about', label: 'ჩვენ შესახებ' },
]

function getNavLinks(role, isAuthenticated) {
  if (!isAuthenticated) return PUBLIC_LINKS

  if (role === 'developer') {
    return [
      { to: '/developer-dashboard', label: 'ჩემი ტასკები', end: true },
      { to: '/profile', label: 'პროფილი' },
    ]
  }

  if (role === 'admin') {
    return [
      { to: '/admin', label: 'ადმინ პანელი', end: true },
      { to: '/dashboard', label: 'თიქეტები' },
      { to: '/specialists', label: 'შემსრულებლები' },
      { to: '/profile', label: 'პროფილი' },
    ]
  }

  if (role === 'manager') {
    return [
      { to: '/', label: 'მთავარი', end: true },
      { to: '/dashboard', label: 'თიქეტები' },
      { to: '/specialists', label: 'შემსრულებლები' },
      { to: '/profile', label: 'პროფილი' },
    ]
  }

  if (role === 'customer') {
    return [
      { to: '/', label: 'მთავარი', end: true },
      { to: '/services', label: 'სერვისები' },
      { to: '/contact', label: 'ახალი მოთხოვნა' },
      { to: '/my-requests', label: 'ჩემი მოთხოვნები' },
      { to: '/specialists', label: 'შემსრულებლები' },
      { to: '/profile', label: 'პროფილი' },
    ]
  }

  return PUBLIC_LINKS
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, userProfile, loading, logout } = useAuth()

  const closeMenu = () => setMenuOpen(false)

  const displayName =
    userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'მომხმარებელი'

  const role = resolveUserRole(userProfile)
  const navLinks = getNavLinks(role, Boolean(user))

  const handleLogout = async () => {
    closeMenu()
    await logout()
  }

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__logo" onClick={closeMenu}>
          <DigitMark size="sm" />
          <span className="navbar__logo-text">{SITE_NAME}</span>
        </NavLink>

        <button
          type="button"
          className={`navbar__toggle ${menuOpen ? 'navbar__toggle--open' : ''}`}
          aria-label={menuOpen ? 'მენიუს დახურვა' : 'მენიუს გახსნა'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          <ul className="navbar__list">
            {navLinks.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                  }
                  onClick={closeMenu}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar__auth" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ThemeToggle />
            {loading ? (
              <span className="navbar__auth-loading">...</span>
            ) : user ? (
              <>
                <span className="navbar__user">{displayName}</span>
                <button
                  type="button"
                  className="navbar__auth-btn navbar__auth-btn--logout"
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                  გასვლა
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="navbar__auth-btn navbar__auth-btn--login"
                  onClick={closeMenu}
                >
                  <LogIn size={15} />
                  შესვლა
                </Link>
                <Link
                  to="/register"
                  className="navbar__auth-btn navbar__auth-btn--register"
                  onClick={closeMenu}
                >
                  <UserPlus size={15} />
                  რეგისტრაცია
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {menuOpen && (
        <button
          type="button"
          className="navbar__overlay"
          aria-label="მენიუს დახურვა"
          onClick={closeMenu}
        />
      )}
    </header>
  )
}

export default Navbar
