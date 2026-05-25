import { apiClient } from '@/core/api/apiClient'

const TENANTS_PREFIX = '/api/admin/v1/tenants'

export type AgentArchetype = {
  archetypeId: string
  label: string
  purpose: string
  supportedChannels: string[]
  defaultSetupGuidance: string[]
}

export type AgentTemplateChecklistRequirement = {
  itemId: string
  ownerArea: string
  blocking: boolean
  requiredAction: string
  detail: string
  releaseReadinessMarker: string
}

export type AgentTemplate = {
  templateId: string
  archetypeId: string
  label: string
  purpose: string
  defaultAgentPurpose: string
  defaultAgentDescription: string | null
  defaultSetupGuidance: string[]
  requiredKnowledgeModes: string[]
  optionalKnowledgeModes: string[]
  requiredCapabilityCategories: string[]
  optionalCapabilityCategories: string[]
  policyExpectations: string[]
  supportedChannels: string[]
  checklistRequirements: AgentTemplateChecklistRequirement[]
  evaluationSmokeMarkers: string[]
  meteringInterpretationMarkers: string[]
}

export type AgentCatalog = {
  archetypes: AgentArchetype[]
  templates: AgentTemplate[]
}

type AgentArchetypePayload = {
  archetype_id?: string
  label?: string
  purpose?: string
  supported_channels?: string[]
  default_setup_guidance?: string[]
}

type AgentTemplateChecklistRequirementPayload = {
  item_id?: string
  owner_area?: string
  blocking?: boolean
  required_action?: string
  detail?: string
  release_readiness_marker?: string
}

type AgentTemplatePayload = {
  template_id?: string
  archetype_id?: string
  label?: string
  purpose?: string
  default_agent_purpose?: string
  default_agent_description?: string | null
  default_setup_guidance?: string[]
  required_knowledge_modes?: string[]
  optional_knowledge_modes?: string[]
  required_capability_categories?: string[]
  optional_capability_categories?: string[]
  policy_expectations?: string[]
  supported_channels?: string[]
  checklist_requirements?: AgentTemplateChecklistRequirementPayload[]
  evaluation_smoke_markers?: string[]
  metering_interpretation_markers?: string[]
}

type AgentCatalogPayload = {
  archetypes?: AgentArchetypePayload[]
  templates?: AgentTemplatePayload[]
}

function readString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid agent catalog response: ${field}`)
  }

  return value
}

function readOptionalString(value: unknown, field: string) {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') {
    throw new Error(`Invalid agent catalog response: ${field}`)
  }

  return value
}

function readStringArray(value: unknown, field: string) {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`Invalid agent catalog response: ${field}`)
  }

  return value
}

function mapChecklistRequirement(payload: AgentTemplateChecklistRequirementPayload): AgentTemplateChecklistRequirement {
  return {
    itemId: readString(payload.item_id, 'checklist_requirements.item_id'),
    ownerArea: readString(payload.owner_area, 'checklist_requirements.owner_area'),
    blocking: payload.blocking === true,
    requiredAction: readString(payload.required_action, 'checklist_requirements.required_action'),
    detail: readString(payload.detail, 'checklist_requirements.detail'),
    releaseReadinessMarker: readString(payload.release_readiness_marker, 'checklist_requirements.release_readiness_marker'),
  }
}

function mapArchetype(payload: AgentArchetypePayload): AgentArchetype {
  return {
    archetypeId: readString(payload.archetype_id, 'archetype_id'),
    label: readString(payload.label, 'label'),
    purpose: readString(payload.purpose, 'purpose'),
    supportedChannels: readStringArray(payload.supported_channels, 'supported_channels'),
    defaultSetupGuidance: readStringArray(payload.default_setup_guidance, 'default_setup_guidance'),
  }
}

function mapTemplate(payload: AgentTemplatePayload): AgentTemplate {
  const requirements = payload.checklist_requirements
  if (!Array.isArray(requirements)) {
    throw new Error('Invalid agent catalog response: checklist_requirements')
  }

  return {
    templateId: readString(payload.template_id, 'template_id'),
    archetypeId: readString(payload.archetype_id, 'archetype_id'),
    label: readString(payload.label, 'label'),
    purpose: readString(payload.purpose, 'purpose'),
    defaultAgentPurpose: readString(payload.default_agent_purpose, 'default_agent_purpose'),
    defaultAgentDescription: readOptionalString(payload.default_agent_description, 'default_agent_description'),
    defaultSetupGuidance: readStringArray(payload.default_setup_guidance, 'default_setup_guidance'),
    requiredKnowledgeModes: readStringArray(payload.required_knowledge_modes, 'required_knowledge_modes'),
    optionalKnowledgeModes: readStringArray(payload.optional_knowledge_modes, 'optional_knowledge_modes'),
    requiredCapabilityCategories: readStringArray(payload.required_capability_categories, 'required_capability_categories'),
    optionalCapabilityCategories: readStringArray(payload.optional_capability_categories, 'optional_capability_categories'),
    policyExpectations: readStringArray(payload.policy_expectations, 'policy_expectations'),
    supportedChannels: readStringArray(payload.supported_channels, 'supported_channels'),
    checklistRequirements: requirements.map(mapChecklistRequirement),
    evaluationSmokeMarkers: readStringArray(payload.evaluation_smoke_markers, 'evaluation_smoke_markers'),
    meteringInterpretationMarkers: readStringArray(payload.metering_interpretation_markers, 'metering_interpretation_markers'),
  }
}

function mapCatalog(payload: AgentCatalogPayload): AgentCatalog {
  if (!Array.isArray(payload.archetypes) || !Array.isArray(payload.templates)) {
    throw new Error('Invalid agent catalog response')
  }

  return {
    archetypes: payload.archetypes.map(mapArchetype),
    templates: payload.templates.map(mapTemplate),
  }
}

export const agentTemplatesApi = {
  async getCatalog(tenantId: string): Promise<AgentCatalog> {
    const response = await apiClient.get<AgentCatalogPayload>(`${TENANTS_PREFIX}/${tenantId}/agent-catalog`)
    return mapCatalog(response.data)
  },
}
