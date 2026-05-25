# Stage 04: Tenants

Status: `ready-for-stage-implementation`

## Goal

Enable operators to provision, inspect and operate service tenants using
backend-owned tenant read models and provisioning contracts.

## Dependencies

- Stages 01-03 are accepted and implemented.
- Prompt 03 accepts this stage TZ before implementation.

## Exact Scope

- Add `src/modules/Tenants`.
- Add `/tenants` and `/tenants/:tenantId`.
- Implement tenant list/detail, provisioning wizard, provisioning status,
  audit/correlation summary, allowed metadata/status/config actions and
  default config provisioning.
- Generate `provisioning_correlation_id` and idempotency key in model/API
  layer.
- Send `provisioning_correlation_id` in the provisioning body and set
  `X-Request-ID` to the same value where the module API helper controls
  headers.
- Generate/reuse `idempotency_key` for retry of the same provisioning attempt
  and pass it through the body/header shape documented by the frontend API
  reference.
- Use portal read models for summary screens.

## Out Of Scope

- Customer portal self-service.
- Agents, widgets, usage, billing and support screens.
- Frontend-local tenant readiness calculation.
- Direct DB or backend-internal provider calls.

## Routes / Navigation Impact

- Add Tenants navigation entry under Customers.
- Tenant detail becomes the parent context for future tenant-scoped routes.
- Do not show future agent/usage/billing child links before their stages ship.

## Module / File Ownership

- `src/modules/Tenants/api` owns endpoint calls and DTO mapping.
- `src/modules/Tenants/model` owns list filters, provisioning attempt state,
  correlation/idempotency generation and mutation orchestration.
- `src/modules/Tenants/pages` owns list/detail route composition.
- `src/modules/Tenants/ui` owns tables, detail sections, forms and dialogs.
- `src/core/router` and `src/shared/ui/AppShell` add route/navigation entries.

## Reuse Rules And Responsibility Boundaries

- Pages/ui consume model hooks and do not call `apiClient`.
- Portal read models are primary for list/detail summary displays.
- Forms show only accepted visible v1 fields unless backend contract expands.
- No duplicate readiness, status, correlation/idempotency or provisioning state
  outside the model layer.

## API Contracts

- `GET /api/admin/v1/system/portal/tenants`
- `GET /api/admin/v1/system/portal/tenants/{tenant_id}`
- `POST /api/admin/v1/system/tenants/provisioning`
- `GET /api/admin/v1/tenants/{tenant_id}/provisioning`
- `GET /api/admin/v1/tenants/{tenant_id}/provisioning/audit-summary`
- `PATCH /api/admin/v1/system/tenants/{tenant_id}/provisioning/metadata`
- `PATCH /api/admin/v1/system/tenants/{tenant_id}/provisioning/status`
- `PATCH /api/admin/v1/system/tenants/{tenant_id}/status`
- `POST /api/admin/v1/system/tenants/{tenant_id}/configuration/provision-default`
- `GET /api/admin/v1/tenants/{tenant_id}/configuration`
- `PUT /api/admin/v1/tenants/{tenant_id}/configuration`

## UI/UX States

- Tenant list: loading, empty, filtered-empty, error and stale/refetch states.
- Provisioning wizard fields: `tenant_name`, `external_customer_ref`,
  optional `external_billing_ref`.
- Detail shows status, provisioning, audit/correlation and configuration states.
- Status/config mutations require confirmation and show correlation/result
  feedback.

## Access / Security Requirements

- Internal authenticated operators only.
- Permissions first; critical mutations default to `platform_admin` when
  backend permissions are absent.
- Mutations use CSRF and existing request/error handling.

## Tests And Verification Commands

- `npm run test:admin`
- `npm run lint:admin`
- `npm run build:admin`
- Tests cover provisioning payload shape, route guards, read model mapping,
  empty/error states and permission-aware mutations.

## Docs Impact

- After acceptance, update app docs with Tenants module ownership, routes and
  provisioning recipes.

## Acceptance Criteria

- Operators can list, provision and inspect tenants.
- Tenant detail uses backend read models and approved actions only.
- Correlation/idempotency is handled in module model/API layer.
- No future agent/billing/support UI is exposed.

## Future-Stage Forbidden Actions

- Do not implement Agents, Dashboard, Usage, Billing or Conversations.
- Do not compute readiness locally.
- Do not add direct backend-internal calls.

## Expected Gate Result

- Prompt 03 verifies Tenant scope and contracts.
- Prompt 04 may implement Stage 04 only after Stages 01-03 are accepted.
