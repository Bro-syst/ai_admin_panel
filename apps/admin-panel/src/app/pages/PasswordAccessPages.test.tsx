import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { ThemeProvider } from '@/core/theme/ThemeProvider'
import {
  PasswordResetConfirmPage,
  PasswordResetRequestPage,
  PasswordSetupPage,
} from '@/app/pages/PasswordAccessPages'

const confirmPasswordSetupMock = vi.fn()
const requestPasswordResetMock = vi.fn()
const confirmPasswordResetMock = vi.fn()
const getLastLoginEmailMock = vi.fn()
let authStatus: 'loading' | 'authenticated' | 'anonymous' = 'anonymous'

vi.mock('@/core/auth/useAuth', () => ({
  useAuth: () => ({
    status: authStatus,
  }),
}))

vi.mock('@/core/auth/authService', () => ({
  authService: {
    confirmPasswordSetup: (...args: unknown[]) => confirmPasswordSetupMock(...args),
    requestPasswordReset: (...args: unknown[]) => requestPasswordResetMock(...args),
    confirmPasswordReset: (...args: unknown[]) => confirmPasswordResetMock(...args),
    getLastLoginEmail: (...args: unknown[]) => getLastLoginEmailMock(...args),
  },
}))

function renderPage(element: ReactElement, initialRoute: string) {
  return render(
    <ThemeProvider>
      <I18nProvider>
        <MemoryRouter
          initialEntries={[initialRoute]}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          {element}
        </MemoryRouter>
      </I18nProvider>
    </ThemeProvider>,
  )
}

function LocationProbe() {
  const location = useLocation()
  return <div>{`login-screen:${location.pathname}${location.search}`}</div>
}

describe('PasswordAccessPages', () => {
  beforeEach(() => {
    window.localStorage.clear()
    authStatus = 'anonymous'
    confirmPasswordSetupMock.mockReset()
    requestPasswordResetMock.mockReset()
    confirmPasswordResetMock.mockReset()
    getLastLoginEmailMock.mockReset()
    getLastLoginEmailMock.mockReturnValue('')
  })

  it('confirms first password setup with token from query params', async () => {
    const user = userEvent.setup()
    confirmPasswordSetupMock.mockResolvedValue(true)

    renderPage(<PasswordSetupPage />, '/password-setup?token=setup-token')

    await user.type(screen.getByLabelText('New password'), 'StrongPassword123!')
    await user.type(screen.getByLabelText('Confirm password'), 'StrongPassword123!')
    await user.click(screen.getByRole('button', { name: 'Set password' }))

    await waitFor(() => {
      expect(confirmPasswordSetupMock).toHaveBeenCalledWith('setup-token', 'StrongPassword123!')
    })
    expect(await screen.findByText('Password was set. Sign in with your new password.')).toBeInTheDocument()
  })

  it('supports backend invite route alias and redirects to login without token after success', async () => {
    const user = userEvent.setup()
    confirmPasswordSetupMock.mockResolvedValue(true)

    renderPage(
      <Routes>
        <Route path="/auth/password-setup" element={<PasswordSetupPage />} />
        <Route path="/login" element={<LocationProbe />} />
      </Routes>,
      '/auth/password-setup?token=setup-token&locale=ru',
    )

    expect(await screen.findByText('Установка пароля')).toBeInTheDocument()
    await user.type(screen.getByLabelText('Новый пароль'), 'StrongPassword123!')
    await user.type(screen.getByLabelText('Повторите пароль'), 'StrongPassword123!')
    await user.click(screen.getByRole('button', { name: 'Установить пароль' }))

    await waitFor(() => {
      expect(confirmPasswordSetupMock).toHaveBeenCalledWith('setup-token', 'StrongPassword123!')
    })
    expect(await screen.findByText('login-screen:/login?password_setup=success')).toBeInTheDocument()
  })

  it('blocks password setup when token is missing', async () => {
    renderPage(<PasswordSetupPage />, '/password-setup')

    expect(screen.getByText('Setup token is missing or invalid.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Set password' })).toBeDisabled()
  })

  it('requests password reset with remembered email and current locale', async () => {
    const user = userEvent.setup()
    getLastLoginEmailMock.mockReturnValue('officer@bank.local')
    requestPasswordResetMock.mockResolvedValue(true)

    renderPage(<PasswordResetRequestPage />, '/password-reset/request')

    expect(screen.getByLabelText('Email')).toHaveValue('officer@bank.local')
    await user.click(screen.getByRole('button', { name: 'Send reset link' }))

    await waitFor(() => {
      expect(requestPasswordResetMock).toHaveBeenCalledWith('officer@bank.local', 'en')
    })
    expect(await screen.findByText('If the account exists, a reset link will be sent.')).toBeInTheDocument()
  })

  it('confirms password reset and reports revoked sessions', async () => {
    const user = userEvent.setup()
    confirmPasswordResetMock.mockResolvedValue({ passwordReset: true, sessionsRevoked: true })

    renderPage(<PasswordResetConfirmPage />, '/password-reset/confirm?token=reset-token')

    await user.type(screen.getByLabelText('New password'), 'StrongPassword123!')
    await user.type(screen.getByLabelText('Confirm password'), 'StrongPassword123!')
    await user.click(screen.getByRole('button', { name: 'Save new password' }))

    await waitFor(() => {
      expect(confirmPasswordResetMock).toHaveBeenCalledWith('reset-token', 'StrongPassword123!')
    })
    expect(await screen.findByText('Password was reset. Active sessions were revoked.')).toBeInTheDocument()
  })
})
