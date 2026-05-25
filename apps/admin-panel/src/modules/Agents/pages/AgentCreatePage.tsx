import { Navigate, useParams } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import { useAgentCreateManager } from '@/modules/Agents/model/useAgentCreateManager'
import { AgentCreateView } from '@/modules/Agents/ui/AgentCreateView'
import { useAgentTemplateCatalog } from '@/modules/AgentTemplates'
import { AppShell } from '@/shared/ui/AppShell'

export function AgentCreatePage() {
  const { tenantId } = useParams()

  if (!tenantId) {
    return <Navigate to="/tenants" replace />
  }

  return <AgentCreatePageContent tenantId={tenantId} />
}

function AgentCreatePageContent({ tenantId }: { tenantId: string }) {
  const { t } = useI18n()
  const catalogManager = useAgentTemplateCatalog(tenantId)
  const manager = useAgentCreateManager(tenantId, catalogManager.selectedTemplate)

  return (
    <AppShell title={t('agents.create.title')}>
      <AgentCreateView manager={manager} catalogManager={catalogManager} />
    </AppShell>
  )
}
