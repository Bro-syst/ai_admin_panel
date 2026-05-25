import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/core/api/apiClient'
import { tenantsApi } from '@/modules/Tenants/api/tenantsApi'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
  },
}))

const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>
const postMock = apiClient.post as unknown as ReturnType<typeof vi.fn>
const patchMock = apiClient.patch as unknown as ReturnType<typeof vi.fn>
const putMock = apiClient.put as unknown as ReturnType<typeof vi.fn>

const tenantCardPayload = {
  tenant_id: 'tenant_1',
  tenant_name: 'Acme',
  tenant_status: 'active',
  provisioning_status: 'active',
  external_customer_ref: 'cust_1',
  external_billing_ref_present: true,
  downstream_available: true,
  configuration_present: true,
  last_updated_at: '2026-05-13T08:00:00Z',
  detail_route: '/tenants/tenant_1',
}

const provisioningPayload = {
  tenant: {
    id: 'tenant_1',
    name: 'Acme',
    status: 'active',
  },
  binding: {
    id: 'binding_1',
    tenant_id: 'tenant_1',
    external_customer_ref: 'cust_1',
    external_billing_ref: 'bill_1',
    provisioning_source: 'admin_portal',
    provisioning_correlation_id: 'correlation_1',
    provisioning_status: 'active',
    updated_at: '2026-05-13T08:00:00Z',
  },
  replay_classification: 'new_request',
  idempotency_key: 'idem_1',
  idempotency_result: 'created',
  downstream_availability: {
    available: true,
    signal: 'ready',
    tenant_status: 'active',
    provisioning_status: 'active',
  },
}

const mutationResultPayload = {
  action: 'tenant.provision',
  resource_type: 'tenant',
  resource_id: 'tenant_1',
  correlation_id: 'correlation_1',
  mutation_timestamp: '2026-05-13T08:00:00Z',
}

describe('tenantsApi', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
    patchMock.mockReset()
    putMock.mockReset()
  })

  it('lists tenants through the portal read model endpoint and maps cards', async () => {
    getMock.mockResolvedValue({
      data: {
        items: [tenantCardPayload],
        metadata: {
          page: 1,
          page_size: 20,
          total_items: 1,
          returned_items: 1,
          ordering: 'last_updated_at_desc',
        },
      },
    })

    await expect(tenantsApi.listTenants({ search: ' Acme ', tenantStatus: 'active', provisioningStatus: 'all' })).resolves.toEqual({
      items: [
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
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/system/portal/tenants', {
      params: {
        search: 'Acme',
        tenant_status: 'active',
        page: 1,
        page_size: 20,
      },
    })
  })

  it('provisions tenants with correlation id mirrored into X-Request-ID and idempotency in the body', async () => {
    postMock.mockResolvedValue({ data: { resource: provisioningPayload, result: mutationResultPayload } })

    await tenantsApi.provisionTenant({
      tenantName: ' Acme ',
      externalCustomerRef: ' cust_1 ',
      externalBillingRef: ' bill_1 ',
      provisioningCorrelationId: 'correlation_1',
      idempotencyKey: 'idem_1',
    })

    expect(postMock).toHaveBeenCalledWith(
      '/api/admin/v1/system/tenants/provisioning',
      {
        tenant_name: 'Acme',
        external_customer_ref: 'cust_1',
        external_billing_ref: 'bill_1',
        provisioning_source: 'admin_portal',
        provisioning_correlation_id: 'correlation_1',
        idempotency_key: 'idem_1',
        requested_status: 'active',
      },
      { headers: { 'X-Request-ID': 'correlation_1' } },
    )
  })

  it('uses real tenant mutation and detail endpoints', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        tenant: tenantCardPayload,
        provisioning_audit: null,
        configuration_summary: null,
        supported_mutation_actions: ['tenant.change_status'],
      },
    })
    getMock.mockResolvedValueOnce({ data: provisioningPayload })
    getMock.mockResolvedValueOnce({
      data: {
        tenant_id: 'tenant_1',
        action: 'tenant.provision',
        result: 'ok',
        actor_id: null,
        actor_type: 'admin',
        correlation_id: 'correlation_1',
        provisioning_status: 'active',
        downstream_availability: provisioningPayload.downstream_availability,
        changed_state_summary: { status: 'active' },
      },
    })
    getMock.mockResolvedValueOnce({ data: { id: 'config_1', tenant_id: 'tenant_1', payload: { limits: {} } } })
    patchMock.mockResolvedValue({ data: { resource: provisioningPayload, result: mutationResultPayload } })
    postMock.mockResolvedValue({ data: { resource: { id: 'config_1', tenant_id: 'tenant_1', payload: {} }, result: mutationResultPayload } })
    putMock.mockResolvedValue({ data: { resource: { id: 'config_1', tenant_id: 'tenant_1', payload: {} }, result: mutationResultPayload } })

    await tenantsApi.getTenantDetail('tenant_1')
    await tenantsApi.getProvisioning('tenant_1')
    await tenantsApi.getProvisioningAuditSummary('tenant_1')
    await tenantsApi.getConfiguration('tenant_1')
    await tenantsApi.updateProvisioningMetadata('tenant_1', 'bill_2')
    await tenantsApi.changeProvisioningStatus('tenant_1', 'suspended')
    await tenantsApi.changeTenantStatus('tenant_1', 'inactive')
    await tenantsApi.provisionDefaultConfiguration('tenant_1')
    await tenantsApi.updateConfiguration('tenant_1', { limits: {} })

    expect(getMock).toHaveBeenNthCalledWith(1, '/api/admin/v1/system/portal/tenants/tenant_1')
    expect(getMock).toHaveBeenNthCalledWith(2, '/api/admin/v1/tenants/tenant_1/provisioning')
    expect(getMock).toHaveBeenNthCalledWith(3, '/api/admin/v1/tenants/tenant_1/provisioning/audit-summary')
    expect(getMock).toHaveBeenNthCalledWith(4, '/api/admin/v1/tenants/tenant_1/configuration')
    expect(patchMock).toHaveBeenNthCalledWith(1, '/api/admin/v1/system/tenants/tenant_1/provisioning/metadata', {
      external_billing_ref: 'bill_2',
    })
    expect(patchMock).toHaveBeenNthCalledWith(2, '/api/admin/v1/system/tenants/tenant_1/provisioning/status', {
      status: 'suspended',
    })
    expect(patchMock).toHaveBeenNthCalledWith(3, '/api/admin/v1/system/tenants/tenant_1/status', { status: 'inactive' })
    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/system/tenants/tenant_1/configuration/provision-default', {})
    expect(putMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/configuration', { limits: {} })
  })
})
