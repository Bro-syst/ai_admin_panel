import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function IconButton({
  children,
  className = '',
  variant = 'outline',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: 'outline' | 'ghost' }) {
  const base =
    'inline-flex items-center justify-center rounded-lg text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]'
  const styles =
    variant === 'ghost'
      ? 'h-9 w-9 bg-transparent hover:bg-[var(--surface-muted)]'
      : 'h-9 w-9 border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)]'

  return (
    <button
      type="button"
      className={[
        base,
        styles,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
