import { useEffect, useState } from 'react'
import { Loader2, Pencil, Save, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { updateUserProfile } from '../../services/userService'
import { ROLE_LABELS } from '../../utils/roles'
import {
  formatExperienceCategories,
  formatExperienceYears,
  validateDeveloperCv,
} from '../../utils/developerProfile'
import { formatProfileMemberSince } from '../../utils/userStats'
import DeveloperCvFields from '../DeveloperCvFields'

export default function UserProfileEditor({ onError, onSaved }) {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const role = userProfile?.role ?? 'customer'

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [experienceCategories, setExperienceCategories] = useState([])
  const [experienceYears, setExperienceYears] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => {
    setName(userProfile?.name || '')
    setCompanyName(userProfile?.companyName || '')
    setPhone(userProfile?.phone || '')
    setBio(userProfile?.bio || '')
    setExperienceCategories(userProfile?.experienceCategories || [])
    setExperienceYears(userProfile?.experienceYears || '')
  }, [userProfile])

  const handleSave = async (e) => {
    e.preventDefault()
    const errors = {}

    if (!name.trim()) {
      errors.name = 'სახელი სავალდებულოა.'
    }

    if (role === 'developer') {
      Object.assign(errors, validateDeveloperCv({ bio, experienceCategories, experienceYears }))
    }

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSaving(true)
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
      setEditing(false)
      onSaved?.()
    } catch (err) {
      onError?.(err.message || 'პროფილის შენახვა ვერ მოხერხდა.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="profile-card">
      <div className="profile-card__header">
        <div className="profile-card__avatar">
          <User size={28} />
        </div>
        <div className="profile-card__identity">
          <h1>{userProfile?.name || 'პროფილი'}</h1>
          <p>{userProfile?.email || user?.email}</p>
          <span className={`profile-role-badge profile-role-badge--${role}`}>
            {ROLE_LABELS[role] || role}
          </span>
        </div>
        {!editing && (
          <button type="button" className="btn btn--outline btn--sm" onClick={() => setEditing(true)}>
            <Pencil size={14} />
            რედაქტირება
          </button>
        )}
      </div>

      <dl className="profile-meta">
        <div>
          <dt>წევრი</dt>
          <dd>{formatProfileMemberSince(userProfile?.createdAt)}</dd>
        </div>
        {userProfile?.companyName && !editing && (
          <div>
            <dt>კომპანია</dt>
            <dd>{userProfile.companyName}</dd>
          </div>
        )}
        {userProfile?.phone && !editing && (
          <div>
            <dt>ტელეფონი</dt>
            <dd>{userProfile.phone}</dd>
          </div>
        )}
      </dl>

      {!editing ? (
        <div className="profile-view">
          {role === 'developer' && (
            <>
              <div className="profile-view__block">
                <h3>ჩემს შესახებ</h3>
                <p>{userProfile?.bio || 'აღწერა ჯერ არ არის შევსებული.'}</p>
              </div>
              <div className="profile-view__block">
                <h3>გამოცდილება</h3>
                <p>{formatExperienceYears(userProfile?.experienceYears)}</p>
                <p>{formatExperienceCategories(userProfile?.experienceCategories)}</p>
              </div>
            </>
          )}
        </div>
      ) : (
        <form className="profile-form" onSubmit={handleSave}>
          <label className="profile-form__field">
            <span>სახელი</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              maxLength={100}
            />
            {fieldErrors.name && <em>{fieldErrors.name}</em>}
          </label>

          <label className="profile-form__field">
            <span>კომპანია / ორგანიზაცია</span>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={saving}
              maxLength={120}
              placeholder="არასავალდებულო"
            />
          </label>

          <label className="profile-form__field">
            <span>ტელეფონი</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={saving}
              maxLength={30}
              placeholder="არასავალდებულო"
            />
          </label>

          {role === 'developer' && (
            <DeveloperCvFields
              idPrefix="profile"
              bio={bio}
              onBioChange={setBio}
              experienceCategories={experienceCategories}
              onExperienceCategoriesChange={setExperienceCategories}
              experienceYears={experienceYears}
              onExperienceYearsChange={setExperienceYears}
              fieldErrors={fieldErrors}
              disabled={saving}
            />
          )}

          <div className="profile-form__actions">
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              გაუქმება
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? <Loader2 size={16} className="profile-form__spin" /> : <Save size={16} />}
              შენახვა
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
