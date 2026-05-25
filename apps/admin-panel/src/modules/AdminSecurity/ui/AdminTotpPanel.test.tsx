import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { AdminTotpPanel } from '@/modules/AdminSecurity/ui/AdminTotpPanel'

const useAdminTotpManagerMock = vi.fn()

vi.mock('@/modules/AdminSecurity/model/useAdminTotpManager', () => ({
  useAdminTotpManager: () => useAdminTotpManagerMock(),
}))

function buildManagerState(overrides?: Record<string, unknown>) {
  return {
    status: 'ready',
    totp: {
      enabled: false,
      pendingEnrollment: false,
    },
    enrollment: null,
    loadError: null,
    loadErrorCause: null,
    notice: null,
    actionError: null,
    actionErrorCause: null,
    pendingAction: null,
    reload: vi.fn(),
    beginEnrollment: vi.fn(),
    confirmEnrollment: vi.fn(),
    disableTotp: vi.fn(),
    ...overrides,
  }
}

function renderPanel() {
  return render(
    <I18nProvider>
      <AdminTotpPanel />
    </I18nProvider>,
  )
}

describe('AdminTotpPanel', () => {
  beforeEach(() => {
    useAdminTotpManagerMock.mockReset()
  })

  it('renders enabled TOTP state without offering a new enrollment', () => {
    useAdminTotpManagerMock.mockReturnValue(
      buildManagerState({
        totp: {
          enabled: true,
          pendingEnrollment: false,
        },
      }),
    )

    renderPanel()

    expect(screen.getByText('Enabled')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Disable TOTP' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Start enrollment' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Get new setup data' })).not.toBeInTheDocument()
  })

  it('renders pending enrollment without payload as a QR reissue state without confirm form', () => {
    useAdminTotpManagerMock.mockReturnValue(
      buildManagerState({
        totp: {
          enabled: false,
          pendingEnrollment: true,
        },
      }),
    )

    renderPanel()

    expect(screen.getByText('Pending enrollment')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Get a new QR code' })).toBeInTheDocument()
    expect(screen.queryByText('2. Enter the current code')).not.toBeInTheDocument()
    expect(
      screen.getByText(
        'Setup data is no longer available in this session. Request a new QR code before you continue.',
      ),
    ).toBeInTheDocument()
  })

  it('renders QR-based provisioning when enrollment payload is available', () => {
    useAdminTotpManagerMock.mockReturnValue(
      buildManagerState({
        totp: {
          enabled: false,
          pendingEnrollment: true,
        },
        enrollment: {
          enrollmentId: 'enrollment_123',
          otpauthUri: 'otpauth://totp/AI%20Core%20Admin%20Portal%3Aadmin%40example.test',
          manualEntryKey: 'JBSWY3DPEHPK3PXP',
          issuer: 'AI Core Admin Portal',
          accountLabel: 'admin@example.test',
          expiresAt: '2026-05-04T12:15:00Z',
        },
      }),
    )

    const { container } = renderPanel()

    expect(screen.getByText('1. Scan the QR code')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Open your authenticator app and scan the QR code. If scanning is unavailable, use the manual setup key.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('2. Enter the current code')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Get a new QR code' })).toBeInTheDocument()
    expect(screen.getByText('JBSWY3DPEHPK3PXP')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders disabled state with setup CTA and without confirm form', () => {
    useAdminTotpManagerMock.mockReturnValue(buildManagerState())

    renderPanel()

    expect(screen.getByText('Not enabled')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Get QR code' })).toBeInTheDocument()
    expect(screen.queryByText('2. Enter the current code')).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Disable TOTP' })).not.toBeInTheDocument()
  })
})
