import { useI18n } from '@/core/i18n/useI18n'
import { useOperationsManager } from '@/modules/Operations/model/useOperationsManager'
import { OperationsView } from '@/modules/Operations/ui/OperationsView'
import { AppShell } from '@/shared/ui/AppShell'

export function OperationsPage() {
  const { t } = useI18n()
  const manager = useOperationsManager()

  return (
    <AppShell title={t('operations.operations.title')}>
      <OperationsView manager={manager} />
    </AppShell>
  )
}
