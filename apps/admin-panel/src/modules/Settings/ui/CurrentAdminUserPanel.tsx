import { useMemo } from 'react'
import type { AuthAdminUser, AuthState } from '@/core/auth/authService'
import { useI18n } from '@/core/i18n/useI18n'
import { localeOptions } from '@/core/i18n/locales'
import { useAppSettings } from '@/core/settings/useAppSettings'

const intlLocaleByCode = Object.fromEntries(localeOptions.map((option) => [option.value, option.intlCode])) as Record<
  (typeof localeOptions)[number]['value'],
  string
>

function resolveRoleLabel(role: string, t: (key: string) => string) {
  const translated = t(`admin.roles.${role}`)
  return translated === `admin.roles.${role}` ? role : translated
}

function resolveStatusLabel(status: string, t: (key: string) => string) {
  const translated = t(`admin.status.${status}`)
  return translated === `admin.status.${status}` ? status : translated
}

function formatBoolean(value: boolean, t: (key: string) => string) {
  return value ? t('common.yes') : t('common.no')
}

export function CurrentAdminUserPanel({
  adminUser,
  authState,
}: {
  adminUser: AuthAdminUser | null
  authState: AuthState | null
}) {
  const { locale, t } = useI18n()
  const { preferences } = useAppSettings()

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(intlLocaleByCode[locale] ?? 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: preferences.timezone,
      }),
    [locale, preferences.timezone],
  )

  function formatDateTime(value: string | null) {
    if (!value) return t('settings.account.last_login_never')

    try {
      return formatter.format(new Date(value))
    } catch {
      return value
    }
  }

  if (!adminUser || !authState) return null

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] md:col-span-2">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text)]">{t('settings.account.title')}</h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{t('settings.account.subtitle')}</p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {t('settings.account.identity_title')}
          </h4>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('common.email')}</dt>
              <dd className="mt-1 break-all text-sm font-medium text-[var(--text)]">{adminUser.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('common.role')}</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--text)]">{resolveRoleLabel(adminUser.role, t)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('common.status')}</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--text)]">{resolveStatusLabel(adminUser.status, t)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('settings.account.last_login')}</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--text)]">{formatDateTime(adminUser.lastLoginAt)}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {t('settings.account.security_title')}
          </h4>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {t('settings.account.authenticated')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-[var(--text)]">{formatBoolean(authState.authenticated, t)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {t('settings.account.verification_required')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-[var(--text)]">
                {formatBoolean(authState.verificationRequired, t)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {t('settings.account.critical_actions_allowed')}
              </dt>
              <dd className="mt-1 text-sm font-medium text-[var(--text)]">
                {formatBoolean(authState.criticalActionsAllowed, t)}
              </dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  )
}
