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
          changeKind: 'retrieval_behavior_future',
          stableReference: 'evidence_1',
          passed: true,
          smokeCases: [
            { caseId: 'widget_smoke', passed: true, stableReference: 'smoke_1', outcome: 'accepted' },
            { caseId: 'unknown_fallback', passed: false, stableReference: null, outcome: 'rejected' },
          ],
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
        change_kind: 'retrieval_behavior_future',
        stable_reference: 'evidence_1',
        passed: true,
        smoke_cases: [
          { case_id: 'widget_smoke', passed: true, stable_reference: 'smoke_1', outcome: 'accepted' },
          { case_id: 'unknown_fallback', passed: false, stable_reference: null, outcome: 'rejected' },
        ],
      },
      manual_override: {
        reason_code: 'business_approved',
        related_missing_or_failed_items: ['knowledge'],
        comment: 'Approved for first launch.',
      },
    })
  })

  it('loads and maps release evidence requirements from the portal read model', async () => {
    getMock.mockResolvedValue({
      data: {
        agent_id: 'agent_1',
        template_id: 'sales_qualification_v1',
        release_setup_ready: true,
        release_setup_blocking_items: [{ item_id: 'knowledge', owner_area: 'knowledge', state: 'ready', blocking: false, detail: 'Ready', required_action: null }],
        evidence_required: true,
        evidence_status: 'missing_until_submitted',
        required_change_kind: 'retrieval_behavior_future',
        stable_reference_rule: 'knowledge_retrieval_run_required_for_grounded_cases',
        stable_reference_prefix: 'knowledge-retrieval-run:',
        required_smoke_cases: [{
          case_id: 'sales_support.product_grounded',
          required: true,
          grounded_reference_required: true,
          stable_reference_must_match_release_reference: true,
          label_key: 'release.evidence.sales_support.product_grounded.label',
          description_key: 'release.evidence.sales_support.product_grounded.description',
        }],
        manual_override: {
          allowed: true,
          blocked_reason: null,
          default_reason_code: 'release_evidence_operator_approved_override',
          related_missing_or_failed_items_default: ['evaluation_evidence'],
        },
        publish_evidence_requirements: [{
          field: 'release_report_reference',
          required: true,
          label_key: 'release.publish.release_report_reference.label',
          description_key: 'release.publish.release_report_reference.description',
        }],
        runtime_provider_preflight: {
          ready: false,
          requirements: [{
            provider_id: 'openai',
            credential_key: 'openai-primary',
            credential_configured: false,
            secret_resolvable: false,
            state: 'missing_credential',
            required_action: 'Register an active system service credential before running public widget smoke or publishing release evidence.',
          }],
        },
        last_checked_at: '2026-05-25T00:00:00Z',
        owner_stage: 'stage24_release_workflow',
      },
    })

    await expect(releasesApi.getEvidenceRequirements('tenant_1', 'agent_1')).resolves.toMatchObject({
      agentId: 'agent_1',
      templateId: 'sales_qualification_v1',
      requiredChangeKind: 'retrieval_behavior_future',
      stableReferencePrefix: 'knowledge-retrieval-run:',
      requiredSmokeCases: [{ caseId: 'sales_support.product_grounded', groundedReferenceRequired: true }],
      manualOverride: { allowed: true, defaultReasonCode: 'release_evidence_operator_approved_override' },
      publishEvidenceRequirements: [{ field: 'release_report_reference', required: true }],
      runtimeProviderPreflight: {
        available: true,
        ready: false,
        requirements: [{
          providerId: 'openai',
          credentialKey: 'openai-primary',
          credentialConfigured: false,
          secretResolvable: false,
          state: 'missing_credential',
          requiredAction: 'Register an active system service credential before running public widget smoke or publishing release evidence.',
        }],
      },
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/portal/tenants/tenant_1/agents/agent_1/release-evidence-requirements')
  })

  it('treats missing runtime provider preflight as unavailable and not ready', async () => {
    getMock.mockResolvedValue({
      data: {
        agent_id: 'agent_1',
        template_id: 'sales_qualification_v1',
        release_setup_ready: true,
        release_setup_blocking_items: [],
        evidence_required: true,
        evidence_status: 'submitted',
        required_change_kind: 'retrieval_behavior_future',
        stable_reference_rule: null,
        stable_reference_prefix: null,
        required_smoke_cases: [],
        manual_override: null,
        publish_evidence_requirements: [],
        last_checked_at: null,
        owner_stage: 'stage24_release_workflow',
      },
    })

    await expect(releasesApi.getEvidenceRequirements('tenant_1', 'agent_1')).resolves.toMatchObject({
      runtimeProviderPreflight: {
        available: false,
        ready: false,
        requirements: [],
      },
    })
  })

  it('loads backend-provided usage evidence candidates without deriving publish ids', async () => {
    getMock.mockResolvedValue({
      data: {
        items: [{
          chat_id: 'chat_1',
          conversation_turn_id: 'turn_1',
          model_request_id: 'model_request_1',
          created_at: '2026-05-27T10:00:00Z',
          turn_status: 'response_rendered',
          model_request_state: 'completed',
          usage_recorded: true,
          agent_id: 'agent_1',
          agent_config_id: 'config_1',
          widget_key: 'sales-widget',
          channel: 'public_widget',
          display_label: '2026-05-27 public widget smoke',
          prompt: 'must-not-leak',
          transcript: 'must-not-leak',
        }],
        summary: {
          candidate_count: 1,
          ready: true,
          no_candidate_reason: null,
          message: 'Candidate is ready.',
        },
        no_candidate_reason: null,
        generated_at: '2026-05-27T10:01:00Z',
      },
    })

    await expect(releasesApi.getUsageEvidenceCandidates('tenant_1', 'agent_1')).resolves.toEqual({
      items: [{
        chatId: 'chat_1',
        conversationTurnId: 'turn_1',
        modelRequestId: 'model_request_1',
        createdAt: '2026-05-27T10:00:00Z',
        turnStatus: 'response_rendered',
        modelRequestState: 'completed',
        usageRecorded: true,
        agentId: 'agent_1',
        agentConfigId: 'config_1',
        widgetKey: 'sales-widget',
        channel: 'public_widget',
        displayLabel: '2026-05-27 public widget smoke',
      }],
      summary: {
        candidateCount: 1,
        ready: true,
        noCandidateReason: null,
        message: 'Candidate is ready.',
      },
      noCandidateReason: null,
      generatedAt: '2026-05-27T10:01:00Z',
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/portal/tenants/tenant_1/agents/agent_1/release-usage-evidence-candidates')
  })

  it('maps usage evidence unavailability without partial candidates', async () => {
    getMock.mockResolvedValue({
      data: {
        items: [],
        summary: {
          candidate_count: 0,
          ready: false,
          no_candidate_reason: 'candidate_source_unavailable',
          message: 'Usage source unavailable.',
        },
        no_candidate_reason: 'candidate_source_unavailable',
        generated_at: null,
      },
    })

    await expect(releasesApi.getUsageEvidenceCandidates('tenant_1', 'agent_1')).resolves.toMatchObject({
      items: [],
      summary: {
        candidateCount: 0,
        ready: false,
        noCandidateReason: 'candidate_source_unavailable',
      },
      noCandidateReason: 'candidate_source_unavailable',
      generatedAt: null,
    })
  })

  it('loads retrieval evidence candidates through canonical portal endpoint without raw payload leakage', async () => {
    getMock.mockResolvedValue({
      data: {
        items: [{
          candidate_id: 'candidate_1',
          release_candidate_id: 'release_candidate_1',
          retrieval_run_id: 'retrieval_run_1',
          stable_reference: 'knowledge-retrieval-run:run_1',
          support_reconstruction_reference: 'support-reconstruction:run_1',
          selected_config_id: 'config_7',
          outcome: 'passed',
          source_ids: ['source_1'],
          index_id: 'index_1',
          index_version_id: 'index_version_1',
          source_set_key: 'approved_faq',
          source_set_readiness_marker: 'ready',
          selected_chunk_count: 3,
          citation_count: 2,
          created_at: '2026-05-28T10:00:00Z',
          status: 'ready',
          problems: [],
          raw_query: 'must-not-map',
          chunks: [{ text: 'must-not-map' }],
        }],
        summary: {
          candidate_count: 1,
          ready: true,
          no_candidate_reason: null,
          required_action: null,
          problems: [],
        },
        no_candidate_reason: null,
        generated_at: '2026-05-28T10:01:00Z',
      },
    })

    await expect(releasesApi.getRetrievalEvidenceCandidates('tenant_1', 'agent_1')).resolves.toEqual({
      items: [{
        candidateId: 'candidate_1',
        releaseCandidateId: 'release_candidate_1',
        retrievalRunId: 'retrieval_run_1',
        stableReference: 'knowledge-retrieval-run:run_1',
        supportReconstructionReference: 'support-reconstruction:run_1',
        selectedConfigId: 'config_7',
        outcome: 'passed',
        sourceIds: ['source_1'],
        indexId: 'index_1',
        indexVersionId: 'index_version_1',
        sourceSetKey: 'approved_faq',
        sourceSetReadinessMarker: 'ready',
        selectedChunkCount: 3,
        citationCount: 2,
        createdAt: '2026-05-28T10:00:00Z',
        status: 'ready',
        problems: [],
      }],
      summary: {
        candidateCount: 1,
        ready: true,
        noCandidateReason: null,
        requiredAction: null,
        problems: [],
      },
      noCandidateReason: null,
      generatedAt: '2026-05-28T10:01:00Z',
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/portal/tenants/tenant_1/agents/agent_1/release-retrieval-evidence-candidates')
  })

  it('creates retrieval evidence candidates with backend-owned ids and idempotency key', async () => {
    postMock.mockResolvedValue({
      data: {
        items: [],
        summary: {
          candidate_count: 0,
          ready: false,
          no_candidate_reason: 'candidate_generation_failed',
          required_action: 'Retry after retrieval run is available.',
          problems: [],
        },
        no_candidate_reason: 'candidate_generation_failed',
        generated_at: null,
      },
    })

    await releasesApi.createRetrievalEvidenceCandidate('tenant_1', 'agent_1', {
      selectedConfigId: 'config_7',
      releaseCandidateId: 'release_candidate_1',
      idempotencyKey: 'release_retrieval_evidence_1',
    })

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/agents/agent_1/release-retrieval-evidence-candidates', {
      selected_config_id: 'config_7',
      release_candidate_id: 'release_candidate_1',
      idempotency_key: 'release_retrieval_evidence_1',
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
