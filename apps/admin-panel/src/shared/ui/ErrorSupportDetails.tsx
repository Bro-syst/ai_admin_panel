import { readApiErrorSupportDetails } from '@/core/api/errors/readApiErrorSupportDetails'
import { useI18n } from '@/core/i18n/useI18n'

export function ErrorSupportDetails({
  error,
  className = '',
}: {
  error: unknown
  className?: string
}) {
  const { t } = useI18n()
  const details = readApiErrorSupportDetails(error)

  if (!details) return null

  return (
    <details className={['rounded-xl border border-current/15 bg-black/5 px-3 py-2 text-xs', className].join(' ').trim()}>
      <summary className="cursor-pointer list-none font-semibold">
        {t('errors.support_details')}
      </summary>
      <dl className="mt-2 space-y-2">
        {details.code ? (
          <div>
            <dt className="uppercase tracking-wide opacity-70">{t('errors.code')}</dt>
            <dd className="mt-1 font-mono text-[11px]">{details.code}</dd>
          </div>
        ) : null}
        {details.requestId ? (
          <div>
            <dt className="uppercase tracking-wide opacity-70">{t('errors.request_id')}</dt>
            <dd className="mt-1 break-all font-mono text-[11px]">{details.requestId}</dd>
          </div>
        ) : null}
      </dl>
    </details>
  )
}
