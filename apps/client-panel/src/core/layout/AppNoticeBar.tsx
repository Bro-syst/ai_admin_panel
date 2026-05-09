import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { AppNotice, AppNoticeTone } from '@/core/notices/types'

function NoticeIcon({ tone, className = '' }: { tone: AppNoticeTone; className?: string }) {
  if (tone === 'success') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="m8.5 12 2.4 2.4 4.6-4.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (tone === 'warning') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M12 4.5 20 18.5H4L12 4.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M12 9v4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="16.5" r="1" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
    </svg>
  )
}

function NoticeChevron({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="m10 7 5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function toneClasses(tone: AppNoticeTone) {
  if (tone === 'success') {
    return {
      container: 'border-emerald-200/80 bg-emerald-500/10 text-emerald-900 dark:border-emerald-400/35 dark:bg-emerald-500/18 dark:text-emerald-50',
      iconWrap: 'bg-emerald-500/14 text-emerald-700 dark:bg-emerald-400/18 dark:text-emerald-200',
      action: 'border-emerald-300/70 bg-white/80 text-emerald-900 dark:border-emerald-300/20 dark:bg-white/10 dark:text-emerald-50',
    }
  }

  if (tone === 'warning') {
    return {
      container: 'border-amber-200/80 bg-amber-500/10 text-amber-950 dark:border-amber-400/35 dark:bg-amber-500/18 dark:text-amber-50',
      iconWrap: 'bg-amber-500/14 text-amber-700 dark:bg-amber-400/18 dark:text-amber-200',
      action: 'border-amber-300/70 bg-white/80 text-amber-950 dark:border-amber-300/20 dark:bg-white/10 dark:text-amber-50',
    }
  }

  return {
    container: 'border-sky-200/80 bg-sky-500/10 text-sky-950 dark:border-sky-400/35 dark:bg-sky-500/18 dark:text-sky-50',
    iconWrap: 'bg-sky-500/14 text-sky-700 dark:bg-sky-400/18 dark:text-sky-200',
    action: 'border-sky-300/70 bg-white/80 text-sky-950 dark:border-sky-300/20 dark:bg-white/10 dark:text-sky-50',
  }
}

function NoticeBody({ notice }: { notice: AppNotice }) {
  const styles = toneClasses(notice.tone)

  return (
    <div
      className={[
        'group relative flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left shadow-[var(--shadow-soft)] transition',
        styles.container,
        notice.action ? 'hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(15,23,42,0.12)]' : '',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <span className={['mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', styles.iconWrap].join(' ')}>
        <NoticeIcon tone={notice.tone} className="h-5 w-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{notice.title}</div>
        {notice.description ? <div className="mt-1 text-sm/6 opacity-90">{notice.description}</div> : null}
      </div>

      {notice.action ? (
        <span
          className={[
            'inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold',
            styles.action,
          ].join(' ')}
        >
          {notice.action.label}
          <NoticeChevron className="h-4 w-4" />
        </span>
      ) : null}
    </div>
  )
}

function InteractiveContainer({
  notice,
  children,
}: {
  notice: AppNotice
  children: ReactNode
}) {
  if (!notice.action) return <div>{children}</div>

  if (notice.action.kind === 'route') {
    return (
      <Link to={notice.action.to} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
        {children}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={notice.action.onSelect}
      className="block w-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
    >
      {children}
    </button>
  )
}

export function AppNoticeBar({ notice }: { notice: AppNotice }) {
  return (
    <InteractiveContainer notice={notice}>
      <NoticeBody notice={notice} />
    </InteractiveContainer>
  )
}
