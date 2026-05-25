import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { AppShell } from '@/shared/ui/AppShell/AppShell'

const logoutMock = vi.fn()

type AuthMock = {
  adminUser: {
    id: string
    email: string
    role: string
    status: string
    lastLoginAt: string | null
    permissions?: string[]
    authState: {
      authenticated: boolean
      verificationRequired: boolean
      criticalActionsAllowed: boolean
    }
  }
  logout: (...args: unknown[]) => unknown
}

let authMock: AuthMock = {
  adminUser: {
    id: 'admin_current',
    email: 'admin@example.com',
    role: 'platform_admin',
    status: 'active',
    lastLoginAt: null,
    authState: {
      authenticated: true,
      verificationRequired: false,
      criticalActionsAllowed: true,
    },
  },
  logout: (...args: unknown[]) => logoutMock(...args),
}

vi.mock('@/core/auth/useAuth', () => ({
  useAuth: () => authMock,
}))

const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const

describe('AppShell navigation', () => {
  beforeEach(() => {
    logoutMock.mockReset()
    logoutMock.mockResolvedValue(undefined)
    authMock = {
      adminUser: {
        id: 'admin_current',
        email: 'admin@example.com',
        role: 'platform_admin',
        status: 'active',
        lastLoginAt: null,
        authState: {
          authenticated: true,
          verificationRequired: false,
          criticalActionsAllowed: true,
        },
      },
      logout: (...args: unknown[]) => logoutMock(...args),
    }
  })

  it('shows grouped implemented navigation only', () => {
    render(
      <I18nProvider>
        <MemoryRouter initialEntries={['/settings']} future={routerFutureConfig}>
          <AppShell title="Settings">
            <div>page-content</div>
          </AppShell>
        </MemoryRouter>
      </I18nProvider>,
    )

    expect(screen.getAllByRole('link', { name: 'Dashboard' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Operations' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Settings' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Security' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Admin Users' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Tenants' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Log out' }).length).toBeGreaterThan(0)
    expect(screen.getByRole('region', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Workspace' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Access' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Customers' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Session' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Agents' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Billing Export' })).not.toBeInTheDocument()
    expect(screen.getByText('page-content')).toBeInTheDocument()
  })

  it('hides protected operator destinations when current auth state does not expose them', () => {
    authMock = {
      ...authMock,
      adminUser: {
        ...authMock.adminUser,
        role: 'external',
        permissions: [],
      },
    }

    render(
      <I18nProvider>
        <MemoryRouter initialEntries={['/settings']} future={routerFutureConfig}>
          <AppShell title="Settings">
            <div>page-content</div>
          </AppShell>
        </MemoryRouter>
      </I18nProvider>,
    )

    expect(screen.queryByRole('link', { name: 'Admin Users' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Tenants' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Operations' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Settings' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Security' }).length).toBeGreaterThan(0)
  })

  it('navigates to login after logout action is triggered', async () => {
    const user = userEvent.setup()

    render(
      <I18nProvider>
        <MemoryRouter initialEntries={['/settings']} future={routerFutureConfig}>
          <Routes>
            <Route
              path="/settings"
              element={(
                <AppShell title="Settings">
                  <div>page-content</div>
                </AppShell>
              )}
            />
            <Route path="/login" element={<div>login-screen</div>} />
          </Routes>
        </MemoryRouter>
      </I18nProvider>,
    )

    const logoutButtons = screen.getAllByRole('button', { name: 'Log out' })
    await user.click(logoutButtons[0])

    await waitFor(() => {
      expect(screen.getByText('login-screen')).toBeInTheDocument()
    })
  })
})
