import { Link } from "react-router-dom";
import {
  UserSearch,
  ShieldCheck,
  CheckCircle2,
  Users,
  Headphones,
  ArrowRight,
  LayoutGrid,
  ClipboardList,
} from "lucide-react";
import Reveal from "../components/Reveal";
import usePageMeta from "../hooks/usePageMeta";
import useSiteContent from "../hooks/useSiteContent";
import { useTranslation } from "../context/LanguageContext";
import { pageTitle, SITE_DESCRIPTION } from "../constants/brand";
import { getServicesFromContent } from "../utils/siteServices";
import "./Home.css";

const getSteps = (t) => [
  {
    icon: ClipboardList,
    step: "01",
    title: t("home.steps.step1Title"),
    description: t("home.steps.step1Desc"),
  },
  {
    icon: UserSearch,
    step: "02",
    title: t("home.steps.step2Title"),
    description: t("home.steps.step2Desc"),
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: t("home.steps.step3Title"),
    description: t("home.steps.step3Desc"),
  },
];

const getTrustPoints = (t) => [
  {
    icon: Headphones,
    title: t("home.trustPoints.point1Title"),
    text: t("home.trustPoints.point1Text"),
  },
  {
    icon: CheckCircle2,
    title: t("home.trustPoints.point2Title"),
    text: t("home.trustPoints.point2Text"),
  },
  {
    icon: Users,
    title: t("home.trustPoints.point3Title"),
    text: t("home.trustPoints.point3Text"),
  },
];

function Home() {
  const { content } = useSiteContent();
  const { t, tObject } = useTranslation();
  const visibleServices = getServicesFromContent(content).filter(
    (service) => !service.custom,
  );

  const steps = getSteps(t);
  const trustPoints = getTrustPoints(t);

  usePageMeta(
    pageTitle(t("home.metaTitle")),
    tObject(content, "siteDescription") || SITE_DESCRIPTION,
  );

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__veil" aria-hidden="true" />
        <div className="hero__copy">
          <Reveal variant="fade">
            <p className="hero__kicker">{tObject(content, "heroEyebrow")}</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="hero__title">
              <span className="hero__title-main">
                {tObject(content, "heroTitle")}
              </span>
              <span className="hero__title-accent">
                {tObject(content, "heroTitleAccent")}
              </span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="hero__text">{tObject(content, "heroSubtitle")}</p>
          </Reveal>
          <Reveal delay={220} className="hero__actions">
            <Link to="/contact" className="btn btn--primary btn--lg">
              {t("home.heroActionRequest")}
              <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="hero__text-link">
              {t("home.heroActionHow")}
            </Link>
          </Reveal>
          <dl className="hero__stats">
            <div>
              <dt>{t("home.stats.stat1Label")}</dt>
              <dd>{t("home.stats.stat1Value")}</dd>
            </div>
            <div>
              <dt>{t("home.stats.stat2Label")}</dt>
              <dd>{t("home.stats.stat2Value")}</dd>
            </div>
            <div>
              <dt>{t("home.stats.stat3Label")}</dt>
              <dd>{t("home.stats.stat3Value")}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section how-it-works">
        <div className="container">
          <Reveal className="section__header">
            <span className="section-label">{t("home.sectionLabel.howItWorks")}</span>
            <span className="relay-line relay-line--center" />
            <h2 className="section__title">{t("home.howItWorksTitle")}</h2>
            <p className="section__subtitle">{t("home.howItWorksSubtitle")}</p>
          </Reveal>

          <div className="steps-timeline">
            <div className="steps-timeline__line" aria-hidden="true" />
            {steps.map(({ icon: Icon, step, title, description }, index) => (
              <Reveal
                key={step}
                className="step-card"
                delay={index * 100}
                variant="scale"
              >
                <div className="step-card__marker">
                  <span className="step-card__number">{step}</span>
                </div>
                <div className="step-card__body">
                  <div className="step-card__bg" />
                  <div className="step-card__blob" />

                  <div className="step-card__content">
                    <div className="step-card__icon">
                      <Icon size={24} strokeWidth={1.75} />
                    </div>

                    <h3 className="step-card__title">{title}</h3>

                    <p className="step-card__text">{description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section services-preview">
        <div className="container">
          <Reveal className="section__header">
            <span className="section-label">{t("home.sectionLabel.services")}</span>
            <h2 className="section__title">{t("home.popularServicesTitle")}</h2>
            <p className="section__subtitle">
              {t("home.popularServicesSubtitle")}
            </p>
          </Reveal>

          <div className="services-ledger">
            {visibleServices.map((service, index) => (
              <Link
                key={service.id}
                to={`/contact?service=${service.id}`}
                className="services-ledger__row"
              >
                <span className="services-ledger__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="services-ledger__title">
                  {tObject(service, "title")}
                </span>
                <span className="services-ledger__text">
                  {tObject(service, "description")}
                </span>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>

          <Reveal className="services-preview__action" delay={200}>
            <Link to="/services" className="btn btn--outline">
              <LayoutGrid size={18} />
              {t("home.allServicesBtn")}
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section trust">
        <div className="container trust__inner">
          <Reveal variant="left" className="trust__content">
            <span className="section-label">{t("home.sectionLabel.trust")}</span>
            <span className="relay-line" />
            <h2 className="section__title">{t("home.whyDigitTitle")}</h2>
            <p className="trust__intro">{t("home.whyDigitIntro")}</p>

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
              <div className="trust__quote-bg" />
              <div className="trust__quote-blob" />
              <div className="trust__quote-content">
                <p>{t("home.quoteText")}</p>
                <footer>{t("home.quoteFooter")}</footer>
              </div>
            </blockquote>
            <div className="trust__guarantee">
              <div className="trust__guarantee-bg" />
              <div className="trust__guarantee-blob" />
              <div className="trust__guarantee-content">
                <ShieldCheck size={28} strokeWidth={1.5} />
                <div>
                  <strong>{t("home.guaranteeTitle")}</strong>
                  <span>{t("home.guaranteeText")}</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="cta">
        <div className="cta__ambient" aria-hidden="true" />
        <div className="container">
          <Reveal className="cta__inner" variant="scale">
            <h2 className="cta__title">{t("home.readyTitle")}</h2>
            <p className="cta__text">{t("home.readyText")}</p>
            <Link to="/contact" className="btn btn--accent btn--lg">
              <ClipboardList size={18} />
              {t("home.heroActionRequest")}
              <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

export default Home;
