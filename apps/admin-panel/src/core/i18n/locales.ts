import type { Locale } from '@/core/i18n/I18nContext'

export const DEFAULT_LOCALE: Locale = 'en'

export const localeOptions: Array<{
  value: Locale
  shortLabel: string
  label: string
  intlCode: string
}> = [
  { value: 'en', shortLabel: 'EN', label: 'English', intlCode: 'en-US' },
  { value: 'es', shortLabel: 'ES', label: 'Español', intlCode: 'es-ES' },
  { value: 'ru', shortLabel: 'RU', label: 'Русский', intlCode: 'ru-RU' },
  { value: 'zh', shortLabel: 'ZH', label: '中文', intlCode: 'zh-CN' },
]

const localeSet = new Set<Locale>(localeOptions.map((option) => option.value))

export function isLocale(value: string): value is Locale {
  return localeSet.has(value as Locale)
}

export function resolveLocaleFromLanguageTag(value: string | null | undefined): Locale | null {
  if (!value) return null

  const normalized = value.trim().toLowerCase()
  if (!normalized) return null
  if (isLocale(normalized)) return normalized

  for (const option of localeOptions) {
    if (normalized.startsWith(`${option.value}-`) || normalized.startsWith(`${option.value}_`)) {
      return option.value
    }
  }

  return null
}
