import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/core/api/apiClient'
import { releasesApi } from '@/modules/Releases/api/releasesApi'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>
const postMock = apiClient.post as unknown as ReturnType<typeof vi.fn>

const releasePayload = {
  release_id: 'release_1',
  tenant_id: 'tenant_1',
  agent_id: 'agent_1',
  release_version: 3,
  status: 'draft',
  gate_mode: 'standard',
  active: false,
  created_at: '2026-05-13T10:00:00Z',
  updated_at: '2026-05-13T10:00:00Z',
  snapshot: {
    selected_config: { version: 7 },
    evaluation_evidence: { stable_reference: 'evidence_1', passed: true },
    manual_override: {
      used: false,
      status: null,
      reason_code: null,
      approval_actor_id: null,
      correlation_id: null,
      related_missing_or_failed_items: [],
      comment: null,
    },
    readiness_checklist: {
      items: [{ item_id: 'config', owner_area: 'config', state: 'ready', blocking: true, detail: 'Config ready', required_action: null }],
      missing_or_failed_items: [],
    },
  },
}

const mutationResult = {
  action: 'create_release',
  resource_type: 'release',
  resource_id: 'release_1',
  actor_id: 'admin_1',
  actor_type: 'admin',
  tenant_id: 'tenant_1',
  correlation_id: 'corr_1',
  mutation_timestamp: '2026-05-13T10:00:00Z',
  changed_state_summary: { status: 'draft' },
}

describe('releasesApi', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
  })

  it('maps backend release readiness without frontend calculation', async () => {
    getMock.mockResolvedValue({
      data: {
        agent_id: 'agent_1',
        readiness_status: 'blocked',
        release_ready: false,
        blocking_item_count: 1,
        items: [{ item_id: 'knowledge', owner_area: 'knowledge', state: 'missing', blocking: true, detail: 'Bind knowledge', required_action: 'Bind knowledge' }],
        active_release_present: true,
        active_release_id: 'release_0',
        active_release_version: 2,
        active_release_status: 'published',
        active_release_gate_mode: 'standard',
        latest_release_id: 'release_1',
        latest_release_version: 3,
        latest_release_status: 'draft',
        latest_release_gate_mode: 'standard',
        evaluation_evidence_owner_marker: 'backend',
        publish_owner_marker: 'backend',
      },
    })

    await expect(releasesApi.getReadiness('tenant_1', 'agent_1')).resolves.toMatchObject({
      agentId: 'agent_1',
      readinessStatus: 'blocked',
      releaseReady: false,
      blockingItemCount: 1,
      activeReleaseVersion: 2,
      latestReleaseVersion: 3,
      items: [{ itemId: 'knowledge', state: 'missing' }],
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/portal/tenants/tenant_1/agents/agent_1/release-readiness')
  })

  it('creates a release draft with evidence and manual override payloads', async () => {
    postMock.mockResolvedValue({ data: { resource: releasePayload, result: mutationResult } })

    await expect(
      releasesApi.createRelease('tenant_1', 'agent_1', {
        selectedConfigId: 'config_7',
        releaseCandidateId: null,
        evidence: {
          changeKind: 'runtime_behavior',
          stableReference: 'evidence_1',
          passed: true,
          smokeCaseId: 'widget_smoke',
          smokeCasePassed: true,
          smokeCaseReference: 'smoke_1',
          smokeCaseOutcome: 'accepted',
        },
        manualOverride: {
          reasonCode: 'business_approved',
          relatedMissingOrFailedItems: ['knowledge'],
          comment: 'Approved for first launch.',
        },
      }),
    ).resolves.toMatchObject({
      resource: { releaseVersion: 3, selectedConfigVersion: 7 },
      result: { correlationId: 'corr_1' },
    })

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/agents/agent_1/releases', {
      selected_config_id: 'config_7',
      release_candidate_id: null,
      evidence: {
        change_kind: 'runtime_behavior',
        stable_reference: 'evidence_1',
        passed: true,
        smoke_cases: [{ case_id: 'widget_smoke', passed: true, stable_reference: 'smoke_1', outcome: 'accepted' }],
      },
      manual_override: {
        reason_code: 'business_approved',
        related_missing_or_failed_items: ['knowledge'],
        comment: 'Approved for first launch.',
      },
    })
  })

  it('publishes, rolls back and disables release mutations through explicit endpoints', async () => {
    postMock.mockResolvedValue({ data: { resource: releasePayload, result: mutationResult } })

    await releasesApi.publishRelease('tenant_1', 'agent_1', 'release_1', {
      supportReconstructionReference: 'support_1',
      usageChatId: null,
      usageConversationTurnId: null,
      usageModelRequestId: null,
      billingExportReference: null,
      releaseReportReference: 'report_1',
    })
    await releasesApi.rollbackRelease('tenant_1', 'agent_1', 'release_1')
    await releasesApi.disableRelease('tenant_1', 'agent_1', 'release_1')

    expect(postMock).toHaveBeenNthCalledWith(1, '/api/admin/v1/tenants/tenant_1/agents/agent_1/releases/release_1/publish', {
      support_reconstruction_reference: 'support_1',
      usage_chat_id: null,
      usage_conversation_turn_id: null,
      usage_model_request_id: null,
      billing_export_reference: null,
      release_report_reference: 'report_1',
    })
    expect(postMock).toHaveBeenNthCalledWith(2, '/api/admin/v1/tenants/tenant_1/agents/agent_1/releases/release_1/rollback')
    expect(postMock).toHaveBeenNthCalledWith(3, '/api/admin/v1/tenants/tenant_1/agents/agent_1/releases/release_1/disable')
  })
})
