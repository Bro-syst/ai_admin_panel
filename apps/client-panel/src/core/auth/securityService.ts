import { apiClient } from '@/core/api/apiClient'

export type TotpState = {
  enabled: boolean
  pendingEnrollment: boolean
}

export type TotpEnrollment = {
  otpauthUri: string
  manualEntryKey: string
  issuer: string
  accountLabel: string
}

export type TotpEnrollmentResult = {
  totp: TotpState
  enrollment: TotpEnrollment
}

export type TotpConfirmResult = {
  confirmed: boolean
  totp: TotpState
}

export type TotpDisableResult = {
  disabled: boolean
  totp: TotpState
}

export type TotpRecoveryStartResult = {
  sent: boolean
}

export type TotpRecoveryConfirmResult = {
  recovered: boolean
  totp: TotpState
}

type TotpStatePayload = {
  enabled?: boolean
  pending_enrollment?: boolean
}

type TotpStatusResponse = {
  totp?: TotpStatePayload
}

type TotpEnrollmentPayload = {
  otpauth_uri?: string
  manual_entry_key?: string
  issuer?: string
  account_label?: string
}

type TotpEnrollmentResponse = {
  totp?: TotpStatePayload
  enrollment?: TotpEnrollmentPayload
}

type TotpConfirmResponse = {
  confirmed?: boolean
  totp?: TotpStatePayload
}

type TotpDisableResponse = {
  disabled?: boolean
  totp?: TotpStatePayload
}

type TotpRecoveryStartResponse = {
  sent?: boolean
}

type TotpRecoveryConfirmResponse = {
  recovered?: boolean
  totp?: TotpStatePayload
}

const AUTH_PREFIX = '/api/v1/auth'

function normalizeCode(code: string) {
  return code.trim()
}

function mapTotpState(payload?: TotpStatePayload): TotpState {
  return {
    enabled: payload?.enabled === true,
    pendingEnrollment: payload?.pending_enrollment === true,
  }
}

function mapTotpEnrollment(payload?: TotpEnrollmentPayload): TotpEnrollment {
  if (!payload?.otpauth_uri || !payload.manual_entry_key || !payload.issuer || !payload.account_label) {
    throw new Error('Invalid TOTP enrollment response')
  }

  return {
    otpauthUri: String(payload.otpauth_uri),
    manualEntryKey: String(payload.manual_entry_key),
    issuer: String(payload.issuer),
    accountLabel: String(payload.account_label),
  }
}

export const securityService = {
  async getTotpStatus(): Promise<TotpState> {
    const response = await apiClient.get<TotpStatusResponse>(`${AUTH_PREFIX}/totp`)
    return mapTotpState(response.data?.totp)
  },

  async beginTotpEnrollment(): Promise<TotpEnrollmentResult> {
    const response = await apiClient.post<TotpEnrollmentResponse>(`${AUTH_PREFIX}/totp/enrollment`, {})
    return {
      totp: mapTotpState(response.data?.totp),
      enrollment: mapTotpEnrollment(response.data?.enrollment),
    }
  },

  async confirmTotpEnrollment(code: string): Promise<TotpConfirmResult> {
    const response = await apiClient.post<TotpConfirmResponse>(`${AUTH_PREFIX}/totp/confirm`, {
      code: normalizeCode(code),
    })

    return {
      confirmed: response.data?.confirmed === true,
      totp: mapTotpState(response.data?.totp),
    }
  },

  async disableTotp(code: string): Promise<TotpDisableResult> {
    const response = await apiClient.post<TotpDisableResponse>(`${AUTH_PREFIX}/totp/disable`, {
      code: normalizeCode(code),
    })

    return {
      disabled: response.data?.disabled === true,
      totp: mapTotpState(response.data?.totp),
    }
  },

  async startTotpRecovery(): Promise<TotpRecoveryStartResult> {
    const response = await apiClient.post<TotpRecoveryStartResponse>(`${AUTH_PREFIX}/totp/recovery`, {})
    return {
      sent: response.data?.sent === true,
    }
  },

  async confirmTotpRecovery(code: string): Promise<TotpRecoveryConfirmResult> {
    const response = await apiClient.post<TotpRecoveryConfirmResponse>(`${AUTH_PREFIX}/totp/recovery/confirm`, {
      code: normalizeCode(code),
    })

    return {
      recovered: response.data?.recovered === true,
      totp: mapTotpState(response.data?.totp),
    }
  },

}
