import { useEffect, useMemo, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { localizeApiErrorMessage } from '@/core/api/errors/localizeApiErrorMessage'
import { authService } from '@/core/auth/authService'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import { z } from 'zod'
import { LocaleThemeToggle } from '@/core/layout'
import { Divider } from '@/shared/ui/Divider'
import { PaymentTerminalIcon } from '@/shared/ui/icons/PaymentTerminal'
import { sanitizeEmailInput } from '@/shared/lib/email'

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

type AuthTab = 'login' | 'register'

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
  const { status, login, register } = useAuth()
  const { t } = useI18n()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeTab: AuthTab = searchParams.get('tab') === 'register' ? 'register' : 'login'
  const emailFromQuery = useMemo(() => searchParams.get('email')?.trim() || '', [searchParams])
  const [email, setEmail] = useState(() => (activeTab === 'login' ? emailFromQuery || authService.getLastLoginEmail() : ''))
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState<{ email: boolean; password: boolean; confirmPassword: boolean }>({
    email: false,
    password: false,
    confirmPassword: false,
  })
  const [submitError, setSubmitError] = useState<string | null>(null)

  const validation = useMemo(() => authSchema.safeParse({ email: email.trim(), password }), [email, password])
  const passwordsMatch = activeTab === 'login' || password === confirmPassword
  const canSubmit = validation.success && passwordsMatch && !isSubmitting

  useEffect(() => {
    if (activeTab === 'login') {
      setEmail(emailFromQuery || authService.getLastLoginEmail())
      return
    }
    setEmail('')
  }, [activeTab, emailFromQuery])

  useEffect(() => {
    setPassword('')
    setConfirmPassword('')
    setIsPasswordVisible(false)
    setIsConfirmPasswordVisible(false)
    setSubmitError(null)
    setTouched({ email: false, password: false, confirmPassword: false })
  }, [activeTab])

  if (status === 'authenticated') return <Navigate to="/" replace />

  const title = activeTab === 'login' ? t('login.title') : t('register.title')
  const subtitle = activeTab === 'login' ? t('login.subtitle') : t('register.subtitle')
  const submitLabel = activeTab === 'login' ? t('common.login') : t('common.register')
  const submitLoadingLabel = activeTab === 'login' ? t('login.signing_in') : t('register.submitting')
  const submitFallbackErrorKey = activeTab === 'login' ? 'login.submit_error' : 'register.submit_error'
  const submitFallbackError = t(submitFallbackErrorKey)
  const helperLabel = activeTab === 'login' ? t('auth.tab.register') : t('auth.tab.login')
  const helperMessage = activeTab === 'login' ? t('auth.helper.register') : t('auth.helper.login')

  function switchTab(nextTab: AuthTab) {
    const nextParams = new URLSearchParams(searchParams)
    if (nextTab === 'login') nextParams.delete('tab')
    else nextParams.set('tab', 'register')
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
          <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600">
                <PaymentTerminalIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0 leading-tight">
                <div className="text-lg font-extrabold tracking-tight text-[var(--text)] sm:text-xl">{t('brand.name')}</div>
                <div className="text-xs font-medium text-[var(--text-muted)]">{t('brand.subtitle')}</div>
              </div>
            </div>
            <div className="flex justify-start sm:justify-end">
              <LocaleThemeToggle variant="compact" />
            </div>
          </div>

          <Divider />

          <div className="px-5 py-5">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[var(--surface-muted)] p-1">
              {(['login', 'register'] as const).map((tab) => {
                const isActive = activeTab === tab
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => switchTab(tab)}
                    className={[
                      'rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                      isActive
                        ? 'bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-soft)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)]',
                    ].join(' ')}
                    aria-pressed={isActive}
                  >
                    {tab === 'login' ? t('auth.tab.login') : t('auth.tab.register')}
                  </button>
                )
              })}
            </div>

            <div className="mt-5">
              <h1 className="text-lg font-bold tracking-tight text-[var(--text)]">{title}</h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
            </div>

            <form
              className="mt-6 space-y-4"
              aria-busy={isSubmitting}
              onSubmit={(e) => {
                e.preventDefault()
                if (isSubmitting) return
                setSubmitError(null)
                setTouched({ email: true, password: true, confirmPassword: activeTab === 'register' })

                if (!validation.success) return
                if (!passwordsMatch) return
                setIsSubmitting(true)
                const submitAction = activeTab === 'login' ? login : register

                submitAction(email.trim(), password)
                  .catch((error: unknown) => {
                    setSubmitError(localizeApiErrorMessage(error, t, submitFallbackErrorKey) || submitFallbackError)
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
                  name={activeTab === 'login' ? 'email' : 'register-email'}
                  value={email}
                  onChange={(e) => setEmail(sanitizeEmailInput(e.target.value))}
                  onBlur={() => setTouched((s) => ({ ...s, email: true }))}
                  disabled={isSubmitting}
                  autoComplete={activeTab === 'login' ? 'email' : 'off'}
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
                    autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
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

              {activeTab === 'register' ? (
                <label className="block">
                  <div className="text-sm font-semibold text-[var(--text)]">{t('auth.confirm_password_label')}</div>
                  <div className="relative mt-2">
                    <input
                      className={[
                        'w-full rounded-xl border bg-[var(--surface)] px-4 py-3 pr-12 text-base text-[var(--text)] outline-none',
                        'border-[var(--border)] focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                      ].join(' ')}
                      type={isConfirmPasswordVisible ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => setTouched((s) => ({ ...s, confirmPassword: true }))}
                      disabled={isSubmitting}
                      autoComplete="new-password"
                      placeholder={t('auth.confirm_password_placeholder')}
                      aria-invalid={touched.confirmPassword && !passwordsMatch}
                    />
                    <button
                      type="button"
                      onClick={() => setIsConfirmPasswordVisible((current) => !current)}
                      className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                      aria-label={isConfirmPasswordVisible ? t('auth.hide_password') : t('auth.show_password')}
                      title={isConfirmPasswordVisible ? t('auth.hide_password') : t('auth.show_password')}
                    >
                      <PasswordVisibilityIcon visible={isConfirmPasswordVisible} />
                    </button>
                  </div>
                  {touched.confirmPassword && !passwordsMatch ? (
                    <div className="mt-1 text-sm text-red-500">{t('auth.validation.confirm_password')}</div>
                  ) : null}
                </label>
              ) : null}

              {submitError ? <div className="text-sm text-red-500">{submitError}</div> : null}

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

            <p className="mt-5 text-center text-sm text-[var(--text-muted)]">
              {helperMessage}{' '}
              <button
                type="button"
                onClick={() => switchTab(activeTab === 'login' ? 'register' : 'login')}
                className="font-semibold text-[var(--primary)] hover:underline"
              >
                {helperLabel}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
