import { useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useI18n } from '@/core/i18n/useI18n'
import { useAdminTotpManager } from '@/modules/AdminSecurity/model/useAdminTotpManager'
import { ErrorSupportDetails } from '@/shared/ui/ErrorSupportDetails'
import { RefreshButton } from '@/shared/ui/RefreshButton'

function normalizeTotpCode(value: string) {
  return value.replace(/\D/g, '').slice(0, 6)
}

function resolveStatusTone(enabled: boolean, pendingEnrollment: boolean) {
  if (enabled) {
    return {
      badgeClass:
        'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300',
      surfaceClass: 'border-emerald-300/70 bg-emerald-500/5 dark:border-emerald-500/20 dark:bg-emerald-500/10',
    }
  }

  if (pendingEnrollment) {
    return {
      badgeClass:
        'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300',
      surfaceClass: 'border-amber-300/70 bg-amber-500/5 dark:border-amber-500/20 dark:bg-amber-500/10',
    }
  }

  return {
    badgeClass:
      'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)] dark:bg-[var(--surface-muted)]',
    surfaceClass: 'border-[var(--border)] bg-[var(--surface-muted)]/30',
  }
}

function TotpCodeActionForm({
  title,
  description,
  code,
  onCodeChange,
  codeError,
  onSubmit,
  submitLabel,
  pending,
}: {
  title: string
  description: string
  code: string
  onCodeChange: (value: string) => void
  codeError: string | null
  onSubmit: () => void
  submitLabel: string
  pending: boolean
}) {
  const { t } = useI18n()

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <h4 className="text-sm font-semibold text-[var(--text)]">{title}</h4>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>

      <div className="mt-4 grid gap-2">
        <label className="grid gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {t('settings.totp.code_label')}
          </span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => onCodeChange(normalizeTotpCode(event.target.value))}
            placeholder={t('settings.totp.code_placeholder')}
            className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold tracking-[0.3em] text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          />
        </label>

        {codeError ? <p className="text-sm font-medium text-red-600 dark:text-red-300">{codeError}</p> : null}

        <button
          type="button"
          onClick={onSubmit}
          disabled={pending}
          className="inline-flex h-11 items-center justify-center self-start rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </article>
  )
}

export function AdminTotpPanel() {
  const { t } = useI18n()
  const {
    status,
    totp,
    enrollment,
    loadError,
    loadErrorCause,
    notice,
    actionError,
    actionErrorCause,
    pendingAction,
    reload,
    beginEnrollment,
    confirmEnrollment,
    disableTotp,
  } = useAdminTotpManager()

  const [confirmCode, setConfirmCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [confirmCodeError, setConfirmCodeError] = useState<string | null>(null)
  const [disableCodeError, setDisableCodeError] = useState<string | null>(null)

  const tone = useMemo(
    () => resolveStatusTone(totp?.enabled === true, totp?.pendingEnrollment === true),
    [totp?.enabled, totp?.pendingEnrollment],
  )

  const statusLabel = totp?.enabled
    ? t('settings.totp.status_enabled')
    : totp?.pendingEnrollment
      ? t('settings.totp.status_pending')
      : t('settings.totp.status_disabled')

  const statusSummary = totp?.enabled
    ? t('settings.totp.summary_enabled')
    : totp?.pendingEnrollment
      ? t('settings.totp.summary_pending')
      : t('settings.totp.summary_disabled')

  const isBusy = pendingAction !== null
  const hasProvisioningPayload = enrollment != null
  const pendingEnrollmentWithoutPayload = totp?.pendingEnrollment === true && !hasProvisioningPayload

  async function handleBeginEnrollment() {
    setConfirmCodeError(null)
    setDisableCodeError(null)
    await beginEnrollment()
  }

  async function handleConfirm() {
    if (confirmCode.length !== 6) {
      setConfirmCodeError(t('settings.totp.code_validation'))
      return
    }

    setConfirmCodeError(null)
    await confirmEnrollment(confirmCode)
    setConfirmCode('')
  }

  async function handleDisable() {
    if (disableCode.length !== 6) {
      setDisableCodeError(t('settings.totp.code_validation'))
      return
    }

    setDisableCodeError(null)
    await disableTotp(disableCode)
    setDisableCode('')
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)] md:col-span-2">
      <div>
        <h3 className="text-sm font-semibold text-[var(--text)]">{t('settings.totp.title')}</h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{t('settings.totp.subtitle')}</p>
      </div>

      {notice ? (
        <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-300">
          {notice}
        </div>
      ) : null}

      {actionError ? (
        <div className="mt-4 rounded-2xl border border-red-300 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/25 dark:bg-red-500/15 dark:text-red-300">
          <div>{actionError}</div>
          <ErrorSupportDetails error={actionErrorCause} className="mt-3" />
        </div>
      ) : null}

      {status === 'loading' ? (
        <div className="mt-4 space-y-3">
          <div className="h-24 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]" />
          <div className="h-36 animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]" />
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
          <h4 className="text-sm font-semibold text-[var(--text)]">{t('settings.totp.error_title')}</h4>
          {loadError ? <p className="mt-2 text-sm text-[var(--text-muted)]">{loadError}</p> : null}
          <ErrorSupportDetails error={loadErrorCause} className="mt-4 text-left" />
          <RefreshButton className="mt-4" onClick={() => void reload()} />
        </div>
      ) : null}

      {status === 'ready' && totp ? (
        <>
          <article className={['mt-4 rounded-2xl border p-4', tone.surfaceClass].join(' ')}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[var(--text)]">{t('settings.totp.state_title')}</h4>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{statusSummary}</p>
              </div>
              <span className={['self-start rounded-full border px-2.5 py-1 text-xs font-semibold', tone.badgeClass].join(' ')}>
                {statusLabel}
              </span>
            </div>
          </article>

          {totp.enabled ? (
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <h4 className="text-sm font-semibold text-[var(--text)]">{t('settings.totp.enabled_title')}</h4>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{t('settings.totp.enabled_note')}</p>
                <p className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-3 text-sm text-[var(--text-muted)]">
                  {t('settings.totp.recovery_note')}
                </p>
              </article>

              <TotpCodeActionForm
                title={t('settings.totp.disable_title')}
                description={t('settings.totp.disable_subtitle')}
                code={disableCode}
                onCodeChange={(value) => {
                  setDisableCode(value)
                  setDisableCodeError(null)
                }}
                codeError={disableCodeError}
                onSubmit={() => void handleDisable()}
                submitLabel={t('settings.totp.disable_submit')}
                pending={pendingAction === 'disable'}
              />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {!totp.pendingEnrollment ? (
                <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <h4 className="text-sm font-semibold text-[var(--text)]">{t('settings.totp.setup_title')}</h4>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{t('settings.totp.setup_subtitle')}</p>

                  <button
                    type="button"
                    onClick={() => void handleBeginEnrollment()}
                    disabled={isBusy}
                    className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t('settings.totp.setup_submit')}
                  </button>
                </article>
              ) : null}

              {pendingEnrollmentWithoutPayload ? (
                <article className="rounded-2xl border border-amber-300/80 bg-amber-500/10 p-4 dark:border-amber-400/30 dark:bg-amber-500/12">
                  <h4 className="text-sm font-semibold text-[var(--text)]">{t('settings.totp.pending_title')}</h4>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{t('settings.totp.pending_subtitle')}</p>
                  <p className="mt-4 rounded-xl border border-amber-200/80 bg-[var(--surface)] px-3 py-3 text-sm text-[var(--text-muted)] dark:border-amber-400/20 dark:bg-[var(--surface)]">
                    {t('settings.totp.provisioning_unavailable')}
                  </p>

                  <button
                    type="button"
                    onClick={() => void handleBeginEnrollment()}
                    disabled={isBusy}
                    className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {t('settings.totp.reissue_submit')}
                  </button>
                </article>
              ) : null}

              {hasProvisioningPayload ? (
                <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h5 className="text-sm font-semibold text-[var(--text)]">{t('settings.totp.provisioning_title')}</h5>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                        {t('settings.totp.provisioning_hint')}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleBeginEnrollment()}
                      disabled={isBusy}
                      className="inline-flex h-10 items-center justify-center self-start rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--surface)]/80 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {t('settings.totp.reissue_submit')}
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 dark:bg-slate-50">
                      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                        {t('settings.totp.provisioning_qr')}
                      </div>
                      <div className="mt-3 flex justify-center">
                        <QRCodeSVG value={enrollment.otpauthUri} size={172} />
                      </div>
                    </div>

                    <dl className="grid min-w-0 gap-3">
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          {t('settings.totp.provisioning_manual_setup_key')}
                        </dt>
                        <dd className="mt-2 break-all font-mono text-sm font-medium text-[var(--text)]">
                          {enrollment.manualEntryKey}
                        </dd>
                      </div>
                      <div className="grid min-w-0 gap-3 xl:grid-cols-2">
                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                            {t('settings.totp.provisioning_issuer')}
                          </dt>
                          <dd className="mt-2 text-sm font-medium text-[var(--text)]">{enrollment.issuer}</dd>
                        </div>
                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                            {t('settings.totp.provisioning_account_label')}
                          </dt>
                          <dd className="mt-2 break-all text-sm font-medium text-[var(--text)]">{enrollment.accountLabel}</dd>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          {t('settings.totp.provisioning_otpauth_uri')}
                        </dt>
                        <dd className="mt-2 break-all font-mono text-xs text-[var(--text)]">{enrollment.otpauthUri}</dd>
                      </div>
                    </dl>
                  </div>

                  <form
                    className="mt-5 grid gap-3 border-t border-[var(--border)] pt-4 sm:grid-cols-[minmax(0,240px)_auto] sm:items-end"
                    onSubmit={(event) => {
                      event.preventDefault()
                      void handleConfirm()
                    }}
                  >
                    <label className="grid gap-2">
                      <span className="text-sm font-semibold text-[var(--text)]">{t('settings.totp.confirm_title')}</span>
                      <span className="text-sm leading-6 text-[var(--text-muted)]">{t('settings.totp.confirm_subtitle')}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={confirmCode}
                        onChange={(event) => {
                          setConfirmCode(normalizeTotpCode(event.target.value))
                          setConfirmCodeError(null)
                        }}
                        placeholder={t('settings.totp.code_placeholder')}
                        className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold tracking-[0.3em] text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      />
                      {confirmCodeError ? (
                        <span className="text-sm font-medium text-red-600 dark:text-red-300">{confirmCodeError}</span>
                      ) : null}
                    </label>

                    <button
                      type="submit"
                      disabled={pendingAction === 'confirm'}
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {t('settings.totp.confirm_submit')}
                    </button>
                  </form>
                </article>
              ) : null}
            </div>
          )}
        </>
      ) : null}
    </section>
  )
}
