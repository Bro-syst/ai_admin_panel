import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import { AppShell } from '@/core/layout'

export function HomePage() {
  const { user, authState } = useAuth()
  const { t } = useI18n()

  return (
    <AppShell title={t('client.home.title')}>
      <div className="mx-auto max-w-3xl">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">{t('client.home.ready_title')}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{t('client.home.ready_description')}</p>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('common.email')}</dt>
              <dd className="mt-2 text-sm font-semibold text-[var(--text)]">{user?.email ?? '-'}</dd>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {t('account.email_status.title')}
              </dt>
              <dd className="mt-2 text-sm font-semibold text-[var(--text)]">
                {authState?.verificationRequired ? t('account.email_status.unverified') : t('account.email_status.verified')}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </AppShell>
  )
}
