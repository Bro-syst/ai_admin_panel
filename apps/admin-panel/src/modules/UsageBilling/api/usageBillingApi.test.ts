import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/core/api/apiClient'
import { usageBillingApi } from '@/modules/UsageBilling/api/usageBillingApi'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>
const postMock = apiClient.post as unknown as ReturnType<typeof vi.fn>

describe('usageBillingApi', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
  })

  it('maps portal usage and metering read model without local billing calculation', async () => {
    getMock.mockResolvedValue({
      data: {
        tenant_id: 'tenant_1',
        agent_id_optional: 'agent_1',
        window_start: '2026-05-14T00:00:00Z',
        window_end: '2026-05-14T01:00:00Z',
        request_count: 2,
        total_input_tokens: 10,
        total_output_tokens: 15,
        total_tokens: 25,
        token_totals: { input: 10, output: 15 },
        model_breakdown: [{ model: 'm1', total_tokens: 25 }],
        billable_activity_summary: { pending: 1 },
        non_billable_classification_summary: { internal: 1 },
        linked_chat_turn_request_refs: ['chat_1', 'turn_1', 'model_req_1'],
        billing_owner_marker: 'billing.owner',
        billing_owner_stage: 'backend',
        export_status_preview: 'pending',
      },
    })

    await expect(
      usageBillingApi.getUsageMeteringSummary('tenant_1', {
        windowStart: '2026-05-14T00:00:00Z',
        windowEnd: '2026-05-14T01:00:00Z',
        agentId: 'agent_1',
      }),
    ).resolves.toMatchObject({
      tenantId: 'tenant_1',
      totalTokens: 25,
      tokenTotals: { input: 10, output: 15 },
      billingOwnerMarker: 'billing.owner',
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/portal/tenants/tenant_1/usage-metering', {
      params: {
        window_start: '2026-05-14T00:00:00Z',
        window_end: '2026-05-14T01:00:00Z',
        agent_id: 'agent_1',
      },
    })
  })

  it('loads usage summary and model request drill-downs using backend endpoints', async () => {
    getMock
      .mockResolvedValueOnce({
        data: {
          tenant_id: 'tenant_1',
          window_start: '2026-05-14T00:00:00Z',
          window_end: '2026-05-14T01:00:00Z',
          anchor_kind: 'model_request',
          anchor_id: 'model_req_1',
          total_records: 1,
          request_count: 1,
          total_input_tokens: 4,
          total_output_tokens: 5,
          total_tokens: 9,
        },
      })
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              id: 'usage_1',
              tenant_id: 'tenant_1',
              model_request_id: 'model_req_1',
              model_response_id: null,
              input_tokens: 4,
              output_tokens: 5,
              total_tokens: 9,
              created_at: '2026-05-14T00:30:00Z',
            },
          ],
        },
      })

    await expect(
      usageBillingApi.summarizeUsage('tenant_1', {
        windowStart: '2026-05-14T00:00:00Z',
        windowEnd: '2026-05-14T01:00:00Z',
        modelRequestId: 'model_req_1',
      }),
    ).resolves.toMatchObject({ anchorKind: 'model_request', totalTokens: 9 })
    await expect(usageBillingApi.listUsageForModelRequest('tenant_1', 'model_req_1')).resolves.toMatchObject([
      { id: 'usage_1', totalTokens: 9 },
    ])

    expect(getMock).toHaveBeenNthCalledWith(1, '/api/admin/v1/tenants/tenant_1/usage/summary', {
      params: {
        window_start: '2026-05-14T00:00:00Z',
        window_end: '2026-05-14T01:00:00Z',
        model_request_id: 'model_req_1',
      },
    })
    expect(getMock).toHaveBeenNthCalledWith(2, '/api/admin/v1/tenants/tenant_1/usage/model-requests/model_req_1')
  })

  it('maps billing export status and mutations with correlation/result evidence', async () => {
    getMock.mockResolvedValue({
      data: {
        tenant_id: 'tenant_1',
        external_billing_ref: 'bill_1',
        pending_count: 1,
        exported_count: 2,
        failed_count: 0,
        retry_scheduled_count: 0,
        reconciled_count: 0,
        stage25_owner_marker: 'billing.owner',
        last_export_attempt_at: null,
        owner_stage: 'backend',
        export_status: 'pending',
        current_state: 'ready',
        external_billing_ref_present: true,
        invoice_logic_exposed: false,
        payment_logic_exposed: false,
        last_exported_at: null,
      },
    })
    postMock.mockResolvedValue({
      data: {
        tenant_id: 'tenant_1',
        export_batch_ref: 'batch_1',
        export_request_id: 'export_req_1',
        export_state: 'exported',
        item_count: 1,
        payloads: [
          {
            core_tenant_id: 'tenant_1',
            tenant_id: 'tenant_1',
            external_billing_ref: 'bill_1',
            billable_activity_id: '00000000-0000-0000-0000-000000000001',
            activity_type: 'model_usage',
            unit: 'token',
            billable_unit: 'token',
            quantity: 9,
            occurred_at: '2026-05-14T00:30:00Z',
            source_artifact_kind: 'model_usage',
            source_artifact_id: 'usage_1',
            correlation_id: 'corr_1',
            idempotency_key: 'idem_1',
            export_state: 'exported',
            export_batch_ref: 'batch_1',
            export_request_id: 'export_req_1',
          },
        ],
        event_types: ['billing.exported'],
        replay_classification: 'new_request',
        retry_safe: true,
        direct_runtime_db_access_required: false,
        invoice_logic_exposed: false,
        payment_logic_exposed: false,
      },
    })

    await expect(usageBillingApi.getBillingExportStatus('tenant_1')).resolves.toMatchObject({
      externalBillingRef: 'bill_1',
      invoiceLogicExposed: false,
      paymentLogicExposed: false,
    })
    await expect(
      usageBillingApi.exportBillingBatch('tenant_1', {
        idempotencyKey: 'idem_1',
        billableActivityIds: ['00000000-0000-0000-0000-000000000001'],
        includeFailed: false,
        limit: 100,
      }),
    ).resolves.toMatchObject({
      exportBatchRef: 'batch_1',
      payloads: [{ correlationId: 'corr_1', quantity: 9 }],
    })

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/billing/export-batches', {
      idempotency_key: 'idem_1',
      billable_activity_ids: ['00000000-0000-0000-0000-000000000001'],
      include_failed: false,
      limit: 100,
    })
  })
})
