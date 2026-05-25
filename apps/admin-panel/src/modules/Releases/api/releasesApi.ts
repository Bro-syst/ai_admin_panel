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
  evidenceReference: string | null
  evidencePassed: boolean | null
  manualOverride: ReleaseManualOverride | null
  readinessItems: ReleaseReadinessItem[]
  missingOrFailedItems: ReleaseReadinessItem[]
}

export type ReleaseEvidenceInput = {
  changeKind: string
  stableReference: string
  passed: boolean
  smokeCaseId: string
  smokeCasePassed: boolean
  smokeCaseReference: string | null
  smokeCaseOutcome: string | null
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
  created_at?: string
  updated_at?: string
  snapshot?: {
    selected_config?: { version?: number | null }
    evaluation_evidence?: { stable_reference?: string | null; passed?: boolean | null } | null
    manual_override?: ReleaseManualOverridePayload | null
    readiness_checklist?: {
      items?: ReadinessItemPayload[]
      missing_or_failed_items?: ReadinessItemPayload[]
    }
  }
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
    evidenceReference: readNullableString(payload.snapshot?.evaluation_evidence?.stable_reference),
    evidencePassed: readNullableBoolean(payload.snapshot?.evaluation_evidence?.passed),
    manualOverride: mapManualOverride(payload.snapshot?.manual_override),
    readinessItems: payload.snapshot?.readiness_checklist?.items?.map(mapReadinessItem) ?? [],
    missingOrFailedItems: payload.snapshot?.readiness_checklist?.missing_or_failed_items?.map(mapReadinessItem) ?? [],
  }
}

function toEvidencePayload(input: ReleaseEvidenceInput | null) {
  if (!input) return null
  return {
    change_kind: input.changeKind,
    stable_reference: input.stableReference,
    passed: input.passed,
    smoke_cases: input.smokeCaseId
      ? [{
          case_id: input.smokeCaseId,
          passed: input.smokeCasePassed,
          stable_reference: input.smokeCaseReference,
          outcome: input.smokeCaseOutcome,
        }]
      : [],
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
