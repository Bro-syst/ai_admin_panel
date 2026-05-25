import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import type { TenantsListManager } from '@/modules/Tenants/model/useTenantsListManager'
import { TenantsListView } from '@/modules/Tenants/ui/TenantsListView'

function renderView(manager: Partial<TenantsListManager> = {}) {
  const defaultManager = {
    tenants: [
      {
        tenantId: 'tenant_1',
        tenantName: 'Acme',
        tenantStatus: 'active',
        provisioningStatus: 'active',
        externalCustomerRef: 'cust_1',
        externalBillingRefPresent: true,
        downstreamAvailable: true,
        configurationPresent: true,
        lastUpdatedAt: '2026-05-13T08:00:00Z',
        detailRoute: '/tenants/tenant_1',
      },
    ],
    metadata: {
      page: 1,
      pageSize: 20,
      totalItems: 1,
      returnedItems: 1,
      ordering: 'last_updated_at_desc',
    },
    filters: {
      search: '',
      tenantStatus: 'all',
      provisioningStatus: 'all',
    },
    provisionForm: {
      tenantName: '',
      externalCustomerRef: '',
      externalBillingRef: '',
    },
    statusOptions: ['active'],
    provisioningStatusOptions: ['active'],
    canMutate: true,
    isLoading: false,
    isProvisioning: false,
    errorMessage: null,
    formError: null,
    notice: null,
    setFilters: vi.fn(),
    updateProvisionForm: vi.fn(),
    loadTenants: vi.fn(),
    provisionTenant: vi.fn(),
    ...manager,
  } as unknown as TenantsListManager

  render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/tenants']} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <TenantsListView manager={defaultManager} />
      </MemoryRouter>
    </I18nProvider>,
  )

  return defaultManager
}

describe('TenantsListView', () => {
  it('renders tenant cards from the portal read model and links to detail', () => {
    renderView()

    expect(screen.getByRole('link', { name: 'Acme' })).toHaveAttribute('href', '/tenants/tenant_1')
    expect(screen.getByText('cust_1')).toBeInTheDocument()
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
  })

  it('submits provisioning through the manager only', async () => {
    const user = userEvent.setup()
    const manager = renderView()

    await user.click(screen.getByRole('button', { name: 'Provision tenant' }))

    expect(manager.provisionTenant).toHaveBeenCalledTimes(1)
  })

  it('keeps provisioning disabled for readonly operators', () => {
    renderView({ canMutate: false })

    expect(screen.getByRole('button', { name: 'Provision tenant' })).toBeDisabled()
    expect(screen.getByText('Your role can inspect tenants but cannot provision them.')).toBeInTheDocument()
  })
})
