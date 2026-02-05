'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { type Locale, type LocalizedText, getLocalizedText } from '@/lib/i18n'

type LanguageContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const STORAGE_KEY = 'ps-locale'

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'fr',
  setLocale: () => {},
  toggleLocale: () => {},
})

function normalizeLocale(value?: string | null): Locale {
  if (!value) return 'fr'
  const lower = value.toLowerCase()
  if (lower.startsWith('en')) return 'en'
  return 'fr'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr')

  useEffect(() => {
    let next: Locale = 'fr'
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'fr' || stored === 'en') {
        next = stored
      } else if (typeof navigator !== 'undefined') {
        next = normalizeLocale(navigator.language)
      }
    } catch {
      // Ignore storage errors and keep default
    }
    setLocaleState(next)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale)
    } catch {
      // Ignore storage errors
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    setLocale: setLocaleState,
    toggleLocale: () => setLocaleState((prev) => (prev === 'fr' ? 'en' : 'fr')),
  }), [locale])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

export function useI18n() {
  const { locale, setLocale, toggleLocale } = useLanguage()
  const t = (fr: string, en: string) => (locale === 'fr' ? fr : en)
  const pick = (value: LocalizedText | string | null | undefined, fallback = '') => {
    const result = getLocalizedText(value, locale)
    return result || fallback
  }
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US'

  return {
    locale,
    setLocale,
    toggleLocale,
    t,
    pick,
    localeTag,
  }
}
