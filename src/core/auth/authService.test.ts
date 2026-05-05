import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '@/core/api/apiClient'
import { authService } from '@/core/auth/authService'
import { getStorageKey } from '@/shared/storage/storageKeys'

const postMock = apiClient.post as unknown as ReturnType<typeof vi.fn>
const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>
const deleteMock = apiClient.delete as unknown as ReturnType<typeof vi.fn>

const authContextPayload = {
  aml_officer: {
    id: 'aml_123',
    email: 'officer@bank.local',
    role: 'aml_officer',
    status: 'active',
    last_login_at: '2026-03-24T10:15:00Z',
  },
  auth_state: {
    authenticated: true,
    verification_required: false,
    critical_actions_allowed: true,
  },
}

describe('authService', () => {
  beforeEach(() => {
    window.localStorage.clear()
    postMock.mockReset()
    getMock.mockReset()
    deleteMock.mockReset()
  })

  it('reads current AML officer from the /users/me contract', async () => {
    getMock.mockResolvedValue({ data: authContextPayload })

    const session = await authService.getCurrentAmlOfficer()

    expect(getMock).toHaveBeenCalledWith('/api/v1/aml/users/me')
    expect(session).toMatchObject({
      amlOfficer: {
        id: 'aml_123',
        email: 'officer@bank.local',
        role: 'aml_officer',
      },
      authState: {
        authenticated: true,
        verificationRequired: false,
        criticalActionsAllowed: true,
      },
    })
  })

  it('logs in by email and password', async () => {
    postMock.mockResolvedValue({ data: authContextPayload })

    const session = await authService.login('  officer@bank.local  ', 'StrongPassword123!')

    expect(postMock).toHaveBeenCalledWith('/api/v1/aml/auth/login', {
      email: 'officer@bank.local',
      password: 'StrongPassword123!',
    })
    expect(session.amlOfficer.email).toBe('officer@bank.local')
    expect(authService.getLastLoginEmail()).toBe('officer@bank.local')
  })

  it('refreshes session and then reloads current user', async () => {
    postMock.mockResolvedValue({ data: { authenticated: true, refreshed: true, auth_state: authContextPayload.auth_state } })
    getMock.mockResolvedValue({ data: authContextPayload })

    const session = await authService.refresh()

    expect(postMock).toHaveBeenCalledWith('/api/v1/aml/auth/refresh', {})
    expect(getMock).toHaveBeenCalledWith('/api/v1/aml/users/me')
    expect(session.amlOfficer.email).toBe('officer@bank.local')
  })

  it('logs out through the new endpoint', async () => {
    window.localStorage.setItem(getStorageKey('last_login_email'), 'officer@bank.local')
    postMock.mockResolvedValue({ data: { logged_out: true } })

    await authService.logout()

    expect(postMock).toHaveBeenCalledWith('/api/v1/aml/auth/logout', {})
    expect(authService.getLastLoginEmail()).toBe('officer@bank.local')
  })

  it('loads active sessions for the current AML officer', async () => {
    getMock.mockResolvedValue({
      data: {
        sessions: [
          {
            id: '11111111-1111-1111-1111-111111111111',
            created_at: '2026-03-26T09:00:00Z',
            last_seen_at: '2026-03-26T10:30:00Z',
            expires_at: '2026-03-27T09:00:00Z',
            idle_expires_at: '2026-03-26T11:00:00Z',
            ip_address: '127.0.0.1',
            user_agent: 'Mozilla/5.0',
            current: true,
          },
        ],
      },
    })

    const sessions = await authService.listSessions()

    expect(getMock).toHaveBeenCalledWith('/api/v1/aml/auth/sessions')
    expect(sessions).toEqual([
      {
        id: '11111111-1111-1111-1111-111111111111',
        createdAt: '2026-03-26T09:00:00Z',
        lastSeenAt: '2026-03-26T10:30:00Z',
        expiresAt: '2026-03-27T09:00:00Z',
        idleExpiresAt: '2026-03-26T11:00:00Z',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        current: true,
      },
    ])
  })

  it('logs out all sessions through the auth contract', async () => {
    postMock.mockResolvedValue({ data: { logged_out: true } })

    const loggedOut = await authService.logoutAll()

    expect(postMock).toHaveBeenCalledWith('/api/v1/aml/auth/logout-all', {})
    expect(loggedOut).toBe(true)
  })

  it('revokes one active session of the current AML officer', async () => {
    deleteMock.mockResolvedValue({
      data: {
        session_id: '11111111-1111-1111-1111-111111111111',
        revoked: true,
        current: false,
      },
    })

    const result = await authService.revokeSession('11111111-1111-1111-1111-111111111111')

    expect(deleteMock).toHaveBeenCalledWith(
      '/api/v1/aml/auth/sessions/11111111-1111-1111-1111-111111111111',
    )
    expect(result).toEqual({
      sessionId: '11111111-1111-1111-1111-111111111111',
      revoked: true,
      current: false,
    })
  })

  it('confirms first password setup through the AML auth contract', async () => {
    postMock.mockResolvedValue({ data: { password_set: true } })

    await expect(authService.confirmPasswordSetup('setup-token', 'StrongPassword123!')).resolves.toBe(true)

    expect(postMock).toHaveBeenCalledWith('/api/v1/aml/auth/password-setup/confirm', {
      token: 'setup-token',
      password: 'StrongPassword123!',
    })
  })

  it('requests password reset with locale code', async () => {
    postMock.mockResolvedValue({ data: { accepted: true } })

    await expect(authService.requestPasswordReset('  officer@bank.local  ', 'ru')).resolves.toBe(true)

    expect(postMock).toHaveBeenCalledWith('/api/v1/aml/auth/password-reset/request', {
      email: 'officer@bank.local',
      locale_code: 'ru',
    })
  })

  it('confirms password reset and maps session revocation flag', async () => {
    postMock.mockResolvedValue({ data: { password_reset: true, sessions_revoked: true } })

    await expect(authService.confirmPasswordReset('reset-token', 'StrongPassword123!')).resolves.toEqual({
      passwordReset: true,
      sessionsRevoked: true,
    })

    expect(postMock).toHaveBeenCalledWith('/api/v1/aml/auth/password-reset/confirm', {
      token: 'reset-token',
      password: 'StrongPassword123!',
    })
  })
})
