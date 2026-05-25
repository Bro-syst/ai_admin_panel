import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/core/api/apiClient'
import { agentsApi } from '@/modules/Agents/api/agentsApi'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>
const postMock = apiClient.post as unknown as ReturnType<typeof vi.fn>
const patchMock = apiClient.patch as unknown as ReturnType<typeof vi.fn>

const agentCardPayload = {
  agent_id: 'agent_1',
  tenant_id: 'tenant_1',
  name: 'Sales agent',
  description: 'Handles sales',
  purpose: 'Qualify leads',
  archetype_id: 'sales_qualification',
  template_id: 'sales_qualification_v1',
  lifecycle_status: 'draft',
  status: 'inactive',
  active_config_id: null,
  readiness_status: 'blocked',
  release_ready: false,
  blocking_item_count: 2,
  detail_route: '/tenants/tenant_1/agents/agent_1',
}

const setupSummaryPayload = {
  overall_readiness_status: 'blocked',
  release_ready: false,
  blocking_item_count: 2,
  tenant_status: 'active',
  agent_lifecycle_status: 'draft',
  archetype_template_status: 'selected',
  agent_config_status: 'missing',
  knowledge_status: 'missing',
  capability_status: 'missing',
  policy_status: 'missing',
  policy_binding_mode: null,
  site_widget_status: 'missing',
  public_channel_required: true,
  public_channel_in_use: false,
  metering_interpretation_markers: ['turns'],
  release_handoff_target: 'stage_10',
}

const foundationSummaryPayload = {
  validation_status: 'valid',
  compatibility_status: 'compatible',
  processing_path: 'safe_defaults',
  normalized: true,
  safe_defaults_applied: true,
  fallback_eligible: false,
  provenance_marker: 'template',
  issue_count: 0,
  issues: [],
  compatibility_notes: ['ok'],
}

const channelSummaryPayload = {
  supported_channels: ['web_widget'],
  public_channel_supported: true,
  readiness_status: 'blocked',
  public_channel_required: true,
  public_channel_in_use: false,
  binding_count: 0,
  ready_binding_count: 0,
  metering_interpretation_markers: ['turns'],
  release_handoff_target: 'stage_10',
  issue_count: 1,
}

const mutationResponsePayload = {
  resource: {
    id: 'agent_1',
    tenant_id: 'tenant_1',
    name: 'Sales agent',
    description: 'Handles sales',
    purpose: 'Qualify leads',
    archetype_id: 'sales_qualification',
    template_id: 'sales_qualification_v1',
    lifecycle_status: 'draft',
    status: 'inactive',
    active_config_id: null,
  },
  result: {
    action: 'agent.create',
    resource_type: 'agent',
    resource_id: 'agent_1',
    actor_id: 'admin_1',
    actor_type: 'admin',
    tenant_id: 'tenant_1',
    correlation_id: 'corr_1',
    mutation_timestamp: '2026-05-13T10:00:00Z',
    changed_state_summary: { status: 'inactive' },
  },
}

describe('agentsApi', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
    patchMock.mockReset()
  })

  it('maps tenant portal agent list read model', async () => {
    getMock.mockResolvedValue({
      data: {
        items: [agentCardPayload],
        metadata: {
          page: 1,
          page_size: 20,
          total_items: 1,
          returned_items: 1,
          ordering: 'name',
        },
      },
    })

    await expect(agentsApi.listPortalAgents('tenant_1')).resolves.toMatchObject({
      items: [{ agentId: 'agent_1', readinessStatus: 'blocked', blockingItemCount: 2 }],
      metadata: { totalItems: 1 },
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/portal/tenants/tenant_1/agents')
  })

  it('maps portal detail and setup summaries from backend read models', async () => {
    getMock.mockResolvedValue({
      data: {
        ...agentCardPayload,
        status: 'inactive',
        lifecycle_status: 'draft',
        setup_readiness_summary: setupSummaryPayload,
        foundation_assessment_summary: foundationSummaryPayload,
        channel_binding_summary: channelSummaryPayload,
        supported_mutation_action_refs: ['agent.update_metadata'],
        agent: agentCardPayload,
      },
    })

    await expect(agentsApi.getPortalAgentDetail('tenant_1', 'agent_1')).resolves.toMatchObject({
      agentId: 'agent_1',
      setupReadinessSummary: { overallReadinessStatus: 'blocked', releaseReady: false },
      foundationAssessmentSummary: { issueCount: 0 },
      channelBindingSummary: { bindingCount: 0 },
      supportedMutationActions: ['agent.update_metadata'],
    })
  })

  it('sends template-aware create payload and maps mutation feedback', async () => {
    postMock.mockResolvedValue({ data: mutationResponsePayload })

    await expect(
      agentsApi.createAgent({
        tenantId: 'tenant_1',
        name: 'Sales agent',
        description: 'Handles sales',
        purpose: 'Qualify leads',
        archetypeId: 'sales_qualification',
        templateId: 'sales_qualification_v1',
        lifecycleStatus: 'draft',
      }),
    ).resolves.toMatchObject({
      resource: { id: 'agent_1' },
      result: { correlationId: 'corr_1' },
    })

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/agents', {
      name: 'Sales agent',
      description: 'Handles sales',
      purpose: 'Qualify leads',
      archetype_id: 'sales_qualification',
      template_id: 'sales_qualification_v1',
      lifecycle_status: 'draft',
    })
  })

  it('sends confirmed status and lifecycle updates to dedicated endpoints', async () => {
    patchMock.mockResolvedValue({ data: mutationResponsePayload })

    await agentsApi.updateAgentStatus('tenant_1', 'agent_1', 'active')
    await agentsApi.updateAgentLifecycle('tenant_1', 'agent_1', 'disabled')

    expect(patchMock).toHaveBeenNthCalledWith(1, '/api/admin/v1/tenants/tenant_1/agents/agent_1/status', {
      status: 'active',
    })
    expect(patchMock).toHaveBeenNthCalledWith(2, '/api/admin/v1/tenants/tenant_1/agents/agent_1/lifecycle', {
      lifecycle_status: 'disabled',
    })
  })
})
