import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import type { ConversationsManager } from '@/modules/Conversations/model/useConversationsManager'
import { ConversationsView } from '@/modules/Conversations/ui/ConversationsView'

function renderView(manager: Partial<ConversationsManager> = {}, locale = 'en') {
  window.localStorage.setItem('ai_admin_panel:locale_v1', locale)
  const defaultManager = {
    tenantId: 'tenant_1',
    statusFilter: 'all',
    runtimeSummary: {
      tenantId: 'tenant_1',
      totalChats: 1,
      activeChats: 1,
      closedChats: 0,
      totalTurns: 2,
      failedTurns: 1,
      actionTurns: 1,
      redactedMessageCount: 1,
      metadata: {},
      items: [
        {
          chatId: 'chat_1',
          tenantId: 'tenant_1',
          agentId: 'agent_1',
          chatStatus: 'active',
          startedAt: null,
          lastActivityAt: null,
          redactedMessagePreview: 'safe preview',
          turnSummary: null,
          currentMemorySummary: null,
          requestSummary: { requestCount: 2, inputTokens: 10, outputTokens: 20, totalTokens: 30, anchorKind: null, windowStart: null, windowEnd: null },
          correlationRefs: ['corr_1'],
          boundedPolicyOrRetrievalOutcomeRefsWhereAvailable: ['retrieval_1'],
          openedAt: '2026-05-14T08:00:00Z',
          lastMessageAt: '2026-05-14T08:01:00Z',
          turnCount: 2,
          failedTurnCount: 1,
          actionTurnCount: 1,
          latestFailureClassification: 'tool_failure',
          latestActionClassification: 'handoff',
        },
      ],
    },
    chats: [{ id: 'chat_1', tenantId: 'tenant_1', agentId: 'agent_1', status: 'active', openedAt: '2026-05-14T08:00:00Z', lastMessageAt: '2026-05-14T08:01:00Z', closedAt: null }],
    selectedChat: { id: 'chat_1', tenantId: 'tenant_1', agentId: 'agent_1', status: 'active', openedAt: '2026-05-14T08:00:00Z', lastMessageAt: '2026-05-14T08:01:00Z', closedAt: null },
    selectedRuntimeItem: null,
    messages: [{ id: 'message_1', tenantId: 'tenant_1', chatId: 'chat_1', source: 'user', messageType: 'text', sequenceNumber: 1, contentText: null, createdAt: '2026-05-14T08:00:00Z' }],
    selectedMessage: { id: 'message_1', tenantId: 'tenant_1', chatId: 'chat_1', source: 'user', messageType: 'text', sequenceNumber: 1, contentText: null, createdAt: '2026-05-14T08:00:00Z' },
    turns: [{ id: 'turn_1', tenantId: 'tenant_1', chatId: 'chat_1', agentId: 'agent_1', inboundMessageId: 'message_1', outboundMessageId: null, source: 'widget', status: 'failed', correlationId: 'corr_1', idempotencyKey: 'idem_1', requestFingerprint: 'fingerprint_1', modelRequestId: 'model_req_1', failureClassification: 'tool_failure', actionClass: 'handoff', workflowIdentity: 'wf_1', hasContextSnapshot: true, hasRuntimeSnapshot: true, hasMemorySnapshot: false, createdAt: '2026-05-14T08:00:00Z', updatedAt: '2026-05-14T08:01:00Z' }],
    selectedTurn: { id: 'turn_1', tenantId: 'tenant_1', chatId: 'chat_1', agentId: 'agent_1', inboundMessageId: 'message_1', outboundMessageId: null, source: 'widget', status: 'failed', correlationId: 'corr_1', idempotencyKey: 'idem_1', requestFingerprint: 'fingerprint_1', modelRequestId: 'model_req_1', failureClassification: 'tool_failure', actionClass: 'handoff', workflowIdentity: 'wf_1', hasContextSnapshot: true, hasRuntimeSnapshot: true, hasMemorySnapshot: false, createdAt: '2026-05-14T08:00:00Z', updatedAt: '2026-05-14T08:01:00Z' },
    memory: { id: 'mem_1', tenantId: 'tenant_1', chatId: 'chat_1', revision: 3, policyProfile: 'default', summaryText: 'Support-safe memory summary', coveredMessageCount: 2, coveredFromSequence: 1, coveredToSequence: 2, lastAppliedTurnId: 'turn_1', createdAt: '2026-05-14T08:00:00Z', updatedAt: '2026-05-14T08:01:00Z' },
    mutationResult: null,
    supportRefs: ['corr_1', 'retrieval_1', 'model_req_1'],
    canCloseConversation: true,
    isLoading: false,
    isDetailLoading: false,
    isMutating: false,
    errorMessage: null,
    formError: null,
    notice: null,
    setStatusFilter: vi.fn(),
    loadConversations: vi.fn(),
    selectChat: vi.fn(),
    selectMessage: vi.fn(),
    selectTurn: vi.fn(),
    closeSelectedChat: vi.fn(),
    ...manager,
  } as unknown as ConversationsManager

  render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/tenants/tenant_1/conversations']} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <ConversationsView manager={defaultManager} />
      </MemoryRouter>
    </I18nProvider>,
  )

  return defaultManager
}

describe('ConversationsView', () => {
  it('renders runtime summary and support-safe chat drill-downs', () => {
    renderView()

    expect(screen.getByRole('link', { name: 'Back to tenant' })).toHaveAttribute('href', '/tenants/tenant_1')
    expect(screen.getByText('Runtime summary')).toBeInTheDocument()
    expect(screen.getByText('safe preview')).toBeInTheDocument()
    expect(screen.getByText('Message content is redacted or not returned by the backend.')).toBeInTheDocument()
    expect(screen.getAllByText('model_req_1').length).toBeGreaterThan(0)
    expect(screen.getByText('Snapshot payloads are hidden unless the backend exposes support-safe fields.')).toBeInTheDocument()
    expect(screen.getByText('Support-safe memory summary')).toBeInTheDocument()
  })

  it('localizes conversation labels and backend status values for Russian operators', () => {
    renderView({
      runtimeSummary: {
        tenantId: 'tenant_1',
        totalChats: 2,
        activeChats: 2,
        closedChats: 0,
        totalTurns: 2,
        failedTurns: 1,
        actionTurns: 1,
        redactedMessageCount: 1,
        metadata: {},
        items: [
          {
            chatId: 'chat_1',
            tenantId: 'tenant_1',
            agentId: 'agent_1',
            chatStatus: 'open',
            startedAt: null,
            lastActivityAt: null,
            redactedMessagePreview: 'safe preview',
            turnSummary: null,
            currentMemorySummary: null,
            requestSummary: null,
            correlationRefs: [],
            boundedPolicyOrRetrievalOutcomeRefsWhereAvailable: [],
            openedAt: null,
            lastMessageAt: null,
            turnCount: 0,
            failedTurnCount: 0,
            actionTurnCount: 0,
            latestFailureClassification: null,
            latestActionClassification: null,
          },
        ],
      },
      selectedChat: { id: 'chat_1', tenantId: 'tenant_1', agentId: 'agent_1', status: 'open', openedAt: '2026-05-14T08:00:00Z', lastMessageAt: null, closedAt: null },
      selectedTurn: { id: 'turn_1', tenantId: 'tenant_1', chatId: 'chat_1', agentId: 'agent_1', inboundMessageId: 'message_1', outboundMessageId: null, source: 'widget', status: 'failed', correlationId: 'corr_1', idempotencyKey: 'idem_1', requestFingerprint: 'fingerprint_1', modelRequestId: 'model_req_1', failureClassification: 'tool_failure', actionClass: 'handoff', workflowIdentity: 'wf_1', hasContextSnapshot: true, hasRuntimeSnapshot: true, hasMemorySnapshot: true, createdAt: '2026-05-14T08:00:00Z', updatedAt: '2026-05-14T08:01:00Z' },
      messages: [{ id: 'message_1', tenantId: 'tenant_1', chatId: 'chat_1', source: 'user', messageType: 'text', sequenceNumber: 1, contentText: null, createdAt: '2026-05-14T08:00:00Z' }],
      selectedMessage: { id: 'message_1', tenantId: 'tenant_1', chatId: 'chat_1', source: 'user', messageType: 'text', sequenceNumber: 1, contentText: null, createdAt: '2026-05-14T08:00:00Z' },
    }, 'ru')

    expect(screen.getByRole('link', { name: 'Назад к тенанту' })).toHaveAttribute('href', '/tenants/tenant_1')
    expect(screen.getByRole('combobox', { name: 'Фильтр статуса диалога' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Закрыть диалог' })).toBeInTheDocument()
    expect(screen.getByText('Сводка диалогов')).toBeInTheDocument()
    expect(screen.getByText('Детали диалога')).toBeInTheDocument()
    expect(screen.getByText('Чаты')).toBeInTheDocument()
    expect(screen.getByText('Сообщения')).toBeInTheDocument()
    expect(screen.getByText('Шаги диалога')).toBeInTheDocument()
    expect(screen.getByText('Текущая память')).toBeInTheDocument()
    expect(screen.getAllByText('Открыт').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Ошибка').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Пользователь / Текст').length).toBeGreaterThan(0)
    expect(screen.getByText('Ошибка инструмента')).toBeInTheDocument()
    expect(screen.getByText('Передача оператору')).toBeInTheDocument()
    expect(screen.getByText('Снимок контекста')).toBeInTheDocument()
    expect(screen.getByText('Снимок выполнения')).toBeInTheDocument()
    expect(screen.getByText('Снимок памяти')).toBeInTheDocument()
    expect(screen.getByText('Текст сообщения скрыт или не возвращён сервером.')).toBeInTheDocument()
    expect(screen.queryByText('Conversations')).not.toBeInTheDocument()
    expect(screen.queryByText('Runtime summary')).not.toBeInTheDocument()
    expect(screen.queryByText('Conversation detail')).not.toBeInTheDocument()
    expect(screen.queryByText('Message content is redacted or not returned by the backend.')).not.toBeInTheDocument()
  })

  it('requires confirmation before closing a conversation', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const manager = renderView()

    await user.click(screen.getByRole('button', { name: 'Close conversation' }))

    expect(confirmSpy).toHaveBeenCalledWith('Close this conversation?')
    expect(manager.closeSelectedChat).toHaveBeenCalledTimes(1)
    confirmSpy.mockRestore()
  })

  it('keeps close action read-only when the operator lacks permission', () => {
    renderView({ canCloseConversation: false })

    expect(screen.getByRole('button', { name: 'Close conversation' })).toBeDisabled()
    expect(screen.getByText('Your role can inspect conversations but cannot close them.')).toBeInTheDocument()
  })

  it('does not expose future usage or billing navigation', () => {
    renderView()

    expect(screen.queryByRole('link', { name: /usage/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /billing/i })).not.toBeInTheDocument()
  })
})
