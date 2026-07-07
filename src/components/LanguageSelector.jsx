import { useTranslation } from '../context/LanguageContext'

export default function LanguageSelector() {
  const { lang, selectLanguage } = useTranslation()

  const toggleLanguage = () => {
    selectLanguage(lang === 'ka' ? 'en' : 'ka')
  }

  return (
    <button
      type="button"
      className="language-selector-btn"
      onClick={toggleLanguage}
      aria-label={lang === 'ka' ? 'Switch to English' : 'გადართვა ქართულზე'}
      style={{
        background: 'transparent',
        border: '1px solid var(--color-border)',
        cursor: 'pointer',
        color: 'var(--text-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.45rem 0.6rem',
        borderRadius: 'var(--radius-md)',
        transition: 'all 0.15s ease',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        minWidth: '2.5rem',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-royal)'
        e.currentTarget.style.transform = 'scale(1.05)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      {lang === 'ka' ? 'EN' : 'KA'}
    </button>
  )
}
