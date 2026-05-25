import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import type { AgentDetailManager } from '@/modules/Agents/model/useAgentDetailManager'
import { AgentDetailView } from '@/modules/Agents/ui/AgentDetailView'

function renderView(manager: Partial<AgentDetailManager> = {}, locale = 'en') {
  window.localStorage.setItem('ai_admin_panel:locale_v1', locale)

  const defaultManager = {
    tenantId: 'tenant_1',
    agentId: 'agent_1',
    detail: {
      agentId: 'agent_1',
      tenantId: 'tenant_1',
      name: 'Sales agent',
      description: 'Handles sales',
      purpose: 'Qualify leads',
      status: 'inactive',
      lifecycleStatus: 'draft',
      archetypeId: 'sales_qualification',
      templateId: 'sales_qualification_v1',
      activeConfigId: null,
      setupReadinessSummary: {
        overallReadinessStatus: 'blocked',
        releaseReady: false,
        blockingItemCount: 2,
        tenantStatus: 'active',
        agentLifecycleStatus: 'draft',
        archetypeTemplateStatus: 'selected',
        agentConfigStatus: 'missing',
        knowledgeStatus: 'missing',
        capabilityStatus: 'missing',
        policyStatus: 'missing',
        policyBindingMode: null,
        siteWidgetStatus: 'missing',
        publicChannelRequired: true,
        publicChannelInUse: false,
        meteringInterpretationMarkers: ['turns'],
        releaseHandoffTarget: 'stage_10',
      },
      foundationAssessmentSummary: {
        validationStatus: 'valid',
        compatibilityStatus: 'compatible',
        processingPath: 'safe_defaults',
        normalized: true,
        safeDefaultsApplied: true,
        fallbackEligible: false,
        provenanceMarker: 'template',
        issueCount: 0,
        issues: [],
        compatibilityNotes: [],
      },
      channelBindingSummary: {
        supportedChannels: ['web_widget'],
        publicChannelSupported: true,
        readinessStatus: 'blocked',
        publicChannelRequired: true,
        publicChannelInUse: false,
        bindingCount: 0,
        readyBindingCount: 0,
        meteringInterpretationMarkers: ['turns'],
        releaseHandoffTarget: 'stage_10',
        issueCount: 1,
      },
      supportedMutationActions: [
        'agents.update_metadata',
        'agents.change_status',
        'agents.change_lifecycle',
        'agent_config.manage',
        'agent_capabilities.manage',
        'agent_policy.manage',
        'sites_widgets.manage',
        'releases.manage',
      ],
      agent: {} as never,
    },
    setupChecklist: {
      items: [
        {
          itemId: 'knowledge',
          ownerArea: 'knowledge',
          state: 'missing',
          blocking: true,
          detail: 'Knowledge must be bound later.',
          requiredAction: 'Bind knowledge',
          releaseReadinessMarker: 'knowledge_ready',
        },
      ],
    },
    foundationAssessment: null,
    channelBinding: null,
    editForm: { name: 'Sales agent', description: 'Handles sales', purpose: 'Qualify leads' },
    canMutate: true,
    allowedMutationActions: {
      updateMetadata: true,
      changeStatus: true,
      changeLifecycle: true,
    },
    isLoading: false,
    isMutating: false,
    errorMessage: null,
    formError: null,
    notice: null,
    mutationResult: null,
    loadAgent: vi.fn(),
    updateEditForm: vi.fn(),
    saveMetadata: vi.fn(),
    updateStatus: vi.fn(),
    updateLifecycle: vi.fn(),
    ...manager,
  } as unknown as AgentDetailManager

  render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/tenants/tenant_1/agents/agent_1']} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <AgentDetailView manager={defaultManager} />
      </MemoryRouter>
    </I18nProvider>,
  )

  return defaultManager
}

describe('AgentDetailView', () => {
  it('renders backend setup, foundation and channel sections without future links', () => {
    renderView()

    expect(screen.getByText('Sales agent')).toBeInTheDocument()
    expect(screen.getByText('Setup checklist')).toBeInTheDocument()
    expect(screen.getByText('Foundation assessment')).toBeInTheDocument()
    expect(screen.getByText('Channel binding')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Manage config' })).toHaveAttribute('href', '/tenants/tenant_1/agents/agent_1/config')
    expect(screen.getByRole('link', { name: 'Manage knowledge' })).toHaveAttribute('href', '/tenants/tenant_1/agents/agent_1/knowledge')
    expect(screen.getByRole('link', { name: 'Manage capabilities' })).toHaveAttribute('href', '/tenants/tenant_1/agents/agent_1/capabilities')
    expect(screen.getByRole('link', { name: 'Manage policy' })).toHaveAttribute('href', '/tenants/tenant_1/agents/agent_1/policy')
    expect(screen.getByRole('link', { name: 'Manage sites & widgets' })).toHaveAttribute('href', '/tenants/tenant_1/agents/agent_1/sites-widgets')
    expect(screen.getByRole('link', { name: 'Manage releases' })).toHaveAttribute('href', '/tenants/tenant_1/agents/agent_1/releases')
    expect(screen.queryByText('agent_config.manage')).not.toBeInTheDocument()
    expect(screen.queryByText('agents.update_metadata')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Conversations/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Usage/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Billing/i })).not.toBeInTheDocument()
  })

  it('requires confirmation before status action', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const manager = renderView()

    await user.click(screen.getByRole('button', { name: 'Set status inactive' }))

    expect(confirmSpy).toHaveBeenCalledWith('Set this agent status to inactive?')
    expect(manager.updateStatus).toHaveBeenCalledWith('inactive')
    confirmSpy.mockRestore()
  })

  it('does not push activation while backend setup blockers remain', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const manager = renderView()

    const statusButton = screen.getByRole('button', { name: 'Set status active' })
    const lifecycleButton = screen.getByRole('button', { name: 'Set lifecycle active' })

    expect(statusButton).toBeDisabled()
    expect(lifecycleButton).toBeDisabled()
    expect(screen.getByText('Activation is locked until backend setup blockers are resolved.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Next setup step: Knowledge/i })).toHaveAttribute(
      'href',
      '/tenants/tenant_1/agents/agent_1/knowledge',
    )

    await user.click(statusButton)

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(manager.updateStatus).not.toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('shows setup statuses, blocker details and highlights the next setup button', () => {
    renderView(
      {
        detail: {
          agentId: 'agent_1',
          tenantId: 'tenant_1',
          name: 'Sales Support Manual Smoke Agent',
          description: 'Manual smoke agent for first service E2E verification',
          purpose: 'Answer bounded sales and support questions from approved knowledge',
          status: 'active',
          lifecycleStatus: 'active',
          archetypeId: 'sales_qualification',
          templateId: 'sales_qualification_v1',
          activeConfigId: 'config_1',
          setupReadinessSummary: {
            overallReadinessStatus: 'blocked',
            releaseReady: false,
            blockingItemCount: 3,
            tenantStatus: 'active',
            agentLifecycleStatus: 'active',
            archetypeTemplateStatus: 'selected',
            agentConfigStatus: 'ready',
            knowledgeStatus: 'ready',
            capabilityStatus: 'missing',
            policyStatus: 'missing',
            policyBindingMode: null,
            siteWidgetStatus: 'missing',
            publicChannelRequired: true,
            publicChannelInUse: false,
            meteringInterpretationMarkers: [],
            releaseHandoffTarget: 'stage_10',
          },
          foundationAssessmentSummary: {
            validationStatus: 'valid',
            compatibilityStatus: 'compatible',
            processingPath: 'active',
            normalized: true,
            safeDefaultsApplied: false,
            fallbackEligible: false,
            provenanceMarker: null,
            issueCount: 0,
            issues: [],
            compatibilityNotes: [],
          },
          channelBindingSummary: {
            supportedChannels: ['public_widget', 'internal_console'],
            publicChannelSupported: true,
            readinessStatus: 'pending',
            publicChannelRequired: true,
            publicChannelInUse: false,
            bindingCount: 0,
            readyBindingCount: 0,
            meteringInterpretationMarkers: [],
            releaseHandoffTarget: 'stage_10',
            issueCount: 1,
          },
          supportedMutationActions: [],
          agent: {} as never,
        },
        setupChecklist: {
          tenantId: 'tenant_1',
          agentId: 'agent_1',
          archetypeId: 'sales_support',
          templateId: 'sales_support_v1',
          lifecycleStatus: 'draft',
          releaseReady: false,
          summary: {
            overallReadinessStatus: 'blocked',
            releaseReady: false,
            blockingItemCount: 3,
            tenantStatus: 'active',
            agentLifecycleStatus: 'draft',
            archetypeTemplateStatus: 'approved',
            agentConfigStatus: 'ready',
            knowledgeStatus: 'ready',
            capabilityStatus: 'missing',
            policyStatus: 'missing',
            policyBindingMode: null,
            siteWidgetStatus: 'missing',
            publicChannelRequired: true,
            publicChannelInUse: false,
            meteringInterpretationMarkers: [],
            releaseHandoffTarget: 'stage_10',
          },
          channelBinding: {
            tenantId: 'tenant_1',
            agentId: 'agent_1',
            supportedChannels: ['public_widget', 'internal_console'],
            publicChannelSupported: true,
            publicChannelRequired: true,
            publicChannelInUse: false,
            readinessStatus: 'pending',
            releaseReadinessMarker: 'channel_ready',
            meteringInterpretationMarkers: [],
            releaseHandoffTarget: 'stage_10',
            bindings: [],
            issues: [],
          },
          items: [
            {
              itemId: 'capabilities',
              ownerArea: 'capabilities',
              state: 'missing',
              blocking: true,
              detail: 'Confirm the allowed capabilities for this agent.',
              requiredAction: 'Confirm capabilities',
              releaseReadinessMarker: 'capabilities_ready',
            },
            {
              itemId: 'policy_profile',
              ownerArea: 'policy_profile',
              state: 'missing',
              blocking: true,
              detail: 'Bind the policy profile.',
              requiredAction: 'Bind policy',
              releaseReadinessMarker: 'policy_ready',
            },
            {
              itemId: 'channel_binding',
              ownerArea: 'channel_binding',
              state: 'missing',
              blocking: true,
              detail: 'Connect the public widget channel.',
              requiredAction: 'Connect channel',
              releaseReadinessMarker: 'channel_ready',
            },
          ],
        },
        editForm: {
          name: 'Sales Support Manual Smoke Agent',
          description: 'Manual smoke agent for first service E2E verification',
          purpose: 'Answer bounded sales and support questions from approved knowledge',
        },
      },
      'ru',
    )

    expect(screen.getByText('Конфигурация:')).toBeInTheDocument()
    expect(screen.getByText('База знаний:')).toBeInTheDocument()
    expect(screen.getByText('Возможности:')).toBeInTheDocument()
    expect(screen.getByText('Политика:')).toBeInTheDocument()
    expect(screen.getByText('Канал:')).toBeInTheDocument()
    expect(screen.getByText('Релиз:')).toBeInTheDocument()
    expect(screen.getAllByText('Готово').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Требуется').length).toBeGreaterThanOrEqual(3)
    expect(screen.getAllByText('Заблокирован').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('link', { name: 'Конфигурация: Готово' })).toHaveAttribute('href', '/tenants/tenant_1/agents/agent_1/config')
    expect(screen.getByRole('link', { name: 'База знаний: Готово' })).toHaveAttribute('href', '/tenants/tenant_1/agents/agent_1/knowledge')
    expect(screen.getByRole('link', { name: 'Возможности: Требуется' })).toHaveAttribute('href', '/tenants/tenant_1/agents/agent_1/capabilities')
    expect(screen.getByRole('link', { name: 'Политика: Требуется' })).toHaveAttribute('href', '/tenants/tenant_1/agents/agent_1/policy')
    expect(screen.getByRole('link', { name: 'Канал: Требуется' })).toHaveAttribute('href', '/tenants/tenant_1/agents/agent_1/sites-widgets')
    expect(screen.queryByRole('link', { name: 'Релиз: Заблокирован' })).not.toBeInTheDocument()
    expect(screen.getByTitle('Сначала закройте возможности, политику и канал.')).toHaveAttribute('aria-disabled', 'true')

    const capabilitiesLink = screen.getByRole('link', { name: 'Настроить возможности Требует сохранения' })
    expect(capabilitiesLink).toHaveAttribute('href', '/tenants/tenant_1/agents/agent_1/capabilities')
    expect(capabilitiesLink.className).toContain('bg-[var(--primary)]')
    expect(capabilitiesLink.className).toContain('hover:bg-[var(--primary-hover)]')
    expect(capabilitiesLink.className).not.toContain('hover:bg-[var(--surface-muted)]')
    expect(screen.getByText('Возможности ещё не сохранены.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Показать блокеры' })).toHaveAttribute('href', '#agent-setup-blockers')
    expect(screen.getByText('Дополнительные safe defaults не требовались')).toBeInTheDocument()
    expect(screen.getAllByText(/не выбран режим capability assignment/).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /Возможности.*не выбран режим capability assignment/ }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /Политика безопасности.*Назначить профиль политики/ }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /Канал подключения.*Подключить сайт или виджет/ }).length).toBeGreaterThan(0)
    expect(screen.getByText('Связанные виджеты')).toBeInTheDocument()
  })

  it('falls back to readiness summary blockers and advances highlight when checklist details are unavailable', () => {
    renderView(
      {
        detail: {
          agentId: 'agent_1',
          tenantId: 'tenant_1',
          name: 'Sales Support Manual Smoke Agent',
          description: 'Manual smoke agent for first service E2E verification',
          purpose: 'Answer bounded sales and support questions from approved knowledge',
          status: 'active',
          lifecycleStatus: 'active',
          archetypeId: 'sales_qualification',
          templateId: 'sales_qualification_v1',
          activeConfigId: 'config_1',
          setupReadinessSummary: {
            overallReadinessStatus: 'blocked',
            releaseReady: false,
            blockingItemCount: 2,
            tenantStatus: 'active',
            agentLifecycleStatus: 'active',
            archetypeTemplateStatus: 'selected',
            agentConfigStatus: 'ready',
            knowledgeStatus: 'ready',
            capabilityStatus: 'ready',
            policyStatus: 'missing',
            policyBindingMode: null,
            siteWidgetStatus: 'missing',
            publicChannelRequired: true,
            publicChannelInUse: false,
            meteringInterpretationMarkers: [],
            releaseHandoffTarget: 'stage_10',
          },
          foundationAssessmentSummary: {
            validationStatus: 'valid',
            compatibilityStatus: 'compatible',
            processingPath: 'active',
            normalized: true,
            safeDefaultsApplied: false,
            fallbackEligible: false,
            provenanceMarker: null,
            issueCount: 0,
            issues: [],
            compatibilityNotes: [],
          },
          channelBindingSummary: {
            supportedChannels: ['public_widget', 'internal_console'],
            publicChannelSupported: true,
            readinessStatus: 'pending',
            publicChannelRequired: true,
            publicChannelInUse: false,
            bindingCount: 0,
            readyBindingCount: 0,
            meteringInterpretationMarkers: [],
            releaseHandoffTarget: 'stage_10',
            issueCount: 1,
          },
          supportedMutationActions: [],
          agent: {} as never,
        },
        setupChecklist: null,
        editForm: {
          name: 'Sales Support Manual Smoke Agent',
          description: 'Manual smoke agent for first service E2E verification',
          purpose: 'Answer bounded sales and support questions from approved knowledge',
        },
      },
      'ru',
    )

    const policyLink = screen.getByRole('link', { name: 'Настроить политику' })
    expect(policyLink.className).toContain('bg-[var(--primary)]')
    expect(screen.getAllByRole('link', { name: /Политика.*Требуется/ }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /Канал.*Требуется/ }).length).toBeGreaterThan(0)
    expect(screen.getByText('Все обязательные пункты отображены выше.')).toBeInTheDocument()
  })

  it('disables mutation controls when backend action refs do not support them', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const manager = renderView({
      allowedMutationActions: {
        updateMetadata: false,
        changeStatus: false,
        changeLifecycle: false,
      },
    })

    const saveButton = screen.getByRole('button', { name: 'Save metadata' })
    const statusButton = screen.getByRole('button', { name: 'Set status active' })
    const lifecycleButton = screen.getByRole('button', { name: 'Set lifecycle active' })

    expect(saveButton).toBeDisabled()
    expect(statusButton).toBeDisabled()
    expect(lifecycleButton).toBeDisabled()
    expect(screen.queryByText('agent_config.manage')).not.toBeInTheDocument()

    await user.click(statusButton)

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(manager.updateStatus).not.toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('shows draft agent configuration guidance instead of treating missing active config as load failure', () => {
    renderView(
      {
        detail: {
          agentId: '153d7b4f-255c-4ec2-9cf3-8d9cd05f796a',
          tenantId: 'tenant_1',
          name: 'FAQ agent',
          description: 'Manual smoke agent for first service E2E verification',
          purpose: 'Answer bounded sales and support questions from approved knowledge',
          status: 'inactive',
          lifecycleStatus: 'draft',
          archetypeId: 'faq_service_information',
          templateId: 'service_faq_v1',
          activeConfigId: null,
          setupReadinessSummary: {
            overallReadinessStatus: 'blocked',
            releaseReady: false,
            blockingItemCount: 1,
            tenantStatus: 'active',
            agentLifecycleStatus: 'draft',
            archetypeTemplateStatus: 'selected',
            agentConfigStatus: 'missing',
            knowledgeStatus: 'missing',
            capabilityStatus: 'missing',
            policyStatus: 'missing',
            policyBindingMode: null,
            siteWidgetStatus: 'missing',
            publicChannelRequired: true,
            publicChannelInUse: false,
            meteringInterpretationMarkers: [],
            releaseHandoffTarget: 'stage_10',
          },
          foundationAssessmentSummary: {
            validationStatus: 'semantically_invalid',
            compatibilityStatus: 'incompatible',
            processingPath: 'active',
            normalized: null,
            safeDefaultsApplied: false,
            fallbackEligible: false,
            provenanceMarker: null,
            issueCount: 1,
            issues: ['Active config is not provisioned'],
            compatibilityNotes: [],
          },
          channelBindingSummary: {
            supportedChannels: ['public_widget'],
            publicChannelSupported: true,
            readinessStatus: 'blocked',
            publicChannelRequired: true,
            publicChannelInUse: false,
            bindingCount: 0,
            readyBindingCount: 0,
            meteringInterpretationMarkers: [],
            releaseHandoffTarget: 'stage24_release_validation',
            issueCount: 1,
          },
          supportedMutationActions: [],
          agent: {} as never,
        },
        editForm: {
          name: 'FAQ agent',
          description: 'Manual smoke agent for first service E2E verification',
          purpose: 'Answer bounded sales and support questions from approved knowledge',
        },
      },
      'ru',
    )

    expect(screen.getByText('Агент создан. Требуется конфигурация.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Перейти к конфигурации' })).toHaveAttribute(
      'href',
      '/tenants/tenant_1/agents/agent_1/config',
    )
    expect(screen.queryByText('Agent detail is not available')).not.toBeInTheDocument()
    expect(screen.queryByText('Failed to load agent detail.')).not.toBeInTheDocument()
    expect(screen.getAllByText('Проверка релиза').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Семантически некорректна').length).toBeGreaterThan(0)
    expect(screen.getByText('Активная конфигурация не создана')).toBeInTheDocument()
    expect(screen.getAllByText('Отвечает на ограниченные вопросы продаж и поддержки по утверждённой базе знаний').length).toBeGreaterThan(0)
    expect(screen.getByDisplayValue('Тестовый агент для проверки первого клиентского сценария')).toBeInTheDocument()
    expect(screen.queryByText('stage24_release_validation')).not.toBeInTheDocument()
    expect(screen.queryByText('semantically_invalid')).not.toBeInTheDocument()
    expect(screen.queryByText('Active config is not provisioned')).not.toBeInTheDocument()
  })
})
