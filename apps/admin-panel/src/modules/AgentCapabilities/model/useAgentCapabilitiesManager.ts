import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import {
  agentCapabilitiesApi,
  type AgentCapabilityCatalog,
  type AgentCapabilityCatalogItem,
  type AgentCapabilityMutationResult,
  type AgentCapabilityProfile,
  type AgentCapabilityProfileInput,
} from '@/modules/AgentCapabilities/api/agentCapabilitiesApi'
import { agentsApi, type PortalAgentDetail } from '@/modules/Agents'

const CAPABILITY_ACTION_REFS = [
  'capability.assignments.manage',
  'capabilities.assignments.manage',
  'agent_capabilities.manage',
  'agent.capabilities.manage',
  'agents.capabilities.manage',
]

function canMutateCapabilities(adminUser: { role: string; permissions?: string[] } | null) {
  if (!adminUser) return false
  const permissions = adminUser.permissions ?? []
  if (
    ['agents:write', 'agent:write', 'agent-capabilities:write', 'agent_capabilities:write', 'manage-agents'].some(
      (permission) => permissions.includes(permission),
    )
  ) {
    return true
  }
  return adminUser.role === 'platform_admin'
}

export function deriveAgentCapabilitiesCanManage(supportedMutationActions: string[], canMutate: boolean) {
  const supported = new Set(supportedMutationActions)
  return canMutate && CAPABILITY_ACTION_REFS.some((actionRef) => supported.has(actionRef))
}

export type AgentCapabilitiesForm = AgentCapabilityProfileInput

function defaultForm(): AgentCapabilitiesForm {
  return {
    explicitNoExternalActions: false,
    assignments: [],
  }
}

function formFromProfile(profile: AgentCapabilityProfile | null, catalog: AgentCapabilityCatalog | null): AgentCapabilitiesForm {
  if (!profile || !catalog) return defaultForm()
  return {
    explicitNoExternalActions: profile.explicitNoExternalActions,
    assignments: catalog.items.map((item) => {
      const assignment = profile.assignments.find((candidate) => candidate.capabilityId === item.capabilityId)
      return {
        capabilityId: item.capabilityId,
        capabilityVersion: assignment?.capabilityVersion ?? item.capabilityVersion,
        enabled: assignment?.enabled ?? false,
      }
    }),
  }
}

function areCapabilityFormsEqual(left: AgentCapabilitiesForm, right: AgentCapabilitiesForm) {
  if (left.explicitNoExternalActions !== right.explicitNoExternalActions) return false
  if (left.assignments.length !== right.assignments.length) return false

  const rightById = new Map(right.assignments.map((assignment) => [assignment.capabilityId, assignment]))
  return left.assignments.every((assignment) => {
    const candidate = rightById.get(assignment.capabilityId)
    if (!candidate) return false
    return (
      candidate.capabilityVersion === assignment.capabilityVersion &&
      candidate.enabled === assignment.enabled
    )
  })
}

function isRecommendedSmokeCapability(item: AgentCapabilityCatalogItem | undefined) {
  if (!item) return false
  return (
    item.capabilityId === 'cap_search' ||
    item.capabilityId.includes('retrieval.fetch_grounding') ||
    item.downstreamExecutionKind === 'retrieval' ||
    item.sideEffectClass === 'read'
  )
}

function isExternalSideEffectCapability(item: AgentCapabilityCatalogItem | undefined) {
  if (!item) return false
  return (
    item.sideEffectClass === 'external_side_effect' ||
    item.sideEffectClass === 'execution_environment_effect' ||
    item.downstreamExecutionKind === 'integration' ||
    item.downstreamExecutionKind === 'execution_environment' ||
    item.downstreamExecutionKind === 'workflow' ||
    item.category === 'workflow_trigger' ||
    item.capabilityId.includes('human_handoff')
  )
}

export function useAgentCapabilitiesManager(tenantId: string, agentId: string) {
  const { adminUser } = useAuth()
  const { t } = useI18n()
  const [agentDetail, setAgentDetail] = useState<PortalAgentDetail | null>(null)
  const [catalog, setCatalog] = useState<AgentCapabilityCatalog | null>(null)
  const [profile, setProfile] = useState<AgentCapabilityProfile | null>(null)
  const [form, setForm] = useState<AgentCapabilitiesForm>(() => defaultForm())
  const [mutationResult, setMutationResult] = useState<AgentCapabilityMutationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const canMutate = canMutateCapabilities(adminUser)
  const canManageCapabilities = useMemo(
    () => deriveAgentCapabilitiesCanManage(agentDetail?.supportedMutationActions ?? [], canMutate),
    [agentDetail?.supportedMutationActions, canMutate],
  )
  const capabilityById = useMemo(
    () => new Map(catalog?.items.map((item) => [item.capabilityId, item]) ?? []),
    [catalog?.items],
  )
  const persistedForm = useMemo(() => formFromProfile(profile, catalog), [catalog, profile])
  const isDirty = useMemo(() => !areCapabilityFormsEqual(form, persistedForm), [form, persistedForm])

  const loadCapabilities = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [agent, catalogResult, profileResult] = await Promise.all([
        agentsApi.getPortalAgentDetail(tenantId, agentId),
        agentCapabilitiesApi.getCatalog(tenantId, agentId),
        agentCapabilitiesApi.getAssignments(tenantId, agentId),
      ])
      setAgentDetail(agent)
      setCatalog(catalogResult)
      setProfile(profileResult)
      setForm(formFromProfile(profileResult, catalogResult))
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('agent_capabilities.load_error')))
    } finally {
      setIsLoading(false)
    }
  }, [agentId, tenantId, t])

  useEffect(() => {
    void loadCapabilities()
  }, [loadCapabilities])

  const setExplicitNoExternalActions = useCallback((value: boolean) => {
    setForm((current) => ({
      ...current,
      explicitNoExternalActions: value,
      assignments: value
        ? current.assignments.map((assignment) => (
          isExternalSideEffectCapability(capabilityById.get(assignment.capabilityId))
            ? { ...assignment, enabled: false }
            : assignment
        ))
        : current.assignments,
    }))
    setFormError(null)
  }, [capabilityById])

  const setCapabilityEnabled = useCallback((capabilityId: string, enabled: boolean) => {
    const item = capabilityById.get(capabilityId)
    setForm((current) => ({
      ...current,
      explicitNoExternalActions: current.explicitNoExternalActions,
      assignments: current.assignments.map((assignment) => (
        assignment.capabilityId === capabilityId
          ? { ...assignment, enabled: enabled && current.explicitNoExternalActions && isExternalSideEffectCapability(item) ? false : enabled }
          : assignment
      )),
    }))
    setFormError(enabled && form.explicitNoExternalActions && isExternalSideEffectCapability(item) ? t('agent_capabilities.validation.external_actions_blocked') : null)
  }, [capabilityById, form.explicitNoExternalActions, t])

  const applyRecommendedSmokeSet = useCallback(() => {
    setForm((current) => ({
      ...current,
      explicitNoExternalActions: true,
      assignments: current.assignments.map((assignment) => {
        const item = capabilityById.get(assignment.capabilityId)
        return {
          ...assignment,
          enabled: isRecommendedSmokeCapability(item) && !isExternalSideEffectCapability(item),
        }
      }),
    }))
    setFormError(null)
  }, [capabilityById])

  const updateAssignments = useCallback(async () => {
    if (!canManageCapabilities) {
      setFormError(t('agent_capabilities.action_not_available'))
      return
    }
    if (!isDirty) return
    setIsMutating(true)
    setFormError(null)
    setNotice(null)
    setMutationResult(null)
    try {
      const response = await agentCapabilitiesApi.updateAssignments(tenantId, agentId, form)
      setProfile(response.resource)
      setMutationResult(response.result)
      setNotice(t('agent_capabilities.notice.ready_next_policy'))
      await loadCapabilities()
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('agent_capabilities.action_error')))
    } finally {
      setIsMutating(false)
    }
  }, [agentId, canManageCapabilities, form, isDirty, loadCapabilities, tenantId, t])

  return {
    tenantId,
    agentId,
    agentDetail,
    catalog,
    profile,
    form,
    mutationResult,
    isDirty,
    canManageCapabilities,
    isLoading,
    isMutating,
    errorMessage,
    formError,
    notice,
    loadCapabilities,
    setExplicitNoExternalActions,
    setCapabilityEnabled,
    applyRecommendedSmokeSet,
    updateAssignments,
  }
}

export type AgentCapabilitiesManager = ReturnType<typeof useAgentCapabilitiesManager>
