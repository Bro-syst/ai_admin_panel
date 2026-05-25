import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { createDefaultAgentConfigPayload, type AgentConfigManager } from '@/modules/AgentConfig/model/useAgentConfigManager'
import { AgentConfigView } from '@/modules/AgentConfig/ui/AgentConfigView'

function renderView(manager: Partial<AgentConfigManager> = {}, locale = 'en') {
  window.localStorage.setItem('ai_admin_panel:locale_v1', locale)
  const payload = createDefaultAgentConfigPayload('Sales assistant')
  const defaultManager = {
    tenantId: 'tenant_1',
    agentId: 'agent_1',
    agentDetail: {
      agentId: 'agent_1',
      tenantId: 'tenant_1',
      name: 'Sales assistant',
      supportedMutationActions: ['agent_config.manage'],
    },
    activeConfig: {
      id: 'config_active',
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      version: 2,
      status: 'active',
      payload,
      activatedAt: '2026-05-13T10:00:00Z',
    },
    versions: [
      { id: 'config_active', tenantId: 'tenant_1', agentId: 'agent_1', version: 2, status: 'active' },
      { id: 'config_1', tenantId: 'tenant_1', agentId: 'agent_1', version: 1, status: 'inactive' },
    ],
    selectedConfig: {
      id: 'config_1',
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      version: 1,
      status: 'inactive',
      payload,
      activatedAt: null,
    },
    draftPayload: payload,
    validationState: null,
    mutationResult: null,
    canManageConfig: true,
    canActivateSelected: false,
    isLoading: false,
    isMutating: false,
    errorMessage: null,
    formError: null,
    notice: null,
    loadConfig: vi.fn(),
    selectConfig: vi.fn(),
    updateDraftPayload: vi.fn(),
    resetDraftFromSelected: vi.fn(),
    createDraft: vi.fn(),
    createVersion: vi.fn(),
    validateSelected: vi.fn(),
    activateSelected: vi.fn(),
    rollbackSelected: vi.fn(),
    ...manager,
  } as unknown as AgentConfigManager

  render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/tenants/tenant_1/agents/agent_1/config']} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <AgentConfigView manager={defaultManager} />
      </MemoryRouter>
    </I18nProvider>,
  )

  return defaultManager
}

describe('AgentConfigView', () => {
  it('renders active config, version history and approved schema fields', () => {
    renderView()

    expect(screen.getAllByText('Active config').length).toBeGreaterThan(0)
    expect(screen.getByText('Version history')).toBeInTheDocument()
    expect(screen.getByLabelText('Agent label')).toHaveValue('Sales assistant')
    expect(screen.getByLabelText('Tone')).toHaveValue('clear_and_helpful')
    expect(screen.getByLabelText('Preferred model family')).toHaveValue('')
    expect(screen.getByLabelText('Profile name')).toHaveValue('')
    expect(screen.getByLabelText('Response mode')).toHaveValue('')
    expect(screen.getByLabelText('Schema version')).toHaveValue('1.0')
    expect(screen.getByLabelText('Schema version')).toBeDisabled()
    expect(screen.getByLabelText('Chat')).not.toBeChecked()
    expect(screen.getByLabelText('Reasoning')).not.toBeChecked()
    expect(screen.getByLabelText('Baseline')).not.toBeChecked()
    expect(screen.getByLabelText('Public widget')).not.toBeChecked()
    expect(screen.getByLabelText('Controlled smoke')).not.toBeChecked()
    expect(screen.getByText('Draft payload')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Knowledge/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Releases/i })).not.toBeInTheDocument()
  })

  it('renders the config page in Russian without raw operator-facing enum labels', () => {
    const payload = createDefaultAgentConfigPayload('Агент продаж')

    renderView({
      activeConfig: null,
      versions: [],
      selectedConfig: null,
      draftPayload: payload,
    }, 'ru')

    expect(screen.getAllByText('Конфигурация агента').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Назад к агенту' })).toBeInTheDocument()
    expect(screen.getByText('Активная конфигурация')).toBeInTheDocument()
    expect(screen.getByText('Сервер не вернул активную конфигурацию.')).toBeInTheDocument()
    expect(screen.getByText('История версий')).toBeInTheDocument()
    expect(screen.getByText('Версий конфигурации пока нет.')).toBeInTheDocument()
    expect(screen.getByText('Выбранная конфигурация')).toBeInTheDocument()
    expect(screen.getByText('Выберите версию конфигурации или создайте черновик.')).toBeInTheDocument()
    expect(screen.getByText('Черновик конфигурации')).toBeInTheDocument()
    expect(screen.getByText('Понятный и дружелюбный')).toBeInTheDocument()
    expect(screen.getByText('Английский')).toBeInTheDocument()
    expect(screen.getByLabelText('Тон общения')).toHaveValue('clear_and_helpful')
    expect(screen.getByLabelText('Язык')).toHaveValue('en')
    expect(screen.getByLabelText('Предпочитаемое семейство моделей')).toHaveValue('')
    expect(screen.getByLabelText('Версия схемы')).toHaveValue('1.0')
    expect(screen.getByLabelText('Чат')).toBeInTheDocument()
    expect(screen.getByLabelText('Рассуждение')).toBeInTheDocument()
    expect(screen.getByLabelText('Базовая безопасность')).toBeInTheDocument()
    expect(screen.getByLabelText('Контролируемая smoke-проверка')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Создать черновик' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Создать версию' })).toBeInTheDocument()
    expect(screen.queryByText('Agent Config')).not.toBeInTheDocument()
    expect(screen.queryByText('Back to agent')).not.toBeInTheDocument()
    expect(screen.queryByText('No active config returned by the backend.')).not.toBeInTheDocument()
  })

  it('requires backend validation result before activation and confirms rollback', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const manager = renderView({
      validationState: {
        configId: 'config_1',
        result: {
          validationStatus: 'valid',
          compatibilityStatus: 'compatible',
          processingPath: 'historical',
          normalized: true,
          safeDefaultsApplied: true,
          fallbackEligible: false,
          provenanceMarker: 'backend',
          issues: [],
          compatibilityNotes: ['ok'],
        },
      },
      canActivateSelected: true,
    })

    await user.click(screen.getByRole('button', { name: 'Activate' }))
    await user.click(screen.getByRole('button', { name: 'Rollback' }))

    expect(confirmSpy).toHaveBeenCalledWith('Activate the selected validated config version?')
    expect(manager.activateSelected).toHaveBeenCalled()
    expect(confirmSpy).toHaveBeenCalledWith('Rollback to selected config version? v1')
    expect(manager.rollbackSelected).toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('exposes the create config version flow through the configs endpoint action', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const manager = renderView()

    await user.click(screen.getByRole('button', { name: 'Create version' }))

    expect(confirmSpy).toHaveBeenCalledWith('Create a new config version from the current payload?')
    expect(manager.createVersion).toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('submits canonical option values and preserves unknown backend values', async () => {
    const user = userEvent.setup()
    const payload = createDefaultAgentConfigPayload('Sales assistant')
    payload.modelPreference.preferredModelFamily = 'legacy_family'
    payload.modelSelectionHints.preferredCapabilities = ['legacy_capability']
    payload.executionProfileHints.profileName = 'legacy_profile'
    payload.executionProfileHints.responseMode = 'legacy_mode'
    payload.compatibilityAndSafety.configSchemaVersion = 'v1'
    payload.compatibilityAndSafety.safetyLabels = ['legacy_safety_label']
    const manager = renderView({ draftPayload: payload })

    expect(screen.getByLabelText('Preferred model family')).toHaveValue('legacy_family')
    expect(screen.getByText('legacy_family')).toBeInTheDocument()
    expect(screen.getByLabelText('legacy_capability')).toBeChecked()
    expect(screen.getByLabelText('legacy_safety_label')).toBeChecked()
    expect(screen.getByLabelText('Schema version')).toHaveValue('v1')

    await user.click(screen.getByLabelText('Chat'))

    const updateCalls = vi.mocked(manager.updateDraftPayload).mock.calls
    const updater = updateCalls[updateCalls.length - 1]?.[0]
    expect(updater).toBeTypeOf('function')
    const nextPayload = updater?.(payload)
    expect(nextPayload?.modelSelectionHints.preferredCapabilities).toEqual(['legacy_capability', 'chat'])
  })

  it('renders copyable safe mutation evidence without exposing secret-like payload values', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })

    renderView({
      mutationResult: {
        action: 'activate_config',
        resourceType: 'agent_config',
        resourceId: 'config_safe_1',
        actorId: 'admin_1',
        actorType: 'admin',
        tenantId: 'tenant_1',
        correlationId: 'corr_safe_1',
        mutationTimestamp: '2026-05-20T10:00:00Z',
        changedStateSummary: {
          access_token: 'must_not_render',
          refresh_token: 'must_not_render',
          provider_key: 'must_not_render',
          internal_prompt: 'must_not_render',
        },
        status: 'active',
        version: 3,
      },
    })

    const evidence = screen.getByRole('heading', { name: 'Last config mutation result' }).closest('section')
    expect(evidence).not.toBeNull()
    const evidenceScope = within(evidence as HTMLElement)

    expect(evidenceScope.getByText('activate_config')).toBeInTheDocument()
    expect(evidenceScope.getByText('agent_config')).toBeInTheDocument()
    expect(evidenceScope.getByText('config_safe_1')).toBeInTheDocument()
    expect(evidenceScope.getByText('active')).toBeInTheDocument()
    expect(evidenceScope.getByText('3')).toBeInTheDocument()
    expect(evidenceScope.getByText('corr_safe_1')).toBeInTheDocument()
    expect(evidenceScope.getByText('2026-05-20T10:00:00Z')).toBeInTheDocument()
    expect(evidenceScope.queryByText('must_not_render')).not.toBeInTheDocument()
    expect(evidenceScope.queryByText(/access_token|refresh_token|provider_key|internal_prompt/i)).not.toBeInTheDocument()

    await user.click(evidenceScope.getAllByRole('button', { name: 'Copy' })[0])

    expect(writeText).toHaveBeenCalledWith('config_safe_1')
  })

  it('shows safe evidence fallbacks when correlation and status fields are absent', () => {
    renderView({
      mutationResult: {
        action: 'create_config_version',
        resourceType: 'agent_config',
        resourceId: null,
        actorId: 'admin_1',
        actorType: 'admin',
        tenantId: 'tenant_1',
        correlationId: null,
        mutationTimestamp: '2026-05-20T10:05:00Z',
        changedStateSummary: {},
      },
    })

    const evidence = screen.getByRole('heading', { name: 'Last config mutation result' }).closest('section')
    expect(evidence).not.toBeNull()
    const evidenceScope = within(evidence as HTMLElement)

    expect(evidenceScope.getAllByText('Not provided by backend').length).toBeGreaterThanOrEqual(3)
    expect(evidenceScope.getByText('2026-05-20T10:05:00Z')).toBeInTheDocument()
  })

  it('disables mutation actions when backend action refs do not allow config management', () => {
    renderView({
      canManageConfig: false,
      canActivateSelected: false,
    })

    expect(screen.getByRole('button', { name: 'Create draft' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Create version' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Validate' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Activate' })).toBeDisabled()
    expect(screen.getByText('Your role can inspect agent config but cannot change it.')).toBeInTheDocument()
  })
})
