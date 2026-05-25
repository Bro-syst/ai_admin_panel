import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import {
  usageBillingApi,
  type BillingExportBatch,
  type BillingExportBatchInput,
  type BillingExportFailureInput,
  type BillingExportReconciliationInput,
  type BillingExportRetryInput,
  type BillingExportStatus,
  type ModelUsage,
  type ModelUsageSummary,
  type UsageMeteringSummary,
  type UsageSummaryInput,
} from '@/modules/UsageBilling/api/usageBillingApi'

const BILLING_MUTATION_PERMISSIONS = [
  'billing:write',
  'billing_export:write',
  'billing-export:write',
  'manage-billing',
  'manage_billing',
  'billing:export',
]

function createIdempotencyKey(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function defaultWindow() {
  const end = new Date()
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
  return {
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
  }
}

export function deriveCanManageBilling(adminUser: { role: string; permissions?: string[] } | null) {
  if (!adminUser) return false
  const permissions = adminUser.permissions ?? []
  if (BILLING_MUTATION_PERMISSIONS.some((permission) => permissions.includes(permission))) return true
  return adminUser.role === 'platform_admin'
}

export function linesToIds(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export type UsageFilters = {
  windowStart: string
  windowEnd: string
  agentId: string
  usageId: string
  chatId: string
  conversationTurnId: string
  modelRequestId: string
}

export type ExportBatchForm = {
  idempotencyKey: string
  billableActivityIdsText: string
  includeFailed: boolean
  limit: number
}

export type ExportFailureForm = {
  idempotencyKey: string
  billableActivityIdsText: string
  failureCode: string
  failureReason: string
}

export type ExportRetryForm = {
  idempotencyKey: string
  billableActivityIdsText: string
}

export type ReconciliationForm = {
  idempotencyKey: string
  billableActivityIdsText: string
  reconciliationReference: string
}

export function buildUsageSummaryInput(filters: UsageFilters): UsageSummaryInput {
  return {
    windowStart: filters.windowStart.trim(),
    windowEnd: filters.windowEnd.trim(),
    chatId: filters.chatId.trim() || null,
    conversationTurnId: filters.conversationTurnId.trim() || null,
    modelRequestId: filters.modelRequestId.trim() || null,
  }
}

export function buildExportBatchInput(form: ExportBatchForm): BillingExportBatchInput {
  return {
    idempotencyKey: form.idempotencyKey.trim(),
    billableActivityIds: linesToIds(form.billableActivityIdsText),
    includeFailed: form.includeFailed,
    limit: form.limit,
  }
}

export function buildFailureInput(form: ExportFailureForm): BillingExportFailureInput {
  return {
    idempotencyKey: form.idempotencyKey.trim(),
    billableActivityIds: linesToIds(form.billableActivityIdsText),
    failureCode: form.failureCode.trim(),
    failureReason: form.failureReason.trim() || null,
  }
}

export function buildRetryInput(form: ExportRetryForm): BillingExportRetryInput {
  return {
    idempotencyKey: form.idempotencyKey.trim(),
    billableActivityIds: linesToIds(form.billableActivityIdsText),
  }
}

export function buildReconciliationInput(form: ReconciliationForm): BillingExportReconciliationInput {
  return {
    idempotencyKey: form.idempotencyKey.trim(),
    billableActivityIds: linesToIds(form.billableActivityIdsText),
    reconciliationReference: form.reconciliationReference.trim(),
  }
}

function defaultFilters(): UsageFilters {
  return {
    ...defaultWindow(),
    agentId: '',
    usageId: '',
    chatId: '',
    conversationTurnId: '',
    modelRequestId: '',
  }
}

function defaultExportBatchForm(): ExportBatchForm {
  return {
    idempotencyKey: createIdempotencyKey('billing_export'),
    billableActivityIdsText: '',
    includeFailed: false,
    limit: 100,
  }
}

function defaultFailureForm(): ExportFailureForm {
  return {
    idempotencyKey: createIdempotencyKey('billing_failure'),
    billableActivityIdsText: '',
    failureCode: '',
    failureReason: '',
  }
}

function defaultRetryForm(): ExportRetryForm {
  return {
    idempotencyKey: createIdempotencyKey('billing_retry'),
    billableActivityIdsText: '',
  }
}

function defaultReconciliationForm(): ReconciliationForm {
  return {
    idempotencyKey: createIdempotencyKey('billing_reconcile'),
    billableActivityIdsText: '',
    reconciliationReference: '',
  }
}

export function useUsageBillingManager(tenantId: string) {
  const { adminUser } = useAuth()
  const { t } = useI18n()
  const [filters, setFilters] = useState<UsageFilters>(() => defaultFilters())
  const [usageMetering, setUsageMetering] = useState<UsageMeteringSummary | null>(null)
  const [billingStatus, setBillingStatus] = useState<BillingExportStatus | null>(null)
  const [usageSummary, setUsageSummary] = useState<ModelUsageSummary | null>(null)
  const [usageItems, setUsageItems] = useState<ModelUsage[]>([])
  const [selectedUsage, setSelectedUsage] = useState<ModelUsage | null>(null)
  const [lastBatch, setLastBatch] = useState<BillingExportBatch | null>(null)
  const [exportBatchForm, setExportBatchForm] = useState<ExportBatchForm>(() => defaultExportBatchForm())
  const [failureForm, setFailureForm] = useState<ExportFailureForm>(() => defaultFailureForm())
  const [retryForm, setRetryForm] = useState<ExportRetryForm>(() => defaultRetryForm())
  const [reconciliationForm, setReconciliationForm] = useState<ReconciliationForm>(() => defaultReconciliationForm())
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const canManageBilling = useMemo(() => deriveCanManageBilling(adminUser), [adminUser])

  const loadUsageBilling = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [nextUsageMetering, nextBillingStatus, nextUsageSummary] = await Promise.all([
        usageBillingApi.getUsageMeteringSummary(tenantId, {
          windowStart: filters.windowStart.trim(),
          windowEnd: filters.windowEnd.trim(),
          agentId: filters.agentId.trim() || undefined,
        }),
        usageBillingApi.getBillingExportStatus(tenantId),
        usageBillingApi.summarizeUsage(tenantId, buildUsageSummaryInput(filters)),
      ])
      setUsageMetering(nextUsageMetering)
      setBillingStatus(nextBillingStatus)
      setUsageSummary(nextUsageSummary)
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('usage_billing.load_error')))
    } finally {
      setIsLoading(false)
    }
  }, [filters, tenantId, t])

  useEffect(() => {
    void loadUsageBilling()
  }, [loadUsageBilling])

  const loadUsageDetail = useCallback(async () => {
    const usageId = filters.usageId.trim()
    if (!usageId) {
      setFormError(t('usage_billing.validation.usage_id_required'))
      return
    }
    setIsDetailLoading(true)
    setFormError(null)
    try {
      setSelectedUsage(await usageBillingApi.getUsage(tenantId, usageId))
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('usage_billing.detail_error')))
    } finally {
      setIsDetailLoading(false)
    }
  }, [filters.usageId, tenantId, t])

  const loadAnchoredUsage = useCallback(async (kind: 'chat' | 'turn' | 'modelRequest') => {
    const anchorId = kind === 'chat' ? filters.chatId.trim() : kind === 'turn' ? filters.conversationTurnId.trim() : filters.modelRequestId.trim()
    if (!anchorId) {
      setFormError(t('usage_billing.validation.anchor_required'))
      return
    }
    setIsDetailLoading(true)
    setFormError(null)
    try {
      const items = kind === 'chat'
        ? await usageBillingApi.listUsageForChat(tenantId, anchorId)
        : kind === 'turn'
          ? await usageBillingApi.listUsageForConversationTurn(tenantId, anchorId)
          : await usageBillingApi.listUsageForModelRequest(tenantId, anchorId)
      setUsageItems(items)
      setSelectedUsage(items[0] ?? null)
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('usage_billing.detail_error')))
    } finally {
      setIsDetailLoading(false)
    }
  }, [filters.chatId, filters.conversationTurnId, filters.modelRequestId, tenantId, t])

  const applyBillingMutation = useCallback(async (mutation: () => Promise<BillingExportBatch>, message: string) => {
    if (!canManageBilling) {
      setFormError(t('usage_billing.action_not_available'))
      return
    }
    setIsMutating(true)
    setFormError(null)
    setNotice(null)
    try {
      const batch = await mutation()
      setLastBatch(batch)
      setBillingStatus(await usageBillingApi.getBillingExportStatus(tenantId))
      setNotice(message)
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('usage_billing.action_error')))
    } finally {
      setIsMutating(false)
    }
  }, [canManageBilling, tenantId, t])

  const exportBatch = useCallback(async () => {
    await applyBillingMutation(
      () => usageBillingApi.exportBillingBatch(tenantId, buildExportBatchInput(exportBatchForm)),
      t('usage_billing.notice.exported'),
    )
  }, [applyBillingMutation, exportBatchForm, tenantId, t])

  const markFailure = useCallback(async () => {
    if (!failureForm.failureCode.trim() || !failureForm.billableActivityIdsText.trim()) {
      setFormError(t('usage_billing.validation.failure_required'))
      return
    }
    await applyBillingMutation(
      () => usageBillingApi.markExportFailure(tenantId, buildFailureInput(failureForm)),
      t('usage_billing.notice.failure_marked'),
    )
  }, [applyBillingMutation, failureForm, tenantId, t])

  const scheduleRetry = useCallback(async () => {
    if (!retryForm.billableActivityIdsText.trim()) {
      setFormError(t('usage_billing.validation.activity_ids_required'))
      return
    }
    await applyBillingMutation(
      () => usageBillingApi.scheduleExportRetry(tenantId, buildRetryInput(retryForm)),
      t('usage_billing.notice.retry_scheduled'),
    )
  }, [applyBillingMutation, retryForm, tenantId, t])

  const reconcile = useCallback(async () => {
    if (!reconciliationForm.reconciliationReference.trim() || !reconciliationForm.billableActivityIdsText.trim()) {
      setFormError(t('usage_billing.validation.reconciliation_required'))
      return
    }
    await applyBillingMutation(
      () => usageBillingApi.reconcileExport(tenantId, buildReconciliationInput(reconciliationForm)),
      t('usage_billing.notice.reconciled'),
    )
  }, [applyBillingMutation, reconciliationForm, tenantId, t])

  return {
    tenantId,
    filters,
    usageMetering,
    billingStatus,
    usageSummary,
    usageItems,
    selectedUsage,
    lastBatch,
    exportBatchForm,
    failureForm,
    retryForm,
    reconciliationForm,
    canManageBilling,
    isLoading,
    isDetailLoading,
    isMutating,
    errorMessage,
    formError,
    notice,
    setFilters,
    setSelectedUsage,
    setExportBatchForm,
    setFailureForm,
    setRetryForm,
    setReconciliationForm,
    loadUsageBilling,
    loadUsageDetail,
    loadAnchoredUsage,
    exportBatch,
    markFailure,
    scheduleRetry,
    reconcile,
  }
}

export type UsageBillingManager = ReturnType<typeof useUsageBillingManager>
