import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { replaceBrowserLocation } from '@/app/lib/browserNavigation'
import { useAuth } from '@/core/auth/useAuth'
import { normalizeSupportedLocale } from '@/core/i18n/locales'
import { useI18n } from '@/core/i18n/useI18n'
import { PublicShell } from '@/core/layout'

type VerificationViewState = 'pending' | 'error'

export function VerifyEmailPage() {
  const { status } = useAuth()
  const { locale, t } = useI18n()
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('token')?.trim() || '', [searchParams])
  const localeHint = useMemo(() => normalizeSupportedLocale(searchParams.get('locale')) ?? locale, [locale, searchParams])
  const redirectUrl = useMemo(() => {
    if (!token) return ''
    return `/auth/verify-email?token=${encodeURIComponent(token)}&locale=${encodeURIComponent(localeHint)}`
  }, [localeHint, token])
  const [viewState, setViewState] = useState<VerificationViewState>(token ? 'pending' : 'error')
  const [message, setMessage] = useState(() => (token ? t('verify_email.pending.description') : t('verify_email.error.missing')))

  useEffect(() => {
    if (!token) {
      setViewState('error')
      setMessage(t('verify_email.error.missing'))
      return
    }

    replaceBrowserLocation(redirectUrl)
  }, [redirectUrl, t, token])

  const title = viewState === 'pending' ? t('verify_email.pending.title') : t('verify_email.title')

  const ctaHref = status === 'authenticated' ? '/account' : '/login'
  const ctaLabel = status === 'authenticated' ? t('verify_email.open_account') : t('verify_email.go_to_login')

  return (
    <PublicShell title={title}>
      <div className="space-y-4">
        <div
          className={[
            'rounded-2xl border px-4 py-4',
            viewState === 'error'
              ? 'border-rose-200/80 bg-rose-500/10 text-rose-950 dark:border-rose-400/35 dark:bg-rose-500/18 dark:text-rose-50'
              : 'border-sky-200/80 bg-sky-500/10 text-sky-950 dark:border-sky-400/35 dark:bg-sky-500/18 dark:text-sky-50',
          ].join(' ')}
        >
          <p className="text-sm leading-6">{message}</p>
        </div>

        {viewState === 'error' ? (
          <Link
            to={ctaHref}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            {ctaLabel}
          </Link>
        ) : null}
      </div>
    </PublicShell>
  )
}
