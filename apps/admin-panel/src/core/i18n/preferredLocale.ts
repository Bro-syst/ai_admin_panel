import type { Locale } from '@/core/i18n/I18nContext'
import { DEFAULT_LOCALE, resolveLocaleFromLanguageTag } from '@/core/i18n/locales'
import { getStorageKey } from '@/shared/storage/storageKeys'

const STORAGE_KEY = getStorageKey('locale_v1')

export function readPreferredLocale(): Locale {
  const stored = resolveLocaleFromLanguageTag(window.localStorage.getItem(STORAGE_KEY))
  if (stored) return stored

  for (const value of navigator.languages ?? []) {
    const detected = resolveLocaleFromLanguageTag(value)
    if (detected) return detected
  }

  return resolveLocaleFromLanguageTag(navigator.language) ?? DEFAULT_LOCALE
}

export function persistPreferredLocale(locale: Locale) {
  window.localStorage.setItem(STORAGE_KEY, locale)
}
