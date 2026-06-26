import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { getDefaultSiteContent } from '../../services/siteContentService'
import { updateSiteContent } from '../../services/siteContentService'
import useSiteContent from '../../hooks/useSiteContent'

function AdminSitePanel({ adminId, onError }) {
  const { content } = useSiteContent()
  const [form, setForm] = useState(getDefaultSiteContent())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(content)
  }, [content])

  const handleField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleServiceField = (serviceId, field, value) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.map((service) =>
        service.id === serviceId ? { ...service, [field]: value } : service,
      ),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!adminId) return

    setSaving(true)
    try {
      await updateSiteContent(form, adminId)
    } catch (err) {
      onError(err.message || 'საიტის შენახვა ვერ მოხერხდა.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="admin-section admin-site-form" onSubmit={handleSubmit}>
      <div className="admin-section__head">
        <div>
          <h2>საიტის კონტენტი</h2>
          <p>შეცვალე მთავარი გვერდის ტექსტები, კონტაქტი და სერვისები.</p>
        </div>
        <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
          <Save size={16} />
          {saving ? 'ინახება...' : 'შენახვა'}
        </button>
      </div>

      <section className="admin-site-form__block">
        <h3>მთავარი გვერდი</h3>
        <label className="admin-site-form__field">
          <span>ზედა ხაზი</span>
          <input
            value={form.heroEyebrow}
            onChange={(e) => handleField('heroEyebrow', e.target.value)}
          />
        </label>
        <label className="admin-site-form__field">
          <span>სათაური</span>
          <input
            value={form.heroTitle}
            onChange={(e) => handleField('heroTitle', e.target.value)}
          />
        </label>
        <label className="admin-site-form__field">
          <span>აქცენტი</span>
          <input
            value={form.heroTitleAccent}
            onChange={(e) => handleField('heroTitleAccent', e.target.value)}
          />
        </label>
        <label className="admin-site-form__field">
          <span>ქვესათაური</span>
          <textarea
            rows={3}
            value={form.heroSubtitle}
            onChange={(e) => handleField('heroSubtitle', e.target.value)}
          />
        </label>
        <label className="admin-site-form__field">
          <span>ტაგლაინი</span>
          <input value={form.tagline} onChange={(e) => handleField('tagline', e.target.value)} />
        </label>
        <label className="admin-site-form__field">
          <span>აღწერა (SEO)</span>
          <textarea
            rows={2}
            value={form.siteDescription}
            onChange={(e) => handleField('siteDescription', e.target.value)}
          />
        </label>
      </section>

      <section className="admin-site-form__block">
        <h3>კონტაქტი</h3>
        <label className="admin-site-form__field">
          <span>ტელეფონი</span>
          <input
            value={form.contactPhone}
            onChange={(e) => handleField('contactPhone', e.target.value)}
          />
        </label>
        <label className="admin-site-form__field">
          <span>ელ. ფოსტა</span>
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) => handleField('contactEmail', e.target.value)}
          />
        </label>
        <label className="admin-site-form__field">
          <span>სამუშაო საათები</span>
          <input
            value={form.workingHours}
            onChange={(e) => handleField('workingHours', e.target.value)}
          />
        </label>
      </section>

      <section className="admin-site-form__block">
        <h3>ჩვენ შესახებ</h3>
        <label className="admin-site-form__field">
          <span>შესავალი ტექსტი</span>
          <textarea
            rows={4}
            value={form.aboutIntro}
            onChange={(e) => handleField('aboutIntro', e.target.value)}
          />
        </label>
      </section>

      <section className="admin-site-form__block">
        <h3>სერვისები</h3>
        <div className="admin-site-form__services">
          {form.services.map((service) => (
            <article key={service.id} className="admin-site-form__service">
              <label className="admin-site-form__checkbox">
                <input
                  type="checkbox"
                  checked={service.enabled !== false}
                  onChange={(e) => handleServiceField(service.id, 'enabled', e.target.checked)}
                />
                ჩართული
              </label>
              <label className="admin-site-form__field">
                <span>სათაური</span>
                <input
                  value={service.title}
                  onChange={(e) => handleServiceField(service.id, 'title', e.target.value)}
                />
              </label>
              <label className="admin-site-form__field">
                <span>აღწერა</span>
                <textarea
                  rows={3}
                  value={service.description}
                  onChange={(e) => handleServiceField(service.id, 'description', e.target.value)}
                />
              </label>
            </article>
          ))}
        </div>
      </section>
    </form>
  )
}

export default AdminSitePanel
