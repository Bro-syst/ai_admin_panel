import type { PlatformSettings, PortalOperationsSummary } from '@/modules/Operations/api/operationsApi'
import { formatDate } from '@/modules/Operations/ui/formatDate'

export function SummaryCard({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</div>
      <div className="mt-2 break-words text-2xl font-extrabold tracking-tight text-[var(--text)]">{value}</div>
      {helper ? <div className="mt-1 text-sm text-[var(--text-muted)]">{helper}</div> : null}
    </div>
  )
}

export function KeyValueGrid({ items }: { items: Array<{ label: string; value: string | number }> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">{item.label}</div>
          <div className="mt-1 break-words text-sm font-semibold text-[var(--text)]">{item.value}</div>
        </div>
      ))}
    </div>
  )
}

export function OperationsSnapshot({ operations, labels }: {
  operations: PortalOperationsSummary
  labels: {
    generatedAt: string
    failedProvisioningTenants: string
    inactiveTenants: string
    degradedAgents: string
    readyPublicWidgetBindings: string
    outstandingSetupBlockers: string
    resultClassification: string
  }
}) {
  return (
    <KeyValueGrid
      items={[
        { label: labels.resultClassification, value: operations.resultClassification },
        { label: labels.failedProvisioningTenants, value: operations.failedProvisioningTenants },
        { label: labels.inactiveTenants, value: operations.inactiveTenants },
        { label: labels.degradedAgents, value: operations.degradedAgents },
        { label: labels.readyPublicWidgetBindings, value: operations.readyPublicWidgetBindings },
        { label: labels.outstandingSetupBlockers, value: operations.outstandingSetupBlockers },
        { label: labels.generatedAt, value: formatDate(operations.generatedAt) },
      ]}
    />
  )
}

export function PlatformSettingsSnapshot({ settings, labels }: {
  settings: PlatformSettings
  labels: {
    appName: string
    appVersion: string
    environment: string
    apiPrefix: string
    debugEnabled: string
    logLevel: string
    healthcheckTimeoutSeconds: string
    redisEnabled: string
    yes: string
    no: string
  }
}) {
  return (
    <KeyValueGrid
      items={[
        { label: labels.appName, value: settings.appName },
        { label: labels.appVersion, value: settings.appVersion },
        { label: labels.environment, value: settings.environment },
        { label: labels.apiPrefix, value: settings.apiPrefix },
        { label: labels.debugEnabled, value: settings.debugEnabled ? labels.yes : labels.no },
        { label: labels.logLevel, value: settings.logLevel },
        { label: labels.healthcheckTimeoutSeconds, value: settings.healthcheckTimeoutSeconds },
        { label: labels.redisEnabled, value: settings.redisEnabled ? labels.yes : labels.no },
      ]}
    />
  )
}
