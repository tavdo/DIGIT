import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import Reveal from '../components/Reveal'
import usePageMeta from '../hooks/usePageMeta'
import useSiteContent from '../hooks/useSiteContent'
import { useTranslation } from '../context/LanguageContext'
import { pageTitle } from '../constants/brand'
import { getServicesFromContent } from '../utils/siteServices'
import './Services.css'

function Services() {
  const { content } = useSiteContent()
  const { t, tObject } = useTranslation()
  const services = getServicesFromContent(content)

  usePageMeta(
    pageTitle(t('services.metaTitle')),
    t('services.metaDesc')
  )

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal variant="fade">
            <span className="relay-line" />
            <h1 className="page__title">{t('services.title')}</h1>
            <p className="page__subtitle">
              {t('services.subtitle')}
            </p>
          </Reveal>
        </div>
      </section>

      <div className="page services-page">
        <div className="container">
          <div className="services-page__grid">
          {services.map((service, index) => {
            const Icon = service.icon
            const custom = service.custom
            return (
              <Reveal
                key={service.id}
                className={`service-item ${custom ? 'service-item--custom' : ''}`}
                delay={index * 80}
              >
                <div className="service-item__icon">
                  <Icon size={26} strokeWidth={1.75} />
                </div>
                <h2 className="service-item__title">{tObject(service, 'title')}</h2>
                <p className="service-item__desc">{tObject(service, 'description')}</p>
                <Link
                  to={`/contact?service=${service.id}`}
                  className={`btn ${custom ? 'btn--outline' : 'btn--primary'} service-item__btn`}
                >
                  {custom ? <Sparkles size={18} /> : <ArrowRight size={18} />}
                  {t('services.requestService')}
                </Link>
              </Reveal>
            )
          })}
          </div>
        </div>
      </div>
    </>
  )
}

export default Services
