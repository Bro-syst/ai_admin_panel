import { apiClient } from '@/core/api/apiClient'

const PORTAL_PREFIX = '/api/admin/v1/portal/tenants'
const TENANTS_PREFIX = '/api/admin/v1/tenants'

export type AgentCard = {
  agentId: string
  tenantId: string
  name: string
  description: string | null
  purpose: string | null
  archetypeId: string
  templateId: string | null
  lifecycleStatus: string
  status: string
  activeConfigId: string | null
  readinessStatus: string
  releaseReady: boolean
  blockingItemCount: number
  detailRoute: string
}

export type AgentListMetadata = {
  page: number
  pageSize: number
  totalItems: number
  returnedItems: number
  ordering: string
}

export type AgentListResult = {
  items: AgentCard[]
  metadata: AgentListMetadata
}

export type AgentSnapshot = {
  id: string
  tenantId: string
  name: string
  description: string | null
  purpose: string | null
  archetypeId: string
  templateId: string | null
  lifecycleStatus: string
  status: string
  activeConfigId: string | null
}

export type AgentMutationResult = {
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

export type AgentMutationResponse = {
  resource: AgentSnapshot
  result: AgentMutationResult
}

export type PortalSetupReadinessSummary = {
  overallReadinessStatus: string
  releaseReady: boolean
  blockingItemCount: number
  tenantStatus: string
  agentLifecycleStatus: string
  archetypeTemplateStatus: string
  agentConfigStatus: string
  knowledgeStatus: string
  capabilityStatus: string
  policyStatus: string
  policyBindingMode: string | null
  siteWidgetStatus: string
  publicChannelRequired: boolean
  publicChannelInUse: boolean
  meteringInterpretationMarkers: string[]
  releaseHandoffTarget: string
}

export type FoundationSummary = {
  validationStatus: string | null
  compatibilityStatus: string | null
  processingPath: string | null
  normalized: boolean | null
  safeDefaultsApplied: boolean
  fallbackEligible: boolean
  provenanceMarker: string | null
  issueCount: number
  issues: string[]
  compatibilityNotes: string[]
}

export type ChannelSummary = {
  supportedChannels: string[]
  publicChannelSupported: boolean
  readinessStatus: string
  publicChannelRequired: boolean
  publicChannelInUse: boolean
  bindingCount: number
  readyBindingCount: number
  meteringInterpretationMarkers: string[]
  releaseHandoffTarget: string
  issueCount: number
}

export type PortalAgentDetail = {
  agentId: string
  tenantId: string
  name: string
  description: string | null
  purpose: string | null
  status: string
  lifecycleStatus: string
  archetypeId: string
  templateId: string | null
  activeConfigId: string | null
  setupReadinessSummary: PortalSetupReadinessSummary
  foundationAssessmentSummary: FoundationSummary
  channelBindingSummary: ChannelSummary
  supportedMutationActions: string[]
  agent: AgentCard
}

export type SetupChecklistItem = {
  itemId: string
  ownerArea: string
  state: string
  blocking: boolean
  detail: string
  requiredAction: string | null
  releaseReadinessMarker: string
}

export type SetupChecklist = {
  tenantId: string
  agentId: string
  archetypeId: string
  templateId: string | null
  lifecycleStatus: string
  releaseReady: boolean
  summary: PortalSetupReadinessSummary
  channelBinding: AgentChannelBinding
  items: SetupChecklistItem[]
}

export type AgentFoundationAssessment = {
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

export type AgentChannelBinding = {
  tenantId: string
  agentId: string
  supportedChannels: string[]
  publicChannelSupported: boolean
  publicChannelRequired: boolean
  publicChannelInUse: boolean
  readinessStatus: string
  releaseReadinessMarker: string
  meteringInterpretationMarkers: string[]
  releaseHandoffTarget: string
  bindings: Array<Record<string, unknown>>
  issues: string[]
}

export type CreateAgentInput = {
  tenantId: string
  name: string
  description: string | null
  purpose: string | null
  archetypeId: string | null
  templateId: string | null
  lifecycleStatus: string
}

export type UpdateAgentMetadataInput = {
  tenantId: string
  agentId: string
  name: string | null
  description: string | null
  purpose: string | null
}

type AgentCardPayload = {
  agent_id?: string
  tenant_id?: string
  name?: string
  description?: string | null
  purpose?: string | null
  archetype_id?: string
  template_id?: string | null
  lifecycle_status?: string
  status?: string
  active_config_id?: string | null
  readiness_status?: string
  release_ready?: boolean
  blocking_item_count?: number
  detail_route?: string
}

type ListMetadataPayload = {
  page?: number
  page_size?: number
  total_items?: number
  returned_items?: number
  ordering?: string
}

type AgentListPayload = {
  items?: AgentCardPayload[]
  metadata?: ListMetadataPayload
}

type AgentSnapshotPayload = {
  id?: string
  tenant_id?: string
  name?: string
  description?: string | null
  purpose?: string | null
  archetype_id?: string
  template_id?: string | null
  lifecycle_status?: string
  status?: string
  active_config_id?: string | null
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
  resource?: AgentSnapshotPayload
  result?: MutationResultPayload
}

type SetupSummaryPayload = {
  overall_readiness_status?: string
  release_ready?: boolean
  blocking_item_count?: number
  tenant_status?: string
  agent_lifecycle_status?: string
  archetype_template_status?: string
  agent_config_status?: string
  knowledge_status?: string
  capability_status?: string
  policy_status?: string
  policy_binding_mode?: string | null
  site_widget_status?: string
  public_channel_required?: boolean
  public_channel_in_use?: boolean
  metering_interpretation_markers?: string[]
  release_handoff_target?: string
}

type FoundationSummaryPayload = {
  validation_status?: string | null
  compatibility_status?: string | null
  processing_path?: string | null
  normalized?: boolean | null
  safe_defaults_applied?: boolean
  fallback_eligible?: boolean
  provenance_marker?: string | null
  issue_count?: number
  issues?: string[]
  compatibility_notes?: string[]
}

type ChannelSummaryPayload = {
  supported_channels?: string[]
  public_channel_supported?: boolean
  readiness_status?: string
  public_channel_required?: boolean
  public_channel_in_use?: boolean
  binding_count?: number
  ready_binding_count?: number
  metering_interpretation_markers?: string[]
  release_handoff_target?: string
  issue_count?: number
}

type PortalAgentDetailPayload = {
  agent_id?: string
  tenant_id?: string
  name?: string
  description?: string | null
  purpose?: string | null
  status?: string
  lifecycle_status?: string
  archetype_id?: string
  template_id?: string | null
  active_config_id?: string | null
  setup_readiness_summary?: SetupSummaryPayload
  foundation_assessment_summary?: FoundationSummaryPayload
  channel_binding_summary?: ChannelSummaryPayload
  supported_mutation_actions?: string[]
  supported_mutation_action_refs?: string[]
  agent?: AgentCardPayload
}

type SetupChecklistPayload = {
  tenant_id?: string
  agent_id?: string
  archetype_id?: string
  template_id?: string | null
  lifecycle_status?: string
  release_ready?: boolean
  summary?: SetupSummaryPayload
  channel_binding?: AgentChannelBindingPayload
  items?: SetupChecklistItemPayload[]
}

type SetupChecklistItemPayload = {
  item_id?: string
  owner_area?: string
  state?: string
  blocking?: boolean
  detail?: string
  required_action?: string | null
  release_readiness_marker?: string
}

type AgentFoundationPayload = {
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

type AgentChannelBindingPayload = {
  tenant_id?: string
  agent_id?: string
  supported_channels?: string[]
  public_channel_supported?: boolean
  public_channel_required?: boolean
  public_channel_in_use?: boolean
  readiness_status?: string
  release_readiness_marker?: string
  metering_interpretation_markers?: string[]
  release_handoff_target?: string
  bindings?: Array<Record<string, unknown>>
  issues?: string[]
}

function readString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid agents response: ${field}`)
  }

  return value
}

function readOptionalString(value: unknown, field: string) {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') {
    throw new Error(`Invalid agents response: ${field}`)
  }

  return value
}

function readNumber(value: unknown, field: string) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Invalid agents response: ${field}`)
  }

  return value
}

function readStringArray(value: unknown, field: string) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`Invalid agents response: ${field}`)
  }

  return value
}

function mapMetadata(payload: ListMetadataPayload | undefined): AgentListMetadata {
  if (!payload) throw new Error('Invalid agents response: metadata')

  return {
    page: readNumber(payload.page, 'metadata.page'),
    pageSize: readNumber(payload.page_size, 'metadata.page_size'),
    totalItems: readNumber(payload.total_items, 'metadata.total_items'),
    returnedItems: readNumber(payload.returned_items, 'metadata.returned_items'),
    ordering: readString(payload.ordering, 'metadata.ordering'),
  }
}

function mapAgentCard(payload: AgentCardPayload): AgentCard {
  return {
    agentId: readString(payload.agent_id, 'agent_id'),
    tenantId: readString(payload.tenant_id, 'tenant_id'),
    name: readString(payload.name, 'name'),
    description: readOptionalString(payload.description, 'description'),
    purpose: readOptionalString(payload.purpose, 'purpose'),
    archetypeId: readString(payload.archetype_id, 'archetype_id'),
    templateId: readOptionalString(payload.template_id, 'template_id'),
    lifecycleStatus: readString(payload.lifecycle_status, 'lifecycle_status'),
    status: readString(payload.status, 'status'),
    activeConfigId: readOptionalString(payload.active_config_id, 'active_config_id'),
    readinessStatus: readString(payload.readiness_status, 'readiness_status'),
    releaseReady: payload.release_ready === true,
    blockingItemCount: readNumber(payload.blocking_item_count, 'blocking_item_count'),
    detailRoute: readString(payload.detail_route, 'detail_route'),
  }
}

function mapAgentSnapshot(payload: AgentSnapshotPayload | undefined): AgentSnapshot {
  if (!payload) throw new Error('Invalid agents response: resource')

  return {
    id: readString(payload.id, 'id'),
    tenantId: readString(payload.tenant_id, 'tenant_id'),
    name: readString(payload.name, 'name'),
    description: readOptionalString(payload.description, 'description'),
    purpose: readOptionalString(payload.purpose, 'purpose'),
    archetypeId: readString(payload.archetype_id, 'archetype_id'),
    templateId: readOptionalString(payload.template_id, 'template_id'),
    lifecycleStatus: readString(payload.lifecycle_status, 'lifecycle_status'),
    status: readString(payload.status, 'status'),
    activeConfigId: readOptionalString(payload.active_config_id, 'active_config_id'),
  }
}

function mapMutationResult(payload: MutationResultPayload | undefined): AgentMutationResult {
  if (!payload) throw new Error('Invalid agents response: result')

  return {
    action: readString(payload.action, 'result.action'),
    resourceType: readString(payload.resource_type, 'result.resource_type'),
    resourceId: readOptionalString(payload.resource_id, 'result.resource_id'),
    actorId: readOptionalString(payload.actor_id, 'result.actor_id'),
    actorType: readOptionalString(payload.actor_type, 'result.actor_type'),
    tenantId: readOptionalString(payload.tenant_id, 'result.tenant_id'),
    correlationId: readOptionalString(payload.correlation_id, 'result.correlation_id'),
    mutationTimestamp: readString(payload.mutation_timestamp, 'result.mutation_timestamp'),
    changedStateSummary: payload.changed_state_summary ?? {},
  }
}

function mapSetupSummary(payload: SetupSummaryPayload | undefined): PortalSetupReadinessSummary {
  if (!payload) throw new Error('Invalid agents response: setup_readiness_summary')

  return {
    overallReadinessStatus: readString(payload.overall_readiness_status, 'setup.overall_readiness_status'),
    releaseReady: payload.release_ready === true,
    blockingItemCount: readNumber(payload.blocking_item_count, 'setup.blocking_item_count'),
    tenantStatus: readString(payload.tenant_status, 'setup.tenant_status'),
    agentLifecycleStatus: readString(payload.agent_lifecycle_status, 'setup.agent_lifecycle_status'),
    archetypeTemplateStatus: readString(payload.archetype_template_status, 'setup.archetype_template_status'),
    agentConfigStatus: readString(payload.agent_config_status, 'setup.agent_config_status'),
    knowledgeStatus: readString(payload.knowledge_status, 'setup.knowledge_status'),
    capabilityStatus: readString(payload.capability_status, 'setup.capability_status'),
    policyStatus: readString(payload.policy_status, 'setup.policy_status'),
    policyBindingMode: readOptionalString(payload.policy_binding_mode, 'setup.policy_binding_mode'),
    siteWidgetStatus: readString(payload.site_widget_status, 'setup.site_widget_status'),
    publicChannelRequired: payload.public_channel_required === true,
    publicChannelInUse: payload.public_channel_in_use === true,
    meteringInterpretationMarkers: readStringArray(payload.metering_interpretation_markers, 'setup.metering_interpretation_markers'),
    releaseHandoffTarget: readString(payload.release_handoff_target, 'setup.release_handoff_target'),
  }
}

function mapFoundationSummary(payload: FoundationSummaryPayload | undefined): FoundationSummary {
  if (!payload) throw new Error('Invalid agents response: foundation_assessment_summary')

  return {
    validationStatus: readOptionalString(payload.validation_status, 'foundation.validation_status'),
    compatibilityStatus: readOptionalString(payload.compatibility_status, 'foundation.compatibility_status'),
    processingPath: readOptionalString(payload.processing_path, 'foundation.processing_path'),
    normalized: payload.normalized ?? null,
    safeDefaultsApplied: payload.safe_defaults_applied === true,
    fallbackEligible: payload.fallback_eligible === true,
    provenanceMarker: readOptionalString(payload.provenance_marker, 'foundation.provenance_marker'),
    issueCount: readNumber(payload.issue_count, 'foundation.issue_count'),
    issues: readStringArray(payload.issues, 'foundation.issues'),
    compatibilityNotes: readStringArray(payload.compatibility_notes, 'foundation.compatibility_notes'),
  }
}

function mapChannelSummary(payload: ChannelSummaryPayload | undefined): ChannelSummary {
  if (!payload) throw new Error('Invalid agents response: channel_binding_summary')

  return {
    supportedChannels: readStringArray(payload.supported_channels, 'channels.supported_channels'),
    publicChannelSupported: payload.public_channel_supported === true,
    readinessStatus: readString(payload.readiness_status, 'channels.readiness_status'),
    publicChannelRequired: payload.public_channel_required === true,
    publicChannelInUse: payload.public_channel_in_use === true,
    bindingCount: readNumber(payload.binding_count, 'channels.binding_count'),
    readyBindingCount: readNumber(payload.ready_binding_count, 'channels.ready_binding_count'),
    meteringInterpretationMarkers: readStringArray(payload.metering_interpretation_markers, 'channels.metering_interpretation_markers'),
    releaseHandoffTarget: readString(payload.release_handoff_target, 'channels.release_handoff_target'),
    issueCount: readNumber(payload.issue_count, 'channels.issue_count'),
  }
}

function mapPortalAgentDetail(payload: PortalAgentDetailPayload): PortalAgentDetail {
  const supportedMutationActions = payload.supported_mutation_actions ?? payload.supported_mutation_action_refs

  return {
    agentId: readString(payload.agent_id, 'agent_id'),
    tenantId: readString(payload.tenant_id, 'tenant_id'),
    name: readString(payload.name, 'name'),
    description: readOptionalString(payload.description, 'description'),
    purpose: readOptionalString(payload.purpose, 'purpose'),
    status: readString(payload.status, 'status'),
    lifecycleStatus: readString(payload.lifecycle_status, 'lifecycle_status'),
    archetypeId: readString(payload.archetype_id, 'archetype_id'),
    templateId: readOptionalString(payload.template_id, 'template_id'),
    activeConfigId: readOptionalString(payload.active_config_id, 'active_config_id'),
    setupReadinessSummary: mapSetupSummary(payload.setup_readiness_summary),
    foundationAssessmentSummary: mapFoundationSummary(payload.foundation_assessment_summary),
    channelBindingSummary: mapChannelSummary(payload.channel_binding_summary),
    supportedMutationActions: readStringArray(supportedMutationActions, 'supported_mutation_action_refs'),
    agent: mapAgentCard(payload.agent ?? {
      agent_id: payload.agent_id,
      tenant_id: payload.tenant_id,
      name: payload.name,
      description: payload.description,
      purpose: payload.purpose,
      archetype_id: payload.archetype_id,
      template_id: payload.template_id,
      lifecycle_status: payload.lifecycle_status,
      status: payload.status,
      active_config_id: payload.active_config_id,
      readiness_status: payload.setup_readiness_summary?.overall_readiness_status,
      release_ready: payload.setup_readiness_summary?.release_ready,
      blocking_item_count: payload.setup_readiness_summary?.blocking_item_count,
      detail_route: `/tenants/${payload.tenant_id}/agents/${payload.agent_id}`,
    }),
  }
}

function mapMutationResponse(payload: MutationResponsePayload): AgentMutationResponse {
  return {
    resource: mapAgentSnapshot(payload.resource),
    result: mapMutationResult(payload.result),
  }
}

function mapAgentChannelBinding(payload: AgentChannelBindingPayload | undefined): AgentChannelBinding {
  if (!payload) throw new Error('Invalid agents response: channel_binding')

  return {
    tenantId: readString(payload.tenant_id, 'channel_binding.tenant_id'),
    agentId: readString(payload.agent_id, 'channel_binding.agent_id'),
    supportedChannels: readStringArray(payload.supported_channels, 'channel_binding.supported_channels'),
    publicChannelSupported: payload.public_channel_supported === true,
    publicChannelRequired: payload.public_channel_required === true,
    publicChannelInUse: payload.public_channel_in_use === true,
    readinessStatus: readString(payload.readiness_status, 'channel_binding.readiness_status'),
    releaseReadinessMarker: readString(payload.release_readiness_marker, 'channel_binding.release_readiness_marker'),
    meteringInterpretationMarkers: readStringArray(payload.metering_interpretation_markers, 'channel_binding.metering_interpretation_markers'),
    releaseHandoffTarget: readString(payload.release_handoff_target, 'channel_binding.release_handoff_target'),
    bindings: Array.isArray(payload.bindings) ? payload.bindings : [],
    issues: readStringArray(payload.issues, 'channel_binding.issues'),
  }
}

function mapSetupChecklist(payload: SetupChecklistPayload): SetupChecklist {
  if (!Array.isArray(payload.items)) {
    throw new Error('Invalid agents response: setup checklist items')
  }

  return {
    tenantId: readString(payload.tenant_id, 'setup_checklist.tenant_id'),
    agentId: readString(payload.agent_id, 'setup_checklist.agent_id'),
    archetypeId: readString(payload.archetype_id, 'setup_checklist.archetype_id'),
    templateId: readOptionalString(payload.template_id, 'setup_checklist.template_id'),
    lifecycleStatus: readString(payload.lifecycle_status, 'setup_checklist.lifecycle_status'),
    releaseReady: payload.release_ready === true,
    summary: mapSetupSummary(payload.summary),
    channelBinding: mapAgentChannelBinding(payload.channel_binding),
    items: payload.items.map((item) => ({
      itemId: readString(item.item_id, 'setup_checklist.items.item_id'),
      ownerArea: readString(item.owner_area, 'setup_checklist.items.owner_area'),
      state: readString(item.state, 'setup_checklist.items.state'),
      blocking: item.blocking === true,
      detail: readString(item.detail, 'setup_checklist.items.detail'),
      requiredAction: readOptionalString(item.required_action, 'setup_checklist.items.required_action'),
      releaseReadinessMarker: readString(item.release_readiness_marker, 'setup_checklist.items.release_readiness_marker'),
    })),
  }
}

function mapFoundationAssessment(payload: AgentFoundationPayload): AgentFoundationAssessment {
  return {
    validationStatus: readString(payload.validation_status, 'foundation.validation_status'),
    compatibilityStatus: readString(payload.compatibility_status, 'foundation.compatibility_status'),
    processingPath: readString(payload.processing_path, 'foundation.processing_path'),
    normalized: payload.normalized === true,
    safeDefaultsApplied: payload.safe_defaults_applied === true,
    fallbackEligible: payload.fallback_eligible === true,
    provenanceMarker: readString(payload.provenance_marker, 'foundation.provenance_marker'),
    issues: readStringArray(payload.issues, 'foundation.issues'),
    compatibilityNotes: readStringArray(payload.compatibility_notes, 'foundation.compatibility_notes'),
  }
}

export const agentsApi = {
  async listPortalAgents(tenantId: string): Promise<AgentListResult> {
    const response = await apiClient.get<AgentListPayload>(`${PORTAL_PREFIX}/${tenantId}/agents`)
    return {
      items: (response.data.items ?? []).map(mapAgentCard),
      metadata: mapMetadata(response.data.metadata),
    }
  },

  async getPortalAgentDetail(tenantId: string, agentId: string): Promise<PortalAgentDetail> {
    const response = await apiClient.get<PortalAgentDetailPayload>(`${PORTAL_PREFIX}/${tenantId}/agents/${agentId}`)
    return mapPortalAgentDetail(response.data)
  },

  async createAgent(input: CreateAgentInput): Promise<AgentMutationResponse> {
    const response = await apiClient.post<MutationResponsePayload>(`${TENANTS_PREFIX}/${input.tenantId}/agents`, {
      name: input.name,
      description: input.description,
      purpose: input.purpose,
      archetype_id: input.archetypeId,
      template_id: input.templateId,
      lifecycle_status: input.lifecycleStatus,
    })
    return mapMutationResponse(response.data)
  },

  async updateAgentMetadata(input: UpdateAgentMetadataInput): Promise<AgentMutationResponse> {
    const response = await apiClient.patch<MutationResponsePayload>(
      `${TENANTS_PREFIX}/${input.tenantId}/agents/${input.agentId}`,
      {
        name: input.name,
        description: input.description,
        purpose: input.purpose,
      },
    )
    return mapMutationResponse(response.data)
  },

  async updateAgentStatus(tenantId: string, agentId: string, status: string): Promise<AgentMutationResponse> {
    const response = await apiClient.patch<MutationResponsePayload>(`${TENANTS_PREFIX}/${tenantId}/agents/${agentId}/status`, {
      status,
    })
    return mapMutationResponse(response.data)
  },

  async updateAgentLifecycle(tenantId: string, agentId: string, lifecycleStatus: string): Promise<AgentMutationResponse> {
    const response = await apiClient.patch<MutationResponsePayload>(`${TENANTS_PREFIX}/${tenantId}/agents/${agentId}/lifecycle`, {
      lifecycle_status: lifecycleStatus,
    })
    return mapMutationResponse(response.data)
  },

  async getSetupChecklist(tenantId: string, agentId: string): Promise<SetupChecklist> {
    const response = await apiClient.get<SetupChecklistPayload>(`${TENANTS_PREFIX}/${tenantId}/agents/${agentId}/setup-checklist`)
    return mapSetupChecklist(response.data)
  },

  async getFoundationAssessment(tenantId: string, agentId: string): Promise<AgentFoundationAssessment> {
    const response = await apiClient.get<AgentFoundationPayload>(`${TENANTS_PREFIX}/${tenantId}/agents/${agentId}/foundation-assessment`)
    return mapFoundationAssessment(response.data)
  },

  async getChannelBinding(tenantId: string, agentId: string): Promise<AgentChannelBinding> {
    const response = await apiClient.get<AgentChannelBindingPayload>(`${TENANTS_PREFIX}/${tenantId}/agents/${agentId}/channel-binding`)
    return mapAgentChannelBinding(response.data)
  },
}
