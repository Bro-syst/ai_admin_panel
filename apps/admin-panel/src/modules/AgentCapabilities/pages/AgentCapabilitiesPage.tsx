import { Navigate, useParams } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import { useAgentCapabilitiesManager } from '@/modules/AgentCapabilities/model/useAgentCapabilitiesManager'
import { AgentCapabilitiesView } from '@/modules/AgentCapabilities/ui/AgentCapabilitiesView'
import { AppShell } from '@/shared/ui/AppShell'

export function AgentCapabilitiesPage() {
  const { tenantId, agentId } = useParams()

  if (!tenantId) {
    return <Navigate to="/tenants" replace />
  }

  if (!agentId) {
    return <Navigate to={`/tenants/${tenantId}/agents`} replace />
  }

  return <AgentCapabilitiesPageContent tenantId={tenantId} agentId={agentId} />
}

function AgentCapabilitiesPageContent({ tenantId, agentId }: { tenantId: string; agentId: string }) {
  const { t } = useI18n()
  const manager = useAgentCapabilitiesManager(tenantId, agentId)

  return (
    <AppShell title={t('agent_capabilities.title')}>
      <AgentCapabilitiesView manager={manager} />
    </AppShell>
  )
}
