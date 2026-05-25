import { Navigate, useParams } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import { useAgentsListManager } from '@/modules/Agents/model/useAgentsListManager'
import { AgentsListView } from '@/modules/Agents/ui/AgentsListView'
import { useAgentTemplateCatalog } from '@/modules/AgentTemplates'
import { AppShell } from '@/shared/ui/AppShell'

export function AgentsListPage() {
  const { tenantId } = useParams()

  if (!tenantId) {
    return <Navigate to="/tenants" replace />
  }

  return <AgentsListPageContent tenantId={tenantId} />
}

function AgentsListPageContent({ tenantId }: { tenantId: string }) {
  const { t } = useI18n()
  const manager = useAgentsListManager(tenantId)
  const catalogManager = useAgentTemplateCatalog(tenantId)

  return (
    <AppShell title={t('agents.list.title')}>
      <AgentsListView manager={manager} catalogManager={catalogManager} />
    </AppShell>
  )
}
