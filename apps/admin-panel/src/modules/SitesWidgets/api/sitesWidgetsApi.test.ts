import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/core/api/apiClient'
import { sitesWidgetsApi } from '@/modules/SitesWidgets/api/sitesWidgetsApi'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>
const postMock = apiClient.post as unknown as ReturnType<typeof vi.fn>
const patchMock = apiClient.patch as unknown as ReturnType<typeof vi.fn>

const mutationResult = {
  action: 'create_widget',
  resource_type: 'widget',
  resource_id: 'widget_1',
  actor_id: 'admin_1',
  actor_type: 'admin',
  tenant_id: 'tenant_1',
  correlation_id: 'corr_1',
  mutation_timestamp: '2026-05-13T10:00:00Z',
  changed_state_summary: { status: 'active' },
}

describe('sitesWidgetsApi', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
    patchMock.mockReset()
  })

  it('maps the backend portal sites/widgets status read model', async () => {
    getMock.mockResolvedValue({
      data: {
        agent_id: 'agent_1',
        readiness_status: 'ready',
        public_channel_required: true,
        public_channel_in_use: true,
        total_sites: 1,
        total_widgets: 1,
        issues: [],
        bindings: [
          {
            site_id: 'site_1',
            widget_id: 'widget_1',
            site_hostname: 'example.com',
            widget_key: 'sales_widget',
            site_status: 'active',
            widget_status: 'active',
            allowed_origins_count: 2,
            ready: true,
            issues: [],
          },
        ],
      },
    })

    await expect(sitesWidgetsApi.getStatus('tenant_1', 'agent_1')).resolves.toMatchObject({
      agentId: 'agent_1',
      readinessStatus: 'ready',
      publicChannelInUse: true,
      bindings: [{ widgetKey: 'sales_widget', ready: true }],
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/portal/tenants/tenant_1/agents/agent_1/sites-widgets')
  })

  it('creates sites using the backend mutation contract', async () => {
    postMock.mockResolvedValue({
      data: {
        resource: {
          id: 'site_1',
          tenant_id: 'tenant_1',
          hostname: 'example.com',
          external_allowed_origins: ['https://example.com'],
          status: 'active',
        },
        result: mutationResult,
      },
    })

    await expect(
      sitesWidgetsApi.createSite('tenant_1', {
        hostname: 'example.com',
        externalAllowedOrigins: ['https://example.com'],
      }),
    ).resolves.toMatchObject({
      resource: { id: 'site_1', hostname: 'example.com' },
      result: { correlationId: 'corr_1' },
    })

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/sites', {
      hostname: 'example.com',
      external_allowed_origins: ['https://example.com'],
    })
  })

  it('creates widgets and changes widget status through explicit admin endpoints', async () => {
    postMock.mockResolvedValue({
      data: {
        resource: {
          id: 'widget_1',
          tenant_id: 'tenant_1',
          site_id: 'site_1',
          agent_id: 'agent_1',
          widget_key: 'sales_widget',
          status: 'inactive',
        },
        result: mutationResult,
      },
    })
    patchMock.mockResolvedValue({
      data: {
        resource: {
          id: 'widget_1',
          tenant_id: 'tenant_1',
          site_id: 'site_1',
          agent_id: 'agent_1',
          widget_key: 'sales_widget',
          status: 'active',
        },
        result: { ...mutationResult, action: 'change_widget_status' },
      },
    })

    await expect(sitesWidgetsApi.createWidget('tenant_1', { siteId: 'site_1', agentId: 'agent_1', widgetKey: 'sales_widget' })).resolves.toMatchObject({
      resource: { widgetKey: 'sales_widget', status: 'inactive' },
    })
    await expect(sitesWidgetsApi.changeWidgetStatus('tenant_1', 'widget_1', 'active')).resolves.toMatchObject({
      resource: { status: 'active' },
      result: { action: 'change_widget_status' },
    })

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/widgets', {
      site_id: 'site_1',
      agent_id: 'agent_1',
      widget_key: 'sales_widget',
    })
    expect(patchMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/widgets/widget_1/status', { status: 'active' })
  })
})
