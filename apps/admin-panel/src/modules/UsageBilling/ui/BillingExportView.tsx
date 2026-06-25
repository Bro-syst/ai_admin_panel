import { Link } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import type { BillingExportBatch } from '@/modules/UsageBilling/api/usageBillingApi'
import type { UsageBillingManager } from '@/modules/UsageBilling/model/useUsageBillingManager'
import { valueOrEmpty } from '@/modules/UsageBilling/ui/format'
import { InfoGrid, ListBlock, StatusBadge } from '@/shared/ui/EntityInfo'
import {
  ActionButton,
  BatchActivityIdsHint,
  Field,
  NoticeBlocks,
  TextareaField,
} from '@/modules/UsageBilling/ui/UsageBillingShared'
import { RefreshButton } from '@/shared/ui/RefreshButton'

function confirmAction(message: string, action: () => void) {
  if (window.confirm(message)) action()
}

function translateBackendValue(t: (key: string) => string, namespace: string, value: string | null | undefined) {
  if (!value) return null

  const key = `${namespace}.${value}`
  const translated = t(key)

  return translated === key ? value : translated
}

function BatchResult({ batch }: { batch: BillingExportBatch | null }) {
  const { t } = useI18n()
  if (!batch) return null

  const exportState = (value: string | null | undefined) => translateBackendValue(t, 'usage_billing.export_state_value', value)
  const replayClassification = (value: string | null | undefined) => translateBackendValue(t, 'usage_billing.replay_classification_value', value)
  const activityType = (value: string | null | undefined) => translateBackendValue(t, 'usage_billing.activity_type_value', value)
  const billingUnit = (value: string | null | undefined) => translateBackendValue(t, 'usage_billing.billing_unit_value', value)
  const eventType = (value: string | null | undefined) => translateBackendValue(t, 'usage_billing.event_type_value', value)

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-[var(--shadow-soft)] dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
      <h3 className="font-bold">{t('usage_billing.last_batch')}</h3>
      <div className="mt-3">
        <InfoGrid
          items={[
            { label: t('usage_billing.export_batch_ref'), value: batch.exportBatchRef },
            { label: t('usage_billing.export_request_id'), value: batch.exportRequestId },
            { label: t('usage_billing.export_state'), value: exportState(batch.exportState) },
            { label: t('usage_billing.item_count'), value: batch.itemCount },
            { label: t('usage_billing.replay_classification'), value: replayClassification(batch.replayClassification) },
            { label: t('usage_billing.retry_safe'), value: batch.retrySafe ? t('common.yes') : t('common.no') },
            { label: t('usage_billing.direct_runtime_db_access_required'), value: batch.directRuntimeDbAccessRequired ? t('common.yes') : t('common.no') },
            { label: t('usage_billing.invoice_logic_exposed'), value: batch.invoiceLogicExposed ? t('common.yes') : t('common.no') },
            { label: t('usage_billing.payment_logic_exposed'), value: batch.paymentLogicExposed ? t('common.yes') : t('common.no') },
          ]}
        />
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <ListBlock title={t('usage_billing.event_types')} values={batch.eventTypes.map((value) => eventType(value) ?? value)} />
        <ListBlock title={t('usage_billing.payload_correlations')} values={batch.payloads.map((payload) => `${payload.billableActivityId}: ${payload.correlationId}`)} />
      </div>
      {batch.payloads.length ? (
        <div className="mt-3 grid gap-2">
          {batch.payloads.map((payload) => (
            <div key={payload.billableActivityId} className="rounded-xl border border-emerald-200/70 bg-white/70 p-3 dark:border-emerald-500/20 dark:bg-slate-950/20">
              <div className="break-all text-sm font-bold">{payload.billableActivityId}</div>
              <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                <span>{t('usage_billing.activity_type')}: {activityType(payload.activityType)}</span>
                <span>{t('usage_billing.quantity')}: {payload.quantity} {billingUnit(payload.billableUnit)}</span>
                <span>{t('usage_billing.chat_id')}: {payload.chatId ?? t('agents.empty_value')}</span>
                <span>{t('usage_billing.model_request_id')}: {payload.modelRequestId ?? t('agents.empty_value')}</span>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export function BillingExportView({ manager }: { manager: UsageBillingManager }) {
  const { t } = useI18n()
  const status = manager.billingStatus
  const disabled = !manager.canManageBilling || manager.isMutating
  const exportStatus = (value: string | null | undefined) => translateBackendValue(t, 'usage_billing.export_status_value', value)
  const ownerStage = (value: string | null | undefined) => translateBackendValue(t, 'usage_billing.owner_stage_value', value)
  const ownerMarker = (value: string | null | undefined) => translateBackendValue(t, 'usage_billing.owner_marker_value', value)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to={`/tenants/${manager.tenantId}`} className="text-sm font-semibold text-[var(--primary-hover)] hover:underline">
            {t('usage_billing.back_to_tenant')}
          </Link>
          <h2 className="mt-2 text-lg font-bold text-[var(--text)]">{t('usage_billing.billing_title')}</h2>
          <p className="mt-1 break-all text-sm text-[var(--text-muted)]">{manager.tenantId}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/tenants/${manager.tenantId}/usage`}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)]"
          >
            {t('usage_billing.usage_title')}
          </Link>
          <RefreshButton onClick={() => void manager.loadUsageBilling()} />
        </div>
      </div>

      <NoticeBlocks notice={manager.notice} errorMessage={manager.errorMessage} formError={manager.formError} />
      <BatchResult batch={manager.lastBatch} />

      {manager.isLoading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)] shadow-[var(--shadow-soft)]">{t('common.loading')}</div>
      ) : (
        <>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">{t('usage_billing.export_status')}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{ownerMarker(status?.stage25OwnerMarker) ?? t('agents.empty_value')}</p>
              </div>
              {status?.exportStatus ? <StatusBadge status={status.exportStatus} label={exportStatus(status.exportStatus) ?? status.exportStatus} /> : null}
            </div>
            <div className="mt-3">
              <InfoGrid
                items={[
                  { label: t('usage_billing.pending_count'), value: status?.pendingCount ?? 0 },
                  { label: t('usage_billing.exported_count'), value: status?.exportedCount ?? 0 },
                  { label: t('usage_billing.failed_count'), value: status?.failedCount ?? 0 },
                  { label: t('usage_billing.retry_scheduled_count'), value: status?.retryScheduledCount ?? 0 },
                  { label: t('usage_billing.reconciled_count'), value: status?.reconciledCount ?? 0 },
                  { label: t('usage_billing.current_state'), value: exportStatus(status?.currentState) ?? t('agents.empty_value') },
                  { label: t('usage_billing.external_billing_ref'), value: valueOrEmpty(status?.externalBillingRef, t('agents.empty_value')) },
                  { label: t('usage_billing.external_billing_ref_present'), value: status?.externalBillingRefPresent ? t('common.yes') : t('common.no') },
                  { label: t('usage_billing.owner_stage'), value: ownerStage(status?.ownerStage) ?? t('agents.empty_value') },
                  { label: t('usage_billing.last_export_attempt_at'), value: valueOrEmpty(status?.lastExportAttemptAt, t('agents.empty_value')) },
                  { label: t('usage_billing.last_exported_at'), value: valueOrEmpty(status?.lastExportedAt, t('agents.empty_value')) },
                  { label: t('usage_billing.invoice_logic_exposed'), value: status?.invoiceLogicExposed ? t('common.yes') : t('common.no') },
                  { label: t('usage_billing.payment_logic_exposed'), value: status?.paymentLogicExposed ? t('common.yes') : t('common.no') },
                ]}
              />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('usage_billing.export_batch')}</h3>
              <div className="mt-3 grid gap-3">
                <Field label={t('usage_billing.idempotency_key')} value={manager.exportBatchForm.idempotencyKey} disabled={disabled} onChange={(value) => manager.setExportBatchForm((current) => ({ ...current, idempotencyKey: value }))} />
                <TextareaField label={t('usage_billing.billable_activity_ids')} value={manager.exportBatchForm.billableActivityIdsText} disabled={disabled} onChange={(value) => manager.setExportBatchForm((current) => ({ ...current, billableActivityIdsText: value }))} />
                <BatchActivityIdsHint />
                <Field label={t('usage_billing.limit')} value={manager.exportBatchForm.limit} type="number" disabled={disabled} onChange={(value) => manager.setExportBatchForm((current) => ({ ...current, limit: Number(value) || 1 }))} />
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                  <input type="checkbox" checked={manager.exportBatchForm.includeFailed} disabled={disabled} onChange={(event) => manager.setExportBatchForm((current) => ({ ...current, includeFailed: event.target.checked }))} />
                  {t('usage_billing.include_failed')}
                </label>
                <ActionButton primary disabled={disabled} onClick={() => confirmAction(t('usage_billing.confirm_export'), () => void manager.exportBatch())}>
                  {t('usage_billing.export_batch')}
                </ActionButton>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('usage_billing.mark_failure')}</h3>
              <div className="mt-3 grid gap-3">
                <Field label={t('usage_billing.idempotency_key')} value={manager.failureForm.idempotencyKey} disabled={disabled} onChange={(value) => manager.setFailureForm((current) => ({ ...current, idempotencyKey: value }))} />
                <TextareaField label={t('usage_billing.billable_activity_ids')} value={manager.failureForm.billableActivityIdsText} disabled={disabled} onChange={(value) => manager.setFailureForm((current) => ({ ...current, billableActivityIdsText: value }))} />
                <Field label={t('usage_billing.failure_code')} value={manager.failureForm.failureCode} disabled={disabled} onChange={(value) => manager.setFailureForm((current) => ({ ...current, failureCode: value }))} />
                <TextareaField label={t('usage_billing.failure_reason')} value={manager.failureForm.failureReason} disabled={disabled} onChange={(value) => manager.setFailureForm((current) => ({ ...current, failureReason: value }))} />
                <ActionButton disabled={disabled} onClick={() => confirmAction(t('usage_billing.confirm_failure'), () => void manager.markFailure())}>
                  {t('usage_billing.mark_failure')}
                </ActionButton>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('usage_billing.schedule_retry')}</h3>
              <div className="mt-3 grid gap-3">
                <Field label={t('usage_billing.idempotency_key')} value={manager.retryForm.idempotencyKey} disabled={disabled} onChange={(value) => manager.setRetryForm((current) => ({ ...current, idempotencyKey: value }))} />
                <TextareaField label={t('usage_billing.billable_activity_ids')} value={manager.retryForm.billableActivityIdsText} disabled={disabled} onChange={(value) => manager.setRetryForm((current) => ({ ...current, billableActivityIdsText: value }))} />
                <ActionButton disabled={disabled} onClick={() => confirmAction(t('usage_billing.confirm_retry'), () => void manager.scheduleRetry())}>
                  {t('usage_billing.schedule_retry')}
                </ActionButton>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('usage_billing.reconcile')}</h3>
              <div className="mt-3 grid gap-3">
                <Field label={t('usage_billing.idempotency_key')} value={manager.reconciliationForm.idempotencyKey} disabled={disabled} onChange={(value) => manager.setReconciliationForm((current) => ({ ...current, idempotencyKey: value }))} />
                <TextareaField label={t('usage_billing.billable_activity_ids')} value={manager.reconciliationForm.billableActivityIdsText} disabled={disabled} onChange={(value) => manager.setReconciliationForm((current) => ({ ...current, billableActivityIdsText: value }))} />
                <Field label={t('usage_billing.reconciliation_reference')} value={manager.reconciliationForm.reconciliationReference} disabled={disabled} onChange={(value) => manager.setReconciliationForm((current) => ({ ...current, reconciliationReference: value }))} />
                <ActionButton disabled={disabled} onClick={() => confirmAction(t('usage_billing.confirm_reconcile'), () => void manager.reconcile())}>
                  {t('usage_billing.reconcile')}
                </ActionButton>
              </div>
            </div>
          </section>

          {!manager.canManageBilling ? <p className="text-sm text-[var(--text-muted)]">{t('usage_billing.permission_readonly')}</p> : null}
        </>
      )}
    </div>
  )
}
