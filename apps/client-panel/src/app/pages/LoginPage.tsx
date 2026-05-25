import { useEffect, useMemo, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { localizeApiErrorMessage } from '@/core/api/errors/localizeApiErrorMessage'
import { authService } from '@/core/auth/authService'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import { z } from 'zod'
import { LocaleThemeToggle } from '@/core/layout'
import { AiCoreLogoIcon } from '@/shared/ui/icons/AiCoreLogo'
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
    <div className="relative min-h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--text)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16] dark:opacity-[0.1]"
        style={{
          backgroundImage:
            'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
        aria-hidden="true"
      />

      <main className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(390px,460px)] lg:px-8">
        <section className="hidden max-w-xl lg:block" aria-hidden="true">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
              <AiCoreLogoIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-semibold uppercase text-[var(--text-muted)]">{t('brand.subtitle')}</div>
              <div className="text-2xl font-extrabold tracking-tight text-[var(--text)]">{t('brand.name')}</div>
            </div>
          </div>

          <div className="mt-10 max-w-lg text-5xl font-black leading-[1.02] tracking-tight text-[var(--text)]">{title}</div>
          <p className="mt-4 max-w-md text-base leading-7 text-[var(--text-muted)]">{subtitle}</p>

          <div className="mt-10 rounded-lg border border-[var(--border)] bg-[var(--surface)]/75 p-4 shadow-[var(--shadow-soft)]" aria-hidden="true">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                <span className="h-2 w-2 rounded-full bg-[var(--text-muted)]/40" />
              </div>
              <div className="h-2 w-24 rounded-full bg-[var(--surface-muted)]" />
            </div>
            <div className="mt-6 grid grid-cols-12 gap-2">
              {Array.from({ length: 24 }, (_, index) => `client-signal-${index}`).map((cell, index) => (
                <span
                  key={cell}
                  className={[
                    'h-8 rounded-md border border-[var(--border)] bg-[var(--surface-muted)]',
                    index % 5 === 0 ? 'col-span-3 bg-emerald-500/10' : index % 4 === 0 ? 'col-span-2 bg-sky-500/10' : 'col-span-1',
                  ].join(' ')}
                />
              ))}
            </div>
            <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-4">
              <div className="space-y-2">
                <div className="h-2 w-3/4 rounded-full bg-[var(--surface-muted)]" />
                <div className="h-2 w-1/2 rounded-full bg-[var(--surface-muted)]" />
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-600">
                <AiCoreLogoIcon className="h-7 w-7" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
            <div className="flex flex-col gap-4 border-b border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-emerald-600">
                  <AiCoreLogoIcon className="h-6 w-6" />
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

            <div className="px-5 py-6 sm:px-6">
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-[var(--surface-muted)] p-1">
                {(['login', 'register'] as const).map((tab) => {
                  const isActive = activeTab === tab
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => switchTab(tab)}
                      className={[
                        'rounded-md px-4 py-2.5 text-sm font-semibold transition',
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

              <div className="mt-6">
                <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text)]">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{subtitle}</p>
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
                      'mt-2 w-full rounded-lg border bg-[var(--surface)] px-4 py-3 text-base text-[var(--text)] outline-none',
                      'border-[var(--border)] transition focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
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
                        'w-full rounded-lg border bg-[var(--surface)] px-4 py-3 pr-12 text-base text-[var(--text)] outline-none',
                        'border-[var(--border)] transition focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
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
                          'w-full rounded-lg border bg-[var(--surface)] px-4 py-3 pr-12 text-base text-[var(--text)] outline-none',
                          'border-[var(--border)] transition focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
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
                  className="mt-2 w-full rounded-lg bg-[var(--primary)] px-4 py-3 text-base font-bold text-white transition hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
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

              <p className="mt-5 text-center text-sm leading-6 text-[var(--text-muted)]">
                {helperMessage}{' '}
                <button
                  type="button"
                  onClick={() => switchTab(activeTab === 'login' ? 'register' : 'login')}
                  className="rounded-md font-semibold text-[var(--primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                >
                  {helperLabel}
                </button>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
