import { apiClient } from '@/core/api/apiClient'

const ADMIN_PREFIX = '/api/admin/v1'
const PORTAL_PREFIX = `${ADMIN_PREFIX}/portal`

export type MutationResult = {
  action: string
  resourceType: string
  resourceId: string | null
  actorId: string | null
  actorType: string | null
  tenantId: string | null
  correlationId: string | null
  mutationTimestamp: string
  changedStateSummary: Record<string, unknown>
  status?: string | null
  resultStatus?: string | null
  version?: string | number | null
}

export type ReleaseManualOverride = {
  used: boolean
  status: string | null
  reasonCode: string | null
  approvalActorId: string | null
  correlationId: string | null
  relatedMissingOrFailedItems: string[]
  comment: string | null
}

export type ReleaseReadinessItem = {
  itemId: string
  ownerArea: string
  state: string
  blocking: boolean
  detail: string
  requiredAction: string | null
}

export type ReleaseReadiness = {
  agentId: string
  readinessStatus: string
  releaseReady: boolean
  gateMode: string | null
  blockingItemCount: number
  items: ReleaseReadinessItem[]
  currentReleaseId: string | null
  currentReleaseVersion: number | null
  currentReleaseStatus: string | null
  currentReleaseGateMode: string | null
  currentReleaseManualOverride: ReleaseManualOverride | null
  activeReleasePresent: boolean
  activeReleaseId: string | null
  activeReleaseVersion: number | null
  activeReleaseStatus: string | null
  activeReleaseGateMode: string | null
  activeReleaseManualOverride: ReleaseManualOverride | null
  latestReleaseId: string | null
  latestReleaseVersion: number | null
  latestReleaseStatus: string | null
  latestReleaseGateMode: string | null
  latestReleaseManualOverride: ReleaseManualOverride | null
  evaluationEvidenceOwnerMarker: string
  publishOwnerMarker: string
}

export type ReleaseListItem = {
  releaseId: string
  releaseVersion: number
  status: string
  gateMode: string
  active: boolean
  selectedConfigVersion: number | null
  evidenceReference: string | null
  manualOverrideUsed: boolean
  createdAt: string
}

export type ReleaseDetail = {
  releaseId: string
  tenantId: string
  agentId: string
  releaseVersion: number
  status: string
  gateMode: string
  active: boolean
  createdAt: string
  updatedAt: string
  selectedConfigVersion: number | null
  releaseCandidateId: string | null
  evidenceReference: string | null
  supportReconstructionReference: string | null
  evidencePassed: boolean | null
  manualOverride: ReleaseManualOverride | null
  readinessItems: ReleaseReadinessItem[]
  missingOrFailedItems: ReleaseReadinessItem[]
}

export type ReleaseEvidenceSmokeCaseRequirement = {
  caseId: string
  required: boolean
  groundedReferenceRequired: boolean
  stableReferenceMustMatchReleaseReference: boolean
  labelKey: string
  descriptionKey: string
}

export type ReleaseManualOverrideRequirement = {
  allowed: boolean
  blockedReason: string | null
  defaultReasonCode: string | null
  relatedMissingOrFailedItemsDefault: string[]
}

export type ReleasePublishEvidenceRequirement = {
  field: string
  required: boolean
  labelKey: string
  descriptionKey: string
}

export type ReleasePublishEvidenceDefaults = {
  supportReconstructionReference: string | null
  usageChatId: string | null
  usageConversationTurnId: string | null
  usageModelRequestId: string | null
  billingExportReference: string | null
  releaseReportReference: string | null
}

export type RuntimeProviderPreflightRequirement = {
  providerId: string
  credentialKey: string
  credentialConfigured: boolean
  secretResolvable: boolean
  state: string
  requiredAction: string | null
}

export type RuntimeProviderPreflight = {
  available: boolean
  ready: boolean
  requirements: RuntimeProviderPreflightRequirement[]
}

export type ReleaseUsageEvidenceNoCandidateReason =
  | 'runtime_provider_not_ready'
  | 'no_successful_widget_conversation'
  | 'usage_not_recorded'
  | 'candidate_source_unavailable'
  | string

export type ReleaseUsageEvidenceCandidate = {
  chatId: string
  conversationTurnId: string
  modelRequestId: string
  createdAt: string
  turnStatus: string
  modelRequestState: string
  usageRecorded: boolean
  agentId: string
  agentConfigId: string | null
  widgetKey: string | null
  channel: string | null
  displayLabel: string
}

export type ReleaseUsageEvidenceCandidateSummary = {
  candidateCount: number
  ready: boolean
  noCandidateReason: ReleaseUsageEvidenceNoCandidateReason | null
  message: string
}

export type ReleaseUsageEvidenceCandidates = {
  items: ReleaseUsageEvidenceCandidate[]
  summary: ReleaseUsageEvidenceCandidateSummary
  noCandidateReason: ReleaseUsageEvidenceNoCandidateReason | null
  generatedAt: string | null
}

export type ReleasePublishEvidenceNoCandidateReason =
  | 'release_not_found'
  | 'no_release_candidate'
  | 'publish_evidence_incomplete'
  | string

export type ReleasePublishEvidenceBundle = {
  bundleId: string
  displayLabel: string
  readinessStatus: string
  recommended: boolean
  releaseId: string
  releaseVersion: number
  releaseStatus: string
  releaseActive: boolean
  selectedConfigId: string | null
  supportReconstructionReference: string | null
  usageChatId: string | null
  usageConversationTurnId: string | null
  usageModelRequestId: string | null
  billingExportReference: string | null
  releaseReportReference: string | null
  retrievalCandidateId: string | null
  usageCandidateId: string | null
  blockingReasons: string[]
  technicalDetails: Record<string, unknown>
}

export type ReleasePublishEvidenceCandidateSummary = {
  candidateCount: number
  ready: boolean
  recommendedBundleId: string | null
  noCandidateReason: ReleasePublishEvidenceNoCandidateReason | null
  message: string
}

export type ReleasePublishEvidenceCandidates = {
  agentId: string
  templateId: string | null
  items: ReleasePublishEvidenceBundle[]
  summary: ReleasePublishEvidenceCandidateSummary
  noCandidateReason: ReleasePublishEvidenceNoCandidateReason | null
  generatedAt: string | null
}

export type ReleaseRetrievalEvidenceNoCandidateReason =
  | 'missing_selected_config'
  | 'managed_knowledge_not_required'
  | 'managed_knowledge_not_ready'
  | 'no_retrieval_evidence_candidate'
  | 'candidate_generation_failed'
  | 'candidate_source_unavailable'
  | string

export type ReleaseRetrievalEvidenceCandidate = {
  candidateId: string
  releaseCandidateId: string
  retrievalRunId: string
  stableReference: string
  supportReconstructionReference: string
  selectedConfigId: string
  outcome: string
  sourceIds: string[]
  indexId: string | null
  indexVersionId: string | null
  sourceSetKey: string | null
  sourceSetReadinessMarker: string | null
  selectedChunkCount: number
  citationCount: number
  createdAt: string
  status: string
  problems: string[]
}

export type ReleaseRetrievalEvidenceCandidateSummary = {
  candidateCount: number
  ready: boolean
  noCandidateReason: ReleaseRetrievalEvidenceNoCandidateReason | null
  requiredAction: string | null
  problems: string[]
}

export type ReleaseRetrievalEvidenceCandidates = {
  items: ReleaseRetrievalEvidenceCandidate[]
  summary: ReleaseRetrievalEvidenceCandidateSummary
  noCandidateReason: ReleaseRetrievalEvidenceNoCandidateReason | null
  generatedAt: string | null
}

export type ReleaseEvidenceRequirements = {
  agentId: string
  templateId: string
  releaseSetupReady: boolean
  releaseSetupBlockingItems: ReleaseReadinessItem[]
  evidenceRequired: boolean
  evidenceStatus: string
  requiredChangeKind: string | null
  stableReferenceRule: string | null
  stableReferencePrefix: string | null
  requiredSmokeCases: ReleaseEvidenceSmokeCaseRequirement[]
  manualOverride: ReleaseManualOverrideRequirement
  publishEvidenceRequirements: ReleasePublishEvidenceRequirement[]
  publishEvidenceDefaults: ReleasePublishEvidenceDefaults
  runtimeProviderPreflight: RuntimeProviderPreflight
  lastCheckedAt: string | null
  ownerStage: string
}

export type ReleaseEvidenceSmokeCaseInput = {
  caseId: string
  passed: boolean
  stableReference: string | null
  outcome: string | null
}

export type ReleaseEvidenceInput = {
  changeKind: string
  stableReference: string
  passed: boolean
  smokeCases: ReleaseEvidenceSmokeCaseInput[]
}

export type ReleaseManualOverrideInput = {
  reasonCode: string
  relatedMissingOrFailedItems: string[]
  comment: string | null
}

export type ReleaseCreateInput = {
  selectedConfigId: string | null
  releaseCandidateId: string | null
  evidence: ReleaseEvidenceInput | null
  manualOverride: ReleaseManualOverrideInput | null
}

export type CreateReleaseRetrievalEvidenceCandidateInput = {
  selectedConfigId: string
  releaseCandidateId: string | null
  idempotencyKey: string
}

export type PublishEvidenceInput = {
  supportReconstructionReference: string | null
  usageChatId: string | null
  usageConversationTurnId: string | null
  usageModelRequestId: string | null
  billingExportReference: string | null
  releaseReportReference: string | null
}

export type ReleaseMutationResponse = {
  resource: ReleaseDetail
  result: MutationResult
}

type ReleaseManualOverridePayload = {
  used?: boolean
  status?: string | null
  reason_code?: string | null
  approval_actor_id?: string | null
  correlation_id?: string | null
  related_missing_or_failed_items?: string[]
  comment?: string | null
}

type ReadinessItemPayload = {
  item_id?: string
  owner_area?: string
  state?: string
  blocking?: boolean
  detail?: string
  required_action?: string | null
}

type ReleaseReadinessPayload = {
  agent_id?: string
  readiness_status?: string
  release_ready?: boolean
  gate_mode?: string | null
  blocking_item_count?: number
  items?: ReadinessItemPayload[]
  current_release_id?: string | null
  current_release_version?: number | null
  current_release_status?: string | null
  current_release_gate_mode?: string | null
  current_release_manual_override?: ReleaseManualOverridePayload | null
  active_release_present?: boolean
  active_release_id?: string | null
  active_release_version?: number | null
  active_release_status?: string | null
  active_release_gate_mode?: string | null
  active_release_manual_override?: ReleaseManualOverridePayload | null
  latest_release_id?: string | null
  latest_release_version?: number | null
  latest_release_status?: string | null
  latest_release_gate_mode?: string | null
  latest_release_manual_override?: ReleaseManualOverridePayload | null
  evaluation_evidence_owner_marker?: string
  publish_owner_marker?: string
}

type ReleaseListItemPayload = {
  release_id?: string
  release_version?: number
  status?: string
  gate_mode?: string
  active?: boolean
  selected_config_version?: number | null
  evidence_reference?: string | null
  manual_override_used?: boolean
  created_at?: string
}

type ReleaseDetailPayload = {
  release_id?: string
  tenant_id?: string
  agent_id?: string
  release_version?: number
  status?: string
  gate_mode?: string
  active?: boolean
  release_candidate_id?: string | null
  support_reconstruction_reference?: string | null
  created_at?: string
  updated_at?: string
  snapshot?: {
    selected_config?: { version?: number | null }
    release_candidate_id?: string | null
    support_reconstruction_reference?: string | null
    evaluation_evidence?: {
      stable_reference?: string | null
      passed?: boolean | null
      release_candidate_id?: string | null
      support_reconstruction_reference?: string | null
    } | null
    manual_override?: ReleaseManualOverridePayload | null
    readiness_checklist?: {
      items?: ReadinessItemPayload[]
      missing_or_failed_items?: ReadinessItemPayload[]
    }
  }
}

type ReleaseEvidenceSmokeCaseRequirementPayload = {
  case_id?: string
  required?: boolean
  grounded_reference_required?: boolean
  stable_reference_must_match_release_reference?: boolean
  label_key?: string
  description_key?: string
}

type ReleaseManualOverrideRequirementPayload = {
  allowed?: boolean
  blocked_reason?: string | null
  default_reason_code?: string | null
  related_missing_or_failed_items_default?: string[]
}

type ReleasePublishEvidenceRequirementPayload = {
  field?: string
  required?: boolean
  label_key?: string
  description_key?: string
}

type RuntimeProviderPreflightRequirementPayload = {
  provider_id?: string
  credential_key?: string
  credential_configured?: boolean
  secret_resolvable?: boolean
  state?: string
  required_action?: string | null
}

type RuntimeProviderPreflightPayload = {
  ready?: boolean
  requirements?: RuntimeProviderPreflightRequirementPayload[]
}

type ReleaseUsageEvidenceCandidatePayload = {
  chat_id?: string
  conversation_turn_id?: string
  model_request_id?: string
  created_at?: string
  turn_status?: string
  model_request_state?: string
  usage_recorded?: boolean
  agent_id?: string
  agent_config_id?: string | null
  widget_key?: string | null
  channel?: string | null
  display_label?: string
}

type ReleaseUsageEvidenceCandidateSummaryPayload = {
  candidate_count?: number
  ready?: boolean
  no_candidate_reason?: string | null
  message?: string
}

type ReleaseUsageEvidenceCandidatesPayload = {
  items?: ReleaseUsageEvidenceCandidatePayload[]
  summary?: ReleaseUsageEvidenceCandidateSummaryPayload
  no_candidate_reason?: string | null
  generated_at?: string | null
}

type ReleasePublishEvidenceBundlePayload = {
  bundle_id?: string
  display_label?: string
  readiness_status?: string
  recommended?: boolean
  release_id?: string
  release_version?: number
  release_status?: string
  release_active?: boolean
  selected_config_id?: string | null
  support_reconstruction_reference?: string | null
  usage_chat_id?: string | null
  usage_conversation_turn_id?: string | null
  usage_model_request_id?: string | null
  billing_export_reference?: string | null
  release_report_reference?: string | null
  retrieval_candidate_id?: string | null
  usage_candidate_id?: string | null
  blocking_reasons?: string[]
  technical_details?: Record<string, unknown>
}

type ReleasePublishEvidenceCandidateSummaryPayload = {
  candidate_count?: number
  ready?: boolean
  recommended_bundle_id?: string | null
  no_candidate_reason?: string | null
  message?: string
}

type ReleasePublishEvidenceCandidatesPayload = {
  agent_id?: string
  template_id?: string | null
  items?: ReleasePublishEvidenceBundlePayload[]
  summary?: ReleasePublishEvidenceCandidateSummaryPayload
  no_candidate_reason?: string | null
  generated_at?: string | null
}

type ReleaseRetrievalEvidenceCandidatePayload = {
  candidate_id?: string
  release_candidate_id?: string
  retrieval_run_id?: string
  stable_reference?: string
  support_reconstruction_reference?: string
  selected_config_id?: string
  outcome?: string
  source_ids?: string[]
  index_id?: string | null
  index_version_id?: string | null
  source_set_key?: string | null
  source_set_readiness_marker?: string | null
  selected_chunk_count?: number
  citation_count?: number
  created_at?: string
  status?: string
  problems?: string[]
}

type ReleaseRetrievalEvidenceCandidateSummaryPayload = {
  candidate_count?: number
  ready?: boolean
  no_candidate_reason?: string | null
  required_action?: string | null
  problems?: string[]
}

type ReleaseRetrievalEvidenceCandidatesPayload = {
  items?: ReleaseRetrievalEvidenceCandidatePayload[]
  summary?: ReleaseRetrievalEvidenceCandidateSummaryPayload
  no_candidate_reason?: string | null
  generated_at?: string | null
}

type ReleaseRetrievalEvidenceCandidateMutationPayload = {
  resource?: ReleaseRetrievalEvidenceCandidatePayload | null
  result?: MutationResultPayload
}

type ReleaseEvidenceRequirementsPayload = {
  agent_id?: string
  template_id?: string
  release_setup_ready?: boolean
  release_setup_blocking_items?: ReadinessItemPayload[]
  evidence_required?: boolean
  evidence_status?: string
  required_change_kind?: string | null
  stable_reference_rule?: string | null
  stable_reference_prefix?: string | null
  required_smoke_cases?: ReleaseEvidenceSmokeCaseRequirementPayload[]
  manual_override?: ReleaseManualOverrideRequirementPayload | null
  publish_evidence_requirements?: ReleasePublishEvidenceRequirementPayload[]
  publish_evidence_defaults?: {
    support_reconstruction_reference?: string | null
    usage_chat_id?: string | null
    usage_conversation_turn_id?: string | null
    usage_model_request_id?: string | null
    billing_export_reference?: string | null
    release_report_reference?: string | null
  } | null
  runtime_provider_preflight?: RuntimeProviderPreflightPayload | null
  last_checked_at?: string | null
  owner_stage?: string
}

type MutationResultPayload = {
  action?: string
  resource_type?: string
  resource_id?: string | null
  actor_id?: string | null
  actor_type?: string | null
  tenant_id?: string | null
  correlation_id?: string | null
  mutation_timestamp?: string
  changed_state_summary?: Record<string, unknown>
}

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function readNullableString(value: unknown) {
  return typeof value === 'string' ? value : null
}

function readNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' ? value : fallback
}

function readNullableNumber(value: unknown) {
  return typeof value === 'number' ? value : null
}

function readBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

function readNullableBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : null
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function mapMutationResult(payload: MutationResultPayload = {}): MutationResult {
  return {
    action: readString(payload.action),
    resourceType: readString(payload.resource_type),
    resourceId: readNullableString(payload.resource_id),
    actorId: readNullableString(payload.actor_id),
    actorType: readNullableString(payload.actor_type),
    tenantId: readNullableString(payload.tenant_id),
    correlationId: readNullableString(payload.correlation_id),
    mutationTimestamp: readString(payload.mutation_timestamp),
    changedStateSummary: payload.changed_state_summary ?? {},
  }
}

function mapManualOverride(payload: ReleaseManualOverridePayload | null | undefined): ReleaseManualOverride | null {
  if (!payload) return null
  return {
    used: readBoolean(payload.used),
    status: readNullableString(payload.status),
    reasonCode: readNullableString(payload.reason_code),
    approvalActorId: readNullableString(payload.approval_actor_id),
    correlationId: readNullableString(payload.correlation_id),
    relatedMissingOrFailedItems: readStringArray(payload.related_missing_or_failed_items),
    comment: readNullableString(payload.comment),
  }
}

function mapReadinessItem(payload: ReadinessItemPayload = {}): ReleaseReadinessItem {
  return {
    itemId: readString(payload.item_id),
    ownerArea: readString(payload.owner_area),
    state: readString(payload.state),
    blocking: readBoolean(payload.blocking),
    detail: readString(payload.detail),
    requiredAction: readNullableString(payload.required_action),
  }
}

export function mapReleaseReadiness(payload: ReleaseReadinessPayload = {}): ReleaseReadiness {
  return {
    agentId: readString(payload.agent_id),
    readinessStatus: readString(payload.readiness_status),
    releaseReady: readBoolean(payload.release_ready),
    gateMode: readNullableString(payload.gate_mode),
    blockingItemCount: readNumber(payload.blocking_item_count),
    items: payload.items?.map(mapReadinessItem) ?? [],
    currentReleaseId: readNullableString(payload.current_release_id),
    currentReleaseVersion: readNullableNumber(payload.current_release_version),
    currentReleaseStatus: readNullableString(payload.current_release_status),
    currentReleaseGateMode: readNullableString(payload.current_release_gate_mode),
    currentReleaseManualOverride: mapManualOverride(payload.current_release_manual_override),
    activeReleasePresent: readBoolean(payload.active_release_present),
    activeReleaseId: readNullableString(payload.active_release_id),
    activeReleaseVersion: readNullableNumber(payload.active_release_version),
    activeReleaseStatus: readNullableString(payload.active_release_status),
    activeReleaseGateMode: readNullableString(payload.active_release_gate_mode),
    activeReleaseManualOverride: mapManualOverride(payload.active_release_manual_override),
    latestReleaseId: readNullableString(payload.latest_release_id),
    latestReleaseVersion: readNullableNumber(payload.latest_release_version),
    latestReleaseStatus: readNullableString(payload.latest_release_status),
    latestReleaseGateMode: readNullableString(payload.latest_release_gate_mode),
    latestReleaseManualOverride: mapManualOverride(payload.latest_release_manual_override),
    evaluationEvidenceOwnerMarker: readString(payload.evaluation_evidence_owner_marker),
    publishOwnerMarker: readString(payload.publish_owner_marker),
  }
}

function mapListItem(payload: ReleaseListItemPayload = {}): ReleaseListItem {
  return {
    releaseId: readString(payload.release_id),
    releaseVersion: readNumber(payload.release_version),
    status: readString(payload.status),
    gateMode: readString(payload.gate_mode),
    active: readBoolean(payload.active),
    selectedConfigVersion: readNullableNumber(payload.selected_config_version),
    evidenceReference: readNullableString(payload.evidence_reference),
    manualOverrideUsed: readBoolean(payload.manual_override_used),
    createdAt: readString(payload.created_at),
  }
}

export function mapReleaseDetail(payload: ReleaseDetailPayload = {}): ReleaseDetail {
  const releaseCandidateId = readNullableString(payload.release_candidate_id)
    ?? readNullableString(payload.snapshot?.release_candidate_id)
    ?? readNullableString(payload.snapshot?.evaluation_evidence?.release_candidate_id)
  const supportReconstructionReference = readNullableString(payload.support_reconstruction_reference)
    ?? readNullableString(payload.snapshot?.support_reconstruction_reference)
    ?? readNullableString(payload.snapshot?.evaluation_evidence?.support_reconstruction_reference)
  return {
    releaseId: readString(payload.release_id),
    tenantId: readString(payload.tenant_id),
    agentId: readString(payload.agent_id),
    releaseVersion: readNumber(payload.release_version),
    status: readString(payload.status),
    gateMode: readString(payload.gate_mode),
    active: readBoolean(payload.active),
    createdAt: readString(payload.created_at),
    updatedAt: readString(payload.updated_at),
    selectedConfigVersion: readNullableNumber(payload.snapshot?.selected_config?.version),
    releaseCandidateId,
    evidenceReference: readNullableString(payload.snapshot?.evaluation_evidence?.stable_reference),
    supportReconstructionReference,
    evidencePassed: readNullableBoolean(payload.snapshot?.evaluation_evidence?.passed),
    manualOverride: mapManualOverride(payload.snapshot?.manual_override),
    readinessItems: payload.snapshot?.readiness_checklist?.items?.map(mapReadinessItem) ?? [],
    missingOrFailedItems: payload.snapshot?.readiness_checklist?.missing_or_failed_items?.map(mapReadinessItem) ?? [],
  }
}

function mapSmokeCaseRequirement(payload: ReleaseEvidenceSmokeCaseRequirementPayload = {}): ReleaseEvidenceSmokeCaseRequirement {
  return {
    caseId: readString(payload.case_id),
    required: readBoolean(payload.required),
    groundedReferenceRequired: readBoolean(payload.grounded_reference_required),
    stableReferenceMustMatchReleaseReference: readBoolean(payload.stable_reference_must_match_release_reference),
    labelKey: readString(payload.label_key),
    descriptionKey: readString(payload.description_key),
  }
}

function mapManualOverrideRequirement(payload: ReleaseManualOverrideRequirementPayload | null | undefined): ReleaseManualOverrideRequirement {
  return {
    allowed: readBoolean(payload?.allowed),
    blockedReason: readNullableString(payload?.blocked_reason),
    defaultReasonCode: readNullableString(payload?.default_reason_code),
    relatedMissingOrFailedItemsDefault: readStringArray(payload?.related_missing_or_failed_items_default),
  }
}

function mapPublishEvidenceRequirement(payload: ReleasePublishEvidenceRequirementPayload = {}): ReleasePublishEvidenceRequirement {
  return {
    field: readString(payload.field),
    required: readBoolean(payload.required),
    labelKey: readString(payload.label_key),
    descriptionKey: readString(payload.description_key),
  }
}

function mapRuntimeProviderPreflightRequirement(payload: RuntimeProviderPreflightRequirementPayload = {}): RuntimeProviderPreflightRequirement {
  return {
    providerId: readString(payload.provider_id),
    credentialKey: readString(payload.credential_key),
    credentialConfigured: readBoolean(payload.credential_configured),
    secretResolvable: readBoolean(payload.secret_resolvable),
    state: readString(payload.state),
    requiredAction: readNullableString(payload.required_action),
  }
}

function mapRuntimeProviderPreflight(payload: RuntimeProviderPreflightPayload | null | undefined): RuntimeProviderPreflight {
  return {
    available: Boolean(payload),
    ready: payload ? readBoolean(payload.ready) : false,
    requirements: payload?.requirements?.map(mapRuntimeProviderPreflightRequirement) ?? [],
  }
}

function mapReleaseUsageEvidenceCandidate(payload: ReleaseUsageEvidenceCandidatePayload = {}): ReleaseUsageEvidenceCandidate {
  return {
    chatId: readString(payload.chat_id),
    conversationTurnId: readString(payload.conversation_turn_id),
    modelRequestId: readString(payload.model_request_id),
    createdAt: readString(payload.created_at),
    turnStatus: readString(payload.turn_status),
    modelRequestState: readString(payload.model_request_state),
    usageRecorded: readBoolean(payload.usage_recorded),
    agentId: readString(payload.agent_id),
    agentConfigId: readNullableString(payload.agent_config_id),
    widgetKey: readNullableString(payload.widget_key),
    channel: readNullableString(payload.channel),
    displayLabel: readString(payload.display_label),
  }
}

export function mapReleaseUsageEvidenceCandidates(payload: ReleaseUsageEvidenceCandidatesPayload = {}): ReleaseUsageEvidenceCandidates {
  return {
    items: payload.items?.map(mapReleaseUsageEvidenceCandidate) ?? [],
    summary: {
      candidateCount: readNumber(payload.summary?.candidate_count),
      ready: readBoolean(payload.summary?.ready),
      noCandidateReason: readNullableString(payload.summary?.no_candidate_reason),
      message: readString(payload.summary?.message),
    },
    noCandidateReason: readNullableString(payload.no_candidate_reason),
    generatedAt: readNullableString(payload.generated_at),
  }
}

function mapReleasePublishEvidenceBundle(payload: ReleasePublishEvidenceBundlePayload = {}): ReleasePublishEvidenceBundle {
  return {
    bundleId: readString(payload.bundle_id),
    displayLabel: readString(payload.display_label),
    readinessStatus: readString(payload.readiness_status),
    recommended: readBoolean(payload.recommended),
    releaseId: readString(payload.release_id),
    releaseVersion: readNumber(payload.release_version),
    releaseStatus: readString(payload.release_status),
    releaseActive: readBoolean(payload.release_active),
    selectedConfigId: readNullableString(payload.selected_config_id),
    supportReconstructionReference: readNullableString(payload.support_reconstruction_reference),
    usageChatId: readNullableString(payload.usage_chat_id),
    usageConversationTurnId: readNullableString(payload.usage_conversation_turn_id),
    usageModelRequestId: readNullableString(payload.usage_model_request_id),
    billingExportReference: readNullableString(payload.billing_export_reference),
    releaseReportReference: readNullableString(payload.release_report_reference),
    retrievalCandidateId: readNullableString(payload.retrieval_candidate_id),
    usageCandidateId: readNullableString(payload.usage_candidate_id),
    blockingReasons: readStringArray(payload.blocking_reasons),
    technicalDetails: payload.technical_details ?? {},
  }
}

export function mapReleasePublishEvidenceCandidates(payload: ReleasePublishEvidenceCandidatesPayload = {}): ReleasePublishEvidenceCandidates {
  return {
    agentId: readString(payload.agent_id),
    templateId: readNullableString(payload.template_id),
    items: payload.items?.map(mapReleasePublishEvidenceBundle) ?? [],
    summary: {
      candidateCount: readNumber(payload.summary?.candidate_count),
      ready: readBoolean(payload.summary?.ready),
      recommendedBundleId: readNullableString(payload.summary?.recommended_bundle_id),
      noCandidateReason: readNullableString(payload.summary?.no_candidate_reason),
      message: readString(payload.summary?.message),
    },
    noCandidateReason: readNullableString(payload.no_candidate_reason),
    generatedAt: readNullableString(payload.generated_at),
  }
}

function mapReleaseRetrievalEvidenceCandidate(payload: ReleaseRetrievalEvidenceCandidatePayload = {}): ReleaseRetrievalEvidenceCandidate {
  return {
    candidateId: readString(payload.candidate_id),
    releaseCandidateId: readString(payload.release_candidate_id),
    retrievalRunId: readString(payload.retrieval_run_id),
    stableReference: readString(payload.stable_reference),
    supportReconstructionReference: readString(payload.support_reconstruction_reference),
    selectedConfigId: readString(payload.selected_config_id),
    outcome: readString(payload.outcome),
    sourceIds: readStringArray(payload.source_ids),
    indexId: readNullableString(payload.index_id),
    indexVersionId: readNullableString(payload.index_version_id),
    sourceSetKey: readNullableString(payload.source_set_key),
    sourceSetReadinessMarker: readNullableString(payload.source_set_readiness_marker),
    selectedChunkCount: readNumber(payload.selected_chunk_count),
    citationCount: readNumber(payload.citation_count),
    createdAt: readString(payload.created_at),
    status: readString(payload.status),
    problems: readStringArray(payload.problems),
  }
}

export function mapReleaseRetrievalEvidenceCandidates(payload: ReleaseRetrievalEvidenceCandidatesPayload = {}): ReleaseRetrievalEvidenceCandidates {
  return {
    items: payload.items?.map(mapReleaseRetrievalEvidenceCandidate) ?? [],
    summary: {
      candidateCount: readNumber(payload.summary?.candidate_count),
      ready: readBoolean(payload.summary?.ready),
      noCandidateReason: readNullableString(payload.summary?.no_candidate_reason),
      requiredAction: readNullableString(payload.summary?.required_action),
      problems: readStringArray(payload.summary?.problems),
    },
    noCandidateReason: readNullableString(payload.no_candidate_reason),
    generatedAt: readNullableString(payload.generated_at),
  }
}

function mapReleaseRetrievalEvidenceCandidateMutation(payload: ReleaseRetrievalEvidenceCandidateMutationPayload = {}): ReleaseRetrievalEvidenceCandidates {
  const candidate = payload.resource ? mapReleaseRetrievalEvidenceCandidate(payload.resource) : null

  return {
    items: candidate ? [candidate] : [],
    summary: {
      candidateCount: candidate ? 1 : 0,
      ready: Boolean(candidate),
      noCandidateReason: candidate ? null : 'candidate_generation_failed',
      requiredAction: null,
      problems: [],
    },
    noCandidateReason: candidate ? null : 'candidate_generation_failed',
    generatedAt: candidate?.createdAt ?? null,
  }
}

export function mapReleaseEvidenceRequirements(payload: ReleaseEvidenceRequirementsPayload = {}): ReleaseEvidenceRequirements {
  return {
    agentId: readString(payload.agent_id),
    templateId: readString(payload.template_id),
    releaseSetupReady: readBoolean(payload.release_setup_ready),
    releaseSetupBlockingItems: payload.release_setup_blocking_items?.map(mapReadinessItem) ?? [],
    evidenceRequired: readBoolean(payload.evidence_required),
    evidenceStatus: readString(payload.evidence_status),
    requiredChangeKind: readNullableString(payload.required_change_kind),
    stableReferenceRule: readNullableString(payload.stable_reference_rule),
    stableReferencePrefix: readNullableString(payload.stable_reference_prefix),
    requiredSmokeCases: payload.required_smoke_cases?.map(mapSmokeCaseRequirement) ?? [],
    manualOverride: mapManualOverrideRequirement(payload.manual_override),
    publishEvidenceRequirements: payload.publish_evidence_requirements?.map(mapPublishEvidenceRequirement) ?? [],
    publishEvidenceDefaults: {
      supportReconstructionReference: readNullableString(payload.publish_evidence_defaults?.support_reconstruction_reference),
      usageChatId: readNullableString(payload.publish_evidence_defaults?.usage_chat_id),
      usageConversationTurnId: readNullableString(payload.publish_evidence_defaults?.usage_conversation_turn_id),
      usageModelRequestId: readNullableString(payload.publish_evidence_defaults?.usage_model_request_id),
      billingExportReference: readNullableString(payload.publish_evidence_defaults?.billing_export_reference),
      releaseReportReference: readNullableString(payload.publish_evidence_defaults?.release_report_reference),
    },
    runtimeProviderPreflight: mapRuntimeProviderPreflight(payload.runtime_provider_preflight),
    lastCheckedAt: readNullableString(payload.last_checked_at),
    ownerStage: readString(payload.owner_stage),
  }
}

function toEvidencePayload(input: ReleaseEvidenceInput | null) {
  if (!input) return null
  return {
    change_kind: input.changeKind,
    stable_reference: input.stableReference,
    passed: input.passed,
    smoke_cases: input.smokeCases.map((smokeCase) => ({
      case_id: smokeCase.caseId,
      passed: smokeCase.passed,
      stable_reference: smokeCase.stableReference,
      outcome: smokeCase.outcome,
    })),
  }
}

function toManualOverridePayload(input: ReleaseManualOverrideInput | null) {
  if (!input) return null
  return {
    reason_code: input.reasonCode,
    related_missing_or_failed_items: input.relatedMissingOrFailedItems,
    comment: input.comment,
  }
}

function toPublishEvidencePayload(input: PublishEvidenceInput | null) {
  if (!input) return null
  return {
    support_reconstruction_reference: input.supportReconstructionReference,
    usage_chat_id: input.usageChatId,
    usage_conversation_turn_id: input.usageConversationTurnId,
    usage_model_request_id: input.usageModelRequestId,
    billing_export_reference: input.billingExportReference,
    release_report_reference: input.releaseReportReference,
  }
}

export const releasesApi = {
  async getReadiness(tenantId: string, agentId: string): Promise<ReleaseReadiness> {
    const response = await apiClient.get<ReleaseReadinessPayload>(`${PORTAL_PREFIX}/tenants/${tenantId}/agents/${agentId}/release-readiness`)
    return mapReleaseReadiness(response.data)
  },

  async getEvidenceRequirements(tenantId: string, agentId: string): Promise<ReleaseEvidenceRequirements> {
    const response = await apiClient.get<ReleaseEvidenceRequirementsPayload>(`${PORTAL_PREFIX}/tenants/${tenantId}/agents/${agentId}/release-evidence-requirements`)
    return mapReleaseEvidenceRequirements(response.data)
  },

  async getUsageEvidenceCandidates(tenantId: string, agentId: string): Promise<ReleaseUsageEvidenceCandidates> {
    const response = await apiClient.get<ReleaseUsageEvidenceCandidatesPayload>(`${PORTAL_PREFIX}/tenants/${tenantId}/agents/${agentId}/release-usage-evidence-candidates`)
    return mapReleaseUsageEvidenceCandidates(response.data)
  },

  async getPublishEvidenceCandidates(tenantId: string, agentId: string, releaseId?: string | null): Promise<ReleasePublishEvidenceCandidates> {
    const response = await apiClient.get<ReleasePublishEvidenceCandidatesPayload>(
      `${PORTAL_PREFIX}/tenants/${tenantId}/agents/${agentId}/release-publish-evidence-candidates`,
      { params: releaseId ? { release_id: releaseId } : undefined },
    )
    return mapReleasePublishEvidenceCandidates(response.data)
  },

  async getRetrievalEvidenceCandidates(tenantId: string, agentId: string): Promise<ReleaseRetrievalEvidenceCandidates> {
    const response = await apiClient.get<ReleaseRetrievalEvidenceCandidatesPayload>(`${PORTAL_PREFIX}/tenants/${tenantId}/agents/${agentId}/release-retrieval-evidence-candidates`)
    return mapReleaseRetrievalEvidenceCandidates(response.data)
  },

  async createRetrievalEvidenceCandidate(tenantId: string, agentId: string, input: CreateReleaseRetrievalEvidenceCandidateInput): Promise<ReleaseRetrievalEvidenceCandidates> {
    const response = await apiClient.post<ReleaseRetrievalEvidenceCandidateMutationPayload>(
      `${ADMIN_PREFIX}/tenants/${tenantId}/agents/${agentId}/release-retrieval-evidence-candidates`,
      {
        selected_config_id: input.selectedConfigId,
        release_candidate_id: input.releaseCandidateId,
        idempotency_key: input.idempotencyKey,
      },
    )
    return mapReleaseRetrievalEvidenceCandidateMutation(response.data)
  },

  async listReleases(tenantId: string, agentId: string): Promise<ReleaseListItem[]> {
    const response = await apiClient.get<{ items?: ReleaseListItemPayload[] }>(`${ADMIN_PREFIX}/tenants/${tenantId}/agents/${agentId}/releases`)
    return response.data.items?.map(mapListItem) ?? []
  },

  async getRelease(tenantId: string, agentId: string, releaseId: string): Promise<ReleaseDetail> {
    const response = await apiClient.get<ReleaseDetailPayload>(`${ADMIN_PREFIX}/tenants/${tenantId}/agents/${agentId}/releases/${releaseId}`)
    return mapReleaseDetail(response.data)
  },

  async createRelease(tenantId: string, agentId: string, input: ReleaseCreateInput): Promise<ReleaseMutationResponse> {
    const response = await apiClient.post<{ resource?: ReleaseDetailPayload; result?: MutationResultPayload }>(
      `${ADMIN_PREFIX}/tenants/${tenantId}/agents/${agentId}/releases`,
      {
        selected_config_id: input.selectedConfigId,
        release_candidate_id: input.releaseCandidateId,
        evidence: toEvidencePayload(input.evidence),
        manual_override: toManualOverridePayload(input.manualOverride),
      },
    )
    return {
      resource: mapReleaseDetail(response.data.resource),
      result: mapMutationResult(response.data.result),
    }
  },

  async publishRelease(tenantId: string, agentId: string, releaseId: string, input: PublishEvidenceInput | null): Promise<ReleaseMutationResponse> {
    const response = await apiClient.post<{ resource?: ReleaseDetailPayload; result?: MutationResultPayload }>(
      `${ADMIN_PREFIX}/tenants/${tenantId}/agents/${agentId}/releases/${releaseId}/publish`,
      toPublishEvidencePayload(input),
    )
    return {
      resource: mapReleaseDetail(response.data.resource),
      result: mapMutationResult(response.data.result),
    }
  },

  async rollbackRelease(tenantId: string, agentId: string, releaseId: string): Promise<ReleaseMutationResponse> {
    const response = await apiClient.post<{ resource?: ReleaseDetailPayload; result?: MutationResultPayload }>(
      `${ADMIN_PREFIX}/tenants/${tenantId}/agents/${agentId}/releases/${releaseId}/rollback`,
    )
    return {
      resource: mapReleaseDetail(response.data.resource),
      result: mapMutationResult(response.data.result),
    }
  },

  async disableRelease(tenantId: string, agentId: string, releaseId: string): Promise<ReleaseMutationResponse> {
    const response = await apiClient.post<{ resource?: ReleaseDetailPayload; result?: MutationResultPayload }>(
      `${ADMIN_PREFIX}/tenants/${tenantId}/agents/${agentId}/releases/${releaseId}/disable`,
    )
    return {
      resource: mapReleaseDetail(response.data.resource),
      result: mapMutationResult(response.data.result),
    }
  },
}
