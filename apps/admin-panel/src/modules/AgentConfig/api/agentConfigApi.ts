import { apiClient } from '@/core/api/apiClient'

const TENANTS_PREFIX = '/api/admin/v1/tenants'

export type AgentIntegrationActionBinding = {
  actionClass: string
  connectorKey: string
  operationKey: string
  interfaceType: string
  sideEffectMode: string
  referenceScope: string
  referenceKey: string
  endpointUrl: string
  timeoutClass: string | null
  retryPolicyClass: string | null
  compensationMode: string | null
}

export type AgentConfigPayload = {
  identity: {
    agentLabel: string
    personaSummary: string | null
  }
  toneAndLanguage: {
    tone: string
    language: string
  }
  goals: string[]
  rules: string[]
  restrictions: string[]
  handoffPolicy: {
    handoffEnabled: boolean
    handoffConditions: string[]
  }
  integrationPolicy: {
    integrationEnabled: boolean
    actionBindings: AgentIntegrationActionBinding[]
  }
  modelPreference: {
    preferredModelFamily: string | null
    latencySensitivity: string | null
    qualitySensitivity: string | null
    costSensitivity: string | null
  }
  modelSelectionHints: {
    preferredCapabilities: string[]
    fallbackAllowed: boolean
  }
  executionProfileHints: {
    profileName: string | null
    responseMode: string | null
  }
  compatibilityAndSafety: {
    configSchemaVersion: string
    safetyLabels: string[]
    compatibilityNotes: string[]
  }
}

export type AgentConfigVersion = {
  id: string
  tenantId: string
  agentId: string
  version: number
  status: string
}

export type AgentConfigDetail = AgentConfigVersion & {
  payload: AgentConfigPayload
  activatedAt: string | null
}

export type AgentConfigListMetadata = {
  page: number
  pageSize: number
  totalItems: number
  returnedItems: number
  ordering: string
}

export type AgentConfigListResult = {
  items: AgentConfigVersion[]
  metadata: AgentConfigListMetadata
}

export type AgentConfigValidationResult = {
  validationStatus: string
  compatibilityStatus: string
  processingPath: string
  normalized: boolean
  safeDefaultsApplied: boolean
  fallbackEligible: boolean
  provenanceMarker: string
  issues: string[]
  compatibilityNotes: string[]
}

export type AgentConfigMutationResult = {
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

export type AgentConfigMutationResponse = {
  resource: AgentConfigDetail
  result: AgentConfigMutationResult
}

type ActionBindingPayload = {
  action_class?: string
  connector_key?: string
  operation_key?: string
  interface_type?: string
  side_effect_mode?: string
  reference_scope?: string
  reference_key?: string
  endpoint_url?: string
  timeout_class?: string | null
  retry_policy_class?: string | null
  compensation_mode?: string | null
}

type ConfigPayload = {
  identity?: {
    agent_label?: string
    persona_summary?: string | null
  }
  tone_and_language?: {
    tone?: string
    language?: string
  }
  goals?: string[]
  rules?: string[]
  restrictions?: string[]
  handoff_policy?: {
    handoff_enabled?: boolean
    handoff_conditions?: string[]
  }
  integration_policy?: {
    integration_enabled?: boolean
    action_bindings?: ActionBindingPayload[]
  }
  model_preference?: {
    preferred_model_family?: string | null
    latency_sensitivity?: string | null
    quality_sensitivity?: string | null
    cost_sensitivity?: string | null
  }
  model_selection_hints?: {
    preferred_capabilities?: string[]
    fallback_allowed?: boolean
  }
  execution_profile_hints?: {
    profile_name?: string | null
    response_mode?: string | null
  }
  compatibility_and_safety?: {
    config_schema_version?: string
    safety_labels?: string[]
    compatibility_notes?: string[]
  }
}

type ConfigSnapshotPayload = {
  id?: string
  tenant_id?: string
  agent_id?: string
  version?: number
  status?: string
  payload?: ConfigPayload
  activated_at?: string | null
}

type ListPayload = {
  items?: ConfigSnapshotPayload[]
  metadata?: {
    page?: number
    page_size?: number
    total_items?: number
    returned_items?: number
    ordering?: string
  }
}

type ValidationPayload = {
  validation_status?: string
  compatibility_status?: string
  processing_path?: string
  normalized?: boolean
  safe_defaults_applied?: boolean
  fallback_eligible?: boolean
  provenance_marker?: string
  issues?: string[]
  compatibility_notes?: string[]
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

type MutationResponsePayload = {
  resource?: ConfigSnapshotPayload
  result?: MutationResultPayload
}

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function readNullableString(value: unknown) {
  return typeof value === 'string' ? value : null
}

function readNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function readBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function mapActionBinding(payload: ActionBindingPayload): AgentIntegrationActionBinding {
  return {
    actionClass: readString(payload.action_class),
    connectorKey: readString(payload.connector_key),
    operationKey: readString(payload.operation_key),
    interfaceType: readString(payload.interface_type),
    sideEffectMode: readString(payload.side_effect_mode),
    referenceScope: readString(payload.reference_scope),
    referenceKey: readString(payload.reference_key),
    endpointUrl: readString(payload.endpoint_url),
    timeoutClass: readNullableString(payload.timeout_class),
    retryPolicyClass: readNullableString(payload.retry_policy_class),
    compensationMode: readNullableString(payload.compensation_mode),
  }
}

export function mapAgentConfigPayload(payload: ConfigPayload = {}): AgentConfigPayload {
  return {
    identity: {
      agentLabel: readString(payload.identity?.agent_label),
      personaSummary: readNullableString(payload.identity?.persona_summary),
    },
    toneAndLanguage: {
      tone: readString(payload.tone_and_language?.tone),
      language: readString(payload.tone_and_language?.language),
    },
    goals: readStringArray(payload.goals),
    rules: readStringArray(payload.rules),
    restrictions: readStringArray(payload.restrictions),
    handoffPolicy: {
      handoffEnabled: readBoolean(payload.handoff_policy?.handoff_enabled),
      handoffConditions: readStringArray(payload.handoff_policy?.handoff_conditions),
    },
    integrationPolicy: {
      integrationEnabled: readBoolean(payload.integration_policy?.integration_enabled),
      actionBindings: Array.isArray(payload.integration_policy?.action_bindings)
        ? payload.integration_policy.action_bindings.map(mapActionBinding)
        : [],
    },
    modelPreference: {
      preferredModelFamily: readNullableString(payload.model_preference?.preferred_model_family),
      latencySensitivity: readNullableString(payload.model_preference?.latency_sensitivity),
      qualitySensitivity: readNullableString(payload.model_preference?.quality_sensitivity),
      costSensitivity: readNullableString(payload.model_preference?.cost_sensitivity),
    },
    modelSelectionHints: {
      preferredCapabilities: readStringArray(payload.model_selection_hints?.preferred_capabilities),
      fallbackAllowed: readBoolean(payload.model_selection_hints?.fallback_allowed),
    },
    executionProfileHints: {
      profileName: readNullableString(payload.execution_profile_hints?.profile_name),
      responseMode: readNullableString(payload.execution_profile_hints?.response_mode),
    },
    compatibilityAndSafety: {
      configSchemaVersion: readString(payload.compatibility_and_safety?.config_schema_version, '1.0'),
      safetyLabels: readStringArray(payload.compatibility_and_safety?.safety_labels),
      compatibilityNotes: readStringArray(payload.compatibility_and_safety?.compatibility_notes),
    },
  }
}

function mapConfigVersion(payload: ConfigSnapshotPayload): AgentConfigVersion {
  return {
    id: readString(payload.id),
    tenantId: readString(payload.tenant_id),
    agentId: readString(payload.agent_id),
    version: readNumber(payload.version),
    status: readString(payload.status),
  }
}

function mapConfigDetail(payload: ConfigSnapshotPayload = {}): AgentConfigDetail {
  return {
    ...mapConfigVersion(payload),
    payload: mapAgentConfigPayload(payload.payload),
    activatedAt: readNullableString(payload.activated_at),
  }
}

function mapValidationResult(payload: ValidationPayload = {}): AgentConfigValidationResult {
  return {
    validationStatus: readString(payload.validation_status),
    compatibilityStatus: readString(payload.compatibility_status),
    processingPath: readString(payload.processing_path),
    normalized: readBoolean(payload.normalized),
    safeDefaultsApplied: readBoolean(payload.safe_defaults_applied),
    fallbackEligible: readBoolean(payload.fallback_eligible),
    provenanceMarker: readString(payload.provenance_marker),
    issues: readStringArray(payload.issues),
    compatibilityNotes: readStringArray(payload.compatibility_notes),
  }
}

function mapMutationResult(payload: MutationResultPayload = {}): AgentConfigMutationResult {
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

function toNullableString(value: string | null) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function toActionBindingPayload(binding: AgentIntegrationActionBinding): ActionBindingPayload {
  return {
    action_class: binding.actionClass.trim(),
    connector_key: binding.connectorKey.trim(),
    operation_key: binding.operationKey.trim(),
    interface_type: binding.interfaceType.trim(),
    side_effect_mode: binding.sideEffectMode.trim(),
    reference_scope: binding.referenceScope.trim(),
    reference_key: binding.referenceKey.trim(),
    endpoint_url: binding.endpointUrl.trim(),
    timeout_class: toNullableString(binding.timeoutClass),
    retry_policy_class: toNullableString(binding.retryPolicyClass),
    compensation_mode: toNullableString(binding.compensationMode),
  }
}

function toPayload(payload: AgentConfigPayload): ConfigPayload {
  return {
    identity: {
      agent_label: payload.identity.agentLabel.trim(),
      persona_summary: toNullableString(payload.identity.personaSummary),
    },
    tone_and_language: {
      tone: payload.toneAndLanguage.tone.trim(),
      language: payload.toneAndLanguage.language.trim(),
    },
    goals: payload.goals.map((item) => item.trim()).filter(Boolean),
    rules: payload.rules.map((item) => item.trim()).filter(Boolean),
    restrictions: payload.restrictions.map((item) => item.trim()).filter(Boolean),
    handoff_policy: {
      handoff_enabled: payload.handoffPolicy.handoffEnabled,
      handoff_conditions: payload.handoffPolicy.handoffConditions.map((item) => item.trim()).filter(Boolean),
    },
    integration_policy: {
      integration_enabled: payload.integrationPolicy.integrationEnabled,
      action_bindings: payload.integrationPolicy.actionBindings.map(toActionBindingPayload),
    },
    model_preference: {
      preferred_model_family: toNullableString(payload.modelPreference.preferredModelFamily),
      latency_sensitivity: toNullableString(payload.modelPreference.latencySensitivity),
      quality_sensitivity: toNullableString(payload.modelPreference.qualitySensitivity),
      cost_sensitivity: toNullableString(payload.modelPreference.costSensitivity),
    },
    model_selection_hints: {
      preferred_capabilities: payload.modelSelectionHints.preferredCapabilities.map((item) => item.trim()).filter(Boolean),
      fallback_allowed: payload.modelSelectionHints.fallbackAllowed,
    },
    execution_profile_hints: {
      profile_name: toNullableString(payload.executionProfileHints.profileName),
      response_mode: toNullableString(payload.executionProfileHints.responseMode),
    },
    compatibility_and_safety: {
      config_schema_version: payload.compatibilityAndSafety.configSchemaVersion.trim() || '1.0',
      safety_labels: payload.compatibilityAndSafety.safetyLabels.map((item) => item.trim()).filter(Boolean),
      compatibility_notes: payload.compatibilityAndSafety.compatibilityNotes.map((item) => item.trim()).filter(Boolean),
    },
  }
}

function agentConfigBasePath(tenantId: string, agentId: string) {
  return `${TENANTS_PREFIX}/${tenantId}/agents/${agentId}`
}

export const agentConfigApi = {
  async getActiveConfig(tenantId: string, agentId: string): Promise<AgentConfigDetail> {
    const response = await apiClient.get<ConfigSnapshotPayload>(`${agentConfigBasePath(tenantId, agentId)}/configs/active`)
    return mapConfigDetail(response.data)
  },

  async listConfigs(tenantId: string, agentId: string): Promise<AgentConfigListResult> {
    const response = await apiClient.get<ListPayload>(`${agentConfigBasePath(tenantId, agentId)}/configs`)
    return {
      items: response.data.items?.map(mapConfigVersion) ?? [],
      metadata: {
        page: readNumber(response.data.metadata?.page, 1),
        pageSize: readNumber(response.data.metadata?.page_size, 20),
        totalItems: readNumber(response.data.metadata?.total_items, 0),
        returnedItems: readNumber(response.data.metadata?.returned_items, response.data.items?.length ?? 0),
        ordering: readString(response.data.metadata?.ordering),
      },
    }
  },

  async getConfigDetail(tenantId: string, agentId: string, configId: string): Promise<AgentConfigDetail> {
    const response = await apiClient.get<ConfigSnapshotPayload>(`${agentConfigBasePath(tenantId, agentId)}/configs/${configId}`)
    return mapConfigDetail(response.data)
  },

  async createDraft(tenantId: string, agentId: string, payload: AgentConfigPayload): Promise<AgentConfigMutationResponse> {
    const response = await apiClient.post<MutationResponsePayload>(`${agentConfigBasePath(tenantId, agentId)}/config-drafts`, {
      payload: toPayload(payload),
    })
    return {
      resource: mapConfigDetail(response.data.resource),
      result: mapMutationResult(response.data.result),
    }
  },

  async createConfigVersion(tenantId: string, agentId: string, payload: AgentConfigPayload): Promise<AgentConfigMutationResponse> {
    const response = await apiClient.post<MutationResponsePayload>(`${agentConfigBasePath(tenantId, agentId)}/configs`, {
      payload: toPayload(payload),
    })
    return {
      resource: mapConfigDetail(response.data.resource),
      result: mapMutationResult(response.data.result),
    }
  },

  async validateConfig(tenantId: string, agentId: string, configId: string): Promise<AgentConfigValidationResult> {
    const response = await apiClient.post<ValidationPayload>(`${agentConfigBasePath(tenantId, agentId)}/configs/${configId}/validate`)
    return mapValidationResult(response.data)
  },

  async activateConfig(tenantId: string, agentId: string, configId: string): Promise<AgentConfigMutationResponse> {
    const response = await apiClient.post<MutationResponsePayload>(`${agentConfigBasePath(tenantId, agentId)}/configs/${configId}/activate`)
    return {
      resource: mapConfigDetail(response.data.resource),
      result: mapMutationResult(response.data.result),
    }
  },

  async rollbackConfig(tenantId: string, agentId: string, configId: string): Promise<AgentConfigMutationResponse> {
    const response = await apiClient.post<MutationResponsePayload>(`${agentConfigBasePath(tenantId, agentId)}/configs/${configId}/rollback`)
    return {
      resource: mapConfigDetail(response.data.resource),
      result: mapMutationResult(response.data.result),
    }
  },
}
