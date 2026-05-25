import { Navigate, useParams } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import { useSitesWidgetsManager } from '@/modules/SitesWidgets/model/useSitesWidgetsManager'
import { SitesWidgetsView } from '@/modules/SitesWidgets/ui/SitesWidgetsView'
import { AppShell } from '@/shared/ui/AppShell'

export function SitesWidgetsPage() {
  const { tenantId, agentId } = useParams()

  if (!tenantId) {
    return <Navigate to="/tenants" replace />
  }

  if (!agentId) {
    return <Navigate to={`/tenants/${tenantId}/agents`} replace />
  }

  return <SitesWidgetsPageContent tenantId={tenantId} agentId={agentId} />
}

function SitesWidgetsPageContent({ tenantId, agentId }: { tenantId: string; agentId: string }) {
  const { t } = useI18n()
  const manager = useSitesWidgetsManager(tenantId, agentId)

  return (
    <AppShell title={t('sites_widgets.title')}>
      <SitesWidgetsView manager={manager} />
    </AppShell>
  )
}
