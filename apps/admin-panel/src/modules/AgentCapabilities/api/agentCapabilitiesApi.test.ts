import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/core/api/apiClient'
import { agentCapabilitiesApi } from '@/modules/AgentCapabilities/api/agentCapabilitiesApi'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>
const putMock = apiClient.put as unknown as ReturnType<typeof vi.fn>

const catalogPayload = {
  relation_to_template: 'template_required',
  required_categories: ['knowledge'],
  optional_categories: ['handoff'],
  items: [
    {
      capability_id: 'cap_search',
      capability_version: 'v1',
      label: 'Search knowledge',
      category: 'knowledge',
      assignment_categories: ['required'],
      risk_class: 'low',
      side_effect_class: 'read',
      downstream_execution_kind: 'retrieval',
      invocation_semantics: 'backend_owned',
      policy_requirement: 'policy_required',
      metering_classification: 'included',
      explainability_tags: ['grounded'],
    },
  ],
}

const profilePayload = {
  tenant_id: 'tenant_1',
  agent_id: 'agent_1',
  explicit_no_external_actions: false,
  relation_to_template: 'template_required',
  readiness_status: 'ready',
  required_categories: ['knowledge'],
  optional_categories: ['handoff'],
  assignments: [{ ...catalogPayload.items[0], enabled: true }],
  issues: [],
}

const mutationPayload = {
  resource: profilePayload,
  result: {
    action: 'update_capability_assignments',
    resource_type: 'agent_capabilities',
    resource_id: 'agent_1',
    actor_id: 'admin_1',
    actor_type: 'admin',
    tenant_id: 'tenant_1',
    correlation_id: 'corr_1',
    mutation_timestamp: '2026-05-13T10:00:00Z',
    changed_state_summary: { enabled: 1 },
  },
}

describe('agentCapabilitiesApi', () => {
  beforeEach(() => {
    getMock.mockReset()
    putMock.mockReset()
  })

  it('maps capability catalog payload from the backend contract', async () => {
    getMock.mockResolvedValue({ data: catalogPayload })

    await expect(agentCapabilitiesApi.getCatalog('tenant_1', 'agent_1')).resolves.toMatchObject({
      relationToTemplate: 'template_required',
      items: [{ capabilityId: 'cap_search', capabilityVersion: 'v1', label: 'Search knowledge' }],
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/agents/agent_1/capabilities/catalog')
  })

  it('maps current assignments and readiness issues without local calculation', async () => {
    getMock.mockResolvedValue({ data: profilePayload })

    await expect(agentCapabilitiesApi.getAssignments('tenant_1', 'agent_1')).resolves.toMatchObject({
      tenantId: 'tenant_1',
      explicitNoExternalActions: false,
      readinessStatus: 'ready',
      assignments: [{ capabilityId: 'cap_search', enabled: true }],
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/agents/agent_1/capabilities/assignments')
  })

  it('updates assignments using the backend mutation contract and returns correlation feedback', async () => {
    putMock.mockResolvedValue({ data: mutationPayload })

    await expect(
      agentCapabilitiesApi.updateAssignments('tenant_1', 'agent_1', {
        explicitNoExternalActions: false,
        assignments: [{ capabilityId: 'cap_search', capabilityVersion: 'v1', enabled: true }],
      }),
    ).resolves.toMatchObject({
      resource: { assignments: [{ capabilityId: 'cap_search', enabled: true }] },
      result: { correlationId: 'corr_1' },
    })

    expect(putMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/agents/agent_1/capabilities/assignments', {
      explicit_no_external_actions: false,
      assignments: [{ capability_id: 'cap_search', capability_version: 'v1', enabled: true }],
    })
  })
})
