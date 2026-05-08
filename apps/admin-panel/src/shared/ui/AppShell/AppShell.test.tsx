import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { AppShell } from '@/shared/ui/AppShell/AppShell'

const logoutMock = vi.fn()

vi.mock('@/core/auth/useAuth', () => ({
  useAuth: () => ({
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
    logout: (...args: unknown[]) => logoutMock(...args),
  }),
}))

const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const

describe('AppShell navigation', () => {
  beforeEach(() => {
    logoutMock.mockReset()
    logoutMock.mockResolvedValue(undefined)
  })

  it('shows only settings and logout navigation actions', () => {
    render(
      <I18nProvider>
        <MemoryRouter initialEntries={['/settings']} future={routerFutureConfig}>
          <AppShell title="Settings">
            <div>page-content</div>
          </AppShell>
        </MemoryRouter>
      </I18nProvider>,
    )

    expect(screen.getAllByRole('link', { name: 'Settings' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Log out' }).length).toBeGreaterThan(0)
    expect(screen.getByText('page-content')).toBeInTheDocument()
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
