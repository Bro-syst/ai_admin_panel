import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '@/core/i18n/I18nProvider'
import { AdminUsersPage } from '@/modules/AdminUsers/pages/AdminUsersPage'

vi.mock('@/shared/ui/AppShell', () => ({
  AppShell: ({ title, children }: { title: string; children: ReactNode }) => (
    <section>
      <h1>{title}</h1>
      {children}
    </section>
  ),
}))

vi.mock('@/modules/AdminUsers/model/useAdminUsersManager', () => ({
  useAdminUsersManager: () => ({
    admins: [],
    filteredAdmins: [],
    selectedAdmin: null,
    filters: { query: '', role: 'all', status: 'all' },
    createForm: { email: '', displayName: '', role: 'platform_operator', tenantId: '' },
    pendingAction: null,
    roleOptions: ['platform_admin', 'platform_operator', 'platform_viewer'],
    statusOptions: [],
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
  }),
}))

describe('AdminUsersPage', () => {
  it('renders the route page inside AppShell', () => {
    render(
      <I18nProvider>
        <AdminUsersPage />
      </I18nProvider>,
    )

    expect(screen.getAllByRole('heading', { name: 'Admin Users' }).length).toBeGreaterThan(0)
    expect(screen.getByText('No admin users found')).toBeInTheDocument()
  })
})
