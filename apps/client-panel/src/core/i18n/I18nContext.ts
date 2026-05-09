import { createContext } from 'react'

export type Locale = 'ru' | 'en' | 'es' | 'th' | 'zh' | 'sr' | 'tr'

export type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)
