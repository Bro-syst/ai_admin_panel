import { Navigate, useParams } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import { useReleasesManager } from '@/modules/Releases/model/useReleasesManager'
import { ReleasesView } from '@/modules/Releases/ui/ReleasesView'
import { AppShell } from '@/shared/ui/AppShell'

export function ReleasesPage() {
  const { tenantId, agentId } = useParams()

  if (!tenantId) {
    return <Navigate to="/tenants" replace />
  }

  if (!agentId) {
    return <Navigate to={`/tenants/${tenantId}/agents`} replace />
  }

  return <ReleasesPageContent tenantId={tenantId} agentId={agentId} />
}

function ReleasesPageContent({ tenantId, agentId }: { tenantId: string; agentId: string }) {
  const { t } = useI18n()
  const manager = useReleasesManager(tenantId, agentId)

  return (
    <AppShell title={t('releases.title')}>
      <ReleasesView manager={manager} />
    </AppShell>
  )
}
