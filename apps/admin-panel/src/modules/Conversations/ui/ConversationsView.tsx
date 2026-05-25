import { Link } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import type { Chat, ConversationRuntimeItem, ConversationTurn, Message } from '@/modules/Conversations/api/conversationsApi'
import type { ConversationsManager } from '@/modules/Conversations/model/useConversationsManager'
import { InfoGrid, ListBlock, MutationResultBlock, StatusBadge } from '@/shared/ui/EntityInfo'
import { RefreshButton } from '@/shared/ui/RefreshButton'

function valueOrEmpty(value: string | number | null | undefined, emptyValue: string) {
  return value === null || value === undefined || value === '' ? emptyValue : value
}

function chatLabel(chat: Chat | ConversationRuntimeItem) {
  const id = 'id' in chat ? chat.id : chat.chatId
  const status = 'status' in chat ? chat.status : chat.chatStatus
  return `${id} / ${status}`
}

function redactedText(message: Message | null, fallback: string) {
  return message?.contentText?.trim() ? message.contentText : fallback
}

function SnapshotEvidence({ turn, label }: { turn: ConversationTurn | null; label: string }) {
  const values = [
    turn?.hasContextSnapshot ? 'context_snapshot' : null,
    turn?.hasRuntimeSnapshot ? 'runtime_snapshot' : null,
    turn?.hasMemorySnapshot ? 'memory_snapshot' : null,
  ].filter((value): value is string => Boolean(value))

  return <ListBlock title={label} values={values} />
}

function ChatList({ manager }: { manager: ConversationsManager }) {
  const { t } = useI18n()
  const runtimeItems = manager.runtimeSummary?.items ?? []
  const source = runtimeItems.length > 0 ? runtimeItems : manager.chats

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <h3 className="text-sm font-bold text-[var(--text)]">{t('conversations.chat_list')}</h3>
      <div className="mt-3 grid gap-2">
        {source.length ? source.map((item) => {
          const chatId = 'id' in item ? item.id : item.chatId
          const isSelected = manager.selectedChat?.id === chatId
          return (
            <button
              key={chatId}
              type="button"
              onClick={() => void manager.selectChat(chatId)}
              className={[
                'rounded-xl border p-3 text-left hover:border-[var(--primary)]',
                isSelected ? 'border-[var(--primary)] bg-[var(--surface)]' : 'border-[var(--border)] bg-[var(--surface-muted)]',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="break-all text-sm font-bold text-[var(--text)]">{chatLabel(item)}</span>
                <StatusBadge status={'status' in item ? item.status : item.chatStatus} />
              </div>
              {'redactedMessagePreview' in item && item.redactedMessagePreview ? (
                <p className="mt-2 line-clamp-2 text-xs text-[var(--text-muted)]">{item.redactedMessagePreview}</p>
              ) : null}
              {'turnCount' in item ? (
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  {t('conversations.total_turns')}: {item.turnCount} / {t('conversations.failed_turns')}: {item.failedTurnCount}
                </p>
              ) : null}
            </button>
          )
        }) : (
          <p className="text-sm text-[var(--text-muted)]">{t('conversations.empty_chats')}</p>
        )}
      </div>
    </section>
  )
}

function MessagesPanel({ manager }: { manager: ConversationsManager }) {
  const { t } = useI18n()
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <h3 className="text-sm font-bold text-[var(--text)]">{t('conversations.messages')}</h3>
      <div className="mt-3 grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="grid gap-2">
          {manager.messages.length ? manager.messages.map((message) => (
            <button
              key={message.id}
              type="button"
              onClick={() => void manager.selectMessage(message.id)}
              className={[
                'rounded-xl border p-3 text-left hover:border-[var(--primary)]',
                manager.selectedMessage?.id === message.id ? 'border-[var(--primary)] bg-[var(--surface)]' : 'border-[var(--border)] bg-[var(--surface-muted)]',
              ].join(' ')}
            >
              <div className="text-sm font-bold text-[var(--text)]">#{valueOrEmpty(message.sequenceNumber, t('agents.empty_value'))}</div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">{message.source} / {message.messageType}</div>
            </button>
          )) : <p className="text-sm text-[var(--text-muted)]">{t('conversations.no_messages')}</p>}
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('conversations.message_detail')}</h4>
          <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <p className="whitespace-pre-wrap break-words text-sm text-[var(--text)]">
              {redactedText(manager.selectedMessage, t('conversations.redacted_message'))}
            </p>
          </div>
          {manager.selectedMessage ? (
            <div className="mt-3">
              <InfoGrid
                items={[
                  { label: t('conversations.source'), value: manager.selectedMessage.source },
                  { label: t('conversations.message_type'), value: manager.selectedMessage.messageType },
                  { label: t('conversations.sequence'), value: valueOrEmpty(manager.selectedMessage.sequenceNumber, t('agents.empty_value')) },
                  { label: t('conversations.created'), value: valueOrEmpty(manager.selectedMessage.createdAt, t('agents.empty_value')) },
                ]}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function TurnsPanel({ manager }: { manager: ConversationsManager }) {
  const { t } = useI18n()
  const turn = manager.selectedTurn
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <h3 className="text-sm font-bold text-[var(--text)]">{t('conversations.turns')}</h3>
      <div className="mt-3 grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="grid gap-2">
          {manager.turns.length ? manager.turns.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => void manager.selectTurn(item.id)}
              className={[
                'rounded-xl border p-3 text-left hover:border-[var(--primary)]',
                turn?.id === item.id ? 'border-[var(--primary)] bg-[var(--surface)]' : 'border-[var(--border)] bg-[var(--surface-muted)]',
              ].join(' ')}
            >
              <div className="break-all text-sm font-bold text-[var(--text)]">{item.id}</div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">{item.status}</div>
            </button>
          )) : <p className="text-sm text-[var(--text-muted)]">{t('conversations.no_turns')}</p>}
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('conversations.turn_detail')}</h4>
          {turn ? (
            <>
              <div className="mt-3">
                <InfoGrid
                  items={[
                    { label: t('common.status'), value: turn.status },
                    { label: t('conversations.correlation_id'), value: valueOrEmpty(turn.correlationId, t('agents.empty_value')) },
                    { label: t('conversations.model_request_id'), value: valueOrEmpty(turn.modelRequestId, t('agents.empty_value')) },
                    { label: t('conversations.failure_classification'), value: valueOrEmpty(turn.failureClassification, t('agents.empty_value')) },
                    { label: t('conversations.action_class'), value: valueOrEmpty(turn.actionClass, t('agents.empty_value')) },
                    { label: t('conversations.workflow_identity'), value: valueOrEmpty(turn.workflowIdentity, t('agents.empty_value')) },
                    { label: t('conversations.inbound_message'), value: valueOrEmpty(turn.inboundMessageId, t('agents.empty_value')) },
                    { label: t('conversations.outbound_message'), value: valueOrEmpty(turn.outboundMessageId, t('agents.empty_value')) },
                    { label: t('conversations.idempotency_key'), value: valueOrEmpty(turn.idempotencyKey, t('agents.empty_value')) },
                    { label: t('conversations.request_fingerprint'), value: valueOrEmpty(turn.requestFingerprint, t('agents.empty_value')) },
                  ]}
                />
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <SnapshotEvidence turn={turn} label={t('conversations.snapshot_evidence')} />
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--text-muted)]">
                  {t('conversations.snapshot_redacted')}
                </div>
              </div>
            </>
          ) : <p className="mt-2 text-sm text-[var(--text-muted)]">{t('conversations.no_turns')}</p>}
        </div>
      </div>
    </section>
  )
}

function MemoryPanel({ manager }: { manager: ConversationsManager }) {
  const { t } = useI18n()
  const memory = manager.memory
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <h3 className="text-sm font-bold text-[var(--text)]">{t('conversations.current_memory')}</h3>
      {memory ? (
        <div className="mt-3 space-y-3">
          <InfoGrid
            items={[
              { label: t('conversations.revision'), value: valueOrEmpty(memory.revision, t('agents.empty_value')) },
              { label: t('conversations.policy_profile'), value: valueOrEmpty(memory.policyProfile, t('agents.empty_value')) },
              { label: t('conversations.covered_messages'), value: valueOrEmpty(memory.coveredMessageCount, t('agents.empty_value')) },
              { label: t('conversations.last_applied_turn'), value: valueOrEmpty(memory.lastAppliedTurnId, t('agents.empty_value')) },
              { label: t('conversations.created'), value: valueOrEmpty(memory.createdAt, t('agents.empty_value')) },
              { label: t('conversations.updated'), value: valueOrEmpty(memory.updatedAt, t('agents.empty_value')) },
            ]}
          />
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <p className="whitespace-pre-wrap break-words text-sm text-[var(--text)]">
              {memory.summaryText?.trim() || t('conversations.memory_unavailable')}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-[var(--text-muted)]">{t('conversations.memory_unavailable')}</p>
      )}
    </section>
  )
}

export function ConversationsView({ manager }: { manager: ConversationsManager }) {
  const { t } = useI18n()
  const summary = manager.runtimeSummary
  const closeDisabled = !manager.canCloseConversation || manager.isMutating || manager.selectedChat?.status === 'closed'

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to={`/tenants/${manager.tenantId}`} className="text-sm font-semibold text-[var(--primary-hover)] hover:underline">
            {t('conversations.back_to_tenant')}
          </Link>
          <h2 className="mt-2 text-lg font-bold text-[var(--text)]">{t('conversations.title')}</h2>
          <p className="mt-1 break-all text-sm text-[var(--text-muted)]">{manager.tenantId}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label={t('conversations.status_filter')}
            value={manager.statusFilter}
            onChange={(event) => manager.setStatusFilter(event.target.value as typeof manager.statusFilter)}
            className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--text)]"
          >
            <option value="all">{t('conversations.all_statuses')}</option>
            <option value="active">{t('conversations.active_status')}</option>
            <option value="closed">{t('conversations.closed_status')}</option>
          </select>
          <RefreshButton onClick={() => void manager.loadConversations()} />
        </div>
      </div>

      {manager.notice ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">{manager.notice}</div> : null}
      {manager.errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">{manager.errorMessage}</div> : null}
      {manager.formError ? <p className="text-sm font-medium text-rose-600">{manager.formError}</p> : null}
      <MutationResultBlock title={t('conversations.mutation_result')} result={manager.mutationResult} />

      {manager.isLoading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)] shadow-[var(--shadow-soft)]">{t('common.loading')}</div>
      ) : (
        <>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <h3 className="text-sm font-bold text-[var(--text)]">{t('conversations.runtime_summary')}</h3>
            <div className="mt-3">
              <InfoGrid
                items={[
                  { label: t('conversations.total_chats'), value: summary?.totalChats ?? 0 },
                  { label: t('conversations.active_chats'), value: summary?.activeChats ?? 0 },
                  { label: t('conversations.closed_chats'), value: summary?.closedChats ?? 0 },
                  { label: t('conversations.total_turns'), value: summary?.totalTurns ?? 0 },
                  { label: t('conversations.failed_turns'), value: summary?.failedTurns ?? 0 },
                  { label: t('conversations.action_turns'), value: summary?.actionTurns ?? 0 },
                  { label: t('conversations.redacted_messages'), value: summary?.redactedMessageCount ?? 0 },
                ]}
              />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <ChatList manager={manager} />

            <div className="space-y-4">
              <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text)]">{t('conversations.detail_title')}</h3>
                    <p className="mt-1 break-all text-xs text-[var(--text-muted)]">{manager.selectedChat?.id ?? t('agents.empty_value')}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {manager.selectedChat ? <StatusBadge status={manager.selectedChat.status} /> : null}
                    <button
                      type="button"
                      disabled={closeDisabled}
                      onClick={() => {
                        if (window.confirm(t('conversations.confirm_close'))) void manager.closeSelectedChat()
                      }}
                      className="inline-flex h-10 items-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
                    >
                      {t('conversations.close_chat')}
                    </button>
                  </div>
                </div>

                {manager.selectedChat ? (
                  <div className="mt-4 space-y-3">
                    <InfoGrid
                      items={[
                        { label: t('conversations.agent_id'), value: valueOrEmpty(manager.selectedChat.agentId, t('agents.empty_value')) },
                        { label: t('conversations.opened_at'), value: valueOrEmpty(manager.selectedChat.openedAt, t('agents.empty_value')) },
                        { label: t('conversations.last_message_at'), value: valueOrEmpty(manager.selectedChat.lastMessageAt, t('agents.empty_value')) },
                        { label: t('conversations.closed_at'), value: valueOrEmpty(manager.selectedChat.closedAt, t('agents.empty_value')) },
                        { label: t('conversations.request_count'), value: manager.selectedRuntimeItem?.requestSummary?.requestCount ?? t('agents.empty_value') },
                        { label: t('conversations.total_tokens'), value: manager.selectedRuntimeItem?.requestSummary?.totalTokens ?? t('agents.empty_value') },
                      ]}
                    />
                    {!manager.canCloseConversation ? <p className="text-sm text-[var(--text-muted)]">{t('conversations.permission_readonly')}</p> : null}
                    {manager.isDetailLoading ? <p className="text-sm text-[var(--text-muted)]">{t('common.loading')}</p> : null}
                    <ListBlock title={t('conversations.support_refs')} values={manager.supportRefs} />
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[var(--text-muted)]">{t('conversations.no_chat_selected')}</p>
                )}
              </section>

              {manager.selectedChat ? (
                <>
                  <MessagesPanel manager={manager} />
                  <TurnsPanel manager={manager} />
                  <MemoryPanel manager={manager} />
                </>
              ) : null}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
