import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/core/auth/AuthProvider'
import { emitAuthUnauthorized } from '@/core/auth/authEvents'
import { useAuth } from '@/core/auth/useAuth'

const getCurrentAdminUserMock = vi.fn()
const refreshMock = vi.fn()
const loginMock = vi.fn()
const logoutMock = vi.fn()

vi.mock('@/core/auth/authService', () => ({
  authService: {
    getCurrentAdminUser: (...args: unknown[]) => getCurrentAdminUserMock(...args),
    refresh: (...args: unknown[]) => refreshMock(...args),
    login: (...args: unknown[]) => loginMock(...args),
    logout: (...args: unknown[]) => logoutMock(...args),
  },
}))

const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const

function Probe() {
  const { status, adminUser } = useAuth()
  return <div>{`${status}:${adminUser?.email ?? '-'}`}</div>
}

function renderProvider(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]} future={routerFutureConfig}>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </MemoryRouter>,
  )
}

function authSession(email: string) {
  return {
    adminUser: {
      id: 'admin_123',
      email,
      role: 'platform_admin',
      status: 'active',
      lastLoginAt: null,
    },
    authState: {
      authenticated: true,
      verificationRequired: false,
      criticalActionsAllowed: true,
    },
  }
}

describe('AuthProvider', () => {
  beforeEach(() => {
    getCurrentAdminUserMock.mockReset()
    refreshMock.mockReset()
    loginMock.mockReset()
    logoutMock.mockReset()
    getCurrentAdminUserMock.mockRejectedValue(new Error('Unauthorized'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('becomes anonymous when bootstrap me request fails', async () => {
    renderProvider('/')
    expect(await screen.findByText('anonymous:-')).toBeInTheDocument()
    expect(getCurrentAdminUserMock).toHaveBeenCalledTimes(1)
  })

  it('starts authenticated when current user bootstrap succeeds', async () => {
    getCurrentAdminUserMock.mockResolvedValue(authSession('admin@example.test'))

    renderProvider('/')
    expect(await screen.findByText('authenticated:admin@example.test')).toBeInTheDocument()
  })

  it('switches to anonymous on unauthorized event', async () => {
    getCurrentAdminUserMock.mockResolvedValue(authSession('admin@example.test'))

    renderProvider('/')
    expect(await screen.findByText('authenticated:admin@example.test')).toBeInTheDocument()

    act(() => {
      emitAuthUnauthorized()
    })

    await waitFor(() => {
      expect(screen.getByText('anonymous:-')).toBeInTheDocument()
    })
  })

  it('refreshes authenticated session before access token expiry', async () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(0)
    getCurrentAdminUserMock.mockResolvedValue(authSession('admin@example.test'))
    refreshMock.mockResolvedValue(authSession('refreshed@example.test'))

    try {
      renderProvider('/')
      expect(await screen.findByText('authenticated:admin@example.test')).toBeInTheDocument()

      nowSpy.mockReturnValue(10 * 60 * 1000)
      act(() => {
        window.dispatchEvent(new Event('focus'))
      })

      await waitFor(() => {
        expect(refreshMock).toHaveBeenCalledTimes(1)
        expect(screen.getByText('authenticated:refreshed@example.test')).toBeInTheDocument()
      })
    } finally {
      nowSpy.mockRestore()
    }
  })
})
