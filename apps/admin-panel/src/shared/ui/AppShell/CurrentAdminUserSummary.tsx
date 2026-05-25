import { useI18n } from '@/core/i18n/useI18n'

function resolveAdminUserStatusLabel(status: string, t: (key: string) => string) {
  const translated = t(`admin.status.${status}`)
  return translated === `admin.status.${status}` ? status : translated
}

function resolveAdminUserStatusClasses(status: string) {
  if (status === 'active') return 'border-emerald-300 bg-emerald-500/10 text-emerald-700'
  if (status === 'blocked') return 'border-amber-300 bg-amber-500/10 text-amber-700'
  if (status === 'archived') return 'border-slate-300 bg-slate-500/10 text-slate-700'
  return 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]'
}

export function CurrentAdminUserSummary({
  email,
  status,
  compact = false,
}: {
  email: string
  status: string
  compact?: boolean
}) {
  const { t } = useI18n()

  return (
    <section
      className={[
        'rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]',
        compact ? 'px-3 py-3' : 'px-3 py-3',
      ].join(' ')}
      aria-label={t('shell.current_admin_user')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {t('shell.current_admin_user')}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-[var(--text)]">{email}</p>
        </div>
        <span
          className={[
            'inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
            resolveAdminUserStatusClasses(status),
          ].join(' ')}
        >
          {resolveAdminUserStatusLabel(status, t)}
        </span>
      </div>
    </section>
  )
}
