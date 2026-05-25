import { Navigate, useParams } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import { useAgentPolicyManager } from '@/modules/AgentPolicy/model/useAgentPolicyManager'
import { AgentPolicyView } from '@/modules/AgentPolicy/ui/AgentPolicyView'
import { AppShell } from '@/shared/ui/AppShell'

export function AgentPolicyPage() {
  const { tenantId, agentId } = useParams()

  if (!tenantId) {
    return <Navigate to="/tenants" replace />
  }

  if (!agentId) {
    return <Navigate to={`/tenants/${tenantId}/agents`} replace />
  }

  return <AgentPolicyPageContent tenantId={tenantId} agentId={agentId} />
}

function AgentPolicyPageContent({ tenantId, agentId }: { tenantId: string; agentId: string }) {
  const { t } = useI18n()
  const manager = useAgentPolicyManager(tenantId, agentId)

  return (
    <AppShell title={t('agent_policy.title')}>
      <AgentPolicyView manager={manager} />
    </AppShell>
  )
}
