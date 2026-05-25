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
  admin: {
    user_id: 'admin_123',
    email: 'admin@example.test',
    display_name: 'Admin',
    tenant_id: 'tenant_123',
    role: 'platform_admin',
    permissions: ['admin:read'],
    auth_state: 'authenticated',
  },
  auth_state: 'authenticated',
  csrf_cookie_name: 'ai_core_admin_csrf',
}

describe('authService', () => {
  beforeEach(() => {
    window.localStorage.clear()
    postMock.mockReset()
    getMock.mockReset()
    deleteMock.mockReset()
  })

  it('reads current admin from the /users/me contract', async () => {
    getMock.mockResolvedValue({ data: authContextPayload })

    const session = await authService.getCurrentAdminUser()

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/users/me')
    expect(session).toMatchObject({
      adminUser: {
        id: 'admin_123',
        email: 'admin@example.test',
        role: 'platform_admin',
        permissions: ['admin:read'],
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

    const session = await authService.login('  admin@example.test  ', 'StrongPassword123!')

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/auth/login', {
      email: 'admin@example.test',
      password: 'StrongPassword123!',
    })
    expect(session.adminUser.email).toBe('admin@example.test')
    expect(authService.getLastLoginEmail()).toBe('admin@example.test')
  })

  it('refreshes session from the admin auth envelope', async () => {
    postMock.mockResolvedValue({ data: authContextPayload })

    const session = await authService.refresh()

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/auth/refresh', {})
    expect(getMock).not.toHaveBeenCalled()
    expect(session.adminUser.email).toBe('admin@example.test')
  })

  it('logs out through the new endpoint', async () => {
    window.localStorage.setItem(getStorageKey('last_login_email'), 'admin@example.test')
    postMock.mockResolvedValue({ data: { status: 'logged_out', revoked_sessions: 1 } })

    await authService.logout()

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/auth/logout', {})
    expect(authService.getLastLoginEmail()).toBe('admin@example.test')
  })

  it('loads active sessions for the current admin user', async () => {
    getMock.mockResolvedValue({
      data: {
        sessions: [
          {
            id: '11111111-1111-1111-1111-111111111111',
            issued_at: '2026-03-26T09:00:00Z',
            expires_at: '2026-03-27T09:00:00Z',
            status: 'active',
            current: true,
            revoked_at: null,
          },
        ],
      },
    })

    const sessions = await authService.listSessions()

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/auth/sessions')
    expect(sessions).toEqual([
      {
        id: '11111111-1111-1111-1111-111111111111',
        createdAt: '2026-03-26T09:00:00Z',
        lastSeenAt: null,
        expiresAt: '2026-03-27T09:00:00Z',
        idleExpiresAt: '2026-03-27T09:00:00Z',
        ipAddress: null,
        userAgent: null,
        current: true,
      },
    ])
  })

  it('logs out all sessions through the auth contract', async () => {
    postMock.mockResolvedValue({ data: { status: 'logged_out', revoked_sessions: 2 } })

    const loggedOut = await authService.logoutAll()

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/auth/logout-all', {})
    expect(loggedOut).toBe(true)
  })

  it('revokes one active session of the current admin user', async () => {
    deleteMock.mockResolvedValue({
      data: {
        status: 'revoked',
        revoked_sessions: 1,
      },
    })

    const result = await authService.revokeSession('11111111-1111-1111-1111-111111111111')

    expect(deleteMock).toHaveBeenCalledWith(
      '/api/admin/v1/auth/sessions/11111111-1111-1111-1111-111111111111',
    )
    expect(result).toEqual({
      sessionId: '11111111-1111-1111-1111-111111111111',
      revoked: true,
      current: false,
    })
  })

  it('confirms first password setup through the admin auth contract', async () => {
    postMock.mockResolvedValue({ data: { status: 'password_setup_completed' } })

    await expect(authService.confirmPasswordSetup('setup-token', 'StrongPassword123!')).resolves.toBe(true)

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/auth/password-setup/confirm', {
      token: 'setup-token',
      new_password: 'StrongPassword123!',
    })
  })

  it('requests password reset without locale code', async () => {
    postMock.mockResolvedValue({ data: { status: 'password_reset_requested' } })

    await expect(authService.requestPasswordReset('  admin@example.test  ', 'ru')).resolves.toBe(true)

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/auth/password-reset/request', {
      email: 'admin@example.test',
    })
  })

  it('confirms password reset and maps session revocation flag', async () => {
    postMock.mockResolvedValue({ data: { status: 'password_reset_completed', revoked_sessions: 2 } })

    await expect(authService.confirmPasswordReset('reset-token', 'StrongPassword123!')).resolves.toEqual({
      passwordReset: true,
      sessionsRevoked: true,
    })

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/auth/password-reset/confirm', {
      token: 'reset-token',
      new_password: 'StrongPassword123!',
    })
  })
})
