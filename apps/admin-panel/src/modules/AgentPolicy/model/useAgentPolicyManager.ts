import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import { agentsApi, type PortalAgentDetail } from '@/modules/Agents'
import {
  agentPolicyApi,
  type AgentPolicyBinding,
  type AgentPolicyBindingInput,
  type AgentPolicyMutationResult,
  type AgentPolicyProfileCatalog,
} from '@/modules/AgentPolicy/api/agentPolicyApi'

const POLICY_ACTION_REFS = [
  'policy.binding.manage',
  'agent_policy.manage',
  'agent.policy.manage',
  'agents.policy.manage',
]

function canMutatePolicy(adminUser: { role: string; permissions?: string[] } | null) {
  if (!adminUser) return false
  const permissions = adminUser.permissions ?? []
  if (
    ['agents:write', 'agent:write', 'agent-policy:write', 'agent_policy:write', 'manage-agents'].some(
      (permission) => permissions.includes(permission),
    )
  ) {
    return true
  }
  return adminUser.role === 'platform_admin'
}

export function deriveAgentPolicyCanManage(supportedMutationActions: string[], canMutate: boolean) {
  const supported = new Set(supportedMutationActions)
  return canMutate && POLICY_ACTION_REFS.some((actionRef) => supported.has(actionRef))
}

export type AgentPolicyForm = AgentPolicyBindingInput & {
  tenantPolicyMarkersText: string
}

function linesToArray(value: string) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean)
}

function arrayToLines(value: string[]) {
  return value.join('\n')
}

function defaultForm(): AgentPolicyForm {
  return {
    bindingMode: 'inherited_default',
    policyProfileId: null,
    tenantPolicyMarkers: [],
    tenantPolicyMarkersText: '',
    businessPolicyScope: null,
  }
}

function formFromBinding(binding: AgentPolicyBinding | null): AgentPolicyForm {
  if (!binding) return defaultForm()

  return {
    bindingMode: binding.bindingMode ?? 'inherited_default',
    policyProfileId: binding.policyProfileId,
    tenantPolicyMarkers: binding.tenantPolicyMarkers,
    tenantPolicyMarkersText: arrayToLines(binding.tenantPolicyMarkers),
    businessPolicyScope: binding.businessPolicyScope,
  }
}

function normalizePolicyForm(form: AgentPolicyForm) {
  return {
    bindingMode: form.bindingMode,
    policyProfileId: form.policyProfileId ?? null,
    tenantPolicyMarkers: linesToArray(form.tenantPolicyMarkersText),
    businessPolicyScope: form.businessPolicyScope ?? null,
  }
}

function arePolicyFormsEqual(left: AgentPolicyForm, right: AgentPolicyForm) {
  const normalizedLeft = normalizePolicyForm(left)
  const normalizedRight = normalizePolicyForm(right)

  return (
    normalizedLeft.bindingMode === normalizedRight.bindingMode &&
    normalizedLeft.policyProfileId === normalizedRight.policyProfileId &&
    normalizedLeft.businessPolicyScope === normalizedRight.businessPolicyScope &&
    normalizedLeft.tenantPolicyMarkers.join('\n') === normalizedRight.tenantPolicyMarkers.join('\n')
  )
}

export function useAgentPolicyManager(tenantId: string, agentId: string) {
  const { adminUser } = useAuth()
  const { t } = useI18n()
  const [agentDetail, setAgentDetail] = useState<PortalAgentDetail | null>(null)
  const [catalog, setCatalog] = useState<AgentPolicyProfileCatalog | null>(null)
  const [binding, setBinding] = useState<AgentPolicyBinding | null>(null)
  const [validationBinding, setValidationBinding] = useState<AgentPolicyBinding | null>(null)
  const [form, setForm] = useState<AgentPolicyForm>(() => defaultForm())
  const [mutationResult, setMutationResult] = useState<AgentPolicyMutationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const canMutate = canMutatePolicy(adminUser)
  const canManagePolicy = useMemo(
    () => deriveAgentPolicyCanManage(agentDetail?.supportedMutationActions ?? [], canMutate),
    [agentDetail?.supportedMutationActions, canMutate],
  )
  const isDirty = useMemo(() => !arePolicyFormsEqual(form, formFromBinding(binding)), [binding, form])

  const loadPolicy = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [agent, catalogResult, bindingResult] = await Promise.all([
        agentsApi.getPortalAgentDetail(tenantId, agentId),
        agentPolicyApi.getCatalog(tenantId, agentId),
        agentPolicyApi.getBinding(tenantId, agentId),
      ])
      setAgentDetail(agent)
      setCatalog(catalogResult)
      setBinding(bindingResult)
      setValidationBinding(null)
      setForm(formFromBinding(bindingResult))
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('agent_policy.load_error')))
    } finally {
      setIsLoading(false)
    }
  }, [agentId, tenantId, t])

  useEffect(() => {
    void loadPolicy()
  }, [loadPolicy])

  const updateForm = useCallback((patch: Partial<AgentPolicyForm>) => {
    setForm((current) => {
      const next = { ...current, ...patch }
      if (Object.prototype.hasOwnProperty.call(patch, 'tenantPolicyMarkersText')) {
        next.tenantPolicyMarkers = linesToArray(next.tenantPolicyMarkersText)
      }
      if (patch.bindingMode === 'inherited_default') {
        next.policyProfileId = null
      }
      return next
    })
    setFormError(null)
  }, [])

  const updateBinding = useCallback(async () => {
    if (!canManagePolicy) {
      setFormError(t('agent_policy.action_not_available'))
      return
    }
    if (form.bindingMode === 'explicit_profile' && !form.policyProfileId) {
      setFormError(t('agent_policy.validation.profile_required'))
      return
    }
    setIsMutating(true)
    setFormError(null)
    setNotice(null)
    setMutationResult(null)
    try {
      const response = await agentPolicyApi.updateBinding(tenantId, agentId, {
        bindingMode: form.bindingMode,
        policyProfileId: form.policyProfileId,
        tenantPolicyMarkers: linesToArray(form.tenantPolicyMarkersText),
        businessPolicyScope: form.businessPolicyScope,
      })
      setBinding(response.resource)
      setMutationResult(response.result)
      setNotice(t('agent_policy.notice.updated'))
      await loadPolicy()
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('agent_policy.action_error')))
    } finally {
      setIsMutating(false)
    }
  }, [agentId, canManagePolicy, form, loadPolicy, tenantId, t])

  const validateBinding = useCallback(async () => {
    setIsMutating(true)
    setFormError(null)
    try {
      setValidationBinding(await agentPolicyApi.validateBinding(tenantId, agentId))
      setNotice(t('agent_policy.notice.validated'))
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('agent_policy.validation_error')))
    } finally {
      setIsMutating(false)
    }
  }, [agentId, tenantId, t])

  return {
    tenantId,
    agentId,
    agentDetail,
    catalog,
    binding,
    validationBinding,
    form,
    mutationResult,
    canManagePolicy,
    isDirty,
    isLoading,
    isMutating,
    errorMessage,
    formError,
    notice,
    loadPolicy,
    updateForm,
    updateBinding,
    validateBinding,
  }
}

export type AgentPolicyManager = ReturnType<typeof useAgentPolicyManager>
