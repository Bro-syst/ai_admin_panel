import { Link, Navigate, useParams } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import { AgentKnowledgeBindingView, useAgentKnowledgeBindingManager } from '@/modules/AgentKnowledgeBinding'
import { useKnowledgeManager } from '@/modules/Knowledge/model/useKnowledgeManager'
import { KnowledgeView } from '@/modules/Knowledge/ui/KnowledgeView'
import { AppShell } from '@/shared/ui/AppShell'
import { RefreshButton } from '@/shared/ui/RefreshButton'

export function KnowledgePage() {
  const { tenantId, agentId } = useParams()

  if (!tenantId) {
    return <Navigate to="/tenants" replace />
  }

  if (!agentId) {
    return <Navigate to={`/tenants/${tenantId}/agents`} replace />
  }

  return <KnowledgePageContent tenantId={tenantId} agentId={agentId} />
}

function KnowledgePageContent({ tenantId, agentId }: { tenantId: string; agentId: string }) {
  const { t } = useI18n()
  const bindingManager = useAgentKnowledgeBindingManager(tenantId, agentId)
  const knowledgeManager = useKnowledgeManager(tenantId, agentId, bindingManager.canManageKnowledge)
  const bindingReady = (bindingManager.binding?.readinessStatus ?? bindingManager.portalStatus?.readinessStatus) === 'ready'

  return (
    <AppShell title={t('knowledge.title')}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link to={`/tenants/${tenantId}/agents/${agentId}`} className="text-sm font-semibold text-[var(--primary-hover)] hover:underline">
              {t('agent_config.back_to_agent')}
            </Link>
            <h2 className="mt-2 text-lg font-bold text-[var(--text)]">{t('knowledge.title')}</h2>
            <p className="mt-1 break-all text-sm text-[var(--text-muted)]">{bindingManager.agentDetail?.name ?? agentId}</p>
          </div>
          <RefreshButton
            onClick={() => {
              void bindingManager.loadBinding()
              void knowledgeManager.loadKnowledge()
            }}
          />
        </div>
        {bindingReady ? (
          <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100">
            {t('knowledge.binding_ready_agent_blockers_prompt')}{' '}
            <Link to={`/tenants/${tenantId}/agents/${agentId}`} className="font-bold text-[var(--primary)] hover:underline">
              {t('agent_config.back_to_agent')}
            </Link>
          </div>
        ) : null}
        <AgentKnowledgeBindingView manager={bindingManager} />
        <KnowledgeView manager={knowledgeManager} bindingReady={bindingReady} />
      </div>
    </AppShell>
  )
}
