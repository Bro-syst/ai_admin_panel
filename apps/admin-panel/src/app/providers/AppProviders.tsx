import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/core/auth/AuthProvider'
import { ThemeProvider } from '@/core/theme/ThemeProvider'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { AppSettingsProvider } from '@/core/settings/AppSettingsProvider'
const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AppSettingsProvider>
          <BrowserRouter future={routerFutureConfig}>
            <AuthProvider>{children}</AuthProvider>
          </BrowserRouter>
        </AppSettingsProvider>
      </I18nProvider>
    </ThemeProvider>
  )
}
