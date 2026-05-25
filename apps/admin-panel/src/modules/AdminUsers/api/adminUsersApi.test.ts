import { describe, expect, it, beforeEach, vi } from 'vitest'
import { apiClient } from '@/core/api/apiClient'
import { adminUsersApi } from '@/modules/AdminUsers/api/adminUsersApi'

vi.mock('@/core/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

const getMock = apiClient.get as unknown as ReturnType<typeof vi.fn>
const postMock = apiClient.post as unknown as ReturnType<typeof vi.fn>

const adminPayload = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'ops@example.com',
  display_name: 'Ops Admin',
  tenant_id: '22222222-2222-4222-8222-222222222222',
  role: 'platform_operator',
  status: 'active',
  password_setup_required: true,
  invite_status: 'pending',
  totp_enabled: false,
  created_at: '2026-05-12T10:00:00Z',
  updated_at: '2026-05-12T10:00:00Z',
}

describe('adminUsersApi', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
  })

  it('lists admins through the real admin users endpoint and maps safe fields', async () => {
    getMock.mockResolvedValue({ data: { admins: [adminPayload] } })

    await expect(adminUsersApi.listAdmins()).resolves.toEqual([
      {
        id: adminPayload.id,
        email: adminPayload.email,
        displayName: adminPayload.display_name,
        tenantId: adminPayload.tenant_id,
        role: adminPayload.role,
        status: adminPayload.status,
        passwordSetupRequired: true,
        inviteStatus: adminPayload.invite_status,
        totpEnabled: false,
        createdAt: adminPayload.created_at,
        updatedAt: adminPayload.updated_at,
      },
    ])

    expect(getMock).toHaveBeenCalledWith('/api/admin/v1/admins')
  })

  it('loads safe admin detail by id', async () => {
    getMock.mockResolvedValue({ data: adminPayload })

    await adminUsersApi.getAdmin(adminPayload.id)

    expect(getMock).toHaveBeenCalledWith(`/api/admin/v1/admins/${adminPayload.id}`)
  })

  it('creates an invited admin with the backend request fields', async () => {
    postMock.mockResolvedValue({
      data: {
        status: 'created',
        admin: adminPayload,
        delivery: { delivery_id: 'delivery_1', destination: 'ops@example.com' },
        invalidated_tokens: 1,
      },
    })

    const result = await adminUsersApi.createAdmin({
      email: ' ops@example.com ',
      displayName: ' Ops Admin ',
      role: 'platform_operator',
      tenantId: '',
    })

    expect(postMock).toHaveBeenCalledWith('/api/admin/v1/admins', {
      email: 'ops@example.com',
      display_name: 'Ops Admin',
      role: 'platform_operator',
    })
    expect(result.delivery).toEqual({ deliveryId: 'delivery_1', destination: 'ops@example.com' })
  })

  it('calls each mutating lifecycle endpoint with an empty body for CSRF-protected actions', async () => {
    postMock.mockResolvedValue({ data: { status: 'ok', admin: adminPayload } })

    await adminUsersApi.resendInvite(adminPayload.id)
    await adminUsersApi.disableAdmin(adminPayload.id)
    await adminUsersApi.enableAdmin(adminPayload.id)
    await adminUsersApi.revokeSessions(adminPayload.id)

    expect(postMock).toHaveBeenNthCalledWith(1, `/api/admin/v1/admins/${adminPayload.id}/resend-invite`, {})
    expect(postMock).toHaveBeenNthCalledWith(2, `/api/admin/v1/admins/${adminPayload.id}/disable`, {})
    expect(postMock).toHaveBeenNthCalledWith(3, `/api/admin/v1/admins/${adminPayload.id}/enable`, {})
    expect(postMock).toHaveBeenNthCalledWith(4, `/api/admin/v1/admins/${adminPayload.id}/revoke-sessions`, {})
  })
})
