import { apiClient } from '@/core/api/apiClient'
import type { ApiError } from '@/core/api/errors/ApiError'
import { createStorageKey } from '@/core/storage/keys'

export type AuthMerchant = {
  id: string
  status: string
}

export type AuthUser = {
  id: string
  email: string
  emailVerified: boolean
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

export type AuthCashdeskContext = {
  id: string
  name: string
  status: string
  currencyCode: string
  paymentTimeoutSeconds: number
  assignedAt: string
}

export type AuthSession = {
  merchant: AuthMerchant
  user: AuthUser
  authState: AuthState
  cashdeskContext: AuthCashdeskContext | null
}

export type AuthManagedSession = {
  id: string
  createdAt: string
  lastSeenAt: string | null
  expiresAt: string
  idleExpiresAt: string
  ipAddress: string | null
  userAgent: string | null
  current: boolean
}

export type RevokeAuthSessionResult = {
  sessionId: string
  revoked: boolean
  current: boolean
}

export type EmailVerificationResendResult = {
  status: 'sent' | 'already_verified'
}

type AuthStatePayload = {
  authenticated?: boolean
  verification_required?: boolean
  critical_actions_allowed?: boolean
}

type MerchantPayload = {
  id?: string
  status?: string
}

type UserPayload = {
  id?: string
  email?: string
  email_verified?: boolean
  role?: string
  status?: string
  last_login_at?: string | null
}

type CashdeskContextPayload = {
  id?: string
  name?: string
  status?: string
  currency_code?: string
  payment_timeout_seconds?: number
  assigned_at?: string
} | null

type AuthContextPayload = {
  merchant?: MerchantPayload
  user?: UserPayload
  auth_state?: AuthStatePayload
  cashdesk_context?: CashdeskContextPayload
}

type RefreshResponse = {
  authenticated?: boolean
  refreshed?: boolean
  auth_state?: AuthStatePayload
}

type AuthManagedSessionPayload = {
  id?: string
  created_at?: string
  last_seen_at?: string | null
  expires_at?: string
  idle_expires_at?: string
  ip_address?: string | null
  user_agent?: string | null
  current?: boolean
}

type AuthManagedSessionsResponse = {
  sessions?: AuthManagedSessionPayload[]
}

type RevokeAuthSessionResponse = {
  session_id?: string
  revoked?: boolean
  current?: boolean
}

const AUTH_PREFIX = '/api/v1/auth'
const USERS_PREFIX = '/api/v1/users'
const LAST_LOGIN_EMAIL_STORAGE_KEY = createStorageKey('last_login_email')

function normalizeEmail(email: string) {
  return email.trim()
}

function isApiErrorWithStatus(error: unknown, status: number) {
  if (!error || typeof error !== 'object') return false
  const apiError = error as Partial<ApiError>
  return apiError.status === status
}

function getStoredLastLoginEmail() {
  try {
    return window.sessionStorage.getItem(LAST_LOGIN_EMAIL_STORAGE_KEY)?.trim() || ''
  } catch {
    return ''
  }
}

function setStoredLastLoginEmail(email: string) {
  try {
    window.sessionStorage.setItem(LAST_LOGIN_EMAIL_STORAGE_KEY, email)
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

function mapCashdeskContext(payload?: CashdeskContextPayload): AuthCashdeskContext | null {
  if (payload == null) return null
  if (
    !payload.id ||
    !payload.name ||
    !payload.status ||
    !payload.currency_code ||
    typeof payload.payment_timeout_seconds !== 'number' ||
    !payload.assigned_at
  ) {
    throw new Error('Invalid auth response')
  }

  return {
    id: String(payload.id),
    name: String(payload.name),
    status: String(payload.status),
    currencyCode: String(payload.currency_code),
    paymentTimeoutSeconds: Number(payload.payment_timeout_seconds),
    assignedAt: String(payload.assigned_at),
  }
}

function mapSession(payload: AuthContextPayload | undefined): AuthSession {
  const merchant = payload?.merchant
  const user = payload?.user
  if (!merchant?.id || !merchant?.status || !user?.id || !user?.email || !user?.role || !user?.status) {
    throw new Error('Invalid auth response')
  }

  return {
    merchant: {
      id: String(merchant.id),
      status: String(merchant.status),
    },
    user: {
      id: String(user.id),
      email: String(user.email),
      emailVerified: user.email_verified === true,
      role: String(user.role),
      status: String(user.status),
      lastLoginAt: user.last_login_at ?? null,
    },
    authState: mapAuthState(payload?.auth_state),
    cashdeskContext: mapCashdeskContext(payload?.cashdesk_context),
  }
}

function mapManagedSession(payload?: AuthManagedSessionPayload): AuthManagedSession {
  if (!payload?.id || !payload.created_at || !payload.expires_at || !payload.idle_expires_at) {
    throw new Error('Invalid auth session response')
  }

  return {
    id: String(payload.id),
    createdAt: String(payload.created_at),
    lastSeenAt: payload.last_seen_at ?? null,
    expiresAt: String(payload.expires_at),
    idleExpiresAt: String(payload.idle_expires_at),
    ipAddress: payload.ip_address ?? null,
    userAgent: payload.user_agent ?? null,
    current: payload.current === true,
  }
}

async function getCurrentUser() {
  const response = await apiClient.get<AuthContextPayload>(`${USERS_PREFIX}/me`)
  return mapSession(response.data)
}

export const authService = {
  getLastLoginEmail(): string {
    return getStoredLastLoginEmail()
  },

  async getCurrentUser(): Promise<AuthSession> {
    return getCurrentUser()
  },

  async refresh(): Promise<AuthSession> {
    const response = await apiClient.post<RefreshResponse>(`${AUTH_PREFIX}/refresh`, {})
    if (response.data?.authenticated !== true || response.data?.refreshed !== true) {
      throw new Error('refresh failed')
    }
    return getCurrentUser()
  },

  async login(email: string, password: string): Promise<AuthSession> {
    const response = await apiClient.post<AuthContextPayload>(`${AUTH_PREFIX}/login`, {
      email: normalizeEmail(email),
      password,
    })
    const session = mapSession(response.data)
    setStoredLastLoginEmail(session.user.email)
    return session
  },

  async register(email: string, password: string): Promise<AuthSession> {
    const response = await apiClient.post<AuthContextPayload>(`${AUTH_PREFIX}/register`, {
      email: normalizeEmail(email),
      password,
    })
    const session = mapSession(response.data)
    setStoredLastLoginEmail(session.user.email)
    return session
  },

  async changeEmail(email: string): Promise<AuthSession> {
    const response = await apiClient.patch<AuthContextPayload>(`${USERS_PREFIX}/me/email`, {
      email: normalizeEmail(email),
    })
    const session = mapSession(response.data)
    setStoredLastLoginEmail(session.user.email)
    return session
  },

  async resendEmailVerification(): Promise<EmailVerificationResendResult> {
    try {
      await apiClient.post(`${AUTH_PREFIX}/email-verification/resend`, {})
      return { status: 'sent' }
    } catch (error) {
      if (isApiErrorWithStatus(error, 409)) {
        return { status: 'already_verified' }
      }
      throw error
    }
  },

  async listSessions(): Promise<AuthManagedSession[]> {
    const response = await apiClient.get<AuthManagedSessionsResponse>(`${AUTH_PREFIX}/sessions`)
    return (response.data?.sessions ?? []).map((session) => mapManagedSession(session))
  },

  async revokeSession(sessionId: string): Promise<RevokeAuthSessionResult> {
    const response = await apiClient.delete<RevokeAuthSessionResponse>(`${AUTH_PREFIX}/sessions/${encodeURIComponent(sessionId)}`)
    if (!response.data?.session_id || response.data?.revoked !== true) {
      throw new Error('session revoke failed')
    }

    return {
      sessionId: String(response.data.session_id),
      revoked: true,
      current: response.data.current === true,
    }
  },

  async logout(): Promise<void> {
    await apiClient.post(`${AUTH_PREFIX}/logout`, {})
  },

  async logoutAll(): Promise<void> {
    await apiClient.post(`${AUTH_PREFIX}/logout-all`, {})
  },
}
