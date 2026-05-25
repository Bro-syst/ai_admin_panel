import { apiClient } from '@/core/api/apiClient'
import type { ApiError } from '@/core/api/errors/ApiError'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'

const AUTH_PREFIX = '/api/admin/v1/auth'

export const ADMIN_SECURITY_ERROR_CODE_ACCOUNT_LOCKED = 'account_locked'
export const ADMIN_SECURITY_ERROR_CODE_CSRF_FAILED = 'csrf_failed'

export type AdminTotpState = {
  enabled: boolean
  pendingEnrollment: boolean
}

export type AdminTotpEnrollment = {
  enrollmentId: string
  otpauthUri: string
  manualEntryKey: string
  issuer: string
  accountLabel: string
  expiresAt: string | null
}

export type AdminTotpEnrollmentResult = {
  totp: AdminTotpState
  enrollment: AdminTotpEnrollment
}

export type AdminTotpConfirmResult = {
  confirmed: boolean
  totp: AdminTotpState
}

export type AdminTotpDisableResult = {
  disabled: boolean
  totp: AdminTotpState
}

type TotpResponse = {
  status?: string
  enrollment_id?: string | null
  expires_at?: string | null
  issuer?: string | null
  account_label?: string | null
  otpauth_uri?: string
  manual_setup_key?: string
}

function readRequiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid admin security response: ${field}`)
  }

  return value
}

function readOptionalText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null
}

function readTotpStatus(payload: TotpResponse | undefined) {
  const status = readRequiredString(payload?.status, 'status')
  if (status !== 'enabled' && status !== 'pending' && status !== 'disabled') {
    throw new Error('Invalid admin security response: status')
  }

  return status
}

function mapTotpState(payload: TotpResponse | undefined): AdminTotpState {
  const status = readTotpStatus(payload)
  return {
    enabled: status === 'enabled',
    pendingEnrollment: status === 'pending',
  }
}

function mapEnrollment(payload: TotpResponse | undefined): AdminTotpEnrollment {
  if (readTotpStatus(payload) !== 'pending') {
    throw new Error('Invalid admin security response: enrollment status')
  }

  return {
    enrollmentId: readRequiredString(payload?.enrollment_id, 'enrollment_id'),
    otpauthUri: readRequiredString(payload?.otpauth_uri, 'enrollment.otpauth_uri'),
    manualEntryKey: readRequiredString(payload?.manual_setup_key, 'enrollment.manual_setup_key'),
    issuer: readRequiredString(payload?.issuer, 'enrollment.issuer'),
    accountLabel: readRequiredString(payload?.account_label, 'enrollment.account_label'),
    expiresAt: readOptionalText(payload?.expires_at),
  }
}

export async function getAdminTotpState(): Promise<AdminTotpState> {
  const response = await apiClient.get<TotpResponse>(`${AUTH_PREFIX}/totp`)
  return mapTotpState(response.data)
}

export async function beginAdminTotpEnrollment(): Promise<AdminTotpEnrollmentResult> {
  const response = await apiClient.post<TotpResponse>(`${AUTH_PREFIX}/totp/enrollment`, {})
  return {
    totp: mapTotpState(response.data),
    enrollment: mapEnrollment(response.data),
  }
}

export async function confirmAdminTotpEnrollment(enrollmentId: string, code: string): Promise<AdminTotpConfirmResult> {
  const response = await apiClient.post<TotpResponse>(`${AUTH_PREFIX}/totp/confirm`, {
    enrollment_id: enrollmentId,
    code,
  })
  return {
    confirmed: response.data?.status === 'enabled',
    totp: mapTotpState(response.data),
  }
}

export async function disableAdminTotp(code: string): Promise<AdminTotpDisableResult> {
  const response = await apiClient.post<TotpResponse>(`${AUTH_PREFIX}/totp/disable`, { code })
  return {
    disabled: response.data?.status === 'disabled',
    totp: mapTotpState(response.data),
  }
}

export function readApiErrorMessage(error: unknown, fallback: string, t: (key: string) => string) {
  return getLocalizedApiErrorMessage(error, t, fallback)
}

function isApiErrorWithCode(error: unknown, code: string) {
  if (!error || typeof error !== 'object') return false
  const payload = error as ApiError
  return payload.code === code
}

export function isAdminAccountLockedError(error: unknown) {
  return isApiErrorWithCode(error, ADMIN_SECURITY_ERROR_CODE_ACCOUNT_LOCKED)
}

export function isCsrfOrSameOriginError(error: unknown) {
  return isApiErrorWithCode(error, ADMIN_SECURITY_ERROR_CODE_CSRF_FAILED)
}
