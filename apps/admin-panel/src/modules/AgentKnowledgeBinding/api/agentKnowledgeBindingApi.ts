import { apiClient } from '@/core/api/apiClient'

const PORTAL_PREFIX = '/api/admin/v1/portal/tenants'
const TENANTS_PREFIX = '/api/admin/v1/tenants'

export type PortalAgentKnowledgeSourceStatus = {
  sourceId: string
  label: string
  sourceClass: string
  selected: boolean
  retrievalModeAllowed: boolean
}

export type PortalAgentKnowledgeStatus = {
  agentId: string
  relationToTemplate: string
  readinessStatus: string
  bindingMode: string | null
  sourceSetId: string | null
  retrievalMode: string | null
  requiredModes: string[]
  optionalModes: string[]
  issues: string[]
  sources: PortalAgentKnowledgeSourceStatus[]
}

export type AgentKnowledgeCatalogSource = {
  sourceId: string
  sourceVersion: string
  label: string
  sourceClass: string
  accessTier: string
  storageClass: string
  allowedRetrievalModes: string[]
  explainabilityTags: string[]
}

export type AgentKnowledgeSourceSet = {
  sourceSetId: string
  label: string
  purposeMarker: string
  sourceIds: string[]
  sourceClassConstraints: string[]
}

export type AgentKnowledgeCatalog = {
  relationToTemplate: string
  requiredModes: string[]
  optionalModes: string[]
  sources: AgentKnowledgeCatalogSource[]
  sourceSets: AgentKnowledgeSourceSet[]
}

export type AgentKnowledgeBinding = {
  tenantId: string | null
  agentId: string | null
  bindingMode: string | null
  status: string | null
  relationToTemplate: string
  readinessStatus: string
  requiredModes: string[]
  optionalModes: string[]
  sourceSetId: string | null
  sourceIds: string[]
  sourceMarkers: string[]
  sourceClasses: string[]
  retrievalMode: string | null
  issues: string[]
}

export type AgentKnowledgeBindingInput = {
  bindingMode: string
  sourceSetId: string | null
  sourceIds: string[]
  retrievalMode: string | null
}

export type AgentKnowledgeMutationResult = {
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

export type AgentKnowledgeMutationResponse = {
  resource: AgentKnowledgeBinding
  result: AgentKnowledgeMutationResult
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

type PortalStatusPayload = {
  agent_id?: string
  relation_to_template?: string
  readiness_status?: string
  binding_mode?: string | null
  source_set_id?: string | null
  retrieval_mode?: string | null
  required_modes?: string[]
  optional_modes?: string[]
  issues?: string[]
  sources?: Array<{
    source_id?: string
    label?: string
    source_class?: string
    selected?: boolean
    retrieval_mode_allowed?: boolean
  }>
}

type CatalogPayload = {
  relation_to_template?: string
  required_modes?: string[]
  optional_modes?: string[]
  sources?: Array<{
    source_id?: string
    source_version?: string
    label?: string
    source_class?: string
    access_tier?: string
    storage_class?: string
    allowed_retrieval_modes?: string[]
    explainability_tags?: string[]
  }>
  source_sets?: Array<{
    source_set_id?: string
    label?: string
    purpose_marker?: string
    source_ids?: string[]
    source_class_constraints?: string[]
  }>
}

type BindingPayload = {
  tenant_id?: string | null
  agent_id?: string | null
  binding_mode?: string | null
  status?: string | null
  relation_to_template?: string
  readiness_status?: string
  required_modes?: string[]
  optional_modes?: string[]
  source_set_id?: string | null
  source_ids?: string[]
  source_markers?: string[]
  source_classes?: string[]
  retrieval_mode?: string | null
  issues?: string[]
}

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function readNullableString(value: unknown) {
  return typeof value === 'string' ? value : null
}

function readBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function mapMutationResult(payload: MutationResultPayload = {}): AgentKnowledgeMutationResult {
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

export function mapPortalAgentKnowledgeStatus(payload: PortalStatusPayload = {}): PortalAgentKnowledgeStatus {
  return {
    agentId: readString(payload.agent_id),
    relationToTemplate: readString(payload.relation_to_template),
    readinessStatus: readString(payload.readiness_status),
    bindingMode: readNullableString(payload.binding_mode),
    sourceSetId: readNullableString(payload.source_set_id),
    retrievalMode: readNullableString(payload.retrieval_mode),
    requiredModes: readStringArray(payload.required_modes),
    optionalModes: readStringArray(payload.optional_modes),
    issues: readStringArray(payload.issues),
    sources: payload.sources?.map((source) => ({
      sourceId: readString(source.source_id),
      label: readString(source.label),
      sourceClass: readString(source.source_class),
      selected: readBoolean(source.selected),
      retrievalModeAllowed: readBoolean(source.retrieval_mode_allowed),
    })) ?? [],
  }
}

export function mapAgentKnowledgeCatalog(payload: CatalogPayload = {}): AgentKnowledgeCatalog {
  return {
    relationToTemplate: readString(payload.relation_to_template),
    requiredModes: readStringArray(payload.required_modes),
    optionalModes: readStringArray(payload.optional_modes),
    sources: payload.sources?.map((source) => ({
      sourceId: readString(source.source_id),
      sourceVersion: readString(source.source_version),
      label: readString(source.label),
      sourceClass: readString(source.source_class),
      accessTier: readString(source.access_tier),
      storageClass: readString(source.storage_class),
      allowedRetrievalModes: readStringArray(source.allowed_retrieval_modes),
      explainabilityTags: readStringArray(source.explainability_tags),
    })) ?? [],
    sourceSets: payload.source_sets?.map((sourceSet) => ({
      sourceSetId: readString(sourceSet.source_set_id),
      label: readString(sourceSet.label),
      purposeMarker: readString(sourceSet.purpose_marker),
      sourceIds: readStringArray(sourceSet.source_ids),
      sourceClassConstraints: readStringArray(sourceSet.source_class_constraints),
    })) ?? [],
  }
}

export function mapAgentKnowledgeBinding(payload: BindingPayload = {}): AgentKnowledgeBinding {
  return {
    tenantId: readNullableString(payload.tenant_id),
    agentId: readNullableString(payload.agent_id),
    bindingMode: readNullableString(payload.binding_mode),
    status: readNullableString(payload.status),
    relationToTemplate: readString(payload.relation_to_template),
    readinessStatus: readString(payload.readiness_status),
    requiredModes: readStringArray(payload.required_modes),
    optionalModes: readStringArray(payload.optional_modes),
    sourceSetId: readNullableString(payload.source_set_id),
    sourceIds: readStringArray(payload.source_ids),
    sourceMarkers: readStringArray(payload.source_markers),
    sourceClasses: readStringArray(payload.source_classes),
    retrievalMode: readNullableString(payload.retrieval_mode),
    issues: readStringArray(payload.issues),
  }
}

function toBindingPayload(input: AgentKnowledgeBindingInput) {
  return {
    binding_mode: input.bindingMode,
    source_set_id: input.sourceSetId,
    source_ids: input.sourceIds,
    retrieval_mode: input.retrievalMode,
  }
}

export const agentKnowledgeBindingApi = {
  async getPortalStatus(tenantId: string, agentId: string): Promise<PortalAgentKnowledgeStatus> {
    const response = await apiClient.get<PortalStatusPayload>(`${PORTAL_PREFIX}/${tenantId}/agents/${agentId}/knowledge`)
    return mapPortalAgentKnowledgeStatus(response.data)
  },

  async getCatalog(tenantId: string, agentId: string): Promise<AgentKnowledgeCatalog> {
    const response = await apiClient.get<CatalogPayload>(`${TENANTS_PREFIX}/${tenantId}/agents/${agentId}/knowledge/catalog`)
    return mapAgentKnowledgeCatalog(response.data)
  },

  async getBinding(tenantId: string, agentId: string): Promise<AgentKnowledgeBinding> {
    const response = await apiClient.get<BindingPayload>(`${TENANTS_PREFIX}/${tenantId}/agents/${agentId}/knowledge/binding`)
    return mapAgentKnowledgeBinding(response.data)
  },

  async updateBinding(tenantId: string, agentId: string, input: AgentKnowledgeBindingInput): Promise<AgentKnowledgeMutationResponse> {
    const response = await apiClient.put<{ resource?: BindingPayload; result?: MutationResultPayload }>(
      `${TENANTS_PREFIX}/${tenantId}/agents/${agentId}/knowledge/binding`,
      toBindingPayload(input),
    )
    return { resource: mapAgentKnowledgeBinding(response.data.resource), result: mapMutationResult(response.data.result) }
  },

  async disableBinding(tenantId: string, agentId: string): Promise<AgentKnowledgeMutationResponse> {
    const response = await apiClient.post<{ resource?: BindingPayload; result?: MutationResultPayload }>(
      `${TENANTS_PREFIX}/${tenantId}/agents/${agentId}/knowledge/binding/disable`,
    )
    return { resource: mapAgentKnowledgeBinding(response.data.resource), result: mapMutationResult(response.data.result) }
  },
}
