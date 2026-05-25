import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/core/api/apiClient'
import { agentKnowledgeBindingApi } from '@/modules/AgentKnowledgeBinding/api/agentKnowledgeBindingApi'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}))

const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>
const putMock = apiClient.put as unknown as ReturnType<typeof vi.fn>

describe('agentKnowledgeBindingApi', () => {
  beforeEach(() => {
    getMock.mockReset()
    putMock.mockReset()
  })

  it('maps portal agent knowledge status from backend read model', async () => {
    getMock.mockResolvedValue({
      data: {
        agent_id: 'agent_1',
        relation_to_template: 'required',
        readiness_status: 'blocked',
        binding_mode: 'sources',
        source_set_id: null,
        retrieval_mode: 'grounded',
        required_modes: ['sources'],
        optional_modes: ['source_set'],
        issues: ['missing evidence'],
        sources: [{ source_id: 'source_1', label: 'FAQ', source_class: 'faq', selected: true, retrieval_mode_allowed: true }],
      },
    })

    await expect(agentKnowledgeBindingApi.getPortalStatus('tenant_1', 'agent_1')).resolves.toMatchObject({
      readinessStatus: 'blocked',
      sources: [{ sourceId: 'source_1', selected: true }],
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/portal/tenants/tenant_1/agents/agent_1/knowledge')
  })

  it('updates binding without cross-tenant payload fields', async () => {
    putMock.mockResolvedValue({
      data: {
        resource: {
          tenant_id: 'tenant_1',
          agent_id: 'agent_1',
          binding_mode: 'sources',
          status: 'active',
          relation_to_template: 'required',
          readiness_status: 'ready',
          required_modes: [],
          optional_modes: [],
          source_set_id: null,
          source_ids: ['source_1'],
          source_markers: ['source_pack.aml_kyc_domain_knowledge_v1'],
          source_classes: ['faq'],
          retrieval_mode: 'grounded',
          issues: [],
        },
        result: {
          action: 'upsert_agent_knowledge_binding',
          resource_type: 'agent_knowledge_binding',
          resource_id: 'agent_1',
          actor_id: 'admin_1',
          actor_type: 'admin',
          tenant_id: 'tenant_1',
          correlation_id: 'corr_1',
          mutation_timestamp: '2026-05-13T10:00:00Z',
          changed_state_summary: {},
        },
      },
    })

    await expect(agentKnowledgeBindingApi.updateBinding('tenant_1', 'agent_1', {
      bindingMode: 'sources',
      sourceSetId: null,
      sourceIds: ['source_1'],
      retrievalMode: 'grounded',
    })).resolves.toMatchObject({
      resource: { sourceIds: ['source_1'] },
      result: { correlationId: 'corr_1' },
    })

    expect(putMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/agents/agent_1/knowledge/binding', {
      binding_mode: 'sources',
      source_set_id: null,
      source_ids: ['source_1'],
      retrieval_mode: 'grounded',
    })
  })
})
