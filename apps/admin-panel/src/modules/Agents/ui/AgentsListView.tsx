import { Link } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import type { AgentsListManager } from '@/modules/Agents/model/useAgentsListManager'
import { AgentTemplateCatalogPanel } from '@/modules/AgentTemplates'
import type { AgentTemplateCatalogManager } from '@/modules/AgentTemplates'
import { StatusBadge } from '@/shared/ui/EntityInfo'
import { RefreshButton } from '@/shared/ui/RefreshButton'

export function AgentsListView({
  manager,
  catalogManager,
}: {
  manager: AgentsListManager
  catalogManager: AgentTemplateCatalogManager
}) {
  const { t } = useI18n()

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to={`/tenants/${manager.tenantId}`} className="text-sm font-semibold text-[var(--primary-hover)] hover:underline">
            {t('agents.back_to_tenant')}
          </Link>
          <h2 className="mt-2 text-lg font-bold text-[var(--text)]">{t('agents.list.title')}</h2>
          <p className="mt-1 break-all text-sm text-[var(--text-muted)]">{manager.tenantId}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RefreshButton onClick={() => void manager.loadAgents()} />
          <Link
            to={`/tenants/${manager.tenantId}/agents/new`}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white hover:bg-[var(--primary-hover)]"
          >
            {t('agents.create.title')}
          </Link>
        </div>
      </div>

      {manager.errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {manager.errorMessage}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h3 className="text-sm font-bold text-[var(--text)]">{t('agents.list.table_title')}</h3>
          <span className="text-xs font-semibold text-[var(--text-muted)]">
            {manager.metadata ? `${manager.metadata.returnedItems} / ${manager.metadata.totalItems}` : manager.agents.length}
          </span>
        </div>

        {manager.isLoading ? (
          <div className="p-6 text-sm text-[var(--text-muted)]">{t('common.loading')}</div>
        ) : manager.agents.length === 0 ? (
          <div className="p-6">
            <h4 className="text-sm font-bold text-[var(--text)]">{t('agents.list.empty_title')}</h4>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{t('agents.list.empty_subtitle')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)] text-left text-sm">
              <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-wide text-[var(--text-muted)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t('agents.agent')}</th>
                  <th className="px-4 py-3 font-semibold">{t('agents.template')}</th>
                  <th className="px-4 py-3 font-semibold">{t('common.status')}</th>
                  <th className="px-4 py-3 font-semibold">{t('agents.lifecycle')}</th>
                  <th className="px-4 py-3 font-semibold">{t('agents.readiness')}</th>
                  <th className="px-4 py-3 font-semibold">{t('agents.blockers')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {manager.agents.map((agent) => (
                  <tr key={agent.agentId} className="transition hover:bg-[var(--surface-muted)]">
                    <td className="px-4 py-3">
                      <Link to={`/tenants/${manager.tenantId}/agents/${agent.agentId}`} className="font-semibold text-[var(--primary-hover)] hover:underline">
                        {agent.name}
                      </Link>
                      <div className="mt-1 break-all text-xs text-[var(--text-muted)]">{agent.agentId}</div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{agent.templateId ?? agent.archetypeId}</td>
                    <td className="px-4 py-3"><StatusBadge status={agent.status} label={t(`agents.status.${agent.status}`)} /></td>
                    <td className="px-4 py-3"><StatusBadge status={agent.lifecycleStatus} label={t(`agents.lifecycle_status.${agent.lifecycleStatus}`)} /></td>
                    <td className="px-4 py-3"><StatusBadge status={agent.readinessStatus} label={t(`agents.readiness_status.${agent.readinessStatus}`)} /></td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{agent.blockingItemCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AgentTemplateCatalogPanel manager={catalogManager} />
    </div>
  )
}
