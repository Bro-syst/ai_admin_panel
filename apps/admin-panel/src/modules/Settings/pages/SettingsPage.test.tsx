import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { AppSettingsProvider } from '@/core/settings/AppSettingsProvider'
import { ThemeProvider } from '@/core/theme/ThemeProvider'
import { SettingsPage } from '@/modules/Settings/pages/SettingsPage'

vi.mock('@/core/auth/useAuth', () => ({
  useAuth: () => ({
    amlOfficer: { id: 'aml_1', email: 'officer@example.test', role: 'aml_officer', status: 'active', lastLoginAt: null },
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

vi.mock('@/modules/AmlSecurity', () => ({
  AmlTotpPanel: () => <section>Security panel mock</section>,
}))

vi.mock('@/modules/Settings/ui/CurrentAmlOfficerPanel', () => ({
  CurrentAmlOfficerPanel: () => <section>Current AML officer panel mock</section>,
}))

vi.mock('@/modules/Settings/ui/AmlSessionsPanel', () => ({
  AmlSessionsPanel: () => <section>Sessions panel mock</section>,
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

  it('keeps only general and security settings tabs', async () => {
    renderPage()

    expect(screen.getByRole('tab', { name: 'General', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Security' })).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(2)
    expect(screen.getByText('Current AML officer panel mock')).toBeInTheDocument()
    expect(screen.queryByText('Security panel mock')).not.toBeInTheDocument()
    expect(screen.queryByText('Sessions panel mock')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Security' }))

    expect(screen.getByRole('tab', { name: 'Security', selected: true })).toBeInTheDocument()
    expect(screen.queryByText('Current AML officer panel mock')).not.toBeInTheDocument()
    expect(screen.getByText('Security panel mock')).toBeInTheDocument()
    expect(screen.getByText('Sessions panel mock')).toBeInTheDocument()
  })

  it('opens security tab from query params', () => {
    renderPage(['/settings?tab=security'])

    expect(screen.getByRole('tab', { name: 'Security', selected: true })).toBeInTheDocument()
    expect(screen.getByText('Security panel mock')).toBeInTheDocument()
    expect(screen.getByText('Sessions panel mock')).toBeInTheDocument()
  })
})
