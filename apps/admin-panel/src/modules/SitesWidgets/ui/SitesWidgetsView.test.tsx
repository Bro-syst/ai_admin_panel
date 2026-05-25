import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { I18nContext, type Locale } from '@/core/i18n/I18nContext'
import { messages } from '@/core/i18n/messages'
import type { SitesWidgetsManager } from '@/modules/SitesWidgets/model/useSitesWidgetsManager'
import { SitesWidgetsView } from '@/modules/SitesWidgets/ui/SitesWidgetsView'

function renderView(manager: Partial<SitesWidgetsManager> = {}, locale: Locale = 'en') {
  const defaultManager = {
    tenantId: 'tenant_1',
    agentId: 'agent_1',
    agentDetail: { agentId: 'agent_1', tenantId: 'tenant_1', name: 'Sales agent', supportedMutationActions: ['sites_widgets.manage'] },
    status: {
      agentId: 'agent_1',
      readinessStatus: 'ready',
      publicChannelRequired: true,
      publicChannelInUse: true,
      bindings: [
        {
          siteId: 'site_1',
          widgetId: 'widget_1',
          siteHostname: 'example.com',
          widgetKey: 'sales_widget',
          siteStatus: 'active',
          widgetStatus: 'active',
          allowedOriginsCount: 1,
          ready: true,
          issues: [],
        },
      ],
      totalSites: 1,
      totalWidgets: 1,
      issues: [],
    },
    sites: [{ id: 'site_1', tenantId: 'tenant_1', hostname: 'example.com', externalAllowedOrigins: ['https://example.com'], status: 'active' }],
    widgets: [{ id: 'widget_1', tenantId: 'tenant_1', siteId: 'site_1', agentId: 'agent_1', widgetKey: 'sales_widget', status: 'active' }],
    siteForm: { hostname: '', allowedOriginsText: '' },
    widgetForm: { siteId: 'site_1', widgetKey: '' },
    smokeForm: { widgetKey: 'sales_widget', messageText: 'hello' },
    smokeResult: {
      bootstrap: null,
      session: null,
      token: null,
      chatId: 'chat_1',
      inboundMessage: null,
      outboundMessage: null,
      outcomeClassification: 'accepted',
      replayClassification: 'new',
      correlationId: 'corr_1',
    },
    smokeError: null,
    mutationResult: null,
    mutationEvidence: null,
    canManageSitesWidgets: true,
    isLoading: false,
    isMutating: false,
    isSmoking: false,
    errorMessage: null,
    formError: null,
    notice: null,
    loadSitesWidgets: vi.fn(),
    setSiteForm: vi.fn(),
    setWidgetForm: vi.fn(),
    setSmokeForm: vi.fn(),
    createSite: vi.fn(),
    changeSiteStatus: vi.fn(),
    createWidget: vi.fn(),
    changeWidgetStatus: vi.fn(),
    runSmoke: vi.fn(),
    ...manager,
  } as unknown as SitesWidgetsManager

  render(
    <I18nContext.Provider value={{ locale, setLocale: vi.fn(), t: (key) => messages[locale][key] ?? key }}>
      <MemoryRouter initialEntries={['/tenants/tenant_1/agents/agent_1/sites-widgets']} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <SitesWidgetsView manager={defaultManager} />
      </MemoryRouter>
    </I18nContext.Provider>,
  )

  return defaultManager
}

describe('SitesWidgetsView', () => {
  it('renders backend status, install guidance and public smoke evidence without future links', () => {
    renderView()

    expect(screen.getByText('Sites & Widgets')).toBeInTheDocument()
    expect(screen.getByText('Public channel status')).toBeInTheDocument()
    expect(screen.getByText(/data-ai-core-widget-key="sales_widget"/)).toBeInTheDocument()
    expect(screen.getByText(/data-ai-core-site-hostname="example.com"/)).toBeInTheDocument()
    expect(screen.getByText('Allowed origins count')).toBeInTheDocument()
    expect(screen.getByText('chat_1')).toBeInTheDocument()
    expect(screen.getByText('corr_1')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Conversations/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Usage/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Billing/i })).not.toBeInTheDocument()
  })

  it('copies install guidance derived from backend binding values', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    renderView()

    await user.click(screen.getByRole('button', { name: 'Copy snippet' }))

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('data-ai-core-widget-key="sales_widget"'))
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('data-ai-core-site-id="site_1"'))
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('data-ai-core-widget-id="widget_1"'))
  })

  it('runs smoke and confirms status changes through manager actions', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const manager = renderView()

    await user.click(screen.getByRole('button', { name: 'Run smoke' }))
    await user.click(screen.getAllByRole('button', { name: 'Deactivate' })[0])

    expect(manager.runSmoke).toHaveBeenCalled()
    expect(confirmSpy).toHaveBeenCalledWith('Change site status to Inactive')
    expect(manager.changeSiteStatus).toHaveBeenCalledWith('site_1', 'inactive')
    confirmSpy.mockRestore()
  })

  it('disables mutation controls when backend action refs do not allow sites/widgets management', () => {
    renderView({ canManageSitesWidgets: false })

    expect(screen.getByRole('button', { name: 'Create site' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Create widget' })).toBeDisabled()
    expect(screen.getByText('Your role can inspect sites and widgets but cannot change them.')).toBeInTheDocument()
  })

  it('previews origins and disables widget creation until the key is valid', () => {
    renderView({
      siteForm: {
        hostname: 'example.com',
        allowedOriginsText: 'https://example.com\nhttp://localhost:5174\nhttps://example.com/path',
      },
      widgetForm: { siteId: 'site_1', widgetKey: 'Bad_Key' },
    })

    expect(screen.getAllByText('https://example.com').length).toBeGreaterThan(0)
    expect(screen.getByText('http://localhost:5174')).toBeInTheDocument()
    expect(screen.getByText('Allowed origins must start with http:// or https:// and must not include path, query, or hash.')).toBeInTheDocument()
    expect(screen.getByText('Widget key can contain only lowercase letters, digits, and hyphen.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create widget' })).toBeDisabled()
  })

  it('shows safe site creation evidence with copy controls', () => {
    renderView({
      mutationEvidence: {
        kind: 'site',
        result: {
          action: 'create_site',
          resourceType: 'site',
          resourceId: 'site_1',
          actorId: null,
          actorType: null,
          tenantId: 'tenant_1',
          correlationId: 'corr_site',
          mutationTimestamp: '2026-05-25T00:00:00Z',
          changedStateSummary: {},
        },
        site: {
          id: 'site_1',
          tenantId: 'tenant_1',
          hostname: 'example.com',
          externalAllowedOrigins: ['https://example.com'],
          status: 'active',
        },
      },
    })

    expect(screen.getByText('Created site evidence')).toBeInTheDocument()
    expect(screen.getAllByText('Create site').length).toBeGreaterThan(0)
    expect(screen.getAllByText('example.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('https://example.com').length).toBeGreaterThan(0)
    expect(screen.getByText('corr_site')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Copy' }).length).toBeGreaterThan(0)
  })

  it('localizes statuses, issues and smoke result values in Russian', () => {
    renderView(
      {
        status: {
          agentId: 'agent_1',
          readinessStatus: 'pending',
          publicChannelRequired: true,
          publicChannelInUse: false,
          bindings: [],
          totalSites: 0,
          totalWidgets: 0,
          issues: ['Public channel requires tenant-owned site/widget binding.'],
        },
        smokeResult: {
          bootstrap: null,
          session: null,
          token: null,
          chatId: 'chat_1',
          inboundMessage: null,
          outboundMessage: null,
          outcomeClassification: 'accepted',
          replayClassification: 'new',
          correlationId: 'corr_1',
        },
      },
      'ru',
    )

    expect(screen.getByText('Сайты и виджеты')).toBeInTheDocument()
    expect(screen.getByText('Ожидает настройки')).toBeInTheDocument()
    expect(screen.getByText('Создайте сайт тенанта и привяжите к нему публичный виджет.')).toBeInTheDocument()
    expect(screen.getByText('Принято')).toBeInTheDocument()
    expect(screen.getByText('Новый запрос')).toBeInTheDocument()
    expect(screen.queryByText('Public channel requires tenant-owned site/widget binding.')).not.toBeInTheDocument()
    expect(screen.queryByText('pending')).not.toBeInTheDocument()
  })
})
