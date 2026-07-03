import { Link } from 'react-router-dom'
import {
  UserSearch,
  ShieldCheck,
  CheckCircle2,
  Users,
  Headphones,
  ArrowRight,
  CircleHelp,
  LayoutGrid,
  ClipboardList,
} from 'lucide-react'
import Reveal from '../components/Reveal'
import ControlBridge from '../components/ControlBridge'
import usePageMeta from '../hooks/usePageMeta'
import useSiteContent from '../hooks/useSiteContent'
import { pageTitle, SITE_DESCRIPTION } from '../constants/brand'
import { getServicesFromContent } from '../utils/siteServices'
import './Home.css'

const steps = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'გამოიძახე დახმარება',
    description: 'აირჩიე კატეგორია, აღწერე პრობლემა და მიუთითე პრიორიტეტი — ისევე მარტივად, როგორც ტაქსი.',
  },
  {
    icon: UserSearch,
    step: '02',
    title: 'მენეჯერი აფასებს',
    description: 'მენეჯერი განგებს ფასს და გიგზავნის შეთავაზებას დადასტურებისთვის.',
  },
  {
    icon: ShieldCheck,
    step: '03',
    title: 'შემსრულებელი მუშაობს',
    description: 'ფასის დადასტურების შემდეგ საქმე მიდის გადამოწმებულ შემსრულებელთან.',
  },
]

const trustPoints = [
  {
    icon: Headphones,
    title: 'ერთი მენეჯერი',
    text: 'მთელი პროცესის ერთი პასუხისმგებელი — არ გჭირდებათ ცალკ-ცალკე სპეციალისტების ძებნა.',
  },
  {
    icon: CheckCircle2,
    title: 'გადამოწმებული ქსელი',
    text: 'ყველა სპეციალისტი გადამოწმებულია — ხარისხი კონტროლდება ცენტრალურად.',
  },
  {
    icon: Users,
    title: 'გამჭვირვალე პროცესი',
    text: 'იცი სად არის შენი მოთხოვნა — ყოველ ეტაპზე ხედავ სტატუსს და კონტაქტს.',
  },
]

function Home() {
  const { content } = useSiteContent()
  const visibleServices = getServicesFromContent(content).filter((service) => !service.custom)

  usePageMeta(pageTitle('სანდო სერვისების პლატფორმა'), content.siteDescription || SITE_DESCRIPTION)

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__ambient" aria-hidden="true" />
        <div className="container hero__inner">
          <div className="hero__content">
            <Reveal variant="fade" className="hero__eyebrow-wrap">
              <span className="hero__eyebrow">{content.heroEyebrow}</span>
            </Reveal>
            <Reveal delay={80}>
              <span className="relay-line" />
              <h1 className="hero__title">
                <span className="hero__title-main">{content.heroTitle}</span>
                <br />
                <span className="hero__title-accent">{content.heroTitleAccent}</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="hero__text">{content.heroSubtitle}</p>
            </Reveal>
            <Reveal delay={240} className="hero__actions">
              <Link to="/contact" className="btn btn--primary btn--lg">
                <ClipboardList size={18} />
                გამოიძახე დახმარება
                <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="btn btn--outline btn--lg hero__btn-outline">
                <CircleHelp size={18} />
                როგორ მუშაობს
              </Link>
            </Reveal>
          </div>

          <Reveal variant="right" delay={200} className="hero__visual">
            <ControlBridge />
          </Reveal>
        </div>
      </section>

      <section className="section how-it-works">
        <div className="container">
          <Reveal className="section__header">
            <span className="relay-line relay-line--center" />
            <h2 className="section__title">როგორ მუშაობს</h2>
            <p className="section__subtitle">
              სამი ნაბიჯი — DIGIT-ის გასწვრივ, მენეჯერის კონტროლით
            </p>
          </Reveal>

          <div className="steps-timeline">
            <div className="steps-timeline__line" aria-hidden="true" />
            {steps.map(({ icon: Icon, step, title, description }, index) => (
              <Reveal key={step} className="step-card" delay={index * 100} variant="scale">
                <div className="step-card__marker">
                  <span className="step-card__number">{step}</span>
                </div>
                <div className="step-card__body">
                  <div className="step-card__icon">
                    <Icon size={24} strokeWidth={1.75} />
                  </div>
                  <h3 className="step-card__title">{title}</h3>
                  <p className="step-card__text">{description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section services-preview">
        <div className="container">
          <Reveal className="section__header">
            <h2 className="section__title">პოპულარული სერვისები</h2>
            <p className="section__subtitle">
              ყველაზე ხშირად მოთხოვნილი სერვისები ჩვენი პარტნიორებისგან
            </p>
          </Reveal>

          <div className="services-grid">
            {visibleServices.map(({ id, icon: Icon, title, description }, index) => (
              <Reveal key={id} className="service-card" delay={index * 70} variant="up">
                <div className="service-card__thread" aria-hidden="true" />
                <div className="service-card__icon">
                  <Icon size={24} strokeWidth={1.75} />
                </div>
                <h3 className="service-card__title">{title}</h3>
                <p className="service-card__text">{description}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="services-preview__action" delay={200}>
            <Link to="/services" className="btn btn--outline">
              <LayoutGrid size={18} />
              ყველა სერვისი
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section trust">
        <div className="container trust__inner">
          <Reveal variant="left" className="trust__content">
            <span className="relay-line" />
            <h2 className="section__title">რატომ DIGIT?</h2>
            <p className="trust__intro">
              შემთხვევით სპეციალისტის ძებნის ნაცვლად — ცენტრალური კონტროლი, გარანტია და
              ერთი პასუხისმგებელი მთელი გზის განმავლობაში.
            </p>

            <ul className="trust__list">
              {trustPoints.map(({ icon: Icon, title, text }) => (
                <li key={title} className="trust__item">
                  <span className="trust__item-icon">
                    <Icon size={20} strokeWidth={1.75} />
                  </span>
                  <div>
                    <strong className="trust__item-title">{title}</strong>
                    <p className="trust__item-text">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal variant="right" delay={120} className="trust__panel">
            <blockquote className="trust__quote">
              <p>
                „ჩვენ არ ვყიდით სერვისს — ვიცავთ შენს ინტერესს შუამავლობისას.“
              </p>
              <footer>— DIGIT-ის პრინციპი</footer>
            </blockquote>
            <div className="trust__guarantee">
              <ShieldCheck size={28} strokeWidth={1.5} />
              <div>
                <strong>ხარისხის გარანტია</strong>
                <span>ყველა შეკვეთა მენეჯერის ზედამხედველობით</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="cta">
        <div className="cta__ambient" aria-hidden="true" />
        <div className="container">
          <Reveal className="cta__inner" variant="scale">
            <h2 className="cta__title">მზად ხარ დაიწყო?</h2>
            <p className="cta__text">
              აღწერე შენი ამოცანა — მენეჯერი მალე დაგიკავშირდება და პროცესი ხელში აიღებს.
            </p>
            <Link to="/contact" className="btn btn--accent btn--lg">
              <ClipboardList size={18} />
              გამოიძახე დახმარება
              <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

export default Home
