import type { ReactNode } from 'react'
import { useI18n } from '@/core/i18n/useI18n'

export function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{title}</h4>
      <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words text-xs text-[var(--text)]">
        {JSON.stringify(value ?? {}, null, 2)}
      </pre>
    </div>
  )
}

export function Field({
  label,
  value,
  disabled,
  placeholder,
  type = 'text',
  onChange,
}: {
  label: string
  value: string | number
  disabled?: boolean
  placeholder?: string
  type?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-[var(--text)]">
      <span>{label}</span>
      <input
        aria-label={label}
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-normal text-[var(--text)] disabled:bg-[var(--surface-muted)]"
      />
    </label>
  )
}

export function TextareaField({
  label,
  value,
  disabled,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  disabled?: boolean
  placeholder?: string
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-[var(--text)]">
      <span>{label}</span>
      <textarea
        aria-label={label}
        value={value}
        disabled={disabled}
        rows={3}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-normal text-[var(--text)] disabled:bg-[var(--surface-muted)]"
      />
    </label>
  )
}

export function NoticeBlocks({
  notice,
  errorMessage,
  formError,
}: {
  notice: string | null
  errorMessage: string | null
  formError: string | null
}) {
  if (!notice && !errorMessage && !formError) return null

  return (
    <div className="space-y-2">
      {notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {notice}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {errorMessage}
        </div>
      ) : null}
      {formError ? <p className="text-sm font-medium text-rose-600">{formError}</p> : null}
    </div>
  )
}

export function ActionButton({
  children,
  disabled,
  onClick,
  primary = false,
}: {
  children: ReactNode
  disabled?: boolean
  onClick: () => void
  primary?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-bold disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]',
        primary
          ? 'border border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]'
          : 'border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-muted)]',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

export function BatchActivityIdsHint() {
  const { t } = useI18n()
  return <p className="text-xs text-[var(--text-muted)]">{t('usage_billing.activity_ids_hint')}</p>
}
