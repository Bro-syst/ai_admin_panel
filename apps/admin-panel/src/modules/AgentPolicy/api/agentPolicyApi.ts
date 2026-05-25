import { apiClient } from '@/core/api/apiClient'

const TENANTS_PREFIX = '/api/admin/v1/tenants'

export type AgentPolicyProfileDefinition = {
  profileId: string
  label: string
  description: string
  expectationMarkers: string[]
  decisionPoints: string[]
  policyDomains: string[]
  tenantPolicyMarkers: string[]
  businessPolicyScope: string | null
  safeFallbackMode: string | null
}

export type AgentPolicyProfileCatalog = {
  relationToTemplate: string
  policyExpectations: string[]
  items: AgentPolicyProfileDefinition[]
}

export type AgentPolicyBinding = {
  tenantId: string | null
  agentId: string | null
  bindingMode: string | null
  status: string | null
  policyProfileId: string | null
  effectiveProfileId: string | null
  relationToTemplate: string
  readinessStatus: string
  policyExpectations: string[]
  tenantPolicyMarkers: string[]
  businessPolicyScope: string | null
  inboundRequestEvaluationReady: boolean
  promptInjectionContextAbuseReady: boolean
  sensitiveContextAdmissionReady: boolean
  modelInvocationGatingReady: boolean
  capabilityActionGatingReady: boolean
  decisionPoints: string[]
  policyDomains: string[]
  issues: string[]
}

export type AgentPolicyBindingInput = {
  bindingMode: string
  policyProfileId: string | null
  tenantPolicyMarkers: string[]
  businessPolicyScope: string | null
}

export type AgentPolicyMutationResult = {
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

export type AgentPolicyMutationResponse = {
  resource: AgentPolicyBinding
  result: AgentPolicyMutationResult
}

type ProfilePayload = {
  profile_id?: string
  label?: string
  description?: string
  expectation_markers?: string[]
  decision_points?: string[]
  policy_domains?: string[]
  tenant_policy_markers?: string[]
  business_policy_scope?: string | null
  safe_fallback_mode?: string | null
}

type CatalogPayload = {
  relation_to_template?: string
  policy_expectations?: string[]
  items?: ProfilePayload[]
}

type BindingPayload = {
  tenant_id?: string | null
  agent_id?: string | null
  binding_mode?: string | null
  status?: string | null
  policy_profile_id?: string | null
  effective_profile_id?: string | null
  relation_to_template?: string
  readiness_status?: string
  policy_expectations?: string[]
  tenant_policy_markers?: string[]
  business_policy_scope?: string | null
  inbound_request_evaluation_ready?: boolean
  prompt_injection_context_abuse_ready?: boolean
  sensitive_context_admission_ready?: boolean
  model_invocation_gating_ready?: boolean
  capability_action_gating_ready?: boolean
  decision_points?: string[]
  policy_domains?: string[]
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

function mapProfile(payload: ProfilePayload = {}): AgentPolicyProfileDefinition {
  return {
    profileId: readString(payload.profile_id),
    label: readString(payload.label),
    description: readString(payload.description),
    expectationMarkers: readStringArray(payload.expectation_markers),
    decisionPoints: readStringArray(payload.decision_points),
    policyDomains: readStringArray(payload.policy_domains),
    tenantPolicyMarkers: readStringArray(payload.tenant_policy_markers),
    businessPolicyScope: readNullableString(payload.business_policy_scope),
    safeFallbackMode: readNullableString(payload.safe_fallback_mode),
  }
}

export function mapPolicyBinding(payload: BindingPayload = {}): AgentPolicyBinding {
  return {
    tenantId: readNullableString(payload.tenant_id),
    agentId: readNullableString(payload.agent_id),
    bindingMode: readNullableString(payload.binding_mode),
    status: readNullableString(payload.status),
    policyProfileId: readNullableString(payload.policy_profile_id),
    effectiveProfileId: readNullableString(payload.effective_profile_id),
    relationToTemplate: readString(payload.relation_to_template),
    readinessStatus: readString(payload.readiness_status),
    policyExpectations: readStringArray(payload.policy_expectations),
    tenantPolicyMarkers: readStringArray(payload.tenant_policy_markers),
    businessPolicyScope: readNullableString(payload.business_policy_scope),
    inboundRequestEvaluationReady: readBoolean(payload.inbound_request_evaluation_ready),
    promptInjectionContextAbuseReady: readBoolean(payload.prompt_injection_context_abuse_ready),
    sensitiveContextAdmissionReady: readBoolean(payload.sensitive_context_admission_ready),
    modelInvocationGatingReady: readBoolean(payload.model_invocation_gating_ready),
    capabilityActionGatingReady: readBoolean(payload.capability_action_gating_ready),
    decisionPoints: readStringArray(payload.decision_points),
    policyDomains: readStringArray(payload.policy_domains),
    issues: readStringArray(payload.issues),
  }
}

function mapMutationResult(payload: MutationResultPayload = {}): AgentPolicyMutationResult {
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

function toBindingPayload(input: AgentPolicyBindingInput) {
  return {
    binding_mode: input.bindingMode,
    policy_profile_id: input.policyProfileId,
    tenant_policy_markers: input.tenantPolicyMarkers,
    business_policy_scope: input.businessPolicyScope,
  }
}

export const agentPolicyApi = {
  async getCatalog(tenantId: string, agentId: string): Promise<AgentPolicyProfileCatalog> {
    const response = await apiClient.get<CatalogPayload>(`${TENANTS_PREFIX}/${tenantId}/agents/${agentId}/policy-profiles/catalog`)
    return {
      relationToTemplate: readString(response.data.relation_to_template),
      policyExpectations: readStringArray(response.data.policy_expectations),
      items: response.data.items?.map(mapProfile) ?? [],
    }
  },

  async getBinding(tenantId: string, agentId: string): Promise<AgentPolicyBinding> {
    const response = await apiClient.get<BindingPayload>(`${TENANTS_PREFIX}/${tenantId}/agents/${agentId}/policy/binding`)
    return mapPolicyBinding(response.data)
  },

  async updateBinding(tenantId: string, agentId: string, input: AgentPolicyBindingInput): Promise<AgentPolicyMutationResponse> {
    const response = await apiClient.put<{ resource?: BindingPayload; result?: MutationResultPayload }>(
      `${TENANTS_PREFIX}/${tenantId}/agents/${agentId}/policy/binding`,
      toBindingPayload(input),
    )
    return {
      resource: mapPolicyBinding(response.data.resource),
      result: mapMutationResult(response.data.result),
    }
  },

  async validateBinding(tenantId: string, agentId: string): Promise<AgentPolicyBinding> {
    const response = await apiClient.post<BindingPayload>(`${TENANTS_PREFIX}/${tenantId}/agents/${agentId}/policy/binding/validate`)
    return mapPolicyBinding(response.data)
  },
}
