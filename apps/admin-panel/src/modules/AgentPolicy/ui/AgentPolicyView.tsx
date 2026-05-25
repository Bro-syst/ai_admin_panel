import { Link } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import type { AgentPolicyBinding, AgentPolicyProfileDefinition } from '@/modules/AgentPolicy/api/agentPolicyApi'
import type { AgentPolicyManager } from '@/modules/AgentPolicy/model/useAgentPolicyManager'
import { CopyableValue, InfoGrid, ListBlock, StatusBadge } from '@/shared/ui/EntityInfo'
import { RefreshButton } from '@/shared/ui/RefreshButton'

function confirmAction(message: string, action: () => void) {
  if (window.confirm(message)) action()
}

function translatedValue(t: (key: string) => string, namespace: string, value: string | null | undefined, emptyValue = t('agents.empty_value')) {
  if (!value) return emptyValue
  const key = `${namespace}.${value}`
  const translated = t(key)
  return translated === key ? value : translated
}

function translatedValues(t: (key: string) => string, namespace: string, values: string[] | null | undefined) {
  return (values ?? []).map((value) => translatedValue(t, namespace, value))
}

function translatedPolicyProfileLabel(t: (key: string) => string, profileId: string, fallback: string) {
  const translated = t(`agent_policy.profile_label.${profileId}`)
  return translated === `agent_policy.profile_label.${profileId}` ? fallback : translated
}

function translatedPolicyProfileDescription(t: (key: string) => string, profileId: string, fallback: string) {
  const translated = t(`agent_policy.profile_description.${profileId}`)
  return translated === `agent_policy.profile_description.${profileId}` ? fallback : translated
}

function isRecommendedPolicyProfile(profileId: string, templateId: string | null | undefined) {
  return templateId === 'sales_qualification_v1' && profileId === 'policy_profile.lead_data_safety_v1'
}

function policyProfileCardClass(isRecommended: boolean, isSelected: boolean) {
  const tone = isSelected
    ? 'border-[var(--primary)] bg-[var(--primary-soft)]'
    : isRecommended
      ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-500/40 dark:bg-emerald-500/10'
      : 'border-[var(--border)] bg-[var(--surface)]'

  return ['rounded-2xl border p-4 shadow-[var(--shadow-soft)] transition', tone].join(' ')
}

function readinessItems(binding: AgentPolicyBinding | null, t: (key: string) => string) {
  if (!binding) return []
  return [
    { label: t('agent_policy.inbound_request_ready'), value: binding.inboundRequestEvaluationReady ? t('common.yes') : t('common.no') },
    { label: t('agent_policy.prompt_injection_ready'), value: binding.promptInjectionContextAbuseReady ? t('common.yes') : t('common.no') },
    { label: t('agent_policy.sensitive_context_ready'), value: binding.sensitiveContextAdmissionReady ? t('common.yes') : t('common.no') },
    { label: t('agent_policy.model_invocation_ready'), value: binding.modelInvocationGatingReady ? t('common.yes') : t('common.no') },
    { label: t('agent_policy.capability_action_ready'), value: binding.capabilityActionGatingReady ? t('common.yes') : t('common.no') },
  ]
}

function PolicyMutationEvidenceBlock({ manager }: { manager: AgentPolicyManager }) {
  const { t } = useI18n()
  const result = manager.mutationResult

  if (!result) return null

  const policyProfileId = manager.binding?.effectiveProfileId ?? manager.form.policyProfileId
  const bindingMode = manager.binding?.bindingMode ?? manager.form.bindingMode
  const readiness = manager.binding?.readinessStatus ?? null
  const correlationOrRequest = result.correlationId ?? result.requestId ?? null

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
      <h3 className="font-bold">{t('agent_policy.evidence_title')}</h3>
      <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <div>
          <dt className="text-xs font-semibold uppercase opacity-70">{t('mutation_result.action')}</dt>
          <dd className="break-all font-semibold">{result.action || t('agents.empty_value')}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase opacity-70">{t('agent_policy.agent_id')}</dt>
          <dd className="break-all font-semibold"><CopyableValue value={manager.agentId} /></dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase opacity-70">{t('agent_policy.policy_profile')}</dt>
          <dd className="break-words font-semibold [overflow-wrap:anywhere]">{translatedValue(t, 'agent_policy.profile_label', policyProfileId)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase opacity-70">{t('agent_policy.binding_mode')}</dt>
          <dd className="font-semibold">{translatedValue(t, 'agent_policy.binding_mode_value', bindingMode)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase opacity-70">{t('agents.readiness')}</dt>
          <dd className="font-semibold">{translatedValue(t, 'agent_policy.readiness_status', readiness)}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase opacity-70">{t('mutation_result.correlation_or_request')}</dt>
          <dd className="break-all font-semibold">
            {correlationOrRequest ? <CopyableValue value={correlationOrRequest} /> : t('mutation_result.not_returned')}
          </dd>
        </div>
      </dl>
    </section>
  )
}

export function AgentPolicyView({ manager }: { manager: AgentPolicyManager }) {
  const { t } = useI18n()
  const disabled = !manager.canManagePolicy || manager.isMutating
  const validation = manager.validationBinding
  const validateTitle = manager.isDirty ? t('agent_policy.validate_save_first_tooltip') : undefined
  const selectedProfile = manager.catalog?.items.find((profile) => profile.profileId === manager.form.policyProfileId) ?? null

  const selectProfile = (profile: AgentPolicyProfileDefinition) => {
    manager.updateForm({
      bindingMode: 'explicit_profile',
      policyProfileId: profile.profileId,
      businessPolicyScope: profile.businessPolicyScope,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to={`/tenants/${manager.tenantId}/agents/${manager.agentId}`} className="text-sm font-semibold text-[var(--primary-hover)] hover:underline">
            {t('agent_config.back_to_agent')}
          </Link>
          <h2 className="mt-2 text-lg font-bold text-[var(--text)]">{t('agent_policy.title')}</h2>
          <p className="mt-1 break-all text-sm text-[var(--text-muted)]">{manager.agentDetail?.name ?? manager.agentId}</p>
        </div>
        <RefreshButton onClick={() => void manager.loadPolicy()} />
      </div>

      {manager.notice ? (
        <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 sm:flex-row sm:items-center sm:justify-between">
          <span>{manager.notice} {t('agent_policy.next_step_sites_widgets')}</span>
          <Link
            to={`/tenants/${manager.tenantId}/agents/${manager.agentId}/sites-widgets`}
            className="inline-flex min-h-9 items-center justify-center rounded-lg border border-emerald-300 bg-white/80 px-3 py-1.5 text-sm font-bold text-emerald-800 hover:bg-white dark:border-emerald-500/40 dark:bg-emerald-950/30 dark:text-emerald-100"
          >
            {t('agent_policy.go_to_sites_widgets')}
          </Link>
        </div>
      ) : null}
      {manager.errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">{manager.errorMessage}</div> : null}
      {manager.formError ? <p className="text-sm font-medium text-rose-600">{manager.formError}</p> : null}
      <PolicyMutationEvidenceBlock manager={manager} />

      {manager.isLoading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)]">{t('common.loading')}</div>
      ) : (
        <>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">{t('agent_policy.binding_title')}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{manager.binding?.effectiveProfileId ?? t('agents.empty_value')}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {manager.binding?.status ? <StatusBadge status={manager.binding.status} label={translatedValue(t, 'agent_policy.status', manager.binding.status)} /> : null}
                {manager.binding?.readinessStatus ? <StatusBadge status={manager.binding.readinessStatus} label={translatedValue(t, 'agent_policy.readiness_status', manager.binding.readinessStatus)} /> : null}
                <span title={validateTitle}>
                  <button type="button" disabled={manager.isMutating} onClick={() => void manager.validateBinding()} className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]">
                    {t('agent_policy.validate')}
                  </button>
                </span>
                <button type="button" disabled={disabled} onClick={() => confirmAction(t('agent_policy.confirm_update'), () => void manager.updateBinding())} className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]">
                  {t('agent_policy.update')}
                </button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('agent_policy.binding_mode')}</span>
                <select
                  value={manager.form.bindingMode}
                  disabled={disabled}
                  onChange={(event) => manager.updateForm({ bindingMode: event.target.value })}
                  className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
                >
                  <option value="inherited_default">{t('agent_policy.binding_mode_value.inherited_default')}</option>
                  <option value="explicit_profile">{t('agent_policy.binding_mode_value.explicit_profile')}</option>
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('agent_policy.policy_profile')}</span>
                <select
                  value={manager.form.policyProfileId ?? ''}
                  disabled={disabled || manager.form.bindingMode !== 'explicit_profile'}
                  onChange={(event) => manager.updateForm({ policyProfileId: event.target.value || null })}
                  className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
                >
                  <option value="" />
                  {manager.catalog?.items.map((profile) => (
                    <option key={profile.profileId} value={profile.profileId}>{translatedPolicyProfileLabel(t, profile.profileId, profile.label)}</option>
                  ))}
                </select>
              </label>
            </div>
            {manager.form.bindingMode === 'explicit_profile' && selectedProfile ? (
              <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100">
                {t('agent_policy.profile_values_used')}
              </div>
            ) : null}
            <details className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2">
              <summary className="cursor-pointer text-sm font-bold text-[var(--text)]">{t('agent_policy.advanced_overrides')}</summary>
              <p className="mt-2 text-sm text-[var(--text-muted)]">{t('agent_policy.advanced_overrides_hint')}</p>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('agent_policy.business_policy_scope')}</span>
                  <input
                    value={manager.form.businessPolicyScope ?? ''}
                    disabled={disabled}
                    onChange={(event) => manager.updateForm({ businessPolicyScope: event.target.value || null })}
                    className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('agent_policy.tenant_policy_markers')}</span>
                  <textarea
                    value={manager.form.tenantPolicyMarkersText}
                    disabled={disabled}
                    rows={4}
                    onChange={(event) => manager.updateForm({ tenantPolicyMarkersText: event.target.value })}
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
                  />
                </label>
              </div>
            </details>
            {manager.form.bindingMode === 'inherited_default' ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
                {t('agent_policy.first_smoke_explicit_profile_warning')}
              </div>
            ) : null}
            {!manager.canManagePolicy ? <p className="mt-3 text-sm text-[var(--text-muted)]">{t('agent_policy.permission_readonly')}</p> : null}
            <div className="mt-4">
              <InfoGrid
                items={[
                  { label: t('agent_policy.relation_to_template'), value: translatedValue(t, 'agent_policy.template_relation', manager.binding?.relationToTemplate ?? manager.catalog?.relationToTemplate) },
                  { label: t('agent_policy.effective_profile'), value: translatedValue(t, 'agent_policy.profile_label', manager.binding?.effectiveProfileId) },
                  { label: t('agent_policy.binding_mode'), value: translatedValue(t, 'agent_policy.binding_mode_value', manager.binding?.bindingMode) },
                  { label: t('agents.readiness'), value: translatedValue(t, 'agent_policy.readiness_status', manager.binding?.readinessStatus) },
                ]}
              />
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <ListBlock title={t('agent_policy.policy_expectations')} values={translatedValues(t, 'agent_policy.expectation_marker', manager.binding?.policyExpectations ?? manager.catalog?.policyExpectations ?? [])} />
              <ListBlock title={t('agent_policy.decision_points')} values={translatedValues(t, 'agent_policy.decision_point', manager.binding?.decisionPoints)} />
              <ListBlock title={t('agent_policy.issues')} values={translatedValues(t, 'agent_policy.issue', manager.binding?.issues)} />
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <h3 className="text-sm font-bold text-[var(--text)]">{t('agent_policy.readiness_title')}</h3>
            <div className="mt-3">
              <InfoGrid items={readinessItems(manager.binding, t)} />
            </div>
            {validation ? (
              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                <h4 className="text-sm font-bold text-[var(--text)]">{t('agent_policy.validation_result')}</h4>
                <div className="mt-3">
                  <InfoGrid items={readinessItems(validation, t)} />
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <ListBlock title={t('agent_policy.decision_points')} values={translatedValues(t, 'agent_policy.decision_point', validation.decisionPoints)} />
                  <ListBlock title={t('agent_policy.issues')} values={translatedValues(t, 'agent_policy.issue', validation.issues)} />
                </div>
              </div>
            ) : null}
          </section>

          <section className="grid gap-3 xl:grid-cols-2">
            {manager.catalog?.items.length ? manager.catalog.items.map((profile) => {
              const recommended = isRecommendedPolicyProfile(profile.profileId, manager.agentDetail?.templateId)
              const selected = manager.form.bindingMode === 'explicit_profile' && manager.form.policyProfileId === profile.profileId

              return (
              <article key={profile.profileId} className={policyProfileCardClass(recommended, selected)}>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-[var(--text)]">{translatedPolicyProfileLabel(t, profile.profileId, profile.label)}</h3>
                      {recommended ? <StatusBadge status="ready" label={t('agent_policy.recommended_badge')} /> : null}
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{translatedPolicyProfileDescription(t, profile.profileId, profile.description)}</p>
                  </div>
                  {profile.safeFallbackMode ? <StatusBadge status={profile.safeFallbackMode} label={translatedValue(t, 'agent_policy.safe_fallback_mode', profile.safeFallbackMode)} /> : null}
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    disabled={disabled || selected}
                    onClick={() => selectProfile(profile)}
                    className={[
                      'inline-flex min-h-9 items-center justify-center rounded-xl border px-3 py-1.5 text-sm font-bold disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]',
                      selected
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                        : 'border-[var(--primary)] bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]',
                    ].join(' ')}
                  >
                    {selected ? t('agent_policy.profile_selected') : t('agent_policy.select_profile')}
                  </button>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <ListBlock title={t('agent_policy.expectation_markers')} values={translatedValues(t, 'agent_policy.expectation_marker', profile.expectationMarkers)} />
                  <ListBlock title={t('agent_policy.policy_domains')} values={translatedValues(t, 'agent_policy.policy_domain', profile.policyDomains)} />
                  <ListBlock title={t('agent_policy.decision_points')} values={translatedValues(t, 'agent_policy.decision_point', profile.decisionPoints)} />
                  <ListBlock title={t('agent_policy.tenant_policy_markers')} values={translatedValues(t, 'agent_policy.tenant_policy_marker', profile.tenantPolicyMarkers)} />
                </div>
              </article>
              )
            }) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)]">{t('agent_policy.empty_catalog')}</div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
