import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import {
  agentsApi,
  type AgentChannelBinding,
  type AgentFoundationAssessment,
  type AgentMutationResult,
  type PortalAgentDetail,
  type SetupChecklist,
} from '@/modules/Agents/api/agentsApi'

export type AgentEditForm = {
  name: string
  description: string
  purpose: string
}

export type AgentAllowedMutationActions = {
  updateMetadata: boolean
  changeStatus: boolean
  changeLifecycle: boolean
}

const AGENT_STAGE_06_ACTION_REFS: Record<keyof AgentAllowedMutationActions, string[]> = {
  updateMetadata: ['agents.update_metadata', 'agent.update_metadata'],
  changeStatus: ['agents.change_status', 'agent.change_status', 'agent.update_status'],
  changeLifecycle: ['agents.change_lifecycle', 'agent.change_lifecycle', 'agent.update_lifecycle'],
}

function canMutateAgents(adminUser: { role: string; permissions?: string[] } | null) {
  if (!adminUser) return false
  const permissions = adminUser.permissions ?? []
  if (['agents:write', 'agent:write', 'manage-agents', 'manage_agents'].some((permission) => permissions.includes(permission))) {
    return true
  }
  return adminUser.role === 'platform_admin'
}

export function deriveAgentAllowedMutationActions(supportedMutationActions: string[], canMutate: boolean): AgentAllowedMutationActions {
  const supported = new Set(supportedMutationActions)
  return {
    updateMetadata: canMutate && AGENT_STAGE_06_ACTION_REFS.updateMetadata.some((actionRef) => supported.has(actionRef)),
    changeStatus: canMutate && AGENT_STAGE_06_ACTION_REFS.changeStatus.some((actionRef) => supported.has(actionRef)),
    changeLifecycle: canMutate && AGENT_STAGE_06_ACTION_REFS.changeLifecycle.some((actionRef) => supported.has(actionRef)),
  }
}

export function useAgentDetailManager(tenantId: string, agentId: string) {
  const { adminUser } = useAuth()
  const { t } = useI18n()
  const [detail, setDetail] = useState<PortalAgentDetail | null>(null)
  const [setupChecklist, setSetupChecklist] = useState<SetupChecklist | null>(null)
  const [foundationAssessment, setFoundationAssessment] = useState<AgentFoundationAssessment | null>(null)
  const [channelBinding, setChannelBinding] = useState<AgentChannelBinding | null>(null)
  const [editForm, setEditForm] = useState<AgentEditForm>({ name: '', description: '', purpose: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [mutationResult, setMutationResult] = useState<AgentMutationResult | null>(null)

  const canMutate = canMutateAgents(adminUser)
  const allowedMutationActions = useMemo(
    () => deriveAgentAllowedMutationActions(detail?.supportedMutationActions ?? [], canMutate),
    [canMutate, detail?.supportedMutationActions],
  )

  const loadAgent = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const nextDetail = await agentsApi.getPortalAgentDetail(tenantId, agentId)
      const [nextChecklist, nextFoundation, nextChannel] = await Promise.allSettled([
        agentsApi.getSetupChecklist(tenantId, agentId),
        agentsApi.getFoundationAssessment(tenantId, agentId),
        agentsApi.getChannelBinding(tenantId, agentId),
      ])
      setDetail(nextDetail)
      setSetupChecklist(nextChecklist.status === 'fulfilled' ? nextChecklist.value : null)
      setFoundationAssessment(nextFoundation.status === 'fulfilled' ? nextFoundation.value : null)
      setChannelBinding(nextChannel.status === 'fulfilled' ? nextChannel.value : null)
      setEditForm({
        name: nextDetail.name,
        description: nextDetail.description ?? '',
        purpose: nextDetail.purpose ?? '',
      })
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('agents.detail.load_error')))
    } finally {
      setIsLoading(false)
    }
  }, [agentId, tenantId, t])

  useEffect(() => {
    void loadAgent()
  }, [loadAgent])

  const updateEditForm = useCallback((patch: Partial<AgentEditForm>) => {
    setEditForm((current) => ({ ...current, ...patch }))
    setFormError(null)
  }, [])

  const applyMutation = useCallback(async (mutation: () => Promise<{ result: AgentMutationResult }>, successMessage: string) => {
    setIsMutating(true)
    setFormError(null)
    setNotice(null)
    setMutationResult(null)
    try {
      const result = await mutation()
      setMutationResult(result.result)
      setNotice(successMessage)
      await loadAgent()
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('agents.detail.action_error')))
    } finally {
      setIsMutating(false)
    }
  }, [loadAgent, t])

  const saveMetadata = useCallback(async () => {
    if (!allowedMutationActions.updateMetadata) {
      setFormError(t('agents.detail.action_not_available'))
      return
    }
    const name = editForm.name.trim()
    if (!name) {
      setFormError(t('agents.create.name_error'))
      return
    }

    await applyMutation(
      () => agentsApi.updateAgentMetadata({
        tenantId,
        agentId,
        name,
        description: editForm.description.trim() || null,
        purpose: editForm.purpose.trim() || null,
      }),
      t('agents.detail.notice_metadata'),
    )
  }, [agentId, allowedMutationActions.updateMetadata, applyMutation, editForm, tenantId, t])

  const updateStatus = useCallback(async (status: string) => {
    if (!allowedMutationActions.changeStatus) {
      setFormError(t('agents.detail.action_not_available'))
      return
    }
    await applyMutation(() => agentsApi.updateAgentStatus(tenantId, agentId, status), t('agents.detail.notice_status'))
  }, [agentId, allowedMutationActions.changeStatus, applyMutation, tenantId, t])

  const updateLifecycle = useCallback(async (lifecycleStatus: string) => {
    if (!allowedMutationActions.changeLifecycle) {
      setFormError(t('agents.detail.action_not_available'))
      return
    }
    await applyMutation(() => agentsApi.updateAgentLifecycle(tenantId, agentId, lifecycleStatus), t('agents.detail.notice_lifecycle'))
  }, [agentId, allowedMutationActions.changeLifecycle, applyMutation, tenantId, t])

  return {
    tenantId,
    agentId,
    detail,
    setupChecklist,
    foundationAssessment,
    channelBinding,
    editForm,
    canMutate,
    allowedMutationActions,
    isLoading,
    isMutating,
    errorMessage,
    formError,
    notice,
    mutationResult,
    loadAgent,
    updateEditForm,
    saveMetadata,
    updateStatus,
    updateLifecycle,
  }
}

export type AgentDetailManager = ReturnType<typeof useAgentDetailManager>
