import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { AppSettingsProvider } from '@/core/settings/AppSettingsProvider'
import { CurrentAdminUserPanel } from '@/modules/Settings/ui/CurrentAdminUserPanel'

function renderPanel() {
  return render(
    <I18nProvider>
      <AppSettingsProvider>
        <CurrentAdminUserPanel
          adminUser={{
            id: 'admin_current',
            email: 'admin@example.com',
            role: 'platform_admin',
            status: 'active',
            lastLoginAt: null,
          }}
          authState={{
            authenticated: true,
            verificationRequired: false,
            criticalActionsAllowed: true,
          }}
        />
      </AppSettingsProvider>
    </I18nProvider>,
  )
}

describe('CurrentAdminUserPanel', () => {
  it('renders current admin user identity and security flags', () => {
    window.localStorage.clear()

    renderPanel()

    expect(screen.getByText('My account')).toBeInTheDocument()
    expect(
      screen.getByText('Current administrator identity and security state from the active session.'),
    ).toBeInTheDocument()
    expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    expect(screen.getByText('Administrator')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Never')).toBeInTheDocument()
    expect(screen.getAllByText('Yes')).toHaveLength(2)
    expect(screen.getByText('No')).toBeInTheDocument()
  })
})
