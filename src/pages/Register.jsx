import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/LanguageContext'

import GoogleIcon from '../components/icons/GoogleIcon'
import {
  getAuthErrorMessage,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordMatch,
} from '../utils/authErrors'
import { getPostLoginRedirect } from '../utils/roles'
import { validateDeveloperCv } from '../utils/developerProfile'
import DeveloperCvFields from '../components/DeveloperCvFields'
import usePageMeta from '../hooks/usePageMeta'
import { pageTitle } from '../constants/brand'
import './Auth.css'

function Register() {
  const { t } = useTranslation()
  usePageMeta(pageTitle(t('auth.registerTitle')), 'DIGIT — Create an account.')
  const { signup, loginWithGoogle, refreshUserProfile } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountType, setAccountType] = useState('customer')
  const [bio, setBio] = useState('')
  const [experienceCategories, setExperienceCategories] = useState([])
  const [experienceYears, setExperienceYears] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const validateForm = () => {
    const errors = {}
    const nameError = validateName(name)
    const emailError = validateEmail(email)
    const passwordError = validatePassword(password)
    const confirmError = validatePasswordMatch(password, confirmPassword)

    if (nameError) errors.name = t('errors.nameInvalid') || nameError
    if (emailError) errors.email = t('errors.emailInvalid') || emailError
    if (passwordError) errors.password = t('errors.passwordLength').replace('{min}', 6) || passwordError
    if (confirmError) errors.confirmPassword = t('errors.passwordsDoNotMatch') || confirmError

    if (accountType === 'developer') {
      const devErrors = validateDeveloperCv({
        bio,
        experienceCategories,
        experienceYears,
      })
      
      // Localize CV validations
      if (devErrors.bio) devErrors.bio = t('cv.bioMinError').replace('{min}', 30)
      if (devErrors.experienceCategories) devErrors.experienceCategories = t('cv.categoriesRequired')
      if (devErrors.experienceYears) devErrors.experienceYears = t('cv.yearsRequired')
      if (devErrors.experienceYearsPositive) devErrors.experienceYears = t('cv.yearsPositive')
      
      Object.assign(errors, devErrors)
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const result = await signup(email.trim(), password, name.trim(), accountType, {
        bio,
        experienceCategories,
        experienceYears,
      })

      if (result.pendingDeveloper) {
        setSuccessMessage(
          t('auth.successPendingDev'),
        )
        return
      }

      navigate(getPostLoginRedirect(
        (await refreshUserProfile())?.role,
      ), { replace: true })
    } catch (err) {
      setFormError(getAuthErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSignup = async () => {
    setFormError('')
    setSubmitting(true)
    try {
      await loginWithGoogle()
      navigate(getPostLoginRedirect(
        (await refreshUserProfile())?.role,
      ), { replace: true })
    } catch (err) {
      setFormError(getAuthErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`page auth-page ${accountType === 'developer' ? 'auth-page--register-developer' : ''}`}>
      <div className="container">
        <div className="auth-card">
          <h1 className="auth-card__title">{t('auth.registerTitle')}</h1>
          <p className="auth-card__subtitle">{t('auth.registerSubtitle')}</p>



          {formError && <div className="auth-form__alert">{formError}</div>}
          {successMessage && <div className="auth-form__success">{successMessage}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-form__field">
              <label htmlFor="register-name" className="auth-form__label">
                {t('auth.name')}
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                className={`auth-form__input ${fieldErrors.name ? 'auth-form__input--error' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting || !!successMessage}
              />
              {fieldErrors.name && (
                <span className="auth-form__error">{fieldErrors.name}</span>
              )}
            </div>

            <div className="auth-form__field">
              <label htmlFor="register-email" className="auth-form__label">
                {t('auth.email')}
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                className={`auth-form__input ${fieldErrors.email ? 'auth-form__input--error' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting || !!successMessage}
              />
              {fieldErrors.email && (
                <span className="auth-form__error">{fieldErrors.email}</span>
              )}
            </div>

            <div className="auth-form__field">
              <label htmlFor="register-password" className="auth-form__label">
                {t('auth.password')}
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                className={`auth-form__input ${fieldErrors.password ? 'auth-form__input--error' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting || !!successMessage}
              />
              {fieldErrors.password && (
                <span className="auth-form__error">{fieldErrors.password}</span>
              )}
            </div>

            <div className="auth-form__field">
              <label htmlFor="register-confirm" className="auth-form__label">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="register-confirm"
                type="password"
                autoComplete="new-password"
                className={`auth-form__input ${fieldErrors.confirmPassword ? 'auth-form__input--error' : ''}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting || !!successMessage}
              />
              {fieldErrors.confirmPassword && (
                <span className="auth-form__error">{fieldErrors.confirmPassword}</span>
              )}
            </div>

            <fieldset className="auth-form__field auth-role-select">
              <legend className="auth-form__label">{t('auth.accountType')}</legend>
              <label className="auth-role-select__option">
                <input
                  type="radio"
                  name="accountType"
                  value="customer"
                  checked={accountType === 'customer'}
                  onChange={() => setAccountType('customer')}
                  disabled={submitting || !!successMessage}
                />
                <span className="auth-role-select__content">
                  <strong>{t('auth.businessRole')}</strong>
                  <small>{t('auth.businessRoleDesc')}</small>
                </span>
              </label>
              <label className="auth-role-select__option">
                <input
                  type="radio"
                  name="accountType"
                  value="developer"
                  checked={accountType === 'developer'}
                  onChange={() => setAccountType('developer')}
                  disabled={submitting || !!successMessage}
                />
                <span className="auth-role-select__content">
                  <strong>{t('auth.developerRole')}</strong>
                  <small>{t('auth.developerRoleDesc')}</small>
                </span>
              </label>
            </fieldset>

            {accountType === 'developer' && (
              <DeveloperCvFields
                idPrefix="register"
                bio={bio}
                onBioChange={setBio}
                experienceCategories={experienceCategories}
                onExperienceCategoriesChange={setExperienceCategories}
                experienceYears={experienceYears}
                onExperienceYearsChange={setExperienceYears}
                fieldErrors={fieldErrors}
                disabled={submitting || !!successMessage}
              />
            )}

            <button
              type="submit"
              className="btn btn--primary btn--lg auth-form__submit"
              disabled={submitting || !isFirebaseConfigured || !!successMessage}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="auth-form__spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  {t('auth.registerTitle')}
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">{t('common.or')}</div>

          <button
            type="button"
            className="btn btn--outline auth-google"
            onClick={handleGoogleSignup}
            disabled={submitting}
          >
            <GoogleIcon size={18} />
            {t('auth.registerWithGoogle')}
          </button>

          <p className="auth-footer">
            {t('auth.hasAccount')} <Link to="/login">{t('auth.loginTitle')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
