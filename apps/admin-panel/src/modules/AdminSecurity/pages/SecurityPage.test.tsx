import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { SecurityPage } from '@/modules/AdminSecurity/pages/SecurityPage'

vi.mock('@/shared/ui/AppShell', () => ({
  AppShell: ({ children, title }: { children: ReactNode; title: string }) => (
    <main>
      <h1>{title}</h1>
      {children}
    </main>
  ),
}))

vi.mock('@/modules/AdminSecurity/ui/AdminTotpPanel', () => ({
  AdminTotpPanel: () => <section>Security panel mock</section>,
}))

vi.mock('@/modules/Settings', () => ({
  AdminSessionsPanel: () => <section>Sessions panel mock</section>,
}))

function renderPage() {
  return render(
    <I18nProvider>
      <SecurityPage />
    </I18nProvider>,
  )
}

describe('SecurityPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the real security panels on the security route page', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Security' })).toBeInTheDocument()
    expect(screen.getByText('Security panel mock')).toBeInTheDocument()
    expect(screen.getByText('Sessions panel mock')).toBeInTheDocument()
  })
})
