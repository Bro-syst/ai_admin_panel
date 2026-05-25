import { describe, expect, it } from 'vitest'
import { localeOptions, resolveLocaleFromLanguageTag } from '@/core/i18n/locales'

describe('locales', () => {
  it('exposes only the supported admin portal languages', () => {
    expect(localeOptions.map((option) => option.value)).toEqual(['en', 'es', 'ru', 'zh'])
    expect(localeOptions.map((option) => option.shortLabel)).toEqual(['EN', 'ES', 'RU', 'ZH'])
  })

  it('resolves supported language tags', () => {
    expect(resolveLocaleFromLanguageTag('en-US')).toBe('en')
    expect(resolveLocaleFromLanguageTag('es-MX')).toBe('es')
    expect(resolveLocaleFromLanguageTag('ru-RU')).toBe('ru')
    expect(resolveLocaleFromLanguageTag('zh-CN')).toBe('zh')
  })
})
