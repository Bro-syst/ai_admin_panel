export function Divider({ className = '' }: { className?: string }) {
  return <div className={['h-px w-full bg-[var(--border)]', className].join(' ')} aria-hidden="true" />
}

