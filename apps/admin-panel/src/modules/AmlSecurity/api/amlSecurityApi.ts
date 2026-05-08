import { apiClient } from '@/core/api/apiClient'
import type { ApiError } from '@/core/api/errors/ApiError'

const AUTH_PREFIX = '/api/v1/aml/auth'

export const AML_SECURITY_ERROR_CODE_LOCKED = 'locked'
export const AML_SECURITY_ERROR_CODE_TOTP_COOLDOWN_ACTIVE = 'totp_cooldown_active'
export const AML_SECURITY_ERROR_CODE_CSRF_OR_SAME_ORIGIN_FAILED = 'csrf_or_same_origin_failed'

export type AmlTotpState = {
  enabled: boolean
  pendingEnrollment: boolean
}

export type AmlTotpEnrollment = {
  otpauthUri: string
  manualEntryKey: string
  issuer: string
  accountLabel: string
  expiresAt: string | null
}

export type AmlTotpEnrollmentResult = {
  totp: AmlTotpState
  enrollment: AmlTotpEnrollment
}

export type AmlTotpConfirmResult = {
  confirmed: boolean
  totp: AmlTotpState
}

export type AmlTotpDisableResult = {
  disabled: boolean
  totp: AmlTotpState
}

type TotpStatePayload = {
  enabled?: boolean
  pending_enrollment?: boolean
}

type TotpStateResponse = {
  totp?: TotpStatePayload
}

type TotpEnrollmentPayload = {
  otpauth_uri?: string
  manual_entry_key?: string
  issuer?: string
  account_label?: string
  expires_at?: string | null
}

type TotpEnrollmentResponse = TotpStateResponse & {
  enrollment?: TotpEnrollmentPayload
}

type TotpConfirmResponse = TotpStateResponse & {
  confirmed?: boolean
}

type TotpDisableResponse = TotpStateResponse & {
  disabled?: boolean
}

function readRequiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid AML security response: ${field}`)
  }

  return value
}

function readRequiredBoolean(value: unknown, field: string) {
  if (typeof value !== 'boolean') {
    throw new Error(`Invalid AML security response: ${field}`)
  }

  return value
}

function mapTotpState(payload: TotpStatePayload | undefined): AmlTotpState {
  const enabled = readRequiredBoolean(payload?.enabled, 'totp.enabled')
  const pendingEnrollment = readRequiredBoolean(payload?.pending_enrollment, 'totp.pending_enrollment')

  if (enabled && pendingEnrollment) {
    throw new Error('Invalid AML security response: conflicting TOTP state')
  }

  return {
    enabled,
    pendingEnrollment,
  }
}

function mapEnrollment(payload: TotpEnrollmentPayload | undefined): AmlTotpEnrollment {
  if (!payload) {
    throw new Error('Invalid AML security response: enrollment')
  }

  return {
    otpauthUri: readRequiredString(payload.otpauth_uri, 'enrollment.otpauth_uri'),
    manualEntryKey: readRequiredString(payload.manual_entry_key, 'enrollment.manual_entry_key'),
    issuer: readRequiredString(payload.issuer, 'enrollment.issuer'),
    accountLabel: readRequiredString(payload.account_label, 'enrollment.account_label'),
    expiresAt: typeof payload.expires_at === 'string' && payload.expires_at.trim() ? payload.expires_at : null,
  }
}

export async function getAmlTotpState(): Promise<AmlTotpState> {
  const response = await apiClient.get<TotpStateResponse>(`${AUTH_PREFIX}/totp`)
  return mapTotpState(response.data?.totp)
}

export async function beginAmlTotpEnrollment(): Promise<AmlTotpEnrollmentResult> {
  const response = await apiClient.post<TotpEnrollmentResponse>(`${AUTH_PREFIX}/totp/enrollment`, {})
  return {
    totp: mapTotpState(response.data?.totp),
    enrollment: mapEnrollment(response.data?.enrollment),
  }
}

export async function confirmAmlTotpEnrollment(code: string): Promise<AmlTotpConfirmResult> {
  const response = await apiClient.post<TotpConfirmResponse>(`${AUTH_PREFIX}/totp/confirm`, { code })
  return {
    confirmed: response.data?.confirmed === true,
    totp: mapTotpState(response.data?.totp),
  }
}

export async function disableAmlTotp(code: string): Promise<AmlTotpDisableResult> {
  const response = await apiClient.post<TotpDisableResponse>(`${AUTH_PREFIX}/totp/disable`, { code })
  return {
    disabled: response.data?.disabled === true,
    totp: mapTotpState(response.data?.totp),
  }
}

export function readApiErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.trim()) {
    return error.message
  }

  return fallback
}

function isApiErrorWithCode(error: unknown, code: string) {
  if (!error || typeof error !== 'object') return false
  const payload = error as ApiError
  return payload.code === code
}

export function isAmlOfficerLockedError(error: unknown) {
  return isApiErrorWithCode(error, AML_SECURITY_ERROR_CODE_LOCKED)
}

export function isTotpCooldownActiveError(error: unknown) {
  return isApiErrorWithCode(error, AML_SECURITY_ERROR_CODE_TOTP_COOLDOWN_ACTIVE)
}

export function isCsrfOrSameOriginError(error: unknown) {
  return isApiErrorWithCode(error, AML_SECURITY_ERROR_CODE_CSRF_OR_SAME_ORIGIN_FAILED)
}
