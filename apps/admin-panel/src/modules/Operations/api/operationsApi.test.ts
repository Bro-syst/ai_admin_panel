import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/core/api/apiClient'
import { operationsApi } from '@/modules/Operations/api/operationsApi'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>

const dashboardPayload = {
  generated_at: '2026-05-13T10:00:00Z',
  tenant_summary: {
    total_tenants: 10,
    active_tenants: 8,
    blocked_tenants: 1,
    failed_provisioning_tenants: 1,
  },
  agent_summary: {
    total_agents: 20,
    active_agents: 15,
    release_ready_agents: 12,
    blocked_agents: 2,
  },
  runtime_summary: {
    total_chats: 100,
    active_chats: 7,
    recent_runtime_degradation_count: 3,
    recent_failed_turn_count: 4,
  },
  release_summary: {
    owner_stage: 'stage_10',
    release_workflow_status: 'blocked',
    ready_agent_count: 12,
    blocking_agent_count: 2,
  },
  billing_export_summary: {
    owner_stage: 'stage_12',
    export_status: 'blocked',
    exported_tenant_count: 6,
    blocked_tenant_count: 1,
  },
}

const operationsPayload = {
  generated_at: '2026-05-13T10:00:00Z',
  failed_provisioning_tenants: 1,
  inactive_tenants: 2,
  degraded_agents: 3,
  ready_public_widget_bindings: 4,
  outstanding_setup_blockers: 5,
  result_classification: 'attention',
}

const platformSettingsPayload = {
  app_name: 'AI Core',
  app_version: '1.2.3',
  environment: 'local',
  api_prefix: '/api',
  debug_enabled: true,
  log_level: 'INFO',
  healthcheck_timeout_seconds: 3,
  redis_enabled: false,
}

describe('operationsApi', () => {
  beforeEach(() => {
    getMock.mockReset()
  })

  it('loads and maps the portal dashboard read model', async () => {
    getMock.mockResolvedValue({ data: dashboardPayload })

    await expect(operationsApi.getDashboard()).resolves.toMatchObject({
      generatedAt: '2026-05-13T10:00:00Z',
      tenantSummary: {
        activeTenants: 8,
        failedProvisioningTenants: 1,
      },
      releaseSummary: {
        ownerStage: 'stage_10',
        blockingAgentCount: 2,
      },
      billingExportSummary: {
        exportStatus: 'blocked',
        blockedTenantCount: 1,
      },
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/system/portal/dashboard')
  })

  it('loads and maps the portal operations read model', async () => {
    getMock.mockResolvedValue({ data: operationsPayload })

    await expect(operationsApi.getOperations()).resolves.toEqual({
      generatedAt: '2026-05-13T10:00:00Z',
      failedProvisioningTenants: 1,
      inactiveTenants: 2,
      degradedAgents: 3,
      readyPublicWidgetBindings: 4,
      outstandingSetupBlockers: 5,
      resultClassification: 'attention',
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/system/portal/operations')
  })

  it('loads and maps platform settings', async () => {
    getMock.mockResolvedValue({ data: platformSettingsPayload })

    await expect(operationsApi.getPlatformSettings()).resolves.toEqual({
      appName: 'AI Core',
      appVersion: '1.2.3',
      environment: 'local',
      apiPrefix: '/api',
      debugEnabled: true,
      logLevel: 'INFO',
      healthcheckTimeoutSeconds: 3,
      redisEnabled: false,
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/system/platform-settings')
  })
})
