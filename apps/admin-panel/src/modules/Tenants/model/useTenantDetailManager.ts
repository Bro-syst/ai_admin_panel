import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import {
  tenantsApi,
  type TenantConfiguration,
  type TenantDetail,
  type TenantMutationResult,
  type TenantProvisioningAuditSummary,
  type TenantProvisioningSnapshot,
} from '@/modules/Tenants/api/tenantsApi'

export type TenantAction =
  | 'change_tenant_status'
  | 'change_provisioning_status'
  | 'update_billing_ref'
  | 'provision_default_config'
  | 'save_configuration'

export type PendingTenantAction = {
  action: TenantAction
  status?: string
} | null

function canMutateTenants(adminUser: { role: string; permissions?: string[] } | null) {
  if (!adminUser) return false
  const permissions = adminUser.permissions ?? []
  if (['tenants:write', 'tenant:write', 'manage-tenants', 'manage_tenants'].some((permission) => permissions.includes(permission))) {
    return true
  }
  return adminUser.role === 'platform_admin'
}

function includesAction(detail: TenantDetail | null, action: string) {
  return detail?.supportedMutationActions.includes(action) ?? false
}

function formatConfigurationPayload(payload: Record<string, unknown> | null | undefined) {
  return JSON.stringify(payload ?? {}, null, 2)
}

function parseConfigurationPayload(value: string) {
  const parsed = JSON.parse(value) as unknown
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('configuration payload must be an object')
  }

  return parsed as Record<string, unknown>
}

export function useTenantDetailManager(tenantId: string) {
  const { adminUser } = useAuth()
  const { t } = useI18n()
  const [detail, setDetail] = useState<TenantDetail | null>(null)
  const [provisioning, setProvisioning] = useState<TenantProvisioningSnapshot | null>(null)
  const [auditSummary, setAuditSummary] = useState<TenantProvisioningAuditSummary | null>(null)
  const [configuration, setConfiguration] = useState<TenantConfiguration | null>(null)
  const [configurationDraft, setConfigurationDraftState] = useState('')
  const [configurationDraftError, setConfigurationDraftError] = useState<string | null>(null)
  const [lastMutationResult, setLastMutationResult] = useState<TenantMutationResult | null>(null)
  const [billingRef, setBillingRef] = useState('')
  const [pendingAction, setPendingAction] = useState<PendingTenantAction>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const canMutate = canMutateTenants(adminUser)

  const loadTenant = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const nextDetail = await tenantsApi.getTenantDetail(tenantId)
      setDetail(nextDetail)
      setBillingRef('')

      const [nextProvisioning, nextAudit, nextConfiguration] = await Promise.allSettled([
        tenantsApi.getProvisioning(tenantId),
        tenantsApi.getProvisioningAuditSummary(tenantId),
        tenantsApi.getConfiguration(tenantId),
      ])

      setProvisioning(nextProvisioning.status === 'fulfilled' ? nextProvisioning.value : null)
      setAuditSummary(nextAudit.status === 'fulfilled' ? nextAudit.value : null)
      const loadedConfiguration = nextConfiguration.status === 'fulfilled' ? nextConfiguration.value : null
      setConfiguration(loadedConfiguration)
      setConfigurationDraftState(formatConfigurationPayload(loadedConfiguration?.payload))
      setConfigurationDraftError(null)
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('tenants.detail_error')))
    } finally {
      setIsLoading(false)
    }
  }, [tenantId, t])

  useEffect(() => {
    void loadTenant()
  }, [loadTenant])

  const allowedActions = useMemo(
    () => ({
      changeTenantStatus: canMutate && includesAction(detail, 'tenant.change_status'),
      changeProvisioningStatus: canMutate && includesAction(detail, 'tenant.change_provisioning_status'),
      updateBillingRef: canMutate && includesAction(detail, 'tenant.update_provisioning_metadata'),
      provisionDefaultConfig: canMutate && includesAction(detail, 'tenant.provision_default_configuration'),
      updateConfiguration: canMutate && includesAction(detail, 'tenant.update_configuration') && configuration !== null,
    }),
    [canMutate, configuration, detail],
  )

  const isConfigurationDraftDirty = useMemo(
    () => configuration !== null && configurationDraft !== formatConfigurationPayload(configuration.payload),
    [configuration, configurationDraft],
  )

  const setConfigurationDraft = useCallback((value: string) => {
    setConfigurationDraftState(value)
    setConfigurationDraftError(null)
  }, [])

  const requestAction = useCallback((action: TenantAction, status?: string) => {
    if (action === 'save_configuration') {
      try {
        parseConfigurationPayload(configurationDraft)
      } catch {
        setConfigurationDraftError(t('tenants.config.invalid_json'))
        return
      }
    }

    setPendingAction({ action, status })
    setNotice(null)
  }, [configurationDraft, t])

  const cancelAction = useCallback(() => {
    if (!isSubmitting) setPendingAction(null)
  }, [isSubmitting])

  const confirmAction = useCallback(async () => {
    if (!pendingAction) return

    setIsSubmitting(true)
    setErrorMessage(null)
    setNotice(null)
    setLastMutationResult(null)
    try {
      let mutationResult: TenantMutationResult | null = null

      if (pendingAction.action === 'change_tenant_status' && pendingAction.status) {
        mutationResult = await tenantsApi.changeTenantStatus(tenantId, pendingAction.status)
      } else if (pendingAction.action === 'change_provisioning_status' && pendingAction.status) {
        mutationResult = (await tenantsApi.changeProvisioningStatus(tenantId, pendingAction.status)).result
      } else if (pendingAction.action === 'update_billing_ref') {
        mutationResult = (await tenantsApi.updateProvisioningMetadata(tenantId, billingRef.trim() || null)).result
      } else if (pendingAction.action === 'provision_default_config') {
        mutationResult = (await tenantsApi.provisionDefaultConfiguration(tenantId)).result
      } else if (pendingAction.action === 'save_configuration' && configuration) {
        mutationResult = (await tenantsApi.updateConfiguration(tenantId, parseConfigurationPayload(configurationDraft))).result
      }

      setLastMutationResult(mutationResult)
      setPendingAction(null)
      setNotice(t(`tenants.notice.${pendingAction.action}`))
      await loadTenant()
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('tenants.action_error')))
    } finally {
      setIsSubmitting(false)
    }
  }, [billingRef, configuration, configurationDraft, loadTenant, pendingAction, tenantId, t])

  return {
    tenantId,
    detail,
    provisioning,
    auditSummary,
    configuration,
    configurationDraft,
    configurationDraftError,
    isConfigurationDraftDirty,
    lastMutationResult,
    billingRef,
    pendingAction,
    allowedActions,
    canMutate,
    isLoading,
    isSubmitting,
    errorMessage,
    notice,
    setBillingRef,
    setConfigurationDraft,
    loadTenant,
    requestAction,
    cancelAction,
    confirmAction,
  }
}

export type TenantDetailManager = ReturnType<typeof useTenantDetailManager>
