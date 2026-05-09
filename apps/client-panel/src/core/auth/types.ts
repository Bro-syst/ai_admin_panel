import type {
  AuthCashdeskContext,
  AuthManagedSession,
  AuthMerchant,
  AuthState,
  AuthUser,
  EmailVerificationResendResult,
  RevokeAuthSessionResult,
} from '@/core/auth/authService'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export type AuthContextValue = {
  status: AuthStatus
  user: AuthUser | null
  merchant: AuthMerchant | null
  authState: AuthState | null
  cashdeskContext: AuthCashdeskContext | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  reload: () => Promise<void>
  changeEmail: (email: string) => Promise<void>
  resendEmailVerification: () => Promise<EmailVerificationResendResult>
  listSessions: () => Promise<AuthManagedSession[]>
  revokeSession: (sessionId: string) => Promise<RevokeAuthSessionResult>
  logoutAll: () => Promise<void>
}
