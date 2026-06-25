import { useEffect, useState } from 'react'
import { useI18n } from '@/core/i18n/useI18n'
import type { KnowledgeManager } from '@/modules/Knowledge/model/useKnowledgeManager'
import type { KnowledgeDocument, KnowledgeIngestionJob, KnowledgeRetrievalRun } from '@/modules/Knowledge/api/knowledgeApi'
import { CopyableValue, InfoGrid, MutationResultBlock, StatusBadge } from '@/shared/ui/EntityInfo'

type TFunction = (key: string) => string

type SelectOption = {
  value: string
  label: string
}

function translateCode(t: TFunction, key: string, fallback: string) {
  const translated = t(key)
  return translated === key ? fallback : translated
}

function formatKnowledgeCode(t: TFunction, group: string, value: string | null | undefined, emptyValue = t('agents.empty_value')) {
  if (!value) return emptyValue
  return translateCode(t, `knowledge.${group}.${value}`, value)
}

function formatTemplate(value: string, replacements: Record<string, string | number>) {
  return Object.entries(replacements).reduce(
    (current, [key, replacement]) => current.split(`{${key}}`).join(String(replacement)),
    value,
  )
}

function shortValue(value: string) {
  if (value.length <= 22) return value
  return `${value.slice(0, 10)}...${value.slice(-8)}`
}

function CopyableShortValue({ value }: { value: string | null | undefined }) {
  const { t } = useI18n()
  if (!value) return <span className="text-sm text-[var(--text-muted)]">{t('agents.empty_value')}</span>
  return <CopyableValue value={value} label={shortValue(value)} />
}

function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M6 8l4 4 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function operatorReadinessLabel(t: TFunction, value: string | null | undefined) {
  return formatKnowledgeCode(t, 'operator_readiness_status', value)
}

function knowledgeSearchReady(manager: KnowledgeManager) {
  return manager.indexingResult?.readinessSummary.readinessStatus === 'ready'
    || manager.releaseReadiness?.releaseReady === true
    || manager.selectedSourceDetail?.readiness.readinessStatus === 'ready'
}

function Field({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string
  value: string
  disabled: boolean
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</span>
      <input
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
      />
    </label>
  )
}

function TextAreaField({
  label,
  value,
  disabled,
  rows = 4,
  onChange,
}: {
  label: string
  value: string
  disabled: boolean
  rows?: number
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</span>
      <textarea
        value={value}
        disabled={disabled}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  disabled,
  options,
  onChange,
}: {
  label: string
  value: string
  disabled: boolean
  options: SelectOption[]
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  )
}

function ToggleField({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string
  checked: boolean
  disabled: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm font-semibold text-[var(--text)]">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-[var(--border)]"
      />
      {label}
    </label>
  )
}

function ListBlock({ title, values }: { title: string; values: string[] }) {
  const { t } = useI18n()

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{title}</h4>
      {values.length > 0 ? (
        <ul className="mt-2 grid gap-1 text-sm text-[var(--text-muted)]">
          {values.map((value) => <li key={value}>{value}</li>)}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-[var(--text-muted)]">{t('common.none')}</p>
      )}
    </div>
  )
}

function confirmAction(message: string, action: () => void) {
  if (window.confirm(message)) action()
}

function SourceList({ manager }: { manager: KnowledgeManager }) {
  const { t } = useI18n()

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <h3 className="text-sm font-bold text-[var(--text)]">{t('knowledge.sources_title')}</h3>
      <div className="mt-3 grid gap-2">
        {manager.sources.length > 0 ? manager.sources.map((card) => (
          <button
            key={card.source.id}
            type="button"
            onClick={() => void manager.selectSource(card.source.id)}
            className={[
              'min-h-[112px] overflow-hidden rounded-xl border px-3 py-2 text-left text-sm hover:bg-[var(--surface-muted)]',
              manager.selectedSourceDetail?.source.id === card.source.id ? 'border-[var(--primary)] bg-[var(--surface-muted)]' : 'border-[var(--border)]',
            ].join(' ')}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="min-w-0 font-semibold text-[var(--text)] [overflow-wrap:anywhere] [word-break:break-word]">{card.source.name}</span>
              <StatusBadge status={card.readiness.readinessStatus} label={operatorReadinessLabel(t, card.readiness.readinessStatus)} />
            </span>
            <span className="mt-1 block text-xs text-[var(--text-muted)] [overflow-wrap:anywhere] [word-break:break-word]">{card.source.sourceKey} / {formatKnowledgeCode(t, 'source_kind_value', card.source.sourceKind)}</span>
            <span className="mt-1 flex flex-wrap gap-2">
              {card.failedOrRetryable ? <StatusBadge status="retryable" /> : null}
            </span>
          </button>
        )) : (
          <p className="text-sm text-[var(--text-muted)]">{t('knowledge.no_sources')}</p>
        )}
      </div>
    </section>
  )
}

function SourceDetail({ manager }: { manager: KnowledgeManager }) {
  const { t } = useI18n()
  const detail = manager.selectedSourceDetail
  const readinessStatus = detail?.readiness.readinessStatus ?? detail?.source.readinessStatus ?? 'unknown'

  if (!detail) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
        <h3 className="text-sm font-bold text-[var(--text)]">{t('knowledge.source_detail_title')}</h3>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{t('knowledge.no_source_selected')}</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--text)]">{detail.source.name}</h3>
          <div className="mt-1">
            <CopyableShortValue value={detail.source.id} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={detail.source.status} />
          <StatusBadge status={readinessStatus} label={operatorReadinessLabel(t, readinessStatus)} />
          <StatusBadge status={detail.source.accessScope} label={formatKnowledgeCode(t, 'access_scope_value', detail.source.accessScope)} />
        </div>
      </div>
      <div className="mt-4">
        <InfoGrid
          items={[
            { label: t('knowledge.source_key'), value: detail.source.sourceKey },
            { label: t('knowledge.source_kind'), value: formatKnowledgeCode(t, 'source_kind_value', detail.source.sourceKind) },
            { label: t('knowledge.allowed_agent_scope'), value: formatKnowledgeCode(t, 'allowed_agent_scope_value', detail.source.allowedAgentScope) },
            { label: t('knowledge.content_revision'), value: detail.source.contentRevision },
            { label: t('knowledge.documents'), value: detail.documents.length },
            { label: t('knowledge.chunks'), value: detail.readiness.chunkCount },
            { label: t('knowledge.vectorizations'), value: detail.readiness.vectorizationCount },
            { label: t('knowledge.failed_jobs'), value: detail.readiness.failedJobCount },
            { label: t('knowledge.retryable_jobs'), value: detail.readiness.retryableJobCount },
          ]}
        />
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <ListBlock title={t('knowledge.allowed_agent_ids')} values={detail.source.allowedAgentIds} />
        <ListBlock title={t('knowledge.source_set_marker')} values={[detail.source.sourceSetEligibilityMarker].filter(Boolean)} />
      </div>
    </section>
  )
}

function SourceForms({ manager }: { manager: KnowledgeManager }) {
  const { t } = useI18n()
  const disabled = !manager.canManageKnowledge || manager.isMutating
  const form = manager.sourceForm
  const sourceKindOptions = ['documentation', 'faq', 'policy_corpus', 'catalog', 'approved_internal_collection'].map((value) => ({
    value,
    label: formatKnowledgeCode(t, 'source_kind_value', value, value),
  }))
  const accessScopeOptions = ['tenant_public', 'tenant_restricted'].map((value) => ({
    value,
    label: formatKnowledgeCode(t, 'access_scope_value', value, value),
  }))
  const allowedAgentScopeOptions = ['all_agents', 'agent_ids'].map((value) => ({
    value,
    label: formatKnowledgeCode(t, 'allowed_agent_scope_value', value, value),
  }))

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--text)]">{t('knowledge.source_management_title')}</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t('knowledge.source_management_subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void manager.createSource()} disabled={disabled} className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]">
            {t('knowledge.create_source')}
          </button>
          <button type="button" onClick={() => void manager.updateSelectedSourceMetadata()} disabled={disabled || !manager.selectedSourceDetail} className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]">
            {t('knowledge.update_source_metadata')}
          </button>
          <button type="button" onClick={() => confirmAction(t('knowledge.confirm_disable_source'), () => void manager.disableSelectedSource())} disabled={disabled || !manager.selectedSourceDetail} className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]">
            {t('knowledge.disable_source')}
          </button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <Field label={t('knowledge.source_key')} value={form.sourceKey} disabled={disabled} onChange={(value) => manager.setSourceForm((current) => ({ ...current, sourceKey: value }))} />
        <Field label={t('knowledge.name')} value={form.name} disabled={disabled} onChange={(value) => manager.setSourceForm((current) => ({ ...current, name: value }))} />
        <Field label={t('knowledge.content_revision')} value={form.contentRevision} disabled={disabled} onChange={(value) => manager.setSourceForm((current) => ({ ...current, contentRevision: value }))} />
        <SelectField label={t('knowledge.source_kind')} value={form.sourceKind} disabled={disabled} options={sourceKindOptions} onChange={(value) => manager.setSourceForm((current) => ({ ...current, sourceKind: value }))} />
        <SelectField label={t('knowledge.access_scope')} value={form.accessScope} disabled={disabled} options={accessScopeOptions} onChange={(value) => manager.setSourceForm((current) => ({ ...current, accessScope: value }))} />
        <SelectField label={t('knowledge.allowed_agent_scope')} value={form.allowedAgentScope} disabled={disabled || form.restrictToCurrentAgent} options={allowedAgentScopeOptions} onChange={(value) => manager.setSourceForm((current) => ({ ...current, allowedAgentScope: value }))} />
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)]">
        <ToggleField label={t('knowledge.restrict_to_current_agent')} checked={form.restrictToCurrentAgent} disabled={disabled} onChange={(value) => manager.setSourceForm((current) => ({ ...current, restrictToCurrentAgent: value }))} />
        <TextAreaField label={t('knowledge.metadata_json')} value={form.metadataText} disabled={disabled} onChange={(value) => manager.setSourceForm((current) => ({ ...current, metadataText: value }))} />
      </div>
      {!manager.canManageKnowledge ? <p className="mt-3 text-sm text-[var(--text-muted)]">{t('knowledge.permission_readonly')}</p> : null}
    </section>
  )
}

function DocumentsAndIndexing({ manager }: { manager: KnowledgeManager }) {
  const { t } = useI18n()
  const disabled = !manager.canManageKnowledge || manager.isMutating || !manager.selectedSourceDetail
  const noSelectedSource = !manager.selectedSourceDetail
  const documentForm = manager.documentForm
  const indexingForm = manager.indexingForm
  const selectedSource = manager.selectedSourceDetail?.source ?? null
  const documents = manager.selectedSourceDetail?.documents ?? []
  const jobs = manager.selectedSourceDetail?.jobs ?? []
  const documentOptions = [
    { value: '', label: t('agents.empty_value') },
    ...documents.map((document) => ({
      value: document.id,
      label: document.title || document.documentKey || document.id,
    })),
  ]

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--text)]">{t('knowledge.documents_title')}</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{t('knowledge.documents_subtitle')}</p>
          </div>
          <button type="button" disabled={disabled} onClick={() => void manager.registerDocument()} className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]">
            {t('knowledge.register_document')}
          </button>
        </div>
        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100">
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700 dark:text-sky-200">{t('knowledge.document_source_context_title')}</p>
          {selectedSource ? (
            <>
              <p className="mt-1 font-medium">{t('knowledge.document_source_context_hint')}</p>
              <dl className="mt-2 grid gap-2 md:grid-cols-3">
                <div className="min-w-0 rounded-lg border border-sky-200/80 bg-white/70 px-2 py-1.5 dark:border-sky-500/20 dark:bg-slate-950/20">
                  <dt className="text-[11px] font-bold uppercase tracking-wide opacity-70">{t('knowledge.selected_source_name')}</dt>
                  <dd className="mt-0.5 break-words font-semibold">{selectedSource.name || selectedSource.sourceKey}</dd>
                </div>
                <div className="min-w-0 rounded-lg border border-sky-200/80 bg-white/70 px-2 py-1.5 dark:border-sky-500/20 dark:bg-slate-950/20">
                  <dt className="text-[11px] font-bold uppercase tracking-wide opacity-70">{t('knowledge.selected_source_key')}</dt>
                  <dd className="mt-0.5 break-words font-semibold">{selectedSource.sourceKey}</dd>
                </div>
                <div className="min-w-0 rounded-lg border border-sky-200/80 bg-white/70 px-2 py-1.5 dark:border-sky-500/20 dark:bg-slate-950/20">
                  <dt className="text-[11px] font-bold uppercase tracking-wide opacity-70">{t('knowledge.selected_source_id')}</dt>
                  <dd className="mt-0.5 font-semibold"><CopyableShortValue value={selectedSource.id} /></dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="mt-1 font-medium">{t('knowledge.document_source_select_hint')}</p>
          )}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label={t('knowledge.document_key')} value={documentForm.documentKey} disabled={disabled} onChange={(value) => manager.setDocumentForm((current) => ({ ...current, documentKey: value }))} />
          <Field label={t('knowledge.title_field')} value={documentForm.title} disabled={disabled} onChange={(value) => manager.setDocumentForm((current) => ({ ...current, title: value }))} />
          <Field label={t('knowledge.content_revision')} value={documentForm.contentRevision} disabled={disabled} onChange={(value) => manager.setDocumentForm((current) => ({ ...current, contentRevision: value }))} />
          <Field label={t('knowledge.content_reference')} value={documentForm.contentReference} disabled={disabled} onChange={(value) => manager.setDocumentForm((current) => ({ ...current, contentReference: value }))} />
          <Field label={t('knowledge.retention_policy')} value={documentForm.retentionPolicy} disabled={disabled} onChange={(value) => manager.setDocumentForm((current) => ({ ...current, retentionPolicy: value }))} />
          <Field label={t('knowledge.idempotency_key')} value={documentForm.idempotencyKey} disabled={disabled} onChange={(value) => manager.setDocumentForm((current) => ({ ...current, idempotencyKey: value }))} />
        </div>
        <div className="mt-3">
          <TextAreaField label={t('knowledge.metadata_json')} value={documentForm.normalizedMetadataText} disabled={disabled} onChange={(value) => manager.setDocumentForm((current) => ({ ...current, normalizedMetadataText: value }))} />
        </div>
        <div className="mt-4 grid gap-2">
          {documents.length > 0 ? documents.map((document) => (
            <DocumentRow key={document.id} document={document} disabled={disabled} manager={manager} />
          )) : <p className="text-sm text-[var(--text-muted)]">{t(noSelectedSource ? 'knowledge.no_source_selected' : 'knowledge.no_documents')}</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--text)]">{t('knowledge.indexing_title')}</h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{t('knowledge.indexing_subtitle')}</p>
          </div>
          <button type="button" disabled={disabled} onClick={() => void manager.runIndexing()} className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-muted)] disabled:text-[var(--text-muted)]">
            {t('knowledge.start_indexing')}
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <SelectField label={t('knowledge.document')} value={indexingForm.documentId} disabled={disabled} options={documentOptions} onChange={(value) => manager.setIndexingForm((current) => ({ ...current, documentId: value }))} />
          <Field label={t('knowledge.idempotency_key')} value={indexingForm.idempotencyKey} disabled={disabled} onChange={(value) => manager.setIndexingForm((current) => ({ ...current, idempotencyKey: value }))} />
          <Field label={t('knowledge.chunking_profile')} value={indexingForm.chunkingProfile} disabled={disabled} onChange={(value) => manager.setIndexingForm((current) => ({ ...current, chunkingProfile: value }))} />
          <Field label={t('knowledge.vectorization_profile')} value={indexingForm.vectorizationProfile} disabled={disabled} onChange={(value) => manager.setIndexingForm((current) => ({ ...current, vectorizationProfile: value }))} />
          <Field label={t('knowledge.embedding_provider')} value={indexingForm.embeddingProvider} disabled={disabled} onChange={(value) => manager.setIndexingForm((current) => ({ ...current, embeddingProvider: value }))} />
          <Field label={t('knowledge.embedding_model')} value={indexingForm.embeddingModel} disabled={disabled} onChange={(value) => manager.setIndexingForm((current) => ({ ...current, embeddingModel: value }))} />
          <Field label={t('knowledge.embedding_version')} value={indexingForm.embeddingVersion} disabled={disabled} onChange={(value) => manager.setIndexingForm((current) => ({ ...current, embeddingVersion: value }))} />
          <Field label={t('knowledge.chunk_size')} value={indexingForm.chunkSize} disabled={disabled} onChange={(value) => manager.setIndexingForm((current) => ({ ...current, chunkSize: value }))} />
        </div>
        <div className="mt-3">
          <TextAreaField label={t('knowledge.raw_content')} value={indexingForm.rawContent} rows={5} disabled={disabled} onChange={(value) => manager.setIndexingForm((current) => ({ ...current, rawContent: value }))} />
        </div>
        {manager.indexingResult ? (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={manager.indexingResult.readinessSummary.readinessStatus} label={operatorReadinessLabel(t, manager.indexingResult.readinessSummary.readinessStatus)} />
              <span className="font-semibold">{t('knowledge.indexing_completed')}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">
              <span>{t('knowledge.chunks')}: {manager.indexingResult.chunkCount}</span>
              <span>{t('knowledge.vectorizations')}: {manager.indexingResult.vectorizationCount}</span>
            </div>
            <div className="mt-2">
              <CopyableShortValue value={manager.indexingResult.job.id} />
            </div>
          </div>
        ) : null}
        <div className="mt-4 grid gap-2">
          {jobs.length > 0 ? jobs.map((job) => (
            <JobRow key={job.id} job={job} disabled={disabled} manager={manager} />
          )) : <p className="text-sm text-[var(--text-muted)]">{t(noSelectedSource ? 'knowledge.no_source_selected' : 'knowledge.no_jobs')}</p>}
        </div>
      </div>
    </section>
  )
}

function DocumentRow({ document, disabled, manager }: { document: KnowledgeDocument; disabled: boolean; manager: KnowledgeManager }) {
  const { t } = useI18n()
  return (
    <div className="min-h-[112px] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--text)] [overflow-wrap:anywhere] [word-break:break-word]">{document.title}</div>
          <div className="mt-1 text-xs text-[var(--text-muted)] [overflow-wrap:anywhere] [word-break:break-word]">{document.documentKey}</div>
          <div className="mt-2">
            <CopyableShortValue value={document.id} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={document.status} />
          <button type="button" disabled={disabled} onClick={() => void manager.updateDocumentMetadata(document)} className="inline-flex h-8 items-center justify-center rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--text)] disabled:cursor-not-allowed disabled:text-[var(--text-muted)]">
            {t('knowledge.update_document_metadata')}
          </button>
          <button type="button" disabled={disabled} onClick={() => confirmAction(t('knowledge.confirm_disable_document'), () => void manager.disableDocument(document.id))} className="inline-flex h-8 items-center justify-center rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--text)] disabled:cursor-not-allowed disabled:text-[var(--text-muted)]">
            {t('knowledge.disable_document')}
          </button>
        </div>
      </div>
    </div>
  )
}

function JobRow({ job, disabled, manager }: { job: KnowledgeIngestionJob; disabled: boolean; manager: KnowledgeManager }) {
  const { t } = useI18n()
  const canRetry = job.status === 'failed' || job.status === 'retry_scheduled'
  const readyJob = job.status === 'ready' || job.status === 'succeeded' || job.status === 'completed'
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[var(--text)]">{readyJob ? t('knowledge.indexing_completed') : job.pipelineStep}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
            <CopyableShortValue value={job.id} />
            {job.correlationId ? <CopyableShortValue value={job.correlationId} /> : null}
          </div>
          {job.errorMessage ? <div className="mt-1 text-xs text-rose-600">{job.errorMessage}</div> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={job.status} />
          <button type="button" disabled={disabled || !canRetry} onClick={() => void manager.retryIndexingJob(job.id)} className="inline-flex h-8 items-center justify-center rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--text)] disabled:cursor-not-allowed disabled:text-[var(--text-muted)]">
            {t('knowledge.retry_job')}
          </button>
        </div>
      </div>
    </div>
  )
}

function ChunkDrillDown({ manager }: { manager: KnowledgeManager }) {
  const { t } = useI18n()
  const [expandedChunkIds, setExpandedChunkIds] = useState<Set<string>>(() => new Set())
  const chunks = manager.selectedSourceDetail?.chunks ?? []

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <h3 className="text-sm font-bold text-[var(--text)]">{t('knowledge.chunks_title')}</h3>
      <div className="mt-3 grid gap-2">
        {chunks.length > 0 ? chunks.map((chunk, index) => {
          const expanded = expandedChunkIds.has(chunk.id)
          return (
            <article key={chunk.id} className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:items-start">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--text)]">{formatTemplate(t('knowledge.chunk_title'), { index: index + 1 })}</div>
                  <div className="mt-1 text-xs text-[var(--text-muted)] [overflow-wrap:anywhere] [word-break:break-word]">{chunk.chunkKey}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <CopyableShortValue value={chunk.id} />
                    <StatusBadge status={chunk.status} />
                    <StatusBadge status={chunk.accessScope} label={formatKnowledgeCode(t, 'access_scope_value', chunk.accessScope)} />
                  </div>
                </div>
                <p className={[
                  'whitespace-pre-wrap text-sm text-[var(--text-muted)] [overflow-wrap:anywhere] [word-break:break-word]',
                  expanded ? '' : 'max-h-14 overflow-hidden',
                ].join(' ')}
                >
                  {chunk.normalizedContent}
                </p>
              </div>
              <div className="mt-2 text-xs text-[var(--text-muted)] [overflow-wrap:anywhere] [word-break:break-word]">{chunk.citationAnchor}</div>
              {chunk.normalizedContent.length > 220 ? (
                <button
                  type="button"
                  onClick={() => setExpandedChunkIds((current) => {
                    const next = new Set(current)
                    if (next.has(chunk.id)) next.delete(chunk.id)
                    else next.add(chunk.id)
                    return next
                  })}
                  className="mt-2 text-sm font-semibold text-[var(--primary)]"
                >
                  {expanded ? t('knowledge.hide_full_chunk') : t('knowledge.show_full_chunk')}
                </button>
              ) : null}
            </article>
          )
        }) : <p className="text-sm text-[var(--text-muted)]">{t('knowledge.no_chunks')}</p>}
      </div>
    </section>
  )
}

function RetrievalRunRow({ run, manager }: { run: KnowledgeRetrievalRun; manager: KnowledgeManager }) {
  const { t } = useI18n()
  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-sm font-semibold text-[var(--text)]">{run.queryId || run.id}</div>
          <div className="break-all text-xs text-[var(--text-muted)]">{run.id} / {run.correlationId}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={run.outcome} />
          <button type="button" disabled={manager.isMutating} onClick={() => void manager.loadSupportReconstruction(run.id)} className="inline-flex h-8 items-center justify-center rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--text)] disabled:cursor-not-allowed disabled:text-[var(--text-muted)]">
            {t('knowledge.view_support_reconstruction')}
          </button>
        </div>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <ListBlock title={t('knowledge.effective_sources')} values={run.effectiveSourceIds} />
        <ListBlock title={t('knowledge.selected_chunks')} values={run.selectedChunkIds} />
        <ListBlock title={t('knowledge.citation_anchors')} values={run.citationAnchors} />
      </div>
    </article>
  )
}

function RetrievalDrillDown({ manager }: { manager: KnowledgeManager }) {
  const { t } = useI18n()
  const support = manager.supportReconstruction

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
      <h3 className="text-sm font-bold text-[var(--text)]">{t('knowledge.retrieval_drilldown_title')}</h3>
      {manager.retrievalErrorMessage ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
          {manager.retrievalErrorMessage}
        </div>
      ) : null}
      <div className="mt-3 grid gap-2">
        {manager.retrievalRuns.length > 0 ? manager.retrievalRuns.map((run) => (
          <RetrievalRunRow key={run.id} run={run} manager={manager} />
        )) : <p className="text-sm text-[var(--text-muted)]">{t(manager.retrievalErrorMessage ? 'knowledge.retrieval_runs_unavailable' : 'knowledge.no_retrieval_runs')}</p>}
      </div>
      {support ? (
        <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
          <h4 className="text-sm font-bold text-[var(--text)]">{t('knowledge.support_reconstruction_title')}</h4>
          <div className="mt-3">
            <InfoGrid
              items={[
                { label: t('knowledge.source_artifact'), value: `${support.sourceArtifactKind} / ${support.sourceArtifactId}` },
                { label: t('knowledge.authoritative_evidence_source'), value: support.authoritativeEvidenceSource },
                { label: t('knowledge.redaction_applied'), value: support.redactionApplied ? t('common.yes') : t('common.no') },
                { label: t('knowledge.direct_db_required'), value: support.directDbOrVectorDbRequired ? t('common.yes') : t('common.no') },
              ]}
            />
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <ListBlock title={t('knowledge.support_reconstruction_path')} values={support.supportReconstructionPath} />
            <ListBlock title={t('knowledge.troubleshooting_hints')} values={support.troubleshootingHints} />
          </div>
        </div>
      ) : null}
    </section>
  )
}

export function KnowledgeView({ manager, bindingReady = false }: { manager: KnowledgeManager; bindingReady?: boolean }) {
  const { t } = useI18n()
  const [advancedOpen, setAdvancedOpen] = useState(!bindingReady)
  const searchReady = knowledgeSearchReady(manager)
  const sourceCount = manager.releaseReadiness?.sourceCount ?? 0
  const readySourceValue = sourceCount > 0
    ? `${manager.releaseReadiness?.readySourceCount ?? 0}/${sourceCount}`
    : t('knowledge.no_indexed_readiness_data')
  const showBindingReadyButReleaseNotReady = bindingReady && !searchReady && manager.releaseReadiness?.releaseReady === false
  const advancedToggleLabel = advancedOpen
    ? t('knowledge.advanced_sources_collapse_label')
    : t('knowledge.advanced_sources_expand_label')
  const advancedSummary = searchReady
    ? t('knowledge.advanced_sources_ready_summary')
    : t('knowledge.advanced_sources_summary')

  useEffect(() => {
    setAdvancedOpen(!bindingReady && !searchReady)
  }, [bindingReady, searchReady])

  return (
    <div className="space-y-4">
      {manager.notice ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">{manager.notice}</div> : null}
      {manager.warningMessage ? <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">{manager.warningMessage}</div> : null}
      {manager.errorMessage ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">{manager.errorMessage}</div> : null}
      {manager.formError ? <p className="text-sm font-medium text-rose-600">{manager.formError}</p> : null}
      <MutationResultBlock title={t('knowledge.mutation_result')} result={manager.mutationResult} hideMissingOptionalFields />
      {searchReady ? (
        <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100 sm:flex-row sm:items-center sm:justify-between">
          <span>{t('knowledge.indexing_ready_next_step')}</span>
          <a href={`/tenants/${manager.tenantId}/agents/${manager.agentId}/releases`} className="inline-flex h-9 items-center justify-center rounded-lg border border-emerald-300 px-3 text-sm font-bold text-emerald-900 hover:bg-emerald-100 dark:border-emerald-500/40 dark:text-emerald-50 dark:hover:bg-emerald-500/20">
            {t('knowledge.go_to_releases')}
          </a>
        </div>
      ) : null}
      {bindingReady && !searchReady ? (
        <section className="rounded-2xl border border-sky-300 bg-sky-50 p-4 text-sky-900 shadow-[var(--shadow-soft)] dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-100">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-sky-700 dark:text-sky-200">{t('knowledge.current_step_title')}</p>
              <h3 className="mt-1 text-base font-bold">{t('knowledge.current_step_ready_title')}</h3>
              <p className="mt-1 max-w-4xl text-sm font-medium">{t('knowledge.current_step_ready_hint')}</p>
            </div>
            <a
              href={`/tenants/${manager.tenantId}/agents/${manager.agentId}/capabilities`}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-[var(--primary)] bg-[var(--primary)] px-4 text-sm font-bold text-white hover:bg-[var(--primary-hover)]"
            >
              {t('knowledge.current_step_capabilities')}
            </a>
          </div>
        </section>
      ) : null}

      {manager.isLoading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)]">{t('common.loading')}</div>
      ) : (
        <>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <h3 className="text-sm font-bold text-[var(--text)]">{t('knowledge.readiness_title')}</h3>
            {showBindingReadyButReleaseNotReady ? (
              <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                {t('knowledge.binding_ready_release_not_ready_reason')}
              </p>
            ) : null}
            <div className="mt-3">
              <InfoGrid
                items={[
                  { label: t('knowledge.release_ready'), value: manager.releaseReadiness?.releaseReady ? t('common.yes') : t('common.no') },
                  { label: t('knowledge.ready_sources'), value: readySourceValue },
                  { label: t('knowledge.failed_sources'), value: manager.releaseReadiness?.failedOrRetryableSourceCount ?? 0 },
                  { label: t('knowledge.retrieval_runs'), value: manager.retrievalRuns.length },
                ]}
              />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <SourceList manager={manager} />
            <SourceDetail manager={manager} />
          </section>

          <details
            open={advancedOpen}
            onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]"
          >
            <summary
              role="button"
              aria-expanded={advancedOpen}
              aria-label={advancedToggleLabel}
              className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 transition hover:border-[var(--primary)] hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] marker:hidden"
            >
              <span className="min-w-0">
                <span className="block text-sm font-bold text-[var(--text)]">{t('knowledge.advanced_sources_title')}</span>
                <span className="mt-1 block text-sm text-[var(--text-muted)]">{advancedSummary}</span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--text)] shadow-sm">
                <span>{advancedOpen ? t('knowledge.advanced_sources_collapse') : t('knowledge.advanced_sources_expand')}</span>
                <ChevronDownIcon className={['h-4 w-4 text-[var(--text-muted)] transition-transform', advancedOpen ? 'rotate-180' : ''].join(' ')} />
              </span>
            </summary>
            <div className="mt-4 space-y-4">
              <SourceForms manager={manager} />
              <DocumentsAndIndexing manager={manager} />
              <section className="grid items-start gap-4 xl:grid-cols-2">
                <ChunkDrillDown manager={manager} />
                <RetrievalDrillDown manager={manager} />
              </section>
            </div>
          </details>
        </>
      )}
    </div>
  )
}
