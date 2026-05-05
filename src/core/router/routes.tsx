import { lazy } from 'react'
import { Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { RequireAuth } from '@/core/router/routeGuards'

const LoginPage = lazy(() => import('@/app/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const PasswordSetupPage = lazy(() =>
  import('@/app/pages/PasswordAccessPages').then((m) => ({ default: m.PasswordSetupPage })),
)
const PasswordResetRequestPage = lazy(() =>
  import('@/app/pages/PasswordAccessPages').then((m) => ({ default: m.PasswordResetRequestPage })),
)
const PasswordResetConfirmPage = lazy(() =>
  import('@/app/pages/PasswordAccessPages').then((m) => ({ default: m.PasswordResetConfirmPage })),
)
const SettingsPage = lazy(() => import('@/modules/Settings').then((m) => ({ default: m.SettingsPage })))
const NotFoundPage = lazy(
  () => import('@/shared/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/auth/password-setup', element: <PasswordSetupPage /> },
  { path: '/password-setup', element: <PasswordSetupPage /> },
  { path: '/password-reset/request', element: <PasswordResetRequestPage /> },
  { path: '/password-reset/confirm', element: <PasswordResetConfirmPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <Navigate to="/settings" replace />
      </RequireAuth>
    ),
  },
  {
    path: '/settings',
    element: (
      <RequireAuth>
        <SettingsPage />
      </RequireAuth>
    ),
  },
  { path: '*', element: <NotFoundPage /> },
]
