import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { agentConfigApi } from '@/modules/AgentConfig/api/agentConfigApi'
import { createDefaultAgentConfigPayload, useAgentConfigManager } from '@/modules/AgentConfig/model/useAgentConfigManager'
import { agentsApi } from '@/modules/Agents'
import { formMetadataBridgeApi, type FormMetadata } from '@/modules/FormMetadata'

let authAdminUser: { role: string; permissions?: string[] } | null = {
  role: 'platform_admin',
  permissions: [],
}

vi.mock('@/core/auth/useAuth', () => ({
  useAuth: () => ({
    adminUser: authAdminUser,
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

vi.mock('@/modules/FormMetadata', () => ({
  formMetadataBridgeApi: {
    getFormMetadata: vi.fn(),
  },
}))

const getPortalAgentDetailMock = agentsApi.getPortalAgentDetail as unknown as ReturnType<typeof vi.fn>
const getActiveConfigMock = agentConfigApi.getActiveConfig as unknown as ReturnType<typeof vi.fn>
const listConfigsMock = agentConfigApi.listConfigs as unknown as ReturnType<typeof vi.fn>
const createDraftMock = agentConfigApi.createDraft as unknown as ReturnType<typeof vi.fn>
const createConfigVersionMock = agentConfigApi.createConfigVersion as unknown as ReturnType<typeof vi.fn>
const getConfigDetailMock = agentConfigApi.getConfigDetail as unknown as ReturnType<typeof vi.fn>
const validateConfigMock = agentConfigApi.validateConfig as unknown as ReturnType<typeof vi.fn>
const activateConfigMock = agentConfigApi.activateConfig as unknown as ReturnType<typeof vi.fn>
const rollbackConfigMock = agentConfigApi.rollbackConfig as unknown as ReturnType<typeof vi.fn>
const getFormMetadataMock = formMetadataBridgeApi.getFormMetadata as unknown as ReturnType<typeof vi.fn>

const agentConfigMetadata = {
  formId: 'agent_config',
  formVersion: '1.0',
  schemaVersion: '1.0',
  cachePolicy: { safeToCache: true, scope: 'tenant_agent', varyBy: ['tenant_id', 'agent_id'] },
  optionSources: {},
  backendValidation: { authoritative: true },
  extensions: {},
  fields: [
    metadataField('tone_and_language.tone', 'clear_and_helpful'),
    metadataField('tone_and_language.language', 'en'),
    metadataField('handoff_policy.handoff_enabled', true),
    metadataField('integration_policy.integration_enabled', false),
    metadataField('model_preference.latency_sensitivity', 'medium'),
    metadataField('model_preference.quality_sensitivity', 'medium'),
    metadataField('model_preference.cost_sensitivity', 'medium'),
    metadataField('model_selection_hints.fallback_allowed', true),
    metadataField('execution_profile_hints.profile_name', 'default'),
    metadataField('execution_profile_hints.response_mode', 'balanced'),
    metadataField('compatibility_and_safety.config_schema_version', '1.0'),
    metadataField('compatibility_and_safety.safety_labels', ['baseline']),
  ],
} satisfies FormMetadata

function metadataField(payloadPath: string, defaultValue: string | boolean | string[] | null): FormMetadata['fields'][number] {
  return {
    fieldId: payloadPath,
    payloadPath,
    control: 'select',
    required: false,
    defaultValue,
    localizationKey: `forms.agent_config.fields.${payloadPath}`,
    helpKey: null,
    options: [],
    constraints: {},
    readonly: false,
    extensions: {},
  }
}

function TestAgentConfigManager() {
  const manager = useAgentConfigManager('tenant_1', 'agent_1')

  return (
    <div>
      <span data-testid="loading">{String(manager.isLoading)}</span>
      <span data-testid="versions">{String(manager.versions.length)}</span>
      <span data-testid="form-error">{manager.formError ?? ''}</span>
      <span data-testid="notice">{manager.notice ?? ''}</span>
      <span data-testid="can-activate">{String(manager.canActivateSelected)}</span>
      <span data-testid="can-manage">{String(manager.canManageConfig)}</span>
      <span data-testid="error-message">{manager.errorMessage ?? ''}</span>
      <span data-testid="selected-config">{manager.selectedConfig?.id ?? ''}</span>
      <span data-testid="active-config">{manager.activeConfig?.id ?? ''}</span>
      <span data-testid="draft-label">{manager.draftPayload.identity.agentLabel}</span>
      <span data-testid="mutation-status">{manager.mutationResult?.status ?? ''}</span>
      <button type="button" onClick={() => manager.updateDraftPayload((current) => ({ ...current, identity: { ...current.identity, agentLabel: '' } }))}>
        clear label
      </button>
      <button type="button" onClick={() => manager.updateDraftPayload((current) => ({ ...current, identity: { ...current.identity, agentLabel: 'Sales assistant' } }))}>
        restore label
      </button>
      <button type="button" disabled={manager.isLoading} onClick={() => void manager.createDraft()}>
        create draft
      </button>
      <button type="button" disabled={manager.isLoading} onClick={() => void manager.createVersion()}>
        create version
      </button>
      <button type="button" disabled={manager.isLoading} onClick={() => void manager.selectConfig('config_missing')}>
        select missing config
      </button>
      <button type="button" disabled={manager.isLoading} onClick={() => void manager.selectConfig('config_1')}>
        select config
      </button>
      <button type="button" disabled={manager.isLoading} onClick={() => manager.resetDraftFromSelected()}>
        reset draft
      </button>
      <button type="button" disabled={manager.isLoading} onClick={() => void manager.validateSelected()}>
        validate selected
      </button>
      <button type="button" disabled={manager.isLoading} onClick={() => void manager.activateSelected()}>
        activate selected
      </button>
      <button type="button" disabled={manager.isLoading} onClick={() => void manager.rollbackSelected()}>
        rollback selected
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
    authAdminUser = {
      role: 'platform_admin',
      permissions: [],
    }
    getPortalAgentDetailMock.mockReset()
    getActiveConfigMock.mockReset()
    listConfigsMock.mockReset()
    getConfigDetailMock.mockReset()
    createDraftMock.mockReset()
    createConfigVersionMock.mockReset()
    validateConfigMock.mockReset()
    activateConfigMock.mockReset()
    rollbackConfigMock.mockReset()
    getFormMetadataMock.mockReset()
    getFormMetadataMock.mockResolvedValue(agentConfigMetadata)
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
    expect(getFormMetadataMock).toHaveBeenCalledWith({
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      formId: 'agent_config',
    })
    expect(getActiveConfigMock).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'create version' }))

    await waitFor(() => expect(createConfigVersionMock).toHaveBeenCalledTimes(1))
    expect(createDraftMock).not.toHaveBeenCalled()
  })

  it('loads active config when backend exposes activeConfigId and resets draft from selection', async () => {
    const activePayload = createDefaultAgentConfigPayload('Active label')
    getPortalAgentDetailMock.mockResolvedValue({
      agentId: 'agent_1',
      tenantId: 'tenant_1',
      name: 'Sales assistant',
      status: 'active',
      lifecycleStatus: 'active',
      activeConfigId: 'config_active',
      supportedMutationActions: ['agent_config.manage'],
    })
    listConfigsMock.mockResolvedValue({
      items: [{ id: 'config_active', tenantId: 'tenant_1', agentId: 'agent_1', version: 2, status: 'active' }],
      metadata: {
        page: 1,
        pageSize: 20,
        totalItems: 1,
        returnedItems: 1,
        ordering: 'version_desc',
      },
    })
    getActiveConfigMock.mockResolvedValue({
      id: 'config_active',
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      version: 2,
      status: 'active',
      payload: activePayload,
      activatedAt: '2026-05-19T10:00:00Z',
    })

    renderManager()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(getActiveConfigMock).toHaveBeenCalledWith('tenant_1', 'agent_1')
    expect(getConfigDetailMock).not.toHaveBeenCalled()
    expect(screen.getByTestId('active-config')).toHaveTextContent('config_active')
    expect(screen.getByTestId('selected-config')).toHaveTextContent('config_active')
    expect(screen.getByTestId('draft-label')).toHaveTextContent('Active label')

    await userEvent.click(screen.getByRole('button', { name: 'clear label' }))
    expect(screen.getByTestId('draft-label')).toHaveTextContent('')

    await userEvent.click(screen.getByRole('button', { name: 'reset draft' }))
    expect(screen.getByTestId('draft-label')).toHaveTextContent('Active label')
  })

  it('validates, activates and rolls back the selected config with mutation evidence', async () => {
    const payload = createDefaultAgentConfigPayload('Sales assistant')
    const config = {
      id: 'config_1',
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      version: 1,
      status: 'inactive',
      payload,
      activatedAt: null,
    }
    getPortalAgentDetailMock.mockResolvedValue({
      agentId: 'agent_1',
      tenantId: 'tenant_1',
      name: 'Sales assistant',
      status: 'inactive',
      lifecycleStatus: 'draft',
      activeConfigId: null,
      supportedMutationActions: ['agent_config.manage'],
    })
    listConfigsMock.mockResolvedValue({
      items: [{ id: 'config_1', tenantId: 'tenant_1', agentId: 'agent_1', version: 1, status: 'inactive' }],
      metadata: {
        page: 1,
        pageSize: 20,
        totalItems: 1,
        returnedItems: 1,
        ordering: 'version_desc',
      },
    })
    getConfigDetailMock.mockResolvedValue(config)
    validateConfigMock.mockResolvedValue({
      validationStatus: 'valid',
      compatibilityStatus: 'compatible',
      processingPath: 'historical',
      normalized: true,
      safeDefaultsApplied: false,
      fallbackEligible: false,
      provenanceMarker: 'backend',
      issues: [],
      compatibilityNotes: [],
    })
    activateConfigMock.mockResolvedValue({
      resource: { ...config, status: 'active', version: 2 },
      result: {
        action: 'activate_config',
        resourceType: 'agent_config',
        resourceId: 'config_1',
        actorId: 'admin_1',
        actorType: 'admin',
        tenantId: 'tenant_1',
        correlationId: 'corr_activate',
        mutationTimestamp: '2026-05-19T10:00:00Z',
        changedStateSummary: {},
      },
    })
    rollbackConfigMock.mockResolvedValue({
      resource: config,
      result: {
        action: 'rollback_config',
        resourceType: 'agent_config',
        resourceId: 'config_1',
        actorId: 'admin_1',
        actorType: 'admin',
        tenantId: 'tenant_1',
        requestId: 'req_rollback',
        mutationTimestamp: '2026-05-19T10:05:00Z',
        changedStateSummary: {},
      },
    })

    renderManager()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))

    await userEvent.click(screen.getByRole('button', { name: 'validate selected' }))
    await waitFor(() => expect(validateConfigMock).toHaveBeenCalledWith('tenant_1', 'agent_1', 'config_1'))
    expect(screen.getByTestId('can-activate')).toHaveTextContent('true')

    await userEvent.click(screen.getByRole('button', { name: 'activate selected' }))
    await waitFor(() => expect(activateConfigMock).toHaveBeenCalledWith('tenant_1', 'agent_1', 'config_1'))
    expect(screen.getByTestId('mutation-status')).toHaveTextContent('active')

    await userEvent.click(screen.getByRole('button', { name: 'rollback selected' }))
    await waitFor(() => expect(rollbackConfigMock).toHaveBeenCalledWith('tenant_1', 'agent_1', 'config_1'))
  })

  it('blocks create and activation actions when validation prerequisites are missing', async () => {
    const payload = createDefaultAgentConfigPayload('Sales assistant')
    getPortalAgentDetailMock.mockResolvedValue({
      agentId: 'agent_1',
      tenantId: 'tenant_1',
      name: 'Sales assistant',
      status: 'inactive',
      lifecycleStatus: 'draft',
      activeConfigId: null,
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
    createDraftMock.mockResolvedValue({
      resource: {
        id: 'draft_1',
        tenantId: 'tenant_1',
        agentId: 'agent_1',
        version: 1,
        status: 'draft',
        payload,
        activatedAt: null,
      },
      result: {
        action: 'create_config_draft',
        resourceType: 'agent_config',
        resourceId: 'draft_1',
        actorId: 'admin_1',
        actorType: 'admin',
        tenantId: 'tenant_1',
        correlationId: 'corr_draft',
        mutationTimestamp: '2026-05-19T10:10:00Z',
        changedStateSummary: {},
      },
    })

    renderManager()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))

    await userEvent.click(screen.getByRole('button', { name: 'activate selected' }))
    expect(screen.getByTestId('form-error')).toHaveTextContent('Validate the selected config before activation.')

    await userEvent.click(screen.getByRole('button', { name: 'validate selected' }))
    expect(screen.getByTestId('form-error')).toHaveTextContent('This backend read model does not allow config changes for the current agent state.')

    await userEvent.click(screen.getByRole('button', { name: 'rollback selected' }))
    expect(screen.getByTestId('form-error')).toHaveTextContent('This backend read model does not allow config changes for the current agent state.')

    await userEvent.click(screen.getByRole('button', { name: 'clear label' }))
    await userEvent.click(screen.getByRole('button', { name: 'create version' }))
    expect(screen.getByTestId('form-error')).toHaveTextContent('Enter agent label.')

    await userEvent.click(screen.getByRole('button', { name: 'create draft' }))
    expect(screen.getByTestId('form-error')).toHaveTextContent('Enter agent label.')

    await userEvent.click(screen.getByRole('button', { name: 'restore label' }))
    await userEvent.click(screen.getByRole('button', { name: 'create draft' }))
    await waitFor(() => expect(createDraftMock).toHaveBeenCalledTimes(1))
  })

  it('blocks draft and version mutations when admin or backend action refs do not allow config management', async () => {
    authAdminUser = null
    getPortalAgentDetailMock.mockResolvedValue({
      agentId: 'agent_1',
      tenantId: 'tenant_1',
      name: 'Sales assistant',
      status: 'inactive',
      lifecycleStatus: 'draft',
      activeConfigId: null,
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

    renderManager()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('can-manage')).toHaveTextContent('false')

    await userEvent.click(screen.getByRole('button', { name: 'create draft' }))
    expect(screen.getByTestId('form-error')).toHaveTextContent('This backend read model does not allow config changes for the current agent state.')

    await userEvent.click(screen.getByRole('button', { name: 'create version' }))
    expect(screen.getByTestId('form-error')).toHaveTextContent('This backend read model does not allow config changes for the current agent state.')
    expect(createDraftMock).not.toHaveBeenCalled()
    expect(createConfigVersionMock).not.toHaveBeenCalled()
  })

  it('surfaces load and selected config detail errors without losing loading state completion', async () => {
    getPortalAgentDetailMock.mockResolvedValue({
      agentId: 'agent_1',
      tenantId: 'tenant_1',
      name: 'Sales assistant',
      status: 'inactive',
      lifecycleStatus: 'draft',
      activeConfigId: null,
      supportedMutationActions: ['agent_config.manage'],
    })
    listConfigsMock.mockResolvedValueOnce({
      items: [{ id: 'config_missing', tenantId: 'tenant_1', agentId: 'agent_1', version: 1, status: 'inactive' }],
      metadata: {
        page: 1,
        pageSize: 20,
        totalItems: 1,
        returnedItems: 1,
        ordering: 'version_desc',
      },
    })
    getConfigDetailMock.mockRejectedValue(new Error('config detail failed'))

    renderManager()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('error-message')).toHaveTextContent('config detail failed')

    await userEvent.click(screen.getByRole('button', { name: 'select missing config' }))
    await waitFor(() => expect(getConfigDetailMock).toHaveBeenCalledTimes(2))
    expect(screen.getByTestId('form-error')).toHaveTextContent('config detail failed')
  })

  it('selects another config version and updates the draft payload', async () => {
    const firstPayload = createDefaultAgentConfigPayload('First label')
    const selectedPayload = createDefaultAgentConfigPayload('Selected label')
    getPortalAgentDetailMock.mockResolvedValue({
      agentId: 'agent_1',
      tenantId: 'tenant_1',
      name: 'Sales assistant',
      status: 'inactive',
      lifecycleStatus: 'draft',
      activeConfigId: null,
      supportedMutationActions: ['agent_config.manage'],
    })
    listConfigsMock.mockResolvedValue({
      items: [
        { id: 'config_first', tenantId: 'tenant_1', agentId: 'agent_1', version: 2, status: 'inactive' },
        { id: 'config_1', tenantId: 'tenant_1', agentId: 'agent_1', version: 1, status: 'inactive' },
      ],
      metadata: {
        page: 1,
        pageSize: 20,
        totalItems: 2,
        returnedItems: 2,
        ordering: 'version_desc',
      },
    })
    getConfigDetailMock
      .mockResolvedValueOnce({
        id: 'config_first',
        tenantId: 'tenant_1',
        agentId: 'agent_1',
        version: 2,
        status: 'inactive',
        payload: firstPayload,
        activatedAt: null,
      })
      .mockResolvedValueOnce({
        id: 'config_1',
        tenantId: 'tenant_1',
        agentId: 'agent_1',
        version: 1,
        status: 'inactive',
        payload: selectedPayload,
        activatedAt: null,
      })

    renderManager()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('selected-config')).toHaveTextContent('config_first')
    expect(screen.getByTestId('draft-label')).toHaveTextContent('First label')

    await userEvent.click(screen.getByRole('button', { name: 'select config' }))

    await waitFor(() => expect(screen.getByTestId('selected-config')).toHaveTextContent('config_1'))
    expect(screen.getByTestId('draft-label')).toHaveTextContent('Selected label')
  })

  it('surfaces agent read model failures after the metadata bridge response resolves', async () => {
    getPortalAgentDetailMock.mockRejectedValue(new Error('agent failed'))
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

    renderManager()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('error-message')).toHaveTextContent('agent failed')
  })

  it('surfaces version list failures after loading the agent read model', async () => {
    getPortalAgentDetailMock.mockResolvedValue({
      agentId: 'agent_1',
      tenantId: 'tenant_1',
      name: 'Sales assistant',
      status: 'inactive',
      lifecycleStatus: 'draft',
      activeConfigId: null,
      supportedMutationActions: ['agent_config.manage'],
    })
    listConfigsMock.mockRejectedValue(new Error('list failed'))

    renderManager()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('error-message')).toHaveTextContent('list failed')
    expect(screen.getByTestId('versions')).toHaveTextContent('0')
    expect(screen.getByTestId('selected-config')).toHaveTextContent('')
  })

  it('surfaces mutation errors while keeping failed mutation evidence empty', async () => {
    getPortalAgentDetailMock.mockResolvedValue({
      agentId: 'agent_1',
      tenantId: 'tenant_1',
      name: 'Sales assistant',
      status: 'inactive',
      lifecycleStatus: 'draft',
      activeConfigId: null,
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
    createConfigVersionMock.mockRejectedValue(new Error('create version failed'))

    renderManager()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    expect(screen.getByTestId('draft-label')).toHaveTextContent('Sales assistant')

    await userEvent.click(screen.getByRole('button', { name: 'create version' }))

    await waitFor(() => expect(createConfigVersionMock).toHaveBeenCalledTimes(1))
    expect(screen.getByTestId('form-error')).toHaveTextContent('create version failed')
    expect(screen.getByTestId('mutation-status')).toHaveTextContent('')
  })

  it('shows backend validation errors for the selected config', async () => {
    const payload = createDefaultAgentConfigPayload('Sales assistant')
    getPortalAgentDetailMock.mockResolvedValue({
      agentId: 'agent_1',
      tenantId: 'tenant_1',
      name: 'Sales assistant',
      status: 'inactive',
      lifecycleStatus: 'draft',
      activeConfigId: null,
      supportedMutationActions: ['agent_config.manage'],
    })
    listConfigsMock.mockResolvedValue({
      items: [{ id: 'config_1', tenantId: 'tenant_1', agentId: 'agent_1', version: 1, status: 'inactive' }],
      metadata: {
        page: 1,
        pageSize: 20,
        totalItems: 1,
        returnedItems: 1,
        ordering: 'version_desc',
      },
    })
    getConfigDetailMock.mockResolvedValue({
      id: 'config_1',
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      version: 1,
      status: 'inactive',
      payload,
      activatedAt: null,
    })
    validateConfigMock.mockRejectedValue(new Error('validation failed'))

    renderManager()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    await userEvent.click(screen.getByRole('button', { name: 'validate selected' }))

    await waitFor(() => expect(validateConfigMock).toHaveBeenCalledTimes(1))
    expect(screen.getByTestId('form-error')).toHaveTextContent('validation failed')
  })
})
