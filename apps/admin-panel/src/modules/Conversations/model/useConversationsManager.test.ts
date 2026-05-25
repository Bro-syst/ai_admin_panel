import { describe, expect, it } from 'vitest'
import { deriveCanCloseConversation, supportRefsForRuntimeItem } from '@/modules/Conversations/model/useConversationsManager'

describe('deriveCanCloseConversation', () => {
  it('allows close action only for platform admin or explicit support permissions', () => {
    expect(deriveCanCloseConversation({ role: 'platform_admin', permissions: [] })).toBe(true)
    expect(deriveCanCloseConversation({ role: 'platform_operator', permissions: ['support:write'] })).toBe(true)
    expect(deriveCanCloseConversation({ role: 'platform_operator', permissions: ['support:read'] })).toBe(false)
    expect(deriveCanCloseConversation(null)).toBe(false)
  })
})

describe('supportRefsForRuntimeItem', () => {
  it('deduplicates support-safe correlation, retrieval and model request refs', () => {
    expect(
      supportRefsForRuntimeItem(
        {
          chatId: 'chat_1',
          tenantId: 'tenant_1',
          agentId: 'agent_1',
          chatStatus: 'active',
          startedAt: null,
          lastActivityAt: null,
          redactedMessagePreview: null,
          turnSummary: null,
          currentMemorySummary: null,
          requestSummary: null,
          correlationRefs: ['corr_1'],
          boundedPolicyOrRetrievalOutcomeRefsWhereAvailable: ['retrieval_1', 'corr_1'],
          openedAt: null,
          lastMessageAt: null,
          turnCount: 0,
          failedTurnCount: 0,
          actionTurnCount: 0,
          latestFailureClassification: null,
          latestActionClassification: null,
        },
        {
          id: 'turn_1',
          tenantId: 'tenant_1',
          chatId: 'chat_1',
          agentId: 'agent_1',
          inboundMessageId: null,
          outboundMessageId: null,
          source: null,
          status: 'completed',
          correlationId: 'corr_1',
          idempotencyKey: null,
          requestFingerprint: null,
          modelRequestId: 'model_req_1',
          failureClassification: null,
          actionClass: null,
          workflowIdentity: null,
          hasContextSnapshot: false,
          hasRuntimeSnapshot: false,
          hasMemorySnapshot: false,
          createdAt: null,
          updatedAt: null,
        },
      ),
    ).toEqual(['corr_1', 'retrieval_1', 'model_req_1'])
  })
})
