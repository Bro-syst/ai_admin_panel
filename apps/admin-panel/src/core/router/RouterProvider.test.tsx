import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { RouterProvider } from '@/core/router/RouterProvider'

let authStatus: 'loading' | 'authenticated' | 'anonymous' = 'anonymous'

vi.mock('@/core/auth/useAuth', () => ({
  useAuth: () => ({
    status: authStatus,
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
    login: vi.fn(),
    logout: vi.fn(),
  }),
}))

vi.mock('@/app/pages/LoginPage', () => ({
  LoginPage: () => <div>login-screen</div>,
}))

vi.mock('@/app/pages/PasswordAccessPages', () => ({
  PasswordSetupPage: () => <div>password-setup-screen</div>,
  PasswordResetRequestPage: () => <div>password-reset-request-screen</div>,
  PasswordResetConfirmPage: () => <div>password-reset-confirm-screen</div>,
}))

vi.mock('@/modules/Settings', () => ({
  SettingsPage: () => <div>settings-screen</div>,
}))

vi.mock('@/modules/Operations', () => ({
  DashboardPage: () => <div>dashboard-screen</div>,
  OperationsPage: () => <div>operations-screen</div>,
}))

const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const

function renderRouter(initialEntry = '/') {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={[initialEntry]} future={routerFutureConfig}>
        <RouterProvider />
      </MemoryRouter>
    </I18nProvider>,
  )
}

describe('RouterProvider root landing', () => {
  beforeEach(() => {
    authStatus = 'anonymous'
  })

  it('redirects authenticated root route to dashboard after dashboard stage', async () => {
    authStatus = 'authenticated'

    renderRouter('/')

    expect(await screen.findByText('dashboard-screen')).toBeInTheDocument()
  })

  it('redirects anonymous root route to login', async () => {
    authStatus = 'anonymous'

    renderRouter('/')

    expect(await screen.findByText('login-screen')).toBeInTheDocument()
  })

  it('supports backend mail alias for password setup links', async () => {
    renderRouter('/admin/password-setup?token=setup-token')

    expect(await screen.findByText('password-setup-screen')).toBeInTheDocument()
  })

  it('supports backend mail alias for password reset links', async () => {
    renderRouter('/admin/password-reset?token=reset-token')

    expect(await screen.findByText('password-reset-confirm-screen')).toBeInTheDocument()
  })
})
