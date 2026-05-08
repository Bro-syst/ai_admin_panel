import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { authService } from '@/core/auth/authService'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import { z } from 'zod'
import { LocaleThemeToggle } from '@/shared/ui/LocaleThemeToggle'
import { Divider } from '@/shared/ui/Divider'
import { BRAND_NAME } from '@/shared/brand'
import { AmlPortalIcon } from '@/shared/ui/icons/AmlPortal'

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

function sanitizeEmailInput(raw: string) {
  return raw.replace(/\s+/g, '').replace(/[^A-Za-z0-9.!#$%&'*+/=?^_`{|}~@-]/g, '')
}

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.8 2.8M9.9 5.2A10.7 10.7 0 0 1 12 5c5.5 0 9.4 4 10 7-.2 1.1-.9 2.3-1.9 3.5M6.2 6.3C4.3 7.7 3.2 9.5 3 12c.6 3 4.5 7 9 7 1.7 0 3.2-.4 4.6-1.1"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function LoginPage() {
  const { status, login } = useAuth()
  const { t } = useI18n()
  const [searchParams] = useSearchParams()

  const emailFromQuery = useMemo(() => searchParams.get('email')?.trim() || '', [searchParams])
  const passwordSetupComplete = searchParams.get('password_setup') === 'success'
  const [email, setEmail] = useState(() => emailFromQuery || authService.getLastLoginEmail())
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  })
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validation = useMemo(() => authSchema.safeParse({ email: email.trim(), password }), [email, password])
  const canSubmit = validation.success && !isSubmitting

  useEffect(() => {
    setEmail(emailFromQuery || authService.getLastLoginEmail())
  }, [emailFromQuery])

  useEffect(() => {
    setPassword('')
    setIsPasswordVisible(false)
    setSubmitError(null)
    setTouched({ email: false, password: false })
  }, [emailFromQuery])

  if (status === 'authenticated') return <Navigate to="/" replace />

  const title = t('login.title')
  const subtitle = t('login.subtitle')
  const submitLabel = t('common.login')
  const submitLoadingLabel = t('login.signing_in')
  const submitFallbackError = t('login.submit_error')

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
          <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600">
                <AmlPortalIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0 leading-tight">
                <div className="text-lg font-extrabold tracking-tight text-[var(--text)] sm:text-xl">{BRAND_NAME}</div>
                <div className="text-xs font-medium text-[var(--text-muted)]">{t('brand.subtitle')}</div>
              </div>
            </div>
            <div className="flex justify-start sm:justify-end">
              <LocaleThemeToggle variant="compact" />
            </div>
          </div>

          <Divider />

          <div className="px-5 py-5">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[var(--text)]">{title}</h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
            </div>

            {passwordSetupComplete ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-300">
                {t('login.password_setup_success')}
              </div>
            ) : null}

            <form
              className="mt-6 space-y-4"
              aria-busy={isSubmitting}
              onSubmit={(e) => {
                e.preventDefault()
                if (isSubmitting) return
                setSubmitError(null)
                setTouched({ email: true, password: true })

                if (!validation.success) return
                setIsSubmitting(true)

                login(email.trim(), password)
                  .catch((error: unknown) => {
                    const message =
                      error && typeof error === 'object' && 'message' in error ? String((error as { message?: string }).message ?? '') : ''
                    setSubmitError(message || submitFallbackError)
                  })
                  .finally(() => {
                    setIsSubmitting(false)
                  })
              }}
            >
              <label className="block">
                <div className="text-sm font-semibold text-[var(--text)]">{t('common.email')}</div>
                <input
                  className={[
                    'mt-2 w-full rounded-xl border bg-[var(--surface)] px-4 py-3 text-base text-[var(--text)] outline-none',
                    'border-[var(--border)] focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                  ].join(' ')}
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(sanitizeEmailInput(e.target.value))}
                  onBlur={() => setTouched((s) => ({ ...s, email: true }))}
                  disabled={isSubmitting}
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  inputMode="email"
                  placeholder={t('auth.email_placeholder')}
                  aria-invalid={touched.email && !authSchema.shape.email.safeParse(email.trim()).success}
                />
                {touched.email && !authSchema.shape.email.safeParse(email.trim()).success ? (
                  <div className="mt-1 text-sm text-red-500">{t('auth.validation.email')}</div>
                ) : null}
              </label>

              <label className="block">
                <div className="text-sm font-semibold text-[var(--text)]">{t('common.password')}</div>
                <div className="relative mt-2">
                  <input
                    className={[
                      'w-full rounded-xl border bg-[var(--surface)] px-4 py-3 pr-12 text-base text-[var(--text)] outline-none',
                      'border-[var(--border)] focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                    ].join(' ')}
                    type={isPasswordVisible ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((s) => ({ ...s, password: true }))}
                    disabled={isSubmitting}
                    autoComplete="current-password"
                    placeholder={t('auth.password_placeholder')}
                    aria-invalid={touched.password && !authSchema.shape.password.safeParse(password).success}
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible((current) => !current)}
                    className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    aria-label={isPasswordVisible ? t('auth.hide_password') : t('auth.show_password')}
                    title={isPasswordVisible ? t('auth.hide_password') : t('auth.show_password')}
                  >
                    <PasswordVisibilityIcon visible={isPasswordVisible} />
                  </button>
                </div>
                {touched.password && !authSchema.shape.password.safeParse(password).success ? (
                  <div className="mt-1 text-sm text-red-500">{t('auth.validation.password')}</div>
                ) : null}
              </label>

              {submitError ? <div className="text-sm text-red-500">{submitError}</div> : null}

              <div className="flex justify-end">
                <Link
                  to="/password-reset/request"
                  className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  {t('login.forgot_password')}
                </Link>
              </div>

              <button
                className="mt-2 w-full rounded-xl bg-[var(--primary)] px-4 py-3 text-lg font-semibold text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                type="submit"
                disabled={!canSubmit}
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                    {submitLoadingLabel}
                  </span>
                ) : (
                  submitLabel
                )}
              </button>
            </form>
            <p className="mt-5 text-center text-sm text-[var(--text-muted)]">{t('login.access_note')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
