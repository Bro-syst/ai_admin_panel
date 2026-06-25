import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import { agentsApi, type AgentMutationResult } from '@/modules/Agents/api/agentsApi'
import type { AgentTemplate } from '@/modules/AgentTemplates'

export type AgentCreateForm = {
  name: string
  description: string
  purpose: string
}

function canMutateAgents(adminUser: { role: string; permissions?: string[] } | null) {
  if (!adminUser) return false
  const permissions = adminUser.permissions ?? []
  if (['agents:write', 'agent:write', 'manage-agents', 'manage_agents'].some((permission) => permissions.includes(permission))) {
    return true
  }
  return adminUser.role === 'platform_admin'
}

export function useAgentCreateManager(tenantId: string, selectedTemplate: AgentTemplate | null) {
  const { adminUser } = useAuth()
  const { t } = useI18n()
  const navigate = useNavigate()
  const [form, setForm] = useState<AgentCreateForm>({ name: '', description: '', purpose: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [mutationResult, setMutationResult] = useState<AgentMutationResult | null>(null)
  const lastTemplateDefaultsRef = useRef({ purpose: '', description: '' })

  const canMutate = canMutateAgents(adminUser)

  useEffect(() => {
    if (!selectedTemplate) return
    const nextDefaults = {
      purpose: selectedTemplate.defaultAgentPurpose,
      description: selectedTemplate.defaultAgentDescription ?? '',
    }
    const previousDefaults = lastTemplateDefaultsRef.current
    setForm((current) => ({
      ...current,
      purpose: !current.purpose || current.purpose === previousDefaults.purpose ? nextDefaults.purpose : current.purpose,
      description: !current.description || current.description === previousDefaults.description ? nextDefaults.description : current.description,
    }))
    lastTemplateDefaultsRef.current = nextDefaults
  }, [selectedTemplate])

  const updateForm = useCallback((patch: Partial<AgentCreateForm>) => {
    setForm((current) => ({ ...current, ...patch }))
    setFormError(null)
  }, [])

  const canSubmit = useMemo(
    () => canMutate && Boolean(selectedTemplate) && Boolean(form.name.trim()) && !isSubmitting,
    [canMutate, form.name, isSubmitting, selectedTemplate],
  )

  const createAgent = useCallback(async () => {
    if (!selectedTemplate) {
      setFormError(t('agents.create.template_error'))
      return
    }

    const name = form.name.trim()
    if (!name) {
      setFormError(t('agents.create.name_error'))
      return
    }

    setIsSubmitting(true)
    setFormError(null)
    setMutationResult(null)
    try {
      const result = await agentsApi.createAgent({
        tenantId,
        name,
        description: form.description.trim() || null,
        purpose: form.purpose.trim() || selectedTemplate.defaultAgentPurpose,
        archetypeId: selectedTemplate.archetypeId,
        templateId: selectedTemplate.templateId,
        lifecycleStatus: 'draft',
      })
      setMutationResult(result.result)
      navigate(`/tenants/${tenantId}/agents/${result.resource.id}`)
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('agents.create.error')))
    } finally {
      setIsSubmitting(false)
    }
  }, [form, navigate, selectedTemplate, tenantId, t])

  return {
    tenantId,
    form,
    canMutate,
    canSubmit,
    isSubmitting,
    formError,
    mutationResult,
    updateForm,
    createAgent,
  }
}

export type AgentCreateManager = ReturnType<typeof useAgentCreateManager>
