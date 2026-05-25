import type { ReactNode } from 'react'
import { useI18n } from '@/core/i18n/useI18n'
import type { OperationsManager } from '@/modules/Operations/model/useOperationsManager'
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

export function OperationsView({ manager }: { manager: OperationsManager }) {
  const { t } = useI18n()
  const operations = manager.operations

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--text)]">{t('operations.operations.title')}</h2>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">{t('operations.operations.subtitle')}</p>
        </div>

        <RefreshButton onClick={() => void manager.loadOperations()} />
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
      ) : operations ? (
        <>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label={t('operations.result_classification')} value={operations.resultClassification} />
            <SummaryCard label={t('operations.failed_provisioning_tenants')} value={operations.failedProvisioningTenants} />
            <SummaryCard label={t('operations.degraded_agents')} value={operations.degradedAgents} />
            <SummaryCard label={t('operations.outstanding_setup_blockers')} value={operations.outstandingSetupBlockers} />
          </div>

          <Section title={t('operations.operations.summary_title')}>
            <OperationsSnapshot operations={operations} labels={{
              generatedAt: t('operations.generated_at'),
              failedProvisioningTenants: t('operations.failed_provisioning_tenants'),
              inactiveTenants: t('operations.inactive_tenants'),
              degradedAgents: t('operations.degraded_agents'),
              readyPublicWidgetBindings: t('operations.ready_public_widget_bindings'),
              outstandingSetupBlockers: t('operations.outstanding_setup_blockers'),
              resultClassification: t('operations.result_classification'),
            }} />
            <div className="text-xs font-semibold text-[var(--text-muted)]">
              {t('operations.generated_at')}: {formatDate(operations.generatedAt)}
            </div>
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
        </>
      ) : (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)] shadow-[var(--shadow-soft)]">
          {t('operations.operations.empty')}
        </div>
      )}
    </div>
  )
}
