import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import { agentsApi, type PortalAgentDetail } from '@/modules/Agents'
import {
  agentKnowledgeBindingApi,
  type AgentKnowledgeBinding,
  type AgentKnowledgeBindingInput,
  type AgentKnowledgeCatalog,
  type AgentKnowledgeMutationResult,
  type PortalAgentKnowledgeStatus,
} from '@/modules/AgentKnowledgeBinding/api/agentKnowledgeBindingApi'

const KNOWLEDGE_ACTION_REFS = [
  'knowledge.manage',
  'knowledge.sources.manage',
  'knowledge.documents.manage',
  'knowledge.indexing.manage',
  'knowledge.binding.manage',
  'agent_knowledge.manage',
  'agent.knowledge.manage',
  'agents.knowledge.manage',
]

function canMutateKnowledge(adminUser: { role: string; permissions?: string[] } | null) {
  if (!adminUser) return false
  const permissions = adminUser.permissions ?? []
  if (
    ['knowledge:write', 'agent-knowledge:write', 'agent_knowledge:write', 'manage-knowledge', 'manage_knowledge'].some(
      (permission) => permissions.includes(permission),
    )
  ) {
    return true
  }
  return adminUser.role === 'platform_admin'
}

export function deriveAgentKnowledgeCanManage(supportedMutationActions: string[], canMutate: boolean) {
  const supported = new Set(supportedMutationActions)
  return canMutate && KNOWLEDGE_ACTION_REFS.some((actionRef) => supported.has(actionRef))
}

export type AgentKnowledgeBindingForm = AgentKnowledgeBindingInput

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))]
}

export function resolveAgentKnowledgeRetrievalModes(
  catalog: AgentKnowledgeCatalog | null,
  form: AgentKnowledgeBindingInput,
) {
  if (!catalog || form.bindingMode === 'no_knowledge') return []

  const sourceIds = form.bindingMode === 'source_set'
    ? catalog.sourceSets.find((sourceSet) => sourceSet.sourceSetId === form.sourceSetId)?.sourceIds ?? []
    : form.sourceIds
  const selectedSources = sourceIds
    .map((sourceId) => catalog.sources.find((source) => source.sourceId === sourceId))
    .filter((source): source is AgentKnowledgeCatalog['sources'][number] => Boolean(source))

  if (selectedSources.length === 0) {
    return unique(catalog.sources.flatMap((source) => source.allowedRetrievalModes))
  }

  const [firstSource, ...restSources] = selectedSources
  return firstSource.allowedRetrievalModes.filter((mode) => (
    restSources.every((source) => source.allowedRetrievalModes.includes(mode))
  ))
}

export function normalizeAgentKnowledgeBindingInput(
  catalog: AgentKnowledgeCatalog | null,
  input: AgentKnowledgeBindingInput,
) {
  if (input.bindingMode === 'no_knowledge') {
    return { ...input, sourceSetId: null, sourceIds: [], retrievalMode: null }
  }

  const allowedModes = resolveAgentKnowledgeRetrievalModes(catalog, input)
  const retrievalMode = input.retrievalMode && allowedModes.includes(input.retrievalMode)
    ? input.retrievalMode
    : allowedModes[0] ?? null

  return {
    ...input,
    sourceSetId: input.bindingMode === 'source_set' ? input.sourceSetId : null,
    sourceIds: input.bindingMode === 'sources' ? input.sourceIds : [],
    retrievalMode,
  }
}

function defaultBindingForm(): AgentKnowledgeBindingForm {
  return {
    bindingMode: 'sources',
    sourceSetId: null,
    sourceIds: [],
    retrievalMode: null,
  }
}

export function useAgentKnowledgeBindingManager(tenantId: string, agentId: string) {
  const { adminUser } = useAuth()
  const { t } = useI18n()
  const [agentDetail, setAgentDetail] = useState<PortalAgentDetail | null>(null)
  const [portalStatus, setPortalStatus] = useState<PortalAgentKnowledgeStatus | null>(null)
  const [catalog, setCatalog] = useState<AgentKnowledgeCatalog | null>(null)
  const [binding, setBinding] = useState<AgentKnowledgeBinding | null>(null)
  const [bindingForm, setBindingForm] = useState<AgentKnowledgeBindingForm>(() => defaultBindingForm())
  const [mutationResult, setMutationResult] = useState<AgentKnowledgeMutationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const canMutate = canMutateKnowledge(adminUser)
  const canManageKnowledge = useMemo(
    () => deriveAgentKnowledgeCanManage(agentDetail?.supportedMutationActions ?? [], canMutate),
    [agentDetail?.supportedMutationActions, canMutate],
  )

  const availableSourceIds = useMemo(() => new Set(catalog?.sources.map((source) => source.sourceId) ?? []), [catalog?.sources])

  const loadBinding = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [agent, status, catalogResult, bindingResult] = await Promise.all([
        agentsApi.getPortalAgentDetail(tenantId, agentId),
        agentKnowledgeBindingApi.getPortalStatus(tenantId, agentId),
        agentKnowledgeBindingApi.getCatalog(tenantId, agentId),
        agentKnowledgeBindingApi.getBinding(tenantId, agentId),
      ])
      setAgentDetail(agent)
      setPortalStatus(status)
      setCatalog(catalogResult)
      setBinding(bindingResult)
      setBindingForm({
        bindingMode: bindingResult.bindingMode ?? 'sources',
        sourceSetId: bindingResult.sourceSetId,
        sourceIds: bindingResult.sourceIds.filter((sourceId) => catalogResult.sources.some((source) => source.sourceId === sourceId)),
        retrievalMode: bindingResult.retrievalMode,
      })
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('knowledge.load_error')))
    } finally {
      setIsLoading(false)
    }
  }, [agentId, tenantId, t])

  useEffect(() => {
    void loadBinding()
  }, [loadBinding])

  const runBindingMutation = useCallback(async (
    mutation: () => Promise<{ result: AgentKnowledgeMutationResult; resource: AgentKnowledgeBinding }>,
    successMessage: string,
  ) => {
    if (!canManageKnowledge) {
      setFormError(t('knowledge.action_not_available'))
      return
    }
    setIsMutating(true)
    setFormError(null)
    setNotice(null)
    setMutationResult(null)
    try {
      const response = await mutation()
      setBinding(response.resource)
      setMutationResult(response.result)
      setNotice(successMessage)
      await loadBinding()
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('knowledge.action_error')))
    } finally {
      setIsMutating(false)
    }
  }, [canManageKnowledge, loadBinding, t])

  const updateBinding = useCallback(async () => {
    const sourceIds = bindingForm.sourceIds.filter((sourceId) => availableSourceIds.has(sourceId))
    const nextBinding = normalizeAgentKnowledgeBindingInput(catalog, {
      ...bindingForm,
      sourceIds,
    })
    if (bindingForm.bindingMode === 'sources' && sourceIds.length === 0) {
      setFormError(t('knowledge.validation.binding_sources_required'))
      return
    }
    if (bindingForm.bindingMode === 'source_set' && !bindingForm.sourceSetId) {
      setFormError(t('knowledge.validation.binding_source_set_required'))
      return
    }
    if (nextBinding.bindingMode !== 'no_knowledge' && !nextBinding.retrievalMode) {
      setFormError(t('knowledge.validation.binding_retrieval_mode_required'))
      return
    }
    await runBindingMutation(
      () => agentKnowledgeBindingApi.updateBinding(tenantId, agentId, nextBinding),
      t('knowledge.notice.binding_updated'),
    )
  }, [agentId, availableSourceIds, bindingForm, catalog, runBindingMutation, tenantId, t])

  const disableBinding = useCallback(async () => {
    await runBindingMutation(
      () => agentKnowledgeBindingApi.disableBinding(tenantId, agentId),
      t('knowledge.notice.binding_disabled'),
    )
  }, [agentId, runBindingMutation, tenantId, t])

  return {
    tenantId,
    agentId,
    agentDetail,
    portalStatus,
    catalog,
    binding,
    bindingForm,
    mutationResult,
    canManageKnowledge,
    isLoading,
    isMutating,
    errorMessage,
    formError,
    notice,
    loadBinding,
    setBindingForm,
    updateBinding,
    disableBinding,
  }
}

export type AgentKnowledgeBindingManager = ReturnType<typeof useAgentKnowledgeBindingManager>
