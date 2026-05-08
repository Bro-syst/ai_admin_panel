import { Navigate } from 'react-router-dom'
import { useAuth } from '@/core/auth/useAuth'
import type { ReactElement } from 'react'
import { useI18n } from '@/core/i18n/useI18n'

export function RequireAuth({ children }: { children: ReactElement }) {
  const { status } = useAuth()
  const { t } = useI18n()
  if (status === 'loading') {
    return <div className="p-6 text-sm text-[var(--text-muted)]">{t('common.loading')}</div>
  }
  if (status === 'anonymous') return <Navigate to="/login" replace />
  return children
}
