import { Link } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import type { ReleaseDetail, ReleaseRetrievalEvidenceCandidate, RuntimeProviderPreflightRequirement } from '@/modules/Releases/api/releasesApi'
import { getUsageEvidenceNoCandidateReasonKey } from '@/modules/Releases/model/usageEvidenceCandidates'
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

function translateBackendKey(t: (key: string) => string, key: string | null | undefined) {
  if (!key) return t('agents.empty_value')
  const translated = t(key)
  return translated === key ? key : translated
}

function translateSmokeCaseId(t: (key: string) => string, caseId: string) {
  const labelKey = `release.evidence.${caseId}.label`
  const label = t(labelKey)
  return label === labelKey ? caseId : label
}

function getRetrievalEvidenceNoCandidateReasonKey(reason: string | null | undefined) {
  const knownReasons = new Set([
    'missing_selected_config',
    'managed_knowledge_not_required',
    'managed_knowledge_not_ready',
    'no_retrieval_evidence_candidate',
    'candidate_generation_failed',
    'candidate_source_unavailable',
  ])
  return reason && knownReasons.has(reason)
    ? `releases.retrieval_evidence.no_candidate_reason.${reason}`
    : 'releases.retrieval_evidence.no_candidate_reason.unknown'
}

function formatKnownReadinessDetail(t: (key: string) => string, itemId: string, fallback: string) {
  const detailKey = `releases.readiness_detail.${keySuffix(itemId)}`
  const detail = t(detailKey)
  return detail === detailKey ? fallback : detail
}

function formatEvaluationEvidenceDetail(t: (key: string) => string, detail: string) {
  const missingCases = getMissingSmokeCases(detail)
  if (!missingCases.length) return detail

  return `${t('releases.evaluation_evidence_missing_cases')}: ${missingCases.map((caseId) => translateSmokeCaseId(t, caseId)).join(', ')}. ${t('releases.evaluation_evidence_next_action')}`
}

function getMissingSmokeCases(detail: string) {
  return Array.from(new Set(detail.match(/sales_support\.[a-z0-9_]+/g) ?? []))
}

function compactMissingItem(t: (key: string) => string, item: { itemId: string; detail: string }) {
  if (item.itemId !== 'evaluation_evidence') return null
  const missingCases = getMissingSmokeCases(item.detail)
  if (!missingCases.length) return null
  return {
    summary: t('releases.compact_missing_smoke_cases').replace('{count}', String(missingCases.length)),
    cases: missingCases.map((caseId) => translateSmokeCaseId(t, caseId)),
  }
}

function formatReadinessItem(t: (key: string) => string, item: { itemId: string; ownerArea: string; state: string; detail: string; requiredAction: string | null }) {
  const label = translateBackendValue(t, 'releases.readiness_item', item.itemId || item.ownerArea)
  const state = translateBackendValue(t, 'releases.readiness_state', item.state)
  const translatedDetail = item.itemId === 'evaluation_evidence'
    ? formatEvaluationEvidenceDetail(t, item.detail)
    : formatKnownReadinessDetail(t, item.itemId, item.detail)
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

function formatRuntimeRequiredAction(t: (key: string) => string, requirement: RuntimeProviderPreflightRequirement) {
  if (requirement.state === 'missing_credential') {
    return t('releases.runtime_provider_missing_credential_action').replace('{credentialKey}', requirement.credentialKey || t('agents.empty_value'))
  }
  return requirement.requiredAction ?? t('agents.empty_value')
}

function RuntimeProviderPreflightSafeBlock({ requirements }: { requirements: RuntimeProviderPreflightRequirement[] }) {
  const { t } = useI18n()
  if (!requirements.length) return null

  return (
    <div className="mt-3 grid gap-2">
      {requirements.map((requirement) => (
        <div key={`${requirement.providerId}-${requirement.credentialKey}-${requirement.state}`} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
          <InfoGrid
            items={[
              { label: t('releases.runtime_provider_id'), value: requirement.providerId || t('agents.empty_value') },
              { label: t('releases.runtime_credential_key'), value: requirement.credentialKey || t('agents.empty_value') },
              { label: t('common.status'), value: translateBackendValue(t, 'releases.runtime_provider_state', requirement.state) },
              { label: t('releases.runtime_required_action'), value: formatRuntimeRequiredAction(t, requirement) },
            ]}
          />
        </div>
      ))}
    </div>
  )
}

function RetrievalEvidenceCandidateCard({
  candidate,
  selected,
  onSelect,
}: {
  candidate: ReleaseRetrievalEvidenceCandidate
  selected: boolean
  onSelect: () => void
}) {
  const { t } = useI18n()

  return (
    <label className="grid cursor-pointer gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] has-[:checked]:border-[var(--primary)]">
      <span className="flex items-start gap-2">
        <input
          type="radio"
          name="release-retrieval-evidence-candidate"
          checked={selected}
          onChange={onSelect}
        />
        <span className="grid gap-1">
          <span className="font-bold">{t('releases.retrieval_evidence.candidate')}</span>
          <span className="break-all text-xs text-[var(--text-muted)]">{t('releases.retrieval_evidence.stable_reference')}: {candidate.stableReference}</span>
          <span className="break-all text-xs text-[var(--text-muted)]">{t('releases.retrieval_evidence.support_reference')}: {candidate.supportReconstructionReference}</span>
        </span>
      </span>
      <InfoGrid
        items={[
          { label: t('releases.retrieval_evidence.release_candidate_id'), value: candidate.releaseCandidateId || t('agents.empty_value') },
          { label: t('releases.retrieval_evidence.retrieval_run_id'), value: candidate.retrievalRunId || t('agents.empty_value') },
          { label: t('releases.retrieval_evidence.selected_config_id'), value: candidate.selectedConfigId || t('agents.empty_value') },
          { label: t('releases.retrieval_evidence.status'), value: translateBackendValue(t, 'releases.retrieval_evidence.status_value', candidate.status) },
          { label: t('releases.retrieval_evidence.outcome'), value: translateBackendValue(t, 'releases.retrieval_evidence.outcome_value', candidate.outcome) },
          { label: t('releases.retrieval_evidence.selected_chunk_count'), value: candidate.selectedChunkCount },
          { label: t('releases.retrieval_evidence.citation_count'), value: candidate.citationCount },
          { label: t('releases.retrieval_evidence.created_at'), value: candidate.createdAt || t('agents.empty_value') },
          { label: t('releases.retrieval_evidence.source_ids'), value: candidate.sourceIds.length ? candidate.sourceIds.join(', ') : t('agents.empty_value') },
          { label: t('releases.retrieval_evidence.index_id'), value: candidate.indexId ?? t('agents.empty_value') },
          { label: t('releases.retrieval_evidence.index_version_id'), value: candidate.indexVersionId ?? t('agents.empty_value') },
          { label: t('releases.retrieval_evidence.source_set_key'), value: candidate.sourceSetKey ?? t('agents.empty_value') },
          { label: t('releases.retrieval_evidence.source_set_readiness_marker'), value: candidate.sourceSetReadinessMarker ?? t('agents.empty_value') },
        ]}
      />
      {candidate.problems.length ? <ListBlock title={t('releases.retrieval_evidence.problems')} values={candidate.problems} /> : null}
    </label>
  )
}

function RetrievalEvidenceBlock({ manager, disabled }: { manager: ReleasesManager; disabled: boolean }) {
  const { t } = useI18n()
  const candidates = manager.retrievalEvidenceCandidates
  const noCandidateReasonKey = getRetrievalEvidenceNoCandidateReasonKey(candidates?.noCandidateReason ?? candidates?.summary.noCandidateReason)
  const isUnknownReason = noCandidateReasonKey === 'releases.retrieval_evidence.no_candidate_reason.unknown'
  const rawReason = candidates?.noCandidateReason ?? candidates?.summary.noCandidateReason

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--text)]">{t('releases.retrieval_evidence.title')}</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t('releases.retrieval_evidence.help')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void manager.loadRetrievalEvidenceCandidates()}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border)] px-3 text-sm font-semibold text-[var(--text)] hover:border-[var(--primary)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
            disabled={manager.isLoadingRetrievalEvidenceCandidates}
          >
            {manager.isLoadingRetrievalEvidenceCandidates ? t('common.loading') : t('common.retry')}
          </button>
          <button
            type="button"
            onClick={() => void manager.generateRetrievalEvidenceCandidate()}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-3 text-sm font-bold text-white disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
            disabled={disabled || manager.isGeneratingRetrievalEvidenceCandidate}
          >
            {manager.isGeneratingRetrievalEvidenceCandidate ? t('releases.retrieval_evidence.generating') : t('releases.retrieval_evidence.generate')}
          </button>
        </div>
      </div>

      {manager.isLoadingRetrievalEvidenceCandidates ? (
        <p className="mt-3 text-sm text-[var(--text-muted)]">{t('common.loading')}</p>
      ) : manager.retrievalEvidenceCandidatesError ? (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">{manager.retrievalEvidenceCandidatesError}</p>
      ) : candidates?.items.length ? (
        <>
          <div className="mt-3 grid gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] sm:grid-cols-2">
            <span>{t('releases.retrieval_evidence.count')}: {candidates.summary.candidateCount}</span>
            <span>{t('releases.retrieval_evidence.generated_at')}: {candidates.generatedAt ?? t('agents.empty_value')}</span>
          </div>
          <div className="mt-3 grid gap-3 xl:grid-cols-2">
            {candidates.items.map((candidate) => (
              <RetrievalEvidenceCandidateCard
                key={candidate.candidateId}
                candidate={candidate}
                selected={manager.selectedRetrievalEvidenceCandidateId === candidate.candidateId}
                onSelect={() => manager.setSelectedRetrievalEvidenceCandidateId(candidate.candidateId)}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={disabled || !manager.selectedRetrievalEvidenceCandidate}
            onClick={manager.applyRetrievalEvidenceCandidateToDraftForm}
            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
          >
            {t('releases.retrieval_evidence.apply')}
          </button>
        </>
      ) : candidates ? (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          <p>{t(noCandidateReasonKey)}</p>
          {isUnknownReason && rawReason ? <p className="mt-1 break-all text-xs">{t('releases.retrieval_evidence.no_candidate_reason_value')}: {rawReason}</p> : null}
          {candidates.summary.requiredAction ? <p className="mt-1">{t('releases.retrieval_evidence.required_action')}: {candidates.summary.requiredAction}</p> : null}
          {candidates.summary.problems.length ? <ListBlock title={t('releases.retrieval_evidence.problems')} values={candidates.summary.problems} /> : null}
          {candidates.generatedAt ? <p className="mt-1 text-xs">{t('releases.retrieval_evidence.generated_at')}: {candidates.generatedAt}</p> : null}
        </div>
      ) : null}
    </section>
  )
}

function SmokeCaseMatrix({ manager, disabled }: { manager: ReleasesManager; disabled: boolean }) {
  const { t } = useI18n()
  const evidenceReference = manager.draftForm.evidenceStableReference.trim()
  const canApplyReference = Boolean(manager.managedRetrievalEvidenceRequired ? manager.selectedRetrievalEvidenceCandidate : evidenceReference) && manager.draftForm.smokeCases.some((smokeCase) => smokeCase.groundedReferenceRequired)

  if (!manager.draftForm.smokeCases.length) {
    return manager.evidenceRequirements ? (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
        <p className="text-sm text-[var(--text-muted)]">{t('releases.no_smoke_cases')}</p>
      </section>
    ) : null
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--text)]">{t('releases.smoke_cases_title')}</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t('releases.smoke_cases_help')}</p>
        </div>
        <button
          type="button"
          disabled={disabled || !canApplyReference}
          title={!canApplyReference ? (manager.managedRetrievalEvidenceRequired ? t('releases.retrieval_evidence.select_candidate_first') : t('releases.fill_release_reference_first')) : undefined}
          onClick={manager.applyEvidenceReferenceToGroundedCases}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border)] px-3 text-sm font-semibold text-[var(--text)] hover:border-[var(--primary)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
        >
          {manager.managedRetrievalEvidenceRequired ? t('releases.retrieval_evidence.apply') : t('releases.apply_reference_to_grounded')}
        </button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {manager.draftForm.smokeCases.map((smokeCase, index) => {
          const missingEvidence = smokeCase.passed && (!smokeCase.outcome.trim() || (smokeCase.groundedReferenceRequired && !smokeCase.stableReference.trim()))
          return (
            <div key={smokeCase.caseId} className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-[var(--text)]">{translateBackendKey(t, smokeCase.labelKey)}</p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{translateBackendKey(t, smokeCase.descriptionKey)}</p>
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
                  <input type="checkbox" checked={smokeCase.passed} disabled={disabled || !smokeCase.outcome.trim()} title={!smokeCase.outcome.trim() ? t('releases.fill_result_before_passed') : undefined} onChange={(event) => manager.setDraftForm((current) => ({ ...current, smokeCases: current.smokeCases.map((item, itemIndex) => itemIndex === index ? { ...item, passed: event.target.checked } : item) }))} />
                  {t('releases.smoke_case_passed')}
                </label>
              </div>
              {missingEvidence ? (
                <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                  {t('releases.smoke_case_passed_missing_evidence')}
                </p>
              ) : null}
              <div className="mt-3 grid gap-2">
                <input aria-label={`${translateBackendKey(t, smokeCase.labelKey)} ${t('releases.smoke_case_outcome')}`} value={smokeCase.outcome} disabled={disabled} placeholder={t('releases.smoke_case_outcome')} onChange={(event) => manager.setDraftForm((current) => ({ ...current, smokeCases: current.smokeCases.map((item, itemIndex) => itemIndex === index ? { ...item, outcome: event.target.value, passed: event.target.value.trim() ? item.passed : false } : item) }))} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]" />
                {smokeCase.groundedReferenceRequired ? (
                  <input aria-label={`${translateBackendKey(t, smokeCase.labelKey)} ${t('releases.smoke_case_reference')}`} value={smokeCase.stableReference} disabled={disabled || manager.managedRetrievalEvidenceRequired} placeholder={manager.managedRetrievalEvidenceRequired ? t('releases.retrieval_evidence.select_candidate_first') : smokeCase.stableReferenceMustMatchReleaseReference ? t('releases.smoke_case_reference_match') : t('releases.smoke_case_reference')} onChange={(event) => manager.setDraftForm((current) => ({ ...current, smokeCases: current.smokeCases.map((item, itemIndex) => itemIndex === index ? { ...item, stableReference: event.target.value } : item) }))} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]" />
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function CompactReadinessItemsBlock({ title, items }: { title: string; items: ReleaseDetail['missingOrFailedItems'] }) {
  const { t } = useI18n()
  const compactItems = items.map((item) => compactMissingItem(t, item)).filter((item): item is { summary: string; cases: string[] } => Boolean(item))
  const regularItems = items.filter((item) => !compactMissingItem(t, item))

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{title}</h4>
      {compactItems.length || regularItems.length ? (
        <div className="mt-2 grid gap-2 text-sm text-[var(--text-muted)]">
          {compactItems.map((item) => (
            <details key={item.summary} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              <summary className="cursor-pointer font-semibold text-[var(--text)]">{item.summary}</summary>
              <ul className="mt-2 grid gap-1">
                {item.cases.map((caseLabel) => <li key={caseLabel}>{caseLabel}</li>)}
              </ul>
            </details>
          ))}
          {regularItems.map((item) => <p key={`${item.itemId}-${item.state}`}>{formatReadinessItem(t, item)}</p>)}
        </div>
      ) : (
        <p className="mt-2 text-sm text-[var(--text-muted)]">{t('common.none')}</p>
      )}
    </div>
  )
}

export function ReleasesView({ manager }: { manager: ReleasesManager }) {
  const { t } = useI18n()
  const disabled = !manager.canManageReleases || manager.isMutating
  const createDisabled = !manager.canCreateRelease
  const selected = manager.selectedRelease
  const releaseStatus = (value: string | null | undefined) => translateBackendValue(t, 'releases.status', value)
  const gateMode = (value: string | null | undefined) => translateBackendValue(t, 'releases.gate_mode', value)
  const ownerMarker = (value: string | null | undefined) => translateBackendValue(t, 'releases.owner_marker', value)
  const overrideStatus = (value: string | null | undefined) => translateBackendValue(t, 'releases.override_status', value)
  const permissionTooltip = !manager.canManageReleases ? t('releases.create_permission_tooltip') : undefined
  const createTooltip = permissionTooltip ?? manager.createDisabledReason ?? undefined
  const evidenceRequirements = manager.evidenceRequirements
  const manualOverrideDisabled = disabled || !manager.draftForm.manualOverrideSelected || !evidenceRequirements?.manualOverride.allowed
  const publishFields = [
    { name: 'supportReconstructionReference' as const, label: t('releases.publish_support_reference') },
    { name: 'usageChatId' as const, label: t('releases.publish_usage_chat_id'), hint: t('releases.publish_usage_id_hint') },
    { name: 'usageConversationTurnId' as const, label: t('releases.publish_usage_conversation_turn_id'), hint: t('releases.publish_usage_id_hint') },
    { name: 'usageModelRequestId' as const, label: t('releases.publish_usage_model_request_id'), hint: t('releases.publish_usage_id_hint') },
    { name: 'billingExportReference' as const, label: t('releases.publish_billing_export_reference') },
    { name: 'releaseReportReference' as const, label: t('releases.publish_report_reference') },
  ]

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
                  {
                    label: t('releases.latest_release'),
                    value: manager.readiness?.latestReleaseVersion ? (
                      <span className="inline-flex flex-wrap items-center gap-2">
                        v{manager.readiness.latestReleaseVersion}
                        {manager.readiness.latestReleaseStatus ? <StatusBadge status={manager.readiness.latestReleaseStatus} label={releaseStatus(manager.readiness.latestReleaseStatus)} /> : null}
                      </span>
                    ) : t('agents.empty_value'),
                  },
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

          {evidenceRequirements ? (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--text)]">{t('releases.evidence_requirements_title')}</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{ownerMarker(evidenceRequirements.ownerStage)}</p>
                </div>
                <StatusBadge status={evidenceRequirements.evidenceStatus} label={translateBackendValue(t, 'releases.evidence_status', evidenceRequirements.evidenceStatus)} />
              </div>
              <div className="mt-4">
                <InfoGrid
                  items={[
                    { label: t('releases.release_setup_ready'), value: evidenceRequirements.releaseSetupReady ? t('common.yes') : t('common.no') },
                    { label: t('releases.evidence_required'), value: evidenceRequirements.evidenceRequired ? t('common.yes') : t('common.no') },
                    { label: t('releases.required_change_kind'), value: translateBackendValue(t, 'releases.change_kind', evidenceRequirements.requiredChangeKind) },
                    { label: t('releases.stable_reference_rule'), value: translateBackendValue(t, 'releases.stable_reference_rule_value', evidenceRequirements.stableReferenceRule) },
                    { label: t('releases.stable_reference_prefix'), value: evidenceRequirements.stableReferencePrefix ?? t('agents.empty_value') },
                    { label: t('releases.last_checked_at'), value: evidenceRequirements.lastCheckedAt ?? t('agents.empty_value') },
                  ]}
                />
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <ListBlock title={t('releases.release_setup_blockers')} values={evidenceRequirements.releaseSetupBlockingItems.map((item) => formatReadinessItem(t, item))} />
                <ListBlock
                  title={t('releases.manual_override_state')}
                  values={[
                    evidenceRequirements.manualOverride.allowed ? t('releases.manual_override_allowed') : t('releases.manual_override_blocked'),
                    ...(evidenceRequirements.manualOverride.blockedReason ? [translateBackendValue(t, 'releases.manual_override_blocked_reason', evidenceRequirements.manualOverride.blockedReason)] : []),
                    ...(evidenceRequirements.manualOverride.defaultReasonCode ? [`${t('releases.manual_override_reason')}: ${translateBackendValue(t, 'releases.override_reason', evidenceRequirements.manualOverride.defaultReasonCode)}`] : []),
                    ...evidenceRequirements.manualOverride.relatedMissingOrFailedItemsDefault.map((item) => translateBackendValue(t, 'releases.readiness_item', item)),
                  ]}
                />
              </div>
              <div className={evidenceRequirements.runtimeProviderPreflight.ready ? 'mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100' : 'mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100'}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h4 className="font-bold text-[var(--text)]">{t('releases.runtime_provider_preflight_title')}</h4>
                  <StatusBadge
                    status={evidenceRequirements.runtimeProviderPreflight.ready ? 'ready' : 'blocked'}
                    label={evidenceRequirements.runtimeProviderPreflight.ready ? t('releases.runtime_provider_ready') : t('releases.runtime_provider_not_ready')}
                  />
                </div>
                {!evidenceRequirements.runtimeProviderPreflight.available ? (
                  <p className="mt-2 font-medium">{t('releases.runtime_provider_preflight_missing')}</p>
                ) : !evidenceRequirements.runtimeProviderPreflight.ready ? (
                  <>
                    <p className="mt-2 font-medium">{t('releases.runtime_provider_publish_warning')}</p>
                    <RuntimeProviderPreflightSafeBlock requirements={evidenceRequirements.runtimeProviderPreflight.requirements} />
                  </>
                ) : (
                  <p className="mt-2 font-medium">{t('releases.runtime_provider_ready')}</p>
                )}
              </div>
            </section>
          ) : null}

          <RetrievalEvidenceBlock manager={manager} disabled={disabled} />

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-4">
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
              <SmokeCaseMatrix manager={manager} disabled={disabled} />
            </div>

            <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
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
                  <div>
                    <input aria-label={t('releases.evidence_reference')} title={permissionTooltip} value={manager.draftForm.evidenceStableReference} disabled={disabled || manager.managedRetrievalEvidenceRequired} placeholder={manager.managedRetrievalEvidenceRequired ? t('releases.retrieval_evidence.select_candidate_first') : evidenceRequirements?.stableReferencePrefix ? `${evidenceRequirements.stableReferencePrefix}...` : t('releases.evidence_reference')} onChange={(event) => manager.setDraftForm((current) => ({ ...current, evidenceStableReference: event.target.value }))} className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]" />
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{t('releases.stable_reference_help')}: {translateBackendValue(t, 'releases.stable_reference_rule_value', evidenceRequirements?.stableReferenceRule)}</p>
                  </div>
                  {evidenceRequirements?.requiredChangeKind ? (
                    <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold uppercase text-[var(--text-muted)]">
                      {t('releases.required_change_kind')}: {translateBackendValue(t, 'releases.change_kind', evidenceRequirements.requiredChangeKind)}
                    </p>
                  ) : null}
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('releases.evidence_progress')}</h4>
                    <div className="mt-2 grid gap-1 text-sm font-semibold text-[var(--text)]">
                      <p>{t('releases.required_checks_progress').replace('{done}', String(manager.draftProgress.requiredComplete)).replace('{total}', String(manager.draftProgress.requiredTotal))}</p>
                      <p>{t('releases.grounded_reference_progress').replace('{done}', String(manager.draftProgress.groundedReferencesFilled)).replace('{total}', String(manager.draftProgress.groundedTotal))}</p>
                      <p className="text-amber-700 dark:text-amber-200">{t('releases.remaining_evidence_progress').replace('{outcomes}', String(manager.draftProgress.missingRequiredOutcomes)).replace('{grounded}', String(manager.draftProgress.missingGroundedReferences))}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={disabled || manager.draftProgress.requiredTotal === 0}
                    onClick={manager.fillDefaultSmokeOutcomes}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border)] px-3 text-sm font-semibold text-[var(--text)] hover:border-[var(--primary)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
                  >
                    {t('releases.fill_default_results')}
                  </button>
                  <label className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                    <input type="checkbox" checked={manager.draftForm.manualOverrideSelected} disabled={disabled || !evidenceRequirements?.manualOverride.allowed} onChange={(event) => manager.setDraftForm((current) => ({ ...current, manualOverrideSelected: event.target.checked }))} />
                    {t('releases.use_manual_override')}
                  </label>
                  {!evidenceRequirements?.manualOverride.allowed && evidenceRequirements?.manualOverride.blockedReason ? (
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                      {translateBackendValue(t, 'releases.manual_override_blocked_reason', evidenceRequirements.manualOverride.blockedReason)}
                    </p>
                  ) : null}
                  <div className={manualOverrideDisabled ? 'grid gap-3 opacity-60' : 'grid gap-3'}>
                    <input aria-label={t('releases.manual_override_reason')} title={permissionTooltip} value={manager.draftForm.manualOverrideReasonCode} disabled={manualOverrideDisabled} placeholder={t('releases.manual_override_reason')} onChange={(event) => manager.setDraftForm((current) => ({ ...current, manualOverrideReasonCode: event.target.value }))} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]" />
                    <textarea aria-label={t('releases.manual_override_items')} title={permissionTooltip} value={manager.draftForm.manualOverrideItemsText} disabled={manualOverrideDisabled} rows={3} placeholder={t('releases.manual_override_items')} onChange={(event) => manager.setDraftForm((current) => ({ ...current, manualOverrideItemsText: event.target.value }))} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]" />
                    <textarea aria-label={t('releases.manual_override_comment')} title={permissionTooltip} value={manager.draftForm.manualOverrideComment} disabled={manualOverrideDisabled} rows={3} placeholder={t('releases.manual_override_comment')} onChange={(event) => manager.setDraftForm((current) => ({ ...current, manualOverrideComment: event.target.value }))} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]" />
                  </div>
                </div>
                {manager.createDisabledReason ? <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">{manager.createDisabledReason}</p> : null}
                <button type="button" title={createTooltip} disabled={createDisabled} onClick={() => confirmAction(t('releases.confirm_create'), () => void manager.createRelease())} className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]">
                  {t('releases.create_draft')}
                </button>
              </div>
            </aside>
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
                    ...(selected.status === 'failed' ? [] : [{ label: t('releases.top_level_evidence_flag'), value: selected.evidencePassed === null ? t('agents.empty_value') : selected.evidencePassed ? t('common.yes') : t('common.no') }]),
                    { label: t('releases.manual_override_used'), value: selected.manualOverride?.used ? t('common.yes') : t('common.no') },
                    { label: t('releases.manual_override_reason'), value: selected.manualOverride?.reasonCode ? translateBackendValue(t, 'releases.override_reason', selected.manualOverride.reasonCode) : t('agents.empty_value') },
                  ]}
                />
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <CompactReadinessItemsBlock title={t('releases.readiness_items')} items={selected.readinessItems} />
                <CompactReadinessItemsBlock title={t('releases.missing_items')} items={selected.missingOrFailedItems} />
              </div>
              {evidenceRequirements?.publishEvidenceRequirements.length ? (
                <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                  <h4 className="text-sm font-bold text-[var(--text)]">{t('releases.publish_evidence_requirements')}</h4>
                  <ul className="mt-2 space-y-2 text-sm text-[var(--text-muted)]">
                    {evidenceRequirements.publishEvidenceRequirements.map((requirement) => (
                      <li key={requirement.field}>
                        <span className="font-semibold text-[var(--text)]">{translateBackendKey(t, requirement.labelKey)}</span>
                        {requirement.required ? ` (${t('releases.required')})` : ` (${t('releases.optional')})`} - {translateBackendKey(t, requirement.descriptionKey)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {evidenceRequirements && !evidenceRequirements.runtimeProviderPreflight.ready ? (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                  {t('releases.runtime_provider_publish_warning')}
                </div>
              ) : null}
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {publishFields.map((field) => (
                  <label key={field.name} className="grid gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{field.label}</span>
                    <input aria-label={field.label} value={manager.publishForm[field.name]} disabled={disabled || (field.name === 'supportReconstructionReference' && manager.managedRetrievalEvidenceRequired)} placeholder={field.name === 'supportReconstructionReference' && manager.managedRetrievalEvidenceRequired ? t('releases.retrieval_evidence.select_candidate_first') : field.label} onChange={(event) => manager.setPublishForm((current) => ({ ...current, [field.name]: event.target.value }))} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] disabled:bg-[var(--surface-muted)]" />
                    {'hint' in field && field.hint ? <span className="text-xs text-[var(--text-muted)]">{field.hint}</span> : null}
                    {field.name === 'supportReconstructionReference' && manager.managedRetrievalEvidenceRequired ? <span className="text-xs text-[var(--text-muted)]">{t('releases.publish_support_reference_candidate_hint')}</span> : null}
                  </label>
                ))}
              </div>
              {manager.selectedReleaseMissingRetrievalEvidence ? (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                  {t('releases.historical_release_without_retrieval_candidate')}
                </p>
              ) : null}
              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text)]">{t('releases.usage_evidence.title')}</h4>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">{t('releases.usage_evidence.help')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void manager.loadUsageEvidenceCandidates()}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border)] px-3 text-sm font-semibold text-[var(--text)] hover:border-[var(--primary)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
                    disabled={manager.isLoadingUsageEvidenceCandidates}
                  >
                    {manager.isLoadingUsageEvidenceCandidates ? t('common.loading') : t('common.retry')}
                  </button>
                </div>
                {manager.isLoadingUsageEvidenceCandidates ? (
                  <p className="mt-3 text-sm text-[var(--text-muted)]">{t('common.loading')}</p>
                ) : manager.usageEvidenceCandidatesError ? (
                  <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">{manager.usageEvidenceCandidatesError}</p>
                ) : manager.usageEvidenceCandidates?.items.length ? (
                  <>
                    <div className="mt-3 grid gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] sm:grid-cols-2">
                      <span>{t('releases.usage_evidence.count')}: {manager.usageEvidenceCandidates.summary.candidateCount}</span>
                      <span>{t('releases.usage_evidence.generated_at')}: {manager.usageEvidenceCandidates.generatedAt ?? t('agents.empty_value')}</span>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {manager.usageEvidenceCandidates.items.map((candidate) => (
                        <label key={candidate.conversationTurnId} className="grid cursor-pointer gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] has-[:checked]:border-[var(--primary)]">
                          <span className="flex items-start gap-2">
                            <input
                              type="radio"
                              name="release-usage-evidence-candidate"
                              checked={manager.selectedUsageEvidenceCandidateId === candidate.conversationTurnId}
                              onChange={() => manager.setSelectedUsageEvidenceCandidateId(candidate.conversationTurnId)}
                            />
                            <span className="grid gap-1">
                              <span className="font-bold">{candidate.displayLabel || t('releases.usage_evidence.candidate')}</span>
                              <span className="break-all text-xs text-[var(--text-muted)]">{t('releases.usage_evidence.chat_id')}: {candidate.chatId}</span>
                              <span className="break-all text-xs text-[var(--text-muted)]">{t('releases.usage_evidence.turn_id')}: {candidate.conversationTurnId}</span>
                              <span className="break-all text-xs text-[var(--text-muted)]">{t('releases.usage_evidence.model_request_id')}: {candidate.modelRequestId}</span>
                            </span>
                          </span>
                          <InfoGrid
                            items={[
                              { label: t('releases.usage_evidence.created_at'), value: candidate.createdAt || t('agents.empty_value') },
                              { label: t('releases.usage_evidence.turn_status'), value: translateBackendValue(t, 'releases.usage_evidence.turn_status_value', candidate.turnStatus) },
                              { label: t('releases.usage_evidence.model_request_state'), value: translateBackendValue(t, 'releases.usage_evidence.model_request_state_value', candidate.modelRequestState) },
                              { label: t('releases.usage_evidence.usage_recorded'), value: candidate.usageRecorded ? t('common.yes') : t('common.no') },
                              { label: t('releases.usage_evidence.widget_key'), value: candidate.widgetKey ?? t('agents.empty_value') },
                              { label: t('releases.usage_evidence.channel'), value: candidate.channel ?? t('agents.empty_value') },
                            ]}
                          />
                        </label>
                      ))}
                    </div>
                    <button
                      type="button"
                      disabled={disabled || !manager.selectedUsageEvidenceCandidate}
                      onClick={manager.applyUsageEvidenceCandidateToPublishForm}
                      className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]"
                    >
                      {t('releases.usage_evidence.use_for_publish')}
                    </button>
                  </>
                ) : manager.usageEvidenceCandidates ? (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                    <p>{t(getUsageEvidenceNoCandidateReasonKey(manager.usageEvidenceCandidates.noCandidateReason))}</p>
                    {manager.usageEvidenceCandidates.noCandidateReason && getUsageEvidenceNoCandidateReasonKey(manager.usageEvidenceCandidates.noCandidateReason) === 'releases.usage_evidence.no_candidate_reason.unknown' ? (
                      <p className="mt-1 break-all text-xs">{t('releases.usage_evidence.no_candidate_reason_value')}: {manager.usageEvidenceCandidates.noCandidateReason}</p>
                    ) : null}
                    {manager.usageEvidenceCandidates.noCandidateReason === 'runtime_provider_not_ready' && evidenceRequirements?.runtimeProviderPreflight.available ? (
                      <RuntimeProviderPreflightSafeBlock requirements={evidenceRequirements.runtimeProviderPreflight.requirements} />
                    ) : null}
                    {manager.usageEvidenceCandidates.generatedAt ? <p className="mt-1 text-xs">{t('releases.usage_evidence.generated_at')}: {manager.usageEvidenceCandidates.generatedAt}</p> : null}
                  </div>
                ) : null}
              </div>
              {manager.publishDisabledReason ? (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                  {manager.publishDisabledReason}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" title={manager.publishDisabledReason ?? undefined} disabled={!manager.canPublishSelected} onClick={() => confirmAction(confirmationSummary(t('releases.confirm_publish'), selected, t, releaseStatus, gateMode), () => void manager.publishSelected())} className="inline-flex h-10 items-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]">{t('releases.publish')}</button>
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
