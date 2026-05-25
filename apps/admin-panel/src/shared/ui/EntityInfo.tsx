import { useState, type ReactNode } from 'react'
import { useI18n } from '@/core/i18n/useI18n'

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone =
    status === 'active' || status === 'ready'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
      : status === 'blocked' || status === 'failed' || status === 'disabled' || status === 'archived'
        ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
        : 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'

  return (
    <span className={['inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold', tone].join(' ')}>
      {label ?? status}
    </span>
  )
}

export function InfoGrid({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))]">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{item.label}</dt>
          <dd className="mt-1 min-w-0 break-words text-sm font-semibold text-[var(--text)] [overflow-wrap:anywhere]">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function CopyableValue({ value, label }: { value: string | number | null | undefined; label?: ReactNode }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const displayValue = label ?? value

  if (value === null || value === undefined || value === '') {
    return <>{displayValue}</>
  }

  const copyText = String(value)

  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-2">
      <span className="break-all">{displayValue}</span>
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard?.writeText(copyText)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1200)
        }}
        className="inline-flex h-7 items-center justify-center rounded-lg border border-current/20 px-2 text-[11px] font-bold uppercase tracking-wide opacity-80 hover:opacity-100"
      >
        {copied ? t('common.copied') : t('common.copy')}
      </button>
    </span>
  )
}

export function MutationResultBlock({
  title,
  result,
  hideMissingOptionalFields = false,
}: {
  title: string
  hideMissingOptionalFields?: boolean
  result: {
    action: string
    resourceType: string
    resourceId: string | null
    correlationId?: string | null
    requestId?: string | null
    mutationTimestamp: string
    status?: string | null
    resultStatus?: string | null
    version?: string | number | null
  } | null
}) {
  const { t } = useI18n()

  if (!result) return null

  const correlationOrRequest = result.correlationId ?? result.requestId ?? null
  const status = result.resultStatus ?? result.status ?? null
  const showStatus = status !== null || !hideMissingOptionalFields
  const showVersion = (result.version !== null && result.version !== undefined) || !hideMissingOptionalFields

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
      <h3 className="font-bold">{title}</h3>
      <dl className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs font-semibold uppercase opacity-70">{t('mutation_result.action')}</dt>
          <dd className="break-all font-semibold">{result.action}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase opacity-70">{t('mutation_result.resource')}</dt>
          <dd className="break-all font-semibold">{result.resourceType}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase opacity-70">{t('mutation_result.resource_id')}</dt>
          <dd className="break-all font-semibold">
            {result.resourceId ? <CopyableValue value={result.resourceId} /> : t('mutation_result.not_returned')}
          </dd>
        </div>
        {showStatus ? (
          <div>
            <dt className="text-xs font-semibold uppercase opacity-70">{t('mutation_result.status_result')}</dt>
            <dd className="break-all font-semibold">{status ?? t('mutation_result.not_returned')}</dd>
          </div>
        ) : null}
        {showVersion ? (
          <div>
            <dt className="text-xs font-semibold uppercase opacity-70">{t('mutation_result.version')}</dt>
            <dd className="break-all font-semibold">{result.version ?? t('mutation_result.not_returned')}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs font-semibold uppercase opacity-70">{t('mutation_result.correlation_or_request')}</dt>
          <dd className="break-all font-semibold">
            {correlationOrRequest ? <CopyableValue value={correlationOrRequest} /> : t('mutation_result.not_returned')}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase opacity-70">{t('mutation_result.time')}</dt>
          <dd className="break-all font-semibold">{result.mutationTimestamp}</dd>
        </div>
      </dl>
    </section>
  )
}

export function ListBlock({ title, values, emptyLabel }: { title: string; values: string[]; emptyLabel?: string }) {
  const { t } = useI18n()

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{title}</h4>
      {values.length > 0 ? (
        <ul className="mt-2 grid gap-1 text-sm text-[var(--text-muted)]">
          {values.map((value) => <li key={value}>{value}</li>)}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-[var(--text-muted)]">{emptyLabel ?? t('common.none')}</p>
      )}
    </div>
  )
}
