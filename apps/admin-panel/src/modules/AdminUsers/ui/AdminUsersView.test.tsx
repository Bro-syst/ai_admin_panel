import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import type { AdminUser } from '@/modules/AdminUsers/api/adminUsersApi'
import type { AdminUsersManager } from '@/modules/AdminUsers/model/useAdminUsersManager'
import { AdminUsersView } from '@/modules/AdminUsers/ui/AdminUsersView'

const admin: AdminUser = {
  id: 'admin_1',
  email: 'ops@example.com',
  displayName: 'Ops Admin',
  tenantId: 'tenant_1',
  role: 'platform_operator',
  status: 'active',
  passwordSetupRequired: true,
  inviteStatus: 'pending',
  totpEnabled: false,
  createdAt: '2026-05-12T10:00:00Z',
  updatedAt: '2026-05-12T10:00:00Z',
}

function buildManager(overrides: Partial<AdminUsersManager> = {}): AdminUsersManager {
  return {
    admins: [admin],
    filteredAdmins: [admin],
    selectedAdmin: admin,
    filters: { query: '', role: 'all', status: 'all' },
    createForm: { email: '', displayName: '', role: 'platform_operator', tenantId: '' },
    pendingAction: null,
    roleOptions: ['platform_admin', 'platform_operator', 'platform_viewer'],
    statusOptions: ['active'],
    currentAdminId: 'admin_current',
    canMutate: true,
    isLoading: false,
    isDetailLoading: false,
    isCreating: false,
    isActionSubmitting: false,
    errorMessage: null,
    formError: null,
    notice: null,
    setFilters: vi.fn(),
    updateCreateForm: vi.fn(),
    loadAdmins: vi.fn(),
    selectAdmin: vi.fn(),
    createAdmin: vi.fn(),
    requestAction: vi.fn(),
    cancelAction: vi.fn(),
    confirmAction: vi.fn(),
    ...overrides,
  } as AdminUsersManager
}

function renderView(manager: AdminUsersManager) {
  return render(
    <I18nProvider>
      <AdminUsersView manager={manager} />
    </I18nProvider>,
  )
}

describe('AdminUsersView', () => {
  it('renders admin list, safe detail and create form', () => {
    renderView(buildManager())

    expect(screen.getAllByText('ops@example.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Ops Admin').length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Send invite' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Resend invite' })).toBeEnabled()
  })

  it('disables mutating actions for readonly users', () => {
    renderView(buildManager({ canMutate: false }))

    expect(screen.getByRole('button', { name: 'Send invite' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Resend invite' })).toBeDisabled()
    expect(screen.getByText('Your role can inspect admin users but cannot change them.')).toBeInTheDocument()
  })

  it('requires confirmation before running critical actions', async () => {
    const user = userEvent.setup()
    const requestAction = vi.fn()
    const confirmAction = vi.fn()
    const cancelAction = vi.fn()

    const manager = buildManager({
      requestAction,
      confirmAction,
      cancelAction,
      pendingAction: { action: 'disable', admin },
    })

    renderView(manager)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Disable admin' }))

    expect(confirmAction).toHaveBeenCalledTimes(1)
  })
})
