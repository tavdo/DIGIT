import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../data/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('language') || 'ka'
  })

  useEffect(() => {
    localStorage.setItem('language', lang)
  }, [lang])

  const selectLanguage = (newLang) => {
    if (newLang === 'ka' || newLang === 'en') {
      setLang(newLang)
    }
  }

  // Translates a static dot-notation key (e.g. "home.steps.step1Title")
  const t = (key) => {
    if (!key) return ''
    const keys = key.split('.')
    let currentTranslation = translations[lang]

    for (const k of keys) {
      if (currentTranslation && currentTranslation[k] !== undefined) {
        currentTranslation = currentTranslation[k]
      } else {
        // Fallback to Georgian
        let fallbackVal = translations['ka']
        for (const fk of keys) {
          if (fallbackVal && fallbackVal[fk] !== undefined) {
            fallbackVal = fallbackVal[fk]
          } else {
            fallbackVal = null
            break
          }
        }
        return fallbackVal !== null ? fallbackVal : key
      }
    }
    return currentTranslation
  }

  // Translates fields of dynamic objects that might have _ka and _en versions
  const tObject = (obj, fieldName) => {
    if (!obj) return ''
    const valWithLang = obj[`${fieldName}_${lang}`]
    if (valWithLang !== undefined && valWithLang !== null && valWithLang !== '') {
      return valWithLang
    }
    const valWithKa = obj[`${fieldName}_ka`]
    if (valWithKa !== undefined && valWithKa !== null && valWithKa !== '') {
      return valWithKa
    }
    return obj[fieldName] || ''
  }

  return (
    <LanguageContext.Provider value={{ lang, selectLanguage, t, tObject }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
