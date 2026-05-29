import { Suspense } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useRoutes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { routes } from '@/core/router/routes'

vi.mock('@/core/auth/useAuth', () => ({
  useAuth: () => ({
    status: 'authenticated',
  }),
}))

vi.mock('@/modules/AdminSecurity', () => ({
  SecurityPage: () => <div>security-route-page</div>,
}))

vi.mock('@/modules/AdminUsers', () => ({
  AdminUsersPage: () => <div>admin-users-route-page</div>,
}))

vi.mock('@/modules/Operations', () => ({
  DashboardPage: () => <div>dashboard-route-page</div>,
  OperationsPage: () => <div>operations-route-page</div>,
}))

vi.mock('@/modules/Tenants', () => ({
  TenantsListPage: () => <div>tenants-list-route-page</div>,
  TenantDetailPage: () => <div>tenant-detail-route-page</div>,
}))

vi.mock('@/modules/Agents', () => ({
  AgentsListPage: () => <div>agents-list-route-page</div>,
  AgentCreatePage: () => <div>agent-create-route-page</div>,
  AgentDetailPage: () => <div>agent-detail-route-page</div>,
}))

vi.mock('@/modules/AgentConfig', () => ({
  AgentConfigPage: () => <div>agent-config-route-page</div>,
}))

vi.mock('@/modules/Knowledge', () => ({
  KnowledgePage: () => <div>knowledge-route-page</div>,
}))

vi.mock('@/modules/AgentCapabilities', () => ({
  AgentCapabilitiesPage: () => <div>agent-capabilities-route-page</div>,
}))

vi.mock('@/modules/AgentPolicy', () => ({
  AgentPolicyPage: () => <div>agent-policy-route-page</div>,
}))

vi.mock('@/modules/SitesWidgets', () => ({
  SitesWidgetsPage: () => <div>sites-widgets-route-page</div>,
}))

vi.mock('@/modules/Releases', () => ({
  ReleasesPage: () => <div>releases-route-page</div>,
}))

vi.mock('@/modules/Conversations', () => ({
  ConversationsPage: () => <div>conversations-route-page</div>,
}))

vi.mock('@/modules/UsageBilling', () => ({
  UsagePage: () => <div>usage-route-page</div>,
  BillingExportPage: () => <div>billing-export-route-page</div>,
}))

vi.mock('@/modules/Settings', () => ({
  SettingsPage: () => <div>settings-route-page</div>,
}))

function RouteRenderer() {
  return useRoutes(routes)
}

function renderRoutes(initialEntry: string) {
  return render(
    <I18nProvider>
      <MemoryRouter
        initialEntries={[initialEntry]}
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      >
        <Suspense fallback={<div>loading-route</div>}>
          <RouteRenderer />
        </Suspense>
      </MemoryRouter>
    </I18nProvider>,
  )
}

describe('admin panel routes', () => {
  it('renders /security as a real protected page', async () => {
    renderRoutes('/security')

    await waitFor(() => {
      expect(screen.getByText('security-route-page')).toBeInTheDocument()
    })

    expect(screen.queryByText('settings-route-page')).not.toBeInTheDocument()
  })

  it('redirects authenticated root to dashboard after dashboard stage', async () => {
    renderRoutes('/')

    await waitFor(() => {
      expect(screen.getByText('dashboard-route-page')).toBeInTheDocument()
    })
  })

  it('renders /dashboard as a protected dashboard page', async () => {
    renderRoutes('/dashboard')

    await waitFor(() => {
      expect(screen.getByText('dashboard-route-page')).toBeInTheDocument()
    })
  })

  it('renders /operations as a protected operations page', async () => {
    renderRoutes('/operations')

    await waitFor(() => {
      expect(screen.getByText('operations-route-page')).toBeInTheDocument()
    })
  })

  it('renders /admins as a protected admin users page', async () => {
    renderRoutes('/admins')

    await waitFor(() => {
      expect(screen.getByText('admin-users-route-page')).toBeInTheDocument()
    })
  })

  it('renders /tenants as a protected tenant list page', async () => {
    renderRoutes('/tenants')

    await waitFor(() => {
      expect(screen.getByText('tenants-list-route-page')).toBeInTheDocument()
    })
  })

  it('renders /tenants/:tenantId as a protected tenant detail page', async () => {
    renderRoutes('/tenants/tenant_1')

    await waitFor(() => {
      expect(screen.getByText('tenant-detail-route-page')).toBeInTheDocument()
    })
  })

  it('renders tenant-scoped agents list as a protected page', async () => {
    renderRoutes('/tenants/tenant_1/agents')

    await waitFor(() => {
      expect(screen.getByText('agents-list-route-page')).toBeInTheDocument()
    })
  })

  it('renders tenant-scoped conversations as a protected page', async () => {
    renderRoutes('/tenants/tenant_1/conversations')

    await waitFor(() => {
      expect(screen.getByText('conversations-route-page')).toBeInTheDocument()
    })
  })

  it('renders tenant-scoped usage and metering as a protected page', async () => {
    renderRoutes('/tenants/tenant_1/usage')

    await waitFor(() => {
      expect(screen.getByText('usage-route-page')).toBeInTheDocument()
    })
  })

  it('renders tenant-scoped billing export as a protected page', async () => {
    renderRoutes('/tenants/tenant_1/billing-export')

    await waitFor(() => {
      expect(screen.getByText('billing-export-route-page')).toBeInTheDocument()
    })
  })

  it('renders tenant-scoped agent create as a protected page', async () => {
    renderRoutes('/tenants/tenant_1/agents/new')

    await waitFor(() => {
      expect(screen.getByText('agent-create-route-page')).toBeInTheDocument()
    })
  })

  it('renders tenant-scoped agent detail as a protected page', async () => {
    renderRoutes('/tenants/tenant_1/agents/agent_1')

    await waitFor(() => {
      expect(screen.getByText('agent-detail-route-page')).toBeInTheDocument()
    })
  })

  it('renders tenant-scoped agent config as a protected page', async () => {
    renderRoutes('/tenants/tenant_1/agents/agent_1/config')

    await waitFor(() => {
      expect(screen.getByText('agent-config-route-page')).toBeInTheDocument()
    })
  })

  it('renders tenant-scoped agent knowledge as a protected page', async () => {
    renderRoutes('/tenants/tenant_1/agents/agent_1/knowledge')

    await waitFor(() => {
      expect(screen.getByText('knowledge-route-page')).toBeInTheDocument()
    })
  })

  it('renders tenant-scoped agent capabilities as a protected page', async () => {
    renderRoutes('/tenants/tenant_1/agents/agent_1/capabilities')

    await waitFor(() => {
      expect(screen.getByText('agent-capabilities-route-page')).toBeInTheDocument()
    })
  })

  it('renders tenant-scoped agent policy as a protected page', async () => {
    renderRoutes('/tenants/tenant_1/agents/agent_1/policy')

    await waitFor(() => {
      expect(screen.getByText('agent-policy-route-page')).toBeInTheDocument()
    })
  })

  it('renders tenant-scoped sites and widgets as a protected page', async () => {
    renderRoutes('/tenants/tenant_1/agents/agent_1/sites-widgets')

    await waitFor(() => {
      expect(screen.getByText('sites-widgets-route-page')).toBeInTheDocument()
    })
  })

  it('renders tenant-scoped releases as a protected page', async () => {
    renderRoutes('/tenants/tenant_1/agents/agent_1/releases')

    await waitFor(() => {
      expect(screen.getByText('releases-route-page')).toBeInTheDocument()
    })
  })

  it('does not add a separate release evidence requirements route', async () => {
    renderRoutes('/tenants/tenant_1/agents/agent_1/release-evidence-requirements')

    await waitFor(() => {
      expect(screen.queryByText('releases-route-page')).not.toBeInTheDocument()
    })
  })
})
