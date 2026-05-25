import type { AuthAdminUser, AuthState } from '@/core/auth/authService'

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous'

export type AuthContextValue = {
  status: AuthStatus
  adminUser: AuthAdminUser | null
  authState: AuthState | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}
