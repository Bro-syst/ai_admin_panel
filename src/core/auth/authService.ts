import { apiClient } from '@/core/api/apiClient'
import { getStorageKey } from '@/shared/storage/storageKeys'

export type AuthAmlOfficer = {
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
  amlOfficer: AuthAmlOfficer
  authState: AuthState
}

export type AmlAuthSessionItem = {
  id: string
  createdAt: string
  lastSeenAt: string | null
  expiresAt: string
  idleExpiresAt: string
  ipAddress: string | null
  userAgent: string | null
  current: boolean
}

export type AmlSessionRevocationResult = {
  sessionId: string
  revoked: boolean
  current: boolean
}

type AuthStatePayload = {
  authenticated?: boolean
  verification_required?: boolean
  critical_actions_allowed?: boolean
}

type AmlOfficerPayload = {
  id?: string
  email?: string
  role?: string
  status?: string
  last_login_at?: string | null
}

type AuthContextPayload = {
  aml_officer?: AmlOfficerPayload
  auth_state?: AuthStatePayload
}

type RefreshResponse = {
  authenticated?: boolean
  refreshed?: boolean
  auth_state?: AuthStatePayload
}

type LogoutResponse = {
  logged_out?: boolean
}

type PasswordSetupConfirmResponse = {
  password_set?: boolean
}

type PasswordResetRequestResponse = {
  accepted?: boolean
}

type PasswordResetConfirmResponse = {
  password_reset?: boolean
  sessions_revoked?: boolean
}

type AuthSessionPayload = {
  id?: string
  created_at?: string
  last_seen_at?: string | null
  expires_at?: string
  idle_expires_at?: string
  ip_address?: string | null
  user_agent?: string | null
  current?: boolean
}

type AuthSessionsResponse = {
  sessions?: AuthSessionPayload[]
}

type AuthSessionRevocationResponse = {
  session_id?: string
  revoked?: boolean
  current?: boolean
}

const AUTH_PREFIX = '/api/v1/aml/auth'
const USERS_PREFIX = '/api/v1/aml/users'
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

function mapAuthState(payload?: AuthStatePayload): AuthState {
  return {
    authenticated: payload?.authenticated === true,
    verificationRequired: payload?.verification_required === true,
    criticalActionsAllowed: payload?.critical_actions_allowed === true,
  }
}

function mapSession(payload: AuthContextPayload | undefined): AuthSession {
  const amlOfficer = payload?.aml_officer
  if (!amlOfficer?.id || !amlOfficer?.email || !amlOfficer?.role || !amlOfficer?.status) {
    throw new Error('Invalid auth response')
  }

  return {
    amlOfficer: {
      id: String(amlOfficer.id),
      email: String(amlOfficer.email),
      role: String(amlOfficer.role),
      status: String(amlOfficer.status),
      lastLoginAt: amlOfficer.last_login_at ?? null,
    },
    authState: mapAuthState(payload?.auth_state),
  }
}

function readOptionalText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null
}

function mapAuthSessionItem(payload: AuthSessionPayload): AmlAuthSessionItem {
  return {
    id: readRequiredString(payload.id, 'id'),
    createdAt: readRequiredString(payload.created_at, 'created_at'),
    lastSeenAt: readOptionalText(payload.last_seen_at),
    expiresAt: readRequiredString(payload.expires_at, 'expires_at'),
    idleExpiresAt: readRequiredString(payload.idle_expires_at, 'idle_expires_at'),
    ipAddress: readOptionalText(payload.ip_address),
    userAgent: readOptionalText(payload.user_agent),
    current: payload.current === true,
  }
}

function readRequiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid auth response: ${field}`)
  }

  return value
}

async function getCurrentAmlOfficer() {
  const response = await apiClient.get<AuthContextPayload>(`${USERS_PREFIX}/me`)
  return mapSession(response.data)
}

export const authService = {
  getLastLoginEmail(): string {
    return getStoredLastLoginEmail()
  },

  async getCurrentAmlOfficer(): Promise<AuthSession> {
    return getCurrentAmlOfficer()
  },

  async refresh(): Promise<AuthSession> {
    const response = await apiClient.post<RefreshResponse>(`${AUTH_PREFIX}/refresh`, {})
    if (response.data?.authenticated !== true || response.data?.refreshed !== true) {
      throw new Error('refresh failed')
    }
    return getCurrentAmlOfficer()
  },

  async login(email: string, password: string): Promise<AuthSession> {
    const response = await apiClient.post<AuthContextPayload>(`${AUTH_PREFIX}/login`, {
      email: normalizeEmail(email),
      password,
    })
    const session = mapSession(response.data)
    setStoredLastLoginEmail(session.amlOfficer.email)
    return session
  },

  async logout(): Promise<void> {
    await apiClient.post(`${AUTH_PREFIX}/logout`, {})
  },

  async logoutAll(): Promise<boolean> {
    const response = await apiClient.post<LogoutResponse>(`${AUTH_PREFIX}/logout-all`, {})
    return response.data?.logged_out === true
  },

  async listSessions(): Promise<AmlAuthSessionItem[]> {
    const response = await apiClient.get<AuthSessionsResponse>(`${AUTH_PREFIX}/sessions`)
    return Array.isArray(response.data?.sessions) ? response.data.sessions.map(mapAuthSessionItem) : []
  },

  async revokeSession(sessionId: string): Promise<AmlSessionRevocationResult> {
    const response = await apiClient.delete<AuthSessionRevocationResponse>(`${AUTH_PREFIX}/sessions/${sessionId}`)
    return {
      sessionId: readRequiredString(response.data?.session_id, 'session_id'),
      revoked: response.data?.revoked === true,
      current: response.data?.current === true,
    }
  },

  async confirmPasswordSetup(token: string, password: string): Promise<boolean> {
    const response = await apiClient.post<PasswordSetupConfirmResponse>(`${AUTH_PREFIX}/password-setup/confirm`, {
      token,
      password,
    })
    return response.data?.password_set === true
  },

  async requestPasswordReset(email: string, localeCode: string): Promise<boolean> {
    const response = await apiClient.post<PasswordResetRequestResponse>(`${AUTH_PREFIX}/password-reset/request`, {
      email: normalizeEmail(email),
      locale_code: localeCode,
    })
    return response.data?.accepted === true
  },

  async confirmPasswordReset(token: string, password: string): Promise<{ passwordReset: boolean; sessionsRevoked: boolean }> {
    const response = await apiClient.post<PasswordResetConfirmResponse>(`${AUTH_PREFIX}/password-reset/confirm`, {
      token,
      password,
    })
    return {
      passwordReset: response.data?.password_reset === true,
      sessionsRevoked: response.data?.sessions_revoked === true,
    }
  },
}

export function readAuthErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.trim()) {
    return error.message
  }

  return fallback
}
