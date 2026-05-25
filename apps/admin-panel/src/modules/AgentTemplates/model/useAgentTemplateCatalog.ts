import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useI18n } from '@/core/i18n/useI18n'
import {
  agentTemplatesApi,
  type AgentCatalog,
  type AgentTemplate,
} from '@/modules/AgentTemplates/api/agentTemplatesApi'

export function useAgentTemplateCatalog(tenantId: string) {
  const { t } = useI18n()
  const [catalog, setCatalog] = useState<AgentCatalog | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const loadCatalog = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const nextCatalog = await agentTemplatesApi.getCatalog(tenantId)
      setCatalog(nextCatalog)
      setSelectedTemplateId((current) => current ?? nextCatalog.templates[0]?.templateId ?? null)
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('agents.templates.load_error')))
    } finally {
      setIsLoading(false)
    }
  }, [tenantId, t])

  useEffect(() => {
    void loadCatalog()
  }, [loadCatalog])

  const selectedTemplate = useMemo<AgentTemplate | null>(
    () => catalog?.templates.find((template) => template.templateId === selectedTemplateId) ?? null,
    [catalog, selectedTemplateId],
  )

  return {
    catalog,
    selectedTemplateId,
    selectedTemplate,
    isLoading,
    errorMessage,
    loadCatalog,
    setSelectedTemplateId,
  }
}

export type AgentTemplateCatalogManager = ReturnType<typeof useAgentTemplateCatalog>
