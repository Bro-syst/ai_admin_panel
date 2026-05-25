import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { agentConfigApi } from '@/modules/AgentConfig/api/agentConfigApi'
import { createDefaultAgentConfigPayload, useAgentConfigManager } from '@/modules/AgentConfig/model/useAgentConfigManager'
import { agentsApi } from '@/modules/Agents'

vi.mock('@/core/auth/useAuth', () => ({
  useAuth: () => ({
    adminUser: {
      role: 'platform_admin',
      permissions: [],
    },
  }),
}))

vi.mock('@/modules/Agents', () => ({
  agentsApi: {
    getPortalAgentDetail: vi.fn(),
  },
}))

vi.mock('@/modules/AgentConfig/api/agentConfigApi', () => ({
  agentConfigApi: {
    getActiveConfig: vi.fn(),
    listConfigs: vi.fn(),
    getConfigDetail: vi.fn(),
    createDraft: vi.fn(),
    createConfigVersion: vi.fn(),
    validateConfig: vi.fn(),
    activateConfig: vi.fn(),
    rollbackConfig: vi.fn(),
  },
}))

const getPortalAgentDetailMock = agentsApi.getPortalAgentDetail as unknown as ReturnType<typeof vi.fn>
const getActiveConfigMock = agentConfigApi.getActiveConfig as unknown as ReturnType<typeof vi.fn>
const listConfigsMock = agentConfigApi.listConfigs as unknown as ReturnType<typeof vi.fn>
const createDraftMock = agentConfigApi.createDraft as unknown as ReturnType<typeof vi.fn>
const createConfigVersionMock = agentConfigApi.createConfigVersion as unknown as ReturnType<typeof vi.fn>

function TestAgentConfigManager() {
  const manager = useAgentConfigManager('tenant_1', 'agent_1')

  return (
    <div>
      <span data-testid="loading">{String(manager.isLoading)}</span>
      <span data-testid="versions">{String(manager.versions.length)}</span>
      <button type="button" disabled={manager.isLoading} onClick={() => void manager.createVersion()}>
        create version
      </button>
    </div>
  )
}

function renderManager() {
  render(
    <I18nProvider>
      <TestAgentConfigManager />
    </I18nProvider>,
  )
}

describe('useAgentConfigManager flow', () => {
  beforeEach(() => {
    getPortalAgentDetailMock.mockReset()
    getActiveConfigMock.mockReset()
    listConfigsMock.mockReset()
    createDraftMock.mockReset()
    createConfigVersionMock.mockReset()
  })

  it('does not request active config when agent has none and creates config version through owner flow', async () => {
    const payload = createDefaultAgentConfigPayload('Sales assistant')
    getPortalAgentDetailMock.mockResolvedValue({
      agentId: 'agent_1',
      tenantId: 'tenant_1',
      name: 'Sales assistant',
      description: null,
      purpose: null,
      status: 'inactive',
      lifecycleStatus: 'draft',
      readinessStatus: 'blocked',
      templateId: 'sales_qualification_v1',
      activeConfigId: null,
      releaseReady: false,
      blockers: [],
      publicChannelEnabled: false,
      releaseHandoffTarget: null,
      supportedMutationActions: ['agent_config.manage'],
    })
    listConfigsMock.mockResolvedValue({
      items: [],
      metadata: {
        page: 1,
        pageSize: 20,
        totalItems: 0,
        returnedItems: 0,
        ordering: 'version_desc',
      },
    })
    createConfigVersionMock.mockResolvedValue({
      resource: {
        id: 'config_1',
        tenantId: 'tenant_1',
        agentId: 'agent_1',
        version: 1,
        status: 'inactive',
        payload,
        activatedAt: null,
      },
      result: {
        action: 'create_config_version',
        resourceType: 'agent_config',
        resourceId: 'config_1',
        actorId: 'admin_1',
        actorType: 'admin',
        tenantId: 'tenant_1',
        correlationId: 'corr_1',
        mutationTimestamp: '2026-05-19T10:00:00Z',
        changedStateSummary: {},
      },
    })

    renderManager()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(getActiveConfigMock).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'create version' }))

    await waitFor(() => expect(createConfigVersionMock).toHaveBeenCalledTimes(1))
    expect(createDraftMock).not.toHaveBeenCalled()
  })
})
