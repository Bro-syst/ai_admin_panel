import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthVerificationRefreshProvider } from '@/app/providers/AuthVerificationRefreshProvider'
import { AuthProvider } from '@/core/auth/AuthProvider'
import { ThemeProvider } from '@/core/theme/ThemeProvider'
import { I18nProvider } from '@/core/i18n/I18nProvider'
const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter future={routerFutureConfig}>
          <AuthProvider>
            <AuthVerificationRefreshProvider>{children}</AuthVerificationRefreshProvider>
          </AuthProvider>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  )
}
