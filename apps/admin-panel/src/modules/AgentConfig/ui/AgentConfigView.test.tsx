import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { createDefaultAgentConfigPayload, createEmptyActionBinding, type AgentConfigManager } from '@/modules/AgentConfig/model/useAgentConfigManager'
import { AgentConfigView } from '@/modules/AgentConfig/ui/AgentConfigView'
import type { FormMetadata } from '@/modules/FormMetadata'

const agentConfigMetadata = {
  formId: 'agent_config',
  formVersion: '1.0',
  schemaVersion: '1.0',
  cachePolicy: { safeToCache: true, scope: 'tenant_agent', varyBy: ['tenant_id', 'agent_id', 'model_catalog'] },
  optionSources: {},
  backendValidation: { authoritative: true },
  extensions: {},
  fields: [
    field('identity.agent_label', 'text'),
    field('identity.persona_summary', 'textarea'),
    field('tone_and_language.tone', 'select', ['clear_and_helpful', 'formal', 'concise']),
    field('tone_and_language.language', 'select', ['en', 'ru']),
    field('handoff_policy.handoff_enabled', 'toggle'),
    field('handoff_policy.handoff_conditions', 'list_text'),
    field('integration_policy.integration_enabled', 'toggle'),
    field('model_preference.preferred_model_family', 'select', ['general-chat', 'high-reasoning']),
    field('model_preference.latency_sensitivity', 'select', ['low', 'medium', 'high']),
    field('model_preference.quality_sensitivity', 'select', ['low', 'medium', 'high']),
    field('model_preference.cost_sensitivity', 'select', ['low', 'medium', 'high']),
    field('model_selection_hints.preferred_capabilities', 'multi_select', ['chat', 'reasoning', 'quality']),
    field('model_selection_hints.fallback_allowed', 'toggle'),
    field('execution_profile_hints.profile_name', 'select', ['default']),
    field('execution_profile_hints.response_mode', 'select', ['balanced', 'concise', 'detailed']),
    field('compatibility_and_safety.config_schema_version', 'read_only_default', ['1.0'], { readonly: true, defaultValue: '1.0' }),
    field('compatibility_and_safety.safety_labels', 'multi_select', ['baseline', 'public_widget', 'controlled_smoke']),
    field('compatibility_and_safety.compatibility_notes', 'list_text'),
  ],
} satisfies FormMetadata

function field(
  payloadPath: string,
  control: string,
  options: string[] = [],
  overrides: Partial<FormMetadata['fields'][number]> = {},
): FormMetadata['fields'][number] {
  return {
    fieldId: payloadPath,
    payloadPath,
    control,
    required: false,
    defaultValue: null,
    localizationKey: `forms.agent_config.fields.${payloadPath}`,
    helpKey: `forms.agent_config.fields.${payloadPath}.help`,
    options: options.map((value) => ({
      value,
      localizationKey: `forms.agent_config.fields.${payloadPath}.options.${value}`,
      source: 'test.backend_metadata',
      default: false,
      extensions: {},
    })),
    constraints: {},
    readonly: false,
    extensions: {},
    ...overrides,
  }
}

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
    formMetadata: agentConfigMetadata,
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
  it('renders loading and operator feedback states', () => {
    renderView({
      isLoading: true,
      notice: 'Config saved.',
      errorMessage: 'Config load failed.',
      formError: 'Fix the payload.',
    })

    expect(screen.getByText('Config saved.')).toBeInTheDocument()
    expect(screen.getByText('Config load failed.')).toBeInTheDocument()
    expect(screen.getByText('Fix the payload.')).toBeInTheDocument()
    expect(screen.getByText(/Loading/)).toBeInTheDocument()
    expect(screen.queryByText('Active config')).not.toBeInTheDocument()
  })

  it('renders active config, version history and approved schema fields', () => {
    renderView()

    expect(screen.getAllByText('Active config').length).toBeGreaterThan(0)
    expect(screen.getByText('Version history')).toBeInTheDocument()
    expect(screen.getByLabelText('Agent label')).toHaveValue('Sales assistant')
    expect(screen.getByLabelText('Tone')).toHaveValue('clear_and_helpful')
    expect(screen.getByLabelText('Response mode').tagName).toBe('SELECT')
    expect(screen.getByLabelText('Preferred model family')).toHaveValue('')
    expect(screen.getByLabelText('Profile name')).toHaveValue('')
    expect(screen.getByLabelText('Profile name').tagName).toBe('SELECT')
    expect(screen.getByLabelText('Response mode')).toHaveValue('')
    expect(screen.getByLabelText('Schema version')).toHaveValue('1.0')
    expect(screen.getByLabelText('Schema version')).toBeDisabled()
    expect(screen.getByLabelText('Chat')).not.toBeChecked()
    expect(screen.getByLabelText('Reasoning')).not.toBeChecked()
    expect(screen.getByLabelText('Baseline')).not.toBeChecked()
    expect(screen.getByLabelText('Public widget')).not.toBeChecked()
    expect(screen.getByLabelText('Controlled smoke')).not.toBeChecked()
    expect(screen.getByText('Agent behavior language; it is independent from the admin UI locale.')).toBeInTheDocument()
    expect(screen.getByText('Select backend-provided capabilities without editing their values.')).toBeInTheDocument()
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
    expect(screen.getByLabelText('Язык поведения агента')).toHaveValue('en')
    expect(screen.getByLabelText('Предпочитаемое семейство моделей')).toHaveValue('')
    expect(screen.getByLabelText('Версия схемы')).toHaveValue('1.0')
    expect(screen.getByLabelText('Чат')).toBeInTheDocument()
    expect(screen.getByLabelText('Рассуждение')).toBeInTheDocument()
    expect(screen.getByLabelText('Базовая безопасность')).toBeInTheDocument()
    expect(screen.getByLabelText('Контролируемая smoke-проверка')).toBeInTheDocument()
    expect(screen.getByText('Язык поведения агента; он не зависит от языка интерфейса администратора.')).toBeInTheDocument()
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
    payload.modelPreference.latencySensitivity = 'custom_latency'
    payload.modelSelectionHints.preferredCapabilities = ['legacy_capability']
    payload.executionProfileHints.profileName = 'legacy_profile'
    payload.executionProfileHints.responseMode = 'legacy_mode'
    payload.compatibilityAndSafety.configSchemaVersion = 'v1'
    payload.compatibilityAndSafety.safetyLabels = ['legacy_safety_label']
    const manager = renderView({ draftPayload: payload })

    expect(screen.getByLabelText('Preferred model family')).toHaveValue('legacy_family')
    expect(screen.getByLabelText('Latency sensitivity')).toHaveValue('custom_latency')
    expect(screen.getByText('legacy_family')).toBeInTheDocument()
    expect(screen.getByText('custom_latency')).toBeInTheDocument()
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

  it('keeps missing translation backend options usable without mutating submitted values', async () => {
    const user = userEvent.setup()
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    const metadataWithMissingOption: FormMetadata = {
      ...agentConfigMetadata,
      fields: agentConfigMetadata.fields.map((field) =>
        field.payloadPath === 'model_selection_hints.preferred_capabilities'
          ? {
              ...field,
              options: [
                ...field.options,
                {
                  value: 'backend_new_capability',
                  localizationKey:
                    'forms.agent_config.fields.model_selection_hints.preferred_capabilities.options.backend_new_capability',
                  source: 'test.backend_metadata',
                  default: false,
                  extensions: {},
                },
              ],
            }
          : field,
      ),
    }
    const manager = renderView({ formMetadata: metadataWithMissingOption })

    expect(screen.getByLabelText('backend_new_capability')).toBeInTheDocument()

    await user.click(screen.getByLabelText('backend_new_capability'))

    const updateCalls = vi.mocked(manager.updateDraftPayload).mock.calls
    const updater = updateCalls[updateCalls.length - 1]?.[0]
    const nextPayload = updater?.(manager.draftPayload)
    expect(nextPayload?.modelSelectionHints.preferredCapabilities).toEqual(['backend_new_capability'])
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ai-admin:i18n-missing-key',
        detail: {
          key: 'forms.agent_config.fields.model_selection_hints.preferred_capabilities.options.backend_new_capability',
          fallback: 'backend_new_capability',
        },
      }),
    )
    dispatchSpy.mockRestore()
  })

  it('keeps fields usable when backend help keys are not translated yet', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent')
    const metadataWithMissingHelp: FormMetadata = {
      ...agentConfigMetadata,
      fields: agentConfigMetadata.fields.map((field) =>
        field.payloadPath === 'tone_and_language.tone'
          ? {
              ...field,
              helpKey: 'forms.agent_config.fields.tone_and_language.tone.help_missing',
            }
          : field,
      ),
    }

    renderView({ formMetadata: metadataWithMissingHelp })

    expect(screen.getByText('forms.agent_config.fields.tone_and_language.tone.help_missing')).toBeInTheDocument()
    expect(screen.getByLabelText('Tone')).toHaveValue('clear_and_helpful')
    expect(screen.getByRole('option', { name: 'Clear and helpful' })).toHaveValue('clear_and_helpful')
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ai-admin:i18n-missing-key',
        detail: {
          key: 'forms.agent_config.fields.tone_and_language.tone.help_missing',
          fallback: 'forms.agent_config.fields.tone_and_language.tone.help_missing',
        },
      }),
    )
    dispatchSpy.mockRestore()
  })

  it('falls back to lifecycle labels for draft config status', () => {
    renderView({
      activeConfig: {
        id: 'config_draft',
        tenantId: 'tenant_1',
        agentId: 'agent_1',
        version: 4,
        status: 'draft',
        payload: createDefaultAgentConfigPayload('Sales assistant'),
        activatedAt: null,
      },
      versions: [
        { id: 'config_draft', tenantId: 'tenant_1', agentId: 'agent_1', version: 4, status: 'draft' },
      ],
    })

    expect(screen.getAllByText('Draft').length).toBeGreaterThan(0)
  })

  it('wires draft form controls to the canonical config payload shape', () => {
    let currentPayload = createDefaultAgentConfigPayload('Sales assistant')
    currentPayload.integrationPolicy.actionBindings = [createEmptyActionBinding()]
    const updateDraftPayload = vi.fn((updater: (payload: typeof currentPayload) => typeof currentPayload) => {
      currentPayload = updater(currentPayload)
    })

    renderView({
      draftPayload: currentPayload,
      updateDraftPayload,
    })

    fireEvent.change(screen.getByLabelText('Agent label'), { target: { value: 'Updated sales agent' } })
    fireEvent.change(screen.getByLabelText('Persona summary'), { target: { value: 'Concise helper' } })
    fireEvent.change(screen.getByLabelText('Tone'), { target: { value: 'formal' } })
    fireEvent.change(screen.getByLabelText('Agent behavior language'), { target: { value: 'ru' } })
    fireEvent.change(screen.getByLabelText('Goals'), { target: { value: 'qualify leads\nanswer questions\n' } })
    fireEvent.change(screen.getByLabelText('Rules'), { target: { value: 'stay grounded' } })
    fireEvent.change(screen.getByLabelText('Restrictions'), { target: { value: 'no legal advice' } })
    fireEvent.click(screen.getByLabelText('Handoff enabled'))
    fireEvent.change(screen.getByLabelText('Handoff conditions'), { target: { value: 'customer asks for human' } })
    fireEvent.click(screen.getByLabelText('Integration enabled'))
    fireEvent.change(screen.getByLabelText('Action class'), { target: { value: 'ticket.create' } })
    fireEvent.change(screen.getByLabelText('Connector key'), { target: { value: 'support' } })
    fireEvent.change(screen.getByLabelText('Operation key'), { target: { value: 'create' } })
    fireEvent.change(screen.getByLabelText('Interface type'), { target: { value: 'http' } })
    fireEvent.change(screen.getByLabelText('Side effect mode'), { target: { value: 'write' } })
    fireEvent.change(screen.getByLabelText('Reference scope'), { target: { value: 'tenant' } })
    fireEvent.change(screen.getByLabelText('Reference key'), { target: { value: 'default' } })
    fireEvent.change(screen.getByLabelText('Endpoint URL'), { target: { value: 'https://example.test' } })
    fireEvent.change(screen.getByLabelText('Timeout class'), { target: { value: 'short' } })
    fireEvent.change(screen.getByLabelText('Retry policy class'), { target: { value: 'standard' } })
    fireEvent.change(screen.getByLabelText('Compensation mode'), { target: { value: 'none' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add action binding' }))
    fireEvent.change(screen.getByLabelText('Preferred model family'), { target: { value: 'general-chat' } })
    fireEvent.change(screen.getByLabelText('Latency sensitivity'), { target: { value: 'low' } })
    fireEvent.change(screen.getByLabelText('Quality sensitivity'), { target: { value: 'high' } })
    fireEvent.change(screen.getByLabelText('Cost sensitivity'), { target: { value: 'medium' } })
    fireEvent.click(screen.getByLabelText('Chat'))
    fireEvent.click(screen.getByLabelText('Fallback allowed'))
    fireEvent.change(screen.getByLabelText('Profile name'), { target: { value: 'default' } })
    fireEvent.change(screen.getByLabelText('Response mode'), { target: { value: 'balanced' } })
    fireEvent.click(screen.getByLabelText('Baseline'))
    fireEvent.change(screen.getByLabelText('Compatibility notes'), { target: { value: 'smoke ready' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(updateDraftPayload).toHaveBeenCalled()
    expect(currentPayload).toMatchObject({
      identity: { agentLabel: 'Updated sales agent', personaSummary: 'Concise helper' },
      toneAndLanguage: { tone: 'formal', language: 'ru' },
      goals: ['qualify leads', 'answer questions'],
      rules: ['stay grounded'],
      restrictions: ['no legal advice'],
      handoffPolicy: { handoffEnabled: true, handoffConditions: ['customer asks for human'] },
      integrationPolicy: {
        integrationEnabled: true,
        actionBindings: [
          {
            actionClass: '',
            connectorKey: '',
            operationKey: '',
            interfaceType: '',
            sideEffectMode: '',
            referenceScope: '',
            referenceKey: '',
            endpointUrl: '',
            timeoutClass: null,
            retryPolicyClass: null,
            compensationMode: null,
          },
        ],
      },
      modelPreference: {
        preferredModelFamily: 'general-chat',
        latencySensitivity: 'low',
        qualitySensitivity: 'high',
        costSensitivity: 'medium',
      },
      modelSelectionHints: { preferredCapabilities: ['chat'], fallbackAllowed: false },
      executionProfileHints: { profileName: 'default', responseMode: 'balanced' },
      compatibilityAndSafety: { safetyLabels: ['baseline'], compatibilityNotes: ['smoke ready'] },
    })
  })

  it('removes checked controlled chips without dropping the canonical payload shape', () => {
    let currentPayload = createDefaultAgentConfigPayload('Sales assistant')
    currentPayload.modelSelectionHints.preferredCapabilities = ['chat']
    currentPayload.compatibilityAndSafety.safetyLabels = ['baseline']
    const updateDraftPayload = vi.fn((updater: (payload: typeof currentPayload) => typeof currentPayload) => {
      currentPayload = updater(currentPayload)
    })

    renderView({
      draftPayload: currentPayload,
      updateDraftPayload,
    })

    fireEvent.click(screen.getByLabelText('Chat'))
    fireEvent.click(screen.getByLabelText('Baseline'))

    expect(currentPayload.modelSelectionHints.preferredCapabilities).toEqual([])
    expect(currentPayload.compatibilityAndSafety.safetyLabels).toEqual([])
  })

  it('clears nullable controlled selections back to canonical null values', () => {
    let currentPayload = createDefaultAgentConfigPayload('Sales assistant')
    currentPayload.modelPreference = {
      preferredModelFamily: 'general-chat',
      latencySensitivity: 'low',
      qualitySensitivity: 'high',
      costSensitivity: 'medium',
    }
    currentPayload.executionProfileHints = {
      profileName: 'default',
      responseMode: 'balanced',
    }
    const updateDraftPayload = vi.fn((updater: (payload: typeof currentPayload) => typeof currentPayload) => {
      currentPayload = updater(currentPayload)
    })

    renderView({
      draftPayload: currentPayload,
      updateDraftPayload,
    })

    fireEvent.change(screen.getByLabelText('Preferred model family'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Latency sensitivity'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Quality sensitivity'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Cost sensitivity'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Profile name'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Response mode'), { target: { value: '' } })

    expect(currentPayload.modelPreference).toEqual({
      preferredModelFamily: null,
      latencySensitivity: null,
      qualitySensitivity: null,
      costSensitivity: null,
    })
    expect(currentPayload.executionProfileHints).toEqual({
      profileName: null,
      responseMode: null,
    })
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

    expect(evidenceScope.getAllByText('Backend did not return this field').length).toBeGreaterThanOrEqual(3)
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
