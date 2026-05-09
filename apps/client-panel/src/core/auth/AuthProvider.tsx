import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { authService, type AuthSession } from '@/core/auth/authService'
import { AuthContext } from '@/core/auth/AuthContext'
import type { AuthContextValue, AuthStatus } from '@/core/auth/types'
import { subscribeAuthUnauthorized } from '@/core/auth/authEvents'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const opIdRef = useRef(0)

  const bootstrap = useCallback(async () => {
    const opId = opIdRef.current + 1
    opIdRef.current = opId
    setStatus('loading')
    try {
      const current = await authService.getCurrentUser()
      if (opId !== opIdRef.current) return
      setSession(current)
      setStatus('authenticated')
    } catch {
      if (opId !== opIdRef.current) return
      setSession(null)
      setStatus('anonymous')
    }
  }, [])

  const refresh = useCallback(async () => {
    const opId = opIdRef.current + 1
    opIdRef.current = opId
    setStatus('loading')
    try {
      const current = await authService.refresh()
      if (opId !== opIdRef.current) return
      setSession(current)
      setStatus('authenticated')
    } catch {
      if (opId !== opIdRef.current) return
      setSession(null)
      setStatus('anonymous')
    }
  }, [])

  const reload = useCallback(async () => {
    const opId = opIdRef.current
    try {
      const current = await authService.getCurrentUser()
      if (opId !== opIdRef.current) return
      setSession(current)
      setStatus('authenticated')
    } catch (error) {
      if (opId !== opIdRef.current) throw error
      setSession(null)
      setStatus('anonymous')
      throw error
    }
  }, [])

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

  const login = useCallback(async (email: string, password: string) => {
    const opId = opIdRef.current + 1
    opIdRef.current = opId
    setStatus('loading')
    try {
      const current = await authService.login(email, password)
      if (opId !== opIdRef.current) return
      setSession(current)
      setStatus('authenticated')
    } catch (error) {
      if (opId !== opIdRef.current) throw error
      setSession(null)
      setStatus('anonymous')
      throw error
    }
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const opId = opIdRef.current + 1
    opIdRef.current = opId
    setStatus('loading')
    try {
      const current = await authService.register(email, password)
      if (opId !== opIdRef.current) return
      setSession(current)
      setStatus('authenticated')
    } catch (error) {
      if (opId !== opIdRef.current) throw error
      setSession(null)
      setStatus('anonymous')
      throw error
    }
  }, [])

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

  const logoutAll = useCallback(async () => {
    const opId = opIdRef.current + 1
    opIdRef.current = opId
    try {
      await authService.logoutAll()
    } finally {
      if (opId === opIdRef.current) {
        setSession(null)
        setStatus('anonymous')
      }
    }
  }, [])

  const changeEmail = useCallback(async (email: string) => {
    const opId = opIdRef.current
    const current = await authService.changeEmail(email)
    if (opId !== opIdRef.current) return
    setSession(current)
    setStatus('authenticated')
  }, [])

  const resendEmailVerification = useCallback(async () => {
    const opId = opIdRef.current
    const result = await authService.resendEmailVerification()

    if (result.status === 'already_verified') {
      const current = await authService.getCurrentUser()
      if (opId !== opIdRef.current) return result
      setSession(current)
      setStatus('authenticated')
    }

    return result
  }, [])

  const listSessions = useCallback(async () => {
    return authService.listSessions()
  }, [])

  const revokeSession = useCallback(async (sessionId: string) => {
    const result = await authService.revokeSession(sessionId)

    if (result.current) {
      opIdRef.current += 1
      setSession(null)
      setStatus('anonymous')
    }

    return result
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      merchant: session?.merchant ?? null,
      authState: session?.authState ?? null,
      cashdeskContext: session?.cashdeskContext ?? null,
      login,
      register,
      logout,
      refresh,
      reload,
      changeEmail,
      resendEmailVerification,
      listSessions,
      revokeSession,
      logoutAll,
    }),
    [status, session, login, register, logout, refresh, reload, changeEmail, resendEmailVerification, listSessions, revokeSession, logoutAll],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
