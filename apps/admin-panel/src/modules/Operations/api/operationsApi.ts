import { apiClient } from '@/core/api/apiClient'

const SYSTEM_PREFIX = '/api/admin/v1/system'
const PORTAL_PREFIX = '/api/admin/v1/system/portal'

export type PlatformSettings = {
  appName: string
  appVersion: string
  environment: string
  apiPrefix: string
  debugEnabled: boolean
  logLevel: string
  healthcheckTimeoutSeconds: number
  redisEnabled: boolean
}

export type PortalDashboard = {
  generatedAt: string
  tenantSummary: {
    totalTenants: number
    activeTenants: number
    blockedTenants: number
    failedProvisioningTenants: number
  }
  agentSummary: {
    totalAgents: number
    activeAgents: number
    releaseReadyAgents: number
    blockedAgents: number
  }
  runtimeSummary: {
    totalChats: number
    activeChats: number
    recentRuntimeDegradationCount: number
    recentFailedTurnCount: number
  }
  releaseSummary: {
    ownerStage: string
    releaseWorkflowStatus: string
    readyAgentCount: number
    blockingAgentCount: number
  }
  billingExportSummary: {
    ownerStage: string
    exportStatus: string
    exportedTenantCount: number
    blockedTenantCount: number
  }
}

export type PortalOperationsSummary = {
  generatedAt: string
  failedProvisioningTenants: number
  inactiveTenants: number
  degradedAgents: number
  readyPublicWidgetBindings: number
  outstandingSetupBlockers: number
  resultClassification: string
}

type PlatformSettingsPayload = {
  app_name?: string
  app_version?: string
  environment?: string
  api_prefix?: string
  debug_enabled?: boolean
  log_level?: string
  healthcheck_timeout_seconds?: number
  redis_enabled?: boolean
}

type PortalDashboardPayload = {
  generated_at?: string
  tenant_summary?: {
    total_tenants?: number
    active_tenants?: number
    blocked_tenants?: number
    failed_provisioning_tenants?: number
  }
  agent_summary?: {
    total_agents?: number
    active_agents?: number
    release_ready_agents?: number
    blocked_agents?: number
  }
  runtime_summary?: {
    total_chats?: number
    active_chats?: number
    recent_runtime_degradation_count?: number
    recent_failed_turn_count?: number
  }
  release_summary?: {
    owner_stage?: string
    release_workflow_status?: string
    ready_agent_count?: number
    blocking_agent_count?: number
  }
  billing_export_summary?: {
    owner_stage?: string
    export_status?: string
    exported_tenant_count?: number
    blocked_tenant_count?: number
  }
}

type PortalOperationsPayload = {
  generated_at?: string
  failed_provisioning_tenants?: number
  inactive_tenants?: number
  degraded_agents?: number
  ready_public_widget_bindings?: number
  outstanding_setup_blockers?: number
  result_classification?: string
}

function readString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid operations response: ${field}`)
  }

  return value
}

function readNumber(value: unknown, field: string) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Invalid operations response: ${field}`)
  }

  return value
}

function mapPlatformSettings(payload: PlatformSettingsPayload): PlatformSettings {
  return {
    appName: readString(payload.app_name, 'app_name'),
    appVersion: readString(payload.app_version, 'app_version'),
    environment: readString(payload.environment, 'environment'),
    apiPrefix: readString(payload.api_prefix, 'api_prefix'),
    debugEnabled: payload.debug_enabled === true,
    logLevel: readString(payload.log_level, 'log_level'),
    healthcheckTimeoutSeconds: readNumber(payload.healthcheck_timeout_seconds, 'healthcheck_timeout_seconds'),
    redisEnabled: payload.redis_enabled === true,
  }
}

function mapDashboard(payload: PortalDashboardPayload): PortalDashboard {
  if (
    !payload.tenant_summary ||
    !payload.agent_summary ||
    !payload.runtime_summary ||
    !payload.release_summary ||
    !payload.billing_export_summary
  ) {
    throw new Error('Invalid operations response: dashboard')
  }

  return {
    generatedAt: readString(payload.generated_at, 'generated_at'),
    tenantSummary: {
      totalTenants: readNumber(payload.tenant_summary.total_tenants, 'tenant_summary.total_tenants'),
      activeTenants: readNumber(payload.tenant_summary.active_tenants, 'tenant_summary.active_tenants'),
      blockedTenants: readNumber(payload.tenant_summary.blocked_tenants, 'tenant_summary.blocked_tenants'),
      failedProvisioningTenants: readNumber(
        payload.tenant_summary.failed_provisioning_tenants,
        'tenant_summary.failed_provisioning_tenants',
      ),
    },
    agentSummary: {
      totalAgents: readNumber(payload.agent_summary.total_agents, 'agent_summary.total_agents'),
      activeAgents: readNumber(payload.agent_summary.active_agents, 'agent_summary.active_agents'),
      releaseReadyAgents: readNumber(payload.agent_summary.release_ready_agents, 'agent_summary.release_ready_agents'),
      blockedAgents: readNumber(payload.agent_summary.blocked_agents, 'agent_summary.blocked_agents'),
    },
    runtimeSummary: {
      totalChats: readNumber(payload.runtime_summary.total_chats, 'runtime_summary.total_chats'),
      activeChats: readNumber(payload.runtime_summary.active_chats, 'runtime_summary.active_chats'),
      recentRuntimeDegradationCount: readNumber(
        payload.runtime_summary.recent_runtime_degradation_count,
        'runtime_summary.recent_runtime_degradation_count',
      ),
      recentFailedTurnCount: readNumber(
        payload.runtime_summary.recent_failed_turn_count,
        'runtime_summary.recent_failed_turn_count',
      ),
    },
    releaseSummary: {
      ownerStage: readString(payload.release_summary.owner_stage, 'release_summary.owner_stage'),
      releaseWorkflowStatus: readString(payload.release_summary.release_workflow_status, 'release_summary.release_workflow_status'),
      readyAgentCount: readNumber(payload.release_summary.ready_agent_count, 'release_summary.ready_agent_count'),
      blockingAgentCount: readNumber(payload.release_summary.blocking_agent_count, 'release_summary.blocking_agent_count'),
    },
    billingExportSummary: {
      ownerStage: readString(payload.billing_export_summary.owner_stage, 'billing_export_summary.owner_stage'),
      exportStatus: readString(payload.billing_export_summary.export_status, 'billing_export_summary.export_status'),
      exportedTenantCount: readNumber(payload.billing_export_summary.exported_tenant_count, 'billing_export_summary.exported_tenant_count'),
      blockedTenantCount: readNumber(payload.billing_export_summary.blocked_tenant_count, 'billing_export_summary.blocked_tenant_count'),
    },
  }
}

function mapOperations(payload: PortalOperationsPayload): PortalOperationsSummary {
  return {
    generatedAt: readString(payload.generated_at, 'generated_at'),
    failedProvisioningTenants: readNumber(payload.failed_provisioning_tenants, 'failed_provisioning_tenants'),
    inactiveTenants: readNumber(payload.inactive_tenants, 'inactive_tenants'),
    degradedAgents: readNumber(payload.degraded_agents, 'degraded_agents'),
    readyPublicWidgetBindings: readNumber(payload.ready_public_widget_bindings, 'ready_public_widget_bindings'),
    outstandingSetupBlockers: readNumber(payload.outstanding_setup_blockers, 'outstanding_setup_blockers'),
    resultClassification: readString(payload.result_classification, 'result_classification'),
  }
}

export const operationsApi = {
  async getPlatformSettings(): Promise<PlatformSettings> {
    const response = await apiClient.get<PlatformSettingsPayload>(`${SYSTEM_PREFIX}/platform-settings`)
    return mapPlatformSettings(response.data)
  },

  async getDashboard(): Promise<PortalDashboard> {
    const response = await apiClient.get<PortalDashboardPayload>(`${PORTAL_PREFIX}/dashboard`)
    return mapDashboard(response.data)
  },

  async getOperations(): Promise<PortalOperationsSummary> {
    const response = await apiClient.get<PortalOperationsPayload>(`${PORTAL_PREFIX}/operations`)
    return mapOperations(response.data)
  },
}
