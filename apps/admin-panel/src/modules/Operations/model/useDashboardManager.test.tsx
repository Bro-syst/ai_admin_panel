import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { useDashboardManager } from './useDashboardManager'

vi.mock('@/modules/Operations/api/operationsApi', () => ({
  operationsApi: {
    getDashboard: vi.fn(),
    getOperations: vi.fn(),
    getPlatformSettings: vi.fn(),
  },
}))

import { operationsApi } from '@/modules/Operations/api/operationsApi'

const getDashboardMock = operationsApi.getDashboard as unknown as ReturnType<typeof vi.fn>
const getOperationsMock = operationsApi.getOperations as unknown as ReturnType<typeof vi.fn>
const getPlatformSettingsMock = operationsApi.getPlatformSettings as unknown as ReturnType<typeof vi.fn>

function TestDashboardManager() {
  const manager = useDashboardManager()
  return (
    <div>
      <span data-testid="loading">{String(manager.isLoading)}</span>
      <span data-testid="error">{manager.errorMessage ?? 'none'}</span>
      <span data-testid="dashboard">{manager.dashboard ? 'loaded' : 'missing'}</span>
      <span data-testid="operations">{manager.operations ? 'loaded' : 'missing'}</span>
      <span data-testid="platform-settings">{manager.platformSettings ? 'loaded' : 'missing'}</span>
    </div>
  )
}

function renderManager() {
  render(
    <I18nProvider>
      <TestDashboardManager />
    </I18nProvider>,
  )
}

describe('useDashboardManager', () => {
  it('keeps dashboard usable when optional platform settings fail', async () => {
    getDashboardMock.mockResolvedValue({
      generatedAt: '2026-05-13T10:00:00Z',
      tenantSummary: {
        totalTenants: 1,
        activeTenants: 1,
        blockedTenants: 0,
        failedProvisioningTenants: 0,
      },
      agentSummary: {
        totalAgents: 1,
        activeAgents: 1,
        releaseReadyAgents: 1,
        blockedAgents: 0,
      },
      runtimeSummary: {
        totalChats: 1,
        activeChats: 1,
        recentRuntimeDegradationCount: 0,
        recentFailedTurnCount: 0,
      },
      releaseSummary: {
        ownerStage: 'stage_10',
        releaseWorkflowStatus: 'ready',
        readyAgentCount: 1,
        blockingAgentCount: 0,
      },
      billingExportSummary: {
        ownerStage: 'stage_12',
        exportStatus: 'ready',
        exportedTenantCount: 1,
        blockedTenantCount: 0,
      },
    })
    getOperationsMock.mockResolvedValue({
      generatedAt: '2026-05-13T10:00:00Z',
      failedProvisioningTenants: 0,
      inactiveTenants: 0,
      degradedAgents: 0,
      readyPublicWidgetBindings: 1,
      outstandingSetupBlockers: 0,
      resultClassification: 'ready',
    })
    getPlatformSettingsMock.mockRejectedValue({
      kind: 'forbidden',
      code: 'permission_denied',
    })

    renderManager()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))

    expect(screen.getByTestId('dashboard')).toHaveTextContent('loaded')
    expect(screen.getByTestId('operations')).toHaveTextContent('loaded')
    expect(screen.getByTestId('platform-settings')).toHaveTextContent('missing')
    expect(screen.getByTestId('error')).toHaveTextContent('none')
  })
})
