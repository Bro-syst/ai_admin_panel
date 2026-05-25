import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/core/api/apiClient'
import { agentConfigApi } from '@/modules/AgentConfig/api/agentConfigApi'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>
const postMock = apiClient.post as unknown as ReturnType<typeof vi.fn>

const configPayload = {
  id: 'config_1',
  tenant_id: 'tenant_1',
  agent_id: 'agent_1',
  version: 3,
  status: 'inactive',
  activated_at: null,
  payload: {
    identity: { agent_label: 'Sales assistant', persona_summary: 'Helpful' },
    tone_and_language: { tone: 'clear', language: 'en' },
    goals: ['answer questions'],
    rules: ['stay grounded'],
    restrictions: ['no legal advice'],
    handoff_policy: { handoff_enabled: true, handoff_conditions: ['customer asks'] },
    integration_policy: {
      integration_enabled: true,
      action_bindings: [
        {
          action_class: 'ticket.create',
          connector_key: 'support',
          operation_key: 'create',
          interface_type: 'http',
          side_effect_mode: 'write',
          reference_scope: 'tenant',
          reference_key: 'default',
          endpoint_url: 'https://example.test',
          timeout_class: 'short',
          retry_policy_class: null,
          compensation_mode: null,
        },
      ],
    },
    model_preference: {
      preferred_model_family: 'balanced',
      latency_sensitivity: 'medium',
      quality_sensitivity: 'high',
      cost_sensitivity: 'medium',
    },
    model_selection_hints: { preferred_capabilities: ['tool_use'], fallback_allowed: true },
    execution_profile_hints: { profile_name: 'default', response_mode: 'concise' },
    compatibility_and_safety: { config_schema_version: 'v1', safety_labels: ['public'], compatibility_notes: ['ok'] },
  },
}

const mutationPayload = {
  resource: configPayload,
  result: {
    action: 'create_config_draft',
    resource_type: 'agent_config',
    resource_id: 'config_1',
    actor_id: 'admin_1',
    actor_type: 'admin',
    tenant_id: 'tenant_1',
    correlation_id: 'corr_1',
    mutation_timestamp: '2026-05-13T10:00:00Z',
    changed_state_summary: { version: 3 },
  },
}

describe('agentConfigApi', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
  })

  it('maps config detail payload to frontend schema', async () => {
    getMock.mockResolvedValue({ data: configPayload })

    await expect(agentConfigApi.getConfigDetail('tenant_1', 'agent_1', 'config_1')).resolves.toMatchObject({
      id: 'config_1',
      payload: {
        identity: { agentLabel: 'Sales assistant' },
        integrationPolicy: {
          actionBindings: [{ actionClass: 'ticket.create', connectorKey: 'support' }],
        },
      },
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/agents/agent_1/configs/config_1')
  })

  const approvedPayload = {
    identity: { agentLabel: 'Sales assistant', personaSummary: 'Helpful' },
    toneAndLanguage: { tone: 'clear', language: 'en' },
    goals: ['answer questions'],
    rules: ['stay grounded'],
    restrictions: ['no legal advice'],
    handoffPolicy: { handoffEnabled: false, handoffConditions: [] },
    integrationPolicy: { integrationEnabled: false, actionBindings: [] },
    modelPreference: {
      preferredModelFamily: null,
      latencySensitivity: null,
      qualitySensitivity: null,
      costSensitivity: null,
    },
    modelSelectionHints: { preferredCapabilities: [], fallbackAllowed: true },
    executionProfileHints: { profileName: null, responseMode: null },
    compatibilityAndSafety: { configSchemaVersion: 'v1', safetyLabels: [], compatibilityNotes: [] },
  }

  it('creates draft with approved payload and maps mutation feedback', async () => {
    postMock.mockResolvedValue({ data: mutationPayload })

    await expect(agentConfigApi.createDraft('tenant_1', 'agent_1', approvedPayload)).resolves.toMatchObject({
      resource: { id: 'config_1' },
      result: { correlationId: 'corr_1' },
    })

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/agents/agent_1/config-drafts', {
      payload: expect.objectContaining({
        identity: { agent_label: 'Sales assistant', persona_summary: 'Helpful' },
        compatibility_and_safety: expect.objectContaining({ config_schema_version: 'v1' }),
      }),
    })
  })

  it('creates config version through the configs endpoint', async () => {
    postMock.mockResolvedValue({ data: mutationPayload })

    await expect(agentConfigApi.createConfigVersion('tenant_1', 'agent_1', approvedPayload)).resolves.toMatchObject({
      resource: { id: 'config_1' },
      result: { correlationId: 'corr_1' },
    })

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/agents/agent_1/configs', {
      payload: expect.objectContaining({
        identity: { agent_label: 'Sales assistant', persona_summary: 'Helpful' },
        compatibility_and_safety: expect.objectContaining({ config_schema_version: 'v1' }),
      }),
    })
  })

  it('calls validation, activation and rollback endpoints', async () => {
    postMock.mockResolvedValueOnce({
      data: {
        validation_status: 'valid',
        compatibility_status: 'compatible',
        processing_path: 'historical',
        normalized: true,
        safe_defaults_applied: true,
        fallback_eligible: false,
        provenance_marker: 'backend',
        issues: [],
        compatibility_notes: [],
      },
    })
    postMock.mockResolvedValue({ data: mutationPayload })

    await agentConfigApi.validateConfig('tenant_1', 'agent_1', 'config_1')
    await agentConfigApi.activateConfig('tenant_1', 'agent_1', 'config_1')
    await agentConfigApi.rollbackConfig('tenant_1', 'agent_1', 'config_1')

    expect(postMock).toHaveBeenNthCalledWith(1, '/api/admin/v1/tenants/tenant_1/agents/agent_1/configs/config_1/validate')
    expect(postMock).toHaveBeenNthCalledWith(2, '/api/admin/v1/tenants/tenant_1/agents/agent_1/configs/config_1/activate')
    expect(postMock).toHaveBeenNthCalledWith(3, '/api/admin/v1/tenants/tenant_1/agents/agent_1/configs/config_1/rollback')
  })
})
