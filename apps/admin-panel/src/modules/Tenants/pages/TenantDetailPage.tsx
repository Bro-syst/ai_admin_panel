import { Navigate, useParams } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import { useTenantDetailManager } from '@/modules/Tenants/model/useTenantDetailManager'
import { TenantDetailView } from '@/modules/Tenants/ui/TenantDetailView'
import { AppShell } from '@/shared/ui/AppShell'

export function TenantDetailPage() {
  const { t } = useI18n()
  const { tenantId } = useParams()

  if (!tenantId) {
    return <Navigate to="/tenants" replace />
  }

  return <TenantDetailPageContent tenantId={tenantId} title={t('tenants.detail.title')} />
}

function TenantDetailPageContent({ tenantId, title }: { tenantId: string; title: string }) {
  const manager = useTenantDetailManager(tenantId)

  return (
    <AppShell title={title}>
      <TenantDetailView manager={manager} />
    </AppShell>
  )
}
