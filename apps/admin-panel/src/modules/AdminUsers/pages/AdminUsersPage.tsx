import { useI18n } from '@/core/i18n/useI18n'
import { useAdminUsersManager } from '@/modules/AdminUsers/model/useAdminUsersManager'
import { AdminUsersView } from '@/modules/AdminUsers/ui/AdminUsersView'
import { AppShell } from '@/shared/ui/AppShell'

export function AdminUsersPage() {
  const { t } = useI18n()
  const manager = useAdminUsersManager()

  return (
    <AppShell title={t('admin_users.title')}>
      <AdminUsersView manager={manager} />
    </AppShell>
  )
}
