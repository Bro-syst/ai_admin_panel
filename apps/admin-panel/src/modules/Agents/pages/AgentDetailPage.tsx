import { Navigate, useParams } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import { useAgentDetailManager } from '@/modules/Agents/model/useAgentDetailManager'
import { AgentDetailView } from '@/modules/Agents/ui/AgentDetailView'
import { AppShell } from '@/shared/ui/AppShell'

export function AgentDetailPage() {
  const { tenantId, agentId } = useParams()

  if (!tenantId) {
    return <Navigate to="/tenants" replace />
  }

  if (!agentId) {
    return <Navigate to={`/tenants/${tenantId}/agents`} replace />
  }

  return <AgentDetailPageContent tenantId={tenantId} agentId={agentId} />
}

function AgentDetailPageContent({ tenantId, agentId }: { tenantId: string; agentId: string }) {
  const { t } = useI18n()
  const manager = useAgentDetailManager(tenantId, agentId)

  return (
    <AppShell title={t('agents.detail.title')}>
      <AgentDetailView manager={manager} />
    </AppShell>
  )
}
