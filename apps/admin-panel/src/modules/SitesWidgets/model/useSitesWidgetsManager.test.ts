import { describe, expect, it } from 'vitest'
import {
  deriveSitesWidgetsCanManage,
  isValidWidgetKey,
  parseAllowedOriginsText,
} from '@/modules/SitesWidgets/model/useSitesWidgetsManager'

describe('deriveSitesWidgetsCanManage', () => {
  it('allows sites/widgets mutations only when role and backend action refs both allow them', () => {
    expect(deriveSitesWidgetsCanManage(['sites_widgets.manage'], true)).toBe(true)
    expect(deriveSitesWidgetsCanManage(['widgets.manage'], true)).toBe(true)
    expect(deriveSitesWidgetsCanManage(['releases.manage'], true)).toBe(false)
    expect(deriveSitesWidgetsCanManage(['sites_widgets.manage'], false)).toBe(false)
  })
})

describe('sites/widgets form helpers', () => {
  it('accepts http/https origins without paths and preserves ports', () => {
    expect(parseAllowedOriginsText('https://example.com\nhttp://localhost:5174').origins).toEqual([
      'https://example.com',
      'http://localhost:5174',
    ])
    expect(parseAllowedOriginsText('https://example.com/path\nftp://example.com\nhttps://example.com?x=1').invalidLines).toEqual([
      'https://example.com/path',
      'ftp://example.com',
      'https://example.com?x=1',
    ])
  })

  it('accepts only lowercase widget keys with digits and hyphen', () => {
    expect(isValidWidgetKey('sales-widget-1')).toBe(true)
    expect(isValidWidgetKey('SalesWidget')).toBe(false)
    expect(isValidWidgetKey('sales_widget')).toBe(false)
    expect(isValidWidgetKey('-sales-widget')).toBe(false)
  })
})
