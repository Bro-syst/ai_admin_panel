import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { RouterProvider } from '@/core/router/RouterProvider'

let authStatus: 'loading' | 'authenticated' | 'anonymous' = 'anonymous'

vi.mock('@/core/auth/useAuth', () => ({
  useAuth: () => ({
    status: authStatus,
    amlOfficer: {
      id: 'aml_current',
      email: 'officer@example.com',
      role: 'aml_officer',
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

vi.mock('@/modules/Settings', () => ({
  SettingsPage: () => <div>settings-screen</div>,
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

  it('redirects authenticated root route to settings', async () => {
    authStatus = 'authenticated'

    renderRouter('/')

    expect(await screen.findByText('settings-screen')).toBeInTheDocument()
  })

  it('redirects anonymous root route to login', async () => {
    authStatus = 'anonymous'

    renderRouter('/')

    expect(await screen.findByText('login-screen')).toBeInTheDocument()
  })
})
