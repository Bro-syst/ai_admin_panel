import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import type { ReleasesManager } from '@/modules/Releases/model/useReleasesManager'
import { ReleasesView } from '@/modules/Releases/ui/ReleasesView'

function renderView(manager: Partial<ReleasesManager> = {}) {
  const defaultManager = {
    tenantId: 'tenant_1',
    agentId: 'agent_1',
    agentDetail: { agentId: 'agent_1', tenantId: 'tenant_1', name: 'Sales agent', supportedMutationActions: ['releases.manage'] },
    readiness: {
      agentId: 'agent_1',
      readinessStatus: 'ready',
      releaseReady: true,
      gateMode: null,
      blockingItemCount: 0,
      items: [{ itemId: 'config', ownerArea: 'config', state: 'ready', blocking: true, detail: 'Config ready', requiredAction: null }],
      currentReleaseId: null,
      currentReleaseVersion: null,
      currentReleaseStatus: null,
      currentReleaseGateMode: null,
      currentReleaseManualOverride: null,
      activeReleasePresent: true,
      activeReleaseId: 'release_1',
      activeReleaseVersion: 3,
      activeReleaseStatus: 'published',
      activeReleaseGateMode: 'standard',
      activeReleaseManualOverride: null,
      latestReleaseId: 'release_1',
      latestReleaseVersion: 3,
      latestReleaseStatus: 'published',
      latestReleaseGateMode: 'standard',
      latestReleaseManualOverride: null,
      evaluationEvidenceOwnerMarker: 'backend',
      publishOwnerMarker: 'backend',
    },
    evidenceRequirements: {
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
      publishEvidenceRequirements: [{
        field: 'release_report_reference',
        required: true,
        labelKey: 'release.publish.release_report_reference.label',
        descriptionKey: 'release.publish.release_report_reference.description',
      }],
      runtimeProviderPreflight: {
        available: true,
        ready: true,
        requirements: [],
      },
      lastCheckedAt: '2026-05-25T00:00:00Z',
      ownerStage: 'stage24_release_workflow',
    },
    releases: [{ releaseId: 'release_1', releaseVersion: 3, status: 'published', gateMode: 'standard', active: true, selectedConfigVersion: 7, evidenceReference: 'evidence_1', manualOverrideUsed: false, createdAt: '2026-05-13T10:00:00Z' }],
    selectedRelease: {
      releaseId: 'release_1',
      tenantId: 'tenant_1',
      agentId: 'agent_1',
      releaseVersion: 3,
      status: 'published',
      gateMode: 'standard',
      active: true,
      createdAt: '2026-05-13T10:00:00Z',
      updatedAt: '2026-05-13T10:00:00Z',
      selectedConfigVersion: 7,
      evidenceReference: 'evidence_1',
      evidencePassed: true,
      manualOverride: { used: false, status: null, reasonCode: null, approvalActorId: null, correlationId: null, relatedMissingOrFailedItems: [], comment: null },
      readinessItems: [{ itemId: 'config', ownerArea: 'config', state: 'ready', blocking: true, detail: 'Config ready', requiredAction: null }],
      missingOrFailedItems: [],
    },
    draftForm: {
      selectedConfigId: 'config_7',
      releaseCandidateId: '',
      evidenceStableReference: 'evidence_1',
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
        stableReference: 'evidence_1',
        outcome: 'accepted',
      }],
      manualOverrideSelected: false,
      manualOverrideReasonCode: '',
      manualOverrideItemsText: '',
      manualOverrideComment: '',
    },
    publishForm: {
      supportReconstructionReference: 'support_1',
      usageChatId: '',
      usageConversationTurnId: '',
      usageModelRequestId: '',
      billingExportReference: '',
      releaseReportReference: 'report_1',
    },
    usageEvidenceCandidates: {
      items: [],
      summary: {
        candidateCount: 0,
        ready: false,
        noCandidateReason: 'no_successful_widget_conversation',
        message: 'Run a successful public-widget conversation first.',
      },
      noCandidateReason: 'no_successful_widget_conversation',
      generatedAt: '2026-05-27T10:00:00Z',
    },
    selectedUsageEvidenceCandidateId: '',
    selectedUsageEvidenceCandidate: null,
    mutationResult: null,
    canManageReleases: true,
    canCreateRelease: true,
    createDisabledReason: null,
    canPublishSelected: true,
    publishDisabledReason: null,
    explicitEvidenceComplete: true,
    manualOverrideComplete: false,
    draftProgress: {
      requiredTotal: 1,
      requiredComplete: 1,
      groundedTotal: 1,
      groundedReferencesFilled: 1,
      missingRequiredOutcomes: 0,
      missingGroundedReferences: 0,
      missingPassedChecks: 0,
    },
    isLoading: false,
    isLoadingUsageEvidenceCandidates: false,
    isMutating: false,
    errorMessage: null,
    usageEvidenceCandidatesError: null,
    formError: null,
    notice: null,
    loadReleases: vi.fn(),
    loadUsageEvidenceCandidates: vi.fn(),
    selectRelease: vi.fn(),
    setDraftForm: vi.fn(),
    setPublishForm: vi.fn(),
    setSelectedUsageEvidenceCandidateId: vi.fn(),
    applyEvidenceReferenceToGroundedCases: vi.fn(),
    applyUsageEvidenceCandidateToPublishForm: vi.fn(),
    fillDefaultSmokeOutcomes: vi.fn(),
    createRelease: vi.fn(),
    publishSelected: vi.fn(),
    rollbackSelected: vi.fn(),
    disableSelected: vi.fn(),
    ...manager,
  } as unknown as ReleasesManager

  render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/tenants/tenant_1/agents/agent_1/releases']} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <ReleasesView manager={defaultManager} />
      </MemoryRouter>
    </I18nProvider>,
  )

  return defaultManager
}

describe('ReleasesView', () => {
  beforeEach(() => {
    window.localStorage.setItem('ai_admin_panel:locale_v1', 'en')
  })

  it('renders readiness, release history and detail evidence without future links', () => {
    renderView()

    expect(screen.getByText('Releases')).toBeInTheDocument()
    expect(screen.getByText('Release readiness')).toBeInTheDocument()
    expect(screen.getByText('Release detail v3')).toBeInTheDocument()
    expect(screen.getByText('evidence_1')).toBeInTheDocument()
    expect(screen.getByLabelText('Manual override comment')).toBeInTheDocument()
    expect(screen.getByText('Release evidence requirements')).toBeInTheDocument()
    expect(screen.getByText('Product answer is grounded')).toBeInTheDocument()
    expect(screen.getByText('Publish evidence requirements')).toBeInTheDocument()
    expect(screen.getAllByText('Runtime provider is ready').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Backend release workflow').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Agent configuration: Ready - Active configuration is present and accepted').length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: /Conversations/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Usage/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Billing/i })).not.toBeInTheDocument()
  })

  it('localizes release backend markers and readiness evidence in Russian', () => {
    window.localStorage.setItem('ai_admin_panel:locale_v1', 'ru')

    renderView({
      readiness: {
        agentId: 'agent_1',
        readinessStatus: 'ready',
        releaseReady: true,
        gateMode: null,
        blockingItemCount: 0,
        items: [{ itemId: 'agent_config', ownerArea: 'agent_config', state: 'ready', blocking: true, detail: 'Active AgentConfig is present and accepted by the foundation policy.', requiredAction: null }],
        currentReleaseId: null,
        currentReleaseVersion: null,
        currentReleaseStatus: null,
        currentReleaseGateMode: null,
        currentReleaseManualOverride: null,
        activeReleasePresent: false,
        activeReleaseId: null,
        activeReleaseVersion: null,
        activeReleaseStatus: null,
        activeReleaseGateMode: 'stage24_release_validation',
        activeReleaseManualOverride: null,
        latestReleaseId: null,
        latestReleaseVersion: null,
        latestReleaseStatus: null,
        latestReleaseGateMode: 'standard',
        latestReleaseManualOverride: null,
        evaluationEvidenceOwnerMarker: 'backend',
        publishOwnerMarker: 'stage24_release_workflow',
      },
      selectedRelease: null,
      releases: [],
    })

    expect(screen.getAllByText('Релизы').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Backend-процесс релиза').length).toBeGreaterThan(0)
    expect(screen.getByText('Проверка релиза')).toBeInTheDocument()
    expect(screen.getByText('Стандартная проверка релиза')).toBeInTheDocument()
    expect(screen.getByText('Конфигурация агента: Готово - Активная конфигурация создана и принята')).toBeInTheDocument()
    expect(screen.queryByText('stage24_release_workflow')).not.toBeInTheDocument()
    expect(screen.queryByText('Active AgentConfig is present and accepted by the foundation policy.')).not.toBeInTheDocument()
  })

  it('lets operators edit optional manual override comment before draft creation', async () => {
    const setDraftForm = vi.fn()
    renderView({
      setDraftForm,
      draftForm: {
        selectedConfigId: 'config_7',
        releaseCandidateId: '',
        evidenceStableReference: 'evidence_1',
        evidenceChangeKind: 'retrieval_behavior_future',
        evidencePassed: true,
        smokeCases: [],
        manualOverrideSelected: true,
        manualOverrideReasonCode: 'release_evidence_operator_approved_override',
        manualOverrideItemsText: 'evaluation_evidence',
        manualOverrideComment: '',
      },
      manualOverrideComplete: true,
    })

    fireEvent.change(screen.getByPlaceholderText('Manual override comment'), { target: { value: 'Approved by launch owner.' } })

    expect(setDraftForm).toHaveBeenCalled()
  })

  it('confirms publish, rollback and disable with release context', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const manager = renderView()

    await user.click(screen.getByRole('button', { name: 'Publish' }))
    await user.click(screen.getByRole('button', { name: 'Rollback' }))
    await user.click(screen.getByRole('button', { name: 'Disable' }))

    expect(confirmSpy).toHaveBeenNthCalledWith(1, 'Publish release: v3, Published, Standard release check, Active=Yes')
    expect(confirmSpy).toHaveBeenNthCalledWith(2, 'Rollback release: v3, Published, Standard release check, Active=Yes')
    expect(confirmSpy).toHaveBeenNthCalledWith(3, 'Disable release: v3, Published, Standard release check, Active=Yes')
    expect(manager.publishSelected).toHaveBeenCalled()
    expect(manager.rollbackSelected).toHaveBeenCalled()
    expect(manager.disableSelected).toHaveBeenCalled()
    confirmSpy.mockRestore()
  })

  it('disables mutation controls when backend action refs do not allow release management', () => {
    renderView({ canManageReleases: false, canCreateRelease: false, canPublishSelected: false, createDisabledReason: 'This backend read model does not allow release changes for the current agent state.', releases: [] })

    expect(screen.getByRole('button', { name: 'Create release draft' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Create release draft' })).toHaveAttribute('title', 'Insufficient permissions to create a release.')
    expect(screen.getByLabelText('Selected config ID')).toHaveAttribute('title', 'Insufficient permissions to create a release.')
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Rollback' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Disable' })).toBeDisabled()
    expect(screen.getByText('Your role can inspect releases but cannot change them.')).toBeInTheDocument()
    expect(screen.getByText('Release checks passed. Contact a platform_admin to publish the release.')).toBeInTheDocument()
    expect(screen.getByText('No releases have been created yet.')).toBeInTheDocument()
  })

  it('shows runtime provider preflight blockers without secret inputs', () => {
    renderView({
      evidenceRequirements: {
        agentId: 'agent_1',
        templateId: 'sales_qualification_v1',
        releaseSetupReady: true,
        releaseSetupBlockingItems: [],
        evidenceRequired: true,
        evidenceStatus: 'missing_until_submitted',
        requiredChangeKind: 'retrieval_behavior_future',
        stableReferenceRule: 'knowledge_retrieval_run_required_for_grounded_cases',
        stableReferencePrefix: 'knowledge-retrieval-run:',
        requiredSmokeCases: [],
        manualOverride: {
          allowed: false,
          blockedReason: null,
          defaultReasonCode: null,
          relatedMissingOrFailedItemsDefault: [],
        },
        publishEvidenceRequirements: [],
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
        lastCheckedAt: '2026-05-25T00:00:00Z',
        ownerStage: 'stage24_release_workflow',
      },
    })

    expect(screen.getByText('Platform runtime is not ready')).toBeInTheDocument()
    expect(screen.getByText('openai')).toBeInTheDocument()
    expect(screen.getByText('openai-primary')).toBeInTheDocument()
    expect(screen.getByText('Missing credential')).toBeInTheDocument()
    expect(screen.getByText('System credential openai-primary is not configured. Contact a platform admin or run runtime credential bootstrap.')).toBeInTheDocument()
    expect(screen.getAllByText('Successful runtime smoke is not possible yet: the model cannot answer and usage evidence will not be created.').length).toBeGreaterThan(0)
    expect(screen.queryByLabelText(/api key/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/secret/i)).not.toBeInTheDocument()
  })

  it('disables publish when runtime preflight is missing or required publish evidence is empty', () => {
    renderView({
      canPublishSelected: false,
      publishDisabledReason: 'Runtime provider preflight was not provided by backend. Runtime readiness cannot be confirmed.',
      evidenceRequirements: {
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
          defaultReasonCode: null,
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
      },
    })

    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
    expect(screen.getAllByText('Runtime provider preflight was not provided by backend. Runtime readiness cannot be confirmed.').length).toBeGreaterThan(1)
  })

  it('shows usage id hints in the publish form', () => {
    renderView()

    expect(screen.getAllByText('Filled only from successful runtime usage. Do not enter arbitrary strings.')).toHaveLength(3)
  })

  it('renders backend usage evidence candidates and applies the selected candidate for publish', async () => {
    const user = userEvent.setup()
    const setSelectedUsageEvidenceCandidateId = vi.fn()
    const applyUsageEvidenceCandidateToPublishForm = vi.fn()

    renderView({
      usageEvidenceCandidates: {
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
          displayLabel: 'Public widget smoke 2026-05-27',
          prompt: 'must-not-leak',
          transcript: 'must-not-leak',
        }, {
          chatId: 'chat_2',
          conversationTurnId: 'turn_2',
          modelRequestId: 'model_request_2',
          createdAt: '2026-05-27T10:05:00Z',
          turnStatus: 'response_rendered',
          modelRequestState: 'completed',
          usageRecorded: true,
          agentId: 'agent_1',
          agentConfigId: 'config_1',
          widgetKey: 'sales-widget',
          channel: 'public_widget',
          displayLabel: 'Public widget smoke 2026-05-27 second',
        }],
        summary: {
          candidateCount: 2,
          ready: true,
          noCandidateReason: null,
          message: 'Candidate is ready.',
        },
        noCandidateReason: null,
        generatedAt: '2026-05-27T10:01:00Z',
      },
      selectedUsageEvidenceCandidateId: 'turn_1',
      selectedUsageEvidenceCandidate: {
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
        displayLabel: 'Public widget smoke 2026-05-27',
      },
      setSelectedUsageEvidenceCandidateId,
      applyUsageEvidenceCandidateToPublishForm,
    } as Partial<ReleasesManager>)

    expect(screen.getByText('Runtime usage evidence')).toBeInTheDocument()
    expect(screen.getByText('Public widget smoke 2026-05-27')).toBeInTheDocument()
    expect(screen.getByText('Chat ID: chat_1')).toBeInTheDocument()
    expect(screen.getByText('Conversation turn ID: turn_1')).toBeInTheDocument()
    expect(screen.getByText('Model request ID: model_request_1')).toBeInTheDocument()
    expect(screen.getAllByText('Response rendered').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0)
    expect(screen.queryByText('must-not-leak')).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /Public widget smoke 2026-05-27 second/i }))
    await user.click(screen.getByRole('button', { name: 'Use for publish' }))

    expect(setSelectedUsageEvidenceCandidateId).toHaveBeenCalledWith('turn_2')
    expect(applyUsageEvidenceCandidateToPublishForm).toHaveBeenCalled()
  })

  it('shows backend no-candidate reasons without inventing usage ids', () => {
    renderView({
      usageEvidenceCandidates: {
        items: [],
        summary: {
          candidateCount: 0,
          ready: false,
          noCandidateReason: 'candidate_source_unavailable',
          message: 'Usage source unavailable.',
        },
        noCandidateReason: 'candidate_source_unavailable',
        generatedAt: '2026-05-27T10:02:00Z',
      },
      publishForm: {
        supportReconstructionReference: 'support_1',
        usageChatId: '',
        usageConversationTurnId: '',
        usageModelRequestId: '',
        billingExportReference: '',
        releaseReportReference: 'report_1',
      },
    })

    expect(screen.getByText('Backend could not safely inspect conversation, model-request or usage read models. Retry after backend recovery.')).toBeInTheDocument()
    expect(screen.getByLabelText('Usage chat ID')).toHaveValue('')
    expect(screen.getByLabelText('Usage conversation turn ID')).toHaveValue('')
    expect(screen.getByLabelText('Usage model request ID')).toHaveValue('')
  })

  it('shows runtime preflight safe evidence when candidates are blocked by runtime provider setup', () => {
    renderView({
      evidenceRequirements: {
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
          defaultReasonCode: null,
          relatedMissingOrFailedItemsDefault: [],
        },
        publishEvidenceRequirements: [],
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
        lastCheckedAt: null,
        ownerStage: 'stage24_release_workflow',
      },
      usageEvidenceCandidates: {
        items: [],
        summary: {
          candidateCount: 0,
          ready: false,
          noCandidateReason: 'runtime_provider_not_ready',
          message: 'Runtime provider is not ready.',
        },
        noCandidateReason: 'runtime_provider_not_ready',
        generatedAt: '2026-05-27T10:02:00Z',
      },
      canPublishSelected: false,
      publishDisabledReason: 'Successful runtime smoke is not possible yet: the model cannot answer and usage evidence will not be created.',
    })

    expect(screen.getAllByText('Configure the platform runtime credential before runtime smoke can produce usage evidence.').length).toBeGreaterThan(0)
    expect(screen.getAllByText('openai').length).toBeGreaterThan(0)
    expect(screen.getAllByText('openai-primary').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Missing credential').length).toBeGreaterThan(0)
    expect(screen.queryByLabelText(/secret/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
  })

  it('shows unknown no-candidate reason as a safe diagnostic enum', () => {
    renderView({
      usageEvidenceCandidates: {
        items: [],
        summary: {
          candidateCount: 0,
          ready: false,
          noCandidateReason: 'future_backend_reason',
          message: 'Future reason.',
        },
        noCandidateReason: 'future_backend_reason',
        generatedAt: null,
      },
    })

    expect(screen.getByText('Backend returned no eligible usage candidates. Retry after checking runtime evidence state.')).toBeInTheDocument()
    expect(screen.getByText('Backend reason: future_backend_reason')).toBeInTheDocument()
  })
})
