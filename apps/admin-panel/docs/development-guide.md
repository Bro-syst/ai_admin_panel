# Development Guide

## Goal

This document fixes the development rules for `apps/admin-panel`. The app is the AI Core Admin Portal frontend, so every change should strengthen clear module boundaries instead of turning the app into one large shared surface.

## Principles

1. Scenario first, abstraction second.
2. Layer boundaries must stay visible.
3. Backend contracts do not mix with UI.
4. Reuse moves to `shared` only after real repetition.
5. New product scope is added as a separate module in `src/modules`.

## Current Baseline

The project is considered clean when it contains:
- `src/app`;
- `src/core`;
- `src/shared`;
- `src/modules/Settings`;
- `src/modules/AdminSecurity` as the TOTP/security baseline;
- `src/modules/AdminUsers` as the internal admin lifecycle baseline;
- `src/modules/Tenants` as the tenant provisioning/detail baseline;
- `src/modules/Operations` as the dashboard/operations read-model baseline;
- `src/modules/AgentTemplates` as the tenant-scoped agent catalog baseline;
- `src/modules/Agents` as the tenant-scoped agent lifecycle baseline;
- `src/modules/AgentConfig` as the tenant-scoped agent config lifecycle
  baseline with controlled operator option metadata and safe mutation evidence;
- `src/modules/Knowledge` as the tenant-scoped knowledge source, indexing and
  support-safe retrieval baseline;
- `src/modules/AgentKnowledgeBinding` as the agent-specific knowledge binding
  baseline;
- `src/modules/AgentCapabilities` as the tenant-scoped capability assignment
  baseline;
- `src/modules/AgentPolicy` as the tenant-scoped policy binding and validation
  baseline;
- `src/modules/SitesWidgets` as the tenant-scoped sites/widgets, install
  guidance and public smoke evidence baseline;
- `src/modules/Releases` as the tenant-scoped release readiness, evidence and
  release management baseline;
- `src/modules/Conversations` as the tenant-scoped support-safe conversation
  runtime inspection baseline;
- `src/modules/UsageBilling` as the tenant-scoped usage, metering and billing
  export baseline;
- `docs/architecture.md`;
- `docs/development-guide.md`;
- `docs/overview.md`;
- `docs/recipes.md`.

Start routes:
- `/login`;
- `/auth/password-setup`;
- `/password-setup`;
- `/password-reset/request`;
- `/password-reset/confirm`;
- `/`;
- `/dashboard`;
- `/operations`;
- `/settings`;
- `/security`;
- `/admins`;
- `/tenants`;
- `/tenants/:tenantId`;
- `/tenants/:tenantId/agents`;
- `/tenants/:tenantId/agents/new`;
- `/tenants/:tenantId/agents/:agentId`;
- `/tenants/:tenantId/agents/:agentId/config`;
- `/tenants/:tenantId/agents/:agentId/knowledge`;
- `/tenants/:tenantId/agents/:agentId/capabilities`;
- `/tenants/:tenantId/agents/:agentId/policy`;
- `/tenants/:tenantId/agents/:agentId/sites-widgets`;
- `/tenants/:tenantId/agents/:agentId/releases`;
- `/tenants/:tenantId/conversations`;
- `/tenants/:tenantId/usage`;
- `/tenants/:tenantId/billing-export`;
- `*`.

Every new route must be tied to a real admin scenario and added through a lazy import from the public `index.ts` of its module.

## Dependency Rules

Allowed:
- `app` imports `core`, `modules`, `shared`;
- `modules` import `core` and `shared`;
- `core` imports `shared`;
- `shared` imports only `shared`.

Forbidden:
- `shared` imports `modules`, `core`, or `app`;
- `core` imports `modules`;
- one module deep-imports internals of another module;
- pages call the transport client directly;
- UI is added without a route, scenario, and module boundary.

## API Rules

- HTTP calls live in module `api/` folders or in `core/api` for shared infrastructure.
- UI works with typed frontend models.
- DTO adaptation happens at the API/model boundary.
- Transport/backend errors go through shared error mapping.
- Mutating endpoints must respect cookie auth, CSRF, and backend security policy.

For a new API contract:
- describe transport payload types next to the API function;
- adapt backend field naming at the boundary;
- cover unstable mapping with tests;
- do not use `axios` directly in `pages` or `ui`.
- keep requests behind the shared API client timeout, so auth bootstrap and screens can recover when the backend is unavailable.

## UI Rules

- `AppShell` owns layout and global navigation only.
- `AppShell` navigation is grouped as Overview, Workspace, Access, Customers
  and Session.
- Current implemented navigation contains only `Dashboard`, `Operations`,
  `Settings`, `Security`, permission-aware `Admin Users`, permission-aware
  `Tenants`, and `Log out`.
- `AppShell` may use current auth role/permissions for link visibility, but
  route guards remain the access authority.
- A page component assembles the screen but should not grow into API/model logic.
- Domain components stay inside their module until reuse is proven.

To add a menu item, first add a route and a page-level module. The menu must not contain placeholder sections.

## Final Smoke Evidence

Umbrella-level closure must keep a route smoke test that fixes the shipped
route surface and verifies the protected operator journey from tenant
provisioning through agent setup, widget/release, support, usage and billing
export. The current owner is
`src/core/router/adminPortalFinalSmoke.test.tsx`.

Final evidence should also record repository searches for:
- direct transport calls from module pages/UI/model;
- access/refresh token browser storage;
- direct DB/vector/provider/internal backend clients;
- local readiness, policy, pricing, invoice, payment or tax calculations.

## Module Rules

A new module is created only when there is a confirmed scenario.

Minimum shape:

```text
src/modules/Users/
  index.ts
  api/
  model/
  ui/
  pages/
```

Rules:
- `index.ts` exports only route-level pages and public elements needed outside;
- `pages` assemble screens;
- `model` contains hooks/state orchestration;
- `api` contains requests and mapping;
- `ui` contains domain components without knowledge of app routes.

For Tenants-style operator flows:
- portal read models are the primary source for list/detail summaries;
- provisioning correlation and idempotency values are generated in `model` or
  `api`, never in presentational UI;
- backend-supported mutation actions gate the visible/enabled mutation controls;
- configuration editing stays as controlled module state and is submitted
  through the module API layer;
- mutation success feedback should show backend result/correlation when the
  backend returns it.

For Operations-style overview flows:
- portal dashboard/operations/platform settings read models are the only source
  for summary cards and status blocks;
- keep endpoint calls and DTO mapping in `src/modules/Operations/api`;
- keep loading/error/empty/refresh orchestration in
  `src/modules/Operations/model`;
- do not calculate readiness, policy, billing/pricing or provider status
  locally;
- quick links may target only implemented routes.

For Agents-style tenant-scoped lifecycle flows:
- keep agent catalog calls and DTO mapping in `src/modules/AgentTemplates/api`;
- keep agent list/detail/create transport mapping in `src/modules/Agents/api`;
- use portal agent read models as the primary source for list/detail summaries;
- keep create/detail orchestration and mutation action gating in
  `src/modules/Agents/model`;
- derive visible/enabled metadata/status/lifecycle controls from backend
  `supportedMutationActions` plus current admin permissions;
- expose only accepted mutation refs as UI controls and do not render raw
  setup refs such as knowledge, policy, release or widget setup as generic
  lifecycle actions;
- render setup checklist, foundation assessment and channel binding as
  backend-owned read sections, not as local readiness calculations;
- keep tenant-scoped agent links inside implemented tenant/agent routes;
  Config, Knowledge, Capabilities, Policy, Sites & Widgets and Releases links
  are allowed only because those stages now have accepted pages.
  Conversations links are allowed from tenant detail after Stage 11 because
  `/tenants/:tenantId/conversations` is implemented and accepted.

For AgentConfig-style tenant-scoped config flows:
- keep active config, version list/detail, draft, create-version, validation,
  activation and rollback endpoint calls and DTO mapping in
  `src/modules/AgentConfig/api`;
- keep approved payload draft state, selected version state, controlled option
  metadata, backend validation result state, mutation result feedback and
  action gating in `src/modules/AgentConfig/model`;
- render only the approved AgentConfig payload groups and do not expose raw
  provider routing overrides or backend-internal/provider credentials;
- render enum-like AgentConfig fields as controlled selects/chips/toggles
  rather than raw text fields, while preserving unknown backend values as
  visible current/custom values;
- submit canonical backend values from controlled fields; localized labels must
  never become payload values;
- create draft with `POST /config-drafts` and create config version with
  `POST /configs`;
- treat backend validation as the authority for config validity and require the
  displayed validation result before activation;
- require confirmation before create-version, activation and rollback actions,
  and include the rollback target version in the confirmation;
- keep validate vs activate guidance explicit, show active config id/version
  after activation where returned, and keep safe mutation evidence visible and
  copyable after critical actions;
- use safe explicit fallbacks for missing correlation/request/status/version
  evidence instead of generating fake evidence values;
- do not render tokens, secrets, provider keys, internal prompts or
  backend-internal payload details in evidence blocks;
- Agent Detail setup guidance must come from backend/read-model blockers and
  must not push lifecycle activation while knowledge, policy, channel or
  release blockers remain;
- do not calculate release readiness, policy, billing or provider state from
  config data in the frontend.

For Knowledge-style tenant-scoped knowledge flows:
- keep portal knowledge status/source/readiness, source detail,
  document/indexing and support-safe retrieval endpoint calls and DTO mapping
  in `src/modules/Knowledge/api`;
- keep source selection, registration forms, document/indexing state,
  release-readiness state, support-safe chunk/retrieval drill-down state and
  mutation result feedback in `src/modules/Knowledge/model`;
- render source catalog/detail, backend readiness issues, support-safe chunks,
  retrieval runs and support reconstruction in `src/modules/Knowledge/ui`;
- keep `src/modules/AgentKnowledgeBinding` focused on agent-specific knowledge
  status/catalog/binding, binding update/disable orchestration and binding UI;
- treat backend indexing, release readiness and support evidence as the source
  of truth; do not calculate readiness locally;
- do not add generic file upload, direct DB/vector/provider calls, raw internal
  document access or cross-flow Policy/Release actions;
- gate knowledge and binding mutations through backend-supported actions plus
  current admin permissions, and require confirmation for destructive changes.

For Capabilities/Policy-style tenant-scoped setup flows:
- keep capability catalog/current assignment endpoint calls and DTO mapping in
  `src/modules/AgentCapabilities/api`;
- keep capability assignment form state, backend action gating,
  readiness/issues and mutation result feedback in
  `src/modules/AgentCapabilities/model`;
- keep policy profile catalog/current binding/validation endpoint calls and DTO
  mapping in `src/modules/AgentPolicy/api`;
- keep policy binding form state, backend validation result state, backend
  action gating and mutation result feedback in `src/modules/AgentPolicy/model`;
- treat backend catalogs, assignments, bindings, validation results,
  readiness/issues and supported mutation actions as authoritative;
- consume other feature modules only through public exports, for example agent
  context from `@/modules/Agents`;
- do not implement a frontend policy engine, local safety scoring, local
  release readiness, billing/pricing calculation, future support/usage/billing
  routes/actions or direct DB/vector/provider calls.

For SitesWidgets/Releases-style tenant-scoped publication flows:
- keep portal site/widget status, site management and widget management
  endpoint calls and DTO mapping in `src/modules/SitesWidgets/api`;
- keep public widget smoke transport in
  `src/modules/SitesWidgets/api/publicWidgetApi.ts` and isolate it from admin
  `apiClient`, admin cookies and admin visitor identity;
- keep site/widget forms, smoke state, backend action gating and mutation
  result feedback in `src/modules/SitesWidgets/model`;
- render install guidance from backend portal binding values such as widget
  key, site hostname, site id, widget id, allowed origin counts and binding
  readiness; do not invent runtime config locally;
- keep release readiness, release list/detail, draft/manual override, publish,
  rollback and disable endpoint calls and DTO mapping in
  `src/modules/Releases/api`;
- keep release draft payload building, selected release state, publish
  evidence state, backend action gating and mutation result feedback in
  `src/modules/Releases/model`;
- treat backend readiness, release gates, manual override fields, evidence,
  active/latest release snapshots and supported mutation actions as
  authoritative;
- require confirmation for release publish, rollback and disable actions and
  include release version/status/gate/active context in the confirmation;
- do not calculate release readiness, policy, billing or pricing locally, and
  do not implement Conversations, Usage or Billing routes/actions in this
  flow. Conversations belongs to its own tenant-scoped module and is now
  available only through its accepted route.

For Conversations-style tenant-scoped support flows:
- keep conversation runtime summary, chat, message, turn and current-memory
  endpoint calls and DTO mapping in `src/modules/Conversations/api`;
- keep filters, selected chat/message/turn state, refresh, support evidence
  refs, permission derivation and close orchestration in
  `src/modules/Conversations/model`;
- render support-safe runtime summary, list/detail panels, redaction states,
  correlation/results and close confirmation in
  `src/modules/Conversations/ui`;
- treat backend support-safe fields and runtime summary read models as the
  display boundary; raw internal snapshots, prompts and secrets remain hidden
  unless the backend exposes a support-safe field;
- keep the page read-only except the approved close action, gate that action
  through backend/current-admin permissions and show backend result/correlation
  feedback;
- do not implement Usage, Metering or Billing Export, local billing/readiness
  calculations, customer portal support UI or direct DB/vector/provider calls.

For UsageBilling-style tenant-scoped usage and billing export flows:
- keep usage/metering read-model, usage summary/detail, chat usage,
  conversation turn usage, model request usage, billing export status and
  billing export mutation endpoint calls and DTO mapping in
  `src/modules/UsageBilling/api`;
- keep filters, selected usage state, usage drill-down orchestration,
  permission derivation, idempotency refs, mutation forms and billing export
  mutation orchestration in `src/modules/UsageBilling/model`;
- render usage summaries, metering blocks, drill-down panels, billing export
  status, mutation confirmations, read-only permission states and
  result/correlation feedback in `src/modules/UsageBilling/ui`;
- treat backend usage, metering and billing export read models as
  authoritative; token/request/activity/export values are displayed as returned
  and must not become frontend billing calculations;
- default billing export mutations to `platform_admin` unless explicit backend
  billing write/export permissions are present, and require confirmation for
  export, failure, retry and reconciliation actions;
- do not implement pricing, invoice, payment, tax, revenue-recognition,
  customer billing portal, local readiness/policy/billing calculations or
  direct DB/vector/provider/internal backend calls.

## Testing Rules

Minimum set for a new module:
- API mapping tests for unstable backend payloads;
- page/component tests for main user scenarios;
- guard/security behavior tests when auth or routing changes;
- regression test for every fixed bug.

Before delivery, run:

```bash
npm test
npm run lint
npm run build
```

## Naming

Use the product identity in user-facing code and docs:
- `apps/admin-panel`;
- `AI Core Admin Portal`;
- `Admin*` for future domain-neutral administrator entities.

## Documentation Rules

When a new module is added, update:
- `docs/overview.md` - product scope and route;
- `docs/architecture.md` - module boundary if a new architectural area appears;
- `docs/recipes.md` - reusable implementation steps if the change creates a new repeatable pattern;
- `docs/development-guide.md` - only for new rules, not one-off decisions.
