import { useEffect, useState } from 'react'
import {
  subscribeToSiteContent,
  updateSiteContent,
} from '../../services/siteContentService'
import { Loader2, Save } from 'lucide-react'

export default function AdminSitePanel({ adminId, onError }) {
  const [content, setContent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToSiteContent(
      (data) => {
        setContent(data)
      },
      (err) => {
        onError?.(err.message || 'საიტის კონტენტის ჩატვირთვა ვერ მოხერხდა')
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
      onError?.(err.message || 'საიტის კონტენტის განახლება ვერ მოხერხდა')
    } finally {
      setSaving(false)
    }
  }

  if (!content) {
    return (
      <div className="admin-panel__empty">
        <Loader2 className="animate-spin" style={{ margin: '0 auto' }} size={24} />
        <p style={{ marginTop: '0.5rem' }}>იტვირთება საიტის მონაცემები...</p>
      </div>
    )
  }

  return (
    <form className="admin-site-form" onSubmit={handleSubmit}>
      <div className="admin-section__head">
        <div>
          <h2>საიტის კონტენტის მართვა</h2>
          <p>აქედან შეგიძლიათ შეცვალოთ საიტზე გამოქვეყნებული ტექსტები და სერვისები</p>
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
          {saving ? 'ინახება...' : 'შენახვა'}
        </button>
      </div>

      {saveSuccess && (
        <div className="auth-form__alert" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderColor: 'rgba(34, 197, 94, 0.2)', marginBottom: '1rem' }}>
          კონტენტი წარმატებით შეინახა!
        </div>
      )}

      {/* Hero Section copy */}
      <div className="admin-site-form__block">
        <h3>მთავარი სექცია (Hero)</h3>
        <div className="admin-site-form__field">
          <label htmlFor="heroEyebrow">ზედა სათაური (Eyebrow)</label>
          <input
            id="heroEyebrow"
            type="text"
            value={content.heroEyebrow || ''}
            onChange={(e) => handleInputChange('heroEyebrow', e.target.value)}
          />
        </div>
        <div className="admin-site-form__field">
          <label htmlFor="heroTitle">მთავარი სათაური</label>
          <input
            id="heroTitle"
            type="text"
            value={content.heroTitle || ''}
            onChange={(e) => handleInputChange('heroTitle', e.target.value)}
          />
        </div>
        <div className="admin-site-form__field">
          <label htmlFor="heroTitleAccent">გამოკვეთილი სათაური (Accent)</label>
          <input
            id="heroTitleAccent"
            type="text"
            value={content.heroTitleAccent || ''}
            onChange={(e) => handleInputChange('heroTitleAccent', e.target.value)}
          />
        </div>
        <div className="admin-site-form__field">
          <label htmlFor="heroSubtitle">ქვესათაური (Subtitle)</label>
          <textarea
            id="heroSubtitle"
            rows="3"
            value={content.heroSubtitle || ''}
            onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
          />
        </div>
      </div>

      {/* Brand & About Info */}
      <div className="admin-site-form__block">
        <h3>ბრენდი და ჩვენს შესახებ</h3>
        <div className="admin-site-form__field">
          <label htmlFor="tagline">ტაგლაინი (Tagline)</label>
          <input
            id="tagline"
            type="text"
            value={content.tagline || ''}
            onChange={(e) => handleInputChange('tagline', e.target.value)}
          />
        </div>
        <div className="admin-site-form__field">
          <label htmlFor="siteDescription">საიტის აღწერა (SEO)</label>
          <textarea
            id="siteDescription"
            rows="2"
            value={content.siteDescription || ''}
            onChange={(e) => handleInputChange('siteDescription', e.target.value)}
          />
        </div>
        <div className="admin-site-form__field">
          <label htmlFor="aboutIntro">შესავალი ტექსტი (ჩვენს შესახებ)</label>
          <textarea
            id="aboutIntro"
            rows="4"
            value={content.aboutIntro || ''}
            onChange={(e) => handleInputChange('aboutIntro', e.target.value)}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="admin-site-form__block">
        <h3>საკონტაქტო ინფორმაცია</h3>
        <div className="admin-site-form__field">
          <label htmlFor="contactPhone">საკონტაქტო ტელეფონი</label>
          <input
            id="contactPhone"
            type="text"
            value={content.contactPhone || ''}
            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
          />
        </div>
        <div className="admin-site-form__field">
          <label htmlFor="contactEmail">საკონტაქტო ელ.ფოსტა</label>
          <input
            id="contactEmail"
            type="email"
            value={content.contactEmail || ''}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
          />
        </div>
        <div className="admin-site-form__field">
          <label htmlFor="workingHours">სამუშაო საათები</label>
          <input
            id="workingHours"
            type="text"
            value={content.workingHours || ''}
            onChange={(e) => handleInputChange('workingHours', e.target.value)}
          />
        </div>
      </div>

      {/* Services Configuration */}
      <div className="admin-site-form__block">
        <h3>სერვისები</h3>
        <div className="admin-site-form__services">
          {content.services?.map((service, index) => (
            <div key={service.id} className="admin-site-form__service">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="admin-site-form__checkbox" style={{ fontWeight: '600' }}>
                  <input
                    type="checkbox"
                    checked={service.enabled}
                    onChange={(e) => handleServiceChange(index, 'enabled', e.target.checked)}
                  />
                  აქტიურია (სერვისის ID: {service.id})
                </label>
              </div>

              <div className="admin-site-form__field" style={{ marginTop: '0.5rem' }}>
                <label htmlFor={`service-title-${service.id}`}>სერვისის დასახელება</label>
                <input
                  id={`service-title-${service.id}`}
                  type="text"
                  value={service.title || ''}
                  onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                />
              </div>

              <div className="admin-site-form__field">
                <label htmlFor={`service-desc-${service.id}`}>სერვისის აღწერა</label>
                <textarea
                  id={`service-desc-${service.id}`}
                  rows="2"
                  value={service.description || ''}
                  onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </form>
  )
}
