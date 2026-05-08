import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/core/auth/AuthProvider'
import { emitAuthUnauthorized } from '@/core/auth/authEvents'
import { useAuth } from '@/core/auth/useAuth'

const getCurrentAmlOfficerMock = vi.fn()
const refreshMock = vi.fn()
const loginMock = vi.fn()
const logoutMock = vi.fn()

vi.mock('@/core/auth/authService', () => ({
  authService: {
    getCurrentAmlOfficer: (...args: unknown[]) => getCurrentAmlOfficerMock(...args),
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
  const { status, amlOfficer } = useAuth()
  return <div>{`${status}:${amlOfficer?.email ?? '-'}`}</div>
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

describe('AuthProvider', () => {
  beforeEach(() => {
    getCurrentAmlOfficerMock.mockReset()
    refreshMock.mockReset()
    loginMock.mockReset()
    logoutMock.mockReset()
    getCurrentAmlOfficerMock.mockRejectedValue(new Error('Unauthorized'))
  })

  it('becomes anonymous when bootstrap me request fails', async () => {
    renderProvider('/')
    expect(await screen.findByText('anonymous:-')).toBeInTheDocument()
    expect(getCurrentAmlOfficerMock).toHaveBeenCalledTimes(1)
  })

  it('starts authenticated when current user bootstrap succeeds', async () => {
    getCurrentAmlOfficerMock.mockResolvedValue({
      amlOfficer: {
        id: 'aml_123',
        email: 'officer@bank.local',
        role: 'aml_officer',
        status: 'active',
        lastLoginAt: null,
      },
      authState: {
        authenticated: true,
        verificationRequired: false,
        criticalActionsAllowed: true,
      },
    })

    renderProvider('/')
    expect(await screen.findByText('authenticated:officer@bank.local')).toBeInTheDocument()
  })

  it('switches to anonymous on unauthorized event', async () => {
    getCurrentAmlOfficerMock.mockResolvedValue({
      amlOfficer: {
        id: 'aml_123',
        email: 'officer@bank.local',
        role: 'aml_officer',
        status: 'active',
        lastLoginAt: null,
      },
      authState: {
        authenticated: true,
        verificationRequired: false,
        criticalActionsAllowed: true,
      },
    })

    renderProvider('/')
    expect(await screen.findByText('authenticated:officer@bank.local')).toBeInTheDocument()

    act(() => {
      emitAuthUnauthorized()
    })

    await waitFor(() => {
      expect(screen.getByText('anonymous:-')).toBeInTheDocument()
    })
  })
})
