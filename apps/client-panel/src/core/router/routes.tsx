import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { RequireAuth } from '@/core/router/routeGuards'

const LoginPage = lazy(() => import('@/app/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const HomePage = lazy(() => import('@/app/pages/HomePage').then((m) => ({ default: m.HomePage })))
const VerifyEmailPage = lazy(() => import('@/app/pages/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })))
const AccountPage = lazy(() => import('@/modules/Account').then((m) => ({ default: m.AccountPage })))
const SettingsPage = lazy(() => import('@/modules/Settings').then((m) => ({ default: m.SettingsPage })))
const NotFoundPage = lazy(() => import('@/app/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/auth/verify-email', element: <VerifyEmailPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <HomePage />
      </RequireAuth>
    ),
  },
  {
    path: '/account',
    element: (
      <RequireAuth>
        <AccountPage />
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
