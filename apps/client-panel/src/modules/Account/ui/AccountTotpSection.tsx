import { QRCodeSVG } from 'qrcode.react'
import { AppNoticeBar } from '@/core/layout'
import type { AccountTotpSectionController } from '@/modules/Account/model/useAccountTotpSection'

function StatusChip({
  className,
  label,
}: {
  className: string
  label: string
}) {
  return <span className={['inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', className].join(' ')}>{label}</span>
}

export function AccountTotpSection({ controller }: { controller: AccountTotpSectionController }) {
  const {
    t,
    enrollment,
    isStatusLoading,
    isStartingEnrollment,
    isConfirmingEnrollment,
    isDisabling,
    isStartingRecovery,
    isConfirmingRecovery,
    isStatusKnown,
    enrollmentCode,
    disableCode,
    recoveryCode,
    recoveryStarted,
    hasEnabledTotp,
    hasPendingEnrollment,
    pendingEnrollmentWithoutPayload,
    canStartEnrollment,
    canConfirmEnrollment,
    canDisableTotp,
    canStartRecovery,
    canConfirmRecovery,
    startEnrollmentLabel,
    feedbackNotice,
    handleReloadStatus,
    setEnrollmentCode,
    setDisableCode,
    setRecoveryCode,
    handleStartEnrollment,
    handleConfirmEnrollment,
    handleDisableTotp,
    handleStartRecovery,
    handleConfirmRecovery,
  } = controller

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-[var(--text)]">{t('account.totp.title')}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{t('account.totp.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusChip
            className={
              !isStatusKnown
                ? 'bg-slate-500/12 text-slate-700 dark:bg-slate-500/18 dark:text-slate-200'
                : hasEnabledTotp
                ? 'bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/18 dark:text-emerald-200'
                : 'bg-slate-500/12 text-slate-700 dark:bg-slate-500/18 dark:text-slate-200'
            }
            label={!isStatusKnown ? t('account.totp.state.unavailable') : hasEnabledTotp ? t('account.totp.state.enabled') : t('account.totp.state.disabled')}
          />

          {hasPendingEnrollment ? (
            <StatusChip
              className="bg-amber-500/12 text-amber-700 dark:bg-amber-500/18 dark:text-amber-200"
              label={t('account.totp.state.pending')}
            />
          ) : null}
        </div>
      </div>

      {feedbackNotice ? <div className="mt-4"><AppNoticeBar notice={feedbackNotice} /></div> : null}

      {isStatusLoading ? <div className="mt-4 text-sm text-[var(--text-muted)]">{t('account.totp.status.loading')}</div> : null}

      {!isStatusLoading && !isStatusKnown ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={handleReloadStatus}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--primary)]/35 hover:text-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {t('account.totp.status.retry')}
          </button>
        </div>
      ) : null}

      {!isStatusLoading && isStatusKnown ? (
        <div className="mt-4 space-y-4">
          {canStartEnrollment ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleStartEnrollment}
                disabled={isStartingEnrollment}
                className={[
                  'inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                  isStartingEnrollment
                    ? 'cursor-not-allowed bg-[var(--surface-muted)] text-[var(--text-muted)]'
                    : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]',
                ].join(' ')}
              >
                {isStartingEnrollment ? t('account.totp.enrollment.restart') : startEnrollmentLabel}
              </button>
            </div>
          ) : null}

          {pendingEnrollmentWithoutPayload ? (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-500/10 p-4 text-sm leading-6 text-[var(--text-muted)] dark:border-amber-400/30 dark:bg-amber-500/12">
              {t('account.totp.enrollment.pending_missing')}
            </div>
          ) : null}

          {enrollment ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <h4 className="text-sm font-semibold text-[var(--text)]">{t('account.totp.enrollment.title')}</h4>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{t('account.totp.enrollment.subtitle')}</p>

              <div className="mt-4 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="flex justify-center rounded-2xl border border-[var(--border)] bg-white p-4 dark:bg-slate-50">
                  <QRCodeSVG value={enrollment.otpauthUri} size={172} />
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      {t('account.totp.enrollment.manual_key')}
                    </div>
                    <div className="mt-2 break-all font-mono text-sm font-medium text-[var(--text)]">{enrollment.manualEntryKey}</div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                        {t('account.totp.enrollment.account')}
                      </div>
                      <div className="mt-2 text-sm font-medium text-[var(--text)]">{enrollment.accountLabel}</div>
                    </div>
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                        {t('account.totp.enrollment.issuer')}
                      </div>
                      <div className="mt-2 text-sm font-medium text-[var(--text)]">{enrollment.issuer}</div>
                    </div>
                  </div>
                </div>
              </div>

              <form
                className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,240px)_auto] sm:items-end"
                onSubmit={(event) => {
                  event.preventDefault()
                  void handleConfirmEnrollment()
                }}
              >
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-[var(--text)]">{t('account.totp.field.code')}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={enrollmentCode}
                    onChange={(event) => setEnrollmentCode(event.target.value)}
                    className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                  />
                  {enrollmentCode.length > 0 && enrollmentCode.length < 6 ? (
                    <span className="text-sm text-red-500">{t('account.totp.validation.code_required')}</span>
                  ) : null}
                </label>

                <button
                  type="submit"
                  disabled={!canConfirmEnrollment}
                  className={[
                    'inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                    canConfirmEnrollment
                      ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]'
                      : 'cursor-not-allowed bg-[var(--surface-muted)] text-[var(--text-muted)]',
                  ].join(' ')}
                >
                  {isConfirmingEnrollment ? t('account.totp.confirm.submitting') : t('account.totp.confirm.submit')}
                </button>
              </form>
            </div>
          ) : null}

          {hasEnabledTotp ? (
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <h4 className="text-sm font-semibold text-[var(--text)]">{t('account.totp.disable.title')}</h4>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{t('account.totp.disable.subtitle')}</p>

                <form
                  className="mt-4 grid gap-3"
                  onSubmit={(event) => {
                    event.preventDefault()
                    void handleDisableTotp()
                  }}
                >
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-[var(--text)]">{t('account.totp.field.code')}</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={disableCode}
                      onChange={(event) => setDisableCode(event.target.value)}
                      className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    />
                    {disableCode.length > 0 && disableCode.length < 6 ? (
                      <span className="text-sm text-red-500">{t('account.totp.validation.code_required')}</span>
                    ) : null}
                  </label>

                  <button
                    type="submit"
                    disabled={!canDisableTotp}
                    className={[
                      'inline-flex h-11 items-center justify-center self-start rounded-xl px-4 text-sm font-semibold transition',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                      canDisableTotp
                        ? 'bg-[var(--surface)] text-[var(--text)] hover:border-[var(--primary)]/35 hover:text-[var(--primary-hover)]'
                        : 'cursor-not-allowed bg-[var(--surface)] text-[var(--text-muted)] opacity-70',
                    ].join(' ')}
                  >
                    {isDisabling ? t('account.totp.disable.submitting') : t('account.totp.disable.submit')}
                  </button>
                </form>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <h4 className="text-sm font-semibold text-[var(--text)]">{t('account.totp.recovery.title')}</h4>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{t('account.totp.recovery.subtitle')}</p>

                {!canStartRecovery && !recoveryStarted ? (
                  <div className="mt-3 text-sm text-[var(--text-muted)]">{t('account.totp.recovery.unavailable')}</div>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleStartRecovery}
                    disabled={!canStartRecovery}
                    className={[
                      'inline-flex h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                      canStartRecovery
                        ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]'
                        : 'cursor-not-allowed bg-[var(--surface-muted)] text-[var(--text-muted)]',
                    ].join(' ')}
                  >
                    {isStartingRecovery ? t('account.totp.recovery.starting') : t('account.totp.recovery.start')}
                  </button>
                </div>

                {recoveryStarted ? (
                  <form
                    className="mt-4 grid gap-3"
                    onSubmit={(event) => {
                      event.preventDefault()
                      void handleConfirmRecovery()
                    }}
                  >
                    <label className="grid gap-2">
                      <span className="text-sm font-semibold text-[var(--text)]">{t('account.totp.field.code')}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={recoveryCode}
                        onChange={(event) => setRecoveryCode(event.target.value)}
                        className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      />
                      {recoveryCode.length > 0 && recoveryCode.length < 6 ? (
                        <span className="text-sm text-red-500">{t('account.totp.validation.code_required')}</span>
                      ) : null}
                    </label>

                    <button
                      type="submit"
                      disabled={!canConfirmRecovery}
                      className={[
                        'inline-flex h-11 items-center justify-center self-start rounded-xl px-4 text-sm font-semibold transition',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                        canConfirmRecovery
                          ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]'
                          : 'cursor-not-allowed bg-[var(--surface-muted)] text-[var(--text-muted)]',
                      ].join(' ')}
                    >
                      {isConfirmingRecovery
                        ? t('account.totp.recovery.confirm_submitting')
                        : t('account.totp.recovery.confirm_submit')}
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
