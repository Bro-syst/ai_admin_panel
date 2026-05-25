import { apiClient } from '@/core/api/apiClient'

const PORTAL_TENANTS_PREFIX = '/api/admin/v1/system/portal/tenants'
const SYSTEM_TENANTS_PREFIX = '/api/admin/v1/system/tenants'
const TENANTS_PREFIX = '/api/admin/v1/tenants'

export type TenantCard = {
  tenantId: string
  tenantName: string
  tenantStatus: string
  provisioningStatus: string
  externalCustomerRef: string | null
  externalBillingRefPresent: boolean
  downstreamAvailable: boolean
  configurationPresent: boolean
  lastUpdatedAt: string
  detailRoute: string
}

export type TenantListMetadata = {
  page: number
  pageSize: number
  totalItems: number
  returnedItems: number
  ordering: string
}

export type TenantListFilters = {
  search?: string
  tenantStatus?: string
  provisioningStatus?: string
  page?: number
  pageSize?: number
}

export type TenantConfigurationSummary = {
  defaultLocale: string | null
  timezone: string | null
  backgroundProcessingEnabled: boolean
  maxAgents: number | null
  maxWidgets: number | null
  maxMonthlyModelRequests: number | null
  widgetAccessEnabled: boolean
  handoffEnabled: boolean
  fallbackAllowed: boolean
  integrationEnabled: boolean
  allowedActionClasses: string[]
  defaultProviderId: string | null
  defaultModelId: string | null
  defaultModelFamily: string | null
}

export type TenantProvisioningAudit = {
  action: string
  result: string
  actorType: string | null
  correlationId: string | null
  provisioningStatus: string
  changedStateSummary: Record<string, unknown>
}

export type TenantDetail = {
  tenant: TenantCard
  provisioningAudit: TenantProvisioningAudit | null
  configurationSummary: TenantConfigurationSummary | null
  supportedMutationActions: string[]
}

export type TenantProvisioningBinding = {
  id: string
  tenantId: string
  externalCustomerRef: string
  externalBillingRef: string | null
  provisioningSource: string
  provisioningCorrelationId: string
  provisioningStatus: string
  updatedAt: string
}

export type TenantProvisioningSnapshot = {
  tenant: {
    id: string
    name: string
    status: string
  }
  binding: TenantProvisioningBinding
  replayClassification: string
  idempotencyKey: string
  idempotencyResult: string
  downstreamAvailability: {
    available: boolean
    signal: string
    tenantStatus: string
    provisioningStatus: string
  }
}

export type TenantProvisioningAuditSummary = {
  tenantId: string
  action: string
  result: string
  actorId: string | null
  actorType: string | null
  correlationId: string
  provisioningStatus: string
  downstreamAvailability: TenantProvisioningSnapshot['downstreamAvailability']
  changedStateSummary: Record<string, unknown>
}

export type TenantConfiguration = {
  id: string
  tenantId: string
  payload: Record<string, unknown>
}

export type TenantMutationResult = {
  action: string
  resourceType: string
  resourceId: string | null
  correlationId: string | null
  mutationTimestamp: string
}

export type ProvisionTenantInput = {
  tenantName: string
  externalCustomerRef: string
  externalBillingRef?: string
  provisioningCorrelationId: string
  idempotencyKey: string
}

type TenantCardPayload = {
  tenant_id?: string
  tenant_name?: string
  tenant_status?: string
  provisioning_status?: string
  external_customer_ref?: string | null
  external_billing_ref_present?: boolean
  downstream_available?: boolean
  configuration_present?: boolean
  last_updated_at?: string
  detail_route?: string
}

type TenantListResponsePayload = {
  items?: TenantCardPayload[]
  metadata?: {
    page?: number
    page_size?: number
    total_items?: number
    returned_items?: number
    ordering?: string
  }
}

type ConfigurationSummaryPayload = {
  default_locale?: string | null
  timezone?: string | null
  background_processing_enabled?: boolean
  max_agents?: number | null
  max_widgets?: number | null
  max_monthly_model_requests?: number | null
  widget_access_enabled?: boolean
  handoff_enabled?: boolean
  fallback_allowed?: boolean
  integration_enabled?: boolean
  allowed_action_classes?: string[]
  default_provider_id?: string | null
  default_model_id?: string | null
  default_model_family?: string | null
}

type TenantProvisioningAuditPayload = {
  action?: string
  result?: string
  actor_type?: string | null
  correlation_id?: string | null
  provisioning_status?: string
  changed_state_summary?: Record<string, unknown>
}

type TenantDetailPayload = {
  tenant?: TenantCardPayload
  provisioning_audit?: TenantProvisioningAuditPayload | null
  configuration_summary?: ConfigurationSummaryPayload | null
  supported_mutation_actions?: string[]
}

type TenantProvisioningPayload = {
  tenant?: {
    id?: string
    name?: string
    status?: string
  }
  binding?: {
    id?: string
    tenant_id?: string
    external_customer_ref?: string
    external_billing_ref?: string | null
    provisioning_source?: string
    provisioning_correlation_id?: string
    provisioning_status?: string
    updated_at?: string
  }
  replay_classification?: string
  idempotency_key?: string
  idempotency_result?: string
  downstream_availability?: {
    available?: boolean
    signal?: string
    tenant_status?: string
    provisioning_status?: string
  }
}

type TenantProvisioningAuditSummaryPayload = {
  tenant_id?: string
  action?: string
  result?: string
  actor_id?: string | null
  actor_type?: string | null
  correlation_id?: string
  provisioning_status?: string
  downstream_availability?: TenantProvisioningPayload['downstream_availability']
  changed_state_summary?: Record<string, unknown>
}

type TenantConfigurationPayload = {
  id?: string
  tenant_id?: string
  payload?: Record<string, unknown>
}

type MutationResultPayload = {
  action?: string
  resource_type?: string
  resource_id?: string | null
  correlation_id?: string | null
  mutation_timestamp?: string
}

type MutationResponsePayload<TResource> = {
  resource?: TResource
  result?: MutationResultPayload
}

function mapDownstreamAvailability(
  payload: TenantProvisioningPayload['downstream_availability'],
): TenantProvisioningSnapshot['downstreamAvailability'] {
  if (!payload) throw new Error('Invalid tenants response: downstream_availability')

  return {
    available: payload.available === true,
    signal: readString(payload.signal, 'downstream_availability.signal'),
    tenantStatus: readString(payload.tenant_status, 'downstream_availability.tenant_status'),
    provisioningStatus: readString(payload.provisioning_status, 'downstream_availability.provisioning_status'),
  }
}

function readString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid tenants response: ${field}`)
  }

  return value
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null
}

function mapTenantCard(payload: TenantCardPayload): TenantCard {
  return {
    tenantId: readString(payload.tenant_id, 'tenant_id'),
    tenantName: readString(payload.tenant_name, 'tenant_name'),
    tenantStatus: readString(payload.tenant_status, 'tenant_status'),
    provisioningStatus: readString(payload.provisioning_status, 'provisioning_status'),
    externalCustomerRef: optionalString(payload.external_customer_ref),
    externalBillingRefPresent: payload.external_billing_ref_present === true,
    downstreamAvailable: payload.downstream_available === true,
    configurationPresent: payload.configuration_present === true,
    lastUpdatedAt: readString(payload.last_updated_at, 'last_updated_at'),
    detailRoute: readString(payload.detail_route, 'detail_route'),
  }
}

function mapConfigurationSummary(payload: ConfigurationSummaryPayload): TenantConfigurationSummary {
  return {
    defaultLocale: optionalString(payload.default_locale),
    timezone: optionalString(payload.timezone),
    backgroundProcessingEnabled: payload.background_processing_enabled === true,
    maxAgents: typeof payload.max_agents === 'number' ? payload.max_agents : null,
    maxWidgets: typeof payload.max_widgets === 'number' ? payload.max_widgets : null,
    maxMonthlyModelRequests: typeof payload.max_monthly_model_requests === 'number' ? payload.max_monthly_model_requests : null,
    widgetAccessEnabled: payload.widget_access_enabled === true,
    handoffEnabled: payload.handoff_enabled === true,
    fallbackAllowed: payload.fallback_allowed === true,
    integrationEnabled: payload.integration_enabled === true,
    allowedActionClasses: Array.isArray(payload.allowed_action_classes) ? payload.allowed_action_classes.filter((item): item is string => typeof item === 'string') : [],
    defaultProviderId: optionalString(payload.default_provider_id),
    defaultModelId: optionalString(payload.default_model_id),
    defaultModelFamily: optionalString(payload.default_model_family),
  }
}

function mapProvisioningAudit(payload: TenantProvisioningAuditPayload): TenantProvisioningAudit {
  return {
    action: readString(payload.action, 'action'),
    result: readString(payload.result, 'result'),
    actorType: optionalString(payload.actor_type),
    correlationId: optionalString(payload.correlation_id),
    provisioningStatus: readString(payload.provisioning_status, 'provisioning_status'),
    changedStateSummary: payload.changed_state_summary ?? {},
  }
}

function mapTenantDetail(payload: TenantDetailPayload): TenantDetail {
  if (!payload.tenant) throw new Error('Invalid tenants response: tenant')

  return {
    tenant: mapTenantCard(payload.tenant),
    provisioningAudit: payload.provisioning_audit ? mapProvisioningAudit(payload.provisioning_audit) : null,
    configurationSummary: payload.configuration_summary ? mapConfigurationSummary(payload.configuration_summary) : null,
    supportedMutationActions: Array.isArray(payload.supported_mutation_actions)
      ? payload.supported_mutation_actions.filter((item): item is string => typeof item === 'string')
      : [],
  }
}

function mapProvisioning(payload: TenantProvisioningPayload): TenantProvisioningSnapshot {
  if (!payload.tenant || !payload.binding || !payload.downstream_availability) {
    throw new Error('Invalid tenants response: provisioning')
  }

  return {
    tenant: {
      id: readString(payload.tenant.id, 'tenant.id'),
      name: readString(payload.tenant.name, 'tenant.name'),
      status: readString(payload.tenant.status, 'tenant.status'),
    },
    binding: {
      id: readString(payload.binding.id, 'binding.id'),
      tenantId: readString(payload.binding.tenant_id, 'binding.tenant_id'),
      externalCustomerRef: readString(payload.binding.external_customer_ref, 'binding.external_customer_ref'),
      externalBillingRef: optionalString(payload.binding.external_billing_ref),
      provisioningSource: readString(payload.binding.provisioning_source, 'binding.provisioning_source'),
      provisioningCorrelationId: readString(payload.binding.provisioning_correlation_id, 'binding.provisioning_correlation_id'),
      provisioningStatus: readString(payload.binding.provisioning_status, 'binding.provisioning_status'),
      updatedAt: readString(payload.binding.updated_at, 'binding.updated_at'),
    },
    replayClassification: readString(payload.replay_classification, 'replay_classification'),
    idempotencyKey: readString(payload.idempotency_key, 'idempotency_key'),
    idempotencyResult: readString(payload.idempotency_result, 'idempotency_result'),
    downstreamAvailability: mapDownstreamAvailability(payload.downstream_availability),
  }
}

function mapAuditSummary(payload: TenantProvisioningAuditSummaryPayload): TenantProvisioningAuditSummary {
  return {
    tenantId: readString(payload.tenant_id, 'tenant_id'),
    action: readString(payload.action, 'action'),
    result: readString(payload.result, 'result'),
    actorId: optionalString(payload.actor_id),
    actorType: optionalString(payload.actor_type),
    correlationId: readString(payload.correlation_id, 'correlation_id'),
    provisioningStatus: readString(payload.provisioning_status, 'provisioning_status'),
    downstreamAvailability: mapDownstreamAvailability(payload.downstream_availability),
    changedStateSummary: payload.changed_state_summary ?? {},
  }
}

function mapConfiguration(payload: TenantConfigurationPayload): TenantConfiguration {
  return {
    id: readString(payload.id, 'id'),
    tenantId: readString(payload.tenant_id, 'tenant_id'),
    payload: payload.payload ?? {},
  }
}

function mapMutationResult(payload: MutationResultPayload | undefined): TenantMutationResult {
  return {
    action: readString(payload?.action, 'result.action'),
    resourceType: readString(payload?.resource_type, 'result.resource_type'),
    resourceId: optionalString(payload?.resource_id),
    correlationId: optionalString(payload?.correlation_id),
    mutationTimestamp: readString(payload?.mutation_timestamp, 'result.mutation_timestamp'),
  }
}

function buildListParams(filters: TenantListFilters) {
  return {
    ...(filters.search?.trim() ? { search: filters.search.trim() } : {}),
    ...(filters.tenantStatus && filters.tenantStatus !== 'all' ? { tenant_status: filters.tenantStatus } : {}),
    ...(filters.provisioningStatus && filters.provisioningStatus !== 'all' ? { provisioning_status: filters.provisioningStatus } : {}),
    page: filters.page ?? 1,
    page_size: filters.pageSize ?? 20,
  }
}

function buildProvisioningPayload(input: ProvisionTenantInput) {
  return {
    tenant_name: input.tenantName.trim(),
    external_customer_ref: input.externalCustomerRef.trim(),
    ...(input.externalBillingRef?.trim() ? { external_billing_ref: input.externalBillingRef.trim() } : {}),
    provisioning_source: 'admin_portal',
    provisioning_correlation_id: input.provisioningCorrelationId,
    idempotency_key: input.idempotencyKey,
    requested_status: 'active',
  }
}

export const tenantsApi = {
  async listTenants(filters: TenantListFilters = {}): Promise<{ items: TenantCard[]; metadata: TenantListMetadata }> {
    const response = await apiClient.get<TenantListResponsePayload>(PORTAL_TENANTS_PREFIX, { params: buildListParams(filters) })
    return {
      items: Array.isArray(response.data?.items) ? response.data.items.map(mapTenantCard) : [],
      metadata: {
        page: Number(response.data?.metadata?.page ?? 1),
        pageSize: Number(response.data?.metadata?.page_size ?? 20),
        totalItems: Number(response.data?.metadata?.total_items ?? 0),
        returnedItems: Number(response.data?.metadata?.returned_items ?? 0),
        ordering: String(response.data?.metadata?.ordering ?? ''),
      },
    }
  },

  async getTenantDetail(tenantId: string): Promise<TenantDetail> {
    const response = await apiClient.get<TenantDetailPayload>(`${PORTAL_TENANTS_PREFIX}/${tenantId}`)
    return mapTenantDetail(response.data)
  },

  async provisionTenant(input: ProvisionTenantInput): Promise<{ resource: TenantProvisioningSnapshot; result: TenantMutationResult }> {
    const response = await apiClient.post<MutationResponsePayload<TenantProvisioningPayload>>(
      `${SYSTEM_TENANTS_PREFIX}/provisioning`,
      buildProvisioningPayload(input),
      { headers: { 'X-Request-ID': input.provisioningCorrelationId } },
    )
    return { resource: mapProvisioning(response.data.resource ?? {}), result: mapMutationResult(response.data.result) }
  },

  async getProvisioning(tenantId: string): Promise<TenantProvisioningSnapshot> {
    const response = await apiClient.get<TenantProvisioningPayload>(`${TENANTS_PREFIX}/${tenantId}/provisioning`)
    return mapProvisioning(response.data)
  },

  async getProvisioningAuditSummary(tenantId: string): Promise<TenantProvisioningAuditSummary> {
    const response = await apiClient.get<TenantProvisioningAuditSummaryPayload>(`${TENANTS_PREFIX}/${tenantId}/provisioning/audit-summary`)
    return mapAuditSummary(response.data)
  },

  async updateProvisioningMetadata(tenantId: string, externalBillingRef: string | null): Promise<{ resource: TenantProvisioningSnapshot; result: TenantMutationResult }> {
    const response = await apiClient.patch<MutationResponsePayload<TenantProvisioningPayload>>(
      `${SYSTEM_TENANTS_PREFIX}/${tenantId}/provisioning/metadata`,
      { external_billing_ref: externalBillingRef },
    )
    return { resource: mapProvisioning(response.data.resource ?? {}), result: mapMutationResult(response.data.result) }
  },

  async changeProvisioningStatus(tenantId: string, status: string): Promise<{ resource: TenantProvisioningSnapshot; result: TenantMutationResult }> {
    const response = await apiClient.patch<MutationResponsePayload<TenantProvisioningPayload>>(
      `${SYSTEM_TENANTS_PREFIX}/${tenantId}/provisioning/status`,
      { status },
    )
    return { resource: mapProvisioning(response.data.resource ?? {}), result: mapMutationResult(response.data.result) }
  },

  async changeTenantStatus(tenantId: string, status: string): Promise<TenantMutationResult> {
    const response = await apiClient.patch<MutationResponsePayload<unknown>>(`${SYSTEM_TENANTS_PREFIX}/${tenantId}/status`, { status })
    return mapMutationResult(response.data.result)
  },

  async provisionDefaultConfiguration(tenantId: string): Promise<{ resource: TenantConfiguration; result: TenantMutationResult }> {
    const response = await apiClient.post<MutationResponsePayload<TenantConfigurationPayload>>(
      `${SYSTEM_TENANTS_PREFIX}/${tenantId}/configuration/provision-default`,
      {},
    )
    return { resource: mapConfiguration(response.data.resource ?? {}), result: mapMutationResult(response.data.result) }
  },

  async getConfiguration(tenantId: string): Promise<TenantConfiguration> {
    const response = await apiClient.get<TenantConfigurationPayload>(`${TENANTS_PREFIX}/${tenantId}/configuration`)
    return mapConfiguration(response.data)
  },

  async updateConfiguration(tenantId: string, payload: Record<string, unknown>): Promise<{ resource: TenantConfiguration; result: TenantMutationResult }> {
    const response = await apiClient.put<MutationResponsePayload<TenantConfigurationPayload>>(`${TENANTS_PREFIX}/${tenantId}/configuration`, payload)
    return { resource: mapConfiguration(response.data.resource ?? {}), result: mapMutationResult(response.data.result) }
  },
}
