import { Link } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import { PublicShell } from '@/core/layout'

export function NotFoundPage() {
  const { t } = useI18n()
  return (
    <PublicShell title={t('not_found.title')}>
      <p className="text-sm text-[var(--text-muted)]">{t('not_found.subtitle')}</p>
      <Link className="mt-4 inline-block text-sm font-semibold text-[var(--primary)] hover:underline" to="/">
        {t('common.home')}
      </Link>
    </PublicShell>
  )
}
