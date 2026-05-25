import { apiClient } from '@/core/api/apiClient'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { getStorageKey } from '@/shared/storage/storageKeys'

export type AuthAdminUser = {
  id: string
  email: string
  role: string
  status: string
  lastLoginAt: string | null
  roles?: string[]
  permissions?: string[]
}

export type AuthState = {
  authenticated: boolean
  verificationRequired: boolean
  criticalActionsAllowed: boolean
}

export type AuthSession = {
  adminUser: AuthAdminUser
  authState: AuthState
}

export type AdminAuthSessionItem = {
  id: string
  createdAt: string
  lastSeenAt: string | null
  expiresAt: string
  idleExpiresAt: string
  ipAddress: string | null
  userAgent: string | null
  current: boolean
}

export type AdminSessionRevocationResult = {
  sessionId: string
  revoked: boolean
  current: boolean
}

type AdminAuthStatePayload = 'authenticated' | string

type AdminUserPayload = {
  user_id?: string
  email?: string
  display_name?: string | null
  tenant_id?: string | null
  role?: string
  permissions?: string[]
  auth_state?: AdminAuthStatePayload
}

type AuthContextPayload = {
  admin?: AdminUserPayload
  auth_state?: AdminAuthStatePayload
  csrf_cookie_name?: string
}

type LogoutResponse = {
  status?: string
  revoked_sessions?: number
}

type PasswordSetupConfirmResponse = {
  status?: string
}

type PasswordResetRequestResponse = {
  status?: string
}

type PasswordResetConfirmResponse = {
  status?: string
  revoked_sessions?: number
}

type AuthSessionPayload = {
  id?: string
  issued_at?: string
  expires_at?: string
  current?: boolean
  status?: string
  revoked_at?: string | null
}

type AuthSessionsResponse = {
  sessions?: AuthSessionPayload[]
}

type AuthSessionRevocationResponse = {
  status?: string
  revoked_sessions?: number
}

const AUTH_PREFIX = '/api/admin/v1/auth'
const USERS_PREFIX = '/api/admin/v1/users'
const LAST_LOGIN_EMAIL_STORAGE_KEY = getStorageKey('last_login_email')

function normalizeEmail(email: string) {
  return email.trim()
}

function getStoredLastLoginEmail() {
  try {
    return window.localStorage.getItem(LAST_LOGIN_EMAIL_STORAGE_KEY)?.trim() || ''
  } catch {
    return ''
  }
}

function setStoredLastLoginEmail(email: string) {
  try {
    window.localStorage.setItem(LAST_LOGIN_EMAIL_STORAGE_KEY, email)
  } catch {
    return
  }
}

function mapAuthState(payload?: AdminAuthStatePayload): AuthState {
  const authenticated = payload === 'authenticated'
  return {
    authenticated,
    verificationRequired: false,
    criticalActionsAllowed: authenticated,
  }
}

function mapSession(payload: AuthContextPayload | undefined): AuthSession {
  const admin = payload?.admin
  if (!admin?.user_id || !admin.email || !admin.role) {
    throw new Error('Invalid auth response')
  }

  const authState = mapAuthState(payload?.auth_state ?? admin.auth_state)
  return {
    adminUser: {
      id: String(admin.user_id),
      email: String(admin.email),
      role: String(admin.role),
      status: authState.authenticated ? 'active' : String(admin.auth_state ?? payload?.auth_state ?? 'inactive'),
      lastLoginAt: null,
      roles: [String(admin.role)],
      permissions: Array.isArray(admin.permissions) ? admin.permissions.filter((item): item is string => typeof item === 'string') : [],
    },
    authState,
  }
}

function mapAuthSessionItem(payload: AuthSessionPayload): AdminAuthSessionItem {
  return {
    id: readRequiredString(payload.id, 'id'),
    createdAt: readRequiredString(payload.issued_at, 'issued_at'),
    lastSeenAt: null,
    expiresAt: readRequiredString(payload.expires_at, 'expires_at'),
    idleExpiresAt: readRequiredString(payload.expires_at, 'expires_at'),
    ipAddress: null,
    userAgent: null,
    current: payload.current === true,
  }
}

function readRequiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid auth response: ${field}`)
  }

  return value
}

async function getCurrentAdminUser() {
  const response = await apiClient.get<AuthContextPayload>(`${USERS_PREFIX}/me`)
  return mapSession(response.data)
}

export const authService = {
  getLastLoginEmail(): string {
    return getStoredLastLoginEmail()
  },

  async getCurrentAdminUser(): Promise<AuthSession> {
    return getCurrentAdminUser()
  },

  async refresh(): Promise<AuthSession> {
    const response = await apiClient.post<AuthContextPayload>(`${AUTH_PREFIX}/refresh`, {})
    return mapSession(response.data)
  },

  async login(email: string, password: string): Promise<AuthSession> {
    const response = await apiClient.post<AuthContextPayload>(`${AUTH_PREFIX}/login`, {
      email: normalizeEmail(email),
      password,
    })
    const session = mapSession(response.data)
    setStoredLastLoginEmail(session.adminUser.email)
    return session
  },

  async logout(): Promise<void> {
    await apiClient.post(`${AUTH_PREFIX}/logout`, {})
  },

  async logoutAll(): Promise<boolean> {
    const response = await apiClient.post<LogoutResponse>(`${AUTH_PREFIX}/logout-all`, {})
    return response.data?.status === 'logged_out'
  },

  async listSessions(): Promise<AdminAuthSessionItem[]> {
    const response = await apiClient.get<AuthSessionsResponse>(`${AUTH_PREFIX}/sessions`)
    return Array.isArray(response.data?.sessions) ? response.data.sessions.map(mapAuthSessionItem) : []
  },

  async revokeSession(sessionId: string): Promise<AdminSessionRevocationResult> {
    const response = await apiClient.delete<AuthSessionRevocationResponse>(`${AUTH_PREFIX}/sessions/${sessionId}`)
    return {
      sessionId,
      revoked: response.data?.status === 'revoked' && Number(response.data?.revoked_sessions ?? 0) > 0,
      current: false,
    }
  },

  async confirmPasswordSetup(token: string, password: string): Promise<boolean> {
    const response = await apiClient.post<PasswordSetupConfirmResponse>(`${AUTH_PREFIX}/password-setup/confirm`, {
      token,
      new_password: password,
    })
    return response.data?.status === 'password_setup_completed'
  },

  async requestPasswordReset(email: string, _localeCode: string): Promise<boolean> {
    const response = await apiClient.post<PasswordResetRequestResponse>(`${AUTH_PREFIX}/password-reset/request`, {
      email: normalizeEmail(email),
    })
    return response.data?.status === 'password_reset_requested'
  },

  async confirmPasswordReset(token: string, password: string): Promise<{ passwordReset: boolean; sessionsRevoked: boolean }> {
    const response = await apiClient.post<PasswordResetConfirmResponse>(`${AUTH_PREFIX}/password-reset/confirm`, {
      token,
      new_password: password,
    })
    return {
      passwordReset: response.data?.status === 'password_reset_completed',
      sessionsRevoked: Number(response.data?.revoked_sessions ?? 0) > 0,
    }
  },
}

export function readAuthErrorMessage(error: unknown, fallback: string, t: (key: string) => string) {
  return getLocalizedApiErrorMessage(error, t, fallback)
}
