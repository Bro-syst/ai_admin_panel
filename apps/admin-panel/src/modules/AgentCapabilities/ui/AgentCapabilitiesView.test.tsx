import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import type { AgentCapabilitiesManager } from '@/modules/AgentCapabilities/model/useAgentCapabilitiesManager'
import { AgentCapabilitiesView } from '@/modules/AgentCapabilities/ui/AgentCapabilitiesView'

function renderView(manager: Partial<AgentCapabilitiesManager> = {}, locale = 'en') {
  window.localStorage.setItem('ai_admin_panel:locale_v1', locale)

  const defaultManager = {
    tenantId: 'tenant_1',
    agentId: 'agent_1',
    agentDetail: { agentId: 'agent_1', tenantId: 'tenant_1', name: 'Sales agent', supportedMutationActions: ['agent_capabilities.manage'] },
    catalog: {
      relationToTemplate: 'template_required',
      requiredCategories: ['knowledge'],
      optionalCategories: ['handoff'],
      items: [
        {
          capabilityId: 'cap_search',
          capabilityVersion: 'v1',
          label: 'Search knowledge',
          category: 'knowledge',
          assignmentCategories: ['required'],
          riskClass: 'low',
          sideEffectClass: 'read',
          downstreamExecutionKind: 'retrieval',
          invocationSemantics: 'backend_owned',
          policyRequirement: 'policy_required',
          meteringClassification: 'included',
          explainabilityTags: ['grounded'],
        },
        {
          capabilityId: 'capability.integration.notify_external',
          capabilityVersion: '1.0.0',
          label: 'Queue external notification',
          category: 'action',
          assignmentCategories: ['lead_capture'],
          riskClass: 'high',
          sideEffectClass: 'external_side_effect',
          downstreamExecutionKind: 'integration',
          invocationSemantics: 'async',
          policyRequirement: 'approval_required',
          meteringClassification: 'external_integration_invocation',
          explainabilityTags: ['external_notification'],
        },
        {
          capabilityId: 'capability.workflow.human_handoff',
          capabilityVersion: '1.0.0',
          label: 'Trigger human handoff workflow',
          category: 'workflow_trigger',
          assignmentCategories: ['handoff_to_sales'],
          riskClass: 'medium',
          sideEffectClass: 'local_state',
          downstreamExecutionKind: 'workflow',
          invocationSemantics: 'async',
          policyRequirement: 'baseline_policy_evaluation',
          meteringClassification: 'workflow_handoff_event',
          explainabilityTags: ['handoff'],
        },
      ],
    },
    profile: {
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      explicitNoExternalActions: false,
      relationToTemplate: 'template_required',
      readinessStatus: 'blocked',
      requiredCategories: ['knowledge'],
      optionalCategories: ['handoff'],
      assignments: [
        {
          capabilityId: 'cap_search',
          capabilityVersion: 'v1',
          label: 'Search knowledge',
          category: 'knowledge',
          assignmentCategories: ['required'],
          riskClass: 'low',
          sideEffectClass: 'read',
          downstreamExecutionKind: 'retrieval',
          invocationSemantics: 'backend_owned',
          policyRequirement: 'policy_required',
          meteringClassification: 'included',
          explainabilityTags: ['grounded'],
          enabled: true,
        },
      ],
      issues: ['policy missing'],
    },
    form: {
      explicitNoExternalActions: false,
      assignments: [
        { capabilityId: 'cap_search', capabilityVersion: 'v1', enabled: true },
        { capabilityId: 'capability.integration.notify_external', capabilityVersion: '1.0.0', enabled: false },
        { capabilityId: 'capability.workflow.human_handoff', capabilityVersion: '1.0.0', enabled: false },
      ],
    },
    mutationResult: null,
    isDirty: false,
    canManageCapabilities: true,
    isLoading: false,
    isMutating: false,
    errorMessage: null,
    formError: null,
    notice: null,
    loadCapabilities: vi.fn(),
    setExplicitNoExternalActions: vi.fn(),
    setCapabilityEnabled: vi.fn(),
    applyRecommendedSmokeSet: vi.fn(),
    updateAssignments: vi.fn(),
    ...manager,
  } as unknown as AgentCapabilitiesManager

  render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/tenants/tenant_1/agents/agent_1/capabilities']} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <AgentCapabilitiesView manager={defaultManager} />
      </MemoryRouter>
    </I18nProvider>,
  )

  return defaultManager
}

describe('AgentCapabilitiesView', () => {
  it('renders backend-owned catalog, assignments and readiness issues without future links', () => {
    renderView()

    expect(screen.getByText('Capabilities')).toBeInTheDocument()
    expect(screen.getByText('Recommended first smoke mode: enable only knowledge-base reads and explicitly block external actions.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Apply recommended set' })).toBeInTheDocument()
    expect(screen.getByText('Search knowledge')).toBeInTheDocument()
    expect(screen.getByText('Recommended for this agent')).toBeInTheDocument()
    expect(screen.getAllByText('Do not enable for first smoke').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Policy is not configured')).toBeInTheDocument()
    expect(screen.getAllByLabelText('Enabled')[0]).toBeChecked()
    expect(screen.getByLabelText('Block external actions')).toBeEnabled()
    expect(screen.queryByRole('link', { name: /Releases/i })).not.toBeInTheDocument()
  })

  it('localizes backend status codes and capability metadata for Russian operators', () => {
    renderView({}, 'ru')

    expect(screen.getByText('Возможности')).toBeInTheDocument()
    expect(screen.getByText('Назначение возможностей')).toBeInTheDocument()
    expect(screen.getByText('Рекомендуемый режим для первой проверки: включить только чтение из базы знаний и явно запретить внешние действия.')).toBeInTheDocument()
    expect(screen.getByText('Чтение из базы знаний безопасно; рабочие процессы, внешние уведомления и задачи исполнения создают действия или побочные эффекты.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Применить рекомендуемый набор' })).toBeInTheDocument()
    expect(screen.getAllByText('Заблокировано').length).toBeGreaterThan(0)
    expect(screen.getByText('Включённые возможности')).toBeInTheDocument()
    expect(screen.getByText('Внешние действия разрешены')).toBeInTheDocument()
    expect(screen.getByText('Для первой проверки рекомендуется запретить.')).toBeInTheDocument()
    expect(screen.getByText('Обязательна по шаблону')).toBeInTheDocument()
    expect(screen.getAllByText('База знаний').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Передача оператору').length).toBeGreaterThan(0)
    expect(screen.getByText('Поиск по базе знаний')).toBeInTheDocument()
    expect(screen.getByText('Поставить внешнее уведомление в очередь')).toBeInTheDocument()
    expect(screen.getByText('Запустить передачу оператору')).toBeInTheDocument()
    expect(screen.getAllByText('Не включать для первой проверки').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('Технический ID доступен при наведении.').length).toBeGreaterThanOrEqual(3)
    expect(screen.getAllByTitle('capability.integration.notify_external / 1.0.0').length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Запретить внешние действия')).toBeEnabled()
    expect(screen.getByText('Управляется сервером')).toBeInTheDocument()
    expect(screen.queryByText('template_required')).not.toBeInTheDocument()
    expect(screen.queryByText('handoff')).not.toBeInTheDocument()
    expect(screen.queryByText('backend_owned')).not.toBeInTheDocument()
    expect(document.body).not.toHaveTextContent(/capability\.|capabilities|workflow|smoke|recommended mode/i)
  })

  it('explains empty required capabilities and warns when external actions are blocked', () => {
    renderView({
      catalog: {
        relationToTemplate: 'template_optional',
        requiredCategories: [],
        optionalCategories: ['lead_capture'],
        items: [
          {
            capabilityId: 'capability.integration.notify_external',
            capabilityVersion: '1.0.0',
            label: 'Queue external notification',
            category: 'action',
            assignmentCategories: ['lead_capture'],
            riskClass: 'high',
            sideEffectClass: 'external_side_effect',
            downstreamExecutionKind: 'integration',
            invocationSemantics: 'async',
            policyRequirement: 'approval_required',
            meteringClassification: 'external_integration_invocation',
            explainabilityTags: ['external_notification'],
          },
        ],
      },
      form: {
        explicitNoExternalActions: true,
        assignments: [{ capabilityId: 'capability.integration.notify_external', capabilityVersion: '1.0.0', enabled: false }],
      },
    } as Partial<AgentCapabilitiesManager>)

    expect(screen.getByText('Backend does not require mandatory capabilities for this template.')).toBeInTheDocument()
    expect(screen.getByText('External actions are blocked: keep this capability disabled for the first smoke.')).toBeInTheDocument()
    expect(screen.getByText('Blocked by recommended mode')).toBeInTheDocument()
    expect(screen.getByLabelText('Block external actions')).toBeChecked()
    expect(screen.getByText('External actions blocked')).toBeInTheDocument()
    expect(screen.getByLabelText('Enabled')).toBeDisabled()
  })

  it('applies the recommended smoke shortcut from the primary guidance', async () => {
    const user = userEvent.setup()
    const manager = renderView()

    await user.click(screen.getByRole('button', { name: 'Apply recommended set' }))

    expect(manager.applyRecommendedSmokeSet).toHaveBeenCalled()
  })

  it('shows recommended set preview when smoke mode is selected', () => {
    renderView({
      form: {
        explicitNoExternalActions: true,
        assignments: [
          { capabilityId: 'cap_search', capabilityVersion: 'v1', enabled: true },
          { capabilityId: 'capability.integration.notify_external', capabilityVersion: '1.0.0', enabled: false },
          { capabilityId: 'capability.workflow.human_handoff', capabilityVersion: '1.0.0', enabled: false },
        ],
      },
      isDirty: true,
    } as Partial<AgentCapabilitiesManager>, 'ru')

    expect(screen.getByText('Будет включено: Получить контекст из базы знаний.')).toBeInTheDocument()
    expect(screen.getByText('Будет запрещено: внешние действия.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Набор выбран, сохраните назначения' })).toBeInTheDocument()
    expect(screen.getAllByText('Заблокировано рекомендуемым режимом').length).toBeGreaterThanOrEqual(2)
  })

  it('shows saved recommended set state after assignments are persisted', () => {
    renderView({
      form: {
        explicitNoExternalActions: true,
        assignments: [
          { capabilityId: 'cap_search', capabilityVersion: 'v1', enabled: true },
          { capabilityId: 'capability.integration.notify_external', capabilityVersion: '1.0.0', enabled: false },
          { capabilityId: 'capability.workflow.human_handoff', capabilityVersion: '1.0.0', enabled: false },
        ],
      },
      isDirty: false,
    } as Partial<AgentCapabilitiesManager>, 'ru')

    expect(screen.getByRole('button', { name: 'Рекомендуемый набор сохранён' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Сохранить назначения' })).toBeDisabled()
    expect(screen.getByTitle('Нет несохранённых изменений.')).toBeInTheDocument()
  })

  it('confirms manual high-risk capability enablement before changing the form', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const manager = renderView()

    await user.click(screen.getAllByLabelText('Enabled')[1])

    expect(confirmSpy).toHaveBeenCalledWith('This capability is not recommended for the first smoke. Enable it anyway?')
    expect(manager.setCapabilityEnabled).toHaveBeenCalledWith('capability.integration.notify_external', true)
    confirmSpy.mockRestore()
  })

  it('does not enable a high-risk capability when the operator cancels the warning', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const manager = renderView()

    await user.click(screen.getAllByLabelText('Enabled')[1])

    expect(confirmSpy).toHaveBeenCalledWith('This capability is not recommended for the first smoke. Enable it anyway?')
    expect(manager.setCapabilityEnabled).not.toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('shows mutation evidence with enabled count and external-action mode after save', () => {
    renderView({
      profile: {
        tenantId: 'tenant_1',
        agentId: 'agent_1',
        explicitNoExternalActions: true,
        relationToTemplate: 'template_required',
        readinessStatus: 'ready',
        requiredCategories: [],
        optionalCategories: [],
        assignments: [
          {
            capabilityId: 'cap_search',
            capabilityVersion: 'v1',
            label: 'Search knowledge',
            category: 'knowledge',
            assignmentCategories: ['required'],
            riskClass: 'low',
            sideEffectClass: 'read',
            downstreamExecutionKind: 'retrieval',
            invocationSemantics: 'backend_owned',
            policyRequirement: 'policy_required',
            meteringClassification: 'included',
            explainabilityTags: ['grounded'],
            enabled: true,
          },
        ],
        issues: [],
      },
      mutationResult: {
        action: 'upsert_capability_profile',
        resourceType: 'agent_capabilities',
        resourceId: 'agent_1',
        actorId: 'admin_1',
        actorType: 'admin',
        tenantId: 'tenant_1',
        correlationId: 'corr_1',
        requestId: null,
        mutationTimestamp: '2026-05-21T10:00:00Z',
        changedStateSummary: {},
      },
    } as Partial<AgentCapabilitiesManager>)

    expect(screen.getByText('Capability mutation evidence')).toBeInTheDocument()
    expect(screen.getByText('Capability profile update')).toBeInTheDocument()
    expect(screen.getByTitle('upsert_capability_profile')).toBeInTheDocument()
    expect(screen.getByText('agent_1')).toBeInTheDocument()
    expect(screen.getAllByText('1').length).toBeGreaterThan(0)
    expect(screen.getByText('External-action mode')).toBeInTheDocument()
    expect(screen.getByText('External actions blocked')).toBeInTheDocument()
    expect(screen.getAllByText('Ready').length).toBeGreaterThan(0)
    expect(screen.getByText('corr_1')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Copy' }).length).toBeGreaterThanOrEqual(2)
  })

  it('falls back to request id in save evidence when correlation id is absent', () => {
    renderView({
      mutationResult: {
        action: 'update_capability_assignments',
        resourceType: 'agent_capabilities',
        resourceId: 'agent_1',
        actorId: 'admin_1',
        actorType: 'admin',
        tenantId: 'tenant_1',
        correlationId: null,
        requestId: 'req_1',
        mutationTimestamp: '2026-05-21T10:00:00Z',
        changedStateSummary: {},
      },
    } as Partial<AgentCapabilitiesManager>)

    expect(screen.getByText('Capability mutation evidence')).toBeInTheDocument()
    expect(screen.getByText('Correlation / request')).toBeInTheDocument()
    expect(screen.getByText('req_1')).toBeInTheDocument()
  })

  it('confirms update before submitting assignment mutation', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const manager = renderView({ isDirty: true })

    await user.click(screen.getByRole('button', { name: 'Update assignments' }))

    expect(confirmSpy).toHaveBeenCalledWith('Update capability assignments for this agent?')
    expect(manager.updateAssignments).toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('links the success notice to the policy step', () => {
    renderView({ notice: 'Capabilities are ready. Next step: configure policy.' })

    expect(screen.getByText('Capabilities are ready. Next step: configure policy.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to policy' })).toHaveAttribute('href', '/tenants/tenant_1/agents/agent_1/policy')
  })

  it('keeps update disabled until capability form changes', () => {
    renderView()
    expect(screen.getByRole('button', { name: 'Update assignments' })).toBeDisabled()
    expect(screen.getByTitle('No unsaved changes.')).toBeInTheDocument()

    renderView({ isDirty: true })
    expect(screen.getAllByRole('button', { name: 'Update assignments' })[1]).toBeEnabled()
  })

  it('disables mutation controls when backend action refs do not allow capability management', () => {
    renderView({ canManageCapabilities: false })

    expect(screen.getByRole('button', { name: 'Update assignments' })).toBeDisabled()
    expect(screen.getAllByLabelText('Enabled')[0]).toBeDisabled()
    expect(screen.getByText('Your role can inspect capabilities but cannot change them.')).toBeInTheDocument()
  })
})
