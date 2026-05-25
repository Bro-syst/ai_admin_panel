import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/core/auth/useAuth'
import { getLocalizedApiErrorMessage } from '@/core/api/errors/getLocalizedApiErrorMessage'
import { useI18n } from '@/core/i18n/useI18n'
import { adminUsersApi, type AdminUser, type CreateAdminUserInput } from '@/modules/AdminUsers/api/adminUsersApi'

export type AdminUserAction = 'resend_invite' | 'disable' | 'enable' | 'revoke_sessions'

export type AdminUserFilters = {
  query: string
  role: string
  status: string
}

export type CreateAdminUserForm = {
  email: string
  displayName: string
  role: string
  tenantId: string
}

export type PendingAdminUserAction = {
  action: AdminUserAction
  admin: AdminUser
} | null

const DEFAULT_CREATE_FORM: CreateAdminUserForm = {
  email: '',
  displayName: '',
  role: 'platform_operator',
  tenantId: '',
}

const DEFAULT_FILTERS: AdminUserFilters = {
  query: '',
  role: 'all',
  status: 'all',
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function upsertAdmin(admins: AdminUser[], admin: AdminUser) {
  const exists = admins.some((item) => item.id === admin.id)
  const next = exists ? admins.map((item) => (item.id === admin.id ? admin : item)) : [admin, ...admins]
  return [...next].sort((a, b) => a.email.localeCompare(b.email))
}

function hasAnyPermission(permissions: string[] | undefined, accepted: string[]) {
  return Array.isArray(permissions) && accepted.some((permission) => permissions.includes(permission))
}

function canMutateAdminUsers(adminUser: { role: string; permissions?: string[] } | null) {
  if (!adminUser) return false
  if (hasAnyPermission(adminUser.permissions, ['admin_users:write', 'admins:write', 'manage-admins', 'manage_admins'])) {
    return true
  }
  return adminUser.role === 'platform_admin'
}

export function useAdminUsersManager() {
  const { adminUser } = useAuth()
  const { t } = useI18n()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null)
  const [filters, setFilters] = useState<AdminUserFilters>(DEFAULT_FILTERS)
  const [createForm, setCreateForm] = useState<CreateAdminUserForm>(DEFAULT_CREATE_FORM)
  const [pendingAction, setPendingAction] = useState<PendingAdminUserAction>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isActionSubmitting, setIsActionSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const canMutate = canMutateAdminUsers(adminUser)

  const loadAdmins = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const result = await adminUsersApi.listAdmins()
      setAdmins(result)
      setSelectedAdmin((current) => {
        if (!current) return result[0] ?? null
        return result.find((item) => item.id === current.id) ?? result[0] ?? null
      })
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('admin_users.load_error')))
    } finally {
      setIsLoading(false)
    }
  }, [t])

  useEffect(() => {
    void loadAdmins()
  }, [loadAdmins])

  const filteredAdmins = useMemo(() => {
    const query = normalize(filters.query)

    return admins.filter((admin) => {
      const matchesQuery =
        !query ||
        normalize(admin.email).includes(query) ||
        normalize(admin.displayName ?? '').includes(query) ||
        normalize(admin.id).includes(query)
      const matchesRole = filters.role === 'all' || admin.role === filters.role
      const matchesStatus = filters.status === 'all' || admin.status === filters.status
      return matchesQuery && matchesRole && matchesStatus
    })
  }, [admins, filters])

  const roleOptions = useMemo(() => Array.from(new Set(['platform_admin', 'platform_operator', 'platform_viewer', ...admins.map((admin) => admin.role)])), [admins])
  const statusOptions = useMemo(() => Array.from(new Set(admins.map((admin) => admin.status))), [admins])

  const selectAdmin = useCallback(async (admin: AdminUser) => {
    setSelectedAdmin(admin)
    setIsDetailLoading(true)
    setErrorMessage(null)
    try {
      const detail = await adminUsersApi.getAdmin(admin.id)
      setAdmins((current) => upsertAdmin(current, detail))
      setSelectedAdmin(detail)
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('admin_users.detail_error')))
    } finally {
      setIsDetailLoading(false)
    }
  }, [t])

  const updateCreateForm = useCallback((patch: Partial<CreateAdminUserForm>) => {
    setCreateForm((current) => ({ ...current, ...patch }))
    setFormError(null)
  }, [])

  const createAdmin = useCallback(async () => {
    const payload: CreateAdminUserInput = {
      email: createForm.email.trim(),
      displayName: createForm.displayName.trim(),
      role: createForm.role,
      tenantId: createForm.tenantId.trim(),
    }

    if (!payload.email || !payload.email.includes('@')) {
      setFormError(t('admin_users.form.email_error'))
      return
    }

    if (!payload.role) {
      setFormError(t('admin_users.form.role_error'))
      return
    }

    setIsCreating(true)
    setFormError(null)
    setNotice(null)
    try {
      const result = await adminUsersApi.createAdmin(payload)
      setAdmins((current) => upsertAdmin(current, result.admin))
      setSelectedAdmin(result.admin)
      setCreateForm(DEFAULT_CREATE_FORM)
      setNotice(t('admin_users.notice.created'))
    } catch (error) {
      setFormError(getLocalizedApiErrorMessage(error, t, t('admin_users.create_error')))
    } finally {
      setIsCreating(false)
    }
  }, [createForm, t])

  const requestAction = useCallback((action: AdminUserAction, admin: AdminUser) => {
    setPendingAction({ action, admin })
    setNotice(null)
  }, [])

  const cancelAction = useCallback(() => {
    if (!isActionSubmitting) setPendingAction(null)
  }, [isActionSubmitting])

  const confirmAction = useCallback(async () => {
    if (!pendingAction) return

    setIsActionSubmitting(true)
    setErrorMessage(null)
    setNotice(null)
    try {
      const { action, admin } = pendingAction
      const result =
        action === 'resend_invite'
          ? await adminUsersApi.resendInvite(admin.id)
          : action === 'disable'
            ? await adminUsersApi.disableAdmin(admin.id)
            : action === 'enable'
              ? await adminUsersApi.enableAdmin(admin.id)
              : await adminUsersApi.revokeSessions(admin.id)

      setAdmins((current) => upsertAdmin(current, result.admin))
      setSelectedAdmin(result.admin)
      setPendingAction(null)
      setNotice(t(`admin_users.notice.${action}`))
    } catch (error) {
      setErrorMessage(getLocalizedApiErrorMessage(error, t, t('admin_users.action_error')))
    } finally {
      setIsActionSubmitting(false)
    }
  }, [pendingAction, t])

  return {
    admins,
    filteredAdmins,
    selectedAdmin,
    filters,
    createForm,
    pendingAction,
    roleOptions,
    statusOptions,
    currentAdminId: adminUser?.id ?? null,
    canMutate,
    isLoading,
    isDetailLoading,
    isCreating,
    isActionSubmitting,
    errorMessage,
    formError,
    notice,
    setFilters,
    updateCreateForm,
    loadAdmins,
    selectAdmin,
    createAdmin,
    requestAction,
    cancelAction,
    confirmAction,
  }
}

export type AdminUsersManager = ReturnType<typeof useAdminUsersManager>
