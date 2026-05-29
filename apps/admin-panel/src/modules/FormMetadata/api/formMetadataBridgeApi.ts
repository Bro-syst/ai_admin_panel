import { apiClient } from '@/core/api/apiClient'
import type { ApiError, ApiErrorKind } from '@/core/api/errors/ApiError'

const PORTAL_PREFIX = '/api/admin/v1/portal'
const AGENT_CONFIG_FORM_ID = 'agent_config'
const BRIDGE_EVENT_NAME = 'ai-admin:form-metadata-bridge'

export type FormMetadataScope = {
  tenantId: string
  agentId: string
  formId: string
}

export type FormMetadataOptionValue = string | boolean

export type FormMetadataOption = {
  value: FormMetadataOptionValue
  localizationKey: string
  source: string
  default: boolean
  extensions: Record<string, unknown>
}

export type FormMetadataField = {
  fieldId: string
  payloadPath: string
  control: string
  required: boolean
  defaultValue: string | boolean | string[] | null
  localizationKey: string
  helpKey: string | null
  options: FormMetadataOption[]
  constraints: Record<string, unknown>
  readonly: boolean
  extensions: Record<string, unknown>
}

export type FormMetadataCachePolicy = {
  safeToCache: boolean
  scope: string
  varyBy: string[]
}

export type FormMetadata = {
  formId: string
  formVersion: string
  schemaVersion: string
  cachePolicy: FormMetadataCachePolicy
  fields: FormMetadataField[]
  optionSources: Record<string, string>
  backendValidation: Record<string, string | boolean>
  extensions: Record<string, unknown>
}

export type FormMetadataBridgeErrorKind = ApiErrorKind | 'unsupported_form_id'

export class FormMetadataBridgeError extends Error {
  readonly kind: FormMetadataBridgeErrorKind
  readonly status?: number
  readonly code?: string
  readonly requestId?: string
  readonly details?: unknown

  constructor({
    kind,
    status,
    code,
    message,
    requestId,
    details,
  }: {
    kind: FormMetadataBridgeErrorKind
    status?: number
    code?: string
    message: string
    requestId?: string
    details?: unknown
  }) {
    super(message)
    this.name = 'FormMetadataBridgeError'
    this.kind = kind
    this.status = status
    this.code = code
    this.requestId = requestId
    this.details = details
  }
}

type FormMetadataOptionPayload = Record<string, unknown> & {
  value?: string | boolean
  localization_key?: string
  source?: string
  default?: boolean
}

type FormMetadataFieldPayload = Record<string, unknown> & {
  field_id?: string
  payload_path?: string
  control?: string
  required?: boolean
  default_value?: string | boolean | string[] | null
  localization_key?: string
  help_key?: string | null
  options?: FormMetadataOptionPayload[]
  constraints?: Record<string, unknown>
  readonly?: boolean
}

type FormMetadataPayload = Record<string, unknown> & {
  form_id?: string
  form_version?: string
  schema_version?: string
  cache_policy?: {
    safe_to_cache?: boolean
    scope?: string
    vary_by?: string[]
  }
  fields?: FormMetadataFieldPayload[]
  option_sources?: Record<string, string>
  backend_validation?: Record<string, string | boolean>
}

type BridgeEventDetail = {
  result: 'success' | 'failure'
  formId: string
  tenantId: string
  agentId: string
  formVersion?: string
  schemaVersion?: string
  status?: number
  code?: string
  requestId?: string
}

const formRoutes: Record<string, (scope: FormMetadataScope) => string> = {
  [AGENT_CONFIG_FORM_ID]: ({ tenantId, agentId }) =>
    `${PORTAL_PREFIX}/tenants/${tenantId}/agents/${agentId}/forms/agent-config/metadata`,
}

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function readNullableString(value: unknown) {
  return typeof value === 'string' ? value : null
}

function readBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? { ...(value as Record<string, unknown>) }
    : {}
}

function readStringRecord(value: unknown): Record<string, string> {
  const record = readRecord(value)
  return Object.fromEntries(
    Object.entries(record).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  )
}

function readValidationRecord(value: unknown): Record<string, string | boolean> {
  const record = readRecord(value)
  return Object.fromEntries(
    Object.entries(record).filter(
      (entry): entry is [string, string | boolean] =>
        typeof entry[1] === 'string' || typeof entry[1] === 'boolean',
    ),
  )
}

function readDefaultValue(value: unknown): string | boolean | string[] | null {
  if (typeof value === 'string' || typeof value === 'boolean') return value
  if (value === null) return null
  return readStringArray(value)
}

function extensionsFrom(payload: Record<string, unknown>, knownKeys: Set<string>) {
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => !knownKeys.has(key) && key !== 'label'),
  )
}

function mapOption(payload: FormMetadataOptionPayload = {}): FormMetadataOption {
  const value = typeof payload.value === 'boolean' || typeof payload.value === 'string' ? payload.value : ''
  return {
    value,
    localizationKey: readString(payload.localization_key),
    source: readString(payload.source),
    default: readBoolean(payload.default),
    extensions: extensionsFrom(
      payload,
      new Set(['value', 'localization_key', 'source', 'default']),
    ),
  }
}

function mapField(payload: FormMetadataFieldPayload = {}): FormMetadataField {
  return {
    fieldId: readString(payload.field_id),
    payloadPath: readString(payload.payload_path),
    control: readString(payload.control),
    required: readBoolean(payload.required),
    defaultValue: readDefaultValue(payload.default_value),
    localizationKey: readString(payload.localization_key),
    helpKey: readNullableString(payload.help_key),
    options: Array.isArray(payload.options) ? payload.options.map(mapOption) : [],
    constraints: readRecord(payload.constraints),
    readonly: readBoolean(payload.readonly),
    extensions: extensionsFrom(
      payload,
      new Set([
        'field_id',
        'payload_path',
        'control',
        'required',
        'default_value',
        'localization_key',
        'help_key',
        'options',
        'constraints',
        'readonly',
      ]),
    ),
  }
}

function mapMetadata(payload: FormMetadataPayload = {}): FormMetadata {
  return {
    formId: readString(payload.form_id),
    formVersion: readString(payload.form_version),
    schemaVersion: readString(payload.schema_version),
    cachePolicy: {
      safeToCache: readBoolean(payload.cache_policy?.safe_to_cache),
      scope: readString(payload.cache_policy?.scope),
      varyBy: readStringArray(payload.cache_policy?.vary_by),
    },
    fields: Array.isArray(payload.fields) ? payload.fields.map(mapField) : [],
    optionSources: readStringRecord(payload.option_sources),
    backendValidation: readValidationRecord(payload.backend_validation),
    extensions: extensionsFrom(
      payload,
      new Set([
        'form_id',
        'form_version',
        'schema_version',
        'cache_policy',
        'fields',
        'option_sources',
        'backend_validation',
      ]),
    ),
  }
}

function isApiError(error: unknown): error is ApiError {
  return Boolean(error && typeof error === 'object' && 'kind' in error)
}

function toBridgeError(error: unknown): FormMetadataBridgeError {
  if (error instanceof FormMetadataBridgeError) return error
  if (isApiError(error)) {
    return new FormMetadataBridgeError({
      kind: error.kind,
      status: error.status,
      code: error.code,
      message: error.message || 'Form metadata request failed',
      requestId: error.requestId,
      details: error.details,
    })
  }
  return new FormMetadataBridgeError({
    kind: 'unknown',
    message: 'Form metadata request failed',
    details: error,
  })
}

function emitBridgeEvent(detail: BridgeEventDetail) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return
  window.dispatchEvent(new CustomEvent(BRIDGE_EVENT_NAME, { detail }))
}

export function buildFormMetadataCacheKey(scope: FormMetadataScope, metadata: FormMetadata) {
  return [
    'form-metadata',
    scope.tenantId,
    scope.agentId,
    scope.formId,
    metadata.formVersion,
    metadata.schemaVersion,
  ].join(':')
}

export const formMetadataBridgeApi = {
  async getFormMetadata(scope: FormMetadataScope): Promise<FormMetadata> {
    const routeFactory = formRoutes[scope.formId]
    if (!routeFactory) {
      const error = new FormMetadataBridgeError({
        kind: 'unsupported_form_id',
        status: 400,
        code: 'unsupported_form_id',
        message: `Unsupported form metadata bridge form_id: ${scope.formId}`,
      })
      emitBridgeEvent({
        result: 'failure',
        formId: scope.formId,
        tenantId: scope.tenantId,
        agentId: scope.agentId,
        status: error.status,
        code: error.code,
      })
      throw error
    }

    try {
      const response = await apiClient.get<FormMetadataPayload>(routeFactory(scope))
      const metadata = mapMetadata(response.data)
      emitBridgeEvent({
        result: 'success',
        formId: scope.formId,
        tenantId: scope.tenantId,
        agentId: scope.agentId,
        formVersion: metadata.formVersion,
        schemaVersion: metadata.schemaVersion,
      })
      return metadata
    } catch (error) {
      const bridgeError = toBridgeError(error)
      emitBridgeEvent({
        result: 'failure',
        formId: scope.formId,
        tenantId: scope.tenantId,
        agentId: scope.agentId,
        status: bridgeError.status,
        code: bridgeError.code,
        requestId: bridgeError.requestId,
      })
      throw bridgeError
    }
  },
}
