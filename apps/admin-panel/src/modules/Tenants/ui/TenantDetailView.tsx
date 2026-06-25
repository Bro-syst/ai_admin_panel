import { Link } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import type { TenantDetailManager, PendingTenantAction } from '@/modules/Tenants/model/useTenantDetailManager'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { CopyableValue } from '@/shared/ui/EntityInfo'
import { RefreshButton } from '@/shared/ui/RefreshButton'

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatJson(value: unknown) {
  return JSON.stringify(value ?? {}, null, 2)
}

function translatedValue(t: (key: string) => string, namespace: string, value: string) {
  const key = `${namespace}.${value}`
  const translated = t(key)
  return translated === key ? value : translated
}

function translatedPendingStatus(t: (key: string) => string, action: NonNullable<PendingTenantAction>['action'], status: string) {
  if (action === 'change_tenant_status') {
    return translatedValue(t, 'tenants.status', status)
  }

  if (action === 'change_provisioning_status') {
    return translatedValue(t, 'tenants.provisioning_status', status)
  }

  return status
}

function StatPill({ label, value, copyValue }: { label: string; value: string; copyValue?: string | null }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold text-[var(--text)]">
        {copyValue ? <CopyableValue value={copyValue} label={value} /> : value}
      </div>
    </div>
  )
}

function MutationFeedback({ manager }: { manager: TenantDetailManager }) {
  const { t } = useI18n()
  const result = manager.lastMutationResult

  if (!result) return null

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-[var(--shadow-soft)] dark:border-emerald-500/30 dark:bg-emerald-500/10">
      <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-100">{t('tenants.mutation_feedback.title')}</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatPill label={t('tenants.action')} value={translatedValue(t, 'tenants.mutation_action', result.action)} />
        <StatPill label={t('tenants.resource_type')} value={translatedValue(t, 'tenants.resource_type_value', result.resourceType)} />
        <StatPill label={t('tenants.resource_id')} value={result.resourceId ?? t('tenants.empty_value')} copyValue={result.resourceId} />
        <StatPill label={t('tenants.correlation_id')} value={result.correlationId ?? t('tenants.empty_value')} copyValue={result.correlationId} />
        <StatPill label={t('tenants.mutation_timestamp')} value={formatDate(result.mutationTimestamp)} />
      </div>
    </section>
  )
}

function ActionButton({
  label,
  disabled,
  onClick,
}: {
  label: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
    >
      {label}
    </button>
  )
}

function confirmationText(pendingAction: PendingTenantAction, t: (key: string) => string) {
  if (!pendingAction) {
    return {
      title: '',
      description: '',
      confirmLabel: '',
    }
  }

  return {
    title: t(`tenants.confirm.${pendingAction.action}.title`),
    description: pendingAction.status
      ? `${t(`tenants.confirm.${pendingAction.action}.description`)} ${translatedPendingStatus(t, pendingAction.action, pendingAction.status)}.`
      : t(`tenants.confirm.${pendingAction.action}.description`),
    confirmLabel: t(`tenants.actions.${pendingAction.action}`),
  }
}

export function TenantDetailView({ manager }: { manager: TenantDetailManager }) {
  const { t } = useI18n()
  const detail = manager.detail
  const tenant = detail?.tenant
  const confirm = confirmationText(manager.pendingAction, t)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to="/tenants" className="text-sm font-semibold text-[var(--primary-hover)] hover:underline">
            {t('tenants.detail.back')}
          </Link>
          <h2 className="mt-2 text-lg font-bold text-[var(--text)]">{tenant?.tenantName ?? t('tenants.detail.title')}</h2>
          <p className="mt-1 break-all text-sm text-[var(--text-muted)]">{manager.tenantId}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {tenant ? (
            <>
              <Link
                to={`/tenants/${manager.tenantId}/conversations`}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)]"
              >
                {t('conversations.title')}
              </Link>
              <Link
                to={`/tenants/${manager.tenantId}/usage`}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)]"
              >
                {t('usage_billing.usage_title')}
              </Link>
              <Link
                to={`/tenants/${manager.tenantId}/billing-export`}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)]"
              >
                {t('usage_billing.billing_title')}
              </Link>
              <Link
                to={`/tenants/${manager.tenantId}/agents`}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white hover:bg-[var(--primary-hover)]"
              >
                {t('agents.list.title')}
              </Link>
            </>
          ) : null}
          <RefreshButton onClick={() => void manager.loadTenant()} />
        </div>
      </div>

      {manager.notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {manager.notice}
        </div>
      ) : null}

      {manager.errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {manager.errorMessage}
        </div>
      ) : null}

      <MutationFeedback manager={manager} />

      {manager.isLoading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)] shadow-[var(--shadow-soft)]">
          {t('common.loading')}
        </div>
      ) : tenant ? (
        <>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <StatPill label={t('common.status')} value={t(`tenants.status.${tenant.tenantStatus}`)} />
              <StatPill
                label={t('tenants.provisioning_status.label')}
                value={t(`tenants.provisioning_status.${tenant.provisioningStatus}`)}
              />
              <StatPill
                label={t('tenants.downstream')}
                value={tenant.downstreamAvailable ? t('tenants.boolean.available') : t('tenants.boolean.unavailable')}
              />
              <StatPill
                label={t('tenants.configuration')}
                value={tenant.configurationPresent ? t('tenants.boolean.present') : t('tenants.boolean.missing')}
              />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <StatPill label={t('tenants.external_customer_ref')} value={tenant.externalCustomerRef ?? t('tenants.empty_value')} />
              <StatPill
                label={t('tenants.external_billing_ref')}
                value={tenant.externalBillingRefPresent ? t('tenants.boolean.present') : t('tenants.boolean.missing')}
              />
              <StatPill label={t('tenants.last_updated')} value={formatDate(tenant.lastUpdatedAt)} />
              <StatPill label={t('tenants.detail_route')} value={tenant.detailRoute} />
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
                <h3 className="text-sm font-bold text-[var(--text)]">{t('tenants.provisioning.title')}</h3>
                {manager.provisioning ? (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <StatPill label={t('tenants.external_customer_ref')} value={manager.provisioning.binding.externalCustomerRef} />
                    <StatPill
                      label={t('tenants.external_billing_ref')}
                      value={manager.provisioning.binding.externalBillingRef ?? t('tenants.empty_value')}
                    />
                    <StatPill label={t('tenants.correlation_id')} value={manager.provisioning.binding.provisioningCorrelationId} />
                    <StatPill label={t('tenants.idempotency_key')} value={manager.provisioning.idempotencyKey} />
                    <StatPill
                      label={t('tenants.idempotency_result')}
                      value={translatedValue(t, 'tenants.idempotency_result_value', manager.provisioning.idempotencyResult)}
                    />
                    <StatPill
                      label={t('tenants.replay_classification')}
                      value={translatedValue(t, 'tenants.replay_classification_value', manager.provisioning.replayClassification)}
                    />
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[var(--text-muted)]">{t('tenants.provisioning.empty')}</p>
                )}
              </section>

              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
                <h3 className="text-sm font-bold text-[var(--text)]">{t('tenants.audit.title')}</h3>
                {manager.auditSummary ? (
                  <div className="mt-3 space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <StatPill label={t('tenants.action')} value={translatedValue(t, 'tenants.audit_action', manager.auditSummary.action)} />
                      <StatPill label={t('tenants.result')} value={translatedValue(t, 'tenants.result_value', manager.auditSummary.result)} />
                      <StatPill label={t('tenants.correlation_id')} value={manager.auditSummary.correlationId} />
                      <StatPill
                        label={t('tenants.downstream')}
                        value={
                          manager.auditSummary.downstreamAvailability.available
                            ? t('tenants.boolean.available')
                            : t('tenants.boolean.unavailable')
                        }
                      />
                    </div>
                    <pre className="max-h-64 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs text-[var(--text)]">
                      {formatJson(manager.auditSummary.changedStateSummary)}
                    </pre>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[var(--text-muted)]">{t('tenants.audit.empty')}</p>
                )}
              </section>

              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
                <h3 className="text-sm font-bold text-[var(--text)]">{t('tenants.config.title')}</h3>
                {detail.configurationSummary ? (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <StatPill label={t('tenants.config.default_locale')} value={detail.configurationSummary.defaultLocale ?? t('tenants.empty_value')} />
                    <StatPill label={t('tenants.config.timezone')} value={detail.configurationSummary.timezone ?? t('tenants.empty_value')} />
                    <StatPill label={t('tenants.config.max_agents')} value={String(detail.configurationSummary.maxAgents ?? t('tenants.empty_value'))} />
                    <StatPill label={t('tenants.config.max_widgets')} value={String(detail.configurationSummary.maxWidgets ?? t('tenants.empty_value'))} />
                    <StatPill
                      label={t('tenants.config.widget_access')}
                      value={detail.configurationSummary.widgetAccessEnabled ? t('common.yes') : t('common.no')}
                    />
                    <StatPill
                      label={t('tenants.config.handoff')}
                      value={detail.configurationSummary.handoffEnabled ? t('common.yes') : t('common.no')}
                    />
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[var(--text-muted)]">{t('tenants.config.empty_summary')}</p>
                )}

                {manager.configuration ? (
                  <div className="mt-4 grid gap-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <label
                        htmlFor="tenant-configuration-payload"
                        className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]"
                      >
                        {t('tenants.config.payload_label')}
                      </label>
                      <button
                        type="button"
                        onClick={() => manager.setConfigurationDraft(formatJson(manager.configuration?.payload))}
                        disabled={!manager.allowedActions.updateConfiguration || !manager.isConfigurationDraftDirty}
                        className="inline-flex h-9 items-center justify-center rounded-xl border border-[var(--border)] px-3 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
                      >
                        {t('tenants.config.reset')}
                      </button>
                    </div>
                    <textarea
                      id="tenant-configuration-payload"
                      value={manager.configurationDraft}
                      onChange={(event) => manager.setConfigurationDraft(event.target.value)}
                      disabled={!manager.allowedActions.updateConfiguration}
                      spellCheck={false}
                      className="min-h-80 w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 font-mono text-xs text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-80"
                    />
                    {manager.configurationDraftError ? (
                      <p className="text-sm font-medium text-rose-600">{manager.configurationDraftError}</p>
                    ) : null}
                    {!manager.allowedActions.updateConfiguration ? (
                      <p className="text-sm text-[var(--text-muted)]">{t('tenants.config.readonly_editor')}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-muted)]">
                    {detail.configurationSummary ? t('tenants.config.payload_unavailable_with_summary') : t('tenants.config.empty_payload')}
                  </p>
                )}
              </section>
            </div>

            <section className="h-fit rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('tenants.actions.title')}</h3>
              {!manager.canMutate ? (
                <p className="mt-2 text-sm text-[var(--text-muted)]">{t('tenants.actions.permission_readonly')}</p>
              ) : null}

              <div className="mt-4 grid gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <ActionButton
                    label={t('tenants.actions.activate')}
                    disabled={!manager.allowedActions.changeTenantStatus || tenant.tenantStatus === 'active'}
                    onClick={() => manager.requestAction('change_tenant_status', 'active')}
                  />
                  <ActionButton
                    label={t('tenants.actions.deactivate')}
                    disabled={!manager.allowedActions.changeTenantStatus || tenant.tenantStatus === 'inactive'}
                    onClick={() => manager.requestAction('change_tenant_status', 'inactive')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {['active', 'suspended', 'disabled', 'failed'].map((status) => (
                    <ActionButton
                      key={status}
                      label={t(`tenants.provisioning_status.${status}`)}
                      disabled={!manager.allowedActions.changeProvisioningStatus || tenant.provisioningStatus === status}
                      onClick={() => manager.requestAction('change_provisioning_status', status)}
                    />
                  ))}
                </div>

                <label className="grid gap-1 pt-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('tenants.form.external_billing_ref')}</span>
                  <input
                    value={manager.billingRef}
                    onChange={(event) => manager.setBillingRef(event.target.value)}
                    disabled={!manager.allowedActions.updateBillingRef}
                    className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
                  />
                </label>
                <ActionButton
                  label={t('tenants.actions.update_billing_ref')}
                  disabled={!manager.allowedActions.updateBillingRef}
                  onClick={() => manager.requestAction('update_billing_ref')}
                />
                <ActionButton
                  label={t('tenants.actions.provision_default_config')}
                  disabled={!manager.allowedActions.provisionDefaultConfig}
                  onClick={() => manager.requestAction('provision_default_config')}
                />
                {tenant.configurationPresent ? (
                  <p className="text-xs font-medium text-[var(--text-muted)]">{t('tenants.actions.default_config_already_present')}</p>
                ) : null}
                <ActionButton
                  label={t('tenants.actions.save_configuration')}
                  disabled={
                    !manager.allowedActions.updateConfiguration ||
                    !manager.isConfigurationDraftDirty ||
                    Boolean(manager.configurationDraftError)
                  }
                  onClick={() => manager.requestAction('save_configuration')}
                />
              </div>

              <div className="mt-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {t('tenants.mutation_actions')}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {detail.supportedMutationActions.length > 0 ? detail.supportedMutationActions.map((action) => {
                    const actionLabel = translatedValue(t, 'tenants.mutation_action', action)
                    return (
                      <span
                        key={action}
                        title={action}
                        className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-xs text-[var(--text-muted)]"
                      >
                        {actionLabel}
                      </span>
                    )
                  }) : (
                    <span className="text-sm text-[var(--text-muted)]">{t('tenants.empty_value')}</span>
                  )}
                </div>
              </div>
            </section>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)] shadow-[var(--shadow-soft)]">
          {t('tenants.detail.empty')}
        </div>
      )}

      <ConfirmDialog
        isOpen={manager.pendingAction !== null}
        title={confirm.title}
        description={confirm.description}
        confirmLabel={confirm.confirmLabel}
        isSubmitting={manager.isSubmitting}
        onConfirm={manager.confirmAction}
        onCancel={manager.cancelAction}
      />
    </div>
  )
}
