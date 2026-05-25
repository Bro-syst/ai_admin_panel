import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { AppSettingsProvider } from '@/core/settings/AppSettingsProvider'
import { AdminSessionsPanel } from '@/modules/Settings/ui/AdminSessionsPanel'

const listSessionsMock = vi.fn()
const revokeSessionMock = vi.fn()
const logoutAllMock = vi.fn()
const emitAuthUnauthorizedMock = vi.fn()

vi.mock('@/core/auth/authService', () => ({
  authService: {
    listSessions: (...args: unknown[]) => listSessionsMock(...args),
    revokeSession: (...args: unknown[]) => revokeSessionMock(...args),
    logoutAll: (...args: unknown[]) => logoutAllMock(...args),
  },
  readAuthErrorMessage: (error: unknown, fallback: string) =>
    error instanceof Error && error.message.trim() ? error.message : fallback,
}))

vi.mock('@/core/auth/authEvents', () => ({
  emitAuthUnauthorized: () => emitAuthUnauthorizedMock(),
}))

function renderPanel() {
  return render(
    <I18nProvider>
      <AppSettingsProvider>
        <AdminSessionsPanel />
      </AppSettingsProvider>
    </I18nProvider>,
  )
}

describe('AdminSessionsPanel', () => {
  beforeEach(() => {
    window.localStorage.clear()
    listSessionsMock.mockReset()
    revokeSessionMock.mockReset()
    logoutAllMock.mockReset()
    emitAuthUnauthorizedMock.mockReset()
  })

  it('renders active sessions with current badge and fallbacks', async () => {
    listSessionsMock.mockResolvedValue([
      {
        id: 'sess_current',
        createdAt: '2026-03-26T09:00:00Z',
        lastSeenAt: '2026-03-26T10:30:00Z',
        expiresAt: '2026-03-27T09:00:00Z',
        idleExpiresAt: '2026-03-26T11:00:00Z',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        current: true,
      },
      {
        id: 'sess_other',
        createdAt: '2026-03-26T08:00:00Z',
        lastSeenAt: null,
        expiresAt: '2026-03-27T08:00:00Z',
        idleExpiresAt: '2026-03-26T10:00:00Z',
        ipAddress: null,
        userAgent: null,
        current: false,
      },
    ])

    renderPanel()

    expect(await screen.findByText('Active sessions')).toBeInTheDocument()
    expect(screen.getByText('Current session')).toBeInTheDocument()
    expect(screen.getByText('Mozilla/5.0')).toBeInTheDocument()
    expect(screen.getByText('Unknown browser')).toBeInTheDocument()
    expect(screen.getByText('Unknown IP')).toBeInTheDocument()
    expect(screen.getByText('Never')).toBeInTheDocument()
    expect(screen.getAllByText('Created at')).toHaveLength(2)
    expect(screen.getAllByText('Idle expires at')).toHaveLength(2)
  })

  it('revokes a non-current session and reloads the list', async () => {
    const user = userEvent.setup()

    listSessionsMock
      .mockResolvedValueOnce([
        {
          id: 'sess_current',
          createdAt: '2026-03-26T09:00:00Z',
          lastSeenAt: '2026-03-26T10:30:00Z',
          expiresAt: '2026-03-27T09:00:00Z',
          idleExpiresAt: '2026-03-26T11:00:00Z',
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          current: true,
        },
        {
          id: 'sess_other',
          createdAt: '2026-03-26T08:00:00Z',
          lastSeenAt: '2026-03-26T09:30:00Z',
          expiresAt: '2026-03-27T08:00:00Z',
          idleExpiresAt: '2026-03-26T10:00:00Z',
          ipAddress: '10.0.0.1',
          userAgent: 'Second Browser',
          current: false,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'sess_current',
          createdAt: '2026-03-26T09:00:00Z',
          lastSeenAt: '2026-03-26T10:30:00Z',
          expiresAt: '2026-03-27T09:00:00Z',
          idleExpiresAt: '2026-03-26T11:00:00Z',
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0',
          current: true,
        },
      ])
    revokeSessionMock.mockResolvedValue({
      sessionId: 'sess_other',
      revoked: true,
      current: false,
    })

    renderPanel()

    const sessionCard = (await screen.findByText('Second Browser')).closest('article')
    expect(sessionCard).not.toBeNull()

    await user.click(within(sessionCard as HTMLElement).getByRole('button', { name: 'Revoke' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Revoke this active session?')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Revoke' }))

    await waitFor(() => {
      expect(revokeSessionMock).toHaveBeenCalledWith('sess_other')
      expect(listSessionsMock).toHaveBeenCalledTimes(2)
    })

    expect(await screen.findByText('Session was revoked.')).toBeInTheDocument()
  })

  it('emits unauthorized when current session is revoked', async () => {
    const user = userEvent.setup()

    listSessionsMock.mockResolvedValue([
      {
        id: 'sess_current',
        createdAt: '2026-03-26T09:00:00Z',
        lastSeenAt: '2026-03-26T10:30:00Z',
        expiresAt: '2026-03-27T09:00:00Z',
        idleExpiresAt: '2026-03-26T11:00:00Z',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        current: true,
      },
    ])
    revokeSessionMock.mockResolvedValue({
      sessionId: 'sess_current',
      revoked: true,
      current: false,
    })

    renderPanel()

    const sessionCard = (await screen.findByText('Mozilla/5.0')).closest('article')
    expect(sessionCard).not.toBeNull()

    await user.click(within(sessionCard as HTMLElement).getByRole('button', { name: 'Revoke' }))
    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByText('Revoke the current session and sign out this browser immediately?'),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Revoke' }))

    await waitFor(() => {
      expect(revokeSessionMock).toHaveBeenCalledWith('sess_current')
      expect(emitAuthUnauthorizedMock).toHaveBeenCalledTimes(1)
    })
  })

  it('logs out all sessions and emits unauthorized', async () => {
    const user = userEvent.setup()

    listSessionsMock.mockResolvedValue([
      {
        id: 'sess_current',
        createdAt: '2026-03-26T09:00:00Z',
        lastSeenAt: '2026-03-26T10:30:00Z',
        expiresAt: '2026-03-27T09:00:00Z',
        idleExpiresAt: '2026-03-26T11:00:00Z',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
        current: true,
      },
    ])
    logoutAllMock.mockResolvedValue(true)

    renderPanel()

    await screen.findByText('Active sessions')
    await user.click(screen.getByRole('button', { name: 'Log out all sessions' }))
    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByText('Log out all active sessions for this administrator account, including this browser?'),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Log out all sessions' }))

    await waitFor(() => {
      expect(logoutAllMock).toHaveBeenCalledTimes(1)
      expect(emitAuthUnauthorizedMock).toHaveBeenCalledTimes(1)
    })
  })
})
