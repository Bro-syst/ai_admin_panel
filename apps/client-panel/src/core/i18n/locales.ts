import type { Locale } from '@/core/i18n/I18nContext'

export const SUPPORTED_LOCALES: Locale[] = ['ru', 'en', 'es', 'th', 'zh', 'sr', 'tr']

export const LOCALE_OPTIONS: Array<{ value: Locale; shortLabel: string; label: string }> = [
  { value: 'ru', shortLabel: 'RU', label: 'Русский' },
  { value: 'en', shortLabel: 'EN', label: 'English' },
  { value: 'es', shortLabel: 'ES', label: 'Español' },
  { value: 'th', shortLabel: 'TH', label: 'ไทย' },
  { value: 'zh', shortLabel: 'ZH', label: '中文' },
  { value: 'sr', shortLabel: 'SR', label: 'Српски' },
  { value: 'tr', shortLabel: 'TR', label: 'Türkçe' },
]

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale)
}

export function normalizeSupportedLocale(value: string | null | undefined): Locale | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  if (!normalized) return null
  const match = SUPPORTED_LOCALES.find((locale) => normalized === locale || normalized.startsWith(`${locale}-`))
  return match ?? null
}

export function detectSupportedLocale(value: string): Locale {
  return normalizeSupportedLocale(value) ?? 'en'
}
