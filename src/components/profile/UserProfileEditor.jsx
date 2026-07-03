import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { updateUserProfile } from '../../services/userService'
import { resolveUserRole, ROLE_LABELS } from '../../utils/roles'
import {
  formatExperienceCategories,
  formatExperienceYears,
  validateDeveloperCv,
} from '../../utils/developerProfile'
import DeveloperCvFields from '../DeveloperCvFields'
import { User, Edit2, Save, X, Loader2 } from 'lucide-react'

export default function UserProfileEditor({ onError, onSaved }) {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const role = resolveUserRole(userProfile)

  const [isEditing, setIsEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  // Form states
  const [name, setName] = useState(userProfile?.name || '')
  const [companyName, setCompanyName] = useState(userProfile?.companyName || '')
  const [phone, setPhone] = useState(userProfile?.phone || '')

  // Developer specific form states
  const [bio, setBio] = useState(userProfile?.bio || '')
  const [experienceCategories, setExperienceCategories] = useState(
    userProfile?.experienceCategories || []
  )
  const [experienceYears, setExperienceYears] = useState(userProfile?.experienceYears || '')

  const handleEditStart = () => {
    setName(userProfile?.name || '')
    setCompanyName(userProfile?.companyName || '')
    setPhone(userProfile?.phone || '')
    setBio(userProfile?.bio || '')
    setExperienceCategories(userProfile?.experienceCategories || [])
    setExperienceYears(userProfile?.experienceYears || '')
    setFieldErrors({})
    setIsEditing(true)
  }

  const validateForm = () => {
    const errors = {}
    if (!name.trim()) {
      errors.name = 'სახელის შევსება სავალდებულოა'
    }

    if (role === 'developer') {
      const devErrors = validateDeveloperCv({
        bio,
        experienceCategories,
        experienceYears,
      })
      Object.assign(errors, devErrors)
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    try {
      await updateUserProfile(user.uid, role, {
        name,
        companyName,
        phone,
        bio,
        experienceCategories,
        experienceYears,
      })
      await refreshUserProfile()
      setIsEditing(false)
      onSaved?.()
    } catch (err) {
      onError?.(err.message || 'პროფილის განახლება ვერ მოხერხდა')
    } finally {
      setSubmitting(false)
    }
  }

  if (!userProfile) return null

  return (
    <div className="profile-card">
      <div className="profile-card__header">
        <div className="profile-card__avatar">
          <User size={32} />
        </div>
        <div className="profile-card__identity">
          <h1>{userProfile.name || 'მომხმარებელი'}</h1>
          <p>{userProfile.email}</p>
          <span className={`profile-role-badge profile-role-badge--${role}`}>
            {ROLE_LABELS[role]}
          </span>
        </div>
        {!isEditing && (
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={handleEditStart}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <Edit2 size={14} />
            რედაქტირება
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="profile-view">
          <dl className="profile-meta">
            <div>
              <dt>ტელეფონი</dt>
              <dd>{userProfile.phone || '—'}</dd>
            </div>
            <div>
              <dt>კომპანია</dt>
              <dd>{userProfile.companyName || '—'}</dd>
            </div>
            {role === 'developer' && (
              <>
                <div>
                  <dt>გამოცდილება</dt>
                  <dd>{formatExperienceYears(userProfile.experienceYears)}</dd>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <dt>გამოცდილების კატეგორიები</dt>
                  <dd>{formatExperienceCategories(userProfile.experienceCategories)}</dd>
                </div>
              </>
            )}
          </dl>

          {role === 'developer' && userProfile.bio && (
            <div className="profile-view__block">
              <h3>ჩემს შესახებ</h3>
              <p>{userProfile.bio}</p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-form__field">
            <span>სახელი</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
            />
            {fieldErrors.name && <em>{fieldErrors.name}</em>}
          </div>

          <div className="profile-form__field">
            <span>ტელეფონი</span>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="profile-form__field">
            <span>კომპანია</span>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={submitting}
            />
          </div>

          {role === 'developer' && (
            <DeveloperCvFields
              bio={bio}
              onBioChange={setBio}
              experienceCategories={experienceCategories}
              onExperienceCategoriesChange={setExperienceCategories}
              experienceYears={experienceYears}
              onExperienceYearsChange={setExperienceYears}
              fieldErrors={fieldErrors}
              disabled={submitting}
              idPrefix="edit-profile"
            />
          )}

          <div className="profile-form__actions">
            <button
              type="button"
              className="btn btn--outline btn--sm"
              disabled={submitting}
              onClick={() => setIsEditing(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <X size={14} />
              გაუქმება
            </button>
            <button
              type="submit"
              className="btn btn--accent btn--sm"
              disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              {submitting ? (
                <Loader2 className="profile-form__spin" size={14} />
              ) : (
                <Save size={14} />
              )}
              {submitting ? 'ინახება...' : 'შენახვა'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
