import { beforeEach, describe, expect, it, vi } from 'vitest'
import { publicWidgetApi } from '@/modules/SitesWidgets/api/publicWidgetApi'

describe('publicWidgetApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('creates a public widget session without admin credentials', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        bootstrap: {
          site_id: 'site_1',
          widget_id: 'widget_1',
          agent_id: 'agent_1',
          widget_key: 'sales_widget',
          site_hostname: 'example.com',
          widget_status: 'active',
        },
        session: {
          session_id: 'session_1',
          chat_id: 'chat_1',
          site_id: 'site_1',
          widget_id: 'widget_1',
          agent_id: 'agent_1',
          chat_status: 'active',
          expires_at: '2026-05-13T10:00:00Z',
          replay_classification: 'created',
        },
        token: 'public_token',
      }),
    })

    await expect(publicWidgetApi.createSession('sales_widget', 'idem_1')).resolves.toMatchObject({
      chatId: 'chat_1',
      token: 'public_token',
      bootstrap: { widgetKey: 'sales_widget' },
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/widget/session', expect.objectContaining({
      method: 'POST',
      credentials: 'omit',
      body: JSON.stringify({ widget_key: 'sales_widget', idempotency_key: 'idem_1' }),
    }))
  })

  it('sends a public widget smoke message without the admin api client', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        chat_id: 'chat_1',
        inbound_message: {
          id: 'message_1',
          chat_id: 'chat_1',
          source: 'visitor',
          message_type: 'text',
          sequence_number: 1,
          content_text: 'hello',
          created_at: '2026-05-13T10:00:00Z',
        },
        outbound_message: null,
        outcome_classification: 'accepted',
        replay_classification: 'new',
        correlation_id: 'corr_1',
      }),
    })

    await expect(publicWidgetApi.sendMessage('sales_widget', 'chat_1', 'idem_2', 'hello')).resolves.toMatchObject({
      chatId: 'chat_1',
      inboundMessage: { contentText: 'hello' },
      correlationId: 'corr_1',
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/widget/chats/chat_1/messages', expect.objectContaining({
      method: 'POST',
      credentials: 'omit',
      body: JSON.stringify({ widget_key: 'sales_widget', idempotency_key: 'idem_2', content_text: 'hello' }),
    }))
  })

  it('surfaces public widget backend error categories for localization', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({
        detail: 'Origin is not allowed',
        error_category: 'forbidden_origin',
        correlation_id: 'corr_1',
      }),
    })

    await expect(publicWidgetApi.createSession('sales_widget', 'idem_1')).rejects.toMatchObject({
      code: 'forbidden_origin',
      message: 'Origin is not allowed',
      response: {
        data: {
          error_code: 'forbidden_origin',
          correlation_id: 'corr_1',
        },
      },
    })
  })

  it('maps detail-only missing widget responses to the localized backend code', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({
        detail: 'Resolved widget resource not found',
        correlation_id: 'corr_2',
      }),
    })

    await expect(publicWidgetApi.createSession('sales_widget', 'idem_1')).rejects.toMatchObject({
      code: 'widget_not_found',
      message: 'Resolved widget resource not found',
      response: {
        data: {
          error_code: 'widget_not_found',
          correlation_id: 'corr_2',
        },
      },
    })
  })
})
