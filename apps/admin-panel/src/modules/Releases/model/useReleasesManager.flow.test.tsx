import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { agentsApi } from '@/modules/Agents'
import { releasesApi } from '@/modules/Releases/api/releasesApi'
import { useReleasesManager } from '@/modules/Releases/model/useReleasesManager'

vi.mock('@/core/auth/useAuth', () => ({
  useAuth: () => ({
    adminUser: {
      role: 'platform_admin',
      permissions: [],
    },
  }),
}))

vi.mock('@/modules/Agents', () => ({
  agentsApi: {
    getPortalAgentDetail: vi.fn(),
  },
}))

vi.mock('@/modules/Releases/api/releasesApi', () => ({
  releasesApi: {
    getReadiness: vi.fn(),
    getEvidenceRequirements: vi.fn(),
    getUsageEvidenceCandidates: vi.fn(),
    getRetrievalEvidenceCandidates: vi.fn(),
    createRetrievalEvidenceCandidate: vi.fn(),
    listReleases: vi.fn(),
    getRelease: vi.fn(),
  },
}))

const getPortalAgentDetailMock = agentsApi.getPortalAgentDetail as unknown as ReturnType<typeof vi.fn>
const getReadinessMock = releasesApi.getReadiness as unknown as ReturnType<typeof vi.fn>
const getEvidenceRequirementsMock = releasesApi.getEvidenceRequirements as unknown as ReturnType<typeof vi.fn>
const getUsageEvidenceCandidatesMock = releasesApi.getUsageEvidenceCandidates as unknown as ReturnType<typeof vi.fn>
const getRetrievalEvidenceCandidatesMock = releasesApi.getRetrievalEvidenceCandidates as unknown as ReturnType<typeof vi.fn>
const listReleasesMock = releasesApi.listReleases as unknown as ReturnType<typeof vi.fn>
const getReleaseMock = releasesApi.getRelease as unknown as ReturnType<typeof vi.fn>

function TestReleasesManager() {
  const manager = useReleasesManager('tenant_1', 'agent_1')

  return (
    <div>
      <span data-testid="loading">{String(manager.isLoading)}</span>
      <span data-testid="release-count">{String(manager.releases.length)}</span>
      <span data-testid="selected-release">{manager.selectedRelease?.releaseId ?? 'none'}</span>
      <span data-testid="can-publish">{String(manager.canPublishSelected)}</span>
      <span data-testid="publish-disabled-reason">{manager.publishDisabledReason ?? 'none'}</span>
      <span data-testid="usage-candidate-count">{String(manager.usageEvidenceCandidates?.items.length ?? 0)}</span>
      <span data-testid="selected-usage-candidate">{manager.selectedUsageEvidenceCandidateId || 'none'}</span>
      <span data-testid="retrieval-candidate-count">{String(manager.retrievalEvidenceCandidates?.items.length ?? 0)}</span>
      <span data-testid="selected-retrieval-candidate">{manager.selectedRetrievalEvidenceCandidateId || 'none'}</span>
      <span data-testid="publish-usage-chat-id">{manager.publishForm.usageChatId || 'none'}</span>
      <span data-testid="publish-support-reference">{manager.publishForm.supportReconstructionReference || 'none'}</span>
      <span data-testid="publish-usage-turn-id">{manager.publishForm.usageConversationTurnId || 'none'}</span>
      <span data-testid="publish-usage-model-request-id">{manager.publishForm.usageModelRequestId || 'none'}</span>
      <span data-testid="publish-billing-export-reference">{manager.publishForm.billingExportReference || 'none'}</span>
      <span data-testid="publish-release-report-reference">{manager.publishForm.releaseReportReference || 'none'}</span>
      <button type="button" onClick={manager.applyUsageEvidenceCandidateToPublishForm}>apply usage candidate</button>
      <button type="button" onClick={manager.applyPublishEvidenceDefaultsToPublishForm}>apply publish evidence</button>
    </div>
  )
}

function renderManager() {
  render(
    <I18nProvider>
      <TestReleasesManager />
    </I18nProvider>,
  )
}

describe('useReleasesManager flow', () => {
  beforeEach(() => {
    getPortalAgentDetailMock.mockReset()
    getReadinessMock.mockReset()
    getEvidenceRequirementsMock.mockReset()
    getUsageEvidenceCandidatesMock.mockReset()
    getRetrievalEvidenceCandidatesMock.mockReset()
    listReleasesMock.mockReset()
    getReleaseMock.mockReset()
    getUsageEvidenceCandidatesMock.mockResolvedValue({
      items: [],
      summary: {
        candidateCount: 0,
        ready: false,
        noCandidateReason: 'no_successful_widget_conversation',
        message: 'Run a successful public-widget conversation first.',
      },
      noCandidateReason: 'no_successful_widget_conversation',
      generatedAt: '2026-05-27T10:00:00Z',
    })
    getRetrievalEvidenceCandidatesMock.mockResolvedValue({
      items: [{
        candidateId: 'candidate_1',
        releaseCandidateId: 'release_candidate_1',
        retrievalRunId: 'retrieval_run_1',
        stableReference: 'knowledge-retrieval-run:run_1',
        supportReconstructionReference: 'support_reconstruction_1',
        selectedConfigId: 'config_1',
        outcome: 'passed',
        sourceIds: ['source_1'],
        indexId: 'index_1',
        indexVersionId: 'index_version_1',
        sourceSetKey: 'source_set_1',
        sourceSetReadinessMarker: 'ready',
        selectedChunkCount: 2,
        citationCount: 1,
        createdAt: '2026-05-27T09:00:00Z',
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
      generatedAt: '2026-05-27T09:01:00Z',
    })
  })

  it('populates release history and selected release on initial load', async () => {
    getPortalAgentDetailMock.mockResolvedValue({
      agentId: 'agent_1',
      tenantId: 'tenant_1',
      name: 'Sales agent',
      description: null,
      purpose: null,
      status: 'active',
      lifecycleStatus: 'enabled',
      readinessStatus: 'ready',
      templateId: 'sales_qualification_v1',
      activeConfigId: 'config_1',
      releaseReady: true,
      blockers: [],
      publicChannelEnabled: true,
      releaseHandoffTarget: null,
      supportedMutationActions: ['releases.manage'],
    })
    getReadinessMock.mockResolvedValue({
      agentId: 'agent_1',
      readinessStatus: 'ready',
      releaseReady: true,
      gateMode: null,
      blockingItemCount: 0,
      items: [],
      currentReleaseId: null,
      currentReleaseVersion: null,
      currentReleaseStatus: null,
      currentReleaseGateMode: null,
      currentReleaseManualOverride: null,
      activeReleasePresent: true,
      activeReleaseId: 'release_1',
      activeReleaseVersion: 1,
      activeReleaseStatus: 'published',
      activeReleaseGateMode: 'standard',
      activeReleaseManualOverride: null,
      latestReleaseId: 'release_1',
      latestReleaseVersion: 1,
      latestReleaseStatus: 'published',
      latestReleaseGateMode: 'standard',
      latestReleaseManualOverride: null,
      evaluationEvidenceOwnerMarker: 'backend',
      publishOwnerMarker: 'backend',
    })
    getEvidenceRequirementsMock.mockResolvedValue({
      agentId: 'agent_1',
      templateId: 'sales_qualification_v1',
      releaseSetupReady: true,
      releaseSetupBlockingItems: [],
      evidenceRequired: true,
      evidenceStatus: 'submitted',
      requiredChangeKind: 'retrieval_behavior_future',
      stableReferenceRule: 'knowledge_retrieval_run_required_for_grounded_cases',
      stableReferencePrefix: 'knowledge-retrieval-run:',
      requiredSmokeCases: [],
      manualOverride: {
        allowed: false,
        blockedReason: null,
        defaultReasonCode: '',
        relatedMissingOrFailedItemsDefault: [],
      },
      publishEvidenceRequirements: [],
      runtimeProviderPreflight: {
        available: true,
        ready: true,
        requirements: [],
      },
      lastCheckedAt: null,
      ownerStage: 'stage24_release_workflow',
    })
    listReleasesMock.mockResolvedValue([
      {
        releaseId: 'release_1',
        releaseVersion: 1,
        status: 'published',
        gateMode: 'standard',
        active: true,
        selectedConfigVersion: 1,
        evidenceReference: 'knowledge-retrieval-run:run_1',
        manualOverrideUsed: false,
        createdAt: '2026-05-26T00:00:00Z',
      },
    ])
    getReleaseMock.mockResolvedValue({
      releaseId: 'release_1',
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      releaseVersion: 1,
      status: 'published',
      gateMode: 'standard',
      active: true,
      createdAt: '2026-05-26T00:00:00Z',
      updatedAt: '2026-05-26T00:00:00Z',
      selectedConfigVersion: 1,
      releaseCandidateId: 'release_candidate_1',
      evidenceReference: 'knowledge-retrieval-run:run_1',
      supportReconstructionReference: 'support_reconstruction_1',
      evidencePassed: true,
      manualOverride: null,
      readinessItems: [],
      missingOrFailedItems: [],
    })

    renderManager()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))

    expect(screen.getByTestId('release-count')).toHaveTextContent('1')
    expect(screen.getByTestId('selected-release')).toHaveTextContent('release_1')
    expect(screen.getByTestId('can-publish')).toHaveTextContent('true')
    expect(getReleaseMock).toHaveBeenCalledWith('tenant_1', 'agent_1', 'release_1')
    expect(getUsageEvidenceCandidatesMock).toHaveBeenCalledWith('tenant_1', 'agent_1')
    expect(getRetrievalEvidenceCandidatesMock).toHaveBeenCalledWith('tenant_1', 'agent_1')
  })

  it('loads backend usage evidence candidates and copies selected ids into publish form', async () => {
    getPortalAgentDetailMock.mockResolvedValue({
      agentId: 'agent_1',
      tenantId: 'tenant_1',
      name: 'Sales agent',
      description: null,
      purpose: null,
      status: 'active',
      lifecycleStatus: 'enabled',
      readinessStatus: 'ready',
      templateId: 'sales_qualification_v1',
      activeConfigId: 'config_1',
      releaseReady: true,
      blockers: [],
      publicChannelEnabled: true,
      releaseHandoffTarget: null,
      supportedMutationActions: ['releases.manage'],
    })
    getReadinessMock.mockResolvedValue({
      agentId: 'agent_1',
      readinessStatus: 'ready',
      releaseReady: true,
      gateMode: null,
      blockingItemCount: 0,
      items: [],
      currentReleaseId: null,
      currentReleaseVersion: null,
      currentReleaseStatus: null,
      currentReleaseGateMode: null,
      currentReleaseManualOverride: null,
      activeReleasePresent: true,
      activeReleaseId: 'release_1',
      activeReleaseVersion: 1,
      activeReleaseStatus: 'published',
      activeReleaseGateMode: 'standard',
      activeReleaseManualOverride: null,
      latestReleaseId: 'release_1',
      latestReleaseVersion: 1,
      latestReleaseStatus: 'published',
      latestReleaseGateMode: 'standard',
      latestReleaseManualOverride: null,
      evaluationEvidenceOwnerMarker: 'backend',
      publishOwnerMarker: 'backend',
    })
    getEvidenceRequirementsMock.mockResolvedValue({
      agentId: 'agent_1',
      templateId: 'sales_qualification_v1',
      releaseSetupReady: true,
      releaseSetupBlockingItems: [],
      evidenceRequired: true,
      evidenceStatus: 'submitted',
      requiredChangeKind: 'retrieval_behavior_future',
      stableReferenceRule: 'knowledge_retrieval_run_required_for_grounded_cases',
      stableReferencePrefix: 'knowledge-retrieval-run:',
      requiredSmokeCases: [],
      manualOverride: {
        allowed: false,
        blockedReason: null,
        defaultReasonCode: '',
        relatedMissingOrFailedItemsDefault: [],
      },
      publishEvidenceRequirements: [{
        field: 'usage_chat_id',
        required: true,
        labelKey: 'release.publish.usage_chat_id.label',
        descriptionKey: 'release.publish.usage_chat_id.description',
      }],
      publishEvidenceDefaults: {
        supportReconstructionReference: null,
        usageChatId: null,
        usageConversationTurnId: null,
        usageModelRequestId: null,
        billingExportReference: 'billing-export:billing-chain-1',
        releaseReportReference: 'docs:TZ-SVC-4.3:RELEASE_METERING_USAGE_REPORT',
      },
      runtimeProviderPreflight: {
        available: true,
        ready: true,
        requirements: [],
      },
      lastCheckedAt: null,
      ownerStage: 'stage24_release_workflow',
    })
    listReleasesMock.mockResolvedValue([
      {
        releaseId: 'release_1',
        releaseVersion: 1,
        status: 'published',
        gateMode: 'standard',
        active: true,
        selectedConfigVersion: 1,
        evidenceReference: 'knowledge-retrieval-run:run_1',
        manualOverrideUsed: false,
        createdAt: '2026-05-26T00:00:00Z',
      },
    ])
    getReleaseMock.mockResolvedValue({
      releaseId: 'release_1',
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      releaseVersion: 1,
      status: 'published',
      gateMode: 'standard',
      active: true,
      createdAt: '2026-05-26T00:00:00Z',
      updatedAt: '2026-05-26T00:00:00Z',
      selectedConfigVersion: 1,
      releaseCandidateId: 'release_candidate_1',
      evidenceReference: 'knowledge-retrieval-run:run_1',
      supportReconstructionReference: 'support_reconstruction_1',
      evidencePassed: true,
      manualOverride: null,
      readinessItems: [],
      missingOrFailedItems: [],
    })
    getUsageEvidenceCandidatesMock.mockResolvedValue({
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
        displayLabel: 'Widget smoke',
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

    renderManager()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))
    await waitFor(() => expect(screen.getByTestId('usage-candidate-count')).toHaveTextContent('1'))

    expect(screen.getByTestId('selected-usage-candidate')).toHaveTextContent('turn_1')
    expect(screen.getByTestId('selected-retrieval-candidate')).toHaveTextContent('candidate_1')
    expect(screen.getByTestId('publish-support-reference')).toHaveTextContent('support_reconstruction_1')

    fireEvent.click(screen.getByRole('button', { name: 'apply publish evidence' }))

    expect(screen.getByTestId('publish-usage-chat-id')).toHaveTextContent('chat_1')
    expect(screen.getByTestId('publish-usage-turn-id')).toHaveTextContent('turn_1')
    expect(screen.getByTestId('publish-usage-model-request-id')).toHaveTextContent('model_request_1')
    expect(screen.getByTestId('publish-billing-export-reference')).toHaveTextContent('billing-export:billing-chain-1')
    expect(screen.getByTestId('publish-release-report-reference')).toHaveTextContent('docs:TZ-SVC-4.3:RELEASE_METERING_USAGE_REPORT')
    expect(screen.getByTestId('can-publish')).toHaveTextContent('true')
  })

  it('blocks publish when runtime preflight is missing and required publish evidence is incomplete', async () => {
    getPortalAgentDetailMock.mockResolvedValue({
      agentId: 'agent_1',
      tenantId: 'tenant_1',
      name: 'Sales agent',
      description: null,
      purpose: null,
      status: 'active',
      lifecycleStatus: 'enabled',
      readinessStatus: 'ready',
      templateId: 'sales_qualification_v1',
      activeConfigId: 'config_1',
      releaseReady: true,
      blockers: [],
      publicChannelEnabled: true,
      releaseHandoffTarget: null,
      supportedMutationActions: ['releases.manage'],
    })
    getReadinessMock.mockResolvedValue({
      agentId: 'agent_1',
      readinessStatus: 'ready',
      releaseReady: true,
      gateMode: null,
      blockingItemCount: 0,
      items: [],
      currentReleaseId: null,
      currentReleaseVersion: null,
      currentReleaseStatus: null,
      currentReleaseGateMode: null,
      currentReleaseManualOverride: null,
      activeReleasePresent: true,
      activeReleaseId: 'release_1',
      activeReleaseVersion: 1,
      activeReleaseStatus: 'published',
      activeReleaseGateMode: 'standard',
      activeReleaseManualOverride: null,
      latestReleaseId: 'release_1',
      latestReleaseVersion: 1,
      latestReleaseStatus: 'published',
      latestReleaseGateMode: 'standard',
      latestReleaseManualOverride: null,
      evaluationEvidenceOwnerMarker: 'backend',
      publishOwnerMarker: 'backend',
    })
    getEvidenceRequirementsMock.mockResolvedValue({
      agentId: 'agent_1',
      templateId: 'sales_qualification_v1',
      releaseSetupReady: true,
      releaseSetupBlockingItems: [],
      evidenceRequired: true,
      evidenceStatus: 'submitted',
      requiredChangeKind: 'retrieval_behavior_future',
      stableReferenceRule: 'knowledge_retrieval_run_required_for_grounded_cases',
      stableReferencePrefix: 'knowledge-retrieval-run:',
      requiredSmokeCases: [],
      manualOverride: {
        allowed: false,
        blockedReason: null,
        defaultReasonCode: '',
        relatedMissingOrFailedItemsDefault: [],
      },
      publishEvidenceRequirements: [{
        field: 'usage_chat_id',
        required: true,
        labelKey: 'release.publish.usage_chat_id.label',
        descriptionKey: 'release.publish.usage_chat_id.description',
      }],
      runtimeProviderPreflight: {
        available: false,
        ready: false,
        requirements: [],
      },
      lastCheckedAt: null,
      ownerStage: 'stage24_release_workflow',
    })
    listReleasesMock.mockResolvedValue([
      {
        releaseId: 'release_1',
        releaseVersion: 1,
        status: 'published',
        gateMode: 'standard',
        active: true,
        selectedConfigVersion: 1,
        evidenceReference: 'knowledge-retrieval-run:run_1',
        manualOverrideUsed: false,
        createdAt: '2026-05-26T00:00:00Z',
      },
    ])
    getReleaseMock.mockResolvedValue({
      releaseId: 'release_1',
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      releaseVersion: 1,
      status: 'published',
      gateMode: 'standard',
      active: true,
      createdAt: '2026-05-26T00:00:00Z',
      updatedAt: '2026-05-26T00:00:00Z',
      selectedConfigVersion: 1,
      releaseCandidateId: 'release_candidate_1',
      evidenceReference: 'knowledge-retrieval-run:run_1',
      supportReconstructionReference: 'support_reconstruction_1',
      evidencePassed: true,
      manualOverride: null,
      readinessItems: [],
      missingOrFailedItems: [],
    })

    renderManager()

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'))

    expect(screen.getByTestId('can-publish')).toHaveTextContent('false')
    expect(screen.getByTestId('publish-disabled-reason')).toHaveTextContent('Runtime provider preflight was not provided by backend. Runtime readiness cannot be confirmed.')
  })
})
