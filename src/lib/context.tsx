'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Language } from './types'
import { t } from './translations'

interface LanguageContextType {
  lang: Language
  dir: 'ltr' | 'rtl'
  toggleLang: () => void
  tr: typeof t['en']
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  dir: 'ltr',
  toggleLang: () => {},
  tr: t.en,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('en')

  useEffect(() => {
    const stored = localStorage.getItem('twinity-lang') as Language | null
    if (stored) setLang(stored)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('twinity-lang', lang)
  }, [lang])

  const toggleLang = () => setLang(prev => (prev === 'en' ? 'ar' : 'en'))

  return (
    <LanguageContext.Provider
      value={{
        lang,
        dir: lang === 'ar' ? 'rtl' : 'ltr',
        toggleLang,
        tr: lang === 'ar' ? t.ar : t.en,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
