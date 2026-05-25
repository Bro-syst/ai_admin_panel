import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/core/api/apiClient'
import { conversationsApi } from '@/modules/Conversations/api/conversationsApi'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>
const postMock = apiClient.post as unknown as ReturnType<typeof vi.fn>

const mutationResult = {
  action: 'chat.close',
  resource_type: 'chat',
  resource_id: 'chat_1',
  actor_id: 'admin_1',
  actor_type: 'admin',
  tenant_id: 'tenant_1',
  correlation_id: 'corr_1',
  mutation_timestamp: '2026-05-14T09:00:00Z',
  changed_state_summary: { status: 'closed' },
}

describe('conversationsApi', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
  })

  it('loads the backend-owned runtime summary read model', async () => {
    getMock.mockResolvedValue({
      data: {
        tenant_id: 'tenant_1',
        total_chats: 1,
        active_chats: 1,
        closed_chats: 0,
        total_turns: 3,
        failed_turns: 1,
        action_turns: 1,
        redacted_message_count: 2,
        items: [
          {
            chat_id: 'chat_1',
            tenant_id: 'tenant_1',
            agent_id: 'agent_1',
            chat_status: 'active',
            redacted_message_preview: 'safe preview',
            turn_count: 3,
            failed_turn_count: 1,
            action_turn_count: 1,
            usage_summary: { request_count: 2, total_tokens: 42 },
            correlation_refs: ['corr_1'],
            bounded_policy_or_retrieval_outcome_refs_where_available: ['retrieval_1'],
          },
        ],
        metadata: { page: 1 },
      },
    })

    await expect(conversationsApi.getRuntimeSummary('tenant_1', { status: 'active' })).resolves.toMatchObject({
      tenantId: 'tenant_1',
      totalChats: 1,
      redactedMessageCount: 2,
      items: [
        {
          chatId: 'chat_1',
          requestSummary: { requestCount: 2, totalTokens: 42 },
          boundedPolicyOrRetrievalOutcomeRefsWhereAvailable: ['retrieval_1'],
        },
      ],
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/portal/tenants/tenant_1/conversations/runtime-summary', {
      params: { status: 'active' },
    })
  })

  it('maps chat support drill-down endpoints without exposing raw snapshots', async () => {
    getMock
      .mockResolvedValueOnce({ data: { items: [{ id: 'chat_1', tenant_id: 'tenant_1', status: 'active' }] } })
      .mockResolvedValueOnce({
        data: {
          id: 'turn_1',
          tenant_id: 'tenant_1',
          chat_id: 'chat_1',
          status: 'failed',
          correlation_id: 'corr_1',
          model_request_id: 'model_req_1',
          context_snapshot: { prompt: 'internal' },
          runtime_snapshot: { raw: true },
          memory_snapshot: null,
        },
      })
      .mockResolvedValueOnce({ data: { snapshot: { id: 'mem_1', tenant_id: 'tenant_1', chat_id: 'chat_1', revision: 4, summary_text: 'safe summary' } } })

    await expect(conversationsApi.listChats('tenant_1')).resolves.toMatchObject([{ id: 'chat_1', status: 'active' }])
    await expect(conversationsApi.getTurn('tenant_1', 'chat_1', 'turn_1')).resolves.toMatchObject({
      id: 'turn_1',
      correlationId: 'corr_1',
      modelRequestId: 'model_req_1',
      hasContextSnapshot: true,
      hasRuntimeSnapshot: true,
      hasMemorySnapshot: false,
    })
    await expect(conversationsApi.getCurrentMemory('tenant_1', 'chat_1')).resolves.toMatchObject({
      id: 'mem_1',
      revision: 4,
      summaryText: 'safe summary',
    })
  })

  it('closes chats through the approved mutation endpoint and keeps correlation feedback', async () => {
    postMock.mockResolvedValue({
      data: {
        resource: { id: 'chat_1', tenant_id: 'tenant_1', status: 'closed' },
        result: mutationResult,
      },
    })

    await expect(conversationsApi.closeChat('tenant_1', 'chat_1')).resolves.toMatchObject({
      resource: { id: 'chat_1', status: 'closed' },
      result: { action: 'chat.close', correlationId: 'corr_1' },
    })

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/tenants/tenant_1/chats/chat_1/close')
  })
})
