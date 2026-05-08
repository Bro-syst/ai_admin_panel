import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { RequireAuth } from '@/core/router/routeGuards'

let authStatus: 'loading' | 'authenticated' | 'anonymous' = 'anonymous'

vi.mock('@/core/auth/useAuth', () => ({
  useAuth: () => ({
    status: authStatus,
  }),
}))

function renderGuarded() {
  return render(
    <I18nProvider>
      <MemoryRouter
        initialEntries={['/private']}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route
            path="/private"
            element={(
              <RequireAuth>
                <div>private-content</div>
              </RequireAuth>
            )}
          />
          <Route path="/login" element={<div>login-page</div>} />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  )
}

describe('RequireAuth', () => {
  beforeEach(() => {
    authStatus = 'anonymous'
  })

  it('shows loading state while auth is loading', () => {
    authStatus = 'loading'
    renderGuarded()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })

  it('redirects anonymous user to login page', () => {
    authStatus = 'anonymous'
    renderGuarded()
    expect(screen.getByText('login-page')).toBeInTheDocument()
  })

  it('renders private page for authenticated user', () => {
    authStatus = 'authenticated'
    renderGuarded()
    expect(screen.getByText('private-content')).toBeInTheDocument()
  })
})
