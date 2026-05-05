import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import { apiClient } from '@/core/api/apiClient'
import {
  beginAmlTotpEnrollment,
  confirmAmlTotpEnrollment,
  disableAmlTotp,
  getAmlTotpState,
} from '@/modules/AmlSecurity/api/amlSecurityApi'

const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>
const postMock = apiClient.post as unknown as ReturnType<typeof vi.fn>

describe('amlSecurityApi', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
  })

  it('maps current AML officer TOTP state', async () => {
    getMock.mockResolvedValue({
      data: {
        totp: {
          enabled: false,
          pending_enrollment: true,
        },
      },
    })

    await expect(getAmlTotpState()).resolves.toEqual({
      enabled: false,
      pendingEnrollment: true,
    })

    expect(getMock).toHaveBeenCalledWith('/api/v1/aml/auth/totp')
  })

  it('maps TOTP enrollment payload', async () => {
    postMock.mockResolvedValue({
      data: {
        totp: {
          enabled: false,
          pending_enrollment: true,
        },
        enrollment: {
          otpauth_uri: 'otpauth://totp/example',
          manual_entry_key: 'JBSWY3DPEHPK3PXP',
          issuer: 'AI Admin Panel',
          account_label: 'officer@bank.local',
          expires_at: '2026-05-04T12:15:00Z',
        },
      },
    })

    await expect(beginAmlTotpEnrollment()).resolves.toEqual({
      totp: {
        enabled: false,
        pendingEnrollment: true,
      },
      enrollment: {
        otpauthUri: 'otpauth://totp/example',
        manualEntryKey: 'JBSWY3DPEHPK3PXP',
        issuer: 'AI Admin Panel',
        accountLabel: 'officer@bank.local',
        expiresAt: '2026-05-04T12:15:00Z',
      },
    })
  })

  it('maps TOTP confirm payload', async () => {
    postMock.mockResolvedValue({
      data: {
        confirmed: true,
        totp: {
          enabled: true,
          pending_enrollment: false,
        },
      },
    })

    await expect(confirmAmlTotpEnrollment('123456')).resolves.toEqual({
      confirmed: true,
      totp: {
        enabled: true,
        pendingEnrollment: false,
      },
    })

    expect(postMock).toHaveBeenCalledWith('/api/v1/aml/auth/totp/confirm', {
      code: '123456',
    })
  })

  it('maps TOTP disable payload', async () => {
    postMock.mockResolvedValue({
      data: {
        disabled: true,
        totp: {
          enabled: false,
          pending_enrollment: false,
        },
      },
    })

    await expect(disableAmlTotp('654321')).resolves.toEqual({
      disabled: true,
      totp: {
        enabled: false,
        pendingEnrollment: false,
      },
    })

    expect(postMock).toHaveBeenCalledWith('/api/v1/aml/auth/totp/disable', {
      code: '654321',
    })
  })

})
