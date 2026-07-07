import { useTranslation } from '../context/LanguageContext'
import { selectableExperienceCategories, EXPERIENCE_YEAR_OPTIONS } from '../utils/developerProfile'
import './DeveloperCv.css'

function DeveloperCvFields({
  bio,
  onBioChange,
  experienceCategories,
  onExperienceCategoriesChange,
  experienceYears,
  onExperienceYearsChange,
  fieldErrors = {},
  disabled = false,
  idPrefix = 'dev-cv',
}) {
  const { t, tObject } = useTranslation()

  const toggleCategory = (categoryId) => {
    if (disabled) return

    if (experienceCategories.includes(categoryId)) {
      onExperienceCategoriesChange(experienceCategories.filter((id) => id !== categoryId))
      return
    }

    onExperienceCategoriesChange([...experienceCategories, categoryId])
  }

  return (
    <div className="dev-cv-fields">
      <p className="dev-cv-fields__intro">
        {t('cv.fieldsIntro')}
      </p>

      <div className="auth-form__field">
        <label htmlFor={`${idPrefix}-bio`} className="auth-form__label">
          {t('cv.aboutMe')}
        </label>
        <textarea
          id={`${idPrefix}-bio`}
          className={`auth-form__input auth-form__textarea ${fieldErrors.bio ? 'auth-form__input--error' : ''}`}
          rows={4}
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder={t('cv.placeholderBio')}
          disabled={disabled}
        />
        {fieldErrors.bio && <span className="auth-form__error">{fieldErrors.bio}</span>}
      </div>

      <div className="auth-form__field">
        <label htmlFor={`${idPrefix}-years`} className="auth-form__label">
          {t('cv.totalExperience')}
        </label>
        <select
          id={`${idPrefix}-years`}
          className={`auth-form__input ${fieldErrors.experienceYears ? 'auth-form__input--error' : ''}`}
          value={experienceYears}
          onChange={(e) => onExperienceYearsChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">{t('cv.selectDuration')}</option>
          {EXPERIENCE_YEAR_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(`cv.years_${option.value}`) || option.label}
            </option>
          ))}
        </select>
        {fieldErrors.experienceYears && (
          <span className="auth-form__error">{fieldErrors.experienceYears}</span>
        )}
      </div>

      <fieldset className="auth-form__field dev-cv-fields__categories">
        <legend className="auth-form__label">{t('cv.categoriesLabel')}</legend>
        <p className="dev-cv-fields__hint">{t('cv.categoriesHint')}</p>
        <div className="dev-cv-fields__grid">
          {selectableExperienceCategories.map((service) => {
            const Icon = service.icon
            const checked = experienceCategories.includes(service.id)

            return (
              <label
                key={service.id}
                className={`dev-cv-fields__category ${checked ? 'dev-cv-fields__category--checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(service.id)}
                  disabled={disabled}
                />
                <span className="dev-cv-fields__category-content">
                  <Icon size={16} className="dev-cv-fields__category-icon" aria-hidden />
                  <span className="dev-cv-fields__category-title">{tObject(service, 'title')}</span>
                </span>
              </label>
            )
          })}
        </div>
        {fieldErrors.experienceCategories && (
          <span className="auth-form__error">{fieldErrors.experienceCategories}</span>
        )}
      </fieldset>
    </div>
  )
}

export default DeveloperCvFields
