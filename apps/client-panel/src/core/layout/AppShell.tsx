import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import { LocaleThemeToggle } from '@/core/layout/LocaleThemeToggle'
import { IconButton } from '@/shared/ui/IconButton'
import { AiCoreLogoIcon } from '@/shared/ui/icons/AiCoreLogo'

type NavEntry =
  | { kind: 'route'; to: string; label: string; icon: (props: { className?: string }) => ReactNode }
  | { kind: 'action'; label: string; icon: (props: { className?: string }) => ReactNode; onClick: () => void }

function HomeIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 11.5 12 5l8 6.5V20H4v-8.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.5 20v-5h5v5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function AccountIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function SettingsIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M19.4 12a7.7 7.7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7.5 7.5 0 0 0-1.7-1l-.4-2.6H9.2l-.4 2.6a7.5 7.5 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a7.7 7.7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1c.5.4 1.1.8 1.7 1l.4 2.6h5.6l.4-2.6c.6-.2 1.2-.6 1.7-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LogoutIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M10 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 8l4 4-4 4M18 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Brand() {
  const { t } = useI18n()

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600">
        <AiCoreLogoIcon className="h-6 w-6" />
      </div>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-sm font-extrabold tracking-tight text-[var(--text)]">{t('brand.name')}</div>
        <div className="truncate text-xs text-[var(--text-muted)]">{t('brand.subtitle')}</div>
      </div>
    </div>
  )
}

function routeClassName(isActive: boolean) {
  return [
    'inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition',
    isActive
      ? 'bg-[var(--primary)] text-white shadow-[var(--shadow-soft)]'
      : 'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]',
  ].join(' ')
}

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { logout, user } = useAuth()
  const { t } = useI18n()
  const location = useLocation()

  const navItems: NavEntry[] = [
    { kind: 'route', to: '/', label: t('common.home'), icon: HomeIcon },
    { kind: 'route', to: '/account', label: t('nav.account'), icon: AccountIcon },
    { kind: 'route', to: '/settings', label: t('nav.settings'), icon: SettingsIcon },
    { kind: 'action', label: t('common.sign_out'), icon: LogoutIcon, onClick: () => void logout() },
  ]

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text)]">
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <Brand />
          <nav className="flex min-w-0 flex-wrap items-center gap-2" aria-label={t('common.navigation')}>
            {navItems.map((item) => {
              const Icon = item.icon
              if (item.kind === 'action') {
                return (
                  <IconButton key={item.label} aria-label={item.label} title={item.label} onClick={item.onClick}>
                    <Icon className="h-5 w-5" />
                  </IconButton>
                )
              }

              return (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => routeClassName(isActive)}>
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              )
            })}
            <LocaleThemeToggle variant="compact" />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--text)]">{title}</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{user?.email ?? location.pathname}</p>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
