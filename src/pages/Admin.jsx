import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  Globe,
  LayoutDashboard,
  Loader2,
  LogOut,
  ShieldCheck,
  User,
  UserCog,
  Users,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/LanguageContext'

import AdminUsersPanel from '../components/admin/AdminUsersPanel'
import AdminSitePanel from '../components/admin/AdminSitePanel'
import AdminDevelopersPanel from '../components/admin/AdminDevelopersPanel'
import {
  getAuthErrorMessage,
  validateEmail,
  validatePassword,
} from '../utils/authErrors'
import { DEVELOPER_REQUEST_STATUS, isAdminRole } from '../utils/roles'

import usePageMeta from '../hooks/usePageMeta'
import { pageTitle } from '../constants/brand'
import './Auth.css'
import './Admin.css'

const ADMIN_TABS = [
  { id: 'users', labelKey: 'admin.usersPanel', icon: Users },
  { id: 'site', labelKey: 'admin.siteContentPanel', icon: Globe },
  { id: 'developers', labelKey: 'admin.devsPanel', icon: UserCog },
]

function AdminLogin({ onLoggedIn }) {
  const { t } = useTranslation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const validateForm = () => {
    const errors = {}
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    if (emailError) errors.email = t('errors.emailInvalid') || emailError
    if (passwordError) errors.password = t('errors.passwordLength').replace('{min}', 6) || passwordError
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!validateForm()) return

    setSubmitting(true)
    try {
      await login(email.trim(), password)
      onLoggedIn()
    } catch (err) {
      setFormError(getAuthErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="admin-page__brand">
        <span className="admin-page__badge">Super Admin</span>
        <h1 className="admin-page__title">{t('nav.adminPanel')}</h1>
        <p className="admin-page__subtitle">
          {t('lang') === 'en'
            ? 'Complete site and user management administration'
            : 'საიტის და მომხმარებლების სრული მართვა'}
        </p>

      </div>


      {formError && <div className="auth-form__alert">{formError}</div>}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-form__field">
          <label htmlFor="admin-email" className="auth-form__label">
            {t('auth.email')}
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            className={`auth-form__input ${fieldErrors.email ? 'auth-form__input--error' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
          {fieldErrors.email && <span className="auth-form__error">{fieldErrors.email}</span>}
        </div>

        <div className="auth-form__field">
          <label htmlFor="admin-password" className="auth-form__label">
            {t('auth.password')}
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            className={`auth-form__input ${fieldErrors.password ? 'auth-form__input--error' : ''}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />
          {fieldErrors.password && (
            <span className="auth-form__error">{fieldErrors.password}</span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn--accent btn--lg auth-form__submit"
          disabled={submitting || !isFirebaseConfigured}
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="auth-form__spin" />
              {t('common.loading')}
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              {t('lang') === 'en' ? 'Admin Login' : 'Admin შესვლა'}
            </>
          )}
        </button>
      </form>

      <p className="admin-page__footer">
        {t('lang') === 'en' ? 'Are you a manager?' : 'მენეჯერი ხარ?'}{' '}
        <Link to="/login">{t('nav.login')}</Link>
        {' · '}
        <Link to="/">{t('lang') === 'en' ? 'Homepage' : 'მთავარი გვერდი'}</Link>
      </p>
    </>
  )
}

function SuperAdminPanel() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const [tab, setTab] = useState('users')
  const [error, setError] = useState('')

  return (
    <div className="admin-panel admin-panel--super">
      <div className="admin-panel__header">
        <div>
          <span className="admin-page__badge">Super Admin</span>
          <h1 className="admin-page__title">{t('nav.adminPanel')}</h1>
          <p className="admin-page__subtitle">
            {t('admin.usersPanel')} · {t('admin.siteContentPanel')} · {t('admin.devsPanel')}
          </p>
        </div>
        <div className="admin-panel__actions">
          <Link to="/profile" className="btn btn--outline btn--sm">
            <User size={16} />
            {t('nav.profile')}
          </Link>
          <Link to="/dashboard" className="btn btn--outline btn--sm">
            <LayoutDashboard size={16} />
            {t('nav.tickets')}
          </Link>
          <button type="button" className="btn btn--outline btn--sm" onClick={logout}>
            <LogOut size={16} />
            {t('nav.logout')}
          </button>
        </div>
      </div>

      <nav className="admin-tabs" aria-label="ადმინის ტაბები">
        {ADMIN_TABS.map(({ id, labelKey, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`admin-tabs__btn ${tab === id ? 'admin-tabs__btn--active' : ''}`}
            onClick={() => {
              setTab(id)
              setError('')
            }}
          >
            <Icon size={16} />
            {t(labelKey)}
          </button>
        ))}
      </nav>

      {error && <div className="auth-form__alert">{error}</div>}

      {tab === 'users' && <AdminUsersPanel adminId={user?.uid} onError={setError} />}
      {tab === 'site' && <AdminSitePanel adminId={user?.uid} onError={setError} />}
      {tab === 'developers' && <AdminDevelopersPanel adminId={user?.uid} onError={setError} />}
    </div>
  )
}

function Admin() {
  const { t } = useTranslation()
  usePageMeta(pageTitle(t('nav.adminPanel')), 'DIGIT — Super administration.')

  const { user, userProfile, loading, logout, refreshUserProfile } = useAuth()
  const [checkingAccess, setCheckingAccess] = useState(false)
  const [accessError, setAccessError] = useState('')
  const [adminReady, setAdminReady] = useState(true)
  const [adminSeedError, setAdminSeedError] = useState('')

  const handleLoggedIn = async () => {
    setCheckingAccess(true)
    setAccessError('')
    try {
      const profile = await refreshUserProfile()

      if (profile?.developerRequestStatus === DEVELOPER_REQUEST_STATUS.PENDING) {
        await logout()
        setAccessError(
          t('lang') === 'en'
            ? 'Specialist request is waiting for admin approval.'
            : 'შემსრულებლის მოთხოვნა admin-ის დადასტურებას ელოდება.'
        )
        return
      }

      if (!isAdminRole(profile?.role)) {
        await logout()
        setAccessError(
          t('lang') === 'en'
            ? 'This account does not have super admin access.'
            : 'ამ ანგარიშს არ აქვს super admin წვდომა.'
        )
      }
    } finally {
      setCheckingAccess(false)
    }
  }

  if (loading || checkingAccess || !adminReady) {
    return (
      <div className="admin-page">
        <div className="auth-loading">
          <div className="auth-loading__spinner" aria-label={t('common.loading')} />
        </div>
      </div>
    )
  }

  if (user && isAdminRole(userProfile?.role)) {
    return (
      <div className="admin-page admin-page--wide">
        <SuperAdminPanel />
      </div>
    )
  }

  if (user && userProfile?.role === 'manager') {
    return <Navigate to="/dashboard" replace />
  }

  if (user && userProfile?.role === 'developer') {
    return <Navigate to="/developer-dashboard" replace />
  }

  return (
    <div className="admin-page">
      <div className="admin-page__panel">
        <AdminLogin onLoggedIn={handleLoggedIn} />
        {adminSeedError && <div className="auth-form__alert">{adminSeedError}</div>}
        {accessError && <div className="auth-form__alert">{accessError}</div>}
      </div>
    </div>
  )
}

export default Admin
