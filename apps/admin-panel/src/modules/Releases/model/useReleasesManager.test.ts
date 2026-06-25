import { describe, expect, it } from 'vitest'
import { applyPublishEvidenceBundle, buildReleaseDraftInput, deriveReleasesCanManage, hasCompleteExplicitEvidence, requiresManagedRetrievalEvidence, selectPublishEvidenceBundleId, selectRetrievalEvidenceCandidateId } from '@/modules/Releases/model/useReleasesManager'
import type { ReleaseEvidenceRequirements } from '@/modules/Releases/api/releasesApi'

const requirements: ReleaseEvidenceRequirements = {
  agentId: 'agent_1',
  templateId: 'sales_qualification_v1',
  releaseSetupReady: true,
  releaseSetupBlockingItems: [],
  evidenceRequired: true,
  evidenceStatus: 'missing_until_submitted',
  requiredChangeKind: 'retrieval_behavior_future',
  stableReferenceRule: 'knowledge_retrieval_run_required_for_grounded_cases',
  stableReferencePrefix: 'knowledge-retrieval-run:',
  requiredSmokeCases: [{
    caseId: 'sales_support.product_grounded',
    required: true,
    groundedReferenceRequired: true,
    stableReferenceMustMatchReleaseReference: true,
    labelKey: 'release.evidence.sales_support.product_grounded.label',
    descriptionKey: 'release.evidence.sales_support.product_grounded.description',
  }],
  manualOverride: {
    allowed: true,
    blockedReason: null,
    defaultReasonCode: 'release_evidence_operator_approved_override',
    relatedMissingOrFailedItemsDefault: ['evaluation_evidence'],
  },
  publishEvidenceRequirements: [],
  publishEvidenceDefaults: {
    supportReconstructionReference: null,
    usageChatId: null,
    usageConversationTurnId: null,
    usageModelRequestId: null,
    billingExportReference: null,
    releaseReportReference: null,
  },
  runtimeProviderPreflight: {
    available: true,
    ready: true,
    requirements: [],
  },
  lastCheckedAt: '2026-05-25T00:00:00Z',
  ownerStage: 'stage24_release_workflow',
}

describe('deriveReleasesCanManage', () => {
  it('allows release mutations only when role and backend action refs both allow them', () => {
    expect(deriveReleasesCanManage(['releases.manage'], true)).toBe(true)
    expect(deriveReleasesCanManage(['agent_releases.manage'], true)).toBe(true)
    expect(deriveReleasesCanManage(['sites_widgets.manage'], true)).toBe(false)
    expect(deriveReleasesCanManage(['releases.manage'], false)).toBe(false)
  })

  it('keeps optional manual override comment in the create draft payload', () => {
    expect(
      buildReleaseDraftInput({
        selectedConfigId: 'config_7',
        releaseCandidateId: '',
        evidenceStableReference: '',
        evidenceChangeKind: 'retrieval_behavior_future',
        evidencePassed: true,
        smokeCases: [],
        manualOverrideSelected: true,
        manualOverrideReasonCode: 'business_approved',
        manualOverrideItemsText: 'knowledge\npolicy',
        manualOverrideComment: 'Approved for limited rollout.',
      }, requirements),
    ).toMatchObject({
      selectedConfigId: 'config_7',
      manualOverride: {
        reasonCode: 'business_approved',
        relatedMissingOrFailedItems: ['knowledge', 'policy'],
        comment: 'Approved for limited rollout.',
      },
    })
  })

  it('uses backend-provided change kind and sends all complete smoke cases', () => {
    const form = {
      selectedConfigId: 'config_7',
      releaseCandidateId: '',
      evidenceStableReference: 'knowledge-retrieval-run:run_1',
      evidenceChangeKind: 'retrieval_behavior_future',
      evidencePassed: true,
      smokeCases: [{
        caseId: 'sales_support.product_grounded',
        required: true,
        groundedReferenceRequired: true,
        stableReferenceMustMatchReleaseReference: true,
        labelKey: 'release.evidence.sales_support.product_grounded.label',
        descriptionKey: 'release.evidence.sales_support.product_grounded.description',
        passed: true,
        stableReference: 'knowledge-retrieval-run:run_1',
        outcome: 'accepted',
      }],
      manualOverrideSelected: false,
      manualOverrideReasonCode: '',
      manualOverrideItemsText: '',
      manualOverrideComment: '',
    }

    expect(hasCompleteExplicitEvidence(form, requirements)).toBe(true)
    expect(buildReleaseDraftInput(form, requirements)).toMatchObject({
      evidence: {
        changeKind: 'retrieval_behavior_future',
        stableReference: 'knowledge-retrieval-run:run_1',
        smokeCases: [{ caseId: 'sales_support.product_grounded', stableReference: 'knowledge-retrieval-run:run_1' }],
      },
    })
  })

  it('detects managed retrieval evidence requirements from backend rules', () => {
    expect(requiresManagedRetrievalEvidence(requirements)).toBe(true)
    expect(requiresManagedRetrievalEvidence({
      ...requirements,
      stableReferenceRule: 'stage18_agent_config_release_evidence_required',
      stableReferencePrefix: null,
      requiredSmokeCases: [],
    })).toBe(false)
  })

  it('selects the newest compatible retrieval evidence candidate by default', () => {
    expect(selectRetrievalEvidenceCandidateId('', {
      items: [{
        candidateId: 'old',
        releaseCandidateId: 'release_candidate_old',
        retrievalRunId: 'run_old',
        stableReference: 'knowledge-retrieval-run:old',
        supportReconstructionReference: 'support_old',
        selectedConfigId: 'config_1',
        outcome: 'passed',
        sourceIds: [],
        indexId: null,
        indexVersionId: null,
        sourceSetKey: null,
        sourceSetReadinessMarker: null,
        selectedChunkCount: 0,
        citationCount: 0,
        createdAt: '2026-05-27T10:00:00Z',
        status: 'ready',
        problems: [],
      }, {
        candidateId: 'new',
        releaseCandidateId: 'release_candidate_new',
        retrievalRunId: 'run_new',
        stableReference: 'knowledge-retrieval-run:new',
        supportReconstructionReference: 'support_new',
        selectedConfigId: 'config_1',
        outcome: 'passed',
        sourceIds: [],
        indexId: null,
        indexVersionId: null,
        sourceSetKey: null,
        sourceSetReadinessMarker: null,
        selectedChunkCount: 0,
        citationCount: 0,
        createdAt: '2026-05-28T10:00:00Z',
        status: 'ready',
        problems: [],
      }],
      summary: {
        candidateCount: 2,
        ready: true,
        noCandidateReason: null,
        requiredAction: null,
        problems: [],
      },
      noCandidateReason: null,
      generatedAt: '2026-05-28T10:01:00Z',
    })).toBe('new')
  })

  it('selects the backend recommended publish evidence bundle by default', () => {
    expect(selectPublishEvidenceBundleId('', {
      agentId: 'agent_1',
      templateId: 'sales_qualification_v1',
      items: [{
        bundleId: 'blocked',
        displayLabel: 'Release v1 publish evidence',
        readinessStatus: 'blocked',
        recommended: false,
        releaseId: 'release_1',
        releaseVersion: 1,
        releaseStatus: 'validated',
        releaseActive: false,
        selectedConfigId: 'config_1',
        supportReconstructionReference: null,
        usageChatId: null,
        usageConversationTurnId: null,
        usageModelRequestId: null,
        billingExportReference: null,
        releaseReportReference: null,
        retrievalCandidateId: null,
        usageCandidateId: null,
        blockingReasons: ['missing_usage_evidence_candidate'],
        technicalDetails: {},
      }, {
        bundleId: 'ready',
        displayLabel: 'Release v2 publish evidence',
        readinessStatus: 'ready',
        recommended: true,
        releaseId: 'release_2',
        releaseVersion: 2,
        releaseStatus: 'validated',
        releaseActive: false,
        selectedConfigId: 'config_2',
        supportReconstructionReference: 'support-reconstruction:knowledge-retrieval-run:run_1',
        usageChatId: 'chat_1',
        usageConversationTurnId: 'turn_1',
        usageModelRequestId: 'model_request_1',
        billingExportReference: 'billing-export:billing-chain-1',
        releaseReportReference: 'docs:TZ-SVC-4.3:RELEASE_METERING_USAGE_REPORT',
        retrievalCandidateId: 'retrieval_1',
        usageCandidateId: 'turn_1',
        blockingReasons: [],
        technicalDetails: {},
      }],
      summary: {
        candidateCount: 2,
        ready: true,
        recommendedBundleId: 'ready',
        noCandidateReason: null,
        message: 'Ready.',
      },
      noCandidateReason: null,
      generatedAt: '2026-06-23T10:00:00Z',
    })).toBe('ready')
  })

  it('applies a publish evidence bundle to all publish evidence fields', () => {
    expect(applyPublishEvidenceBundle({
      supportReconstructionReference: '',
      usageChatId: '',
      usageConversationTurnId: '',
      usageModelRequestId: '',
      billingExportReference: '',
      releaseReportReference: '',
    }, {
      bundleId: 'ready',
      displayLabel: 'Release v1 publish evidence',
      readinessStatus: 'ready',
      recommended: true,
      releaseId: 'release_1',
      releaseVersion: 1,
      releaseStatus: 'validated',
      releaseActive: false,
      selectedConfigId: 'config_1',
      supportReconstructionReference: 'support-reconstruction:knowledge-retrieval-run:run_1',
      usageChatId: 'chat_1',
      usageConversationTurnId: 'turn_1',
      usageModelRequestId: 'model_request_1',
      billingExportReference: 'billing-export:billing-chain-1',
      releaseReportReference: 'docs:TZ-SVC-4.3:RELEASE_METERING_USAGE_REPORT',
      retrievalCandidateId: 'retrieval_1',
      usageCandidateId: 'turn_1',
      blockingReasons: [],
      technicalDetails: {},
    })).toEqual({
      supportReconstructionReference: 'support-reconstruction:knowledge-retrieval-run:run_1',
      usageChatId: 'chat_1',
      usageConversationTurnId: 'turn_1',
      usageModelRequestId: 'model_request_1',
      billingExportReference: 'billing-export:billing-chain-1',
      releaseReportReference: 'docs:TZ-SVC-4.3:RELEASE_METERING_USAGE_REPORT',
    })
  })
})
