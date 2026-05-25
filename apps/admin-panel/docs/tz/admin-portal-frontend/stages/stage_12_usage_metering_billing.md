# Stage 12: Usage, Metering And Billing Export

Status: `ready-for-stage-implementation`

## Goal

Expose billing-relevant usage, metering and billing export status/actions
without implementing pricing, invoice, payment or tax logic in the frontend.

## Dependencies

- Stages 01-11 are accepted and implemented.
- Prompt 03 accepts this stage TZ before implementation.

## Exact Scope

- Add `src/modules/UsageBilling`.
- Add:
  - `/tenants/:tenantId/usage`
  - `/tenants/:tenantId/billing-export`
- Implement usage summary/detail, model request detail, chat usage,
  conversation turn usage and attribution where returned.
- Implement metering read model display.
- Implement billing export status and permitted export/failure/retry/
  reconciliation actions.

## Out Of Scope

- Pricing, invoice, payment, tax or revenue recognition logic.
- Frontend billing calculations.
- Customer billing portal.
- New conversation support behavior.

## Routes / Navigation Impact

- Add Usage & Metering and Billing Export links under Production.
- Preserve Conversations and release routes.

## Module / File Ownership

- `src/modules/UsageBilling/api` owns endpoint calls and DTO mapping.
- `src/modules/UsageBilling/model` owns filters, read model state and export
  mutation orchestration.
- `src/modules/UsageBilling/pages` owns route composition.
- `src/modules/UsageBilling/ui` owns summaries, detail panels and dialogs.

## Reuse Rules And Responsibility Boundaries

- Pages/ui do not call `apiClient`.
- Backend usage/metering/billing read models are authoritative.
- No local pricing or invoice math.
- Billing export mutations default to `platform_admin` unless backend
  permissions explicitly allow more.

## API Contracts

- `GET /api/admin/v1/portal/tenants/{tenant_id}/usage-metering`
- `GET /api/admin/v1/portal/tenants/{tenant_id}/billing-export`
- Management/drill-down groups:
  `/api/admin/v1/tenants/{tenant_id}/usage*`
  and `/api/admin/v1/tenants/{tenant_id}/billing/*`.

## UI/UX States

- Usage summary/detail supports loading, empty, filtered-empty, error and
  refresh states.
- Attribution displays channel/site/widget/chat/turn data where returned.
- Billing export shows current status, last results, failures and correlation.
- Export/failure/retry/reconciliation mutations require confirmation and show
  result/correlation state.

## Access / Security Requirements

- Protected tenant-scoped routes.
- Billing mutations are permission-aware; default admin-only.
- Mutations are CSRF-protected.
- Read-only for operators/viewers unless backend permissions allow otherwise.

## Tests And Verification Commands

- `npm run test:admin`
- `npm run lint:admin`
- `npm run build:admin`
- Tests cover read model mapping, no local billing calculation, permission
  visibility, mutation confirmations and correlation/result states.

## Docs Impact

- Update usage/billing export docs after acceptance.

## Acceptance Criteria

- Operators can inspect usage/metering and permitted billing export operations.
- No frontend pricing/invoice/payment/tax logic exists.
- Permission behavior matches backend contracts.

## Future-Stage Forbidden Actions

- Do not implement final umbrella closure or evidence-only docs changes in this
  stage.
- Do not add local billing calculations.
- Do not introduce customer billing views.

## Expected Gate Result

- Prompt 03 verifies usage/billing scope and contracts.
- Prompt 04 may implement Stage 12 only after Stages 01-11 are accepted.
