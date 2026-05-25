import { Link } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import type { AgentDetailManager } from '@/modules/Agents/model/useAgentDetailManager'
import { CopyableValue, InfoGrid, MutationResultBlock, StatusBadge } from '@/shared/ui/EntityInfo'
import { RefreshButton } from '@/shared/ui/RefreshButton'

const AGENT_TEXT_KEYS: Record<string, string> = {
  'Answer bounded sales and support questions from approved knowledge': 'agents.text.sales_support_manual_smoke_purpose',
  'Manual smoke agent for first service E2E verification': 'agents.text.sales_support_manual_smoke_description',
}

function translatedValue(t: (key: string) => string, namespace: string, value: string | null | undefined) {
  if (!value) return t('agents.empty_value')
  const key = `${namespace}.${value}`
  const translated = t(key)
  return translated === key ? value : translated
}

function translatedKnownAgentText(t: (key: string) => string, value: string | null | undefined, emptyValue = t('agents.empty_value')) {
  if (!value) return emptyValue
  const key = AGENT_TEXT_KEYS[value]
  if (!key) return value
  const translated = t(key)
  return translated === key ? value : translated
}

function translatedSetupDetail(t: (key: string) => string, itemId: string, fallback: string) {
  const key = `agents.setup_item_detail.${itemId}`
  const translated = t(key)
  return translated === key ? fallback : translated
}

function setupRouteForOwner(tenantId: string, agentId: string, ownerArea: string) {
  if (ownerArea === 'knowledge') return `/tenants/${tenantId}/agents/${agentId}/knowledge`
  if (ownerArea === 'capabilities') return `/tenants/${tenantId}/agents/${agentId}/capabilities`
  if (ownerArea === 'policy' || ownerArea === 'policy_profile') return `/tenants/${tenantId}/agents/${agentId}/policy`
  if (ownerArea === 'channel_binding' || ownerArea === 'site_widget') return `/tenants/${tenantId}/agents/${agentId}/sites-widgets`
  return `/tenants/${tenantId}/agents/${agentId}/config`
}

function setupRouteForStatus(tenantId: string, agentId: string, statusKey: string) {
  if (statusKey === 'knowledge') return `/tenants/${tenantId}/agents/${agentId}/knowledge`
  if (statusKey === 'capabilities') return `/tenants/${tenantId}/agents/${agentId}/capabilities`
  if (statusKey === 'policy') return `/tenants/${tenantId}/agents/${agentId}/policy`
  if (statusKey === 'channel') return `/tenants/${tenantId}/agents/${agentId}/sites-widgets`
  if (statusKey === 'release') return `/tenants/${tenantId}/agents/${agentId}/releases`
  return `/tenants/${tenantId}/agents/${agentId}/config`
}

function setupButtonClass(active: boolean) {
  return [
    'inline-flex min-h-10 items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold [overflow-wrap:anywhere]',
    active
      ? 'border-[var(--primary)] bg-[var(--primary)] text-white hover:border-[var(--primary-hover)] hover:bg-[var(--primary-hover)] hover:text-white'
      : 'border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-muted)]',
  ].join(' ')
}

function setupStatusTone(status: string) {
  if (status === 'ready' || status === 'active' || status === 'selected' || status === 'configured') return 'ready'
  if (status === 'blocked' || status === 'failed') return 'blocked'
  return 'missing'
}

function setupStatusIsReady(status: string) {
  return status === 'ready' || status === 'active' || status === 'selected' || status === 'configured'
}

function ListBlock({ title, values }: { title: string; values: string[] }) {
  const { t } = useI18n()

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{title}</h4>
      {values.length > 0 ? (
        <ul className="mt-2 grid gap-1 text-sm text-[var(--text-muted)]">
          {values.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-[var(--text-muted)]">{t('agents.empty_value')}</p>
      )}
    </div>
  )
}

function confirmAction(message: string, action: () => void) {
  if (window.confirm(message)) action()
}

export function AgentDetailView({ manager }: { manager: AgentDetailManager }) {
  const { t } = useI18n()
  const detail = manager.detail
  const canEditMetadata = manager.allowedMutationActions.updateMetadata
  const canChangeStatus = manager.allowedMutationActions.changeStatus
  const canChangeLifecycle = manager.allowedMutationActions.changeLifecycle
  const blockingSetupItem = manager.setupChecklist?.items.find((item) => item.blocking && item.state !== 'ready')
  const blockingSetupItems = manager.setupChecklist?.items.filter((item) => item.blocking && item.state !== 'ready') ?? []
  const capabilitiesNeedSave = Boolean(detail && !setupStatusIsReady(detail.setupReadinessSummary.capabilityStatus))
  const hasSetupBlockers = Boolean(detail && detail.setupReadinessSummary.blockingItemCount > 0)
  const canActivateAgent = canChangeStatus && !hasSetupBlockers
  const canActivateLifecycle = canChangeLifecycle && !hasSetupBlockers
  const setupSummaryStatuses = detail ? [
    {
      key: 'config',
      label: t('agents.setup_status.config'),
      status: detail.setupReadinessSummary.agentConfigStatus,
      route: setupRouteForStatus(manager.tenantId, manager.agentId, 'config'),
      blocksSetup: false,
    },
    {
      key: 'knowledge',
      label: t('agents.setup_status.knowledge'),
      status: detail.setupReadinessSummary.knowledgeStatus,
      route: setupRouteForStatus(manager.tenantId, manager.agentId, 'knowledge'),
      blocksSetup: true,
    },
    {
      key: 'capabilities',
      label: t('agents.setup_status.capabilities'),
      status: detail.setupReadinessSummary.capabilityStatus,
      route: setupRouteForStatus(manager.tenantId, manager.agentId, 'capabilities'),
      blocksSetup: true,
    },
    {
      key: 'policy',
      label: t('agents.setup_status.policy'),
      status: detail.setupReadinessSummary.policyStatus,
      route: setupRouteForStatus(manager.tenantId, manager.agentId, 'policy'),
      blocksSetup: true,
    },
    {
      key: 'channel',
      label: t('agents.setup_status.channel'),
      status: detail.setupReadinessSummary.siteWidgetStatus,
      route: setupRouteForStatus(manager.tenantId, manager.agentId, 'channel'),
      blocksSetup: true,
    },
    {
      key: 'release',
      label: t('agents.setup_status.release'),
      status: detail.setupReadinessSummary.releaseReady ? 'ready' : 'blocked',
      route: setupRouteForStatus(manager.tenantId, manager.agentId, 'release'),
      blocksSetup: false,
    },
  ] : []
  const summaryBlockerItems = blockingSetupItems.length > 0
    ? blockingSetupItems.map((item) => ({
      key: item.itemId,
      label: translatedValue(t, 'agents.templates.owner_area', item.ownerArea),
      detail: translatedSetupDetail(t, item.itemId, item.detail),
      route: setupRouteForOwner(manager.tenantId, manager.agentId, item.ownerArea),
    }))
    : setupSummaryStatuses
      .filter((item) => item.blocksSetup && !setupStatusIsReady(item.status))
      .map((item) => ({
        key: item.key,
        label: item.label,
        detail: translatedValue(t, 'agents.setup_status_value', item.status),
        route: item.route,
      }))
  const nextSetupRoute = blockingSetupItem
    ? setupRouteForOwner(manager.tenantId, manager.agentId, blockingSetupItem.ownerArea)
    : setupSummaryStatuses.find((item) => item.blocksSetup && !setupStatusIsReady(item.status))?.route ?? null
  const blockerSummaryValue = summaryBlockerItems.length > 0 ? (
    <div className="grid gap-2">
      <details id="agent-setup-blockers" open className="group">
        <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--text)] hover:text-[var(--primary)]">
          {detail?.setupReadinessSummary.blockingItemCount ?? summaryBlockerItems.length}
          <span className="ml-2 text-xs font-medium text-[var(--text-muted)] group-open:hidden">
            {t('agents.detail.show_blockers')}
          </span>
          <span className="ml-2 hidden text-xs font-medium text-[var(--text-muted)] group-open:inline">
            {t('agents.detail.hide_blockers')}
          </span>
        </summary>
        <ul className="mt-2 grid gap-1 text-xs font-medium text-[var(--text-muted)]">
          {summaryBlockerItems.map((item) => (
            <li key={item.key}>
              <Link
                to={item.route}
                className="block cursor-pointer rounded-md px-1 py-0.5 text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--primary)] active:text-[var(--primary-hover)]"
              >
                <span className="font-semibold text-[var(--primary)] underline-offset-2 hover:underline">{item.label}</span>
                {': '}
                {item.detail}
              </Link>
            </li>
          ))}
        </ul>
      </details>
    </div>
  ) : detail?.setupReadinessSummary.blockingItemCount ?? 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to={`/tenants/${manager.tenantId}/agents`} className="text-sm font-semibold text-[var(--primary-hover)] hover:underline">
            {t('agents.back_to_agents')}
          </Link>
          <h2 className="mt-2 text-lg font-bold text-[var(--text)]">{detail?.name ?? t('agents.detail.title')}</h2>
          <p className="mt-1 break-all text-sm text-[var(--text-muted)]">{manager.agentId}</p>
        </div>
        <div className="flex max-w-5xl flex-col gap-2 lg:items-end">
          {detail ? (
            <>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Link
                  to={`/tenants/${manager.tenantId}/agents/${manager.agentId}/config`}
                  className={setupButtonClass(nextSetupRoute === `/tenants/${manager.tenantId}/agents/${manager.agentId}/config` || (!nextSetupRoute && !detail.activeConfigId))}
                >
                  {t('agents.detail.configure_now')}
                </Link>
                <Link
                  to={`/tenants/${manager.tenantId}/agents/${manager.agentId}/knowledge`}
                  className={setupButtonClass(nextSetupRoute === `/tenants/${manager.tenantId}/agents/${manager.agentId}/knowledge`)}
                >
                  {t('knowledge.manage_knowledge')}
                </Link>
                <Link
                  to={`/tenants/${manager.tenantId}/agents/${manager.agentId}/capabilities`}
                  className={setupButtonClass(nextSetupRoute === `/tenants/${manager.tenantId}/agents/${manager.agentId}/capabilities`)}
                >
                  <span>{t('agent_capabilities.manage_capabilities')}</span>
                  {capabilitiesNeedSave ? (
                    <span className="ml-2 rounded-full border border-current/30 px-2 py-0.5 text-[11px] font-bold">
                      {t('agents.detail.requires_save_badge')}
                    </span>
                  ) : null}
                </Link>
                <Link
                  to={`/tenants/${manager.tenantId}/agents/${manager.agentId}/policy`}
                  className={setupButtonClass(nextSetupRoute === `/tenants/${manager.tenantId}/agents/${manager.agentId}/policy`)}
                >
                  {t('agent_policy.manage_policy')}
                </Link>
                <Link
                  to={`/tenants/${manager.tenantId}/agents/${manager.agentId}/sites-widgets`}
                  className={setupButtonClass(nextSetupRoute === `/tenants/${manager.tenantId}/agents/${manager.agentId}/sites-widgets`)}
                >
                  {t('sites_widgets.manage_sites_widgets')}
                </Link>
                <Link
                  to={`/tenants/${manager.tenantId}/agents/${manager.agentId}/releases`}
                  className={setupButtonClass(nextSetupRoute === `/tenants/${manager.tenantId}/agents/${manager.agentId}/releases`)}
                >
                  {t('releases.manage_releases')}
                </Link>
                <RefreshButton onClick={() => void manager.loadAgent()} />
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {setupSummaryStatuses.map((item) => {
                  const content = (
                    <>
                      <span className="text-[var(--text-muted)]">{item.label}:</span>
                      <StatusBadge
                        status={setupStatusTone(item.status)}
                        label={translatedValue(t, 'agents.setup_status_value', item.status)}
                      />
                    </>
                  )
                  if (item.key === 'release' && !setupStatusIsReady(item.status)) {
                    return (
                      <span
                        key={item.label}
                        title={t('agents.detail.release_blocked_tooltip')}
                        aria-disabled="true"
                        className="inline-flex cursor-not-allowed items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-muted)]"
                      >
                        {content}
                      </span>
                    )
                  }
                  return (
                    <Link
                      key={item.label}
                      to={item.route}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--text)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    >
                      {content}
                    </Link>
                  )
                })}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {manager.notice ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {manager.notice}
        </div>
      ) : null}
      {manager.errorMessage ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {manager.errorMessage}
        </div>
      ) : null}
      {manager.formError ? <p className="text-sm font-medium text-rose-600">{manager.formError}</p> : null}
      <MutationResultBlock title={t('agents.mutation_result')} result={manager.mutationResult} />

      {manager.isLoading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)]">
          {t('common.loading')}
        </div>
      ) : !detail ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <h3 className="text-sm font-bold text-[var(--text)]">{t('agents.detail.empty_title')}</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t('agents.detail.empty_subtitle')}</p>
        </div>
      ) : (
        <>
          {!detail.activeConfigId ? (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-[var(--shadow-soft)] dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              <h3 className="font-bold">{t('agents.detail.config_required_title')}</h3>
              <p className="mt-1">{t('agents.detail.config_required_subtitle')}</p>
              <Link
                to={`/tenants/${manager.tenantId}/agents/${manager.agentId}/config`}
                className="mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-amber-300 bg-amber-100 px-4 text-sm font-bold text-amber-950 hover:bg-amber-200 dark:border-amber-400/40 dark:bg-amber-400/20 dark:text-amber-50"
              >
                {t('agent_config.manage_config')}
              </Link>
            </section>
          ) : null}

          {capabilitiesNeedSave ? (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-[var(--shadow-soft)] dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
              <p className="font-semibold">{t('agents.detail.capabilities_not_saved')}</p>
              <Link
                to={`/tenants/${manager.tenantId}/agents/${manager.agentId}/capabilities`}
                className="mt-2 inline-flex font-bold text-amber-950 underline dark:text-amber-50"
              >
                {t('agent_capabilities.manage_capabilities')}
              </Link>
            </section>
          ) : null}

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">{t('agents.detail.summary')}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{translatedKnownAgentText(t, detail.purpose)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={detail.status} label={translatedValue(t, 'agents.status', detail.status)} />
                <StatusBadge status={detail.lifecycleStatus} label={translatedValue(t, 'agents.lifecycle_status', detail.lifecycleStatus)} />
                <StatusBadge
                  status={detail.setupReadinessSummary.overallReadinessStatus}
                  label={translatedValue(t, 'agents.readiness_status', detail.setupReadinessSummary.overallReadinessStatus)}
                />
              </div>
            </div>
            <div className="mt-4">
              <InfoGrid
                items={[
                  {
                    label: t('agents.template'),
                    value: detail.templateId
                      ? translatedValue(t, 'agents.templates.template_label', detail.templateId)
                      : translatedValue(t, 'agents.templates.archetype', detail.archetypeId),
                  },
                  {
                    label: t('agents.active_config'),
                    value: detail.activeConfigId ? <CopyableValue value={detail.activeConfigId} /> : t('agents.empty_value'),
                  },
                  { label: t('agents.release_ready'), value: detail.setupReadinessSummary.releaseReady ? t('common.yes') : t('common.no') },
                  { label: t('agents.blockers'), value: blockerSummaryValue },
                  { label: t('agents.public_channel'), value: detail.setupReadinessSummary.publicChannelInUse ? t('common.yes') : t('common.no') },
                  {
                    label: t('agents.release_handoff'),
                    value: translatedValue(t, 'agents.release_handoff_target', detail.setupReadinessSummary.releaseHandoffTarget),
                  },
                ]}
              />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('agents.detail.edit_title')}</h3>
              <div className="mt-4 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('agents.name')}</span>
                  <input
                    value={manager.editForm.name}
                    onChange={(event) => manager.updateEditForm({ name: event.target.value })}
                    disabled={!canEditMetadata || manager.isMutating}
                    className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('agents.purpose')}</span>
                  <textarea
                    value={translatedKnownAgentText(t, manager.editForm.purpose, '')}
                    onChange={(event) => manager.updateEditForm({ purpose: event.target.value })}
                    disabled={!canEditMetadata || manager.isMutating}
                    rows={3}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('agents.description')}</span>
                  <textarea
                    value={translatedKnownAgentText(t, manager.editForm.description, '')}
                    onChange={(event) => manager.updateEditForm({ description: event.target.value })}
                    disabled={!canEditMetadata || manager.isMutating}
                    rows={3}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
                  />
                </label>
              </div>
              {!manager.canMutate ? <p className="mt-3 text-sm text-[var(--text-muted)]">{t('agents.permission_readonly')}</p> : null}
              {manager.canMutate && !canEditMetadata ? <p className="mt-3 text-sm text-[var(--text-muted)]">{t('agents.detail.action_not_available')}</p> : null}
              <button
                type="button"
                onClick={() => void manager.saveMetadata()}
                disabled={!canEditMetadata || manager.isMutating}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
              >
                {t('agents.detail.save_metadata')}
              </button>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('agents.detail.actions_title')}</h3>
              {hasSetupBlockers ? (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                  <p className="font-semibold">
                    {t('agents.detail.activation_blocked_by_setup')}{' '}
                    <a href="#agent-setup-blockers" className="font-bold text-amber-950 underline dark:text-amber-50">
                      {t('agents.detail.show_blockers')}
                    </a>
                  </p>
                  {summaryBlockerItems.length > 0 ? (
                    <ul className="mt-2 grid gap-1">
                      {summaryBlockerItems.map((item) => (
                        <li key={item.key}>
                          <Link
                            to={item.route}
                            className="block cursor-pointer rounded-md px-1 py-0.5 text-amber-900 hover:bg-amber-100 hover:text-amber-950 active:text-amber-800 dark:text-amber-100 dark:hover:bg-amber-400/20 dark:hover:text-amber-50"
                          >
                            <span className="font-bold underline">{item.label}</span>
                            {': '}
                            {item.detail}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {blockingSetupItem ? (
                    <Link
                      to={setupRouteForOwner(manager.tenantId, manager.agentId, blockingSetupItem.ownerArea)}
                      className="mt-2 inline-flex font-bold text-amber-950 underline dark:text-amber-50"
                    >
                      {t('agents.detail.next_setup_step')}: {translatedValue(t, 'agents.templates.owner_area', blockingSetupItem.ownerArea)}
                    </Link>
                  ) : null}
                </div>
              ) : null}
              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={() => confirmAction(t('agents.detail.confirm_activate'), () => void manager.updateStatus('active'))}
                  disabled={!canActivateAgent || manager.isMutating}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
                >
                  {t('agents.detail.activate')}
                </button>
                <button
                  type="button"
                  onClick={() => confirmAction(t('agents.detail.confirm_inactivate'), () => void manager.updateStatus('inactive'))}
                  disabled={!canChangeStatus || manager.isMutating}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
                >
                  {t('agents.detail.inactivate')}
                </button>
                <button
                  type="button"
                  onClick={() => confirmAction(t('agents.detail.confirm_lifecycle_active'), () => void manager.updateLifecycle('active'))}
                  disabled={!canActivateLifecycle || manager.isMutating}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
                >
                  {t('agents.detail.lifecycle_active')}
                </button>
                <button
                  type="button"
                  onClick={() => confirmAction(t('agents.detail.confirm_lifecycle_disabled'), () => void manager.updateLifecycle('disabled'))}
                  disabled={!canChangeLifecycle || manager.isMutating}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
                >
                  {t('agents.detail.lifecycle_disabled')}
                </button>
              </div>
              {manager.canMutate && (!canChangeStatus || !canChangeLifecycle) ? (
                <p className="mt-3 text-sm text-[var(--text-muted)]">{t('agents.detail.action_not_available')}</p>
              ) : null}
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('agents.detail.setup_title')}</h3>
              <div className="mt-3 grid gap-2">
                {manager.setupChecklist?.items.length ? (
                  manager.setupChecklist.items.map((item) => (
                    <div key={item.itemId} className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-[var(--text)]">{translatedValue(t, 'agents.templates.owner_area', item.ownerArea)}</span>
                        <StatusBadge status={item.state} label={translatedValue(t, 'agents.setup_item_state', item.state)} />
                      </div>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">{translatedSetupDetail(t, item.itemId, item.detail)}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--text-muted)]">
                    {t('agents.detail.setup_items_shown_above')}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('agents.detail.foundation_title')}</h3>
              <div className="mt-3">
                <InfoGrid
                  items={[
                    {
                      label: t('agents.validation'),
                      value: translatedValue(t, 'agents.validation_status', manager.foundationAssessment?.validationStatus ?? detail.foundationAssessmentSummary.validationStatus),
                    },
                    {
                      label: t('agents.compatibility'),
                      value: translatedValue(t, 'agents.compatibility_status', manager.foundationAssessment?.compatibilityStatus ?? detail.foundationAssessmentSummary.compatibilityStatus),
                    },
                    {
                      label: t('agents.processing_path'),
                      value: translatedValue(t, 'agents.processing_path_value', manager.foundationAssessment?.processingPath ?? detail.foundationAssessmentSummary.processingPath),
                    },
                    {
                      label: t('agents.safe_defaults'),
                      value: detail.foundationAssessmentSummary.safeDefaultsApplied
                        ? t('agents.safe_defaults_applied')
                        : t('agents.safe_defaults_not_required'),
                    },
                  ]}
                />
              </div>
              <div className="mt-3">
                <ListBlock
                  title={t('agents.issues')}
                  values={(manager.foundationAssessment?.issues ?? detail.foundationAssessmentSummary.issues).map((issue) =>
                    translatedValue(t, 'agents.issue', issue)
                  )}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('agents.detail.channel_title')}</h3>
              <div className="mt-3">
                <InfoGrid
                  items={[
                    {
                      label: t('agents.readiness'),
                      value: translatedValue(t, 'agents.readiness_status', manager.channelBinding?.readinessStatus ?? detail.channelBindingSummary.readinessStatus),
                    },
                    { label: t('agents.public_channel'), value: (manager.channelBinding?.publicChannelInUse ?? detail.channelBindingSummary.publicChannelInUse) ? t('common.yes') : t('common.no') },
                    { label: t('agents.widget_bindings'), value: manager.channelBinding?.bindings.length ?? detail.channelBindingSummary.bindingCount },
                    {
                      label: t('agents.release_handoff'),
                      value: translatedValue(t, 'agents.release_handoff_target', manager.channelBinding?.releaseHandoffTarget ?? detail.channelBindingSummary.releaseHandoffTarget),
                    },
                  ]}
                />
              </div>
              <div className="mt-3">
                <ListBlock
                  title={t('agents.channels')}
                  values={(manager.channelBinding?.supportedChannels ?? detail.channelBindingSummary.supportedChannels).map((channel) =>
                    translatedValue(t, 'agents.templates.channel', channel)
                  )}
                />
              </div>
            </div>
          </section>

        </>
      )}
    </div>
  )
}
