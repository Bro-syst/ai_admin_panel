import { Link } from 'react-router-dom'
import { useI18n } from '@/core/i18n/useI18n'
import type { ModelUsage } from '@/modules/UsageBilling/api/usageBillingApi'
import type { UsageBillingManager } from '@/modules/UsageBilling/model/useUsageBillingManager'
import { valueOrEmpty } from '@/modules/UsageBilling/ui/format'
import { InfoGrid, ListBlock } from '@/shared/ui/EntityInfo'
import { ActionButton, Field, JsonBlock, NoticeBlocks } from '@/modules/UsageBilling/ui/UsageBillingShared'
import { RefreshButton } from '@/shared/ui/RefreshButton'

function UsageItemCard({
  item,
  selected,
  onSelect,
}: {
  item: ModelUsage
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'rounded-xl border p-3 text-left hover:border-[var(--primary)]',
        selected ? 'border-[var(--primary)] bg-[var(--surface)]' : 'border-[var(--border)] bg-[var(--surface-muted)]',
      ].join(' ')}
    >
      <div className="break-all text-sm font-bold text-[var(--text)]">{item.id}</div>
      <div className="mt-1 text-xs text-[var(--text-muted)]">{item.modelRequestId}</div>
      <div className="mt-2 text-xs text-[var(--text-muted)]">{item.totalTokens} tokens</div>
    </button>
  )
}

export function UsageView({ manager }: { manager: UsageBillingManager }) {
  const { t } = useI18n()
  const metering = manager.usageMetering
  const selected = manager.selectedUsage

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to={`/tenants/${manager.tenantId}`} className="text-sm font-semibold text-[var(--primary-hover)] hover:underline">
            {t('usage_billing.back_to_tenant')}
          </Link>
          <h2 className="mt-2 text-lg font-bold text-[var(--text)]">{t('usage_billing.usage_title')}</h2>
          <p className="mt-1 break-all text-sm text-[var(--text-muted)]">{manager.tenantId}</p>
        </div>
        <Link
          to={`/tenants/${manager.tenantId}/billing-export`}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-muted)]"
        >
          {t('usage_billing.billing_title')}
        </Link>
      </div>

      <NoticeBlocks notice={manager.notice} errorMessage={manager.errorMessage} formError={manager.formError} />

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
        <h3 className="text-sm font-bold text-[var(--text)]">{t('usage_billing.filters')}</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <Field label={t('usage_billing.window_start')} value={manager.filters.windowStart} onChange={(value) => manager.setFilters((current) => ({ ...current, windowStart: value }))} />
          <Field label={t('usage_billing.window_end')} value={manager.filters.windowEnd} onChange={(value) => manager.setFilters((current) => ({ ...current, windowEnd: value }))} />
          <Field label={t('usage_billing.agent_id_optional')} value={manager.filters.agentId} placeholder="agent_..." onChange={(value) => manager.setFilters((current) => ({ ...current, agentId: value }))} />
          <div className="flex items-end">
            <RefreshButton onClick={() => void manager.loadUsageBilling()} />
          </div>
        </div>
      </section>

      {manager.isLoading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)] shadow-[var(--shadow-soft)]">{t('common.loading')}</div>
      ) : (
        <>
          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <h3 className="text-sm font-bold text-[var(--text)]">{t('usage_billing.metering_summary')}</h3>
            <div className="mt-3">
              <InfoGrid
                items={[
                  { label: t('usage_billing.request_count'), value: metering?.requestCount ?? 0 },
                  { label: t('usage_billing.input_tokens'), value: metering?.totalInputTokens ?? 0 },
                  { label: t('usage_billing.output_tokens'), value: metering?.totalOutputTokens ?? 0 },
                  { label: t('usage_billing.total_tokens'), value: metering?.totalTokens ?? 0 },
                  { label: t('usage_billing.billing_owner_marker'), value: metering?.billingOwnerMarker ?? t('agents.empty_value') },
                  { label: t('usage_billing.billing_owner_stage'), value: metering?.billingOwnerStage ?? t('agents.empty_value') },
                  { label: t('usage_billing.export_status_preview'), value: metering?.exportStatusPreview ?? t('agents.empty_value') },
                ]}
              />
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <JsonBlock title={t('usage_billing.token_totals')} value={metering?.tokenTotals ?? {}} />
              <JsonBlock title={t('usage_billing.billable_summary')} value={metering?.billableActivitySummary ?? {}} />
              <JsonBlock title={t('usage_billing.non_billable_summary')} value={metering?.nonBillableClassificationSummary ?? {}} />
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <ListBlock title={t('usage_billing.linked_refs')} values={metering?.linkedChatTurnRequestRefs ?? []} />
              <JsonBlock title={t('usage_billing.model_breakdown')} value={metering?.modelBreakdown ?? []} />
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
            <h3 className="text-sm font-bold text-[var(--text)]">{t('usage_billing.usage_summary')}</h3>
            <div className="mt-3">
              <InfoGrid
                items={[
                  { label: t('usage_billing.anchor_kind'), value: manager.usageSummary?.anchorKind ?? t('agents.empty_value') },
                  { label: t('usage_billing.anchor_id'), value: manager.usageSummary?.anchorId ?? t('agents.empty_value') },
                  { label: t('usage_billing.total_records'), value: manager.usageSummary?.totalRecords ?? 0 },
                  { label: t('usage_billing.request_count'), value: manager.usageSummary?.requestCount ?? 0 },
                  { label: t('usage_billing.input_tokens'), value: manager.usageSummary?.totalInputTokens ?? 0 },
                  { label: t('usage_billing.output_tokens'), value: manager.usageSummary?.totalOutputTokens ?? 0 },
                  { label: t('usage_billing.total_tokens'), value: manager.usageSummary?.totalTokens ?? 0 },
                ]}
              />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('usage_billing.drilldown')}</h3>
              <div className="mt-3 grid gap-3">
                <Field label={t('usage_billing.chat_id')} value={manager.filters.chatId} onChange={(value) => manager.setFilters((current) => ({ ...current, chatId: value }))} />
                <ActionButton onClick={() => void manager.loadAnchoredUsage('chat')}>{t('usage_billing.load_chat_usage')}</ActionButton>
                <Field label={t('usage_billing.conversation_turn_id')} value={manager.filters.conversationTurnId} onChange={(value) => manager.setFilters((current) => ({ ...current, conversationTurnId: value }))} />
                <ActionButton onClick={() => void manager.loadAnchoredUsage('turn')}>{t('usage_billing.load_turn_usage')}</ActionButton>
                <Field label={t('usage_billing.model_request_id')} value={manager.filters.modelRequestId} onChange={(value) => manager.setFilters((current) => ({ ...current, modelRequestId: value }))} />
                <ActionButton onClick={() => void manager.loadAnchoredUsage('modelRequest')}>{t('usage_billing.load_model_usage')}</ActionButton>
                <Field label={t('usage_billing.usage_id')} value={manager.filters.usageId} onChange={(value) => manager.setFilters((current) => ({ ...current, usageId: value }))} />
                <ActionButton onClick={() => void manager.loadUsageDetail()}>{t('usage_billing.load_usage_detail')}</ActionButton>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
              <h3 className="text-sm font-bold text-[var(--text)]">{t('usage_billing.usage_detail')}</h3>
              {manager.isDetailLoading ? <p className="mt-3 text-sm text-[var(--text-muted)]">{t('common.loading')}</p> : null}
              <div className="mt-3 grid gap-2">
                {manager.usageItems.map((item) => (
                  <UsageItemCard key={item.id} item={item} selected={selected?.id === item.id} onSelect={() => manager.setSelectedUsage(item)} />
                ))}
              </div>
              {selected ? (
                <div className="mt-4">
                  <InfoGrid
                    items={[
                      { label: t('usage_billing.usage_id'), value: selected.id },
                      { label: t('usage_billing.model_request_id'), value: selected.modelRequestId },
                      { label: t('usage_billing.model_response_id'), value: valueOrEmpty(selected.modelResponseId, t('agents.empty_value')) },
                      { label: t('usage_billing.input_tokens'), value: selected.inputTokens },
                      { label: t('usage_billing.output_tokens'), value: selected.outputTokens },
                      { label: t('usage_billing.total_tokens'), value: selected.totalTokens },
                      { label: t('usage_billing.created'), value: selected.createdAt },
                    ]}
                  />
                </div>
              ) : (
                <p className="mt-3 text-sm text-[var(--text-muted)]">{t('usage_billing.no_usage_detail')}</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
