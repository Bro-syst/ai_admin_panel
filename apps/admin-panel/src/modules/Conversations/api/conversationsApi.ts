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

export type ConversationTurnSummary = {
  totalTurns: number
  failedTurns: number
  actionTurns: number
  latestFailureClassification: string | null
  latestActionClassification: string | null
}

export type ConversationMemorySummary = {
  availabilityStatus: string
  updateClassification: string | null
  updateReasonClassification: string | null
  resultingSnapshotRevision: number | null
  resultingCoveredMessageCount: number | null
  resultingLastAppliedTurnId: string | null
}

export type ConversationRequestSummary = {
  requestCount: number
  inputTokens: number
  outputTokens: number
  totalTokens: number
  anchorKind: string | null
  windowStart: string | null
  windowEnd: string | null
}

export type ConversationRuntimeItem = {
  chatId: string
  tenantId: string
  agentId: string | null
  chatStatus: string
  startedAt: string | null
  lastActivityAt: string | null
  redactedMessagePreview: string | null
  turnSummary: ConversationTurnSummary | null
  currentMemorySummary: ConversationMemorySummary | null
  requestSummary: ConversationRequestSummary | null
  correlationRefs: string[]
  boundedPolicyOrRetrievalOutcomeRefsWhereAvailable: string[]
  openedAt: string | null
  lastMessageAt: string | null
  turnCount: number
  failedTurnCount: number
  actionTurnCount: number
  latestFailureClassification: string | null
  latestActionClassification: string | null
}

export type ConversationRuntimeSummary = {
  tenantId: string
  totalChats: number
  activeChats: number
  closedChats: number
  totalTurns: number
  failedTurns: number
  actionTurns: number
  redactedMessageCount: number
  items: ConversationRuntimeItem[]
  metadata: Record<string, unknown>
}

export type Chat = {
  id: string
  tenantId: string
  agentId: string | null
  status: string
  openedAt: string | null
  lastMessageAt: string | null
  closedAt: string | null
}

export type Message = {
  id: string
  tenantId: string
  chatId: string
  source: string
  messageType: string
  sequenceNumber: number | null
  contentText: string | null
  createdAt: string | null
}

export type ConversationTurn = {
  id: string
  tenantId: string
  chatId: string
  agentId: string | null
  inboundMessageId: string | null
  outboundMessageId: string | null
  source: string | null
  status: string
  correlationId: string | null
  idempotencyKey: string | null
  requestFingerprint: string | null
  modelRequestId: string | null
  failureClassification: string | null
  actionClass: string | null
  workflowIdentity: string | null
  hasContextSnapshot: boolean
  hasRuntimeSnapshot: boolean
  hasMemorySnapshot: boolean
  createdAt: string | null
  updatedAt: string | null
}

export type ChatMemorySnapshot = {
  id: string
  tenantId: string
  chatId: string
  revision: number | null
  policyProfile: string | null
  summaryText: string | null
  coveredMessageCount: number | null
  coveredFromSequence: number | null
  coveredToSequence: number | null
  lastAppliedTurnId: string | null
  createdAt: string | null
  updatedAt: string | null
}

export type ChatMutationResponse = {
  resource: Chat
  result: MutationResult
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

type RuntimeSummaryPayload = {
  tenant_id?: string
  total_chats?: number
  active_chats?: number
  closed_chats?: number
  total_turns?: number
  failed_turns?: number
  action_turns?: number
  redacted_message_count?: number
  items?: RuntimeItemPayload[]
  metadata?: Record<string, unknown>
}

type RuntimeItemPayload = {
  chat_id?: string
  tenant_id?: string
  agent_id?: string | null
  chat_status?: string
  started_at?: string | null
  last_activity_at?: string | null
  redacted_message_preview?: string | null
  turn_summary?: TurnSummaryPayload | null
  current_memory_summary?: MemorySummaryPayload | null
  usage_summary?: RequestSummaryPayload | null
  correlation_refs?: string[]
  bounded_policy_or_retrieval_outcome_refs_where_available?: string[]
  opened_at?: string | null
  last_message_at?: string | null
  turn_count?: number
  failed_turn_count?: number
  action_turn_count?: number
  latest_failure_classification?: string | null
  latest_action_classification?: string | null
}

type TurnSummaryPayload = {
  total_turns?: number
  failed_turns?: number
  action_turns?: number
  latest_failure_classification?: string | null
  latest_action_classification?: string | null
}

type MemorySummaryPayload = {
  availability_status?: string
  update_classification?: string | null
  update_reason_classification?: string | null
  resulting_snapshot_revision?: number | null
  resulting_covered_message_count?: number | null
  resulting_last_applied_turn_id?: string | null
}

type RequestSummaryPayload = {
  request_count?: number
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
  anchor_kind?: string | null
  window_start?: string | null
  window_end?: string | null
}

type ChatPayload = {
  id?: string
  tenant_id?: string
  agent_id?: string | null
  status?: string
  opened_at?: string | null
  last_message_at?: string | null
  closed_at?: string | null
}

type MessagePayload = {
  id?: string
  tenant_id?: string
  chat_id?: string
  source?: string
  message_type?: string
  sequence_number?: number | null
  content_text?: string | null
  created_at?: string | null
}

type ConversationTurnPayload = {
  id?: string
  tenant_id?: string
  chat_id?: string
  agent_id?: string | null
  inbound_message_id?: string | null
  outbound_message_id?: string | null
  source?: string | null
  status?: string
  correlation_id?: string | null
  idempotency_key?: string | null
  request_fingerprint?: string | null
  model_request_id?: string | null
  failure_classification?: string | null
  action_class?: string | null
  workflow_identity?: string | null
  context_snapshot?: Record<string, unknown> | null
  runtime_snapshot?: Record<string, unknown> | null
  memory_snapshot?: Record<string, unknown> | null
  created_at?: string | null
  updated_at?: string | null
}

type ChatMemoryPayload = {
  id?: string
  tenant_id?: string
  chat_id?: string
  revision?: number | null
  policy_profile?: string | null
  summary_text?: string | null
  covered_message_count?: number | null
  covered_from_sequence?: number | null
  covered_to_sequence?: number | null
  last_applied_turn_id?: string | null
  created_at?: string | null
  updated_at?: string | null
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

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function readRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}
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
    changedStateSummary: readRecord(payload.changed_state_summary),
  }
}

function mapTurnSummary(payload: TurnSummaryPayload | null | undefined): ConversationTurnSummary | null {
  if (!payload) return null
  return {
    totalTurns: readNumber(payload.total_turns),
    failedTurns: readNumber(payload.failed_turns),
    actionTurns: readNumber(payload.action_turns),
    latestFailureClassification: readNullableString(payload.latest_failure_classification),
    latestActionClassification: readNullableString(payload.latest_action_classification),
  }
}

function mapMemorySummary(payload: MemorySummaryPayload | null | undefined): ConversationMemorySummary | null {
  if (!payload) return null
  return {
    availabilityStatus: readString(payload.availability_status, 'unknown'),
    updateClassification: readNullableString(payload.update_classification),
    updateReasonClassification: readNullableString(payload.update_reason_classification),
    resultingSnapshotRevision: readNullableNumber(payload.resulting_snapshot_revision),
    resultingCoveredMessageCount: readNullableNumber(payload.resulting_covered_message_count),
    resultingLastAppliedTurnId: readNullableString(payload.resulting_last_applied_turn_id),
  }
}

function mapRequestSummary(payload: RequestSummaryPayload | null | undefined): ConversationRequestSummary | null {
  if (!payload) return null
  return {
    requestCount: readNumber(payload.request_count),
    inputTokens: readNumber(payload.input_tokens),
    outputTokens: readNumber(payload.output_tokens),
    totalTokens: readNumber(payload.total_tokens),
    anchorKind: readNullableString(payload.anchor_kind),
    windowStart: readNullableString(payload.window_start),
    windowEnd: readNullableString(payload.window_end),
  }
}

function mapRuntimeItem(payload: RuntimeItemPayload = {}): ConversationRuntimeItem {
  return {
    chatId: readString(payload.chat_id),
    tenantId: readString(payload.tenant_id),
    agentId: readNullableString(payload.agent_id),
    chatStatus: readString(payload.chat_status, 'unknown'),
    startedAt: readNullableString(payload.started_at),
    lastActivityAt: readNullableString(payload.last_activity_at),
    redactedMessagePreview: readNullableString(payload.redacted_message_preview),
    turnSummary: mapTurnSummary(payload.turn_summary),
    currentMemorySummary: mapMemorySummary(payload.current_memory_summary),
    requestSummary: mapRequestSummary(payload.usage_summary),
    correlationRefs: readStringArray(payload.correlation_refs),
    boundedPolicyOrRetrievalOutcomeRefsWhereAvailable: readStringArray(payload.bounded_policy_or_retrieval_outcome_refs_where_available),
    openedAt: readNullableString(payload.opened_at),
    lastMessageAt: readNullableString(payload.last_message_at),
    turnCount: readNumber(payload.turn_count),
    failedTurnCount: readNumber(payload.failed_turn_count),
    actionTurnCount: readNumber(payload.action_turn_count),
    latestFailureClassification: readNullableString(payload.latest_failure_classification),
    latestActionClassification: readNullableString(payload.latest_action_classification),
  }
}

function mapRuntimeSummary(payload: RuntimeSummaryPayload = {}): ConversationRuntimeSummary {
  return {
    tenantId: readString(payload.tenant_id),
    totalChats: readNumber(payload.total_chats),
    activeChats: readNumber(payload.active_chats),
    closedChats: readNumber(payload.closed_chats),
    totalTurns: readNumber(payload.total_turns),
    failedTurns: readNumber(payload.failed_turns),
    actionTurns: readNumber(payload.action_turns),
    redactedMessageCount: readNumber(payload.redacted_message_count),
    items: Array.isArray(payload.items) ? payload.items.map(mapRuntimeItem) : [],
    metadata: readRecord(payload.metadata),
  }
}

function mapChat(payload: ChatPayload = {}): Chat {
  return {
    id: readString(payload.id),
    tenantId: readString(payload.tenant_id),
    agentId: readNullableString(payload.agent_id),
    status: readString(payload.status, 'unknown'),
    openedAt: readNullableString(payload.opened_at),
    lastMessageAt: readNullableString(payload.last_message_at),
    closedAt: readNullableString(payload.closed_at),
  }
}

function mapMessage(payload: MessagePayload = {}): Message {
  return {
    id: readString(payload.id),
    tenantId: readString(payload.tenant_id),
    chatId: readString(payload.chat_id),
    source: readString(payload.source, 'unknown'),
    messageType: readString(payload.message_type, 'unknown'),
    sequenceNumber: readNullableNumber(payload.sequence_number),
    contentText: readNullableString(payload.content_text),
    createdAt: readNullableString(payload.created_at),
  }
}

function mapConversationTurn(payload: ConversationTurnPayload = {}): ConversationTurn {
  return {
    id: readString(payload.id),
    tenantId: readString(payload.tenant_id),
    chatId: readString(payload.chat_id),
    agentId: readNullableString(payload.agent_id),
    inboundMessageId: readNullableString(payload.inbound_message_id),
    outboundMessageId: readNullableString(payload.outbound_message_id),
    source: readNullableString(payload.source),
    status: readString(payload.status, 'unknown'),
    correlationId: readNullableString(payload.correlation_id),
    idempotencyKey: readNullableString(payload.idempotency_key),
    requestFingerprint: readNullableString(payload.request_fingerprint),
    modelRequestId: readNullableString(payload.model_request_id),
    failureClassification: readNullableString(payload.failure_classification),
    actionClass: readNullableString(payload.action_class),
    workflowIdentity: readNullableString(payload.workflow_identity),
    hasContextSnapshot: Boolean(payload.context_snapshot),
    hasRuntimeSnapshot: Boolean(payload.runtime_snapshot),
    hasMemorySnapshot: Boolean(payload.memory_snapshot),
    createdAt: readNullableString(payload.created_at),
    updatedAt: readNullableString(payload.updated_at),
  }
}

function mapMemorySnapshot(payload: ChatMemoryPayload | null | undefined): ChatMemorySnapshot | null {
  if (!payload) return null
  return {
    id: readString(payload.id),
    tenantId: readString(payload.tenant_id),
    chatId: readString(payload.chat_id),
    revision: readNullableNumber(payload.revision),
    policyProfile: readNullableString(payload.policy_profile),
    summaryText: readNullableString(payload.summary_text),
    coveredMessageCount: readNullableNumber(payload.covered_message_count),
    coveredFromSequence: readNullableNumber(payload.covered_from_sequence),
    coveredToSequence: readNullableNumber(payload.covered_to_sequence),
    lastAppliedTurnId: readNullableString(payload.last_applied_turn_id),
    createdAt: readNullableString(payload.created_at),
    updatedAt: readNullableString(payload.updated_at),
  }
}

export const conversationsApi = {
  async getRuntimeSummary(tenantId: string, filters: { status?: string; page?: number; pageSize?: number } = {}) {
    const params = {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.page ? { page: filters.page } : {}),
      ...(filters.pageSize ? { page_size: filters.pageSize } : {}),
    }
    const response = await apiClient.get<RuntimeSummaryPayload>(
      `${PORTAL_PREFIX}/tenants/${tenantId}/conversations/runtime-summary`,
      { params },
    )
    return mapRuntimeSummary(response.data)
  },

  async listChats(tenantId: string) {
    const response = await apiClient.get<{ items?: ChatPayload[] }>(`${ADMIN_PREFIX}/tenants/${tenantId}/chats`)
    return Array.isArray(response.data.items) ? response.data.items.map(mapChat) : []
  },

  async getChat(tenantId: string, chatId: string) {
    const response = await apiClient.get<ChatPayload>(`${ADMIN_PREFIX}/tenants/${tenantId}/chats/${chatId}`)
    return mapChat(response.data)
  },

  async closeChat(tenantId: string, chatId: string): Promise<ChatMutationResponse> {
    const response = await apiClient.post<{ resource?: ChatPayload; result?: MutationResultPayload }>(
      `${ADMIN_PREFIX}/tenants/${tenantId}/chats/${chatId}/close`,
    )
    return {
      resource: mapChat(response.data.resource),
      result: mapMutationResult(response.data.result),
    }
  },

  async listMessages(tenantId: string, chatId: string) {
    const response = await apiClient.get<{ items?: MessagePayload[] }>(`${ADMIN_PREFIX}/tenants/${tenantId}/chats/${chatId}/messages`)
    return Array.isArray(response.data.items) ? response.data.items.map(mapMessage) : []
  },

  async getMessage(tenantId: string, chatId: string, messageId: string) {
    const response = await apiClient.get<MessagePayload>(`${ADMIN_PREFIX}/tenants/${tenantId}/chats/${chatId}/messages/${messageId}`)
    return mapMessage(response.data)
  },

  async listTurns(tenantId: string, chatId: string) {
    const response = await apiClient.get<{ items?: ConversationTurnPayload[] }>(`${ADMIN_PREFIX}/tenants/${tenantId}/chats/${chatId}/turns`)
    return Array.isArray(response.data.items) ? response.data.items.map(mapConversationTurn) : []
  },

  async getTurn(tenantId: string, chatId: string, turnId: string) {
    const response = await apiClient.get<ConversationTurnPayload>(`${ADMIN_PREFIX}/tenants/${tenantId}/chats/${chatId}/turns/${turnId}`)
    return mapConversationTurn(response.data)
  },

  async getCurrentMemory(tenantId: string, chatId: string) {
    const response = await apiClient.get<{ snapshot?: ChatMemoryPayload | null }>(`${ADMIN_PREFIX}/tenants/${tenantId}/chats/${chatId}/memory/current`)
    return mapMemorySnapshot(response.data.snapshot)
  },
}
