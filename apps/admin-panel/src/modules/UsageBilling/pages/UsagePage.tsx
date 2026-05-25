import { Navigate, useParams } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import { useUsageBillingManager } from '@/modules/UsageBilling/model/useUsageBillingManager'
import { UsageView } from '@/modules/UsageBilling/ui/UsageView'
import { AppShell } from '@/shared/ui/AppShell'

export function UsagePage() {
  const { tenantId } = useParams()

  if (!tenantId) {
    return <Navigate to="/tenants" replace />
  }

  return <UsagePageContent tenantId={tenantId} />
}

function UsagePageContent({ tenantId }: { tenantId: string }) {
  const { t } = useI18n()
  const manager = useUsageBillingManager(tenantId)

  return (
    <AppShell title={t('usage_billing.usage_title')}>
      <UsageView manager={manager} />
    </AppShell>
  )
}
