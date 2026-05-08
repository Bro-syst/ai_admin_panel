import { render, screen, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { ThemeProvider } from '@/core/theme/ThemeProvider'
import { LoginPage } from '@/app/pages/LoginPage'

const loginMock = vi.fn()
const getLastLoginEmailMock = vi.fn()
let authStatus: 'loading' | 'authenticated' | 'anonymous' = 'anonymous'

vi.mock('@/core/auth/useAuth', () => ({
  useAuth: () => ({
    status: authStatus,
    login: loginMock,
  }),
}))

vi.mock('@/core/auth/authService', () => ({
  authService: {
    getLastLoginEmail: (...args: unknown[]) => getLastLoginEmailMock(...args),
  },
}))

function renderPage(initialRoute = '/login') {
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
          <LoginPage />
        </MemoryRouter>
      </I18nProvider>
    </ThemeProvider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    loginMock.mockReset()
    getLastLoginEmailMock.mockReset()
    getLastLoginEmailMock.mockReturnValue('')
    authStatus = 'anonymous'
  })

  it('prefills remembered email', () => {
    getLastLoginEmailMock.mockReturnValue('saved@example.com')

    renderPage('/login')

    expect(screen.getByPlaceholderText('name@company.com')).toHaveValue('saved@example.com')
  })

  it('filters invalid characters from email input', async () => {
    const user = userEvent.setup()
    renderPage('/login')

    const emailInput = screen.getByPlaceholderText('name@company.com')
    await user.type(emailInput, 'те(st) user+mail@example.com')

    expect(emailInput).toHaveValue('stuser+mail@example.com')
  })

  it('validates email and password formats on login tab', async () => {
    const user = userEvent.setup()
    renderPage()

    const emailInput = screen.getByPlaceholderText('name@company.com')
    const passwordInput = screen.getByPlaceholderText('Password')
    const submit = screen.getByRole('button', { name: 'Login' })

    expect(submit).toBeDisabled()

    await user.type(emailInput, 'wrong-email')
    await user.click(passwordInput)
    await user.tab()
    expect(screen.getByText('Enter a valid email.')).toBeInTheDocument()

    await user.click(passwordInput)
    await user.tab()
    expect(screen.getByText('Enter your password.')).toBeInTheDocument()
    expect(submit).toBeDisabled()
  })

  it('submits trimmed email and password on login tab', async () => {
    const user = userEvent.setup()
    let resolveLogin: ((value: void | PromiseLike<void>) => void) | undefined
    loginMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveLogin = resolve
        }),
    )

    renderPage()

    await user.type(screen.getByPlaceholderText('name@company.com'), '  demo@example.com  ')
    await user.type(screen.getByPlaceholderText('Password'), 'StrongPassword123!')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('demo@example.com', 'StrongPassword123!')
    })
    expect(screen.getByText('Signing in…')).toBeInTheDocument()

    if (!resolveLogin) throw new Error('Login resolver is not set')
    await act(async () => {
      resolveLogin?.(undefined)
    })
  })

  it('toggles password visibility on login tab', async () => {
    const user = userEvent.setup()
    renderPage('/login')

    const passwordInput = screen.getByPlaceholderText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(passwordInput).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('links to password reset request flow', () => {
    renderPage('/login')

    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute('href', '/password-reset/request')
  })

  it('shows password setup success after safe redirect', () => {
    renderPage('/login?password_setup=success')

    expect(screen.getByText('Password was set. Sign in with your new password.')).toBeInTheDocument()
  })
})
