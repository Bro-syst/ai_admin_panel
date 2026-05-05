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
      const current = await authService.getCurrentAmlOfficer()
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
      amlOfficer: session?.amlOfficer ?? null,
      authState: session?.authState ?? null,
      login,
      logout,
      refresh,
    }),
    [status, session, login, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
