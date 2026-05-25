import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { AppSettingsProvider } from '@/core/settings/AppSettingsProvider'
import { ThemeProvider } from '@/core/theme/ThemeProvider'
import { SettingsPage } from '@/modules/Settings/pages/SettingsPage'

vi.mock('@/core/auth/useAuth', () => ({
  useAuth: () => ({
    adminUser: { id: 'admin_1', email: 'admin@example.test', role: 'platform_admin', status: 'active', lastLoginAt: null },
    authState: {
      authenticated: true,
      verificationRequired: false,
      criticalActionsAllowed: true,
    },
  }),
}))

vi.mock('@/shared/ui/AppShell', () => ({
  AppShell: ({ children, title }: { children: ReactNode; title: string }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}))

vi.mock('@/modules/Settings/ui/CurrentAdminUserPanel', () => ({
  CurrentAdminUserPanel: () => <section>Current admin user panel mock</section>,
}))

function renderPage(initialEntries = ['/settings']) {
  window.localStorage.clear()

  return render(
    <I18nProvider>
      <ThemeProvider>
        <AppSettingsProvider>
          <MemoryRouter initialEntries={initialEntries}>
            <SettingsPage />
          </MemoryRouter>
        </AppSettingsProvider>
      </ThemeProvider>
    </I18nProvider>,
  )
}

describe('SettingsPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders general settings without security panels', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByText('Current admin user panel mock')).toBeInTheDocument()
    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
    expect(screen.queryByText('Security panel mock')).not.toBeInTheDocument()
    expect(screen.queryByText('Sessions panel mock')).not.toBeInTheDocument()
  })
})
