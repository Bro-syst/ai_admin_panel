import { useI18n } from '@/core/i18n/useI18n'
import { useTenantsListManager } from '@/modules/Tenants/model/useTenantsListManager'
import { TenantsListView } from '@/modules/Tenants/ui/TenantsListView'
import { AppShell } from '@/shared/ui/AppShell'

export function TenantsListPage() {
  const { t } = useI18n()
  const manager = useTenantsListManager()

  return (
    <AppShell title={t('tenants.title')}>
      <TenantsListView manager={manager} />
    </AppShell>
  )
}
