import { describe, expect, it } from 'vitest'
import {
  buildExportBatchInput,
  buildFailureInput,
  buildReconciliationInput,
  buildRetryInput,
  buildUsageSummaryInput,
  deriveCanManageBilling,
  linesToIds,
} from '@/modules/UsageBilling/model/useUsageBillingManager'

describe('deriveCanManageBilling', () => {
  it('defaults billing export mutations to platform admin unless explicit permission exists', () => {
    expect(deriveCanManageBilling({ role: 'platform_admin', permissions: [] })).toBe(true)
    expect(deriveCanManageBilling({ role: 'platform_operator', permissions: ['billing:write'] })).toBe(true)
    expect(deriveCanManageBilling({ role: 'platform_operator', permissions: ['billing:read'] })).toBe(false)
    expect(deriveCanManageBilling({ role: 'platform_viewer', permissions: [] })).toBe(false)
    expect(deriveCanManageBilling(null)).toBe(false)
  })
})

describe('usage billing input builders', () => {
  it('passes backend-returned filters and IDs without pricing or invoice calculations', () => {
    expect(linesToIds('a\n\n b ')).toEqual(['a', 'b'])
    expect(
      buildUsageSummaryInput({
        windowStart: '2026-05-14T00:00:00Z',
        windowEnd: '2026-05-14T01:00:00Z',
        agentId: '',
        usageId: '',
        chatId: 'chat_1',
        conversationTurnId: '',
        modelRequestId: 'model_req_1',
      }),
    ).toEqual({
      windowStart: '2026-05-14T00:00:00Z',
      windowEnd: '2026-05-14T01:00:00Z',
      chatId: 'chat_1',
      conversationTurnId: null,
      modelRequestId: 'model_req_1',
    })
    expect(
      buildExportBatchInput({
        idempotencyKey: 'idem_1',
        billableActivityIdsText: 'activity_1',
        includeFailed: false,
        limit: 50,
      }),
    ).toEqual({
      idempotencyKey: 'idem_1',
      billableActivityIds: ['activity_1'],
      includeFailed: false,
      limit: 50,
    })
  })

  it('builds failure, retry and reconciliation mutation payloads from operator-entered refs', () => {
    expect(
      buildFailureInput({
        idempotencyKey: 'idem_failure',
        billableActivityIdsText: 'activity_1\nactivity_2',
        failureCode: 'downstream_rejected',
        failureReason: '',
      }),
    ).toEqual({
      idempotencyKey: 'idem_failure',
      billableActivityIds: ['activity_1', 'activity_2'],
      failureCode: 'downstream_rejected',
      failureReason: null,
    })
    expect(buildRetryInput({ idempotencyKey: 'idem_retry', billableActivityIdsText: 'activity_1' })).toEqual({
      idempotencyKey: 'idem_retry',
      billableActivityIds: ['activity_1'],
    })
    expect(
      buildReconciliationInput({
        idempotencyKey: 'idem_reconcile',
        billableActivityIdsText: 'activity_1',
        reconciliationReference: 'recon_1',
      }),
    ).toEqual({
      idempotencyKey: 'idem_reconcile',
      billableActivityIds: ['activity_1'],
      reconciliationReference: 'recon_1',
    })
  })
})
