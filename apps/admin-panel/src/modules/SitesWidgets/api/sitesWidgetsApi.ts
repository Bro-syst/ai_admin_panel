import { apiClient } from '@/core/api/apiClient'

const ADMIN_PREFIX = '/api/admin/v1'
const PORTAL_PREFIX = `${ADMIN_PREFIX}/portal`

export type MutationResult = {
  action: string
  resourceType: string
  resourceId: string | null
  actorId: string | null
  actorType: string | null
  tenantId: string | null
  correlationId: string | null
  mutationTimestamp: string
  changedStateSummary: Record<string, unknown>
}

export type Site = {
  id: string
  tenantId: string
  hostname: string
  externalAllowedOrigins: string[]
  status: string
}

export type Widget = {
  id: string
  tenantId: string
  siteId: string
  agentId: string
  widgetKey: string
  status: string
}

export type SiteWidgetBindingStatus = {
  siteId: string
  widgetId: string
  siteHostname: string
  widgetKey: string
  siteStatus: string
  widgetStatus: string
  allowedOriginsCount: number
  ready: boolean
  issues: string[]
}

export type SitesWidgetsStatus = {
  agentId: string
  readinessStatus: string
  publicChannelRequired: boolean
  publicChannelInUse: boolean
  bindings: SiteWidgetBindingStatus[]
  totalSites: number
  totalWidgets: number
  issues: string[]
}

export type SiteCreateInput = {
  hostname: string
  externalAllowedOrigins: string[]
}

export type WidgetCreateInput = {
  siteId: string
  agentId: string
  widgetKey: string
}

export type SiteMutationResponse = {
  resource: Site
  result: MutationResult
}

export type WidgetMutationResponse = {
  resource: Widget
  result: MutationResult
}

type SitePayload = {
  id?: string
  tenant_id?: string
  hostname?: string
  external_allowed_origins?: string[]
  status?: string
}

type WidgetPayload = {
  id?: string
  tenant_id?: string
  site_id?: string
  agent_id?: string
  widget_key?: string
  status?: string
}

type BindingStatusPayload = {
  site_id?: string
  widget_id?: string
  site_hostname?: string
  widget_key?: string
  site_status?: string
  widget_status?: string
  allowed_origins_count?: number
  ready?: boolean
  issues?: string[]
}

type SitesWidgetsStatusPayload = {
  agent_id?: string
  readiness_status?: string
  public_channel_required?: boolean
  public_channel_in_use?: boolean
  bindings?: BindingStatusPayload[]
  total_sites?: number
  total_widgets?: number
  issues?: string[]
}

type MutationResultPayload = {
  action?: string
  resource_type?: string
  resource_id?: string | null
  actor_id?: string | null
  actor_type?: string | null
  tenant_id?: string | null
  correlation_id?: string | null
  mutation_timestamp?: string
  changed_state_summary?: Record<string, unknown>
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

function readNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' ? value : fallback
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function mapMutationResult(payload: MutationResultPayload = {}): MutationResult {
  return {
    action: readString(payload.action),
    resourceType: readString(payload.resource_type),
    resourceId: readNullableString(payload.resource_id),
    actorId: readNullableString(payload.actor_id),
    actorType: readNullableString(payload.actor_type),
    tenantId: readNullableString(payload.tenant_id),
    correlationId: readNullableString(payload.correlation_id),
    mutationTimestamp: readString(payload.mutation_timestamp),
    changedStateSummary: payload.changed_state_summary ?? {},
  }
}

export function mapSite(payload: SitePayload = {}): Site {
  return {
    id: readString(payload.id),
    tenantId: readString(payload.tenant_id),
    hostname: readString(payload.hostname),
    externalAllowedOrigins: readStringArray(payload.external_allowed_origins),
    status: readString(payload.status),
  }
}

export function mapWidget(payload: WidgetPayload = {}): Widget {
  return {
    id: readString(payload.id),
    tenantId: readString(payload.tenant_id),
    siteId: readString(payload.site_id),
    agentId: readString(payload.agent_id),
    widgetKey: readString(payload.widget_key),
    status: readString(payload.status),
  }
}

function mapBindingStatus(payload: BindingStatusPayload = {}): SiteWidgetBindingStatus {
  return {
    siteId: readString(payload.site_id),
    widgetId: readString(payload.widget_id),
    siteHostname: readString(payload.site_hostname),
    widgetKey: readString(payload.widget_key),
    siteStatus: readString(payload.site_status),
    widgetStatus: readString(payload.widget_status),
    allowedOriginsCount: readNumber(payload.allowed_origins_count),
    ready: readBoolean(payload.ready),
    issues: readStringArray(payload.issues),
  }
}

export function mapSitesWidgetsStatus(payload: SitesWidgetsStatusPayload = {}): SitesWidgetsStatus {
  return {
    agentId: readString(payload.agent_id),
    readinessStatus: readString(payload.readiness_status),
    publicChannelRequired: readBoolean(payload.public_channel_required),
    publicChannelInUse: readBoolean(payload.public_channel_in_use),
    bindings: payload.bindings?.map(mapBindingStatus) ?? [],
    totalSites: readNumber(payload.total_sites),
    totalWidgets: readNumber(payload.total_widgets),
    issues: readStringArray(payload.issues),
  }
}

export const sitesWidgetsApi = {
  async getStatus(tenantId: string, agentId: string): Promise<SitesWidgetsStatus> {
    const response = await apiClient.get<SitesWidgetsStatusPayload>(`${PORTAL_PREFIX}/tenants/${tenantId}/agents/${agentId}/sites-widgets`)
    return mapSitesWidgetsStatus(response.data)
  },

  async listSites(tenantId: string): Promise<Site[]> {
    const response = await apiClient.get<{ items?: SitePayload[] }>(`${ADMIN_PREFIX}/tenants/${tenantId}/sites`)
    return response.data.items?.map(mapSite) ?? []
  },

  async createSite(tenantId: string, input: SiteCreateInput): Promise<SiteMutationResponse> {
    const response = await apiClient.post<{ resource?: SitePayload; result?: MutationResultPayload }>(`${ADMIN_PREFIX}/tenants/${tenantId}/sites`, {
      hostname: input.hostname,
      external_allowed_origins: input.externalAllowedOrigins,
    })
    return {
      resource: mapSite(response.data.resource),
      result: mapMutationResult(response.data.result),
    }
  },

  async changeSiteStatus(tenantId: string, siteId: string, status: string): Promise<SiteMutationResponse> {
    const response = await apiClient.patch<{ resource?: SitePayload; result?: MutationResultPayload }>(
      `${ADMIN_PREFIX}/tenants/${tenantId}/sites/${siteId}/status`,
      { status },
    )
    return {
      resource: mapSite(response.data.resource),
      result: mapMutationResult(response.data.result),
    }
  },

  async listWidgets(tenantId: string): Promise<Widget[]> {
    const response = await apiClient.get<{ items?: WidgetPayload[] }>(`${ADMIN_PREFIX}/tenants/${tenantId}/widgets`)
    return response.data.items?.map(mapWidget) ?? []
  },

  async createWidget(tenantId: string, input: WidgetCreateInput): Promise<WidgetMutationResponse> {
    const response = await apiClient.post<{ resource?: WidgetPayload; result?: MutationResultPayload }>(`${ADMIN_PREFIX}/tenants/${tenantId}/widgets`, {
      site_id: input.siteId,
      agent_id: input.agentId,
      widget_key: input.widgetKey,
    })
    return {
      resource: mapWidget(response.data.resource),
      result: mapMutationResult(response.data.result),
    }
  },

  async changeWidgetStatus(tenantId: string, widgetId: string, status: string): Promise<WidgetMutationResponse> {
    const response = await apiClient.patch<{ resource?: WidgetPayload; result?: MutationResultPayload }>(
      `${ADMIN_PREFIX}/tenants/${tenantId}/widgets/${widgetId}/status`,
      { status },
    )
    return {
      resource: mapWidget(response.data.resource),
      result: mapMutationResult(response.data.result),
    }
  },
}
