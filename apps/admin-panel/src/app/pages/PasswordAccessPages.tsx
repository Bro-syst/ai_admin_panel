import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { authService } from '@/core/auth/authService'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import { isLocale } from '@/core/i18n/locales'
import { PublicShell } from '@/shared/ui/PublicShell'

const emailSchema = z.string().email()
const passwordSchema = z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/\d/)

function sanitizeEmailInput(raw: string) {
  return raw.replace(/\s+/g, '').replace(/[^A-Za-z0-9.!#$%&'*+/=?^_`{|}~@-]/g, '')
}

function readToken(searchParams: URLSearchParams) {
  return searchParams.get('token')?.trim() || ''
}

function readErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.trim()) {
    return error.message
  }

  return fallback
}

function StatusMessage({ tone, children }: { tone: 'error' | 'success'; children: string }) {
  const className =
    tone === 'error'
      ? 'rounded-xl border border-red-200 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-500/30 dark:text-red-300'
      : 'rounded-xl border border-emerald-200 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-300'

  return <div className={className}>{children}</div>
}

function FormButton({ loading, loadingLabel, label, disabled }: { loading: boolean; loadingLabel: string; label: string; disabled: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full rounded-xl bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
          {loadingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  )
}

function LoginLink() {
  const { t } = useI18n()
  return (
    <Link
      to="/login"
      className="inline-flex text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      {t('common.back_to_login')}
    </Link>
  )
}

function PasswordFields({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  disabled,
  touched,
}: {
  password: string
  confirmPassword: string
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  disabled: boolean
  touched: { password: boolean; confirmPassword: boolean }
}) {
  const { t } = useI18n()
  const passwordInvalid = touched.password && !passwordSchema.safeParse(password).success
  const confirmInvalid = touched.confirmPassword && password !== confirmPassword

  return (
    <>
      <label className="block">
        <div className="text-sm font-semibold text-[var(--text)]">{t('password.new')}</div>
        <input
          className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--text)] outline-none focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          disabled={disabled}
          autoComplete="new-password"
          aria-invalid={passwordInvalid}
        />
        {passwordInvalid ? <div className="mt-1 text-sm text-red-500">{t('password.validation.policy')}</div> : null}
      </label>

      <label className="block">
        <div className="text-sm font-semibold text-[var(--text)]">{t('password.confirm')}</div>
        <input
          className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--text)] outline-none focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          type="password"
          value={confirmPassword}
          onChange={(event) => onConfirmPasswordChange(event.target.value)}
          disabled={disabled}
          autoComplete="new-password"
          aria-invalid={confirmInvalid}
        />
        {confirmInvalid ? <div className="mt-1 text-sm text-red-500">{t('password.validation.confirm')}</div> : null}
      </label>
    </>
  )
}

export function PasswordSetupPage() {
  const { status } = useAuth()
  const { setLocale, t } = useI18n()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = useMemo(() => readToken(searchParams), [searchParams])
  const localeFromQuery = searchParams.get('locale')?.trim() ?? ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState({ password: false, confirmPassword: false })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (isLocale(localeFromQuery)) {
      setLocale(localeFromQuery)
    }
  }, [localeFromQuery, setLocale])

  if (status === 'authenticated') return <Navigate to="/" replace />

  const passwordValid = passwordSchema.safeParse(password).success
  const canSubmit = Boolean(token) && passwordValid && password === confirmPassword && !isSubmitting && !isComplete

  return (
    <PublicShell title={t('password_setup.title')}>
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-muted)]">{t('password_setup.subtitle')}</p>
        {!token ? <StatusMessage tone="error">{t('password_setup.token_missing')}</StatusMessage> : null}
        {isComplete ? <StatusMessage tone="success">{t('password_setup.success')}</StatusMessage> : null}
        {submitError ? <StatusMessage tone="error">{submitError}</StatusMessage> : null}

        <form
          className="space-y-4"
          aria-busy={isSubmitting}
          onSubmit={(event) => {
            event.preventDefault()
            setTouched({ password: true, confirmPassword: true })
            setSubmitError(null)
            if (!canSubmit) return

            setIsSubmitting(true)
            authService
              .confirmPasswordSetup(token, password)
              .then(() => {
                setIsComplete(true)
                setPassword('')
                setConfirmPassword('')
                navigate('/login?password_setup=success', { replace: true })
              })
              .catch((error: unknown) => {
                setSubmitError(readErrorMessage(error, t('password_setup.error')))
              })
              .finally(() => {
                setIsSubmitting(false)
              })
          }}
        >
          <PasswordFields
            password={password}
            confirmPassword={confirmPassword}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            disabled={isSubmitting || isComplete || !token}
            touched={touched}
          />
          <FormButton
            loading={isSubmitting}
            loadingLabel={t('password_setup.submitting')}
            label={t('password_setup.submit')}
            disabled={!canSubmit}
          />
        </form>
        <LoginLink />
      </div>
    </PublicShell>
  )
}

export function PasswordResetRequestPage() {
  const { status } = useAuth()
  const { locale, t } = useI18n()
  const [email, setEmail] = useState(() => authService.getLastLoginEmail())
  const [touched, setTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  if (status === 'authenticated') return <Navigate to="/" replace />

  const emailValid = emailSchema.safeParse(email.trim()).success
  const canSubmit = emailValid && !isSubmitting

  return (
    <PublicShell title={t('password_reset_request.title')}>
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-muted)]">{t('password_reset_request.subtitle')}</p>
        {isComplete ? <StatusMessage tone="success">{t('password_reset_request.success')}</StatusMessage> : null}
        {submitError ? <StatusMessage tone="error">{submitError}</StatusMessage> : null}

        <form
          className="space-y-4"
          aria-busy={isSubmitting}
          onSubmit={(event) => {
            event.preventDefault()
            setTouched(true)
            setSubmitError(null)
            if (!canSubmit) return

            setIsSubmitting(true)
            authService
              .requestPasswordReset(email.trim(), locale)
              .then(() => setIsComplete(true))
              .catch((error: unknown) => {
                setSubmitError(readErrorMessage(error, t('password_reset_request.error')))
              })
              .finally(() => {
                setIsSubmitting(false)
              })
          }}
        >
          <label className="block">
            <div className="text-sm font-semibold text-[var(--text)]">{t('common.email')}</div>
            <input
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--text)] outline-none focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(sanitizeEmailInput(event.target.value))}
              onBlur={() => setTouched(true)}
              disabled={isSubmitting}
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              inputMode="email"
              aria-invalid={touched && !emailValid}
            />
            {touched && !emailValid ? <div className="mt-1 text-sm text-red-500">{t('auth.validation.email')}</div> : null}
          </label>
          <FormButton
            loading={isSubmitting}
            loadingLabel={t('password_reset_request.submitting')}
            label={t('password_reset_request.submit')}
            disabled={!canSubmit}
          />
        </form>
        <LoginLink />
      </div>
    </PublicShell>
  )
}

export function PasswordResetConfirmPage() {
  const { status } = useAuth()
  const { t } = useI18n()
  const [searchParams] = useSearchParams()
  const token = useMemo(() => readToken(searchParams), [searchParams])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState({ password: false, confirmPassword: false })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  if (status === 'authenticated') return <Navigate to="/" replace />

  const passwordValid = passwordSchema.safeParse(password).success
  const canSubmit = Boolean(token) && passwordValid && password === confirmPassword && !isSubmitting && !isComplete

  return (
    <PublicShell title={t('password_reset_confirm.title')}>
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-muted)]">{t('password_reset_confirm.subtitle')}</p>
        {!token ? <StatusMessage tone="error">{t('password_reset_confirm.token_missing')}</StatusMessage> : null}
        {isComplete ? <StatusMessage tone="success">{t('password_reset_confirm.success')}</StatusMessage> : null}
        {submitError ? <StatusMessage tone="error">{submitError}</StatusMessage> : null}

        <form
          className="space-y-4"
          aria-busy={isSubmitting}
          onSubmit={(event) => {
            event.preventDefault()
            setTouched({ password: true, confirmPassword: true })
            setSubmitError(null)
            if (!canSubmit) return

            setIsSubmitting(true)
            authService
              .confirmPasswordReset(token, password)
              .then(() => {
                setIsComplete(true)
                setPassword('')
                setConfirmPassword('')
              })
              .catch((error: unknown) => {
                setSubmitError(readErrorMessage(error, t('password_reset_confirm.error')))
              })
              .finally(() => {
                setIsSubmitting(false)
              })
          }}
        >
          <PasswordFields
            password={password}
            confirmPassword={confirmPassword}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            disabled={isSubmitting || isComplete || !token}
            touched={touched}
          />
          <FormButton
            loading={isSubmitting}
            loadingLabel={t('password_reset_confirm.submitting')}
            label={t('password_reset_confirm.submit')}
            disabled={!canSubmit}
          />
        </form>
        <LoginLink />
      </div>
    </PublicShell>
  )
}
