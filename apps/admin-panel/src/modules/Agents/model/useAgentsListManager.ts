import { useCallback, useEffect, useState } from 'react'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useI18n } from '@/core/i18n/useI18n'
import { agentsApi, type AgentCard, type AgentListMetadata } from '@/modules/Agents/api/agentsApi'

export function useAgentsListManager(tenantId: string) {
  const { t } = useI18n()
  const [agents, setAgents] = useState<AgentCard[]>([])
  const [metadata, setMetadata] = useState<AgentListMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadAgents = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const result = await agentsApi.listPortalAgents(tenantId)
      setAgents(result.items)
      setMetadata(result.metadata)
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('agents.list.load_error')))
    } finally {
      setIsLoading(false)
    }
  }, [tenantId, t])

  useEffect(() => {
    void loadAgents()
  }, [loadAgents])

  return {
    tenantId,
    agents,
    metadata,
    isLoading,
    errorMessage,
    loadAgents,
  }
}

export type AgentsListManager = ReturnType<typeof useAgentsListManager>
