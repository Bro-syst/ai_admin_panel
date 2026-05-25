import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import type { OperationsManager } from '@/modules/Operations/model/useOperationsManager'
import { OperationsView } from '@/modules/Operations/ui/OperationsView'

function renderView(manager: Partial<OperationsManager> = {}) {
  const defaultManager = {
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
    errorMessage: null,
    loadOperations: vi.fn(),
    ...manager,
  } as unknown as OperationsManager

  render(
    <I18nProvider>
      <OperationsView manager={defaultManager} />
    </I18nProvider>,
  )

  return defaultManager
}

describe('OperationsView', () => {
  it('renders operations and platform settings read models', () => {
    renderView()

    expect(screen.getByText('Operations snapshot')).toBeInTheDocument()
    expect(screen.getAllByText('attention').length).toBeGreaterThan(0)
    expect(screen.getByText('Ready public widget bindings')).toBeInTheDocument()
    expect(screen.getByText('AI Core')).toBeInTheDocument()
    expect(screen.getByText('/api')).toBeInTheDocument()
  })

  it('supports refresh and error states', async () => {
    const user = userEvent.setup()
    const manager = renderView({
      operations: null,
      platformSettings: null,
      isLoading: false,
      errorMessage: 'Failed operations',
    })

    expect(screen.getByText('Failed operations')).toBeInTheDocument()
    expect(screen.getByText('Operations summary is not available.')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Retry' }))
    expect(manager.loadOperations).toHaveBeenCalledTimes(1)
  })
})
