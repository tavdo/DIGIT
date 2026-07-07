import { useTranslation } from '../context/LanguageContext'
import './FirebaseSetupNotice.css'

function FirebaseSetupNotice() {
  const { t } = useTranslation()

  return (
    <div className="firebase-setup">
      <h2 className="firebase-setup__title">{t('firebaseNotice.title')}</h2>
      <p className="firebase-setup__text">
        {t('firebaseNotice.text')}
      </p>
      <ol className="firebase-setup__steps">
        <li>
          {t('firebaseNotice.step1')}{' '}
          <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer">
            Firebase Console
          </a>
        </li>
        <li>Project settings → Your apps → Web app → Config</li>
        <li>
          {t('firebaseNotice.step3')} <code>.env</code>
        </li>
        <li>
          {t('firebaseNotice.step4')} <code>npm run dev</code>
        </li>
      </ol>
    </div>
  )
}

export default FirebaseSetupNotice
