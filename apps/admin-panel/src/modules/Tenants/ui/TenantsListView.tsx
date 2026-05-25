import { Link } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import type { TenantCard } from '@/modules/Tenants/api/tenantsApi'
import type { TenantsListManager } from '@/modules/Tenants/model/useTenantsListManager'
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

function statusTone(status: string) {
  if (status === 'active') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
  }
  if (status === 'failed' || status === 'disabled' || status === 'inactive') {
    return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
  }
  return 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={['inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold', statusTone(status)].join(' ')}>
      {label}
    </span>
  )
}

function hasActiveFilters(manager: TenantsListManager) {
  return Boolean(
    manager.filters.search.trim() ||
      manager.filters.tenantStatus !== 'all' ||
      manager.filters.provisioningStatus !== 'all',
  )
}

function TenantRow({ tenant, t }: { tenant: TenantCard; t: (key: string) => string }) {
  return (
    <tr className="transition hover:bg-[var(--surface-muted)]">
      <td className="px-4 py-3">
        <Link to={`/tenants/${tenant.tenantId}`} className="font-semibold text-[var(--primary-hover)] hover:underline">
          {tenant.tenantName}
        </Link>
        <div className="mt-1 break-all text-xs text-[var(--text-muted)]">{tenant.tenantId}</div>
      </td>
      <td className="px-4 py-3 text-[var(--text-muted)]">{tenant.externalCustomerRef ?? t('tenants.empty_value')}</td>
      <td className="px-4 py-3">
        <StatusBadge status={tenant.tenantStatus} label={t(`tenants.status.${tenant.tenantStatus}`)} />
      </td>
      <td className="px-4 py-3">
        <StatusBadge
          status={tenant.provisioningStatus}
          label={t(`tenants.provisioning_status.${tenant.provisioningStatus}`)}
        />
      </td>
      <td className="px-4 py-3 text-[var(--text-muted)]">
        {tenant.downstreamAvailable ? t('tenants.boolean.available') : t('tenants.boolean.unavailable')}
      </td>
      <td className="px-4 py-3 text-[var(--text-muted)]">{formatDate(tenant.lastUpdatedAt)}</td>
    </tr>
  )
}

export function TenantsListView({ manager }: { manager: TenantsListManager }) {
  const { t } = useI18n()
  const filteredEmpty = !manager.isLoading && manager.tenants.length === 0 && hasActiveFilters(manager)
  const empty = !manager.isLoading && manager.tenants.length === 0 && !hasActiveFilters(manager)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--text)]">{t('tenants.title')}</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">{t('tenants.subtitle')}</p>
        </div>

        <RefreshButton onClick={() => void manager.loadTenants()} />
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

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_220px]">
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('tenants.filters.search')}</span>
            <input
              value={manager.filters.search}
              onChange={(event) => manager.setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder={t('tenants.filters.search_placeholder')}
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('common.status')}</span>
            <select
              value={manager.filters.tenantStatus}
              onChange={(event) => manager.setFilters((current) => ({ ...current, tenantStatus: event.target.value }))}
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <option value="all">{t('tenants.filters.all_statuses')}</option>
              {manager.statusOptions.map((status) => (
                <option key={status} value={status}>{t(`tenants.status.${status}`)}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('tenants.provisioning_status.label')}</span>
            <select
              value={manager.filters.provisioningStatus}
              onChange={(event) => manager.setFilters((current) => ({ ...current, provisioningStatus: event.target.value }))}
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <option value="all">{t('tenants.filters.all_provisioning_statuses')}</option>
              {manager.provisioningStatusOptions.map((status) => (
                <option key={status} value={status}>{t(`tenants.provisioning_status.${status}`)}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <h3 className="text-sm font-bold text-[var(--text)]">{t('tenants.list_title')}</h3>
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              {manager.metadata ? `${manager.metadata.returnedItems} / ${manager.metadata.totalItems}` : manager.tenants.length}
            </span>
          </div>

          {manager.isLoading ? (
            <div className="p-6 text-sm text-[var(--text-muted)]">{t('common.loading')}</div>
          ) : empty ? (
            <div className="p-6">
              <h4 className="text-sm font-bold text-[var(--text)]">{t('tenants.empty_title')}</h4>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{t('tenants.empty_subtitle')}</p>
            </div>
          ) : filteredEmpty ? (
            <div className="p-6">
              <h4 className="text-sm font-bold text-[var(--text)]">{t('tenants.filtered_empty_title')}</h4>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{t('tenants.filtered_empty_subtitle')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border)] text-left text-sm">
                <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t('tenants.tenant')}</th>
                    <th className="px-4 py-3 font-semibold">{t('tenants.external_customer_ref')}</th>
                    <th className="px-4 py-3 font-semibold">{t('common.status')}</th>
                    <th className="px-4 py-3 font-semibold">{t('tenants.provisioning_status.label')}</th>
                    <th className="px-4 py-3 font-semibold">{t('tenants.downstream')}</th>
                    <th className="px-4 py-3 font-semibold">{t('tenants.last_updated')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {manager.tenants.map((tenant) => (
                    <TenantRow key={tenant.tenantId} tenant={tenant} t={t} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
          <h3 className="text-sm font-bold text-[var(--text)]">{t('tenants.provision.title')}</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t('tenants.provision.subtitle')}</p>

          <div className="mt-4 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('tenants.form.tenant_name')}</span>
              <input
                value={manager.provisionForm.tenantName}
                onChange={(event) => manager.updateProvisionForm({ tenantName: event.target.value })}
                disabled={!manager.canMutate || manager.isProvisioning}
                className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('tenants.form.external_customer_ref')}</span>
              <input
                value={manager.provisionForm.externalCustomerRef}
                onChange={(event) => manager.updateProvisionForm({ externalCustomerRef: event.target.value })}
                disabled={!manager.canMutate || manager.isProvisioning}
                className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('tenants.form.external_billing_ref')}</span>
              <input
                value={manager.provisionForm.externalBillingRef}
                onChange={(event) => manager.updateProvisionForm({ externalBillingRef: event.target.value })}
                disabled={!manager.canMutate || manager.isProvisioning}
                className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
              />
            </label>
          </div>

          {manager.formError ? <p className="mt-3 text-sm font-medium text-rose-600">{manager.formError}</p> : null}

          {!manager.canMutate ? (
            <p className="mt-3 text-sm text-[var(--text-muted)]">{t('tenants.provision.permission_readonly')}</p>
          ) : null}

          <button
            type="button"
            onClick={() => void manager.provisionTenant()}
            disabled={!manager.canMutate || manager.isProvisioning}
            className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
          >
            {manager.isProvisioning ? t('tenants.provision.submitting') : t('tenants.provision.submit')}
          </button>
        </section>
      </div>
    </div>
  )
}
