import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import { apiClient } from '@/core/api/apiClient'
import {
  beginAdminTotpEnrollment,
  confirmAdminTotpEnrollment,
  disableAdminTotp,
  getAdminTotpState,
} from '@/modules/AdminSecurity/api/adminSecurityApi'

const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>
const postMock = apiClient.post as unknown as ReturnType<typeof vi.fn>

describe('adminSecurityApi', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
  })

  it('maps current admin TOTP state', async () => {
    getMock.mockResolvedValue({
      data: {
        status: 'pending',
        enrollment_id: 'enrollment_123',
        expires_at: '2026-05-04T12:15:00Z',
        issuer: 'AI Core Admin Portal',
        account_label: 'admin@example.test',
      },
    })

    await expect(getAdminTotpState()).resolves.toEqual({
      enabled: false,
      pendingEnrollment: true,
    })

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/auth/totp')
  })

  it('maps TOTP enrollment payload', async () => {
    postMock.mockResolvedValue({
      data: {
        status: 'pending',
        enrollment_id: 'enrollment_123',
        expires_at: '2026-05-04T12:15:00Z',
        issuer: 'AI Core Admin Portal',
        account_label: 'admin@example.test',
        otpauth_uri: 'otpauth://totp/example',
        manual_setup_key: 'JBSWY3DPEHPK3PXP',
      },
    })

    await expect(beginAdminTotpEnrollment()).resolves.toEqual({
      totp: {
        enabled: false,
        pendingEnrollment: true,
      },
      enrollment: {
        enrollmentId: 'enrollment_123',
        otpauthUri: 'otpauth://totp/example',
        manualEntryKey: 'JBSWY3DPEHPK3PXP',
        issuer: 'AI Core Admin Portal',
        accountLabel: 'admin@example.test',
        expiresAt: '2026-05-04T12:15:00Z',
      },
    })
  })

  it('maps TOTP confirm payload', async () => {
    postMock.mockResolvedValue({
      data: {
        status: 'enabled',
        enrollment_id: null,
        expires_at: null,
        issuer: 'AI Core Admin Portal',
        account_label: 'admin@example.test',
      },
    })

    await expect(confirmAdminTotpEnrollment('enrollment_123', '123456')).resolves.toEqual({
      confirmed: true,
      totp: {
        enabled: true,
        pendingEnrollment: false,
      },
    })

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/auth/totp/confirm', {
      enrollment_id: 'enrollment_123',
      code: '123456',
    })
  })

  it('maps TOTP disable payload', async () => {
    postMock.mockResolvedValue({
      data: {
        status: 'disabled',
        enrollment_id: null,
        expires_at: null,
        issuer: null,
        account_label: null,
      },
    })

    await expect(disableAdminTotp('654321')).resolves.toEqual({
      disabled: true,
      totp: {
        enabled: false,
        pendingEnrollment: false,
      },
    })

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/auth/totp/disable', {
      code: '654321',
    })
  })

})
