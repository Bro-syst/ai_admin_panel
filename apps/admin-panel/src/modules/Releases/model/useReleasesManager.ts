import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import { agentsApi, type PortalAgentDetail } from '@/modules/Agents'
import {
  releasesApi,
  type MutationResult,
  type PublishEvidenceInput,
  type ReleaseCreateInput,
  type ReleaseDetail,
  type ReleaseEvidenceRequirements,
  type ReleaseListItem,
  type ReleasePublishEvidenceBundle,
  type ReleasePublishEvidenceCandidates,
  type ReleasePublishEvidenceDefaults,
  type ReleaseReadiness,
  type ReleaseRetrievalEvidenceCandidate,
  type ReleaseRetrievalEvidenceCandidates,
  type ReleaseUsageEvidenceCandidate,
  type ReleaseUsageEvidenceCandidates,
} from '@/modules/Releases/api/releasesApi'
import { applyUsageEvidenceCandidate, selectUsageEvidenceCandidateId } from '@/modules/Releases/model/usageEvidenceCandidates'

const RELEASE_ACTION_REFS = [
  'releases.manage',
  'release.manage',
  'agent_releases.manage',
  'agent.releases.manage',
  'agents.releases.manage',
]

const PUBLISH_EVIDENCE_FIELD_TO_FORM_KEY: Record<string, keyof PublishEvidenceForm> = {
  support_reconstruction_reference: 'supportReconstructionReference',
  usage_chat_id: 'usageChatId',
  usage_conversation_turn_id: 'usageConversationTurnId',
  usage_model_request_id: 'usageModelRequestId',
  billing_export_reference: 'billingExportReference',
  release_report_reference: 'releaseReportReference',
}

function canMutateReleases(adminUser: { role: string; permissions?: string[] } | null) {
  if (!adminUser) return false
  const permissions = adminUser.permissions ?? []
  if (['releases:write', 'release:write', 'agent-releases:write', 'manage-releases', 'manage-agents'].some((permission) => permissions.includes(permission))) {
    return true
  }
  return adminUser.role === 'platform_admin'
}

export function deriveReleasesCanManage(supportedMutationActions: string[], canMutate: boolean) {
  const supported = new Set(supportedMutationActions)
  return canMutate && RELEASE_ACTION_REFS.some((actionRef) => supported.has(actionRef))
}

export type ReleaseDraftForm = {
  selectedConfigId: string
  releaseCandidateId: string
  evidenceStableReference: string
  evidenceChangeKind: string
  evidencePassed: boolean
  smokeCases: ReleaseDraftSmokeCaseForm[]
  manualOverrideSelected: boolean
  manualOverrideReasonCode: string
  manualOverrideItemsText: string
  manualOverrideComment: string
}

export type ReleaseDraftSmokeCaseForm = {
  caseId: string
  required: boolean
  groundedReferenceRequired: boolean
  stableReferenceMustMatchReleaseReference: boolean
  labelKey: string
  descriptionKey: string
  passed: boolean
  stableReference: string
  outcome: string
}

export type PublishEvidenceForm = {
  supportReconstructionReference: string
  usageChatId: string
  usageConversationTurnId: string
  usageModelRequestId: string
  billingExportReference: string
  releaseReportReference: string
}

function linesToArray(value: string) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean)
}

function buildSmokeCaseRows(requirements: ReleaseEvidenceRequirements | null): ReleaseDraftSmokeCaseForm[] {
  return requirements?.requiredSmokeCases.map((smokeCase) => ({
    caseId: smokeCase.caseId,
    required: smokeCase.required,
    groundedReferenceRequired: smokeCase.groundedReferenceRequired,
    stableReferenceMustMatchReleaseReference: smokeCase.stableReferenceMustMatchReleaseReference,
    labelKey: smokeCase.labelKey,
    descriptionKey: smokeCase.descriptionKey,
    passed: false,
    stableReference: '',
    outcome: '',
  })) ?? []
}

function defaultDraftForm(requirements: ReleaseEvidenceRequirements | null = null): ReleaseDraftForm {
  return {
    selectedConfigId: '',
    releaseCandidateId: '',
    evidenceStableReference: '',
    evidenceChangeKind: requirements?.requiredChangeKind ?? '',
    evidencePassed: true,
    smokeCases: buildSmokeCaseRows(requirements),
    manualOverrideSelected: false,
    manualOverrideReasonCode: requirements?.manualOverride.defaultReasonCode ?? '',
    manualOverrideItemsText: requirements?.manualOverride.relatedMissingOrFailedItemsDefault.join('\n') ?? '',
    manualOverrideComment: '',
  }
}

function defaultPublishForm(): PublishEvidenceForm {
  return {
    supportReconstructionReference: '',
    usageChatId: '',
    usageConversationTurnId: '',
    usageModelRequestId: '',
    billingExportReference: '',
    releaseReportReference: '',
  }
}

export function applyPublishEvidenceDefaults(
  current: PublishEvidenceForm,
  defaults: ReleasePublishEvidenceDefaults | null | undefined,
): PublishEvidenceForm {
  if (!defaults) return current
  return {
    supportReconstructionReference: defaults.supportReconstructionReference ?? current.supportReconstructionReference,
    usageChatId: defaults.usageChatId ?? current.usageChatId,
    usageConversationTurnId: defaults.usageConversationTurnId ?? current.usageConversationTurnId,
    usageModelRequestId: defaults.usageModelRequestId ?? current.usageModelRequestId,
    billingExportReference: defaults.billingExportReference ?? current.billingExportReference,
    releaseReportReference: defaults.releaseReportReference ?? current.releaseReportReference,
  }
}

export function applyPublishEvidenceBundle(
  current: PublishEvidenceForm,
  bundle: ReleasePublishEvidenceBundle,
): PublishEvidenceForm {
  return {
    supportReconstructionReference: bundle.supportReconstructionReference ?? current.supportReconstructionReference,
    usageChatId: bundle.usageChatId ?? current.usageChatId,
    usageConversationTurnId: bundle.usageConversationTurnId ?? current.usageConversationTurnId,
    usageModelRequestId: bundle.usageModelRequestId ?? current.usageModelRequestId,
    billingExportReference: bundle.billingExportReference ?? current.billingExportReference,
    releaseReportReference: bundle.releaseReportReference ?? current.releaseReportReference,
  }
}

function isSmokeCaseComplete(form: ReleaseDraftForm, smokeCase: ReleaseDraftSmokeCaseForm) {
  if (!smokeCase.required) return true
  if (!smokeCase.passed) return false
  if (!smokeCase.outcome.trim()) return false
  if (smokeCase.groundedReferenceRequired && !smokeCase.stableReference.trim()) return false
  if (smokeCase.stableReferenceMustMatchReleaseReference && smokeCase.stableReference.trim() !== form.evidenceStableReference.trim()) return false
  return true
}

function getReleaseDraftProgress(form: ReleaseDraftForm) {
  const requiredCases = form.smokeCases.filter((smokeCase) => smokeCase.required)
  const groundedCases = requiredCases.filter((smokeCase) => smokeCase.groundedReferenceRequired)
  const completedRequiredCases = requiredCases.filter((smokeCase) => isSmokeCaseComplete(form, smokeCase))
  const filledGroundedReferences = groundedCases.filter((smokeCase) => smokeCase.stableReference.trim())
  const missingRequiredOutcomes = requiredCases.filter((smokeCase) => !smokeCase.outcome.trim())
  const missingGroundedReferences = groundedCases.filter((smokeCase) => !smokeCase.stableReference.trim())

  return {
    requiredTotal: requiredCases.length,
    requiredComplete: completedRequiredCases.length,
    groundedTotal: groundedCases.length,
    groundedReferencesFilled: filledGroundedReferences.length,
    missingRequiredOutcomes: missingRequiredOutcomes.length,
    missingGroundedReferences: missingGroundedReferences.length,
    missingPassedChecks: requiredCases.filter((smokeCase) => !smokeCase.passed).length,
  }
}

export function hasCompleteExplicitEvidence(form: ReleaseDraftForm, requirements: ReleaseEvidenceRequirements | null): boolean {
  if (!requirements?.evidenceRequired) return false
  if (!requirements.requiredChangeKind || !form.evidenceStableReference.trim()) return false
  if (!form.smokeCases.length) return true
  return form.smokeCases.every((smokeCase) => isSmokeCaseComplete(form, smokeCase))
}

export function hasCompleteManualOverride(form: ReleaseDraftForm, requirements: ReleaseEvidenceRequirements | null): boolean {
  if (!form.manualOverrideSelected || !requirements?.manualOverride.allowed) return false
  return Boolean(form.manualOverrideReasonCode.trim() && linesToArray(form.manualOverrideItemsText).length)
}

export function buildReleaseDraftInput(form: ReleaseDraftForm, requirements: ReleaseEvidenceRequirements | null = null): ReleaseCreateInput {
  const explicitEvidenceComplete = hasCompleteExplicitEvidence(form, requirements)
  const manualOverrideComplete = hasCompleteManualOverride(form, requirements)
  return {
    selectedConfigId: form.selectedConfigId.trim() || null,
    releaseCandidateId: form.releaseCandidateId.trim() || null,
    evidence: explicitEvidenceComplete
      ? {
          changeKind: form.evidenceChangeKind,
          stableReference: form.evidenceStableReference.trim(),
          passed: form.smokeCases.length ? form.smokeCases.every((smokeCase) => smokeCase.passed) : form.evidencePassed,
          smokeCases: form.smokeCases.map((smokeCase) => ({
            caseId: smokeCase.caseId,
            passed: smokeCase.passed,
            stableReference: smokeCase.stableReference.trim() || null,
            outcome: smokeCase.outcome.trim() || null,
          })),
        }
      : null,
    manualOverride: manualOverrideComplete
      ? {
          reasonCode: form.manualOverrideReasonCode.trim(),
          relatedMissingOrFailedItems: linesToArray(form.manualOverrideItemsText),
          comment: form.manualOverrideComment.trim() || null,
        }
      : null,
  }
}

function buildPublishInput(form: PublishEvidenceForm): PublishEvidenceInput | null {
  const input = {
    supportReconstructionReference: form.supportReconstructionReference.trim() || null,
    usageChatId: form.usageChatId.trim() || null,
    usageConversationTurnId: form.usageConversationTurnId.trim() || null,
    usageModelRequestId: form.usageModelRequestId.trim() || null,
    billingExportReference: form.billingExportReference.trim() || null,
    releaseReportReference: form.releaseReportReference.trim() || null,
  }
  return Object.values(input).some(Boolean) ? input : null
}

function getMissingRequiredPublishEvidenceFields(form: PublishEvidenceForm, requirements: ReleaseEvidenceRequirements | null) {
  if (!requirements) return []
  return requirements.publishEvidenceRequirements
    .filter((requirement) => requirement.required)
    .filter((requirement) => {
      const formKey = PUBLISH_EVIDENCE_FIELD_TO_FORM_KEY[requirement.field]
      return !formKey || !form[formKey].trim()
    })
}

export function requiresManagedRetrievalEvidence(requirements: ReleaseEvidenceRequirements | null): boolean {
  if (!requirements?.evidenceRequired) return false
  return Boolean(
    requirements.stableReferenceRule === 'knowledge_retrieval_run_required_for_grounded_cases' ||
    requirements.stableReferencePrefix?.startsWith('knowledge-retrieval-run:') ||
    requirements.requiredSmokeCases.some((smokeCase) => smokeCase.groundedReferenceRequired),
  )
}

export function selectRetrievalEvidenceCandidateId(current: string, candidates: ReleaseRetrievalEvidenceCandidates | null): string {
  if (!candidates?.items.length) return ''
  if (current && candidates.items.some((candidate) => candidate.candidateId === current)) return current
  return [...candidates.items].sort((left, right) => {
    const leftTime = Date.parse(left.createdAt || '')
    const rightTime = Date.parse(right.createdAt || '')
    return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0)
  })[0]?.candidateId ?? ''
}

export function selectPublishEvidenceBundleId(current: string, candidates: ReleasePublishEvidenceCandidates | null): string {
  if (!candidates?.items.length) return ''
  if (current && candidates.items.some((bundle) => bundle.bundleId === current)) return current
  return candidates.summary.recommendedBundleId || candidates.items[0]?.bundleId || ''
}

function applyRetrievalEvidenceCandidateToDraft(
  form: ReleaseDraftForm,
  candidate: ReleaseRetrievalEvidenceCandidate,
  requirements: ReleaseEvidenceRequirements | null,
): ReleaseDraftForm {
  return {
    ...form,
    releaseCandidateId: candidate.releaseCandidateId,
    evidenceStableReference: candidate.stableReference,
    evidenceChangeKind: requirements?.requiredChangeKind ?? form.evidenceChangeKind,
    smokeCases: form.smokeCases.map((smokeCase) => smokeCase.groundedReferenceRequired
      ? { ...smokeCase, stableReference: candidate.stableReference }
      : smokeCase),
  }
}

function isRetrievalCandidateAppliedToDraft(
  form: ReleaseDraftForm,
  candidate: ReleaseRetrievalEvidenceCandidate | null,
) {
  if (!candidate) return false
  return form.releaseCandidateId.trim() === candidate.releaseCandidateId && form.evidenceStableReference.trim() === candidate.stableReference
}

function isRetrievalCandidateCompatibleWithRelease(
  release: ReleaseDetail | null,
  candidate: ReleaseRetrievalEvidenceCandidate,
  rememberedReleaseCandidateId: string | null,
) {
  if (!release) return false
  if (release.releaseCandidateId && release.releaseCandidateId === candidate.releaseCandidateId) return true
  if (release.evidenceReference && release.evidenceReference === candidate.stableReference) return true
  if (rememberedReleaseCandidateId && rememberedReleaseCandidateId === candidate.releaseCandidateId) return true
  return false
}

function newRetrievalEvidenceIdempotencyKey() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `release_retrieval_evidence_${crypto.randomUUID()}`
  }
  return `release_retrieval_evidence_${Date.now()}`
}

export function useReleasesManager(tenantId: string, agentId: string) {
  const { adminUser } = useAuth()
  const { t } = useI18n()
  const [agentDetail, setAgentDetail] = useState<PortalAgentDetail | null>(null)
  const [readiness, setReadiness] = useState<ReleaseReadiness | null>(null)
  const [evidenceRequirements, setEvidenceRequirements] = useState<ReleaseEvidenceRequirements | null>(null)
  const [usageEvidenceCandidates, setUsageEvidenceCandidates] = useState<ReleaseUsageEvidenceCandidates | null>(null)
  const [selectedUsageEvidenceCandidateId, setSelectedUsageEvidenceCandidateId] = useState<string>('')
  const [publishEvidenceCandidates, setPublishEvidenceCandidates] = useState<ReleasePublishEvidenceCandidates | null>(null)
  const [selectedPublishEvidenceBundleId, setSelectedPublishEvidenceBundleId] = useState<string>('')
  const [retrievalEvidenceCandidates, setRetrievalEvidenceCandidates] = useState<ReleaseRetrievalEvidenceCandidates | null>(null)
  const [selectedRetrievalEvidenceCandidateId, setSelectedRetrievalEvidenceCandidateId] = useState<string>('')
  const [releaseCandidateByReleaseId, setReleaseCandidateByReleaseId] = useState<Record<string, string>>({})
  const [releases, setReleases] = useState<ReleaseListItem[]>([])
  const [selectedRelease, setSelectedRelease] = useState<ReleaseDetail | null>(null)
  const [draftForm, setDraftForm] = useState<ReleaseDraftForm>(() => defaultDraftForm())
  const [publishForm, setPublishForm] = useState<PublishEvidenceForm>(() => defaultPublishForm())
  const [mutationResult, setMutationResult] = useState<MutationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingUsageEvidenceCandidates, setIsLoadingUsageEvidenceCandidates] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [usageEvidenceCandidatesError, setUsageEvidenceCandidatesError] = useState<string | null>(null)
  const [publishEvidenceCandidatesError, setPublishEvidenceCandidatesError] = useState<string | null>(null)
  const [retrievalEvidenceCandidatesError, setRetrievalEvidenceCandidatesError] = useState<string | null>(null)
  const [isLoadingRetrievalEvidenceCandidates, setIsLoadingRetrievalEvidenceCandidates] = useState(true)
  const [isLoadingPublishEvidenceCandidates, setIsLoadingPublishEvidenceCandidates] = useState(true)
  const [isGeneratingRetrievalEvidenceCandidate, setIsGeneratingRetrievalEvidenceCandidate] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const canMutate = canMutateReleases(adminUser)
  const canManageReleases = useMemo(
    () => deriveReleasesCanManage(agentDetail?.supportedMutationActions ?? [], canMutate),
    [agentDetail?.supportedMutationActions, canMutate],
  )

  const loadUsageEvidenceCandidates = useCallback(async () => {
    setIsLoadingUsageEvidenceCandidates(true)
    setUsageEvidenceCandidatesError(null)
    try {
      const nextUsageEvidenceCandidates = await releasesApi.getUsageEvidenceCandidates(tenantId, agentId)
      setUsageEvidenceCandidates(nextUsageEvidenceCandidates)
      setSelectedUsageEvidenceCandidateId((current) => selectUsageEvidenceCandidateId(current, nextUsageEvidenceCandidates))
    } catch (error) {
      setUsageEvidenceCandidates(null)
      setSelectedUsageEvidenceCandidateId('')
      setUsageEvidenceCandidatesError(getLocalizedApiErrorMessage(error, t, t('releases.usage_evidence_candidates_load_error')))
    } finally {
      setIsLoadingUsageEvidenceCandidates(false)
    }
  }, [agentId, tenantId, t])

  const loadPublishEvidenceCandidates = useCallback(async (releaseId?: string | null) => {
    setIsLoadingPublishEvidenceCandidates(true)
    setPublishEvidenceCandidatesError(null)
    try {
      const nextPublishEvidenceCandidates = await releasesApi.getPublishEvidenceCandidates(tenantId, agentId, releaseId)
      setPublishEvidenceCandidates(nextPublishEvidenceCandidates)
      setSelectedPublishEvidenceBundleId((current) => selectPublishEvidenceBundleId(current, nextPublishEvidenceCandidates))
    } catch (error) {
      setPublishEvidenceCandidates(null)
      setSelectedPublishEvidenceBundleId('')
      setPublishEvidenceCandidatesError(getLocalizedApiErrorMessage(error, t, t('releases.publish_evidence_bundles_load_error')))
    } finally {
      setIsLoadingPublishEvidenceCandidates(false)
    }
  }, [agentId, tenantId, t])

  const loadRetrievalEvidenceCandidates = useCallback(async () => {
    setIsLoadingRetrievalEvidenceCandidates(true)
    setRetrievalEvidenceCandidatesError(null)
    try {
      const nextRetrievalEvidenceCandidates = await releasesApi.getRetrievalEvidenceCandidates(tenantId, agentId)
      setRetrievalEvidenceCandidates(nextRetrievalEvidenceCandidates)
      setSelectedRetrievalEvidenceCandidateId((current) => selectRetrievalEvidenceCandidateId(current, nextRetrievalEvidenceCandidates))
    } catch (error) {
      setRetrievalEvidenceCandidates(null)
      setSelectedRetrievalEvidenceCandidateId('')
      setRetrievalEvidenceCandidatesError(getLocalizedApiErrorMessage(error, t, t('releases.retrieval_evidence.load_error')))
    } finally {
      setIsLoadingRetrievalEvidenceCandidates(false)
    }
  }, [agentId, tenantId, t])

  const loadReleases = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [agent, nextReadiness, nextEvidenceRequirements, nextReleases] = await Promise.all([
        agentsApi.getPortalAgentDetail(tenantId, agentId),
        releasesApi.getReadiness(tenantId, agentId),
        releasesApi.getEvidenceRequirements(tenantId, agentId),
        releasesApi.listReleases(tenantId, agentId),
      ])
      setAgentDetail(agent)
      setReadiness(nextReadiness)
      setEvidenceRequirements(nextEvidenceRequirements)
      setReleases(nextReleases)
      setDraftForm((current) => ({
        ...defaultDraftForm(nextEvidenceRequirements),
        selectedConfigId: current.selectedConfigId || agent.activeConfigId || '',
        releaseCandidateId: current.releaseCandidateId,
        evidenceStableReference: current.evidenceStableReference,
        evidencePassed: current.evidencePassed,
      }))
      const selectedId = selectedRelease?.releaseId ?? nextReleases[0]?.releaseId
      setSelectedRelease(selectedId ? await releasesApi.getRelease(tenantId, agentId, selectedId) : null)
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('releases.load_error')))
    } finally {
      setIsLoading(false)
    }
  }, [agentId, selectedRelease?.releaseId, tenantId, t])

  useEffect(() => {
    void loadReleases()
    void loadUsageEvidenceCandidates()
    void loadRetrievalEvidenceCandidates()
  }, [loadReleases, loadRetrievalEvidenceCandidates, loadUsageEvidenceCandidates])

  useEffect(() => {
    void loadPublishEvidenceCandidates(selectedRelease?.releaseId ?? null)
  }, [loadPublishEvidenceCandidates, selectedRelease?.releaseId])

  const selectedUsageEvidenceCandidate = useMemo<ReleaseUsageEvidenceCandidate | null>(
    () => usageEvidenceCandidates?.items.find((candidate) => candidate.conversationTurnId === selectedUsageEvidenceCandidateId) ?? null,
    [selectedUsageEvidenceCandidateId, usageEvidenceCandidates?.items],
  )

  const selectedPublishEvidenceBundle = useMemo<ReleasePublishEvidenceBundle | null>(
    () => publishEvidenceCandidates?.items.find((bundle) => bundle.bundleId === selectedPublishEvidenceBundleId) ?? null,
    [publishEvidenceCandidates?.items, selectedPublishEvidenceBundleId],
  )

  const selectedRetrievalEvidenceCandidate = useMemo<ReleaseRetrievalEvidenceCandidate | null>(
    () => retrievalEvidenceCandidates?.items.find((candidate) => candidate.candidateId === selectedRetrievalEvidenceCandidateId) ?? null,
    [retrievalEvidenceCandidates?.items, selectedRetrievalEvidenceCandidateId],
  )

  const selectRelease = useCallback(async (releaseId: string) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      setSelectedRelease(await releasesApi.getRelease(tenantId, agentId, releaseId))
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('releases.detail_error')))
    } finally {
      setIsLoading(false)
    }
  }, [agentId, tenantId, t])

  const applyMutation = useCallback(async (mutation: () => Promise<{ resource: ReleaseDetail; result: MutationResult }>, message: string) => {
    if (!canManageReleases) {
      setFormError(t('releases.action_not_available'))
      return
    }
    setIsMutating(true)
    setFormError(null)
    setNotice(null)
    setMutationResult(null)
    try {
      const response = await mutation()
      setSelectedRelease(response.resource)
      setMutationResult(response.result)
      setNotice(message)
      const [nextReadiness, nextEvidenceRequirements, nextReleases, nextRetrievalEvidenceCandidates, nextPublishEvidenceCandidates] = await Promise.all([
        releasesApi.getReadiness(tenantId, agentId),
        releasesApi.getEvidenceRequirements(tenantId, agentId),
        releasesApi.listReleases(tenantId, agentId),
        releasesApi.getRetrievalEvidenceCandidates(tenantId, agentId).catch(() => null),
        releasesApi.getPublishEvidenceCandidates(tenantId, agentId, response.resource.releaseId).catch(() => null),
      ])
      setReadiness(nextReadiness)
      setEvidenceRequirements(nextEvidenceRequirements)
      setReleases(nextReleases)
      if (nextRetrievalEvidenceCandidates) {
        setRetrievalEvidenceCandidates(nextRetrievalEvidenceCandidates)
        setSelectedRetrievalEvidenceCandidateId((current) => selectRetrievalEvidenceCandidateId(current, nextRetrievalEvidenceCandidates))
      }
      if (nextPublishEvidenceCandidates) {
        setPublishEvidenceCandidates(nextPublishEvidenceCandidates)
        setSelectedPublishEvidenceBundleId((current) => selectPublishEvidenceBundleId(current, nextPublishEvidenceCandidates))
      }
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('releases.action_error')))
    } finally {
      setIsMutating(false)
    }
  }, [agentId, canManageReleases, tenantId, t])

  const managedRetrievalEvidenceRequired = useMemo(
    () => requiresManagedRetrievalEvidence(evidenceRequirements),
    [evidenceRequirements],
  )
  const selectedRetrievalEvidenceCandidateAppliedToDraft = useMemo(
    () => isRetrievalCandidateAppliedToDraft(draftForm, selectedRetrievalEvidenceCandidate),
    [draftForm, selectedRetrievalEvidenceCandidate],
  )
  const retrievalEvidenceReadyForDraft = !managedRetrievalEvidenceRequired || selectedRetrievalEvidenceCandidateAppliedToDraft
  const explicitEvidenceComplete = useMemo(
    () => hasCompleteExplicitEvidence(draftForm, evidenceRequirements) && retrievalEvidenceReadyForDraft,
    [draftForm, evidenceRequirements, retrievalEvidenceReadyForDraft],
  )
  const manualOverrideComplete = useMemo(
    () => hasCompleteManualOverride(draftForm, evidenceRequirements),
    [draftForm, evidenceRequirements],
  )
  const releaseSetupReady = Boolean(evidenceRequirements?.releaseSetupReady)
  const draftProgress = useMemo(() => getReleaseDraftProgress(draftForm), [draftForm])
  const canCreateRelease = canManageReleases && !isMutating && releaseSetupReady && (explicitEvidenceComplete || manualOverrideComplete)
  const createDisabledReason = useMemo(() => {
    if (!canManageReleases) return t('releases.action_not_available')
    if (!evidenceRequirements) return t('releases.evidence_requirements_missing')
    if (!evidenceRequirements.releaseSetupReady) return t('releases.release_setup_not_ready')
    if (!evidenceRequirements.requiredChangeKind && !manualOverrideComplete) return t('releases.required_change_kind_missing')
    if (managedRetrievalEvidenceRequired && !retrievalEvidenceReadyForDraft && !manualOverrideComplete) {
      return t('releases.retrieval_evidence_required')
    }
    if (!explicitEvidenceComplete && !manualOverrideComplete) {
      if (draftProgress.requiredTotal > 0) {
        return t('releases.create_disabled_remaining_matrix')
          .replace('{outcomes}', String(draftProgress.missingRequiredOutcomes))
          .replace('{grounded}', String(draftProgress.missingGroundedReferences))
      }
      return t('releases.create_disabled_incomplete_evidence')
    }
    return null
  }, [canManageReleases, draftProgress.missingGroundedReferences, draftProgress.missingRequiredOutcomes, draftProgress.requiredTotal, evidenceRequirements, explicitEvidenceComplete, managedRetrievalEvidenceRequired, manualOverrideComplete, retrievalEvidenceReadyForDraft, t])
  const missingRequiredPublishEvidenceFields = useMemo(
    () => getMissingRequiredPublishEvidenceFields(publishForm, evidenceRequirements),
    [publishForm, evidenceRequirements],
  )
  const compatibleRetrievalEvidenceCandidateForSelectedRelease = useMemo(
    () => retrievalEvidenceCandidates?.items.find((candidate) => isRetrievalCandidateCompatibleWithRelease(
      selectedRelease,
      candidate,
      selectedRelease ? releaseCandidateByReleaseId[selectedRelease.releaseId] ?? null : null,
    )) ?? null,
    [releaseCandidateByReleaseId, retrievalEvidenceCandidates?.items, selectedRelease],
  )
  const selectedReleaseSupportReconstructionReference = selectedRelease?.supportReconstructionReference
    || compatibleRetrievalEvidenceCandidateForSelectedRelease?.supportReconstructionReference
    || ''
  const selectedReleaseMissingRetrievalEvidence = Boolean(
    managedRetrievalEvidenceRequired &&
    selectedRelease &&
    !selectedReleaseSupportReconstructionReference,
  )
  const canPublishSelected = Boolean(
    canManageReleases &&
    !isMutating &&
    selectedRelease &&
    selectedRelease.status !== 'failed' &&
    evidenceRequirements?.runtimeProviderPreflight.available &&
    evidenceRequirements.runtimeProviderPreflight.ready &&
    !selectedReleaseMissingRetrievalEvidence &&
    !missingRequiredPublishEvidenceFields.length,
  )
  const publishDisabledReason = useMemo(() => {
    if (!canManageReleases) return t('releases.action_not_available')
    if (!selectedRelease) return null
    if (selectedRelease.status === 'failed') return t('releases.publish_disabled_failed_release')
    if (!evidenceRequirements) return t('releases.evidence_requirements_missing')
    if (!evidenceRequirements.runtimeProviderPreflight.available) return t('releases.runtime_provider_preflight_missing')
    if (!evidenceRequirements.runtimeProviderPreflight.ready) return t('releases.runtime_provider_publish_warning')
    if (selectedReleaseMissingRetrievalEvidence) return t('releases.publish_disabled_missing_retrieval_evidence')
    if (missingRequiredPublishEvidenceFields.length) {
      return t('releases.publish_disabled_missing_required_evidence')
        .replace('{fields}', missingRequiredPublishEvidenceFields.map((field) => {
          const label = field.labelKey ? t(field.labelKey) : ''
          return label && label !== field.labelKey ? label : field.field
        }).join(', '))
    }
    return null
  }, [canManageReleases, evidenceRequirements, missingRequiredPublishEvidenceFields, selectedRelease, selectedReleaseMissingRetrievalEvidence, t])

  useEffect(() => {
    if (!managedRetrievalEvidenceRequired) return
    setPublishForm((current) => {
      if (current.supportReconstructionReference === selectedReleaseSupportReconstructionReference) return current
      return {
        ...current,
        supportReconstructionReference: selectedReleaseSupportReconstructionReference,
      }
    })
  }, [managedRetrievalEvidenceRequired, selectedReleaseSupportReconstructionReference])

  const applyEvidenceReferenceToGroundedCases = useCallback(() => {
    if (managedRetrievalEvidenceRequired && !selectedRetrievalEvidenceCandidate) {
      setFormError(t('releases.retrieval_evidence.select_candidate_first'))
      return
    }
    setDraftForm((current) => ({
      ...(managedRetrievalEvidenceRequired && selectedRetrievalEvidenceCandidate
        ? applyRetrievalEvidenceCandidateToDraft(current, selectedRetrievalEvidenceCandidate, evidenceRequirements)
        : current),
      smokeCases: current.smokeCases.map((smokeCase) => smokeCase.groundedReferenceRequired
        ? { ...smokeCase, stableReference: managedRetrievalEvidenceRequired ? selectedRetrievalEvidenceCandidate?.stableReference ?? '' : current.evidenceStableReference.trim() }
        : smokeCase),
    }))
    setFormError(null)
    if (managedRetrievalEvidenceRequired) setNotice(t('releases.notice.retrieval_evidence_applied'))
  }, [evidenceRequirements, managedRetrievalEvidenceRequired, selectedRetrievalEvidenceCandidate, t])

  const applyRetrievalEvidenceCandidateToDraftForm = useCallback(() => {
    if (!selectedRetrievalEvidenceCandidate) {
      setFormError(t('releases.retrieval_evidence.select_candidate_first'))
      return
    }
    setDraftForm((current) => applyRetrievalEvidenceCandidateToDraft(current, selectedRetrievalEvidenceCandidate, evidenceRequirements))
    setFormError(null)
    setNotice(t('releases.notice.retrieval_evidence_applied'))
  }, [evidenceRequirements, selectedRetrievalEvidenceCandidate, t])

  const generateRetrievalEvidenceCandidate = useCallback(async () => {
    if (!canManageReleases) {
      setFormError(t('releases.action_not_available'))
      return
    }
    const selectedConfigId = draftForm.selectedConfigId.trim() || agentDetail?.activeConfigId || ''
    if (!selectedConfigId) {
      setFormError(t('releases.retrieval_evidence.missing_selected_config'))
      return
    }
    setIsGeneratingRetrievalEvidenceCandidate(true)
    setFormError(null)
    setNotice(null)
    try {
      const nextRetrievalEvidenceCandidates = await releasesApi.createRetrievalEvidenceCandidate(tenantId, agentId, {
        selectedConfigId,
        releaseCandidateId: selectedRetrievalEvidenceCandidate?.releaseCandidateId || draftForm.releaseCandidateId.trim() || null,
        idempotencyKey: newRetrievalEvidenceIdempotencyKey(),
      })
      setRetrievalEvidenceCandidates(nextRetrievalEvidenceCandidates)
      const nextSelectedId = selectRetrievalEvidenceCandidateId('', nextRetrievalEvidenceCandidates)
      setSelectedRetrievalEvidenceCandidateId(nextSelectedId)
      const nextCandidate = nextRetrievalEvidenceCandidates.items.find((candidate) => candidate.candidateId === nextSelectedId) ?? nextRetrievalEvidenceCandidates.items[0] ?? null
      if (nextCandidate) {
        setDraftForm((current) => applyRetrievalEvidenceCandidateToDraft(current, nextCandidate, evidenceRequirements))
      }
      setNotice(t('releases.retrieval_evidence.generated'))
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('releases.retrieval_evidence.generate_error')))
    } finally {
      setIsGeneratingRetrievalEvidenceCandidate(false)
    }
  }, [agentDetail?.activeConfigId, agentId, canManageReleases, draftForm.releaseCandidateId, draftForm.selectedConfigId, evidenceRequirements, selectedRetrievalEvidenceCandidate?.releaseCandidateId, tenantId, t])

  const fillDefaultSmokeOutcomes = useCallback(() => {
    setDraftForm((current) => ({
      ...current,
      smokeCases: current.smokeCases.map((smokeCase) => ({
        ...smokeCase,
        outcome: smokeCase.outcome.trim() || t('releases.default_smoke_outcome'),
        passed: true,
      })),
    }))
  }, [t])

  const applyUsageEvidenceCandidateToPublishForm = useCallback(() => {
    if (!selectedUsageEvidenceCandidate) {
      setFormError(t('releases.usage_evidence_select_candidate_first'))
      return
    }
    setPublishForm((current) => applyUsageEvidenceCandidate(current, selectedUsageEvidenceCandidate))
    setFormError(null)
    setNotice(t('releases.notice.usage_evidence_applied'))
  }, [selectedUsageEvidenceCandidate, t])

  const applyPublishEvidenceDefaultsToPublishForm = useCallback(() => {
    if (selectedPublishEvidenceBundle) {
      setPublishForm((current) => applyPublishEvidenceBundle(current, selectedPublishEvidenceBundle))
      setFormError(null)
      setNotice(t('releases.notice.publish_evidence_bundle_applied'))
      return
    }
    setPublishForm((current) => {
      let next = applyPublishEvidenceDefaults(current, evidenceRequirements?.publishEvidenceDefaults)
      if (selectedReleaseSupportReconstructionReference) {
        next = {
          ...next,
          supportReconstructionReference: selectedReleaseSupportReconstructionReference,
        }
      }
      if (selectedUsageEvidenceCandidate) {
        next = applyUsageEvidenceCandidate(next, selectedUsageEvidenceCandidate)
      }
      return next
    })
    setFormError(null)
    setNotice(t('releases.notice.publish_evidence_defaults_applied'))
  }, [evidenceRequirements?.publishEvidenceDefaults, selectedPublishEvidenceBundle, selectedReleaseSupportReconstructionReference, selectedUsageEvidenceCandidate, t])

  const applyPublishEvidenceBundleToPublishForm = useCallback(() => {
    if (!selectedPublishEvidenceBundle) {
      setFormError(t('releases.publish_evidence_bundle_select_first'))
      return
    }
    if (selectedPublishEvidenceBundle.readinessStatus !== 'ready') {
      setFormError(t('releases.publish_evidence_bundle_blocked'))
      return
    }
    setPublishForm((current) => applyPublishEvidenceBundle(current, selectedPublishEvidenceBundle))
    setFormError(null)
    setNotice(t('releases.notice.publish_evidence_bundle_applied'))
  }, [selectedPublishEvidenceBundle, t])

  const createRelease = useCallback(async () => {
    const input = buildReleaseDraftInput(draftForm, evidenceRequirements)
    await applyMutation(async () => {
      const response = await releasesApi.createRelease(tenantId, agentId, input)
      if (input.releaseCandidateId && response.resource.releaseId) {
        setReleaseCandidateByReleaseId((current) => ({
          ...current,
          [response.resource.releaseId]: input.releaseCandidateId ?? '',
        }))
      }
      return response
    }, t('releases.notice.created'))
  }, [agentId, applyMutation, draftForm, evidenceRequirements, tenantId, t])

  const publishSelected = useCallback(async () => {
    if (!selectedRelease) return
    await applyMutation(
      () => releasesApi.publishRelease(tenantId, agentId, selectedRelease.releaseId, buildPublishInput(publishForm)),
      t('releases.notice.published'),
    )
  }, [agentId, applyMutation, publishForm, selectedRelease, tenantId, t])

  const rollbackSelected = useCallback(async () => {
    if (!selectedRelease) return
    await applyMutation(() => releasesApi.rollbackRelease(tenantId, agentId, selectedRelease.releaseId), t('releases.notice.rolled_back'))
  }, [agentId, applyMutation, selectedRelease, tenantId, t])

  const disableSelected = useCallback(async () => {
    if (!selectedRelease) return
    await applyMutation(() => releasesApi.disableRelease(tenantId, agentId, selectedRelease.releaseId), t('releases.notice.disabled'))
  }, [agentId, applyMutation, selectedRelease, tenantId, t])

  return {
    tenantId,
    agentId,
    agentDetail,
    readiness,
    evidenceRequirements,
    usageEvidenceCandidates,
    selectedUsageEvidenceCandidateId,
    selectedUsageEvidenceCandidate,
    publishEvidenceCandidates,
    selectedPublishEvidenceBundleId,
    selectedPublishEvidenceBundle,
    retrievalEvidenceCandidates,
    selectedRetrievalEvidenceCandidateId,
    selectedRetrievalEvidenceCandidate,
    compatibleRetrievalEvidenceCandidateForSelectedRelease,
    managedRetrievalEvidenceRequired,
    selectedReleaseMissingRetrievalEvidence,
    releases,
    selectedRelease,
    draftForm,
    publishForm,
    mutationResult,
    canManageReleases,
    canCreateRelease,
    createDisabledReason,
    canPublishSelected,
    publishDisabledReason,
    explicitEvidenceComplete,
    manualOverrideComplete,
    draftProgress,
    isLoading,
    isLoadingUsageEvidenceCandidates,
    isLoadingPublishEvidenceCandidates,
    isLoadingRetrievalEvidenceCandidates,
    isGeneratingRetrievalEvidenceCandidate,
    isMutating,
    errorMessage,
    usageEvidenceCandidatesError,
    publishEvidenceCandidatesError,
    retrievalEvidenceCandidatesError,
    formError,
    notice,
    loadReleases,
    loadUsageEvidenceCandidates,
    loadPublishEvidenceCandidates,
    loadRetrievalEvidenceCandidates,
    selectRelease,
    setDraftForm,
    setPublishForm,
    setSelectedUsageEvidenceCandidateId,
    setSelectedPublishEvidenceBundleId,
    setSelectedRetrievalEvidenceCandidateId,
    applyEvidenceReferenceToGroundedCases,
    applyRetrievalEvidenceCandidateToDraftForm,
    generateRetrievalEvidenceCandidate,
    applyUsageEvidenceCandidateToPublishForm,
    applyPublishEvidenceDefaultsToPublishForm,
    applyPublishEvidenceBundleToPublishForm,
    fillDefaultSmokeOutcomes,
    createRelease,
    publishSelected,
    rollbackSelected,
    disableSelected,
  }
}

export type ReleasesManager = ReturnType<typeof useReleasesManager>
