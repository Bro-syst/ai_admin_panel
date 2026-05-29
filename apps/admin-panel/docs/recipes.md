# Implementation Recipes

Use these recipes as the practical reference for building AI Core Admin Portal features in the established app style.

## Add A New Page Module

1. Create a module in `src/modules/<ModuleName>`.
2. Add `pages/<ModuleName>Page.tsx`.
3. Export the page from `src/modules/<ModuleName>/index.ts`.
4. Register the route in `src/core/router/routes.tsx` with a lazy import from the module public API.
5. Add navigation in `AppShell` only after the page is real and usable.
6. Add a page/component test for the happy path and the main empty/error state.

Recommended shape:

```text
src/modules/Users/
  index.ts
  api/
  model/
  ui/
  pages/
```

## Add A Navigation Entry

1. Add the protected route first and verify it renders a useful page.
2. Add the shell entry in `src/shared/ui/AppShell`.
3. Put the entry into the existing Overview, Workspace, Access, Customers or
   Session group.
4. Hide unavailable routes; do not add disabled future-stage placeholders.
5. If visibility depends on role or permission, derive it from current auth
   state and keep route guards as the access authority.
6. Verify expanded desktop, collapsed desktop and mobile bottom navigation do
   not wrap or expose future routes.

## Add An API Call

1. Put the request in `src/modules/<ModuleName>/api`.
2. Define backend payload types next to the request.
3. Map backend payloads to frontend models before returning from the API layer.
4. Use `apiClient`; do not import `axios` in pages or UI.
5. Add a mapping test when the backend shape is nested, optional, or security-sensitive.

Pattern:

```ts
const PREFIX = '/api/v1/users'

type UserPayload = {
  id?: string
  email?: string
}

export type User = {
  id: string
  email: string
}

function mapUser(payload: UserPayload): User {
  if (!payload.id || !payload.email) throw new Error('Invalid users response')
  return {
    id: String(payload.id),
    email: String(payload.email),
  }
}
```

## Add Scenario Logic

1. Keep orchestration in `src/modules/<ModuleName>/model`.
2. Keep rendering-only components in `ui`.
3. Let `pages` compose model hooks and UI components.
4. Avoid global state unless the data is infrastructure-wide.

## Add A Tenant Operator Flow

1. Put tenant transport calls and DTO mapping in `src/modules/Tenants/api`.
2. Use portal read-model endpoints for tenant list/detail summaries.
3. Generate provisioning correlation and idempotency values in
   `src/modules/Tenants/model` or pass them through the module API boundary.
4. Keep provisioning form state, filters, configuration drafts and mutation
   result feedback in the Tenants model layer.
5. Render list/detail/provisioning/audit/configuration states in
   `src/modules/Tenants/ui` through manager callbacks only.
6. Gate tenant mutations through backend-supported actions and current admin
   role/permissions.
7. Require confirmation for tenant status/configuration/provisioning metadata
   mutations and display backend result/correlation feedback after success.
8. Do not add future tenant child links for agents, widgets, usage, billing or
   support until their stage has a working page. Tenant-level Conversations,
   Usage & Metering and Billing Export links are allowed after Stages 11 and
   12 because those pages are implemented.

## Add A Read-Model Overview Flow

Use this pattern for dashboard or operations surfaces that summarize backend
portal state.

1. Put read-model endpoint calls and DTO mapping in
   `src/modules/Operations/api`.
2. Keep loading, error, empty/low-data and refresh orchestration in
   `src/modules/Operations/model`.
3. Render summary cards, key-value blocks and platform settings in
   `src/modules/Operations/ui`.
4. Keep route pages in `src/modules/Operations/pages` as composition only.
5. Link only to implemented routes; do not show future-stage actions as
   disabled placeholders.
6. Treat dashboard, operations and platform settings responses as backend-owned
   truth. Do not calculate readiness, billing, policy or provider state
   locally.

## Add A Tenant-Scoped Agent Flow

Use this pattern for agent catalog, create, list and lifecycle surfaces inside a
tenant context.

1. Keep catalog endpoint calls and DTO mapping in
   `src/modules/AgentTemplates/api`.
2. Keep agent list/detail/create/mutation endpoint calls and DTO mapping in
   `src/modules/Agents/api`.
3. Keep template selection, create form orchestration, detail refresh and
   mutation action gating in `model` hooks.
4. Use portal agent read models for list/detail summaries and use setup,
   foundation and channel endpoints as read-only backend-owned sections.
5. Gate metadata, status and lifecycle controls through backend
   `supportedMutationActions` and current admin permissions.
6. Require confirmation before status/lifecycle changes and display backend
   mutation result/correlation feedback after success.
7. Link only to implemented tenant-scoped agent routes. Config links are
   allowed after the Agent Config stage, Knowledge links are allowed after the
   Knowledge stage, Capabilities/Policy links are allowed after Stage 09, and
   Sites & Widgets/Releases links are allowed after Stage 10. Tenant-level
   Conversations, Usage & Metering and Billing Export links are allowed from
   tenant detail after Stages 11 and 12, not as agent lifecycle actions.
8. Do not render raw backend future-stage action refs as visible UI actions.

## Add A Tenant-Scoped Agent Config Flow

Use this pattern for versioned agent behavior configuration inside an accepted
tenant/agent context.

1. Keep AgentConfig endpoint calls and DTO mapping in
   `src/modules/AgentConfig/api`.
2. Keep draft payload state, selected version state, backend validation result,
   controlled option metadata, mutation result feedback and action gating in
   `src/modules/AgentConfig/model`.
3. Render only approved AgentConfig payload groups in
   `src/modules/AgentConfig/ui`.
4. Render enum-like operator fields as controlled selects/chips/toggles:
   model family, sensitivity values, preferred capabilities, profile, response
   mode, schema version, safety labels, tone, language and boolean toggles.
5. Preserve unknown backend values as current/custom values and submit
   canonical backend values rather than localized labels.
6. Use `POST /config-drafts` for draft creation and `POST /configs` for config
   version creation.
7. Treat backend validation as the authority for config validity; require the
   displayed validation result before activation.
8. Require confirmation before create-version, activation and rollback actions,
   and include the rollback target version in the confirmation text.
9. Gate config mutations through backend `supportedMutationActions` plus current
   admin permissions.
10. Keep validate vs activate guidance explicit, show active config evidence
    after activation where returned, and keep safe mutation result values
    visible/copyable after critical actions.
11. Use safe explicit fallbacks when correlation/request/status/version
    evidence is missing; do not generate fake evidence ids.
12. Do not expose raw provider routing overrides, backend-internal/provider
    credentials, tokens, secrets, internal prompts or cross-flow
    Knowledge/Policy/Release actions.
13. Do not calculate release readiness, billing, policy or provider state from
    config data in the frontend.

## Add A Tenant-Scoped Knowledge Flow

Use this pattern for managed knowledge source, indexing, retrieval evidence and
agent binding surfaces inside an accepted tenant/agent context.

1. Register the route through `src/modules/Knowledge/index.ts` and keep the
   page under `/tenants/:tenantId/agents/:agentId/knowledge`.
2. Keep portal knowledge source/readiness, source detail, document/indexing and
   support-safe retrieval endpoint calls and DTO mapping in
   `src/modules/Knowledge/api`.
3. Keep source selection, registration/indexing orchestration,
   release-readiness state, retrieval drill-down state and mutation result
   feedback in `src/modules/Knowledge/model`.
4. Render source catalog/detail, backend readiness issues, support-safe chunks,
   retrieval runs and support reconstruction in `src/modules/Knowledge/ui`.
5. Keep agent knowledge binding status/catalog/update/disable behavior inside
   `src/modules/AgentKnowledgeBinding`.
6. Treat backend read models as authoritative for indexing, readiness,
   release impact and support evidence. Do not calculate readiness locally.
7. Do not add generic upload UI or direct DB/vector/provider/internal backend
   calls.
8. Gate source/document/indexing/binding mutations through backend-supported
   actions plus current admin permissions, require confirmations for destructive
   changes and show backend result/correlation feedback.
9. Link to Knowledge only from implemented tenant/agent context. Capabilities,
   Policy, Sites & Widgets and Releases links are allowed after their accepted
   stages. Conversations belongs to the tenant detail support context after
   Stage 11; Usage & Metering and Billing Export belong to tenant detail after
   Stage 12.

## Add A Tenant-Scoped Capabilities And Policy Flow

Use this pattern for capability assignment and policy binding surfaces inside
an accepted tenant/agent context.

1. Register routes through `src/modules/AgentCapabilities/index.ts` and
   `src/modules/AgentPolicy/index.ts` under
   `/tenants/:tenantId/agents/:agentId/capabilities` and
   `/tenants/:tenantId/agents/:agentId/policy`.
2. Keep capability catalog/current assignment endpoint calls and DTO mapping in
   `src/modules/AgentCapabilities/api`.
3. Keep capability form orchestration, backend action gating, readiness/issues
   and mutation result feedback in `src/modules/AgentCapabilities/model`.
4. Keep policy profile catalog/current binding/validation endpoint calls and
   DTO mapping in `src/modules/AgentPolicy/api`.
5. Keep policy form orchestration, backend validation result display, backend
   action gating and mutation result feedback in `src/modules/AgentPolicy/model`.
6. Treat backend catalogs, assignments, bindings, validation results,
   readiness/issues and supported mutation actions as authoritative.
7. Gate mutations through backend-supported actions plus current admin
   permissions and require confirmation when production behavior changes.
8. Consume agent context through public module exports; do not deep-import
   another feature module's internals.
9. Do not implement a frontend policy engine, safety scoring, local release
   readiness, billing/pricing calculation or future support/usage/billing
   routes/actions.

## Add A Tenant-Scoped Sites, Widgets And Releases Flow

Use this pattern for public widget channel setup and controlled release
publication inside an accepted tenant/agent context.

1. Register routes through `src/modules/SitesWidgets/index.ts` and
   `src/modules/Releases/index.ts` under
   `/tenants/:tenantId/agents/:agentId/sites-widgets` and
   `/tenants/:tenantId/agents/:agentId/releases`.
2. Keep portal site/widget status, site management and widget management calls
   and DTO mapping in `src/modules/SitesWidgets/api`.
3. Keep public widget smoke calls in
   `src/modules/SitesWidgets/api/publicWidgetApi.ts` with admin cookies
   omitted; do not use admin identity as visitor identity.
4. Keep site/widget forms, smoke orchestration, backend action gating and
   mutation result feedback in `src/modules/SitesWidgets/model`.
5. Render install guidance from backend portal binding values such as widget
   key, site hostname, site id, widget id, allowed origin counts and binding
   readiness. Do not invent runtime config or readiness locally.
6. Keep release readiness, release evidence requirements, release list/detail,
   draft/manual override, publish, rollback and disable endpoint calls and DTO
   mapping in `src/modules/Releases/api`.
7. Keep release draft payload building, selected release state, smoke-case
   evidence matrix state, publish evidence state, backend action gating and
   mutation result feedback in `src/modules/Releases/model`.
8. Require confirmations for publish, rollback and disable actions with
   version, status, gate mode and active marker in the confirmation text.
9. Treat backend release readiness, release evidence requirements, release
   gates, manual override fields, evidence and active/latest release snapshots
   as authoritative.
10. Submit backend `required_change_kind` and all backend-required
    `evidence.smoke_cases[]` rows; keep localized labels out of payloads.
11. Do not implement Conversations, Usage, Metering or Billing Export in this
    flow.

## Add A Tenant-Scoped Conversations Support Flow

Use this pattern for operator support inspection of runtime conversations in a
tenant context.

1. Register the route through `src/modules/Conversations/index.ts` under
   `/tenants/:tenantId/conversations`.
2. Keep runtime summary, chat, message, turn and current-memory endpoint calls
   and DTO mapping in `src/modules/Conversations/api`.
3. Keep filters, selected chat/message/turn state, refresh, support evidence
   refs, permission derivation and close orchestration in
   `src/modules/Conversations/model`.
4. Render support-safe runtime summary, chat list/detail, messages, turns,
   current memory, redaction states and mutation result/correlation feedback in
   `src/modules/Conversations/ui`.
5. Treat backend support-safe fields and runtime summary read models as the
   display boundary. Do not expose raw snapshots, prompts, secrets or provider
   internals unless the backend exposes support-safe fields.
6. Keep the UI read-only except the approved close action; require
   confirmation before closing a conversation and gate the action through
   backend/current-admin permissions.
7. Link Conversations only from implemented tenant detail/support context. Do
   not add Usage, Metering or Billing Export routes/actions inside the
   Conversations module. Those routes belong to the accepted UsageBilling
   module after Stage 12.
8. Do not calculate readiness, policy, usage, billing or pricing locally, and
   do not call runtime databases, vector stores, model providers or internal
   backend services directly.

## Add A Tenant-Scoped Usage And Billing Export Flow

Use this pattern for operator inspection of backend-owned usage, metering and
billing export state in a tenant context.

1. Register routes through `src/modules/UsageBilling/index.ts` under
   `/tenants/:tenantId/usage` and `/tenants/:tenantId/billing-export`.
2. Keep usage/metering read-model, usage summary/detail, chat usage,
   conversation turn usage, model request usage, billing export status and
   billing export mutation endpoint calls and DTO mapping in
   `src/modules/UsageBilling/api`.
3. Keep filters, selected usage state, usage drill-down orchestration,
   permission derivation, idempotency refs, mutation forms and billing export
   mutation orchestration in `src/modules/UsageBilling/model`.
4. Render usage summaries, metering blocks, drill-down panels, billing export
   status, read-only permission states, confirmations and result/correlation
   feedback in `src/modules/UsageBilling/ui`.
5. Treat backend usage, metering and billing export read models as
   authoritative. Display token/request/activity/export values as returned;
   do not calculate pricing, invoices, payments, taxes or revenue locally.
6. Default billing export mutations to `platform_admin` unless explicit backend
   billing write/export permissions are present, and require confirmation for
   export, failure, retry and reconciliation actions.
7. Link Usage & Metering and Billing Export only from implemented tenant detail
   context. Do not add customer billing portal UI or global placeholder
   navigation.
8. Do not call runtime databases, vector stores, model providers or internal
   backend services directly.

## Add Shared UI

Move UI to `src/shared/ui` only when at least two modules need it or the component is clearly infrastructure-level.

Good shared candidates:
- buttons and icon buttons;
- shell/layout primitives;
- dialogs;
- error support details;
- dividers and basic controls.

Poor shared candidates:
- domain cards used by one module;
- page-specific filters;
- API-aware components.

## Add Auth Or Security Behavior

1. Keep session lifecycle in `src/core/auth`.
2. Keep transport behavior in `src/core/api/interceptors`.
3. Add tests for unauthorized, locked, CSRF, and redirect behavior when touched.
4. Keep sensitive actions backend-driven. The frontend should reflect backend state, not invent security truth.

## Add Text

1. Add message keys to `src/core/i18n/messages.ts`.
2. Use `t('message.key')` in components.
3. Keep English as the complete baseline.
4. The supported portal languages are English, Spanish, Russian, and Simplified Chinese.
5. Backend error messages must be shown through localized `error_code` keys, not raw backend `message` text.

## Run Final Smoke Evidence

Use this before umbrella finalization or after a broad Admin Portal route/module
change.

1. Keep `src/core/router/adminPortalFinalSmoke.test.tsx` aligned with shipped
   routes only; do not add future placeholders to make the smoke pass.
2. Run `npm run test:admin`, `npm run lint:admin` and `npm run build:admin`
   from the repository root.
3. Run forbidden-call searches for direct module transport, browser token
   storage, direct DB/vector/provider clients and local billing/readiness
   calculations.
4. Record command output and any accepted residual risk in
   `docs/tz/admin-portal-frontend/pipeline_state.md`.
5. If a route/module boundary issue is found, fix it in the owning module and
   repeat the acceptance review before prompt 07 finalization.

## Delivery Checklist

Before a module or architecture change is considered done:

```bash
npm test
npm run lint
npm run build
```

Also update docs when the change adds a route, module, backend boundary, or repeatable pattern.
