import { Link } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import type { ReleaseDetail } from '@/modules/Releases/api/releasesApi'
import type { ReleasesManager } from '@/modules/Releases/model/useReleasesManager'
import { InfoGrid, ListBlock, MutationResultBlock, StatusBadge } from '@/shared/ui/EntityInfo'
import { RefreshButton } from '@/shared/ui/RefreshButton'

function keySuffix(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

function translateBackendValue(t: (key: string) => string, namespace: string, value: string | null | undefined) {
  if (!value) return t('agents.empty_value')
  const key = `${namespace}.${keySuffix(value)}`
  const translated = t(key)
  return translated === key ? value : translated
}

function formatReadinessItem(t: (key: string) => string, item: { itemId: string; ownerArea: string; state: string; detail: string; requiredAction: string | null }) {
  const label = translateBackendValue(t, 'releases.readiness_item', item.itemId || item.ownerArea)
  const state = translateBackendValue(t, 'releases.readiness_state', item.state)
  const detailKey = `releases.readiness_detail.${keySuffix(item.itemId)}`
  const detail = t(detailKey)
  const translatedDetail = detail === detailKey ? item.detail : detail
  const action = item.requiredAction ? translateBackendValue(t, 'releases.required_action', item.requiredAction) : null
  return action ? `${label}: ${state} - ${translatedDetail}. ${action}` : `${label}: ${state} - ${translatedDetail}`
}

function confirmationSummary(
  action: string,
  release: ReleaseDetail | null,
  t: (key: string) => string,
  releaseStatus: (value: string | null | undefined) => string,
  gateMode: (value: string | null | undefined) => string,
) {
  if (!release) return action
  return `${action}: v${release.releaseVersion}, ${releaseStatus(release.status)}, ${gateMode(release.gateMode)}, ${t('releases.active')}=${release.active ? t('common.yes') : t('common.no')}`
}

function confirmAction(message: string, action: () => void) {
  if (window.confirm(message)) action()
}

export function ReleasesView({ manager }: { manager: ReleasesManager }) {
  const { t } = useI18n()
  const disabled = !manager.canManageReleases || manager.isMutating
  const selected = manager.selectedRelease
  const releaseStatus = (value: string | null | undefined) => translateBackendValue(t, 'releases.status', value)
  const gateMode = (value: string | null | undefined) => translateBackendValue(t, 'releases.gate_mode', value)
  const ownerMarker = (value: string | null | undefined) => translateBackendValue(t, 'releases.owner_marker', value)
  const overrideStatus = (value: string | null | undefined) => translateBackendValue(t, 'releases.override_status', value)
  const permissionTooltip = !manager.canManageReleases ? t('releases.create_permission_tooltip') : undefined

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to={`/tenants/${manager.tenantId}/agents/${manager.agentId}`} className="text-sm font-semibold text-[var(--primary-hover)] hover:underline">
            {t('agent_config.back_to_agent')}
          </Link>
          <h2 className="mt-2 text-lg font-bold text-[var(--text)]">{t('releases.title')}</h2>
          <p className="mt-1 break-all text-sm text-[var(--text-muted)]">{manager.agentDetail?.name ?? manager.agentId}</p>
        </div>
        <RefreshButton onClick={() => void manager.loadReleases()} />
      </div>

      {manager.notice ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">{manager.notice}</div> : null}
      {manager.errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">{manager.errorMessage}</div> : null}
      {manager.formError ? <p className="text-sm font-medium text-rose-600">{manager.formError}</p> : null}
      <MutationResultBlock title={t('releases.mutation_result')} result={manager.mutationResult} />

      {manager.isLoading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)]">{t('common.loading')}</div>
      ) : (
        <>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">{t('releases.readiness_title')}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{ownerMarker(manager.readiness?.publishOwnerMarker)}</p>
              </div>
              {manager.readiness?.readinessStatus ? <StatusBadge status={manager.readiness.readinessStatus} label={releaseStatus(manager.readiness.readinessStatus)} /> : null}
            </div>
            <div className="mt-4">
              <InfoGrid
                items={[
                  { label: t('agents.release_ready'), value: manager.readiness?.releaseReady ? t('common.yes') : t('common.no') },
                  { label: t('releases.blocking_items'), value: manager.readiness?.blockingItemCount ?? 0 },
                  { label: t('releases.active_release'), value: manager.readiness?.activeReleaseVersion ? `v${manager.readiness.activeReleaseVersion}` : t('agents.empty_value') },
                  { label: t('releases.active_release_gate_mode'), value: gateMode(manager.readiness?.activeReleaseGateMode) },
                  { label: t('releases.latest_release'), value: manager.readiness?.latestReleaseVersion ? `v${manager.readiness.latestReleaseVersion}` : t('agents.empty_value') },
                  { label: t('releases.latest_release_gate_mode'), value: gateMode(manager.readiness?.latestReleaseGateMode) },
                ]}
              />
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <ListBlock title={t('releases.readiness_items')} values={manager.readiness?.items.map((item) => formatReadinessItem(t, item)) ?? []} />
              <ListBlock
                title={t('releases.active_release_manual_override')}
                values={[
                  ...(manager.readiness?.activeReleaseManualOverride?.status ? [`${t('common.status')}: ${overrideStatus(manager.readiness.activeReleaseManualOverride.status)}`] : []),
                  ...(manager.readiness?.activeReleaseManualOverride?.reasonCode ? [`${t('releases.manual_override_reason')}: ${translateBackendValue(t, 'releases.override_reason', manager.readiness.activeReleaseManualOverride.reasonCode)}`] : []),
                  ...(manager.readiness?.activeReleaseManualOverride?.relatedMissingOrFailedItems.map((item) => translateBackendValue(t, 'releases.readiness_item', item)) ?? []),
                ]}
              />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('releases.list_title')}</h3>
              <div className="mt-3 grid gap-2">
                {manager.releases.length ? manager.releases.map((release) => (
                  <button key={release.releaseId} type="button" onClick={() => void manager.selectRelease(release.releaseId)} className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-left hover:border-[var(--primary)]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[var(--text)]">v{release.releaseVersion}</span>
                      <StatusBadge status={release.status} label={releaseStatus(release.status)} />
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{gateMode(release.gateMode)} / {t('releases.active')}: {release.active ? t('common.yes') : t('common.no')}</p>
                  </button>
                )) : <p className="text-sm text-[var(--text-muted)]">{t('releases.empty_list')}</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('releases.create_draft')}</h3>
              {!manager.canManageReleases ? (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                  {t('releases.permission_readonly')}
                </div>
              ) : null}
              {!manager.canManageReleases && manager.readiness?.releaseReady ? (
                <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm font-medium text-[var(--text)]">
                  {t('releases.next_action_platform_admin')}
                </div>
              ) : null}
              <div className="mt-3 grid gap-3">
                <input aria-label={t('releases.selected_config_id')} title={permissionTooltip} value={manager.draftForm.selectedConfigId} disabled={disabled} placeholder={t('releases.selected_config_id')} onChange={(event) => manager.setDraftForm((current) => ({ ...current, selectedConfigId: event.target.value }))} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]" />
                <input aria-label={t('releases.evidence_reference')} title={permissionTooltip} value={manager.draftForm.evidenceStableReference} disabled={disabled} placeholder={t('releases.evidence_reference')} onChange={(event) => manager.setDraftForm((current) => ({ ...current, evidenceStableReference: event.target.value }))} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]" />
                <input aria-label={t('releases.manual_override_reason')} title={permissionTooltip} value={manager.draftForm.manualOverrideReasonCode} disabled={disabled} placeholder={t('releases.manual_override_reason')} onChange={(event) => manager.setDraftForm((current) => ({ ...current, manualOverrideReasonCode: event.target.value }))} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]" />
                <textarea aria-label={t('releases.manual_override_items')} title={permissionTooltip} value={manager.draftForm.manualOverrideItemsText} disabled={disabled} rows={3} placeholder={t('releases.manual_override_items')} onChange={(event) => manager.setDraftForm((current) => ({ ...current, manualOverrideItemsText: event.target.value }))} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]" />
                <textarea aria-label={t('releases.manual_override_comment')} title={permissionTooltip} value={manager.draftForm.manualOverrideComment} disabled={disabled} rows={3} placeholder={t('releases.manual_override_comment')} onChange={(event) => manager.setDraftForm((current) => ({ ...current, manualOverrideComment: event.target.value }))} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]" />
              </div>
              <button type="button" title={permissionTooltip} disabled={disabled} onClick={() => confirmAction(t('releases.confirm_create'), () => void manager.createRelease())} className="mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]">
                {t('releases.create_draft')}
              </button>
            </div>
          </section>

          {selected ? (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text)]">{t('releases.detail_title')} v{selected.releaseVersion}</h3>
                  <p className="mt-1 break-all text-xs text-[var(--text-muted)]">{selected.releaseId}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={selected.status} label={releaseStatus(selected.status)} />
                  <StatusBadge status={selected.gateMode} label={gateMode(selected.gateMode)} />
                </div>
              </div>
              <div className="mt-4">
                <InfoGrid
                  items={[
                    { label: t('releases.active'), value: selected.active ? t('common.yes') : t('common.no') },
                    { label: t('releases.selected_config_version'), value: selected.selectedConfigVersion ?? t('agents.empty_value') },
                    { label: t('releases.evidence_reference'), value: selected.evidenceReference ?? t('agents.empty_value') },
                    { label: t('releases.evidence_passed'), value: selected.evidencePassed === null ? t('agents.empty_value') : selected.evidencePassed ? t('common.yes') : t('common.no') },
                    { label: t('releases.manual_override_used'), value: selected.manualOverride?.used ? t('common.yes') : t('common.no') },
                    { label: t('releases.manual_override_reason'), value: selected.manualOverride?.reasonCode ? translateBackendValue(t, 'releases.override_reason', selected.manualOverride.reasonCode) : t('agents.empty_value') },
                  ]}
                />
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <ListBlock title={t('releases.readiness_items')} values={selected.readinessItems.map((item) => formatReadinessItem(t, item))} />
                <ListBlock title={t('releases.missing_items')} values={selected.missingOrFailedItems.map((item) => formatReadinessItem(t, item))} />
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                <input aria-label={t('releases.publish_report_reference')} value={manager.publishForm.releaseReportReference} disabled={disabled} placeholder={t('releases.publish_report_reference')} onChange={(event) => manager.setPublishForm((current) => ({ ...current, releaseReportReference: event.target.value }))} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]" />
                <input aria-label={t('releases.publish_support_reference')} value={manager.publishForm.supportReconstructionReference} disabled={disabled} placeholder={t('releases.publish_support_reference')} onChange={(event) => manager.setPublishForm((current) => ({ ...current, supportReconstructionReference: event.target.value }))} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]" />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" disabled={disabled} onClick={() => confirmAction(confirmationSummary(t('releases.confirm_publish'), selected, t, releaseStatus, gateMode), () => void manager.publishSelected())} className="inline-flex h-10 items-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]">{t('releases.publish')}</button>
                <button type="button" disabled={disabled} onClick={() => confirmAction(confirmationSummary(t('releases.confirm_rollback'), selected, t, releaseStatus, gateMode), () => void manager.rollbackSelected())} className="inline-flex h-10 items-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] disabled:bg-[var(--surface-muted)]">{t('releases.rollback')}</button>
                <button type="button" disabled={disabled} onClick={() => confirmAction(confirmationSummary(t('releases.confirm_disable'), selected, t, releaseStatus, gateMode), () => void manager.disableSelected())} className="inline-flex h-10 items-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] disabled:bg-[var(--surface-muted)]">{t('releases.disable')}</button>
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  )
}
