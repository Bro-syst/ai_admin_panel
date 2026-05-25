import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useAuth } from '@/core/auth/useAuth'
import { useI18n } from '@/core/i18n/useI18n'
import {
  conversationsApi,
  type Chat,
  type ChatMemorySnapshot,
  type ConversationRuntimeItem,
  type ConversationRuntimeSummary,
  type ConversationTurn,
  type Message,
  type MutationResult,
} from '@/modules/Conversations/api/conversationsApi'

const CLOSE_ACTION_PERMISSIONS = [
  'conversations:write',
  'conversation:write',
  'chats:close',
  'chat:close',
  'support:write',
  'manage-conversations',
  'manage-chats',
  'manage-support',
]

export function deriveCanCloseConversation(adminUser: { role: string; permissions?: string[] } | null) {
  if (!adminUser) return false
  const permissions = adminUser.permissions ?? []
  if (CLOSE_ACTION_PERMISSIONS.some((permission) => permissions.includes(permission))) return true
  return adminUser.role === 'platform_admin'
}

export type ConversationStatusFilter = 'all' | 'active' | 'closed'

export function supportRefsForRuntimeItem(item: ConversationRuntimeItem | null, turn: ConversationTurn | null) {
  const refs = [
    ...(item?.correlationRefs ?? []),
    ...(item?.boundedPolicyOrRetrievalOutcomeRefsWhereAvailable ?? []),
    turn?.correlationId,
    turn?.modelRequestId,
  ].filter((value): value is string => Boolean(value))

  return Array.from(new Set(refs))
}

export function useConversationsManager(tenantId: string) {
  const { adminUser } = useAuth()
  const { t } = useI18n()
  const [statusFilter, setStatusFilter] = useState<ConversationStatusFilter>('all')
  const [runtimeSummary, setRuntimeSummary] = useState<ConversationRuntimeSummary | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [selectedRuntimeItem, setSelectedRuntimeItem] = useState<ConversationRuntimeItem | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [turns, setTurns] = useState<ConversationTurn[]>([])
  const [selectedTurn, setSelectedTurn] = useState<ConversationTurn | null>(null)
  const [memory, setMemory] = useState<ChatMemorySnapshot | null>(null)
  const [mutationResult, setMutationResult] = useState<MutationResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isMutating, setIsMutating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const canCloseConversation = useMemo(() => deriveCanCloseConversation(adminUser), [adminUser])

  const runtimeItemsByChatId = useMemo(() => {
    const map = new Map<string, ConversationRuntimeItem>()
    for (const item of runtimeSummary?.items ?? []) {
      if (item.chatId) map.set(item.chatId, item)
    }
    return map
  }, [runtimeSummary?.items])

  const loadChatBundle = useCallback(async (chatId: string, runtimeItem: ConversationRuntimeItem | null = null) => {
    setIsDetailLoading(true)
    setFormError(null)
    try {
      const [chat, nextMessages, nextTurns, nextMemory] = await Promise.all([
        conversationsApi.getChat(tenantId, chatId),
        conversationsApi.listMessages(tenantId, chatId),
        conversationsApi.listTurns(tenantId, chatId),
        conversationsApi.getCurrentMemory(tenantId, chatId),
      ])
      setSelectedChat(chat)
      setSelectedRuntimeItem(runtimeItem)
      setMessages(nextMessages)
      setTurns(nextTurns)
      setMemory(nextMemory)
      setSelectedMessage(nextMessages[0] ? await conversationsApi.getMessage(tenantId, chatId, nextMessages[0].id) : null)
      setSelectedTurn(nextTurns[0] ? await conversationsApi.getTurn(tenantId, chatId, nextTurns[0].id) : null)
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('conversations.detail_error')))
    } finally {
      setIsDetailLoading(false)
    }
  }, [tenantId, t])

  const loadConversations = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const [summary, nextChats] = await Promise.all([
        conversationsApi.getRuntimeSummary(tenantId, { status: statusFilter === 'all' ? undefined : statusFilter }),
        conversationsApi.listChats(tenantId),
      ])
      const nextRuntimeItemsByChatId = new Map(summary.items.map((item) => [item.chatId, item]))
      setRuntimeSummary(summary)
      setChats(nextChats)

      const selectedId = summary.items[0]?.chatId ?? nextChats[0]?.id

      if (selectedId) {
        await loadChatBundle(selectedId, nextRuntimeItemsByChatId.get(selectedId) ?? null)
      } else {
        setSelectedChat(null)
        setSelectedRuntimeItem(null)
        setMessages([])
        setSelectedMessage(null)
        setTurns([])
        setSelectedTurn(null)
        setMemory(null)
      }
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('conversations.load_error')))
    } finally {
      setIsLoading(false)
    }
  }, [loadChatBundle, statusFilter, tenantId, t])

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  const selectChat = useCallback(async (chatId: string) => {
    await loadChatBundle(chatId, runtimeItemsByChatId.get(chatId) ?? null)
  }, [loadChatBundle, runtimeItemsByChatId])

  const selectMessage = useCallback(async (messageId: string) => {
    if (!selectedChat) return
    setIsDetailLoading(true)
    setFormError(null)
    try {
      setSelectedMessage(await conversationsApi.getMessage(tenantId, selectedChat.id, messageId))
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('conversations.detail_error')))
    } finally {
      setIsDetailLoading(false)
    }
  }, [selectedChat, tenantId, t])

  const selectTurn = useCallback(async (turnId: string) => {
    if (!selectedChat) return
    setIsDetailLoading(true)
    setFormError(null)
    try {
      setSelectedTurn(await conversationsApi.getTurn(tenantId, selectedChat.id, turnId))
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('conversations.detail_error')))
    } finally {
      setIsDetailLoading(false)
    }
  }, [selectedChat, tenantId, t])

  const closeSelectedChat = useCallback(async () => {
    if (!selectedChat) return
    if (!canCloseConversation) {
      setFormError(t('conversations.action_not_available'))
      return
    }
    setIsMutating(true)
    setFormError(null)
    setNotice(null)
    setMutationResult(null)
    try {
      const response = await conversationsApi.closeChat(tenantId, selectedChat.id)
      setSelectedChat(response.resource)
      setMutationResult(response.result)
      setNotice(t('conversations.notice.closed'))
      await loadConversations()
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('conversations.action_error')))
    } finally {
      setIsMutating(false)
    }
  }, [canCloseConversation, loadConversations, selectedChat, tenantId, t])

  return {
    tenantId,
    statusFilter,
    runtimeSummary,
    chats,
    selectedChat,
    selectedRuntimeItem,
    messages,
    selectedMessage,
    turns,
    selectedTurn,
    memory,
    mutationResult,
    canCloseConversation,
    isLoading,
    isDetailLoading,
    isMutating,
    errorMessage,
    formError,
    notice,
    supportRefs: supportRefsForRuntimeItem(selectedRuntimeItem, selectedTurn),
    setStatusFilter,
    loadConversations,
    selectChat,
    selectMessage,
    selectTurn,
    closeSelectedChat,
  }
}

export type ConversationsManager = ReturnType<typeof useConversationsManager>
