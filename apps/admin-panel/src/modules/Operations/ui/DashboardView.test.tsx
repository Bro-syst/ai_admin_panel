import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import type { DashboardManager } from '@/modules/Operations/model/useDashboardManager'
import { DashboardView } from '@/modules/Operations/ui/DashboardView'

function renderView(manager: Partial<DashboardManager> = {}) {
  const defaultManager = {
    dashboard: {
      generatedAt: '2026-05-13T10:00:00Z',
      tenantSummary: {
        totalTenants: 10,
        activeTenants: 8,
        blockedTenants: 1,
        failedProvisioningTenants: 1,
      },
      agentSummary: {
        totalAgents: 20,
        activeAgents: 15,
        releaseReadyAgents: 12,
        blockedAgents: 2,
      },
      runtimeSummary: {
        totalChats: 100,
        activeChats: 7,
        recentRuntimeDegradationCount: 3,
        recentFailedTurnCount: 4,
      },
      releaseSummary: {
        ownerStage: 'stage_10',
        releaseWorkflowStatus: 'blocked',
        readyAgentCount: 12,
        blockingAgentCount: 2,
      },
      billingExportSummary: {
        ownerStage: 'stage_12',
        exportStatus: 'blocked',
        exportedTenantCount: 6,
        blockedTenantCount: 1,
      },
    },
    operations: {
      generatedAt: '2026-05-13T10:00:00Z',
      failedProvisioningTenants: 1,
      inactiveTenants: 2,
      degradedAgents: 3,
      readyPublicWidgetBindings: 4,
      outstandingSetupBlockers: 5,
      resultClassification: 'attention',
    },
    platformSettings: {
      appName: 'AI Core',
      appVersion: '1.2.3',
      environment: 'local',
      apiPrefix: '/api',
      debugEnabled: true,
      logLevel: 'INFO',
      healthcheckTimeoutSeconds: 3,
      redisEnabled: false,
    },
    isLoading: false,
    isLowData: false,
    errorMessage: null,
    loadDashboard: vi.fn(),
    ...manager,
  } as unknown as DashboardManager

  render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/dashboard']} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <DashboardView manager={defaultManager} />
      </MemoryRouter>
    </I18nProvider>,
  )

  return defaultManager
}

describe('DashboardView', () => {
  it('renders backend dashboard summaries and implemented quick links only', () => {
    renderView()

    expect(screen.getByText('Active tenants')).toBeInTheDocument()
    expect(screen.getByText('Release blockers: 2')).toBeInTheDocument()
    expect(screen.getByText('attention')).toBeInTheDocument()
    expect(screen.getByText('AI Core')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tenants' })).toHaveAttribute('href', '/tenants')
    expect(screen.getByRole('link', { name: 'Operations' })).toHaveAttribute('href', '/operations')
    expect(screen.queryByRole('link', { name: 'Agents' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Billing Export' })).not.toBeInTheDocument()
  })

  it('renders loading, error and low-data states', async () => {
    const user = userEvent.setup()
    const manager = renderView({
      dashboard: null,
      operations: null,
      platformSettings: null,
      isLoading: true,
      isLowData: true,
      errorMessage: 'Failed',
    })

    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(screen.getByText('Failed')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(manager.loadDashboard).toHaveBeenCalledTimes(1)
  })
})
