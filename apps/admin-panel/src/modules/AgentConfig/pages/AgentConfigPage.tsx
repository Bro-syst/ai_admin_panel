import { Navigate, useParams } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import { useAgentConfigManager } from '@/modules/AgentConfig/model/useAgentConfigManager'
import { AgentConfigView } from '@/modules/AgentConfig/ui/AgentConfigView'
import { AppShell } from '@/shared/ui/AppShell'

export function AgentConfigPage() {
  const { tenantId, agentId } = useParams()

  if (!tenantId) {
    return <Navigate to="/tenants" replace />
  }

  if (!agentId) {
    return <Navigate to={`/tenants/${tenantId}/agents`} replace />
  }

  return <AgentConfigPageContent tenantId={tenantId} agentId={agentId} />
}

function AgentConfigPageContent({ tenantId, agentId }: { tenantId: string; agentId: string }) {
  const { t } = useI18n()
  const manager = useAgentConfigManager(tenantId, agentId)

  return (
    <AppShell title={t('agent_config.title')}>
      <AgentConfigView manager={manager} />
    </AppShell>
  )
}
