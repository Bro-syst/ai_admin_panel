import { apiClient } from '@/core/api/apiClient'

const ADMIN_USERS_PREFIX = '/api/admin/v1/admins'

export type AdminUserStatus = 'active' | 'inactive' | string

export type AdminUser = {
  id: string
  email: string
  displayName: string | null
  tenantId: string
  role: string
  status: AdminUserStatus
  passwordSetupRequired: boolean
  inviteStatus: string
  totpEnabled: boolean
  createdAt: string
  updatedAt: string
}

export type CreateAdminUserInput = {
  email: string
  role: string
  displayName?: string
  tenantId?: string
}

export type AdminUserMutationResult = {
  status: string
  admin: AdminUser
  delivery: {
    deliveryId: string
    destination: string
  } | null
  invalidatedTokens: number
  revokedSessions: number
  revokedRefreshTokens: number
}

type AdminUserPayload = {
  id?: string
  email?: string
  display_name?: string | null
  tenant_id?: string
  role?: string
  status?: string
  password_setup_required?: boolean
  invite_status?: string
  totp_enabled?: boolean
  created_at?: string
  updated_at?: string
}

type AdminUsersListEnvelope = {
  admins?: AdminUserPayload[]
}

type AdminUserMutationEnvelope = {
  status?: string
  admin?: AdminUserPayload
  delivery?: {
    delivery_id?: string
    destination?: string
  } | null
  invalidated_tokens?: number
  revoked_sessions?: number
  revoked_refresh_tokens?: number
}

function readRequiredString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid admin users response: ${field}`)
  }

  return value
}

function mapAdminUser(payload: AdminUserPayload): AdminUser {
  return {
    id: readRequiredString(payload.id, 'id'),
    email: readRequiredString(payload.email, 'email'),
    displayName: typeof payload.display_name === 'string' && payload.display_name.trim() ? payload.display_name : null,
    tenantId: readRequiredString(payload.tenant_id, 'tenant_id'),
    role: readRequiredString(payload.role, 'role'),
    status: readRequiredString(payload.status, 'status'),
    passwordSetupRequired: payload.password_setup_required === true,
    inviteStatus: readRequiredString(payload.invite_status, 'invite_status'),
    totpEnabled: payload.totp_enabled === true,
    createdAt: readRequiredString(payload.created_at, 'created_at'),
    updatedAt: readRequiredString(payload.updated_at, 'updated_at'),
  }
}

function mapMutationResult(payload: AdminUserMutationEnvelope): AdminUserMutationResult {
  if (!payload.admin) {
    throw new Error('Invalid admin users response: admin')
  }

  return {
    status: readRequiredString(payload.status, 'status'),
    admin: mapAdminUser(payload.admin),
    delivery: payload.delivery
      ? {
          deliveryId: readRequiredString(payload.delivery.delivery_id, 'delivery_id'),
          destination: readRequiredString(payload.delivery.destination, 'destination'),
        }
      : null,
    invalidatedTokens: Number(payload.invalidated_tokens ?? 0),
    revokedSessions: Number(payload.revoked_sessions ?? 0),
    revokedRefreshTokens: Number(payload.revoked_refresh_tokens ?? 0),
  }
}

function buildCreateAdminPayload(input: CreateAdminUserInput) {
  return {
    email: input.email.trim(),
    role: input.role,
    ...(input.displayName?.trim() ? { display_name: input.displayName.trim() } : {}),
    ...(input.tenantId?.trim() ? { tenant_id: input.tenantId.trim() } : {}),
  }
}

export const adminUsersApi = {
  async listAdmins(): Promise<AdminUser[]> {
    const response = await apiClient.get<AdminUsersListEnvelope>(ADMIN_USERS_PREFIX)
    return Array.isArray(response.data?.admins) ? response.data.admins.map(mapAdminUser) : []
  },

  async getAdmin(adminId: string): Promise<AdminUser> {
    const response = await apiClient.get<AdminUserPayload>(`${ADMIN_USERS_PREFIX}/${adminId}`)
    return mapAdminUser(response.data)
  },

  async createAdmin(input: CreateAdminUserInput): Promise<AdminUserMutationResult> {
    const response = await apiClient.post<AdminUserMutationEnvelope>(ADMIN_USERS_PREFIX, buildCreateAdminPayload(input))
    return mapMutationResult(response.data)
  },

  async resendInvite(adminId: string): Promise<AdminUserMutationResult> {
    const response = await apiClient.post<AdminUserMutationEnvelope>(`${ADMIN_USERS_PREFIX}/${adminId}/resend-invite`, {})
    return mapMutationResult(response.data)
  },

  async disableAdmin(adminId: string): Promise<AdminUserMutationResult> {
    const response = await apiClient.post<AdminUserMutationEnvelope>(`${ADMIN_USERS_PREFIX}/${adminId}/disable`, {})
    return mapMutationResult(response.data)
  },

  async enableAdmin(adminId: string): Promise<AdminUserMutationResult> {
    const response = await apiClient.post<AdminUserMutationEnvelope>(`${ADMIN_USERS_PREFIX}/${adminId}/enable`, {})
    return mapMutationResult(response.data)
  },

  async revokeSessions(adminId: string): Promise<AdminUserMutationResult> {
    const response = await apiClient.post<AdminUserMutationEnvelope>(`${ADMIN_USERS_PREFIX}/${adminId}/revoke-sessions`, {})
    return mapMutationResult(response.data)
  },
}
