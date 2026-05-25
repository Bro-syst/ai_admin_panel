import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { authService, type AuthSession } from '@/core/auth/authService'
import { AuthContext } from '@/core/auth/AuthContext'
import type { AuthContextValue, AuthStatus } from '@/core/auth/types'
import { subscribeAuthUnauthorized } from '@/core/auth/authEvents'

const ADMIN_SESSION_REFRESH_INTERVAL_MS = 10 * 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const opIdRef = useRef(0)
  const lastSessionRefreshAtRef = useRef(0)

  const applyAuthenticatedSession = useCallback((current: AuthSession) => {
    lastSessionRefreshAtRef.current = Date.now()
    setSession(current)
    setStatus('authenticated')
  }, [])

  const bootstrap = useCallback(async () => {
    const opId = opIdRef.current + 1
    opIdRef.current = opId

    setStatus('loading')
    try {
      const current = await authService.getCurrentAdminUser()
      if (opId !== opIdRef.current) return
      applyAuthenticatedSession(current)
    } catch {
      if (opId !== opIdRef.current) return
      setSession(null)
      setStatus('anonymous')
    }
  }, [applyAuthenticatedSession])

  const refresh = useCallback(async () => {
    const opId = opIdRef.current + 1
    opIdRef.current = opId
    setStatus('loading')
    try {
      const current = await authService.refresh()
      if (opId !== opIdRef.current) return
      applyAuthenticatedSession(current)
    } catch {
      if (opId !== opIdRef.current) return
      setSession(null)
      setStatus('anonymous')
    }
  }, [applyAuthenticatedSession])

  const refreshSilently = useCallback(async () => {
    const opId = opIdRef.current + 1
    opIdRef.current = opId
    try {
      const current = await authService.refresh()
      if (opId !== opIdRef.current) return
      applyAuthenticatedSession(current)
    } catch {
      if (opId !== opIdRef.current) return
      setSession(null)
      setStatus('anonymous')
    }
  }, [applyAuthenticatedSession])

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    return subscribeAuthUnauthorized(() => {
      opIdRef.current += 1
      setSession(null)
      setStatus('anonymous')
    })
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') return undefined

    const refreshIfStale = () => {
      if (Date.now() - lastSessionRefreshAtRef.current >= ADMIN_SESSION_REFRESH_INTERVAL_MS) {
        void refreshSilently()
      }
    }

    const intervalId = window.setInterval(() => {
      void refreshSilently()
    }, ADMIN_SESSION_REFRESH_INTERVAL_MS)

    window.addEventListener('focus', refreshIfStale)
    document.addEventListener('visibilitychange', refreshIfStale)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refreshIfStale)
      document.removeEventListener('visibilitychange', refreshIfStale)
    }
  }, [refreshSilently, status])

  const login = useCallback(async (email: string, password: string) => {
    const opId = opIdRef.current + 1
    opIdRef.current = opId
    setStatus('loading')
    try {
      const current = await authService.login(email, password)
      if (opId !== opIdRef.current) return
      applyAuthenticatedSession(current)
    } catch (error) {
      if (opId !== opIdRef.current) throw error
      setSession(null)
      setStatus('anonymous')
      throw error
    }
  }, [applyAuthenticatedSession])

  const logout = useCallback(async () => {
    const opId = opIdRef.current + 1
    opIdRef.current = opId
    try {
      await authService.logout()
    } finally {
      if (opId === opIdRef.current) {
        setSession(null)
        setStatus('anonymous')
      }
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      adminUser: session?.adminUser ?? null,
      authState: session?.authState ?? null,
      login,
      logout,
      refresh,
    }),
    [status, session, login, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
