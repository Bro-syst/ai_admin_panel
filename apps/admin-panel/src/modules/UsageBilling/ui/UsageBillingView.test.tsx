import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import type { UsageBillingManager } from '@/modules/UsageBilling/model/useUsageBillingManager'
import { BillingExportView } from '@/modules/UsageBilling/ui/BillingExportView'
import { UsageView } from '@/modules/UsageBilling/ui/UsageView'

function managerFixture(overrides: Partial<UsageBillingManager> = {}) {
  return {
    tenantId: 'tenant_1',
    filters: {
      windowStart: '2026-05-14T00:00:00Z',
      windowEnd: '2026-05-14T01:00:00Z',
      agentId: 'agent_1',
      usageId: '',
      chatId: 'chat_1',
      conversationTurnId: 'turn_1',
      modelRequestId: 'model_req_1',
    },
    usageMetering: {
      tenantId: 'tenant_1',
      agentIdOptional: 'agent_1',
      windowStart: '2026-05-14T00:00:00Z',
      windowEnd: '2026-05-14T01:00:00Z',
      requestCount: 2,
      totalInputTokens: 10,
      totalOutputTokens: 15,
      totalTokens: 25,
      tokenTotals: { input: 10, output: 15 },
      modelBreakdown: [{ model: 'm1', total_tokens: 25 }],
      billableActivitySummary: { pending: 1 },
      nonBillableClassificationSummary: { internal: 1 },
      linkedChatTurnRequestRefs: ['chat_1', 'turn_1', 'model_req_1'],
      billingOwnerMarker: 'billing.owner',
      billingOwnerStage: 'backend',
      exportStatusPreview: 'pending',
    },
    billingStatus: {
      tenantId: 'tenant_1',
      externalBillingRef: 'bill_1',
      pendingCount: 1,
      exportedCount: 2,
      failedCount: 0,
      retryScheduledCount: 0,
      reconciledCount: 0,
      stage25OwnerMarker: 'billing.owner',
      lastExportAttemptAt: null,
      ownerStage: 'backend',
      exportStatus: 'pending',
      currentState: 'ready',
      externalBillingRefPresent: true,
      invoiceLogicExposed: false,
      paymentLogicExposed: false,
      lastExportedAt: null,
    },
    usageSummary: {
      tenantId: 'tenant_1',
      windowStart: '2026-05-14T00:00:00Z',
      windowEnd: '2026-05-14T01:00:00Z',
      anchorKind: 'chat',
      anchorId: 'chat_1',
      totalRecords: 1,
      requestCount: 1,
      totalInputTokens: 10,
      totalOutputTokens: 15,
      totalTokens: 25,
    },
    usageItems: [
      {
        id: 'usage_1',
        tenantId: 'tenant_1',
        modelRequestId: 'model_req_1',
        modelResponseId: null,
        inputTokens: 10,
        outputTokens: 15,
        totalTokens: 25,
        createdAt: '2026-05-14T00:30:00Z',
      },
    ],
    selectedUsage: {
      id: 'usage_1',
      tenantId: 'tenant_1',
      modelRequestId: 'model_req_1',
      modelResponseId: null,
      inputTokens: 10,
      outputTokens: 15,
      totalTokens: 25,
      createdAt: '2026-05-14T00:30:00Z',
    },
    lastBatch: {
      tenantId: 'tenant_1',
      exportBatchRef: 'batch_1',
      exportRequestId: 'export_req_1',
      exportState: 'exported',
      itemCount: 1,
      payloads: [
        {
          coreTenantId: 'tenant_1',
          tenantId: 'tenant_1',
          externalBillingRef: 'bill_1',
          agentId: 'agent_1',
          agentReleaseId: null,
          agentConfigId: null,
          billableActivityId: 'activity_1',
          activityType: 'model_usage',
          unit: 'token',
          billableUnit: 'token',
          quantity: 25,
          occurredAt: '2026-05-14T00:30:00Z',
          channelSource: 'widget',
          siteId: null,
          widgetId: null,
          chatId: 'chat_1',
          externalChatSessionBindingId: null,
          conversationTurnId: 'turn_1',
          modelRequestId: 'model_req_1',
          modelUsageId: 'usage_1',
          sourceArtifactKind: 'model_usage',
          sourceArtifactId: 'usage_1',
          sourceEventId: null,
          correlationId: 'corr_1',
          idempotencyKey: 'idem_1',
          exportState: 'exported',
          exportBatchRef: 'batch_1',
          exportRequestId: 'export_req_1',
        },
      ],
      eventTypes: ['billing.exported'],
      replayClassification: 'new_request',
      retrySafe: true,
      directRuntimeDbAccessRequired: false,
      invoiceLogicExposed: false,
      paymentLogicExposed: false,
    },
    exportBatchForm: { idempotencyKey: 'idem_export', billableActivityIdsText: '', includeFailed: false, limit: 100 },
    failureForm: { idempotencyKey: 'idem_failure', billableActivityIdsText: '', failureCode: '', failureReason: '' },
    retryForm: { idempotencyKey: 'idem_retry', billableActivityIdsText: '', },
    reconciliationForm: { idempotencyKey: 'idem_reconcile', billableActivityIdsText: '', reconciliationReference: '' },
    canManageBilling: true,
    isLoading: false,
    isDetailLoading: false,
    isMutating: false,
    errorMessage: null,
    formError: null,
    notice: null,
    setFilters: vi.fn(),
    setSelectedUsage: vi.fn(),
    setExportBatchForm: vi.fn(),
    setFailureForm: vi.fn(),
    setRetryForm: vi.fn(),
    setReconciliationForm: vi.fn(),
    loadUsageBilling: vi.fn(),
    loadUsageDetail: vi.fn(),
    loadAnchoredUsage: vi.fn(),
    exportBatch: vi.fn(),
    markFailure: vi.fn(),
    scheduleRetry: vi.fn(),
    reconcile: vi.fn(),
    ...overrides,
  } as unknown as UsageBillingManager
}

function renderWithShell(children: ReactNode, path = '/tenants/tenant_1/usage') {
  render(
    <I18nProvider>
      <MemoryRouter initialEntries={[path]} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        {children}
      </MemoryRouter>
    </I18nProvider>,
  )
}

describe('UsageView', () => {
  it('renders backend-owned usage, metering and drill-down evidence', () => {
    renderWithShell(<UsageView manager={managerFixture()} />)

    expect(screen.getByRole('link', { name: 'Back to tenant' })).toHaveAttribute('href', '/tenants/tenant_1')
    expect(screen.getByText('Metering read model')).toBeInTheDocument()
    expect(screen.getByText('billing.owner')).toBeInTheDocument()
    expect(screen.getByText('Usage summary')).toBeInTheDocument()
    expect(screen.getAllByText('model_req_1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('usage_1').length).toBeGreaterThan(0)
  })

  it('does not expose pricing, invoice amount, payment capture or tax controls', () => {
    renderWithShell(<UsageView manager={managerFixture()} />)

    expect(screen.queryByRole('button', { name: /price/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /invoice/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /payment/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /tax/i })).not.toBeInTheDocument()
  })
})

describe('BillingExportView', () => {
  it('renders status and last batch correlation/result feedback', () => {
    renderWithShell(<BillingExportView manager={managerFixture()} />, '/tenants/tenant_1/billing-export')

    expect(screen.getByText('Billing export status')).toBeInTheDocument()
    expect(screen.getByText('batch_1')).toBeInTheDocument()
    expect(screen.getByText('export_req_1')).toBeInTheDocument()
    expect(screen.getByText('activity_1: corr_1')).toBeInTheDocument()
    expect(screen.getAllByText('Invoice logic exposed').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Payment logic exposed').length).toBeGreaterThan(0)
  })

  it('requires confirmation before export mutation', async () => {
    const user = userEvent.setup()
    const manager = managerFixture()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderWithShell(<BillingExportView manager={manager} />, '/tenants/tenant_1/billing-export')

    await user.click(screen.getByRole('button', { name: 'Export batch' }))

    expect(confirmSpy).toHaveBeenCalledWith('Export selected or backend-selected billable activities?')
    expect(manager.exportBatch).toHaveBeenCalledTimes(1)
    confirmSpy.mockRestore()
  })

  it('keeps billing mutations read-only for non-admin users', () => {
    renderWithShell(<BillingExportView manager={managerFixture({ canManageBilling: false })} />, '/tenants/tenant_1/billing-export')

    expect(screen.getByRole('button', { name: 'Export batch' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Mark export failure' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Schedule retry' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Reconcile' })).toBeDisabled()
    expect(screen.getByText('Your role can inspect billing export state but cannot change it.')).toBeInTheDocument()
  })
})
