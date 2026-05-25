import { Navigate, useParams } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import { useUsageBillingManager } from '@/modules/UsageBilling/model/useUsageBillingManager'
import { BillingExportView } from '@/modules/UsageBilling/ui/BillingExportView'
import { AppShell } from '@/shared/ui/AppShell'

export function BillingExportPage() {
  const { tenantId } = useParams()

  if (!tenantId) {
    return <Navigate to="/tenants" replace />
  }

  return <BillingExportPageContent tenantId={tenantId} />
}

function BillingExportPageContent({ tenantId }: { tenantId: string }) {
  const { t } = useI18n()
  const manager = useUsageBillingManager(tenantId)

  return (
    <AppShell title={t('usage_billing.billing_title')}>
      <BillingExportView manager={manager} />
    </AppShell>
  )
}
