import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import type { TenantDetailManager } from '@/modules/Tenants/model/useTenantDetailManager'
import { TenantDetailView } from '@/modules/Tenants/ui/TenantDetailView'

function renderView(manager: Partial<TenantDetailManager> = {}, locale = 'en') {
  window.localStorage.setItem('ai_admin_panel:locale_v1', locale)

  const defaultManager = {
    tenantId: 'tenant_1',
    detail: {
      tenant: {
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
      provisioningAudit: null,
      configurationSummary: {
        defaultLocale: 'en',
        timezone: 'UTC',
        backgroundProcessingEnabled: true,
        maxAgents: 3,
        maxWidgets: 2,
        maxMonthlyModelRequests: 1000,
        widgetAccessEnabled: true,
        handoffEnabled: false,
        fallbackAllowed: true,
        integrationEnabled: true,
        allowedActionClasses: ['support'],
        defaultProviderId: 'provider_1',
        defaultModelId: 'model_1',
        defaultModelFamily: 'gpt',
      },
      supportedMutationActions: [
        'tenant.change_status',
        'tenant.change_provisioning_status',
        'tenant.update_provisioning_metadata',
        'tenant.provision_default_configuration',
        'tenant.update_configuration',
      ],
    },
    provisioning: {
      tenant: { id: 'tenant_1', name: 'Acme', status: 'active' },
      binding: {
        id: 'binding_1',
        tenantId: 'tenant_1',
        externalCustomerRef: 'cust_1',
        externalBillingRef: 'bill_1',
        provisioningSource: 'admin_portal',
        provisioningCorrelationId: 'correlation_1',
        provisioningStatus: 'active',
        updatedAt: '2026-05-13T08:00:00Z',
      },
      replayClassification: 'new_request',
      idempotencyKey: 'idem_1',
      idempotencyResult: 'created',
      downstreamAvailability: {
        available: true,
        signal: 'ready',
        tenantStatus: 'active',
        provisioningStatus: 'active',
      },
    },
    auditSummary: {
      tenantId: 'tenant_1',
      action: 'tenant.provision',
      result: 'ok',
      actorId: null,
      actorType: 'admin',
      correlationId: 'correlation_1',
      provisioningStatus: 'active',
      downstreamAvailability: {
        available: true,
        signal: 'ready',
        tenantStatus: 'active',
        provisioningStatus: 'active',
      },
      changedStateSummary: { status: 'active' },
    },
    configuration: {
      id: 'config_1',
      tenantId: 'tenant_1',
      payload: { limits: {} },
    },
    configurationDraft: '{\n  "limits": {}\n}',
    configurationDraftError: null,
    isConfigurationDraftDirty: false,
    lastMutationResult: null,
    billingRef: '',
    pendingAction: null,
    allowedActions: {
      changeTenantStatus: true,
      changeProvisioningStatus: true,
      updateBillingRef: true,
      provisionDefaultConfig: true,
      updateConfiguration: true,
    },
    canMutate: true,
    isLoading: false,
    isSubmitting: false,
    errorMessage: null,
    notice: null,
    setBillingRef: vi.fn(),
    setConfigurationDraft: vi.fn(),
    loadTenant: vi.fn(),
    requestAction: vi.fn(),
    cancelAction: vi.fn(),
    confirmAction: vi.fn(),
    ...manager,
  } as unknown as TenantDetailManager

  render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/tenants/tenant_1']} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <TenantDetailView manager={defaultManager} />
      </MemoryRouter>
    </I18nProvider>,
  )

  return defaultManager
}

describe('TenantDetailView', () => {
  it('renders tenant detail, provisioning, audit and configuration states', () => {
    renderView()

    expect(screen.getByRole('link', { name: 'Back to tenants' })).toHaveAttribute('href', '/tenants')
    expect(screen.getByRole('link', { name: 'Conversations' })).toHaveAttribute('href', '/tenants/tenant_1/conversations')
    expect(screen.getByRole('link', { name: 'Usage & Metering' })).toHaveAttribute('href', '/tenants/tenant_1/usage')
    expect(screen.getByRole('link', { name: 'Billing Export' })).toHaveAttribute('href', '/tenants/tenant_1/billing-export')
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getAllByText('correlation_1').length).toBeGreaterThan(0)
    expect(screen.getByText('Provision tenant')).toBeInTheDocument()
    expect(screen.getByLabelText('Tenant configuration JSON')).toHaveValue('{\n  "limits": {}\n}')
  })

  it('requests explicit confirmation before running a mutation', async () => {
    const user = userEvent.setup()
    const manager = renderView()

    await user.click(screen.getByRole('button', { name: 'Deactivate' }))

    expect(manager.requestAction).toHaveBeenCalledWith('change_tenant_status', 'inactive')
  })

  it('calls confirm action from the confirmation dialog', async () => {
    const user = userEvent.setup()
    const manager = renderView({
      pendingAction: { action: 'update_billing_ref' },
    })

    const confirmButtons = screen.getAllByRole('button', { name: 'Update billing ref' })
    await user.click(confirmButtons[confirmButtons.length - 1])

    await waitFor(() => {
      expect(manager.confirmAction).toHaveBeenCalledTimes(1)
    })
  })

  it('uses a controlled configuration editor before save confirmation', async () => {
    const user = userEvent.setup()
    const manager = renderView({
      configurationDraft: '{\n  "limits": {\n    "max": 2\n  }\n}',
      isConfigurationDraftDirty: true,
    })

    fireEvent.change(screen.getByLabelText('Tenant configuration JSON'), {
      target: { value: '{\n  "limits": {\n    "max": 3\n  }\n}' },
    })
    await user.click(screen.getByRole('button', { name: 'Save configuration' }))

    expect(manager.setConfigurationDraft).toHaveBeenCalledWith('{\n  "limits": {\n    "max": 3\n  }\n}')
    expect(manager.requestAction).toHaveBeenCalledWith('save_configuration')
  })

  it('shows mutation result feedback after tenant actions', () => {
    renderView({
      lastMutationResult: {
        action: 'tenant.change_status',
        resourceType: 'tenant',
        resourceId: 'tenant_1',
        correlationId: 'correlation_2',
        mutationTimestamp: '2026-05-13T09:00:00Z',
      },
    })

    expect(screen.getByText('Last mutation result')).toBeInTheDocument()
    expect(screen.getAllByText('Change tenant status').length).toBeGreaterThan(0)
    expect(screen.getByText('correlation_2')).toBeInTheDocument()
  })

  it('localizes backend tenant action and result values in Russian', () => {
    renderView(
      {
        lastMutationResult: {
          action: 'provision_default_configuration',
          resourceType: 'tenant_configuration',
          resourceId: 'tenant_1',
          correlationId: 'correlation_2',
          mutationTimestamp: '2026-05-13T09:00:00Z',
        },
        provisioning: {
          tenant: { id: 'tenant_1', name: 'Acme', status: 'active' },
          binding: {
            id: 'binding_1',
            tenantId: 'tenant_1',
            externalCustomerRef: 'manual-smoke-customer-001',
            externalBillingRef: 'manual-smoke-billing-00',
            provisioningSource: 'admin_portal',
            provisioningCorrelationId: 'tenant_provisioning_1',
            provisioningStatus: 'active',
            updatedAt: '2026-05-13T08:00:00Z',
          },
          replayClassification: 'successful_replay',
          idempotencyKey: 'tenant_idempotency_1',
          idempotencyResult: 'succeeded',
          downstreamAvailability: {
            available: true,
            signal: 'ready',
            tenantStatus: 'active',
            provisioningStatus: 'active',
          },
        },
        auditSummary: {
          tenantId: 'tenant_1',
          action: 'tenant_provisioning_snapshot',
          result: 'succeeded',
          actorId: null,
          actorType: 'admin',
          correlationId: 'tenant_provisioning_1',
          provisioningStatus: 'active',
          downstreamAvailability: {
            available: true,
            signal: 'ready',
            tenantStatus: 'active',
            provisioningStatus: 'active',
          },
          changedStateSummary: { status: 'active' },
        },
      },
      'ru',
    )

    expect(screen.getAllByText('Создание конфигурации по умолчанию').length).toBeGreaterThan(0)
    expect(screen.getByText('Конфигурация тенанта')).toBeInTheDocument()
    expect(screen.getAllByText('Успешно').length).toBeGreaterThan(0)
    expect(screen.getByText('Успешный повтор')).toBeInTheDocument()
    expect(screen.getByText('Снимок подготовки тенанта')).toBeInTheDocument()
    expect(screen.queryByText('provision_default_configuration')).not.toBeInTheDocument()
    expect(screen.queryByText('tenant_configuration')).not.toBeInTheDocument()
    expect(screen.queryByText('successful_replay')).not.toBeInTheDocument()
  })

  it('disables mutation actions when backend-supported actions are absent', () => {
    renderView({
      allowedActions: {
        changeTenantStatus: false,
        changeProvisioningStatus: false,
        updateBillingRef: false,
        provisionDefaultConfig: false,
        updateConfiguration: false,
      },
    })

    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Update billing ref' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Provision default config' })).toBeDisabled()
  })
})
