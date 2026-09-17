import { Link } from 'react-router-dom'
import DigitMark from './DigitMark'
import { useTranslation } from '../context/LanguageContext'
import { CONTACT_EMAIL, SITE_NAME } from '../constants/brand'
import './Footer.css'

const socialLinks = [
  { label: 'Facebook', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'LinkedIn', href: '#' },
]

const NAV_LINKS = [
  { to: '/services', labelKey: 'nav.services' },
  { to: '/about', labelKey: 'nav.about' },
  { to: '/contact', labelKey: 'nav.newRequest' },
]

function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <span className="footer__watermark" aria-hidden="true">{SITE_NAME}</span>
      <div className="container footer__inner">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="footer__logo">
              <DigitMark size="sm" />
              <span>{SITE_NAME}</span>
            </div>
            <p className="footer__tagline">
              {t('footer.tagline')}
            </p>
          </div>

          <div className="footer__section">
            <h3 className="footer__heading">{t('nav.services')}</h3>
            <ul className="footer__list">
              {NAV_LINKS.map(({ to, labelKey }) => (
                <li key={to}>
                  <Link to={to}>{t(labelKey)}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__section">
            <h3 className="footer__heading">{t('footer.contact')}</h3>
            <ul className="footer__list">
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </li>
              <li>
                <a href="tel:+995555123456">+995 555 123 456</a>
              </li>
              <li>{t('footer.location')}</li>
            </ul>
          </div>

          <div className="footer__section">
            <h3 className="footer__heading">{t('footer.followUs')}</h3>
            <ul className="footer__social">
              {socialLinks.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} aria-label={label}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>&copy; {year} {SITE_NAME}. {t('footer.rightsReserved')}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
