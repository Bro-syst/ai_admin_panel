import { AppNoticeBar } from '@/core/layout'
import type { AccountPageController } from '@/modules/Account/model/useAccountPage'
import { AccountTotpSection } from '@/modules/Account/ui/AccountTotpSection'

function formatDateTime(value: string | null, locale: string) {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function AccountPageContent({ controller }: { controller: AccountPageController }) {
  const {
    user,
    authState,
    locale,
    t,
    emailDraft,
    setEmailDraft,
    emailTouched,
    setEmailTouched,
    isChangingEmail,
    isResending,
    isRefreshingVerification,
    resendCooldownSeconds,
    sessions,
    isSessionsLoading,
    sessionsError,
    isLoggingOutAll,
    pendingRevokedSessionId,
    feedbackNotice,
    isEmailValid,
    canSubmitEmailChange,
    resendCooldownLabel,
    canLogoutAllSessions,
    handleResendEmail,
    handleRefreshVerificationStatus,
    handleChangeEmail,
    handleLogoutAllSessions,
    handleRevokeSession,
    sanitizeEmailInput,
    isSameEmail,
    totpSection,
  } = controller

  return (
    <div className="mx-auto max-w-3xl">
      <div className="space-y-4">
        {feedbackNotice ? <AppNoticeBar notice={feedbackNotice} /> : null}

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">{t('account.title')}</h2>
            </div>

            <span
              className={[
                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
                authState?.verificationRequired
                  ? 'bg-amber-500/12 text-amber-700 dark:bg-amber-400/16 dark:text-amber-200'
                  : 'bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/16 dark:text-emerald-200',
              ].join(' ')}
            >
              {authState?.verificationRequired ? t('account.email_status.unverified') : t('account.email_status.verified')}
            </span>
          </div>

          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('account.email_current')}</div>
            <div className="mt-2 text-base font-semibold text-[var(--text)]">{user?.email ?? '—'}</div>
          </div>
        </section>

        {authState?.verificationRequired ? (
          <>
            <section className="rounded-2xl border border-amber-200/80 bg-amber-500/10 p-5 shadow-[var(--shadow-soft)] dark:border-amber-400/30 dark:bg-amber-500/12">
              <h3 className="text-base font-semibold text-[var(--text)]">{t('account.verification.title')}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{t('account.verification.description')}</p>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isResending || resendCooldownSeconds > 0}
                  className={[
                    'inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                    isResending || resendCooldownSeconds > 0
                      ? 'cursor-not-allowed bg-[var(--surface-muted)] text-[var(--text-muted)]'
                      : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]',
                  ].join(' ')}
                >
                  {isResending ? t('account.verification.resending') : t('account.verification.resend')}
                </button>

                <button
                  type="button"
                  onClick={handleRefreshVerificationStatus}
                  disabled={isRefreshingVerification}
                  className={[
                    'inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                    isRefreshingVerification
                      ? 'cursor-not-allowed border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]'
                      : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-muted)]',
                  ].join(' ')}
                >
                  {isRefreshingVerification ? t('account.verification.refreshing') : t('account.verification.refresh')}
                </button>

                {resendCooldownSeconds > 0 ? (
                  <span className="text-sm text-[var(--text-muted)]">{resendCooldownLabel}</span>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
              <h3 className="text-base font-semibold text-[var(--text)]">{t('account.change_email.title')}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{t('account.change_email.description')}</p>

              <form className="mt-4 space-y-4" onSubmit={handleChangeEmail}>
                <label className="block">
                  <div className="text-sm font-semibold text-[var(--text)]">{t('account.change_email.label')}</div>
                  <input
                    className={[
                      'mt-2 w-full rounded-xl border bg-[var(--surface)] px-4 py-3 text-base text-[var(--text)] outline-none',
                      'border-[var(--border)] focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                    ].join(' ')}
                    type="email"
                    value={emailDraft}
                    onChange={(event) => setEmailDraft(sanitizeEmailInput(event.target.value))}
                    onBlur={() => setEmailTouched(true)}
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="email"
                    placeholder={t('account.change_email.placeholder')}
                    aria-invalid={emailTouched && !isEmailValid}
                    disabled={isChangingEmail}
                  />
                  {emailTouched && !isEmailValid ? (
                    <div className="mt-1 text-sm text-red-500">{t('auth.validation.email')}</div>
                  ) : null}
                  {emailTouched && isEmailValid && isSameEmail ? (
                    <div className="mt-1 text-sm text-[var(--text-muted)]">{t('account.change_email.same_email')}</div>
                  ) : null}
                </label>

                <button
                  type="submit"
                  disabled={!canSubmitEmailChange}
                  className={[
                    'inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                    canSubmitEmailChange
                      ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]'
                      : 'cursor-not-allowed bg-[var(--surface-muted)] text-[var(--text-muted)]',
                  ].join(' ')}
                >
                  {isChangingEmail ? t('account.change_email.submitting') : t('account.change_email.submit')}
                </button>
              </form>
            </section>
          </>
        ) : (
          <section className="rounded-2xl border border-emerald-200/80 bg-emerald-500/10 p-5 shadow-[var(--shadow-soft)] dark:border-emerald-400/30 dark:bg-emerald-500/12">
            <h3 className="text-base font-semibold text-[var(--text)]">{t('account.verified.title')}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{t('account.verified.description')}</p>
          </section>
        )}

        <AccountTotpSection controller={totpSection} />

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--text)]">{t('account.sessions.title')}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{t('account.sessions.subtitle')}</p>
            </div>

            <button
              type="button"
              onClick={handleLogoutAllSessions}
              disabled={!canLogoutAllSessions}
              className={[
                'inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                canLogoutAllSessions
                  ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]'
                  : 'cursor-not-allowed bg-[var(--surface-muted)] text-[var(--text-muted)]',
              ].join(' ')}
            >
              {isLoggingOutAll ? t('account.sessions.logging_out_all') : t('account.sessions.logout_all')}
            </button>
          </div>

          {isSessionsLoading ? <div className="mt-4 text-sm text-[var(--text-muted)]">{t('account.sessions.loading')}</div> : null}

          {!isSessionsLoading && sessionsError ? (
            <div className="mt-4 rounded-2xl border border-rose-200/80 bg-rose-500/10 p-4 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/12 dark:text-rose-200">
              {sessionsError}
            </div>
          ) : null}

          {!isSessionsLoading && !sessionsError && sessions.length === 0 ? (
            <div className="mt-4 text-sm text-[var(--text-muted)]">{t('account.sessions.empty')}</div>
          ) : null}

          {!isSessionsLoading && !sessionsError && sessions.length > 0 ? (
            <div className="mt-4 space-y-3">
              {sessions.map((session) => {
                const isRevokingThisSession = pendingRevokedSessionId === session.id
                const canRevokeThisSession = !isLoggingOutAll && pendingRevokedSessionId == null

                return (
                  <article key={session.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="truncate text-sm font-semibold text-[var(--text)]">{session.userAgent || session.id}</div>
                          {session.current ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/16 dark:text-emerald-200">
                              {t('account.sessions.current')}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-1 break-all font-mono text-xs text-[var(--text-muted)]">{session.id}</div>
                        {session.ipAddress ? <div className="mt-2 text-xs text-[var(--text-muted)]">{session.ipAddress}</div> : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => void handleRevokeSession(session.id)}
                        disabled={!canRevokeThisSession}
                        className={[
                          'inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                          canRevokeThisSession
                            ? 'bg-[var(--surface)] text-[var(--text)] hover:border-[var(--primary)]/35 hover:text-[var(--primary-hover)]'
                            : 'cursor-not-allowed bg-[var(--surface)] text-[var(--text-muted)] opacity-70',
                        ].join(' ')}
                      >
                        {isRevokingThisSession ? t('account.sessions.revoking') : session.current ? t('common.sign_out') : t('account.sessions.revoke')}
                      </button>
                    </div>

                    <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          {t('account.sessions.created_at')}
                        </dt>
                        <dd className="mt-2 text-sm font-medium text-[var(--text)]">{formatDateTime(session.createdAt, locale)}</dd>
                      </div>

                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          {t('account.sessions.last_seen')}
                        </dt>
                        <dd className="mt-2 text-sm font-medium text-[var(--text)]">{formatDateTime(session.lastSeenAt, locale)}</dd>
                      </div>

                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          {t('account.sessions.expires_at')}
                        </dt>
                        <dd className="mt-2 text-sm font-medium text-[var(--text)]">{formatDateTime(session.expiresAt, locale)}</dd>
                      </div>

                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          {t('account.sessions.idle_expires_at')}
                        </dt>
                        <dd className="mt-2 text-sm font-medium text-[var(--text)]">{formatDateTime(session.idleExpiresAt, locale)}</dd>
                      </div>
                    </dl>
                  </article>
                )
              })}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  )
}
