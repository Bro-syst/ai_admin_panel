import type { ButtonHTMLAttributes } from 'react'
import { useI18n } from '@/core/i18n/useI18n'

export function RefreshButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { t } = useI18n()
  const label = t('common.retry')

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={[
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-sm hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]',
        className,
      ].join(' ')}
      {...props}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M20 11a8 8 0 0 0-14.6-4.5L4 8m0 0h4.2M4 8V3.8M4 13a8 8 0 0 0 14.6 4.5L20 16m0 0h-4.2M20 16v4.2"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
