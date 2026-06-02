import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import { BRAND_NAME } from '@/shared/brand'
import { getStorageKey } from '@/shared/storage/storageKeys'
import { CurrentAdminUserSummary } from '@/shared/ui/AppShell/CurrentAdminUserSummary'
import { IconButton } from '@/shared/ui/IconButton'
import { AiCoreLogoIcon } from '@/shared/ui/icons/AiCoreLogo'

const SIDEBAR_COLLAPSED_STORAGE_KEY = getStorageKey('sidebar.collapsed')

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600">
        <AiCoreLogoIcon className="h-5 w-5" />
      </div>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-sm font-extrabold tracking-tight text-[var(--text)]">{BRAND_NAME}</div>
      </div>
    </div>
  )
}

function resolveAdminUserStatusLabel(status: string, t: (key: string) => string) {
  const translated = t(`admin.status.${status}`)
  return translated === `admin.status.${status}` ? status : translated
}

function DashboardIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 13h7V4H4v9ZM13 20h7v-9h-7v9ZM4 20h7v-5H4v5ZM13 9h7V4h-7v5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function OperationsIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 16.5 9 11l3.5 3.5L20 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20h16M4 4v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
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

function SecurityIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M12 3.5 19 6v5.7c0 4.3-2.9 7.3-7 8.8-4.1-1.5-7-4.5-7-8.8V6l7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m9.2 12 1.8 1.8 3.9-4.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AdminUsersIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M8.5 11a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM3.5 19.4c.5-3 2.4-5 5-5s4.5 2 5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16.5 10.2a2.6 2.6 0 1 0 0-5.2M14.8 14.2c2.9.2 4.8 2 5.3 5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function TenantsIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M4.5 8.2 12 4l7.5 4.2v7.6L12 20l-7.5-4.2V8.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 12 4.8 8.4M12 12l7.2-3.6M12 12v7.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.4 10.2 15.6 6M15.6 13.8l-7.2 4.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
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

type NavGroup = {
  id: 'overview' | 'workspace' | 'access' | 'customers' | 'session'
  label: string
  items: NavEntry[]
}

function navItemKey(item: NavEntry) {
  if (item.kind === 'route') return item.to
  return item.label
}

function canSeeAdminUsers(adminUser: { role: string; permissions?: string[] } | null) {
  if (!adminUser) return false
  if (['platform_admin', 'platform_operator', 'platform_viewer'].includes(adminUser.role)) return true

  const permissions = adminUser.permissions ?? []
  return ['admin_users:read', 'admins:read', 'list-admins', 'manage-admins', 'manage_admins'].some((permission) =>
    permissions.includes(permission),
  )
}

function canSeeTenants(adminUser: { role: string; permissions?: string[] } | null) {
  if (!adminUser) return false
  if (['platform_admin', 'platform_operator', 'platform_viewer'].includes(adminUser.role)) return true

  const permissions = adminUser.permissions ?? []
  return ['tenants:read', 'tenant:read', 'list-tenants', 'manage-tenants', 'manage_tenants'].some((permission) =>
    permissions.includes(permission),
  )
}

function canSeeOverview(adminUser: { role: string; permissions?: string[] } | null) {
  if (!adminUser) return false
  if (['platform_admin', 'platform_operator', 'platform_viewer'].includes(adminUser.role)) return true

  const permissions = adminUser.permissions ?? []
  return ['dashboard:read', 'operations:read', 'portal:read', 'overview:read'].some((permission) =>
    permissions.includes(permission),
  )
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
    'pointer-events-auto flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-1.5 py-1.5 text-[10px] font-semibold'

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
        <span className="w-full truncate text-center leading-tight">{item.label}</span>
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
          <span className="w-full truncate text-center leading-tight">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useI18n()
  const { adminUser, logout } = useAuth()
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

  const navGroups = useMemo<NavGroup[]>(
    () => {
      const overviewItems: NavEntry[] = []
      const accessItems: NavEntry[] = [{ kind: 'route', to: '/security', label: t('nav.security'), icon: SecurityIcon }]
      const customerItems: NavEntry[] = []

      if (canSeeOverview(adminUser)) {
        overviewItems.push(
          { kind: 'route', to: '/dashboard', label: t('nav.dashboard'), icon: DashboardIcon },
          { kind: 'route', to: '/operations', label: t('nav.operations'), icon: OperationsIcon },
        )
      }

      if (canSeeAdminUsers(adminUser)) {
        accessItems.push({ kind: 'route', to: '/admins', label: t('nav.admin_users'), icon: AdminUsersIcon })
      }

      if (canSeeTenants(adminUser)) {
        customerItems.push({ kind: 'route', to: '/tenants', label: t('nav.tenants'), icon: TenantsIcon })
      }

      const groups: NavGroup[] = [
        {
          id: 'overview',
          label: t('nav.group.overview'),
          items: overviewItems,
        },
        {
          id: 'workspace',
          label: t('nav.group.workspace'),
          items: [{ kind: 'route', to: '/settings', label: t('nav.settings'), icon: SettingsIcon }],
        },
        {
          id: 'access',
          label: t('nav.group.access'),
          items: accessItems,
        },
        {
          id: 'customers',
          label: t('nav.group.customers'),
          items: customerItems,
        },
        {
          id: 'session',
          label: t('nav.group.session'),
          items: [
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
        },
      ]

      return groups.filter((group) => group.items.length > 0)
    },
    [adminUser, logout, navigate, t],
  )
  const navItems = useMemo(() => navGroups.flatMap((group) => group.items), [navGroups])

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
              <div className={sidebarCollapsed ? 'flex h-16 items-center justify-center px-2 py-3' : 'grid grid-cols-[minmax(0,1fr)_36px] items-center gap-2 px-4 py-4'}>
                {sidebarCollapsed ? (
                  <IconButton
                    variant="ghost"
                    aria-label={t('common.expand_sidebar')}
                    title={t('common.expand_sidebar')}
                    onClick={() => setSidebarCollapsed(false)}
                    className="h-10 w-10"
                  >
                    <ExpandIcon className="h-5 w-5 text-[var(--text-muted)]" />
                  </IconButton>
                ) : (
                  <>
                    <Brand />
                    <IconButton
                      variant="ghost"
                      aria-label={t('common.collapse_sidebar')}
                      title={t('common.collapse_sidebar')}
                      onClick={() => setSidebarCollapsed(true)}
                      className="h-9 w-9"
                    >
                      <CollapseIcon className="h-5 w-5 text-[var(--text-muted)]" />
                    </IconButton>
                  </>
                )}
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="h-px bg-[var(--border)]" aria-hidden="true" />
                <nav className="space-y-3 p-2">
                  {navGroups.map((group) => (
                    <section key={group.id} aria-label={group.label} className="space-y-1">
                      {!sidebarCollapsed ? (
                        <div className="px-3 pt-1 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                          {group.label}
                        </div>
                      ) : group.id !== navGroups[0]?.id ? (
                        <div className="mx-auto my-2 h-px w-8 bg-[var(--border)]" aria-hidden="true" />
                      ) : null}
                      {group.items.map((item) => (
                        <NavItem key={navItemKey(item)} item={item} collapsed={sidebarCollapsed} />
                      ))}
                    </section>
                  ))}
                </nav>
              </div>
              {!sidebarCollapsed && adminUser ? (
                <>
                  <div className="h-px bg-[var(--border)]" aria-hidden="true" />
                  <div className="p-2">
                    <CurrentAdminUserSummary email={adminUser.email} status={adminUser.status} />
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="mb-0 lg:mb-6">
            <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 shadow-[var(--shadow-soft)] lg:hidden">
              <Brand />
              {adminUser ? (
                <div className="min-w-0 text-right">
                  <div className="truncate text-xs font-semibold text-[var(--text)]">{adminUser.email}</div>
                  <div className="truncate text-[11px] text-[var(--text-muted)]">{resolveAdminUserStatusLabel(adminUser.status, t)}</div>
                </div>
              ) : null}
            </div>
            <div className="hidden lg:block">
              <h1 className="text-lg font-bold tracking-tight text-[var(--text)] lg:text-xl">{title}</h1>
            </div>
          </header>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 lg:p-6">{children}</div>
        </section>
      </div>

      <div className="pointer-events-none fixed inset-x-3 bottom-[calc(10px+env(safe-area-inset-bottom))] z-50 lg:hidden">
        <nav
          aria-label={t('nav.mobile')}
          className="pointer-events-none mx-auto grid w-full max-w-lg gap-1 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-1.5 shadow-[0_14px_30px_rgba(15,23,42,0.18)] backdrop-blur"
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
