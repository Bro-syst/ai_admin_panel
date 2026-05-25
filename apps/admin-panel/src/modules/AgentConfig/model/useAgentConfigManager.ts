import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import {
  agentConfigApi,
  type AgentConfigDetail,
  type AgentConfigMutationResult,
  type AgentConfigPayload,
  type AgentConfigValidationResult,
  type AgentConfigVersion,
  type AgentIntegrationActionBinding,
} from '@/modules/AgentConfig/api/agentConfigApi'
import { agentsApi, type PortalAgentDetail } from '@/modules/Agents'

export type ConfigValidationState = {
  configId: string
  result: AgentConfigValidationResult
} | null

export type AgentConfigMutationEvidence = AgentConfigMutationResult & {
  status?: string | null
  version?: number | null
}

const AGENT_CONFIG_ACTION_REFS = ['agent_config.manage', 'agents.config.manage', 'agent.config.manage']

function canMutateAgentConfig(adminUser: { role: string; permissions?: string[] } | null) {
  if (!adminUser) return false
  const permissions = adminUser.permissions ?? []
  if (
    ['agents:write', 'agent:write', 'agent-config:write', 'agent_config:write', 'manage-agents', 'manage_agent_config'].some(
      (permission) => permissions.includes(permission),
    )
  ) {
    return true
  }
  return adminUser.role === 'platform_admin'
}

export function deriveAgentConfigAllowedActionRefs(supportedMutationActions: string[], canMutate: boolean) {
  const supported = new Set(supportedMutationActions)
  return canMutate && AGENT_CONFIG_ACTION_REFS.some((actionRef) => supported.has(actionRef))
}

export function createEmptyActionBinding(): AgentIntegrationActionBinding {
  return {
    actionClass: '',
    connectorKey: '',
    operationKey: '',
    interfaceType: '',
    sideEffectMode: '',
    referenceScope: '',
    referenceKey: '',
    endpointUrl: '',
    timeoutClass: null,
    retryPolicyClass: null,
    compensationMode: null,
  }
}

export function createDefaultAgentConfigPayload(agentLabel = 'Agent'): AgentConfigPayload {
  return {
    identity: {
      agentLabel,
      personaSummary: null,
    },
    toneAndLanguage: {
      tone: 'clear_and_helpful',
      language: 'en',
    },
    goals: [],
    rules: [],
    restrictions: [],
    handoffPolicy: {
      handoffEnabled: false,
      handoffConditions: [],
    },
    integrationPolicy: {
      integrationEnabled: false,
      actionBindings: [],
    },
    modelPreference: {
      preferredModelFamily: null,
      latencySensitivity: null,
      qualitySensitivity: null,
      costSensitivity: null,
    },
    modelSelectionHints: {
      preferredCapabilities: [],
      fallbackAllowed: true,
    },
    executionProfileHints: {
      profileName: null,
      responseMode: null,
    },
    compatibilityAndSafety: {
      configSchemaVersion: '1.0',
      safetyLabels: [],
      compatibilityNotes: [],
    },
  }
}

function canActivateFromValidation(validationState: ConfigValidationState, configId: string | null) {
  if (!validationState || validationState.configId !== configId) return false
  const { result } = validationState
  return result.validationStatus !== 'invalid' && result.compatibilityStatus !== 'incompatible'
}

function validateDraftPayload(payload: AgentConfigPayload, t: (key: string) => string) {
  if (!payload.identity.agentLabel.trim()) {
    return t('agent_config.validation.agent_label_required')
  }
  if (!payload.toneAndLanguage.tone.trim() || !payload.toneAndLanguage.language.trim()) {
    return t('agent_config.validation.tone_language_required')
  }
  return null
}

export function useAgentConfigManager(tenantId: string, agentId: string) {
  const { adminUser } = useAuth()
  const { t } = useI18n()
  const [agentDetail, setAgentDetail] = useState<PortalAgentDetail | null>(null)
  const [activeConfig, setActiveConfig] = useState<AgentConfigDetail | null>(null)
  const [versions, setVersions] = useState<AgentConfigVersion[]>([])
  const [selectedConfig, setSelectedConfig] = useState<AgentConfigDetail | null>(null)
  const [draftPayload, setDraftPayload] = useState<AgentConfigPayload>(() => createDefaultAgentConfigPayload())
  const [validationState, setValidationState] = useState<ConfigValidationState>(null)
  const [mutationResult, setMutationResult] = useState<AgentConfigMutationEvidence | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const canMutate = canMutateAgentConfig(adminUser)
  const canManageConfig = useMemo(
    () => deriveAgentConfigAllowedActionRefs(agentDetail?.supportedMutationActions ?? [], canMutate),
    [agentDetail?.supportedMutationActions, canMutate],
  )

  const loadConfig = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [agentResult, versionsResult] = await Promise.allSettled([
        agentsApi.getPortalAgentDetail(tenantId, agentId),
        agentConfigApi.listConfigs(tenantId, agentId),
      ])

      let nextAgentDetail: PortalAgentDetail | null = null
      if (agentResult.status === 'fulfilled') {
        const loadedAgentDetail = agentResult.value
        nextAgentDetail = loadedAgentDetail
        setAgentDetail(loadedAgentDetail)
        setDraftPayload((current) => ({
          ...current,
          identity: {
            ...current.identity,
            agentLabel: current.identity.agentLabel || loadedAgentDetail.name,
          },
        }))
      } else {
        throw agentResult.reason
      }

      const nextVersions = versionsResult.status === 'fulfilled' ? versionsResult.value.items : []
      setVersions(nextVersions)

      if (nextAgentDetail.activeConfigId) {
        const activeConfigDetail = await agentConfigApi.getActiveConfig(tenantId, agentId)
        setActiveConfig(activeConfigDetail)
        setSelectedConfig(activeConfigDetail)
        setDraftPayload(activeConfigDetail.payload)
        return
      }

      setActiveConfig(null)
      const firstVersion = nextVersions[0]
      if (firstVersion) {
        const detail = await agentConfigApi.getConfigDetail(tenantId, agentId, firstVersion.id)
        setSelectedConfig(detail)
        setDraftPayload(detail.payload)
      } else {
        setSelectedConfig(null)
      }

      if (versionsResult.status === 'rejected') {
        throw versionsResult.reason
      }
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('agent_config.load_error')))
    } finally {
      setIsLoading(false)
    }
  }, [agentId, tenantId, t])

  useEffect(() => {
    void loadConfig()
  }, [loadConfig])

  const updateDraftPayload = useCallback((updater: (current: AgentConfigPayload) => AgentConfigPayload) => {
    setDraftPayload(updater)
    setFormError(null)
    setNotice(null)
  }, [])

  const selectConfig = useCallback(async (configId: string) => {
    setIsMutating(true)
    setFormError(null)
    try {
      const detail = await agentConfigApi.getConfigDetail(tenantId, agentId, configId)
      setSelectedConfig(detail)
      setDraftPayload(detail.payload)
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('agent_config.detail_error')))
    } finally {
      setIsMutating(false)
    }
  }, [agentId, tenantId, t])

  const resetDraftFromSelected = useCallback(() => {
    setDraftPayload(selectedConfig?.payload ?? createDefaultAgentConfigPayload(agentDetail?.name ?? 'Agent'))
    setFormError(null)
  }, [agentDetail?.name, selectedConfig])

  const applyMutation = useCallback(async (
    mutation: () => Promise<{ resource: AgentConfigDetail; result: AgentConfigMutationResult }>,
    successMessage: string,
  ) => {
    setIsMutating(true)
    setFormError(null)
    setNotice(null)
    setMutationResult(null)
    try {
      const response = await mutation()
      setMutationResult({
        ...response.result,
        status: response.resource.status,
        version: response.resource.version,
      })
      setNotice(successMessage)
      setSelectedConfig(response.resource)
      setDraftPayload(response.resource.payload)
      setValidationState(null)
      await loadConfig()
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('agent_config.action_error')))
    } finally {
      setIsMutating(false)
    }
  }, [loadConfig, t])

  const createDraft = useCallback(async () => {
    if (!canManageConfig) {
      setFormError(t('agent_config.action_not_available'))
      return
    }
    const validationError = validateDraftPayload(draftPayload, t)
    if (validationError) {
      setFormError(validationError)
      return
    }
    await applyMutation(
      () => agentConfigApi.createDraft(tenantId, agentId, draftPayload),
      t('agent_config.notice.draft_created'),
    )
  }, [agentId, applyMutation, canManageConfig, draftPayload, tenantId, t])

  const createVersion = useCallback(async () => {
    if (!canManageConfig) {
      setFormError(t('agent_config.action_not_available'))
      return
    }
    const validationError = validateDraftPayload(draftPayload, t)
    if (validationError) {
      setFormError(validationError)
      return
    }
    await applyMutation(
      () => agentConfigApi.createConfigVersion(tenantId, agentId, draftPayload),
      t('agent_config.notice.version_created'),
    )
  }, [agentId, applyMutation, canManageConfig, draftPayload, tenantId, t])

  const validateSelected = useCallback(async () => {
    if (!canManageConfig || !selectedConfig) {
      setFormError(t('agent_config.action_not_available'))
      return
    }
    setIsMutating(true)
    setFormError(null)
    setNotice(null)
    try {
      const result = await agentConfigApi.validateConfig(tenantId, agentId, selectedConfig.id)
      setValidationState({ configId: selectedConfig.id, result })
      setNotice(t('agent_config.notice.validated'))
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('agent_config.action_error')))
    } finally {
      setIsMutating(false)
    }
  }, [agentId, canManageConfig, selectedConfig, tenantId, t])

  const activateSelected = useCallback(async () => {
    if (!canManageConfig || !selectedConfig || !canActivateFromValidation(validationState, selectedConfig.id)) {
      setFormError(t('agent_config.validation.validate_before_activate'))
      return
    }
    await applyMutation(
      () => agentConfigApi.activateConfig(tenantId, agentId, selectedConfig.id),
      t('agent_config.notice.activated'),
    )
  }, [agentId, applyMutation, canManageConfig, selectedConfig, tenantId, t, validationState])

  const rollbackSelected = useCallback(async () => {
    if (!canManageConfig || !selectedConfig) {
      setFormError(t('agent_config.action_not_available'))
      return
    }
    await applyMutation(
      () => agentConfigApi.rollbackConfig(tenantId, agentId, selectedConfig.id),
      t('agent_config.notice.rolled_back'),
    )
  }, [agentId, applyMutation, canManageConfig, selectedConfig, tenantId, t])

  return {
    tenantId,
    agentId,
    agentDetail,
    activeConfig,
    versions,
    selectedConfig,
    draftPayload,
    validationState,
    mutationResult,
    canManageConfig,
    canActivateSelected: canManageConfig && canActivateFromValidation(validationState, selectedConfig?.id ?? null),
    isLoading,
    isMutating,
    errorMessage,
    formError,
    notice,
    loadConfig,
    selectConfig,
    updateDraftPayload,
    resetDraftFromSelected,
    createDraft,
    createVersion,
    validateSelected,
    activateSelected,
    rollbackSelected,
  }
}

export type AgentConfigManager = ReturnType<typeof useAgentConfigManager>
