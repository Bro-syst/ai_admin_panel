const WIDGET_PREFIX = '/api/v1/widget'

export type WidgetBootstrap = {
  siteId: string
  widgetId: string
  agentId: string
  widgetKey: string
  siteHostname: string
  widgetStatus: string
}

export type WidgetSession = {
  sessionId: string
  chatId: string
  siteId: string
  widgetId: string
  agentId: string
  chatStatus: string
  expiresAt: string
  replayClassification: string
}

export type WidgetMessage = {
  id: string
  chatId: string
  source: string
  messageType: string
  sequenceNumber: number
  contentText: string
  createdAt: string
}

export type WidgetSmokeResult = {
  bootstrap: WidgetBootstrap | null
  session: WidgetSession | null
  token: string | null
  chatId: string | null
  inboundMessage: WidgetMessage | null
  outboundMessage: WidgetMessage | null
  outcomeClassification: string | null
  replayClassification: string | null
  correlationId: string | null
}

type BootstrapPayload = {
  site_id?: string
  widget_id?: string
  agent_id?: string
  widget_key?: string
  site_hostname?: string
  widget_status?: string
}

type SessionPayload = {
  session_id?: string
  chat_id?: string
  site_id?: string
  widget_id?: string
  agent_id?: string
  chat_status?: string
  expires_at?: string
  replay_classification?: string
}

type MessagePayload = {
  id?: string
  chat_id?: string
  source?: string
  message_type?: string
  sequence_number?: number
  content_text?: string
  created_at?: string
}

type BootstrapResponsePayload = {
  bootstrap?: BootstrapPayload
  session?: SessionPayload | null
}

type SessionCreateResponsePayload = {
  bootstrap?: BootstrapPayload
  session?: SessionPayload
  token?: string
}

type SendMessageResponsePayload = {
  chat_id?: string
  inbound_message?: MessagePayload
  outbound_message?: MessagePayload | null
  outcome_classification?: string
  replay_classification?: string
  correlation_id?: string
}

type PublicWidgetErrorPayload = {
  detail?: string
  error_category?: string
  error_code?: string
  correlation_id?: string
}

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function readNullableString(value: unknown) {
  return typeof value === 'string' ? value : null
}

function readNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' ? value : fallback
}

function mapBootstrap(payload: BootstrapPayload = {}): WidgetBootstrap {
  return {
    siteId: readString(payload.site_id),
    widgetId: readString(payload.widget_id),
    agentId: readString(payload.agent_id),
    widgetKey: readString(payload.widget_key),
    siteHostname: readString(payload.site_hostname),
    widgetStatus: readString(payload.widget_status),
  }
}

function mapSession(payload: SessionPayload = {}): WidgetSession {
  return {
    sessionId: readString(payload.session_id),
    chatId: readString(payload.chat_id),
    siteId: readString(payload.site_id),
    widgetId: readString(payload.widget_id),
    agentId: readString(payload.agent_id),
    chatStatus: readString(payload.chat_status),
    expiresAt: readString(payload.expires_at),
    replayClassification: readString(payload.replay_classification),
  }
}

function mapMessage(payload: MessagePayload = {}): WidgetMessage {
  return {
    id: readString(payload.id),
    chatId: readString(payload.chat_id),
    source: readString(payload.source),
    messageType: readString(payload.message_type),
    sequenceNumber: readNumber(payload.sequence_number),
    contentText: readString(payload.content_text),
    createdAt: readString(payload.created_at),
  }
}

async function readPublicWidgetError(response: Response): Promise<PublicWidgetErrorPayload> {
  try {
    const payload = await response.json()
    return payload && typeof payload === 'object' ? payload as PublicWidgetErrorPayload : {}
  } catch {
    return {}
  }
}

function readPublicWidgetErrorCode(payload: PublicWidgetErrorPayload, response: Response) {
  if (payload.error_category) return payload.error_category
  if (payload.error_code) return payload.error_code

  const detail = payload.detail?.toLowerCase() ?? ''
  if (response.status === 404 || detail.includes('resolved widget resource not found')) {
    return 'widget_not_found'
  }

  return `widget_public_${response.status}`
}

async function throwPublicWidgetError(response: Response): Promise<never> {
  const payload = await readPublicWidgetError(response)
  const code = readPublicWidgetErrorCode(payload, response)
  const message = payload.detail ?? `widget_public_${response.status}`
  throw {
    code,
    message,
    response: {
      data: {
        ...payload,
        error_code: code,
        message,
      },
    },
  }
}

async function publicJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'omit',
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })
  if (!response.ok) {
    await throwPublicWidgetError(response)
  }
  return response.json() as Promise<T>
}

export const publicWidgetApi = {
  async getBootstrap(widgetKey: string): Promise<WidgetSmokeResult> {
    const payload = await publicJson<BootstrapResponsePayload>(`${WIDGET_PREFIX}/bootstrap?widget_key=${encodeURIComponent(widgetKey)}`)
    return {
      bootstrap: payload.bootstrap ? mapBootstrap(payload.bootstrap) : null,
      session: payload.session ? mapSession(payload.session) : null,
      token: null,
      chatId: payload.session ? readString(payload.session.chat_id) : null,
      inboundMessage: null,
      outboundMessage: null,
      outcomeClassification: null,
      replayClassification: payload.session ? readNullableString(payload.session.replay_classification) : null,
      correlationId: null,
    }
  },

  async createSession(widgetKey: string, idempotencyKey: string): Promise<WidgetSmokeResult> {
    const payload = await publicJson<SessionCreateResponsePayload>(`${WIDGET_PREFIX}/session`, {
      method: 'POST',
      body: JSON.stringify({ widget_key: widgetKey, idempotency_key: idempotencyKey }),
    })
    return {
      bootstrap: payload.bootstrap ? mapBootstrap(payload.bootstrap) : null,
      session: payload.session ? mapSession(payload.session) : null,
      token: readNullableString(payload.token),
      chatId: payload.session ? readString(payload.session.chat_id) : null,
      inboundMessage: null,
      outboundMessage: null,
      outcomeClassification: null,
      replayClassification: payload.session ? readNullableString(payload.session.replay_classification) : null,
      correlationId: null,
    }
  },

  async sendMessage(widgetKey: string, chatId: string, idempotencyKey: string, contentText: string): Promise<WidgetSmokeResult> {
    const payload = await publicJson<SendMessageResponsePayload>(`${WIDGET_PREFIX}/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ widget_key: widgetKey, idempotency_key: idempotencyKey, content_text: contentText }),
    })
    return {
      bootstrap: null,
      session: null,
      token: null,
      chatId: readNullableString(payload.chat_id),
      inboundMessage: payload.inbound_message ? mapMessage(payload.inbound_message) : null,
      outboundMessage: payload.outbound_message ? mapMessage(payload.outbound_message) : null,
      outcomeClassification: readNullableString(payload.outcome_classification),
      replayClassification: readNullableString(payload.replay_classification),
      correlationId: readNullableString(payload.correlation_id),
    }
  },
}
