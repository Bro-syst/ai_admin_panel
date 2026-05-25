import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/core/api/apiClient'
import { agentPolicyApi } from '@/modules/AgentPolicy/api/agentPolicyApi'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>
const postMock = apiClient.post as unknown as ReturnType<typeof vi.fn>
const putMock = apiClient.put as unknown as ReturnType<typeof vi.fn>

const catalogPayload = {
  relation_to_template: 'template_default',
  policy_expectations: ['safe_fallback'],
  items: [
    {
      profile_id: 'policy_standard',
      label: 'Standard support policy',
      description: 'Default customer support policy.',
      expectation_markers: ['grounded'],
      decision_points: ['handoff'],
      policy_domains: ['support'],
      tenant_policy_markers: ['regulated'],
      business_policy_scope: 'sales_support',
      safe_fallback_mode: 'handoff',
    },
  ],
}

const bindingPayload = {
  tenant_id: 'tenant_1',
  agent_id: 'agent_1',
  binding_mode: 'explicit_profile',
  status: 'active',
  policy_profile_id: 'policy_standard',
  effective_profile_id: 'policy_standard',
  relation_to_template: 'override',
  readiness_status: 'ready',
  policy_expectations: ['safe_fallback'],
  tenant_policy_markers: ['regulated'],
  business_policy_scope: 'sales_support',
  inbound_request_evaluation_ready: true,
  prompt_injection_context_abuse_ready: true,
  sensitive_context_admission_ready: true,
  model_invocation_gating_ready: true,
  capability_action_gating_ready: true,
  decision_points: ['handoff'],
  policy_domains: ['support'],
  issues: [],
}

const mutationPayload = {
  resource: bindingPayload,
  result: {
    action: 'update_policy_binding',
    resource_type: 'agent_policy',
    resource_id: 'agent_1',
    actor_id: 'admin_1',
    actor_type: 'admin',
    tenant_id: 'tenant_1',
    correlation_id: 'corr_1',
    mutation_timestamp: '2026-05-13T10:00:00Z',
    changed_state_summary: { binding_mode: 'explicit_profile' },
  },
}

describe('agentPolicyApi', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
    putMock.mockReset()
  })

  it('maps policy profile catalog payload from the backend contract', async () => {
    getMock.mockResolvedValue({ data: catalogPayload })

    await expect(agentPolicyApi.getCatalog('tenant_1', 'agent_1')).resolves.toMatchObject({
      relationToTemplate: 'template_default',
      policyExpectations: ['safe_fallback'],
      items: [{ profileId: 'policy_standard', label: 'Standard support policy' }],
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/agents/agent_1/policy-profiles/catalog')
  })

  it('maps current policy binding and backend readiness flags', async () => {
    getMock.mockResolvedValue({ data: bindingPayload })

    await expect(agentPolicyApi.getBinding('tenant_1', 'agent_1')).resolves.toMatchObject({
      bindingMode: 'explicit_profile',
      effectiveProfileId: 'policy_standard',
      inboundRequestEvaluationReady: true,
      capabilityActionGatingReady: true,
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/agents/agent_1/policy/binding')
  })

  it('updates policy binding using the backend mutation contract and returns correlation feedback', async () => {
    putMock.mockResolvedValue({ data: mutationPayload })

    await expect(
      agentPolicyApi.updateBinding('tenant_1', 'agent_1', {
        bindingMode: 'explicit_profile',
        policyProfileId: 'policy_standard',
        tenantPolicyMarkers: ['regulated'],
        businessPolicyScope: 'sales_support',
      }),
    ).resolves.toMatchObject({
      resource: { effectiveProfileId: 'policy_standard' },
      result: { correlationId: 'corr_1' },
    })

    expect(putMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/agents/agent_1/policy/binding', {
      binding_mode: 'explicit_profile',
      policy_profile_id: 'policy_standard',
      tenant_policy_markers: ['regulated'],
      business_policy_scope: 'sales_support',
    })
  })

  it('validates policy binding through the backend validation endpoint', async () => {
    postMock.mockResolvedValue({ data: bindingPayload })

    await expect(agentPolicyApi.validateBinding('tenant_1', 'agent_1')).resolves.toMatchObject({
      readinessStatus: 'ready',
      decisionPoints: ['handoff'],
    })

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/agents/agent_1/policy/binding/validate')
  })
})
