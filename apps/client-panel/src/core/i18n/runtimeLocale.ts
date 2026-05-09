import type { Locale } from '@/core/i18n/I18nContext'
import { detectSupportedLocale, isLocale } from '@/core/i18n/locales'
import { createStorageKey } from '@/core/storage/keys'

export const LOCALE_STORAGE_KEY = createStorageKey('locale')

export function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (stored && isLocale(stored)) return stored
  } catch {
    return null
  }

  return null
}

export function getBrowserLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en'
  return detectSupportedLocale(navigator.language || 'en')
}

export function getCurrentAppLocale(): Locale {
  return getStoredLocale() ?? getBrowserLocale()
}

export function persistLocale(locale: Locale) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    return
  }
}
