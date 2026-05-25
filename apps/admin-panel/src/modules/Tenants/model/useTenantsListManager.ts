import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import { tenantsApi, type TenantCard, type TenantListMetadata } from '@/modules/Tenants/api/tenantsApi'

export type TenantListFilters = {
  search: string
  tenantStatus: string
  provisioningStatus: string
}

export type ProvisionTenantForm = {
  tenantName: string
  externalCustomerRef: string
  externalBillingRef: string
}

type ProvisioningAttempt = {
  provisioningCorrelationId: string
  idempotencyKey: string
}

const DEFAULT_FILTERS: TenantListFilters = {
  search: '',
  tenantStatus: 'all',
  provisioningStatus: 'all',
}

const DEFAULT_PROVISION_FORM: ProvisionTenantForm = {
  tenantName: '',
  externalCustomerRef: '',
  externalBillingRef: '',
}

function createStableId(prefix: string) {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  return `${prefix}_${random}`
}

function canMutateTenants(adminUser: { role: string; permissions?: string[] } | null) {
  if (!adminUser) return false
  const permissions = adminUser.permissions ?? []
  if (['tenants:write', 'tenant:write', 'manage-tenants', 'manage_tenants'].some((permission) => permissions.includes(permission))) {
    return true
  }
  return adminUser.role === 'platform_admin'
}

export function useTenantsListManager() {
  const { adminUser } = useAuth()
  const { t } = useI18n()
  const [tenants, setTenants] = useState<TenantCard[]>([])
  const [metadata, setMetadata] = useState<TenantListMetadata | null>(null)
  const [filters, setFilters] = useState<TenantListFilters>(DEFAULT_FILTERS)
  const [provisionForm, setProvisionForm] = useState<ProvisionTenantForm>(DEFAULT_PROVISION_FORM)
  const [attempt, setAttempt] = useState<ProvisioningAttempt | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProvisioning, setIsProvisioning] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const canMutate = canMutateTenants(adminUser)

  const loadTenants = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const result = await tenantsApi.listTenants(filters)
      setTenants(result.items)
      setMetadata(result.metadata)
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('tenants.load_error')))
    } finally {
      setIsLoading(false)
    }
  }, [filters, t])

  useEffect(() => {
    void loadTenants()
  }, [loadTenants])

  const statusOptions = useMemo(() => Array.from(new Set(tenants.map((tenant) => tenant.tenantStatus))), [tenants])
  const provisioningStatusOptions = useMemo(
    () => Array.from(new Set(tenants.map((tenant) => tenant.provisioningStatus))),
    [tenants],
  )

  const updateProvisionForm = useCallback((patch: Partial<ProvisionTenantForm>) => {
    setProvisionForm((current) => ({ ...current, ...patch }))
    setFormError(null)
  }, [])

  const provisionTenant = useCallback(async () => {
    const tenantName = provisionForm.tenantName.trim()
    const externalCustomerRef = provisionForm.externalCustomerRef.trim()
    const externalBillingRef = provisionForm.externalBillingRef.trim()

    if (!tenantName) {
      setFormError(t('tenants.form.tenant_name_error'))
      return
    }

    if (!externalCustomerRef) {
      setFormError(t('tenants.form.external_customer_ref_error'))
      return
    }

    const nextAttempt =
      attempt ?? {
        provisioningCorrelationId: createStableId('tenant_provisioning'),
        idempotencyKey: createStableId('tenant_idempotency'),
      }

    setAttempt(nextAttempt)
    setIsProvisioning(true)
    setFormError(null)
    setNotice(null)
    try {
      await tenantsApi.provisionTenant({
        tenantName,
        externalCustomerRef,
        externalBillingRef,
        ...nextAttempt,
      })
      setProvisionForm(DEFAULT_PROVISION_FORM)
      setAttempt(null)
      setNotice(t('tenants.notice.provisioned'))
      await loadTenants()
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('tenants.provision_error')))
    } finally {
      setIsProvisioning(false)
    }
  }, [attempt, loadTenants, provisionForm, t])

  return {
    tenants,
    metadata,
    filters,
    provisionForm,
    statusOptions,
    provisioningStatusOptions,
    canMutate,
    isLoading,
    isProvisioning,
    errorMessage,
    formError,
    notice,
    setFilters,
    updateProvisionForm,
    loadTenants,
    provisionTenant,
  }
}

export type TenantsListManager = ReturnType<typeof useTenantsListManager>
