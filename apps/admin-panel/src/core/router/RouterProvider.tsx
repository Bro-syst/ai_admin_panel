import { Suspense } from 'react'
import { useRoutes } from 'react-router-dom'
import { routes } from '@/core/router/routes'
import { useI18n } from '@/core/i18n/useI18n'

export function RouterProvider() {
  const { t } = useI18n()
  const element = useRoutes(routes)
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--text-muted)]">{t('common.loading')}</div>}>
      {element}
    </Suspense>
  )
}
