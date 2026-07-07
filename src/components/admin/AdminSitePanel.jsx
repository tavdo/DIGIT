import { useEffect, useState } from 'react'
import {
  subscribeToSiteContent,
  updateSiteContent,
} from '../../services/siteContentService'
import { subscribeToManagers } from '../../services/orderService'
import { useTranslation } from '../../context/LanguageContext'
import { Loader2, Save } from 'lucide-react'

export default function AdminSitePanel({ adminId, onError }) {
  const { t, tObject } = useTranslation()
  const [content, setContent] = useState(null)
  const [managers, setManagers] = useState([])
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToSiteContent(
      (data) => {
        setContent(data)
      },
      (err) => {
        onError?.(err.message || t('admin.errorLoad') || 'საიტის კონტენტის ჩატვირთვა ვერ მოხერხდა')
      }
    )

    return () => unsubscribe()
  }, [onError, t])

  useEffect(() => {
    const unsubscribe = subscribeToManagers(
      (data) => {
        setManagers(data)
      },
      (err) => {
        onError?.(err.message || 'მენეჯერების ჩატვირთვა ვერ მოხერხდა')
      }
    )

    return () => unsubscribe()
  }, [onError])

  const handleInputChange = (field, value) => {
    setSaveSuccess(false)
    setContent((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleServiceChange = (index, field, value) => {
    setSaveSuccess(false)
    setContent((prev) => {
      const updatedServices = [...prev.services]
      updatedServices[index] = {
        ...updatedServices[index],
        [field]: value,
      }
      return {
        ...prev,
        services: updatedServices,
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveSuccess(false)
    try {
      await updateSiteContent(content, adminId)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      onError?.(err.message || t('admin.errorSave') || 'საიტის კონტენტის განახლება ვერ მოხერხდა')
    } finally {
      setSaving(false)
    }
  }

  if (!content) {
    return (
      <div className="admin-panel__empty">
        <Loader2 className="animate-spin" style={{ margin: '0 auto' }} size={24} />
        <p style={{ marginTop: '0.5rem' }}>{t('admin.loadingContent')}</p>
      </div>
    )
  }

  return (
    <form className="admin-site-form" onSubmit={handleSubmit}>
      <div className="admin-section__head">
        <div>
          <h2>{t('admin.title')}</h2>
          <p>{t('admin.subtitle')}</p>
        </div>
        <button
          type="submit"
          className="btn btn--accent btn--sm"
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {saving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          {saving ? t('admin.saving') : t('admin.save')}
        </button>
      </div>

      {saveSuccess && (
        <div className="auth-form__alert" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.2)', marginBottom: '1rem' }}>
          {t('admin.saveSuccess')}
        </div>
      )}

      {/* Hero Section copy */}
      <div className="admin-site-form__block">
        <h3>{t('admin.heroBlock')}</h3>
        <div className="admin-site-form__grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="admin-site-form__field">
            <label htmlFor="heroEyebrowKa">{t('admin.heroEyebrowKa')}</label>
            <input
              id="heroEyebrowKa"
              type="text"
              value={content.heroEyebrow_ka || content.heroEyebrow || ''}
              onChange={(e) => handleInputChange('heroEyebrow_ka', e.target.value)}
            />
          </div>
          <div className="admin-site-form__field">
            <label htmlFor="heroEyebrowEn">{t('admin.heroEyebrowEn')}</label>
            <input
              id="heroEyebrowEn"
              type="text"
              value={content.heroEyebrow_en || ''}
              onChange={(e) => handleInputChange('heroEyebrow_en', e.target.value)}
            />
          </div>
        </div>

        <div className="admin-site-form__grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div className="admin-site-form__field">
            <label htmlFor="heroTitleKa">{t('admin.heroTitleKa')}</label>
            <input
              id="heroTitleKa"
              type="text"
              value={content.heroTitle_ka || content.heroTitle || ''}
              onChange={(e) => handleInputChange('heroTitle_ka', e.target.value)}
            />
          </div>
          <div className="admin-site-form__field">
            <label htmlFor="heroTitleEn">{t('admin.heroTitleEn')}</label>
            <input
              id="heroTitleEn"
              type="text"
              value={content.heroTitle_en || ''}
              onChange={(e) => handleInputChange('heroTitle_en', e.target.value)}
            />
          </div>
        </div>

        <div className="admin-site-form__grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div className="admin-site-form__field">
            <label htmlFor="heroTitleAccentKa">{t('admin.heroTitleAccentKa')}</label>
            <input
              id="heroTitleAccentKa"
              type="text"
              value={content.heroTitleAccent_ka || content.heroTitleAccent || ''}
              onChange={(e) => handleInputChange('heroTitleAccent_ka', e.target.value)}
            />
          </div>
          <div className="admin-site-form__field">
            <label htmlFor="heroTitleAccentEn">{t('admin.heroTitleAccentEn')}</label>
            <input
              id="heroTitleAccentEn"
              type="text"
              value={content.heroTitleAccent_en || ''}
              onChange={(e) => handleInputChange('heroTitleAccent_en', e.target.value)}
            />
          </div>
        </div>

        <div className="admin-site-form__grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div className="admin-site-form__field">
            <label htmlFor="heroSubtitleKa">{t('admin.heroSubtitleKa')}</label>
            <textarea
              id="heroSubtitleKa"
              rows="3"
              value={content.heroSubtitle_ka || content.heroSubtitle || ''}
              onChange={(e) => handleInputChange('heroSubtitle_ka', e.target.value)}
            />
          </div>
          <div className="admin-site-form__field">
            <label htmlFor="heroSubtitleEn">{t('admin.heroSubtitleEn')}</label>
            <textarea
              id="heroSubtitleEn"
              rows="3"
              value={content.heroSubtitle_en || ''}
              onChange={(e) => handleInputChange('heroSubtitle_en', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Brand & About Info */}
      <div className="admin-site-form__block">
        <h3>{t('admin.brandBlock')}</h3>
        <div className="admin-site-form__grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="admin-site-form__field">
            <label htmlFor="taglineKa">{t('admin.taglineKa')}</label>
            <input
              id="taglineKa"
              type="text"
              value={content.tagline_ka || content.tagline || ''}
              onChange={(e) => handleInputChange('tagline_ka', e.target.value)}
            />
          </div>
          <div className="admin-site-form__field">
            <label htmlFor="taglineEn">{t('admin.taglineEn')}</label>
            <input
              id="taglineEn"
              type="text"
              value={content.tagline_en || ''}
              onChange={(e) => handleInputChange('tagline_en', e.target.value)}
            />
          </div>
        </div>

        <div className="admin-site-form__grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div className="admin-site-form__field">
            <label htmlFor="siteDescriptionKa">{t('admin.seoDescKa')}</label>
            <textarea
              id="siteDescriptionKa"
              rows="2"
              value={content.siteDescription_ka || content.siteDescription || ''}
              onChange={(e) => handleInputChange('siteDescription_ka', e.target.value)}
            />
          </div>
          <div className="admin-site-form__field">
            <label htmlFor="siteDescriptionEn">{t('admin.seoDescEn')}</label>
            <textarea
              id="siteDescriptionEn"
              rows="2"
              value={content.siteDescription_en || ''}
              onChange={(e) => handleInputChange('siteDescription_en', e.target.value)}
            />
          </div>
        </div>

        <div className="admin-site-form__grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div className="admin-site-form__field">
            <label htmlFor="aboutIntroKa">{t('admin.aboutIntroKa')}</label>
            <textarea
              id="aboutIntroKa"
              rows="4"
              value={content.aboutIntro_ka || content.aboutIntro || ''}
              onChange={(e) => handleInputChange('aboutIntro_ka', e.target.value)}
            />
          </div>
          <div className="admin-site-form__field">
            <label htmlFor="aboutIntroEn">{t('admin.aboutIntroEn')}</label>
            <textarea
              id="aboutIntroEn"
              rows="4"
              value={content.aboutIntro_en || ''}
              onChange={(e) => handleInputChange('aboutIntro_en', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="admin-site-form__block">
        <h3>{t('admin.contactBlock')}</h3>
        <div className="admin-site-form__field">
          <label htmlFor="contactPhone">{t('admin.contactPhone')}</label>
          <input
            id="contactPhone"
            type="text"
            value={content.contactPhone || ''}
            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
          />
        </div>
        <div className="admin-site-form__field">
          <label htmlFor="contactEmail">{t('admin.contactEmail')}</label>
          <input
            id="contactEmail"
            type="email"
            value={content.contactEmail || ''}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
          />
        </div>
        <div className="admin-site-form__grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div className="admin-site-form__field">
            <label htmlFor="workingHoursKa">{t('admin.workingHoursKa')}</label>
            <input
              id="workingHoursKa"
              type="text"
              value={content.workingHours_ka || content.workingHours || ''}
              onChange={(e) => handleInputChange('workingHours_ka', e.target.value)}
            />
          </div>
          <div className="admin-site-form__field">
            <label htmlFor="workingHoursEn">{t('admin.workingHoursEn')}</label>
            <input
              id="workingHoursEn"
              type="text"
              value={content.workingHours_en || ''}
              onChange={(e) => handleInputChange('workingHours_en', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Services Configuration */}
      <div className="admin-site-form__block">
        <h3>{t('admin.servicesBlock')}</h3>
        <div className="admin-site-form__services">
          {content.services?.map((service, index) => (
            <div key={service.id} className="admin-site-form__service" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="admin-site-form__checkbox" style={{ fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={service.enabled}
                    onChange={(e) => handleServiceChange(index, 'enabled', e.target.checked)}
                  />
                  {t('admin.serviceActive').replace('{id}', service.id)}
                </label>
              </div>

              <div className="admin-site-form__grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
                <div className="admin-site-form__field">
                  <label htmlFor={`service-title-ka-${service.id}`}>{t('admin.serviceTitleKa')}</label>
                  <input
                    id={`service-title-ka-${service.id}`}
                    type="text"
                    value={service.title_ka || service.title || ''}
                    onChange={(e) => handleServiceChange(index, 'title_ka', e.target.value)}
                  />
                </div>
                <div className="admin-site-form__field">
                  <label htmlFor={`service-title-en-${service.id}`}>{t('admin.serviceTitleEn')}</label>
                  <input
                    id={`service-title-en-${service.id}`}
                    type="text"
                    value={service.title_en || ''}
                    onChange={(e) => handleServiceChange(index, 'title_en', e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-site-form__grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div className="admin-site-form__field">
                  <label htmlFor={`service-desc-ka-${service.id}`}>{t('admin.serviceDescKa')}</label>
                  <textarea
                    id={`service-desc-ka-${service.id}`}
                    rows="2"
                    value={service.description_ka || service.description || ''}
                    onChange={(e) => handleServiceChange(index, 'description_ka', e.target.value)}
                  />
                </div>
                <div className="admin-site-form__field">
                  <label htmlFor={`service-desc-en-${service.id}`}>{t('admin.serviceDescEn')}</label>
                  <textarea
                    id={`service-desc-en-${service.id}`}
                    rows="2"
                    value={service.description_en || ''}
                    onChange={(e) => handleServiceChange(index, 'description_en', e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-site-form__field" style={{ marginTop: '1rem' }}>
                <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem' }}>
                  {t('admin.categoryManager') || 'კატეგორიის მენეჯერი'}
                </label>
                <select
                  value={service.managerId || ''}
                  onChange={(e) => {
                    const managerId = e.target.value
                    const selectedManager = managers.find(m => m.id === managerId)
                    handleServiceChange(index, 'managerId', managerId)
                    handleServiceChange(index, 'managerName', selectedManager ? (selectedManager.name || selectedManager.email) : '')
                  }}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-strong)',
                    background: 'var(--color-navy-soft)',
                    color: 'var(--color-ink)',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="">-- აირჩიე მენეჯერი --</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name || m.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  )
}
