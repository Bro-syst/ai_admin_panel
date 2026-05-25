import { apiClient } from '@/core/api/apiClient'

const ADMIN_PREFIX = '/api/admin/v1'
const PORTAL_PREFIX = `${ADMIN_PREFIX}/portal`

export type UsageMeteringSummary = {
  agentIdOptional: string | null
  tenantId: string
  windowStart: string
  windowEnd: string
  requestCount: number
  totalInputTokens: number
  totalOutputTokens: number
  totalTokens: number
  tokenTotals: Record<string, number>
  modelBreakdown: Record<string, unknown>[]
  billableActivitySummary: Record<string, unknown>
  nonBillableClassificationSummary: Record<string, unknown>
  linkedChatTurnRequestRefs: string[]
  billingOwnerMarker: string
  billingOwnerStage: string
  exportStatusPreview: string
}

export type BillingExportStatus = {
  tenantId: string
  externalBillingRef: string | null
  pendingCount: number
  exportedCount: number
  failedCount: number
  retryScheduledCount: number
  reconciledCount: number
  stage25OwnerMarker: string
  lastExportAttemptAt: string | null
  ownerStage: string
  exportStatus: string
  currentState: string
  externalBillingRefPresent: boolean
  invoiceLogicExposed: boolean
  paymentLogicExposed: boolean
  lastExportedAt: string | null
}

export type ModelUsageSummary = {
  tenantId: string
  windowStart: string
  windowEnd: string
  anchorKind: string
  anchorId: string | null
  totalRecords: number
  requestCount: number
  totalInputTokens: number
  totalOutputTokens: number
  totalTokens: number
}

export type ModelUsage = {
  id: string
  tenantId: string
  modelRequestId: string
  modelResponseId: string | null
  inputTokens: number
  outputTokens: number
  totalTokens: number
  createdAt: string
}

export type BillingExportActivityPayload = {
  coreTenantId: string
  tenantId: string
  externalBillingRef: string | null
  agentId: string | null
  agentReleaseId: string | null
  agentConfigId: string | null
  billableActivityId: string
  activityType: string
  unit: string
  billableUnit: string
  quantity: number
  occurredAt: string
  channelSource: string | null
  siteId: string | null
  widgetId: string | null
  chatId: string | null
  externalChatSessionBindingId: string | null
  conversationTurnId: string | null
  modelRequestId: string | null
  modelUsageId: string | null
  sourceArtifactKind: string
  sourceArtifactId: string
  sourceEventId: string | null
  correlationId: string
  idempotencyKey: string
  exportState: string
  exportBatchRef: string
  exportRequestId: string
}

export type BillingExportBatch = {
  tenantId: string
  exportBatchRef: string
  exportRequestId: string
  exportState: string
  itemCount: number
  payloads: BillingExportActivityPayload[]
  eventTypes: string[]
  replayClassification: string
  retrySafe: boolean
  directRuntimeDbAccessRequired: boolean
  invoiceLogicExposed: boolean
  paymentLogicExposed: boolean
}

export type UsageSummaryInput = {
  windowStart: string
  windowEnd: string
  modelRequestId?: string | null
  chatId?: string | null
  conversationTurnId?: string | null
}

export type BillingExportBatchInput = {
  idempotencyKey: string
  billableActivityIds: string[]
  includeFailed: boolean
  limit: number
}

export type BillingExportFailureInput = {
  idempotencyKey: string
  billableActivityIds: string[]
  failureCode: string
  failureReason: string | null
}

export type BillingExportRetryInput = {
  idempotencyKey: string
  billableActivityIds: string[]
}

export type BillingExportReconciliationInput = {
  idempotencyKey: string
  billableActivityIds: string[]
  reconciliationReference: string
}

type UsageMeteringSummaryPayload = {
  agent_id_optional?: string | null
  tenant_id?: string
  window_start?: string
  window_end?: string
  request_count?: number
  total_input_tokens?: number
  total_output_tokens?: number
  total_tokens?: number
  token_totals?: Record<string, number>
  model_breakdown?: Record<string, unknown>[]
  billable_activity_summary?: Record<string, unknown>
  non_billable_classification_summary?: Record<string, unknown>
  linked_chat_turn_request_refs?: string[]
  billing_owner_marker?: string
  billing_owner_stage?: string
  export_status_preview?: string
}

type BillingExportStatusPayload = {
  tenant_id?: string
  external_billing_ref?: string | null
  pending_count?: number
  exported_count?: number
  failed_count?: number
  retry_scheduled_count?: number
  reconciled_count?: number
  stage25_owner_marker?: string
  last_export_attempt_at?: string | null
  owner_stage?: string
  export_status?: string
  current_state?: string
  external_billing_ref_present?: boolean
  invoice_logic_exposed?: boolean
  payment_logic_exposed?: boolean
  last_exported_at?: string | null
}

type ModelUsageSummaryPayload = {
  tenant_id?: string
  window_start?: string
  window_end?: string
  anchor_kind?: string
  anchor_id?: string | null
  total_records?: number
  request_count?: number
  total_input_tokens?: number
  total_output_tokens?: number
  total_tokens?: number
}

type ModelUsagePayload = {
  id?: string
  tenant_id?: string
  model_request_id?: string
  model_response_id?: string | null
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
  created_at?: string
}

type BillingExportActivityPayloadSnapshot = {
  core_tenant_id?: string
  tenant_id?: string
  external_billing_ref?: string | null
  agent_id?: string | null
  agent_release_id?: string | null
  agent_config_id?: string | null
  billable_activity_id?: string
  activity_type?: string
  unit?: string
  billable_unit?: string
  quantity?: number
  occurred_at?: string
  channel_source?: string | null
  site_id?: string | null
  widget_id?: string | null
  chat_id?: string | null
  external_chat_session_binding_id?: string | null
  conversation_turn_id?: string | null
  model_request_id?: string | null
  model_usage_id?: string | null
  source_artifact_kind?: string
  source_artifact_id?: string
  source_event_id?: string | null
  correlation_id?: string
  idempotency_key?: string
  export_state?: string
  export_batch_ref?: string
  export_request_id?: string
}

type BillingExportBatchPayload = {
  tenant_id?: string
  export_batch_ref?: string
  export_request_id?: string
  export_state?: string
  item_count?: number
  payloads?: BillingExportActivityPayloadSnapshot[]
  event_types?: string[]
  replay_classification?: string
  retry_safe?: boolean
  direct_runtime_db_access_required?: boolean
  invoice_logic_exposed?: boolean
  payment_logic_exposed?: boolean
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

function readBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function readRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
}

function readRecordArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item)) : []
}

function readNumberRecord(value: unknown) {
  const record = readRecord(value)
  return Object.fromEntries(
    Object.entries(record).filter((entry): entry is [string, number] => typeof entry[1] === 'number'),
  )
}

function mapUsageMeteringSummary(payload: UsageMeteringSummaryPayload = {}): UsageMeteringSummary {
  return {
    agentIdOptional: readNullableString(payload.agent_id_optional),
    tenantId: readString(payload.tenant_id),
    windowStart: readString(payload.window_start),
    windowEnd: readString(payload.window_end),
    requestCount: readNumber(payload.request_count),
    totalInputTokens: readNumber(payload.total_input_tokens),
    totalOutputTokens: readNumber(payload.total_output_tokens),
    totalTokens: readNumber(payload.total_tokens),
    tokenTotals: readNumberRecord(payload.token_totals),
    modelBreakdown: readRecordArray(payload.model_breakdown),
    billableActivitySummary: readRecord(payload.billable_activity_summary),
    nonBillableClassificationSummary: readRecord(payload.non_billable_classification_summary),
    linkedChatTurnRequestRefs: readStringArray(payload.linked_chat_turn_request_refs),
    billingOwnerMarker: readString(payload.billing_owner_marker),
    billingOwnerStage: readString(payload.billing_owner_stage),
    exportStatusPreview: readString(payload.export_status_preview),
  }
}

function mapBillingExportStatus(payload: BillingExportStatusPayload = {}): BillingExportStatus {
  return {
    tenantId: readString(payload.tenant_id),
    externalBillingRef: readNullableString(payload.external_billing_ref),
    pendingCount: readNumber(payload.pending_count),
    exportedCount: readNumber(payload.exported_count),
    failedCount: readNumber(payload.failed_count),
    retryScheduledCount: readNumber(payload.retry_scheduled_count),
    reconciledCount: readNumber(payload.reconciled_count),
    stage25OwnerMarker: readString(payload.stage25_owner_marker),
    lastExportAttemptAt: readNullableString(payload.last_export_attempt_at),
    ownerStage: readString(payload.owner_stage),
    exportStatus: readString(payload.export_status, 'unknown'),
    currentState: readString(payload.current_state, 'unknown'),
    externalBillingRefPresent: readBoolean(payload.external_billing_ref_present),
    invoiceLogicExposed: readBoolean(payload.invoice_logic_exposed),
    paymentLogicExposed: readBoolean(payload.payment_logic_exposed),
    lastExportedAt: readNullableString(payload.last_exported_at),
  }
}

function mapModelUsageSummary(payload: ModelUsageSummaryPayload = {}): ModelUsageSummary {
  return {
    tenantId: readString(payload.tenant_id),
    windowStart: readString(payload.window_start),
    windowEnd: readString(payload.window_end),
    anchorKind: readString(payload.anchor_kind),
    anchorId: readNullableString(payload.anchor_id),
    totalRecords: readNumber(payload.total_records),
    requestCount: readNumber(payload.request_count),
    totalInputTokens: readNumber(payload.total_input_tokens),
    totalOutputTokens: readNumber(payload.total_output_tokens),
    totalTokens: readNumber(payload.total_tokens),
  }
}

function mapModelUsage(payload: ModelUsagePayload = {}): ModelUsage {
  return {
    id: readString(payload.id),
    tenantId: readString(payload.tenant_id),
    modelRequestId: readString(payload.model_request_id),
    modelResponseId: readNullableString(payload.model_response_id),
    inputTokens: readNumber(payload.input_tokens),
    outputTokens: readNumber(payload.output_tokens),
    totalTokens: readNumber(payload.total_tokens),
    createdAt: readString(payload.created_at),
  }
}

function mapBillingPayload(payload: BillingExportActivityPayloadSnapshot = {}): BillingExportActivityPayload {
  return {
    coreTenantId: readString(payload.core_tenant_id),
    tenantId: readString(payload.tenant_id),
    externalBillingRef: readNullableString(payload.external_billing_ref),
    agentId: readNullableString(payload.agent_id),
    agentReleaseId: readNullableString(payload.agent_release_id),
    agentConfigId: readNullableString(payload.agent_config_id),
    billableActivityId: readString(payload.billable_activity_id),
    activityType: readString(payload.activity_type),
    unit: readString(payload.unit),
    billableUnit: readString(payload.billable_unit),
    quantity: readNumber(payload.quantity),
    occurredAt: readString(payload.occurred_at),
    channelSource: readNullableString(payload.channel_source),
    siteId: readNullableString(payload.site_id),
    widgetId: readNullableString(payload.widget_id),
    chatId: readNullableString(payload.chat_id),
    externalChatSessionBindingId: readNullableString(payload.external_chat_session_binding_id),
    conversationTurnId: readNullableString(payload.conversation_turn_id),
    modelRequestId: readNullableString(payload.model_request_id),
    modelUsageId: readNullableString(payload.model_usage_id),
    sourceArtifactKind: readString(payload.source_artifact_kind),
    sourceArtifactId: readString(payload.source_artifact_id),
    sourceEventId: readNullableString(payload.source_event_id),
    correlationId: readString(payload.correlation_id),
    idempotencyKey: readString(payload.idempotency_key),
    exportState: readString(payload.export_state),
    exportBatchRef: readString(payload.export_batch_ref),
    exportRequestId: readString(payload.export_request_id),
  }
}

function mapBillingExportBatch(payload: BillingExportBatchPayload = {}): BillingExportBatch {
  return {
    tenantId: readString(payload.tenant_id),
    exportBatchRef: readString(payload.export_batch_ref),
    exportRequestId: readString(payload.export_request_id),
    exportState: readString(payload.export_state, 'unknown'),
    itemCount: readNumber(payload.item_count),
    payloads: Array.isArray(payload.payloads) ? payload.payloads.map(mapBillingPayload) : [],
    eventTypes: readStringArray(payload.event_types),
    replayClassification: readString(payload.replay_classification),
    retrySafe: readBoolean(payload.retry_safe),
    directRuntimeDbAccessRequired: readBoolean(payload.direct_runtime_db_access_required),
    invoiceLogicExposed: readBoolean(payload.invoice_logic_exposed),
    paymentLogicExposed: readBoolean(payload.payment_logic_exposed),
  }
}

export const usageBillingApi = {
  async getUsageMeteringSummary(tenantId: string, filters: { windowStart?: string; windowEnd?: string; agentId?: string } = {}) {
    const response = await apiClient.get<UsageMeteringSummaryPayload>(`${PORTAL_PREFIX}/tenants/${tenantId}/usage-metering`, {
      params: {
        ...(filters.windowStart ? { window_start: filters.windowStart } : {}),
        ...(filters.windowEnd ? { window_end: filters.windowEnd } : {}),
        ...(filters.agentId ? { agent_id: filters.agentId } : {}),
      },
    })
    return mapUsageMeteringSummary(response.data)
  },

  async getBillingExportStatus(tenantId: string) {
    const response = await apiClient.get<BillingExportStatusPayload>(`${PORTAL_PREFIX}/tenants/${tenantId}/billing-export`)
    return mapBillingExportStatus(response.data)
  },

  async summarizeUsage(tenantId: string, input: UsageSummaryInput) {
    const response = await apiClient.get<ModelUsageSummaryPayload>(`${ADMIN_PREFIX}/tenants/${tenantId}/usage/summary`, {
      params: {
        window_start: input.windowStart,
        window_end: input.windowEnd,
        ...(input.modelRequestId ? { model_request_id: input.modelRequestId } : {}),
        ...(input.chatId ? { chat_id: input.chatId } : {}),
        ...(input.conversationTurnId ? { conversation_turn_id: input.conversationTurnId } : {}),
      },
    })
    return mapModelUsageSummary(response.data)
  },

  async getUsage(tenantId: string, usageId: string) {
    const response = await apiClient.get<ModelUsagePayload>(`${ADMIN_PREFIX}/tenants/${tenantId}/usage/${usageId}`)
    return mapModelUsage(response.data)
  },

  async listUsageForChat(tenantId: string, chatId: string) {
    const response = await apiClient.get<{ items?: ModelUsagePayload[] }>(`${ADMIN_PREFIX}/tenants/${tenantId}/usage/chats/${chatId}`)
    return Array.isArray(response.data.items) ? response.data.items.map(mapModelUsage) : []
  },

  async listUsageForConversationTurn(tenantId: string, conversationTurnId: string) {
    const response = await apiClient.get<{ items?: ModelUsagePayload[] }>(`${ADMIN_PREFIX}/tenants/${tenantId}/usage/conversation-turns/${conversationTurnId}`)
    return Array.isArray(response.data.items) ? response.data.items.map(mapModelUsage) : []
  },

  async listUsageForModelRequest(tenantId: string, modelRequestId: string) {
    const response = await apiClient.get<{ items?: ModelUsagePayload[] }>(`${ADMIN_PREFIX}/tenants/${tenantId}/usage/model-requests/${modelRequestId}`)
    return Array.isArray(response.data.items) ? response.data.items.map(mapModelUsage) : []
  },

  async exportBillingBatch(tenantId: string, input: BillingExportBatchInput) {
    const response = await apiClient.post<BillingExportBatchPayload>(`${ADMIN_PREFIX}/tenants/${tenantId}/billing/export-batches`, {
      idempotency_key: input.idempotencyKey,
      billable_activity_ids: input.billableActivityIds,
      include_failed: input.includeFailed,
      limit: input.limit,
    })
    return mapBillingExportBatch(response.data)
  },

  async markExportFailure(tenantId: string, input: BillingExportFailureInput) {
    const response = await apiClient.post<BillingExportBatchPayload>(`${ADMIN_PREFIX}/tenants/${tenantId}/billing/export-failures`, {
      idempotency_key: input.idempotencyKey,
      billable_activity_ids: input.billableActivityIds,
      failure_code: input.failureCode,
      failure_reason: input.failureReason,
    })
    return mapBillingExportBatch(response.data)
  },

  async scheduleExportRetry(tenantId: string, input: BillingExportRetryInput) {
    const response = await apiClient.post<BillingExportBatchPayload>(`${ADMIN_PREFIX}/tenants/${tenantId}/billing/export-retries`, {
      idempotency_key: input.idempotencyKey,
      billable_activity_ids: input.billableActivityIds,
    })
    return mapBillingExportBatch(response.data)
  },

  async reconcileExport(tenantId: string, input: BillingExportReconciliationInput) {
    const response = await apiClient.post<BillingExportBatchPayload>(`${ADMIN_PREFIX}/tenants/${tenantId}/billing/reconciliations`, {
      idempotency_key: input.idempotencyKey,
      billable_activity_ids: input.billableActivityIds,
      reconciliation_reference: input.reconciliationReference,
    })
    return mapBillingExportBatch(response.data)
  },
}
