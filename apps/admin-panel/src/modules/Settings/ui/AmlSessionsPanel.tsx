import { useCallback, useEffect, useMemo, useState } from 'react'
import { emitAuthUnauthorized } from '@/core/auth/authEvents'
import {
  authService,
  readAuthErrorMessage,
  type AmlAuthSessionItem,
} from '@/core/auth/authService'
import { localeOptions } from '@/core/i18n/locales'
import { useI18n } from '@/core/i18n/useI18n'
import { useAppSettings } from '@/core/settings/useAppSettings'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { ErrorSupportDetails } from '@/shared/ui/ErrorSupportDetails'

const intlLocaleByCode = Object.fromEntries(localeOptions.map((option) => [option.value, option.intlCode])) as Record<
  (typeof localeOptions)[number]['value'],
  string
>

type PanelStatus = 'loading' | 'ready' | 'error'
type PendingConfirmation =
  | { kind: 'logout_all' }
  | { kind: 'revoke'; session: AmlAuthSessionItem }
  | null

export function AmlSessionsPanel() {
  const { locale, t } = useI18n()
  const { preferences } = useAppSettings()
  const [status, setStatus] = useState<PanelStatus>('loading')
  const [sessions, setSessions] = useState<AmlAuthSessionItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [errorCause, setErrorCause] = useState<unknown>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<PendingConfirmation>(null)

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(intlLocaleByCode[locale] ?? 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: preferences.timezone,
      }),
    [locale, preferences.timezone],
  )

  const formatDateTime = useCallback(
    (value: string | null, emptyLabel: string) => {
      if (!value) return emptyLabel

      try {
        return formatter.format(new Date(value))
      } catch {
        return value
      }
    },
    [formatter],
  )

  const loadSessions = useCallback(async () => {
    setStatus('loading')
    setError(null)
    setErrorCause(null)

    try {
      const nextSessions = await authService.listSessions()
      setSessions(nextSessions)
      setStatus('ready')
    } catch (nextError) {
      setError(readAuthErrorMessage(nextError, t('settings.sessions.load_error')))
      setErrorCause(nextError)
      setStatus('error')
    }
  }, [t])

  useEffect(() => {
    void loadSessions()
  }, [loadSessions])

  async function handleLogoutAll() {
    setPendingAction('logout_all')
    setError(null)
    setErrorCause(null)
    setNotice(null)

    try {
      const loggedOut = await authService.logoutAll()
      if (loggedOut) emitAuthUnauthorized()
    } catch (nextError) {
      setError(readAuthErrorMessage(nextError, t('settings.sessions.logout_all_error')))
      setErrorCause(nextError)
    } finally {
      setPendingAction(null)
    }
  }

  async function handleRevoke(session: AmlAuthSessionItem) {
    setPendingAction(`revoke:${session.id}`)
    setError(null)
    setErrorCause(null)
    setNotice(null)

    try {
      const result = await authService.revokeSession(session.id)
      if (result.current) {
        emitAuthUnauthorized()
        return
      }

      setNotice(t('settings.sessions.revoke_notice'))
      await loadSessions()
    } catch (nextError) {
      setError(readAuthErrorMessage(nextError, t('settings.sessions.revoke_error')))
      setErrorCause(nextError)
    } finally {
      setPendingAction(null)
    }
  }

  const confirmationTitle =
    confirmation?.kind === 'logout_all'
      ? t('settings.sessions.logout_all')
      : confirmation?.kind === 'revoke'
        ? t('settings.sessions.revoke')
        : ''

  const confirmationDescription =
    confirmation?.kind === 'logout_all'
      ? t('settings.sessions.logout_all_confirm')
      : confirmation?.kind === 'revoke'
        ? confirmation.session.current
          ? t('settings.sessions.revoke_current_confirm')
          : t('settings.sessions.revoke_confirm')
        : ''

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] md:col-span-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)]">{t('settings.sessions.title')}</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t('settings.sessions.subtitle')}</p>
        </div>

        <button
          type="button"
          onClick={() => setConfirmation({ kind: 'logout_all' })}
          disabled={pendingAction !== null || status === 'loading' || sessions.length === 0}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-300 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/25 dark:text-rose-300"
        >
          {t('settings.sessions.logout_all')}
        </button>
      </div>

      {notice ? (
        <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-300 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-300">
          <div>{error}</div>
          <ErrorSupportDetails error={errorCause} className="mt-3" />
        </div>
      ) : null}

      {status === 'loading' ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]"
            />
          ))}
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <h4 className="text-sm font-semibold text-[var(--text)]">{t('settings.sessions.error_title')}</h4>
          <button
            type="button"
            onClick={() => void loadSessions()}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)]"
          >
            {t('common.retry')}
          </button>
        </div>
      ) : null}

      {status === 'ready' && sessions.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <h4 className="text-sm font-semibold text-[var(--text)]">{t('settings.sessions.empty_title')}</h4>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{t('settings.sessions.empty_subtitle')}</p>
        </div>
      ) : null}

      {status === 'ready' && sessions.length > 0 ? (
        <div className="mt-4 space-y-3">
          {sessions.map((session) => (
            <article
              key={session.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="truncate text-sm font-semibold text-[var(--text)]">
                      {session.userAgent ?? t('settings.sessions.user_agent_unknown')}
                    </h4>
                    {session.current ? (
                      <span className="rounded-full border border-emerald-300 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300">
                        {t('settings.sessions.current')}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 grid gap-3 text-sm text-[var(--text-muted)] sm:grid-cols-2 xl:grid-cols-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide">{t('settings.sessions.ip_address')}</div>
                      <div className="mt-1 font-medium text-[var(--text)]">
                        {session.ipAddress ?? t('settings.sessions.ip_unknown')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide">{t('settings.sessions.created_at')}</div>
                      <div className="mt-1 font-medium text-[var(--text)]">
                        {formatDateTime(session.createdAt, '-')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide">{t('settings.sessions.last_seen')}</div>
                      <div className="mt-1 font-medium text-[var(--text)]">
                        {formatDateTime(session.lastSeenAt, t('settings.sessions.last_seen_never'))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide">
                        {t('settings.sessions.idle_expires_at')}
                      </div>
                      <div className="mt-1 font-medium text-[var(--text)]">
                        {formatDateTime(session.idleExpiresAt, '-')}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide">{t('settings.sessions.expires_at')}</div>
                      <div className="mt-1 font-medium text-[var(--text)]">
                        {formatDateTime(session.expiresAt, '-')}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmation({ kind: 'revoke', session })}
                  disabled={pendingAction !== null}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('settings.sessions.revoke')}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={confirmation !== null}
        title={confirmationTitle}
        description={confirmationDescription}
        confirmLabel={confirmationTitle}
        tone="danger"
        isSubmitting={pendingAction !== null}
        onCancel={() => setConfirmation(null)}
        onConfirm={async () => {
          if (!confirmation) return

          if (confirmation.kind === 'logout_all') {
            await handleLogoutAll()
          } else {
            await handleRevoke(confirmation.session)
          }

          setConfirmation(null)
        }}
      />
    </section>
  )
}
