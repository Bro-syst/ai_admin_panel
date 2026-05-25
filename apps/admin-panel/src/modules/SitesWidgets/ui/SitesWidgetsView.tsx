import { Link } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import {
  isValidWidgetKey,
  parseAllowedOriginsText,
  type SitesWidgetsManager,
} from '@/modules/SitesWidgets/model/useSitesWidgetsManager'
import { CopyableValue, InfoGrid, ListBlock, MutationResultBlock, StatusBadge } from '@/shared/ui/EntityInfo'
import { RefreshButton } from '@/shared/ui/RefreshButton'

function confirmAction(message: string, action: () => void) {
  if (window.confirm(message)) action()
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildBackendInstallSnippet(binding: NonNullable<SitesWidgetsManager['status']>['bindings'][number]) {
  return [
    '<div',
    `data-ai-core-widget-key="${escapeAttribute(binding.widgetKey)}"`,
    `data-ai-core-site-hostname="${escapeAttribute(binding.siteHostname)}"`,
    `data-ai-core-site-id="${escapeAttribute(binding.siteId)}"`,
    `data-ai-core-widget-id="${escapeAttribute(binding.widgetId)}"`,
    '></div>',
  ].join(' ')
}

function copyInstallSnippet(snippet: string) {
  void navigator.clipboard?.writeText(snippet)
}

function normalizeBackendKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function humanizeBackendValue(value: string) {
  return value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim() || value
}

function translateBackendValue(t: (key: string) => string, namespace: string, value: string | null | undefined) {
  if (!value) return t('agents.empty_value')
  const key = `${namespace}.${normalizeBackendKey(value)}`
  const translated = t(key)
  return translated === key ? humanizeBackendValue(value) : translated
}

function ChipList({ values }: { values: string[] }) {
  if (values.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span key={value} className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
          {value}
        </span>
      ))}
    </div>
  )
}

function SitesWidgetsEvidenceBlock({ manager }: { manager: SitesWidgetsManager }) {
  const { t } = useI18n()
  const evidence = manager.mutationEvidence
  if (!evidence) return null

  const correlationId = evidence.result.correlationId || null
  const commonItems = [
    { label: t('mutation_result.action'), value: translateBackendValue(t, 'sites_widgets.action', evidence.result.action) },
    {
      label: t('mutation_result.correlation_or_request'),
      value: correlationId ? <CopyableValue value={correlationId} /> : t('sites_widgets.backend_not_provided'),
    },
  ]

  if (evidence.kind === 'site') {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
        <h3 className="font-bold">{t('sites_widgets.evidence.site_title')}</h3>
        <div className="mt-3">
          <InfoGrid
            items={[
              ...commonItems,
              { label: t('sites_widgets.site_id'), value: evidence.site.id ? <CopyableValue value={evidence.site.id} /> : t('sites_widgets.backend_not_provided') },
              { label: t('sites_widgets.hostname'), value: evidence.site.hostname || t('sites_widgets.backend_not_provided') },
              { label: t('common.status'), value: translateBackendValue(t, 'sites_widgets.status', evidence.site.status) },
            ]}
          />
        </div>
        <div className="mt-3">
          <ListBlock title={t('sites_widgets.allowed_origins')} values={evidence.site.externalAllowedOrigins} emptyLabel={t('sites_widgets.backend_not_provided')} />
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
      <h3 className="font-bold">{t('sites_widgets.evidence.widget_title')}</h3>
      <div className="mt-3">
        <InfoGrid
          items={[
            ...commonItems,
            { label: t('sites_widgets.widget_id'), value: evidence.widget.id ? <CopyableValue value={evidence.widget.id} /> : t('sites_widgets.backend_not_provided') },
            { label: t('sites_widgets.widget_key'), value: evidence.widget.widgetKey || t('sites_widgets.backend_not_provided') },
            { label: t('sites_widgets.site_id'), value: evidence.widget.siteId ? <CopyableValue value={evidence.widget.siteId} /> : t('sites_widgets.backend_not_provided') },
            { label: t('agents.agent'), value: evidence.widget.agentId ? <CopyableValue value={evidence.widget.agentId} /> : t('sites_widgets.backend_not_provided') },
            { label: t('common.status'), value: translateBackendValue(t, 'sites_widgets.status', evidence.widget.status) },
          ]}
        />
      </div>
    </section>
  )
}

export function SitesWidgetsView({ manager }: { manager: SitesWidgetsManager }) {
  const { t } = useI18n()
  const disabled = !manager.canManageSitesWidgets || manager.isMutating
  const selectedWidget = manager.widgets.find((widget) => widget.widgetKey === manager.smokeForm.widgetKey) ?? manager.widgets[0]
  const selectedSite = manager.sites.find((site) => site.id === selectedWidget?.siteId)
  const originPreview = parseAllowedOriginsText(manager.siteForm.allowedOriginsText)
  const widgetKey = manager.widgetForm.widgetKey.trim()
  const widgetKeyValid = widgetKey === '' || isValidWidgetKey(widgetKey)
  const canCreateWidget = !disabled && Boolean(manager.widgetForm.siteId.trim()) && isValidWidgetKey(widgetKey)
  const canRunPublicWidgetTest = !manager.isSmoking && Boolean(manager.smokeForm.widgetKey.trim())
  const hasSites = manager.sites.length > 0
  const hasWidgets = manager.widgets.some((widget) => widget.agentId === manager.agentId)
  const statusActionHint = manager.status?.publicChannelRequired && !manager.status.publicChannelInUse
    ? hasSites
      ? hasWidgets
        ? t('sites_widgets.channel_hint.test_widget')
        : t('sites_widgets.channel_hint.create_widget')
      : t('sites_widgets.channel_hint.create_site')
    : null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to={`/tenants/${manager.tenantId}/agents/${manager.agentId}`} className="text-sm font-semibold text-[var(--primary-hover)] hover:underline">
            {t('agent_config.back_to_agent')}
          </Link>
          <h2 className="mt-2 text-lg font-bold text-[var(--text)]">{t('sites_widgets.title')}</h2>
          <p className="mt-1 break-all text-sm text-[var(--text-muted)]">{manager.agentDetail?.name ?? manager.agentId}</p>
        </div>
        <RefreshButton onClick={() => void manager.loadSitesWidgets()} />
      </div>

      {manager.notice ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">{manager.notice}</div> : null}
      {manager.errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">{manager.errorMessage}</div> : null}
      {manager.formError ? <p className="text-sm font-medium text-rose-600">{manager.formError}</p> : null}
      <SitesWidgetsEvidenceBlock manager={manager} />
      <MutationResultBlock title={t('sites_widgets.mutation_result')} result={manager.mutationResult} hideMissingOptionalFields />

      {manager.isLoading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)]">{t('common.loading')}</div>
      ) : (
        <>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">{t('sites_widgets.status_title')}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{t('sites_widgets.status_subtitle')}</p>
              </div>
              {manager.status?.readinessStatus ? (
                <StatusBadge
                  status={manager.status.readinessStatus}
                  label={translateBackendValue(t, 'sites_widgets.readiness_status', manager.status.readinessStatus)}
                />
              ) : null}
            </div>
            <div className="mt-4">
              <InfoGrid
                items={[
                  { label: t('sites_widgets.public_required'), value: manager.status?.publicChannelRequired ? t('common.yes') : t('common.no') },
                  { label: t('sites_widgets.public_in_use'), value: manager.status?.publicChannelInUse ? t('common.yes') : t('common.no') },
                  { label: t('sites_widgets.total_sites'), value: manager.status?.totalSites ?? 0 },
                  { label: t('sites_widgets.total_widgets'), value: manager.status?.totalWidgets ?? 0 },
                ]}
              />
            </div>
            <div className="mt-3">
              <ListBlock
                title={t('sites_widgets.issues')}
                values={(manager.status?.issues ?? []).map((issue) => translateBackendValue(t, 'sites_widgets.issue', issue))}
              />
            </div>
            {statusActionHint ? (
              <p className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm font-semibold text-[var(--text)]">
                {statusActionHint}
              </p>
            ) : null}
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('sites_widgets.create_site')}</h3>
              <div className="mt-3 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('sites_widgets.hostname')}</span>
                  <input value={manager.siteForm.hostname} disabled={disabled} onChange={(event) => manager.setSiteForm((current) => ({ ...current, hostname: event.target.value }))} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]" />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('sites_widgets.allowed_origins')}</span>
                  <textarea value={manager.siteForm.allowedOriginsText} disabled={disabled} rows={3} onChange={(event) => manager.setSiteForm((current) => ({ ...current, allowedOriginsText: event.target.value }))} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]" />
                  <span className="text-xs text-[var(--text-muted)]">{t('sites_widgets.allowed_origins_help')}</span>
                </label>
                {originPreview.origins.length > 0 ? (
                  <div className="grid gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('sites_widgets.allowed_origins_preview')}</span>
                    <ChipList values={originPreview.origins} />
                  </div>
                ) : null}
                {originPreview.invalidLines.length > 0 ? (
                  <p className="text-sm font-medium text-rose-600">{t('sites_widgets.validation.allowed_origins_invalid')}</p>
                ) : null}
              </div>
              <button type="button" disabled={disabled} onClick={() => void manager.createSite()} className="mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]">
                {t('sites_widgets.create_site')}
              </button>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('sites_widgets.create_widget')}</h3>
              <div className="mt-3 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('sites_widgets.site')}</span>
                  <select value={manager.widgetForm.siteId} disabled={disabled} onChange={(event) => manager.setWidgetForm((current) => ({ ...current, siteId: event.target.value }))} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]">
                    <option value="" />
                    {manager.sites.map((site) => <option key={site.id} value={site.id}>{site.hostname}</option>)}
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('sites_widgets.widget_key')}</span>
                  <input value={manager.widgetForm.widgetKey} disabled={disabled} onChange={(event) => manager.setWidgetForm((current) => ({ ...current, widgetKey: event.target.value }))} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]" />
                  <span className="text-xs text-[var(--text-muted)]">{t('sites_widgets.widget_key_help')}</span>
                </label>
                {!widgetKeyValid ? <p className="text-sm font-medium text-rose-600">{t('sites_widgets.validation.widget_key_format')}</p> : null}
              </div>
              <button type="button" disabled={!canCreateWidget} onClick={() => void manager.createWidget()} className="mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]">
                {t('sites_widgets.create_widget')}
              </button>
              {!manager.canManageSitesWidgets ? <p className="mt-3 text-sm text-[var(--text-muted)]">{t('sites_widgets.permission_readonly')}</p> : null}
            </div>
          </section>

          <section className="grid gap-3 xl:grid-cols-2">
            {manager.sites.map((site) => (
              <article key={site.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
                <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text)]">{site.hostname}</h3>
                        <p className="mt-1 break-all text-xs text-[var(--text-muted)]">{site.id}</p>
                      </div>
                  <StatusBadge status={site.status} label={translateBackendValue(t, 'sites_widgets.status', site.status)} />
                </div>
                <div className="mt-3">
                  <ListBlock title={t('sites_widgets.allowed_origins')} values={site.externalAllowedOrigins} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={disabled || site.status === 'active'} onClick={() => confirmAction(`${t('sites_widgets.confirm_site_status')} ${translateBackendValue(t, 'sites_widgets.status', 'active')}`, () => void manager.changeSiteStatus(site.id, 'active'))} className="inline-flex h-9 items-center rounded-xl border border-[var(--border)] px-3 text-sm font-semibold text-[var(--text)] disabled:bg-[var(--surface-muted)]">{t('sites_widgets.activate')}</button>
                  <button type="button" disabled={disabled || site.status === 'inactive'} onClick={() => confirmAction(`${t('sites_widgets.confirm_site_status')} ${translateBackendValue(t, 'sites_widgets.status', 'inactive')}`, () => void manager.changeSiteStatus(site.id, 'inactive'))} className="inline-flex h-9 items-center rounded-xl border border-[var(--border)] px-3 text-sm font-semibold text-[var(--text)] disabled:bg-[var(--surface-muted)]">{t('sites_widgets.deactivate')}</button>
                </div>
              </article>
            ))}
          </section>

          <section className="grid gap-3 xl:grid-cols-2">
            {manager.widgets.map((widget) => (
              (() => {
                const binding = manager.status?.bindings.find((item) => item.widgetId === widget.id || item.widgetKey === widget.widgetKey)
                const snippet = binding ? buildBackendInstallSnippet(binding) : null

                return (
                  <article key={widget.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-[var(--text)]">{widget.widgetKey}</h3>
                        <p className="mt-1 break-all text-xs text-[var(--text-muted)]">{widget.id}</p>
                      </div>
                      <StatusBadge status={widget.status} label={translateBackendValue(t, 'sites_widgets.status', widget.status)} />
                    </div>
                    <div className="mt-3">
                      <InfoGrid
                        items={[
                          { label: t('sites_widgets.site'), value: binding?.siteId ?? widget.siteId },
                          { label: t('agents.agent'), value: widget.agentId },
                          { label: t('sites_widgets.hostname'), value: binding?.siteHostname ?? t('agents.empty_value') },
                          { label: t('sites_widgets.allowed_origins_count'), value: binding?.allowedOriginsCount ?? t('agents.empty_value') },
                          { label: t('sites_widgets.binding_ready'), value: binding ? (binding.ready ? t('common.yes') : t('common.no')) : t('agents.empty_value') },
                        ]}
                      />
                    </div>
                    <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('sites_widgets.install_guidance')}</h4>
                        {snippet ? (
                          <button type="button" onClick={() => copyInstallSnippet(snippet)} className="inline-flex h-8 items-center justify-center rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface)]">
                            {t('sites_widgets.copy_install_snippet')}
                          </button>
                        ) : null}
                      </div>
                      {snippet ? (
                        <pre className="mt-2 overflow-x-auto text-xs text-[var(--text)]">{snippet}</pre>
                      ) : (
                        <p className="mt-2 text-sm text-[var(--text-muted)]">{t('sites_widgets.install_guidance_unavailable')}</p>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" disabled={disabled || widget.status === 'active'} onClick={() => confirmAction(`${t('sites_widgets.confirm_widget_status')} ${translateBackendValue(t, 'sites_widgets.status', 'active')}`, () => void manager.changeWidgetStatus(widget.id, 'active'))} className="inline-flex h-9 items-center rounded-xl border border-[var(--border)] px-3 text-sm font-semibold text-[var(--text)] disabled:bg-[var(--surface-muted)]">{t('sites_widgets.activate')}</button>
                      <button type="button" disabled={disabled || widget.status === 'inactive'} onClick={() => confirmAction(`${t('sites_widgets.confirm_widget_status')} ${translateBackendValue(t, 'sites_widgets.status', 'inactive')}`, () => void manager.changeWidgetStatus(widget.id, 'inactive'))} className="inline-flex h-9 items-center rounded-xl border border-[var(--border)] px-3 text-sm font-semibold text-[var(--text)] disabled:bg-[var(--surface-muted)]">{t('sites_widgets.deactivate')}</button>
                    </div>
                  </article>
                )
              })()
            ))}
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <h3 className="text-sm font-bold text-[var(--text)]">{t('sites_widgets.public_test_title')}</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{t('sites_widgets.smoke_subtitle')}</p>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('sites_widgets.widget_key')}</span>
                <input value={manager.smokeForm.widgetKey} onChange={(event) => manager.setSmokeForm((current) => ({ ...current, widgetKey: event.target.value }))} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]" />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('sites_widgets.smoke_message')}</span>
                <input value={manager.smokeForm.messageText} onChange={(event) => manager.setSmokeForm((current) => ({ ...current, messageText: event.target.value }))} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)]" />
              </label>
            </div>
            <button type="button" disabled={!canRunPublicWidgetTest} onClick={() => void manager.runSmoke()} className="mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]">
              {t('sites_widgets.run_smoke')}
            </button>
            {manager.smokeError ? <p className="mt-3 text-sm font-medium text-rose-600">{manager.smokeError}</p> : null}
            {manager.smokeResult ? (
              <div className="mt-4">
                <InfoGrid items={[
                  { label: t('sites_widgets.chat_id'), value: manager.smokeResult.chatId ?? t('agents.empty_value') },
                  { label: t('sites_widgets.outcome'), value: translateBackendValue(t, 'sites_widgets.smoke_outcome', manager.smokeResult.outcomeClassification) },
                  { label: t('sites_widgets.replay'), value: translateBackendValue(t, 'sites_widgets.smoke_replay', manager.smokeResult.replayClassification) },
                  { label: t('errors.request_id'), value: manager.smokeResult.correlationId ?? t('agents.empty_value') },
                ]} />
              </div>
            ) : null}
            {selectedWidget && selectedSite ? <p className="mt-3 text-xs text-[var(--text-muted)]">{selectedSite.hostname} / {selectedWidget.widgetKey}</p> : null}
          </section>
        </>
      )}
    </div>
  )
}
