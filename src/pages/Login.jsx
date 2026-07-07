import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Loader2, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/LanguageContext'

import GoogleIcon from '../components/icons/GoogleIcon'
import {
  getAuthErrorMessage,
  validateEmail,
  validatePassword,
} from '../utils/authErrors'
import { getPostLoginRedirect } from '../utils/roles'
import usePageMeta from '../hooks/usePageMeta'
import { pageTitle } from '../constants/brand'
import './Auth.css'

function Login() {
  const { t } = useTranslation()
  usePageMeta(pageTitle(t('auth.loginTitle')), 'DIGIT — Log in to your account.')
  const { user, userProfile, loading, login, loginWithGoogle, refreshUserProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (loading || !user) return
    navigate(getPostLoginRedirect(userProfile?.role, from), { replace: true })
  }, [loading, user, userProfile?.role, from, navigate])

  const redirectAfterAuth = async () => {
    const profile = await refreshUserProfile()
    navigate(getPostLoginRedirect(profile?.role, from), { replace: true })
  }

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
      await redirectAfterAuth()
    } catch (err) {
      setFormError(getAuthErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
    setFormError('')
    setSubmitting(true)
    try {
      await loginWithGoogle()
      await redirectAfterAuth()
    } catch (err) {
      setFormError(getAuthErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || user) {
    return (
      <div className="page auth-page">
        <div className="container">
          <div className="auth-loading">
            <div className="auth-loading__spinner" aria-label={t('common.loading')} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page auth-page">
      <div className="container">
        <div className="auth-card">
          <h1 className="auth-card__title">{t('auth.loginTitle')}</h1>
          <p className="auth-card__subtitle">{t('auth.loginSubtitle')}</p>



          {formError && <div className="auth-form__alert">{formError}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form__field">
              <label htmlFor="login-email" className="auth-form__label">
                {t('auth.email')}
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                className={`auth-form__input ${fieldErrors.email ? 'auth-form__input--error' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />
              {fieldErrors.email && (
                <span className="auth-form__error">{fieldErrors.email}</span>
              )}
            </div>

            <div className="auth-form__field">
              <label htmlFor="login-password" className="auth-form__label">
                {t('auth.password')}
              </label>
              <input
                id="login-password"
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
              className="btn btn--primary btn--lg auth-form__submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="auth-form__spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  {t('auth.loginTitle')}
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">{t('common.or')}</div>

          <button
            type="button"
            className="btn btn--outline auth-google"
            onClick={handleGoogleLogin}
            disabled={submitting}
          >
            <GoogleIcon size={18} />
            {t('auth.loginWithGoogle')}
          </button>

          <p className="auth-footer">
            {t('auth.noAccount')} <Link to="/register">{t('auth.registerTitle')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
