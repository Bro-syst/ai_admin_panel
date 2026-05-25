import { useI18n } from '@/core/i18n/useI18n'
import { useDashboardManager } from '@/modules/Operations/model/useDashboardManager'
import { DashboardView } from '@/modules/Operations/ui/DashboardView'
import { AppShell } from '@/shared/ui/AppShell'

export function DashboardPage() {
  const { t } = useI18n()
  const manager = useDashboardManager()

  return (
    <AppShell title={t('operations.dashboard.title')}>
      <DashboardView manager={manager} />
    </AppShell>
  )
}
