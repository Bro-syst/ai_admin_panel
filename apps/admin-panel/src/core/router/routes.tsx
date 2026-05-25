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
const SecurityPage = lazy(() => import('@/modules/AdminSecurity').then((m) => ({ default: m.SecurityPage })))
const AdminUsersPage = lazy(() => import('@/modules/AdminUsers').then((m) => ({ default: m.AdminUsersPage })))
const DashboardPage = lazy(() => import('@/modules/Operations').then((m) => ({ default: m.DashboardPage })))
const OperationsPage = lazy(() => import('@/modules/Operations').then((m) => ({ default: m.OperationsPage })))
const TenantsListPage = lazy(() => import('@/modules/Tenants').then((m) => ({ default: m.TenantsListPage })))
const TenantDetailPage = lazy(() => import('@/modules/Tenants').then((m) => ({ default: m.TenantDetailPage })))
const AgentsListPage = lazy(() => import('@/modules/Agents').then((m) => ({ default: m.AgentsListPage })))
const AgentCreatePage = lazy(() => import('@/modules/Agents').then((m) => ({ default: m.AgentCreatePage })))
const AgentDetailPage = lazy(() => import('@/modules/Agents').then((m) => ({ default: m.AgentDetailPage })))
const AgentConfigPage = lazy(() => import('@/modules/AgentConfig').then((m) => ({ default: m.AgentConfigPage })))
const KnowledgePage = lazy(() => import('@/modules/Knowledge').then((m) => ({ default: m.KnowledgePage })))
const AgentCapabilitiesPage = lazy(() =>
  import('@/modules/AgentCapabilities').then((m) => ({ default: m.AgentCapabilitiesPage })),
)
const AgentPolicyPage = lazy(() => import('@/modules/AgentPolicy').then((m) => ({ default: m.AgentPolicyPage })))
const SitesWidgetsPage = lazy(() => import('@/modules/SitesWidgets').then((m) => ({ default: m.SitesWidgetsPage })))
const ReleasesPage = lazy(() => import('@/modules/Releases').then((m) => ({ default: m.ReleasesPage })))
const ConversationsPage = lazy(() => import('@/modules/Conversations').then((m) => ({ default: m.ConversationsPage })))
const UsagePage = lazy(() => import('@/modules/UsageBilling').then((m) => ({ default: m.UsagePage })))
const BillingExportPage = lazy(() => import('@/modules/UsageBilling').then((m) => ({ default: m.BillingExportPage })))
const NotFoundPage = lazy(
  () => import('@/shared/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/auth/password-setup', element: <PasswordSetupPage /> },
  { path: '/admin/password-setup', element: <PasswordSetupPage /> },
  { path: '/password-setup', element: <PasswordSetupPage /> },
  { path: '/admin/password-reset', element: <PasswordResetConfirmPage /> },
  { path: '/password-reset/request', element: <PasswordResetRequestPage /> },
  { path: '/password-reset/confirm', element: <PasswordResetConfirmPage /> },
  {
    path: '/',
    element: (
      <RequireAuth>
        <Navigate to="/dashboard" replace />
      </RequireAuth>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        <DashboardPage />
      </RequireAuth>
    ),
  },
  {
    path: '/operations',
    element: (
      <RequireAuth>
        <OperationsPage />
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
  {
    path: '/security',
    element: (
      <RequireAuth>
        <SecurityPage />
      </RequireAuth>
    ),
  },
  {
    path: '/admins',
    element: (
      <RequireAuth>
        <AdminUsersPage />
      </RequireAuth>
    ),
  },
  {
    path: '/tenants',
    element: (
      <RequireAuth>
        <TenantsListPage />
      </RequireAuth>
    ),
  },
  {
    path: '/tenants/:tenantId',
    element: (
      <RequireAuth>
        <TenantDetailPage />
      </RequireAuth>
    ),
  },
  {
    path: '/tenants/:tenantId/agents',
    element: (
      <RequireAuth>
        <AgentsListPage />
      </RequireAuth>
    ),
  },
  {
    path: '/tenants/:tenantId/conversations',
    element: (
      <RequireAuth>
        <ConversationsPage />
      </RequireAuth>
    ),
  },
  {
    path: '/tenants/:tenantId/usage',
    element: (
      <RequireAuth>
        <UsagePage />
      </RequireAuth>
    ),
  },
  {
    path: '/tenants/:tenantId/billing-export',
    element: (
      <RequireAuth>
        <BillingExportPage />
      </RequireAuth>
    ),
  },
  {
    path: '/tenants/:tenantId/agents/new',
    element: (
      <RequireAuth>
        <AgentCreatePage />
      </RequireAuth>
    ),
  },
  {
    path: '/tenants/:tenantId/agents/:agentId',
    element: (
      <RequireAuth>
        <AgentDetailPage />
      </RequireAuth>
    ),
  },
  {
    path: '/tenants/:tenantId/agents/:agentId/config',
    element: (
      <RequireAuth>
        <AgentConfigPage />
      </RequireAuth>
    ),
  },
  {
    path: '/tenants/:tenantId/agents/:agentId/knowledge',
    element: (
      <RequireAuth>
        <KnowledgePage />
      </RequireAuth>
    ),
  },
  {
    path: '/tenants/:tenantId/agents/:agentId/capabilities',
    element: (
      <RequireAuth>
        <AgentCapabilitiesPage />
      </RequireAuth>
    ),
  },
  {
    path: '/tenants/:tenantId/agents/:agentId/policy',
    element: (
      <RequireAuth>
        <AgentPolicyPage />
      </RequireAuth>
    ),
  },
  {
    path: '/tenants/:tenantId/agents/:agentId/sites-widgets',
    element: (
      <RequireAuth>
        <SitesWidgetsPage />
      </RequireAuth>
    ),
  },
  {
    path: '/tenants/:tenantId/agents/:agentId/releases',
    element: (
      <RequireAuth>
        <ReleasesPage />
      </RequireAuth>
    ),
  },
  { path: '*', element: <NotFoundPage /> },
]
