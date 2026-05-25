import { apiClient } from '@/core/api/apiClient'

const TENANTS_PREFIX = '/api/admin/v1/tenants'

export type AgentCapabilityCatalogItem = {
  capabilityId: string
  capabilityVersion: string
  label: string
  category: string
  assignmentCategories: string[]
  riskClass: string
  sideEffectClass: string
  downstreamExecutionKind: string
  invocationSemantics: string
  policyRequirement: string
  meteringClassification: string | null
  explainabilityTags: string[]
}

export type AgentCapabilityCatalog = {
  relationToTemplate: string
  requiredCategories: string[]
  optionalCategories: string[]
  items: AgentCapabilityCatalogItem[]
}

export type AgentCapabilityAssignment = AgentCapabilityCatalogItem & {
  enabled: boolean
}

export type AgentCapabilityProfile = {
  tenantId: string | null
  agentId: string | null
  explicitNoExternalActions: boolean
  relationToTemplate: string
  readinessStatus: string
  requiredCategories: string[]
  optionalCategories: string[]
  assignments: AgentCapabilityAssignment[]
  issues: string[]
}

export type AgentCapabilityAssignmentInput = {
  capabilityId: string
  capabilityVersion: string | null
  enabled: boolean
}

export type AgentCapabilityProfileInput = {
  explicitNoExternalActions: boolean
  assignments: AgentCapabilityAssignmentInput[]
}

export type AgentCapabilityMutationResult = {
  action: string
  resourceType: string
  resourceId: string | null
  actorId: string | null
  actorType: string | null
  tenantId: string | null
  correlationId: string | null
  requestId: string | null
  mutationTimestamp: string
  changedStateSummary: Record<string, unknown>
}

export type AgentCapabilityMutationResponse = {
  resource: AgentCapabilityProfile
  result: AgentCapabilityMutationResult
}

type CatalogItemPayload = {
  capability_id?: string
  capability_version?: string
  label?: string
  category?: string
  assignment_categories?: string[]
  risk_class?: string
  side_effect_class?: string
  downstream_execution_kind?: string
  invocation_semantics?: string
  policy_requirement?: string
  metering_classification?: string | null
  explainability_tags?: string[]
}

type CatalogPayload = {
  relation_to_template?: string
  required_categories?: string[]
  optional_categories?: string[]
  items?: CatalogItemPayload[]
}

type AssignmentPayload = CatalogItemPayload & {
  enabled?: boolean
}

type ProfilePayload = {
  tenant_id?: string | null
  agent_id?: string | null
  explicit_no_external_actions?: boolean
  relation_to_template?: string
  readiness_status?: string
  required_categories?: string[]
  optional_categories?: string[]
  assignments?: AssignmentPayload[]
  issues?: string[]
}

type MutationResultPayload = {
  action?: string
  resource_type?: string
  resource_id?: string | null
  actor_id?: string | null
  actor_type?: string | null
  tenant_id?: string | null
  correlation_id?: string | null
  request_id?: string | null
  mutation_timestamp?: string
  changed_state_summary?: Record<string, unknown>
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

function mapCatalogItem(payload: CatalogItemPayload = {}): AgentCapabilityCatalogItem {
  return {
    capabilityId: readString(payload.capability_id),
    capabilityVersion: readString(payload.capability_version),
    label: readString(payload.label),
    category: readString(payload.category),
    assignmentCategories: readStringArray(payload.assignment_categories),
    riskClass: readString(payload.risk_class),
    sideEffectClass: readString(payload.side_effect_class),
    downstreamExecutionKind: readString(payload.downstream_execution_kind),
    invocationSemantics: readString(payload.invocation_semantics),
    policyRequirement: readString(payload.policy_requirement),
    meteringClassification: readNullableString(payload.metering_classification),
    explainabilityTags: readStringArray(payload.explainability_tags),
  }
}

function mapAssignment(payload: AssignmentPayload = {}): AgentCapabilityAssignment {
  return {
    ...mapCatalogItem(payload),
    enabled: readBoolean(payload.enabled),
  }
}

export function mapCapabilityProfile(payload: ProfilePayload = {}): AgentCapabilityProfile {
  return {
    tenantId: readNullableString(payload.tenant_id),
    agentId: readNullableString(payload.agent_id),
    explicitNoExternalActions: readBoolean(payload.explicit_no_external_actions),
    relationToTemplate: readString(payload.relation_to_template),
    readinessStatus: readString(payload.readiness_status),
    requiredCategories: readStringArray(payload.required_categories),
    optionalCategories: readStringArray(payload.optional_categories),
    assignments: payload.assignments?.map(mapAssignment) ?? [],
    issues: readStringArray(payload.issues),
  }
}

function mapMutationResult(payload: MutationResultPayload = {}): AgentCapabilityMutationResult {
  return {
    action: readString(payload.action),
    resourceType: readString(payload.resource_type),
    resourceId: readNullableString(payload.resource_id),
    actorId: readNullableString(payload.actor_id),
    actorType: readNullableString(payload.actor_type),
    tenantId: readNullableString(payload.tenant_id),
    correlationId: readNullableString(payload.correlation_id),
    requestId: readNullableString(payload.request_id),
    mutationTimestamp: readString(payload.mutation_timestamp),
    changedStateSummary: payload.changed_state_summary ?? {},
  }
}

function toProfilePayload(input: AgentCapabilityProfileInput) {
  return {
    explicit_no_external_actions: input.explicitNoExternalActions,
    assignments: input.assignments.map((assignment) => ({
      capability_id: assignment.capabilityId,
      capability_version: assignment.capabilityVersion,
      enabled: assignment.enabled,
    })),
  }
}

export const agentCapabilitiesApi = {
  async getCatalog(tenantId: string, agentId: string): Promise<AgentCapabilityCatalog> {
    const response = await apiClient.get<CatalogPayload>(`${TENANTS_PREFIX}/${tenantId}/agents/${agentId}/capabilities/catalog`)
    return {
      relationToTemplate: readString(response.data.relation_to_template),
      requiredCategories: readStringArray(response.data.required_categories),
      optionalCategories: readStringArray(response.data.optional_categories),
      items: response.data.items?.map(mapCatalogItem) ?? [],
    }
  },

  async getAssignments(tenantId: string, agentId: string): Promise<AgentCapabilityProfile> {
    const response = await apiClient.get<ProfilePayload>(`${TENANTS_PREFIX}/${tenantId}/agents/${agentId}/capabilities/assignments`)
    return mapCapabilityProfile(response.data)
  },

  async updateAssignments(tenantId: string, agentId: string, input: AgentCapabilityProfileInput): Promise<AgentCapabilityMutationResponse> {
    const response = await apiClient.put<{ resource?: ProfilePayload; result?: MutationResultPayload }>(
      `${TENANTS_PREFIX}/${tenantId}/agents/${agentId}/capabilities/assignments`,
      toProfilePayload(input),
    )
    return {
      resource: mapCapabilityProfile(response.data.resource),
      result: mapMutationResult(response.data.result),
    }
  },
}
