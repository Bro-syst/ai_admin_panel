import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/core/auth/AuthProvider'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { ThemeProvider } from '@/core/theme/ThemeProvider'
import { AppSettingsProvider } from '@/core/settings/AppSettingsProvider'
import { App } from '@/app/App'

vi.mock('@/core/auth/authService', () => ({
  authService: {
    getLastLoginEmail: vi.fn().mockReturnValue(''),
    getCurrentAmlOfficer: vi.fn().mockRejectedValue(new Error('Unauthorized')),
    refresh: vi.fn().mockRejectedValue(new Error('Unauthorized')),
    login: vi.fn(),
    logout: vi.fn(),
  },
}))

const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const

test('renders login page by default when anonymous', async () => {
  render(
    <ThemeProvider>
      <I18nProvider>
        <AppSettingsProvider>
          <MemoryRouter initialEntries={['/login']} future={routerFutureConfig}>
            <AuthProvider>
              <App />
            </AuthProvider>
          </MemoryRouter>
        </AppSettingsProvider>
      </I18nProvider>
    </ThemeProvider>,
  )

  expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
})
