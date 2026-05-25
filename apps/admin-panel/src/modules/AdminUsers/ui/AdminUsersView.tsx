import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import type { AdminUser, AdminUserStatus } from '@/modules/AdminUsers/api/adminUsersApi'
import type { AdminUserAction, AdminUsersManager } from '@/modules/AdminUsers/model/useAdminUsersManager'
import { useI18n } from '@/core/i18n/useI18n'
import { RefreshButton } from '@/shared/ui/RefreshButton'

const MUTATING_ACTIONS: AdminUserAction[] = ['resend_invite', 'disable', 'enable', 'revoke_sessions']

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

function statusTone(status: AdminUserStatus) {
  return status === 'active'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
    : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold text-[var(--text)]">{value}</div>
    </div>
  )
}

function AdminStatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span className={['inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold', statusTone(status)].join(' ')}>
      {label}
    </span>
  )
}

function actionLabel(action: AdminUserAction, t: (key: string) => string) {
  return t(`admin_users.actions.${action}`)
}

function canRunAction(action: AdminUserAction, admin: AdminUser, manager: AdminUsersManager) {
  if (!manager.canMutate) return false
  if (action === 'disable' && manager.currentAdminId === admin.id) return false
  if (action === 'disable') return admin.status === 'active'
  if (action === 'enable') return admin.status !== 'active'
  if (action === 'resend_invite') return admin.passwordSetupRequired
  return true
}

export function AdminUsersView({ manager }: { manager: AdminUsersManager }) {
  const { t } = useI18n()
  const selectedAdmin = manager.selectedAdmin
  const pendingAction = manager.pendingAction

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--text)]">{t('admin_users.title')}</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">{t('admin_users.subtitle')}</p>
        </div>

        <RefreshButton onClick={() => void manager.loadAdmins()} />
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
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_180px]">
          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('admin_users.filters.search')}</span>
            <input
              value={manager.filters.query}
              onChange={(event) => manager.setFilters((current) => ({ ...current, query: event.target.value }))}
              placeholder={t('admin_users.filters.search_placeholder')}
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('common.role')}</span>
            <select
              value={manager.filters.role}
              onChange={(event) => manager.setFilters((current) => ({ ...current, role: event.target.value }))}
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <option value="all">{t('admin_users.filters.all_roles')}</option>
              {manager.roleOptions.map((role) => (
                <option key={role} value={role}>{t(`admin.roles.${role}`)}</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('common.status')}</span>
            <select
              value={manager.filters.status}
              onChange={(event) => manager.setFilters((current) => ({ ...current, status: event.target.value }))}
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <option value="all">{t('admin_users.filters.all_statuses')}</option>
              {manager.statusOptions.map((status) => (
                <option key={status} value={status}>{t(`admin.status.${status}`)}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <h3 className="text-sm font-bold text-[var(--text)]">{t('admin_users.list_title')}</h3>
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              {manager.filteredAdmins.length} / {manager.admins.length}
            </span>
          </div>

          {manager.isLoading ? (
            <div className="p-6 text-sm text-[var(--text-muted)]">{t('common.loading')}</div>
          ) : manager.admins.length === 0 ? (
            <div className="p-6">
              <h4 className="text-sm font-bold text-[var(--text)]">{t('admin_users.empty_title')}</h4>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{t('admin_users.empty_subtitle')}</p>
            </div>
          ) : manager.filteredAdmins.length === 0 ? (
            <div className="p-6">
              <h4 className="text-sm font-bold text-[var(--text)]">{t('admin_users.filtered_empty_title')}</h4>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{t('admin_users.filtered_empty_subtitle')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border)] text-left text-sm">
                <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t('common.email')}</th>
                    <th className="px-4 py-3 font-semibold">{t('common.role')}</th>
                    <th className="px-4 py-3 font-semibold">{t('common.status')}</th>
                    <th className="px-4 py-3 font-semibold">{t('admin_users.invite_status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {manager.filteredAdmins.map((admin) => (
                    <tr
                      key={admin.id}
                      className={[
                        'cursor-pointer transition hover:bg-[var(--surface-muted)]',
                        selectedAdmin?.id === admin.id ? 'bg-[var(--primary)]/8' : '',
                      ].join(' ')}
                      onClick={() => void manager.selectAdmin(admin)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[var(--text)]">{admin.email}</div>
                        <div className="text-xs text-[var(--text-muted)]">{admin.displayName || t('admin_users.display_name_empty')}</div>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">{t(`admin.roles.${admin.role}`)}</td>
                      <td className="px-4 py-3"><AdminStatusBadge status={admin.status} label={t(`admin.status.${admin.status}`)} /></td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">{admin.inviteStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <h3 className="text-sm font-bold text-[var(--text)]">{t('admin_users.create_title')}</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{t('admin_users.create_subtitle')}</p>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('common.email')}</span>
                <input
                  value={manager.createForm.email}
                  onChange={(event) => manager.updateCreateForm({ email: event.target.value })}
                  disabled={!manager.canMutate || manager.isCreating}
                  className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('admin_users.display_name')}</span>
                <input
                  value={manager.createForm.displayName}
                  onChange={(event) => manager.updateCreateForm({ displayName: event.target.value })}
                  disabled={!manager.canMutate || manager.isCreating}
                  className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('common.role')}</span>
                <select
                  value={manager.createForm.role}
                  onChange={(event) => manager.updateCreateForm({ role: event.target.value })}
                  disabled={!manager.canMutate || manager.isCreating}
                  className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
                >
                  {['platform_admin', 'platform_operator', 'platform_viewer'].map((role) => (
                    <option key={role} value={role}>{t(`admin.roles.${role}`)}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('admin_users.tenant_id')}</span>
                <input
                  value={manager.createForm.tenantId}
                  onChange={(event) => manager.updateCreateForm({ tenantId: event.target.value })}
                  disabled={!manager.canMutate || manager.isCreating}
                  placeholder={t('admin_users.tenant_id_placeholder')}
                  className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
                />
              </label>
            </div>

            {manager.formError ? <p className="mt-3 text-sm font-medium text-rose-600">{manager.formError}</p> : null}

            {!manager.canMutate ? (
              <p className="mt-3 text-sm text-[var(--text-muted)]">{t('admin_users.permission_readonly')}</p>
            ) : null}

            <button
              type="button"
              onClick={() => void manager.createAdmin()}
              disabled={!manager.canMutate || manager.isCreating}
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
            >
              {manager.isCreating ? t('admin_users.creating') : t('admin_users.create_submit')}
            </button>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <h3 className="text-sm font-bold text-[var(--text)]">{t('admin_users.detail_title')}</h3>
            {manager.isDetailLoading ? <p className="mt-3 text-sm text-[var(--text-muted)]">{t('common.loading')}</p> : null}

            {selectedAdmin ? (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="break-words text-base font-bold text-[var(--text)]">{selectedAdmin.email}</div>
                  <div className="mt-1 text-sm text-[var(--text-muted)]">{selectedAdmin.displayName || t('admin_users.display_name_empty')}</div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <StatPill label={t('common.role')} value={t(`admin.roles.${selectedAdmin.role}`)} />
                  <StatPill label={t('common.status')} value={t(`admin.status.${selectedAdmin.status}`)} />
                  <StatPill label={t('admin_users.password_setup')} value={selectedAdmin.passwordSetupRequired ? t('common.yes') : t('common.no')} />
                  <StatPill label={t('admin_users.totp')} value={selectedAdmin.totpEnabled ? t('common.yes') : t('common.no')} />
                  <StatPill label={t('admin_users.created_at')} value={formatDate(selectedAdmin.createdAt)} />
                  <StatPill label={t('admin_users.updated_at')} value={formatDate(selectedAdmin.updatedAt)} />
                </div>

                <div className="grid gap-2">
                  {MUTATING_ACTIONS.map((action) => {
                    const disabled = !canRunAction(action, selectedAdmin, manager)
                    return (
                      <button
                        key={action}
                        type="button"
                        disabled={disabled || manager.isActionSubmitting}
                        onClick={() => manager.requestAction(action, selectedAdmin)}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
                      >
                        {actionLabel(action, t)}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[var(--text-muted)]">{t('admin_users.detail_empty')}</p>
            )}
          </section>
        </div>
      </div>

      <ConfirmDialog
        isOpen={pendingAction !== null}
        title={pendingAction ? actionLabel(pendingAction.action, t) : ''}
        description={pendingAction ? t(`admin_users.confirm.${pendingAction.action}`) : ''}
        confirmLabel={pendingAction ? actionLabel(pendingAction.action, t) : t('common.yes')}
        tone={pendingAction?.action === 'disable' ? 'danger' : 'default'}
        isSubmitting={manager.isActionSubmitting}
        onCancel={manager.cancelAction}
        onConfirm={manager.confirmAction}
      />
    </div>
  )
}
