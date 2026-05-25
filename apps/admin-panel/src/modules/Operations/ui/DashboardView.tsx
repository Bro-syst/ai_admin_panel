import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import type { DashboardManager } from '@/modules/Operations/model/useDashboardManager'
import {
  OperationsSnapshot,
  PlatformSettingsSnapshot,
  SummaryCard,
} from '@/modules/Operations/ui/OperationsSummaryBlocks'
import { formatDate } from '@/modules/Operations/ui/formatDate'
import { RefreshButton } from '@/shared/ui/RefreshButton'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <h3 className="text-sm font-bold text-[var(--text)]">{title}</h3>
      {children}
    </section>
  )
}

export function DashboardView({ manager }: { manager: DashboardManager }) {
  const { t } = useI18n()
  const dashboard = manager.dashboard

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--text)]">{t('operations.dashboard.title')}</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">{t('operations.dashboard.subtitle')}</p>
        </div>

        <RefreshButton onClick={() => void manager.loadDashboard()} />
      </div>

      {manager.errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {manager.errorMessage}
        </div>
      ) : null}

      {manager.isLoading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)] shadow-[var(--shadow-soft)]">
          {t('common.loading')}
        </div>
      ) : dashboard ? (
        <>
          {manager.isLowData ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200">
              {t('operations.dashboard.low_data')}
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label={t('operations.dashboard.active_tenants')}
              value={dashboard.tenantSummary.activeTenants}
              helper={`${t('operations.dashboard.total')}: ${dashboard.tenantSummary.totalTenants}`}
            />
            <SummaryCard
              label={t('operations.dashboard.active_agents')}
              value={dashboard.agentSummary.activeAgents}
              helper={`${t('operations.dashboard.total')}: ${dashboard.agentSummary.totalAgents}`}
            />
            <SummaryCard
              label={t('operations.dashboard.failed_checks')}
              value={dashboard.tenantSummary.failedProvisioningTenants}
              helper={`${t('operations.dashboard.release_blockers')}: ${dashboard.releaseSummary.blockingAgentCount}`}
            />
            <SummaryCard
              label={t('operations.dashboard.runtime_degradation')}
              value={dashboard.runtimeSummary.recentRuntimeDegradationCount}
              helper={`${t('operations.dashboard.failed_turns')}: ${dashboard.runtimeSummary.recentFailedTurnCount}`}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <Section title={t('operations.dashboard.summary_title')}>
                <div className="grid gap-3 md:grid-cols-2">
                  <SummaryCard
                    label={t('operations.dashboard.blocked_tenants')}
                    value={dashboard.tenantSummary.blockedTenants}
                  />
                  <SummaryCard
                    label={t('operations.dashboard.release_ready_agents')}
                    value={dashboard.agentSummary.releaseReadyAgents}
                    helper={`${t('operations.dashboard.blocked_agents')}: ${dashboard.agentSummary.blockedAgents}`}
                  />
                  <SummaryCard
                    label={t('operations.dashboard.billing_export_failures')}
                    value={dashboard.billingExportSummary.blockedTenantCount}
                    helper={dashboard.billingExportSummary.exportStatus}
                  />
                  <SummaryCard
                    label={t('operations.dashboard.active_chats')}
                    value={dashboard.runtimeSummary.activeChats}
                    helper={`${t('operations.dashboard.total')}: ${dashboard.runtimeSummary.totalChats}`}
                  />
                </div>
                <div className="text-xs font-semibold text-[var(--text-muted)]">
                  {t('operations.generated_at')}: {formatDate(dashboard.generatedAt)}
                </div>
              </Section>

              <Section title={t('operations.dashboard.operations_title')}>
                {manager.operations ? (
                  <OperationsSnapshot operations={manager.operations} labels={{
                    generatedAt: t('operations.generated_at'),
                    failedProvisioningTenants: t('operations.failed_provisioning_tenants'),
                    inactiveTenants: t('operations.inactive_tenants'),
                    degradedAgents: t('operations.degraded_agents'),
                    readyPublicWidgetBindings: t('operations.ready_public_widget_bindings'),
                    outstandingSetupBlockers: t('operations.outstanding_setup_blockers'),
                    resultClassification: t('operations.result_classification'),
                  }} />
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">{t('operations.operations.empty')}</p>
                )}
              </Section>

              {manager.platformSettings ? (
                <Section title={t('operations.platform_settings.title')}>
                  <PlatformSettingsSnapshot settings={manager.platformSettings} labels={{
                    appName: t('operations.platform_settings.app_name'),
                    appVersion: t('operations.platform_settings.app_version'),
                    environment: t('operations.platform_settings.environment'),
                    apiPrefix: t('operations.platform_settings.api_prefix'),
                    debugEnabled: t('operations.platform_settings.debug_enabled'),
                    logLevel: t('operations.platform_settings.log_level'),
                    healthcheckTimeoutSeconds: t('operations.platform_settings.healthcheck_timeout_seconds'),
                    redisEnabled: t('operations.platform_settings.redis_enabled'),
                    yes: t('common.yes'),
                    no: t('common.no'),
                  }} />
                </Section>
              ) : null}
            </div>

            <Section title={t('operations.quick_links.title')}>
              <div className="grid gap-2">
                <Link to="/tenants" className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--primary-hover)] hover:bg-[var(--surface-muted)]">
                  {t('operations.quick_links.tenants')}
                </Link>
                <Link to="/operations" className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--primary-hover)] hover:bg-[var(--surface-muted)]">
                  {t('operations.quick_links.operations')}
                </Link>
                <Link to="/security" className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--primary-hover)] hover:bg-[var(--surface-muted)]">
                  {t('operations.quick_links.security')}
                </Link>
                <Link to="/admins" className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--primary-hover)] hover:bg-[var(--surface-muted)]">
                  {t('operations.quick_links.admins')}
                </Link>
                <Link to="/settings" className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-semibold text-[var(--primary-hover)] hover:bg-[var(--surface-muted)]">
                  {t('operations.quick_links.settings')}
                </Link>
              </div>
            </Section>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)] shadow-[var(--shadow-soft)]">
          {t('operations.dashboard.empty')}
        </div>
      )}
    </div>
  )
}
