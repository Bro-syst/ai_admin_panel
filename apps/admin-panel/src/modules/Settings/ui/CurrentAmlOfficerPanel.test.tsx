import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { AppSettingsProvider } from '@/core/settings/AppSettingsProvider'
import { CurrentAmlOfficerPanel } from '@/modules/Settings/ui/CurrentAmlOfficerPanel'

function renderPanel() {
  return render(
    <I18nProvider>
      <AppSettingsProvider>
        <CurrentAmlOfficerPanel
          amlOfficer={{
            id: 'aml_current',
            email: 'officer@example.com',
            role: 'aml_officer',
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

describe('CurrentAmlOfficerPanel', () => {
  it('renders current AML officer identity and security flags', () => {
    window.localStorage.clear()

    renderPanel()

    expect(screen.getByText('My account')).toBeInTheDocument()
    expect(
      screen.getByText('Current administrator identity and security state from the active session.'),
    ).toBeInTheDocument()
    expect(screen.getByText('officer@example.com')).toBeInTheDocument()
    expect(screen.getByText('Administrator')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Never')).toBeInTheDocument()
    expect(screen.getAllByText('Yes')).toHaveLength(2)
    expect(screen.getByText('No')).toBeInTheDocument()
  })
})
