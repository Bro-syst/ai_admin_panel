import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import type { AgentPolicyManager } from '@/modules/AgentPolicy/model/useAgentPolicyManager'
import { AgentPolicyView } from '@/modules/AgentPolicy/ui/AgentPolicyView'

const binding = {
  tenantId: 'tenant_1',
  agentId: 'agent_1',
  bindingMode: 'explicit_profile',
  status: 'active',
  policyProfileId: 'policy_standard',
  effectiveProfileId: 'policy_standard',
  relationToTemplate: 'override',
  readinessStatus: 'ready',
  policyExpectations: ['safe_fallback'],
  tenantPolicyMarkers: ['regulated'],
  businessPolicyScope: 'sales_support',
  inboundRequestEvaluationReady: true,
  promptInjectionContextAbuseReady: true,
  sensitiveContextAdmissionReady: true,
  modelInvocationGatingReady: true,
  capabilityActionGatingReady: true,
  decisionPoints: ['handoff'],
  policyDomains: ['support'],
  issues: [],
}

function renderView(manager: Partial<AgentPolicyManager> = {}, locale = 'en') {
  window.localStorage.setItem('ai_admin_panel:locale_v1', locale)

  const defaultManager = {
    tenantId: 'tenant_1',
    agentId: 'agent_1',
    agentDetail: { agentId: 'agent_1', tenantId: 'tenant_1', name: 'Sales agent', templateId: 'support_default_v1', supportedMutationActions: ['agent_policy.manage'] },
    catalog: {
      relationToTemplate: 'template_default',
      policyExpectations: ['safe_fallback'],
      items: [
        {
          profileId: 'policy_standard',
          label: 'Standard support policy',
          description: 'Default customer support policy.',
          expectationMarkers: ['grounded'],
          decisionPoints: ['handoff'],
          policyDomains: ['support'],
          tenantPolicyMarkers: ['regulated'],
          businessPolicyScope: 'sales_support',
          safeFallbackMode: 'handoff',
        },
      ],
    },
    binding,
    validationBinding: {
      ...binding,
      issues: ['policy reviewed'],
    },
    form: {
      bindingMode: 'explicit_profile',
      policyProfileId: 'policy_standard',
      tenantPolicyMarkers: ['regulated'],
      tenantPolicyMarkersText: 'regulated',
      businessPolicyScope: 'sales_support',
    },
    mutationResult: null,
    canManagePolicy: true,
    isDirty: false,
    isLoading: false,
    isMutating: false,
    errorMessage: null,
    formError: null,
    notice: null,
    loadPolicy: vi.fn(),
    updateForm: vi.fn(),
    updateBinding: vi.fn(),
    validateBinding: vi.fn(),
    ...manager,
  } as unknown as AgentPolicyManager

  render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/tenants/tenant_1/agents/agent_1/policy']} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <AgentPolicyView manager={defaultManager} />
      </MemoryRouter>
    </I18nProvider>,
  )

  return defaultManager
}

describe('AgentPolicyView', () => {
  it('renders policy catalog, backend readiness flags and validation result without future links', () => {
    renderView()

    expect(screen.getByText('Policy')).toBeInTheDocument()
    expect(screen.getAllByText('Standard support policy').length).toBeGreaterThan(0)
    expect(screen.getByText('Validation result')).toBeInTheDocument()
    expect(screen.getByText('Policy reviewed')).toBeInTheDocument()
    expect(screen.getAllByText('Capability action gating').length).toBeGreaterThan(0)
    expect(screen.getByText('Advanced overrides')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Releases/i })).not.toBeInTheDocument()
  })

  it('localizes backend policy codes for Russian operators', () => {
    renderView({
      catalog: {
        relationToTemplate: 'required',
        policyExpectations: ['lead_data_safety_profile'],
        items: [
          {
            profileId: 'policy_profile.lead_data_safety_v1',
            label: 'Lead data safety profile',
            description: 'Explicit profile for lead-capture and sales-oriented flows handling customer data.',
            expectationMarkers: ['lead_data_safety_profile'],
            decisionPoints: ['inbound_request_evaluation', 'bounded_sensitive_context_admission', 'model_invocation_gating', 'external_integration_invocation'],
            policyDomains: [
              'prompt_injection_instruction_override',
              'privacy_pii_sensitive_execution_restriction',
              'tenant_business_policy_restriction',
              'privileged_external_action_gating',
            ],
            tenantPolicyMarkers: ['policy:lead-data', 'policy:tenant-scoped'],
            businessPolicyScope: 'limit_sensitive_context',
            safeFallbackMode: 'limit_sensitive_context',
          },
        ],
      },
      binding: {
        ...binding,
        bindingMode: 'inherited_default',
        status: 'pending',
        policyProfileId: null,
        effectiveProfileId: null,
        relationToTemplate: 'required',
        readinessStatus: 'pending',
        policyExpectations: ['lead_data_safety_profile'],
        decisionPoints: ['inbound_request_evaluation'],
        policyDomains: ['tenant_business_policy_restriction'],
        tenantPolicyMarkers: ['policy:lead-data'],
        issues: [],
      },
      form: {
        bindingMode: 'inherited_default',
        policyProfileId: null,
        tenantPolicyMarkers: ['policy:lead-data'],
        tenantPolicyMarkersText: 'policy:lead-data',
        businessPolicyScope: 'limit_sensitive_context',
      },
      validationBinding: null,
    }, 'ru')

    expect(screen.getByText('Политика')).toBeInTheDocument()
    expect(screen.getByText('Привязка политики')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Проверить привязку' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Сохранить привязку' })).toBeInTheDocument()
    expect(screen.getAllByText('Ожидает настройки').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Наследовать профиль тенанта').length).toBeGreaterThan(0)
    expect(screen.getByText('Обязательна')).toBeInTheDocument()
    expect(screen.getAllByText('Профиль безопасности лид-данных').length).toBeGreaterThan(0)
    expect(screen.getByText('Явный профиль для захвата лидов и продаж, где агент работает с клиентскими данными.')).toBeInTheDocument()
    expect(screen.getAllByText('Проверка входящего запроса').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Контроль вызова модели').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Защита от подмены инструкций').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Ограничения бизнес-политики тенанта').length).toBeGreaterThan(0)
    expect(screen.getByText('Политика лид-данных')).toBeInTheDocument()
    expect(screen.queryByText('inherited_default')).not.toBeInTheDocument()
    expect(screen.queryByText('lead_data_safety_profile')).not.toBeInTheDocument()
    expect(screen.queryByText('tenant_business_policy_restriction')).not.toBeInTheDocument()
    expect(screen.queryByText('policy_profile.lead_data_safety_v1')).not.toBeInTheDocument()
    expect(screen.queryByText('Защита от prompt injection / злоупотребления контекстом')).not.toBeInTheDocument()
    expect(screen.queryByText('Защита от prompt injection и подмены инструкций')).not.toBeInTheDocument()
  })

  it('validates through backend and confirms update before policy mutation', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const manager = renderView()

    await user.click(screen.getByRole('button', { name: 'Validate binding' }))
    await user.click(screen.getByRole('button', { name: 'Update binding' }))

    expect(manager.validateBinding).toHaveBeenCalled()
    expect(confirmSpy).toHaveBeenCalledWith('Update policy binding for this agent?')
    expect(manager.updateBinding).toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('recommends explicit lead-data policy profile for sales qualification smoke', async () => {
    const user = userEvent.setup()
    const manager = renderView({
      agentDetail: { agentId: 'agent_1', tenantId: 'tenant_1', name: 'Sales agent', templateId: 'sales_qualification_v1', supportedMutationActions: ['agent_policy.manage'] } as AgentPolicyManager['agentDetail'],
      catalog: {
        relationToTemplate: 'required',
        policyExpectations: ['lead_data_safety_profile'],
        items: [
          {
            profileId: 'policy_profile.lead_data_safety_v1',
            label: 'Lead data safety profile',
            description: 'Explicit profile for lead-capture and sales-oriented flows handling customer data.',
            expectationMarkers: ['lead_data_safety_profile'],
            decisionPoints: ['inbound_request_evaluation'],
            policyDomains: ['tenant_business_policy_restriction'],
            tenantPolicyMarkers: ['policy:lead-data'],
            businessPolicyScope: 'limit_sensitive_context',
            safeFallbackMode: 'limit_sensitive_context',
          },
        ],
      },
      binding: {
        ...binding,
        bindingMode: 'inherited_default',
        policyProfileId: null,
        effectiveProfileId: null,
        relationToTemplate: 'required',
        readinessStatus: 'pending',
      },
      form: {
        bindingMode: 'inherited_default',
        policyProfileId: null,
        tenantPolicyMarkers: [],
        tenantPolicyMarkersText: '',
        businessPolicyScope: null,
      },
    })

    expect(screen.getByText('For the first smoke, an explicit profile is recommended.')).toBeInTheDocument()
    expect(screen.getByText('Recommended setup for this smoke')).toBeInTheDocument()
    expect(screen.getAllByText('Recommended').length).toBeGreaterThan(0)
    expect(screen.getByText('Best fit for this agent')).toBeInTheDocument()
    expect(screen.getByText('Profile details')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Select recommended profile' }))

    expect(manager.updateForm).toHaveBeenCalledWith({
      bindingMode: 'explicit_profile',
      policyProfileId: 'policy_profile.lead_data_safety_v1',
      businessPolicyScope: 'limit_sensitive_context',
    })
  })

  it('shows profile-value guidance and next-step link after policy save', () => {
    renderView({
      notice: 'Policy binding was updated.',
    })

    expect(screen.getByText('Profile values will be used. Override them only when the backend policy owner explicitly requires it.')).toBeInTheDocument()
    expect(screen.getByText(/Policy is ready. Next step: configure sites and widgets./)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to sites and widgets' })).toHaveAttribute('href', '/tenants/tenant_1/agents/agent_1/sites-widgets')
  })

  it('shows policy save evidence and validation dirty-state hint', () => {
    renderView({
      isDirty: true,
      mutationResult: {
        action: 'upsert_policy_binding',
        resourceType: 'agent_policy_binding',
        resourceId: 'binding_1',
        actorId: null,
        actorType: null,
        tenantId: 'tenant_1',
        correlationId: null,
        requestId: 'req_1',
        mutationTimestamp: '2026-05-25T10:00:00Z',
        changedStateSummary: {},
      },
    })

    expect(screen.getByText('Policy save evidence')).toBeInTheDocument()
    expect(screen.getByText('upsert_policy_binding')).toBeInTheDocument()
    expect(screen.getAllByText('agent_1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Explicit policy profile').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Ready').length).toBeGreaterThan(0)
    expect(screen.getByText('req_1')).toBeInTheDocument()
    expect(screen.getByTitle('Save the binding first if the backend needs saved state for validation.')).toBeInTheDocument()
  })

  it('disables policy mutation when backend action refs do not allow policy management', () => {
    renderView({ canManagePolicy: false })

    expect(screen.getByRole('button', { name: 'Update binding' })).toBeDisabled()
    expect(screen.getByLabelText('Binding mode')).toBeDisabled()
    expect(screen.getByText('Your role can inspect policy but cannot change it.')).toBeInTheDocument()
  })
})
