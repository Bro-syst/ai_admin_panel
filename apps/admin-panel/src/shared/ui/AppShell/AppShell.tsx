import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import { BRAND_NAME } from '@/shared/brand'
import { getStorageKey } from '@/shared/storage/storageKeys'
import { CurrentAmlOfficerSummary } from '@/shared/ui/AppShell/CurrentAmlOfficerSummary'
import { IconButton } from '@/shared/ui/IconButton'
import { AmlPortalIcon } from '@/shared/ui/icons/AmlPortal'

const SIDEBAR_COLLAPSED_STORAGE_KEY = getStorageKey('sidebar.collapsed')

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  const { t } = useI18n()

  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600">
        <AmlPortalIcon className="h-5 w-5" />
      </div>
      {!collapsed ? (
        <div className="min-w-0 leading-tight">
          <div className="text-sm font-extrabold tracking-tight text-[var(--text)]">{BRAND_NAME}</div>
          <div className="text-xs text-[var(--text-muted)]">{t('brand.subtitle')}</div>
        </div>
      ) : null}
    </div>
  )
}

function SettingsIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
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
      <path
        d="M10 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M14 8l4 4-4 4M18 12H9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CollapseIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M14 7l-5 5 5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M20 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ExpandIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M10 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 5v14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

type NavEntry =
  | { kind: 'route'; to: string; label: string; icon: (p: { className?: string }) => ReactNode }
  | { kind: 'action'; label: string; icon: (p: { className?: string }) => ReactNode; onClick: () => void }

function navItemKey(item: NavEntry) {
  if (item.kind === 'route') return item.to
  return item.label
}

function NavItem({ item, collapsed = false }: { item: NavEntry; collapsed?: boolean }) {
  const base = [
    'group relative flex w-full items-center gap-3 rounded-xl text-sm font-medium outline-none',
    collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
  ].join(' ')
  const focus = 'focus-visible:ring-2 focus-visible:ring-[var(--ring)]'
  const inactiveClassName =
    'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)] dark:hover:bg-[var(--primary)]/20 dark:hover:text-white'
  const iconInactiveClassName = 'text-[var(--text-muted)] group-hover:text-[var(--text)] dark:group-hover:text-white'

  if (item.kind === 'action') {
    const Icon = item.icon
    return (
      <button
        type="button"
        className={[base, focus, inactiveClassName].join(' ')}
        onClick={item.onClick}
        title={collapsed ? item.label : undefined}
      >
        <Icon className={['h-5 w-5', iconInactiveClassName].join(' ')} />
        {!collapsed ? <span className="truncate">{item.label}</span> : null}
      </button>
    )
  }

  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          base,
          focus,
          isActive
            ? [
                'bg-[var(--primary)]/14 text-[var(--primary-hover)] dark:bg-[var(--primary)]/20 dark:text-white',
                'after:absolute after:left-1 after:top-2 after:bottom-2 after:w-[3px] after:rounded-full after:bg-[var(--primary)]',
              ].join(' ')
            : inactiveClassName,
        ].join(' ')
      }
      title={collapsed ? item.label : undefined}
    >
      {({ isActive }) => (
        <>
          <Icon className={['h-5 w-5', isActive ? 'text-[var(--primary-hover)] dark:text-blue-200' : iconInactiveClassName].join(' ')} />
          {!collapsed ? <span className="truncate">{item.label}</span> : null}
        </>
      )}
    </NavLink>
  )
}

function MobileNavItem({ item }: { item: NavEntry }) {
  const base =
    'pointer-events-auto flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-semibold'

  if (item.kind === 'action') {
    const Icon = item.icon

    return (
      <button
        type="button"
        onClick={item.onClick}
        className={[
          base,
          'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)] dark:hover:bg-[var(--primary)]/20 dark:hover:text-white',
        ].join(' ')}
      >
        <Icon className="h-5 w-5 text-[var(--text-muted)]" />
        <span className="truncate">{item.label}</span>
      </button>
    )
  }

  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          base,
          isActive
            ? 'bg-[var(--primary)]/20 text-[var(--primary-hover)] dark:bg-[var(--primary)]/30 dark:text-blue-200'
            : 'text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)] dark:hover:bg-[var(--primary)]/20 dark:hover:text-white',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={['h-5 w-5', isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'].join(' ')} />
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useI18n()
  const { amlOfficer, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, sidebarCollapsed ? '1' : '0')
    } catch {
      return
    }
  }, [sidebarCollapsed])

  const navItems = useMemo<NavEntry[]>(
    () => [
      { kind: 'route', to: '/settings', label: t('nav.settings'), icon: SettingsIcon },
      {
        kind: 'action',
        label: t('nav.logout'),
        icon: LogoutIcon,
        onClick: () => {
          void logout()
            .catch(() => undefined)
            .finally(() => {
              navigate('/login', { replace: true })
            })
        },
      },
    ],
    [logout, navigate, t],
  )

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <div
        className={[
          'w-full px-4 pt-3 pb-[calc(94px+env(safe-area-inset-bottom))] lg:grid lg:gap-6 lg:py-6 lg:pb-6 xl:px-6',
          sidebarCollapsed ? 'lg:grid-cols-[88px_1fr]' : 'lg:grid-cols-[260px_1fr]',
        ].join(' ')}
      >
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <div className="flex h-[calc(100vh-48px)] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
              <div className={['relative px-4 py-4', sidebarCollapsed ? 'px-3' : ''].join(' ')}>
                {sidebarCollapsed ? (
                  <div className="flex flex-col items-center gap-2">
                    <Brand collapsed />
                    <IconButton
                      variant="ghost"
                      aria-label={t('common.expand_sidebar')}
                      title={t('common.expand_sidebar')}
                      onClick={() => setSidebarCollapsed(false)}
                      className="h-9 w-9"
                    >
                      <ExpandIcon className="h-5 w-5 text-[var(--text-muted)]" />
                    </IconButton>
                  </div>
                ) : (
                  <>
                    <Brand />
                    <div className="absolute right-3 top-3">
                      <IconButton
                        variant="ghost"
                        aria-label={t('common.collapse_sidebar')}
                        title={t('common.collapse_sidebar')}
                        onClick={() => setSidebarCollapsed(true)}
                        className="h-9 w-9"
                      >
                        <CollapseIcon className="h-5 w-5 text-[var(--text-muted)]" />
                      </IconButton>
                    </div>
                  </>
                )}
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="h-px bg-[var(--border)]" aria-hidden="true" />
                <nav className="space-y-1 p-2">
                  {navItems.map((item) => (
                    <NavItem key={navItemKey(item)} item={item} collapsed={sidebarCollapsed} />
                  ))}
                </nav>
              </div>
              {!sidebarCollapsed && amlOfficer ? (
                <>
                  <div className="h-px bg-[var(--border)]" aria-hidden="true" />
                  <div className="p-2">
                    <CurrentAmlOfficerSummary email={amlOfficer.email} status={amlOfficer.status} />
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="mb-0 lg:mb-6">
            <div className="hidden lg:block">
              <h1 className="text-lg font-bold tracking-tight text-[var(--text)] lg:text-xl">{title}</h1>
            </div>
          </header>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 lg:p-6">{children}</div>
        </section>
      </div>

      <div className="pointer-events-none fixed inset-x-3 bottom-[calc(10px+env(safe-area-inset-bottom))] z-50 lg:hidden">
        <nav
          className="pointer-events-none mx-auto grid w-full max-w-md gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-1.5 shadow-[0_14px_30px_rgba(15,23,42,0.18)] backdrop-blur"
          style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
        >
          {navItems.map((item) => (
            <MobileNavItem key={navItemKey(item)} item={item} />
          ))}
        </nav>
      </div>
    </div>
  )
}
