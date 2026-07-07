import {
  ClipboardList,
  ClipboardCheck,
  Eye,
  ShieldCheck,
  Eye as TransparencyIcon,
  Handshake,
  Headphones,
} from 'lucide-react'
import Reveal from '../components/Reveal'
import Accordion from '../components/Accordion'
import usePageMeta from '../hooks/usePageMeta'
import { pageTitle } from '../constants/brand'
import useSiteContent from '../hooks/useSiteContent'
import { useTranslation } from '../context/LanguageContext'
import './About.css'

const getWorkSteps = (t) => [
  {
    icon: ClipboardList,
    title: t('about.workSteps.step1Title'),
    description: t('about.workSteps.step1Desc'),
  },
  {
    icon: ClipboardCheck,
    title: t('about.workSteps.step2Title'),
    description: t('about.workSteps.step2Desc'),
  },
  {
    icon: Eye,
    title: t('about.workSteps.step3Title'),
    description: t('about.workSteps.step3Desc'),
  },
  {
    icon: ShieldCheck,
    title: t('about.workSteps.step4Title'),
    description: t('about.workSteps.step4Desc'),
  },
]

const getTeam = (t) => [
  {
    name: 'გიორგი მ.',
    role: t('about.team.roleManager'),
    bio: t('about.team.bioManager'),
    initials: 'GM',
  },
  {
    name: 'ნიკა კ.',
    role: t('about.team.roleFounder'),
    bio: t('about.team.bioFounder'),
    initials: 'NK',
  },
  {
    name: 'ანა ბ.',
    role: t('about.team.roleSupport'),
    bio: t('about.team.bioSupport'),
    initials: 'AB',
  },
]

const getFaqItems = (t) => [
  {
    question: t('about.faq.q1'),
    answer: t('about.faq.a1'),
  },
  {
    question: t('about.faq.q2'),
    answer: t('about.faq.a2'),
  },
  {
    question: t('about.faq.q3'),
    answer: t('about.faq.a3'),
  },
  {
    question: t('about.faq.q4'),
    answer: t('about.faq.a4'),
  },
  {
    question: t('about.faq.q5'),
    answer: t('about.faq.a5'),
  },
]

const getTrustBadges = (t) => [
  {
    icon: TransparencyIcon,
    title: t('about.guarantees.g1Title'),
    text: t('about.guarantees.g1Text'),
  },
  {
    icon: Handshake,
    title: t('about.guarantees.g2Title'),
    text: t('about.guarantees.g2Text'),
  },
  {
    icon: Headphones,
    title: t('about.guarantees.g3Title'),
    text: t('about.guarantees.g3Text'),
  },
]

function About() {
  const { content } = useSiteContent()
  const { t, tObject } = useTranslation()

  const workSteps = getWorkSteps(t)
  const team = getTeam(t)
  const faqItems = getFaqItems(t)
  const trustBadges = getTrustBadges(t)

  usePageMeta(
    pageTitle(t('about.metaTitle')),
    t('about.metaDesc')
  )

  return (
    <div className="about">
      <section className="about-mission">
        <div className="container">
          <Reveal className="about-mission__inner">
            <span className="about-mission__label">{t('about.historyLabel')}</span>
            <h1 className="about-mission__title">{t('about.historyTitle')}</h1>
            <div className="about-mission__text">
              <p>{tObject(content, 'aboutIntro')}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="about-section about-work">
        <div className="container">
          <Reveal className="about-section__header">
            <h2 className="about-section__title">{t('about.howWeWorkTitle')}</h2>
            <p className="about-section__subtitle">
              {t('about.howWeWorkSubtitle')}
            </p>
          </Reveal>

          <div className="about-work__steps">
            {workSteps.map(({ icon: Icon, title, description }, index) => (
              <Reveal key={title} className="about-work__step" delay={index * 100}>
                <div className="about-work__step-num">{index + 1}</div>
                <div className="about-work__step-icon">
                  <Icon size={24} strokeWidth={1.75} />
                </div>
                <h3 className="about-work__step-title">{title}</h3>
                <p className="about-work__step-text">{description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-team">
        <div className="container">
          <Reveal className="about-section__header">
            <h2 className="about-section__title">{t('about.ourTeamTitle')}</h2>
            <p className="about-section__subtitle">
              {t('about.ourTeamSubtitle')}
            </p>
          </Reveal>

          <div className="about-team__grid">
            {team.map(({ name, role, bio, initials }, index) => (
              <Reveal key={name} className="team-card" delay={index * 100}>
                <div className="team-card__avatar" aria-hidden="true">
                  {initials}
                </div>
                <h3 className="team-card__name">{name}</h3>
                <p className="team-card__role">{role}</p>
                <p className="team-card__bio">{bio}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="about-section about-faq">
        <div className="container">
          <Reveal className="about-section__header">
            <h2 className="about-section__title">{t('about.faqTitle')}</h2>
            <p className="about-section__subtitle">
              {t('about.faqSubtitle')}
            </p>
          </Reveal>

          <Reveal delay={100}>
            <Accordion items={faqItems} />
          </Reveal>
        </div>
      </section>

      <section className="about-section about-trust">
        <div className="container">
          <Reveal className="about-section__header">
            <h2 className="about-section__title">{t('about.guaranteesTitle')}</h2>
            <p className="about-section__subtitle">
              {t('about.guaranteesSubtitle')}
            </p>
          </Reveal>

          <div className="about-trust__grid">
            {trustBadges.map(({ icon: Icon, title, text }, index) => (
              <Reveal key={title} className="trust-badge" delay={index * 80}>
                <div className="trust-badge__icon">
                  <Icon size={26} strokeWidth={1.75} />
                </div>
                <h3 className="trust-badge__title">{title}</h3>
                <p className="trust-badge__text">{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
