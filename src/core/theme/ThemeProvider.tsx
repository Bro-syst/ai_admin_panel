import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext, type ThemeMode, type ThemeContextValue } from '@/core/theme/ThemeContext'
import { getStorageKey } from '@/shared/storage/storageKeys'

const STORAGE_KEY = getStorageKey('theme_mode_v1')

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement
  if (mode === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

function getInitialTheme(): ThemeMode {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => getInitialTheme())

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
    applyTheme(next)
  }, [])

  const toggle = useCallback(() => setMode(mode === 'dark' ? 'light' : 'dark'), [mode, setMode])

  useEffect(() => {
    applyTheme(mode)
  }, [mode])

  const value = useMemo<ThemeContextValue>(() => ({ mode, setMode, toggle }), [mode, setMode, toggle])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
