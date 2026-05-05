import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { I18nContext, type I18nContextValue, type Locale } from '@/core/i18n/I18nContext'
import { messages } from '@/core/i18n/messages'
import { persistPreferredLocale, readPreferredLocale } from '@/core/i18n/preferredLocale'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readPreferredLocale())

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    persistPreferredLocale(next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = useCallback(
    (key: string) => {
      const dict = messages[locale]
      return dict[key as keyof typeof dict] ?? key
    },
    [locale],
  )

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
