import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import Reveal from '../components/Reveal'
import usePageMeta from '../hooks/usePageMeta'
import useSiteContent from '../hooks/useSiteContent'
import { pageTitle } from '../constants/brand'
import { getServicesFromContent } from '../utils/siteServices'
import './Services.css'

function Services() {
  const { content } = useSiteContent()
  const services = getServicesFromContent(content)

  usePageMeta(
    pageTitle('სერვისები'),
    'DIGIT — სერვისების კატალოგი. გადამოწმებული პარტნიორები და მენეჯერის ხარისხის კონტროლი.'
  )

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal variant="fade">
            <span className="relay-line" />
            <h1 className="page__title">სერვისები</h1>
            <p className="page__subtitle">
              ყველა სერვისს ახორციელებენ გადამოწმებული პარტნიორები — DIGIT მენეჯერი
              კონტროლს უწევს ხარისხს და კომუნიკაციას.
            </p>
          </Reveal>
        </div>
      </section>

      <div className="page services-page">
        <div className="container">
          <div className="services-page__grid">
          {services.map(({ id, icon: Icon, title, description, custom }, index) => (
            <Reveal
              key={id}
              className={`service-item ${custom ? 'service-item--custom' : ''}`}
              delay={index * 80}
            >
              <div className="service-item__icon">
                <Icon size={26} strokeWidth={1.75} />
              </div>
              <h2 className="service-item__title">{title}</h2>
              <p className="service-item__desc">{description}</p>
              <Link
                to={`/contact?service=${id}`}
                className={`btn ${custom ? 'btn--outline' : 'btn--primary'} service-item__btn`}
              >
                {custom ? <Sparkles size={18} /> : <ArrowRight size={18} />}
                მოითხოვე ეს სერვისი
              </Link>
            </Reveal>
          ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default Services
