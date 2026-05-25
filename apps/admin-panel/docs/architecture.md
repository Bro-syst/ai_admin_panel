# Frontend Architecture For `apps/admin-panel`

## Status

This document fixes the architecture baseline for the AI Core Admin Portal frontend. The project starts with an auth/settings shell and grows through explicit domain modules.

## What This Frontend Is

`apps/admin-panel` is an internal SPA for AI administration workflows.

The baseline contains:
- login/logout, password setup/reset, and current session bootstrap;
- protected routing;
- application shell;
- API client and interceptors;
- i18n/theme/settings providers;
- `/dashboard` and `/operations` pages backed by backend portal read models;
- `/settings` page;
- `/security` frontend page backed by existing auth/session/TOTP APIs;
- `/admins` page backed by admin user lifecycle APIs;
- `/tenants` and `/tenants/:tenantId` pages backed by tenant portal read
  models, provisioning, audit and configuration APIs;
- tenant-scoped agent list/create/detail pages backed by agent catalog, portal
  agent read models and backend-supported metadata/status/lifecycle APIs;
- tenant-scoped Agent Config page backed by versioned config, draft,
  create-version, validation, activation and rollback APIs, controlled
  operator option metadata and safe mutation evidence display;
- tenant-scoped Knowledge page backed by portal knowledge read models, managed
  source/document/indexing APIs, support-safe retrieval read models and agent
  knowledge binding APIs;
- tenant-scoped Capabilities page backed by capability catalog, assignment,
  readiness/issues and supported mutation action APIs;
- tenant-scoped Policy page backed by policy profile catalog, binding,
  validation, readiness/issues and supported mutation action APIs;
- tenant-scoped Sites & Widgets page backed by portal site/widget status,
  site/widget management APIs, backend-derived install guidance and isolated
  public widget smoke APIs;
- tenant-scoped Releases page backed by release readiness, release list/detail,
  draft/manual override, publish, rollback and disable APIs;
- tenant-scoped Conversations page backed by conversation runtime summary,
  chat/message/turn/current-memory drill-down APIs, support-safe evidence refs
  and approved close API;
- tenant-scoped Usage & Metering and Billing Export pages backed by usage
  summary/detail, chat/turn/model-request usage drill-downs, usage/metering
  read models, billing export status and permitted billing export mutation
  APIs without frontend pricing, invoice, payment or tax logic;
- current administrator summary, active sessions, TOTP, and internal admin
  user management.

## Current App Map

Active routes:
- `/login` - public login page;
- `/auth/password-setup` - public first-password setup page from backend invite links;
- `/password-setup` - compatible alias for first-password setup;
- `/password-reset/request` - public reset-link request page;
- `/password-reset/confirm` - public new-password page;
- `/` - protected redirect to `/dashboard`;
- `/dashboard` - protected Dashboard page for backend-owned portal overview
  summaries;
- `/operations` - protected Operations page for backend-owned operations and
  platform settings summaries;
- `/settings` - protected settings page;
- `/security` - protected frontend security page; this is not a backend
  endpoint;
- `/admins` - protected Admin Users page for internal administrator lifecycle
  management;
- `/tenants` - protected tenant list and provisioning page;
- `/tenants/:tenantId` - protected tenant detail page for provisioning,
  audit, configuration and approved tenant actions;
- `/tenants/:tenantId/agents` - protected tenant-scoped agent list and template
  catalog page;
- `/tenants/:tenantId/agents/new` - protected tenant-scoped template-aware
  agent creation page;
- `/tenants/:tenantId/agents/:agentId` - protected tenant-scoped agent detail
  page for summary, setup/foundation/channel read sections and approved
  metadata/status/lifecycle actions;
- `/tenants/:tenantId/agents/:agentId/config` - protected tenant-scoped Agent
  Config page for active/versioned config inspection, approved-schema draft
  and create-version flow, controlled enum-like inputs, backend validation,
  activation, rollback and copyable mutation evidence;
- `/tenants/:tenantId/agents/:agentId/knowledge` - protected tenant-scoped
  Knowledge page for managed source/document registration, indexing,
  backend-owned release readiness, support-safe retrieval drill-downs and agent
  knowledge binding;
- `/tenants/:tenantId/agents/:agentId/capabilities` - protected tenant-scoped
  Capabilities page for backend-owned capability catalog, current assignments,
  assignment update, readiness/issues and mutation result feedback;
- `/tenants/:tenantId/agents/:agentId/policy` - protected tenant-scoped Policy
  page for backend-owned policy profile catalog, current binding, binding
  update, backend validation and validation result display;
- `/tenants/:tenantId/agents/:agentId/sites-widgets` - protected
  tenant-scoped Sites & Widgets page for backend-owned site/widget status,
  approved site/widget management, backend-derived install guidance and public
  smoke evidence;
- `/tenants/:tenantId/agents/:agentId/releases` - protected tenant-scoped
  Releases page for backend-owned release readiness, release history/detail,
  draft/manual override, publish, rollback and disable actions;
- `/tenants/:tenantId/conversations` - protected tenant-scoped Conversations
  page for support-safe runtime summary, chat/message/turn/current-memory
  inspection, support evidence refs and approved close action;
- `/tenants/:tenantId/usage` - protected tenant-scoped Usage & Metering page
  for backend-owned usage summary/detail, model request detail, chat usage,
  conversation turn usage and metering read-model display;
- `/tenants/:tenantId/billing-export` - protected tenant-scoped Billing Export
  page for backend-owned billing export status and permitted export, failure,
  retry and reconciliation actions;
- `*` - not found page.

The `AppShell` navigation is grouped and contains only implemented
destinations:
- Overview: `Dashboard`, `Operations`;
- Workspace: `Settings`;
- Access: `Security`, `Admin Users` when the current admin role/permissions can
  see it;
- Customers: `Tenants` when the current admin role/permissions can see it;
- Session: `Log out`.

`AppShell` owns responsive shell behavior: expanded/collapsed desktop sidebar,
mobile header current-admin summary and mobile bottom navigation. It must not
own domain behavior or call backend APIs directly.

Current modules:
- `src/modules/Operations` - `/dashboard` and `/operations` pages plus portal
  dashboard, operations and platform settings API mapping, refresh
  orchestration and read-only summary UI.
- `src/modules/Settings` - route-level settings page, current administrator,
  language and theme.
- `src/modules/AdminSecurity` - `/security` page plus TOTP state, enrollment,
  confirmation, and disable module for administrator security.
- `src/modules/AdminUsers` - `/admins` page plus admin user API mapping,
  filters, safe detail, invite/create and lifecycle confirmations.
- `src/modules/Tenants` - `/tenants` and `/tenants/:tenantId` pages plus
  tenant portal read-model API mapping, provisioning attempt state,
  correlation/idempotency generation, tenant detail orchestration,
  configuration draft editing and backend mutation result feedback.
- `src/modules/AgentTemplates` - tenant agent catalog API mapping, template
  selection state and template catalog UI used by the agent list/create flow.
- `src/modules/Agents` - `/tenants/:tenantId/agents`,
  `/tenants/:tenantId/agents/new` and `/tenants/:tenantId/agents/:agentId`
  pages plus portal agent read-model API mapping, agent create/detail
  orchestration, setup/foundation/channel read sections and Stage 06-safe
  mutation action gating from backend `supportedMutationActions`.
- `src/modules/AgentConfig` - `/tenants/:tenantId/agents/:agentId/config`
  page plus versioned config API mapping, approved payload draft state,
  controlled option metadata, backend action-ref gating, create draft/create
  version, validation, activation, rollback orchestration and safe mutation
  evidence display.
- `src/modules/Knowledge` - `/tenants/:tenantId/agents/:agentId/knowledge`
  page plus portal knowledge status/source/readiness API mapping, managed
  source/document/indexing orchestration and support-safe chunk/retrieval/
  support reconstruction UI.
- `src/modules/AgentKnowledgeBinding` - agent-specific knowledge status/catalog
  and binding API mapping, backend action-ref gating, binding update/disable
  orchestration and binding UI.
- `src/modules/AgentCapabilities` -
  `/tenants/:tenantId/agents/:agentId/capabilities` page plus capability
  catalog/current assignment API mapping, backend action-ref gating, assignment
  update orchestration, readiness/issues and mutation result feedback.
- `src/modules/AgentPolicy` - `/tenants/:tenantId/agents/:agentId/policy`
  page plus policy profile catalog/current binding/validation API mapping,
  backend action-ref gating, binding update orchestration and validation result
  display.
- `src/modules/SitesWidgets` -
  `/tenants/:tenantId/agents/:agentId/sites-widgets` page plus portal
  site/widget status mapping, approved site/widget management, backend-derived
  install guidance, isolated public widget smoke transport and evidence UI.
- `src/modules/Releases` - `/tenants/:tenantId/agents/:agentId/releases`
  page plus release readiness/list/detail mapping, release draft/manual
  override payload building, publish/rollback/disable orchestration and
  backend action-ref gating.
- `src/modules/Conversations` - `/tenants/:tenantId/conversations` page plus
  runtime summary read-model mapping, chat/message/turn/current-memory
  drill-down mapping, support-safe redaction, evidence refs, close
  orchestration and permission gating.
- `src/modules/UsageBilling` - `/tenants/:tenantId/usage` and
  `/tenants/:tenantId/billing-export` pages plus usage/metering/billing
  read-model mapping, usage detail and anchor drill-down mapping,
  permission-aware billing export mutation orchestration and idempotency/result
  feedback.
- `src/shared/ui/EntityInfo` - neutral status badge, info grid, copyable value
  and mutation result primitives reused by accepted agent/config/tenant/
  knowledge views.
- `src/modules/Settings/ui/AdminSessionsPanel` - reused by the Security page
  for active session management.

## Layers

- `src/app` - entrypoint, root composition, and app-level wiring.
- `src/core` - API, auth, router, i18n, theme, settings, and shared infrastructure.
- `src/modules` - product/domain modules for the admin panel.
- `src/shared` - UI primitives, shell, icons, storage utilities, and components without domain logic.

Composition root: `src/app/providers/AppProviders.tsx`.

Provider order:
- `ThemeProvider`;
- `I18nProvider`;
- `AppSettingsProvider`;
- `BrowserRouter`;
- `AuthProvider`.

## Growth Rules

New admin sections must be added as separate modules in `src/modules`.

Recommended module shape:

```text
src/modules/Users/
  index.ts
  api/
  model/
  ui/
  pages/
  lib/
  types/
```

Rules:
- route-level pages live in `pages`;
- backend contracts and DTO mapping live in `api`;
- scenario logic and hooks live in `model`;
- domain components live in `ui`;
- the module exports only its public API through `index.ts`;
- `core` must not import `modules`;
- `shared` must not know about product/domain modules.

Route registration for a new module happens in `src/core/router/routes.tsx` through a lazy import from the module public API. Do not deep-import another module's internals from routes.

Navigation for a new route is added in `src/shared/ui/AppShell` only after the
route is implemented and useful. Shell visibility may use current auth
role/permissions, but protected route guards remain the access authority.

## Backend Boundary

Backend OpenAPI is the source of truth for API paths:
- primary: `/openapi.json`;
- compatibility alias: `/api/v1/openapi.json`.

Do not infer backend endpoints from frontend route names. For example,
`/security` is a frontend route and must not imply a dedicated backend
security endpoint.

The frontend treats the backend as the source of truth for:
- auth lifecycle;
- current administrator state;
- permissions/auth state;
- API contracts;
- error semantics;
- security-sensitive actions.
- tenant provisioning/readiness signals, supported mutation actions,
  configuration state and mutation result/correlation.
- portal dashboard, operations and platform settings read models.
- agent catalog, portal agent read models, setup/foundation/channel summaries
  and supported agent mutation action refs.
- versioned Agent Config state, approved config payload contracts, validation
  results, create-version, activation, rollback, returned mutation evidence
  and supported config mutation action refs.
- knowledge source catalog/detail, document/indexing state, release-readiness
  issues, support-safe retrieval evidence and supported agent knowledge binding
  mutation action refs.
- capability catalog, current assignments, capability readiness/issues,
  assignment update results and supported capability mutation action refs.
- policy profile catalog, current binding, backend validation results, policy
  readiness/issues, binding update results and supported policy mutation action
  refs.
- site/widget portal status, site/widget management results, backend-derived
  install guidance values and supported site/widget mutation action refs.
- release readiness, release gates, release evidence, manual override fields,
  active/latest release snapshots and supported release mutation action refs.
- conversation runtime summary, chat/message/turn/current-memory drill-downs,
  support-safe display boundaries, evidence refs and supported close action
  refs.
- usage/metering summaries, usage detail and anchor drill-downs, billing export
  status, export/failure/retry/reconciliation mutation results, idempotency
  refs and billing export permission boundaries.

The frontend does not own pricing, invoice, payment, tax or
revenue-recognition logic. Usage, metering and billing export screens display
backend-returned read models and mutation results only.

Pages do not call `axios` directly. All requests go through `apiClient` and the API layer of the relevant module.

Shared API client: `src/core/api/apiClient.ts`.

It includes:
- `withCredentials`;
- `x-app-version`;
- request metadata interceptor;
- CSRF interceptor;
- auth interceptor;
- error interceptor.

Auth endpoints currently live in `src/core/auth/authService.ts`, because session lifecycle is platform infrastructure rather than product-domain code.

## Frontend State

Global state is allowed only for infrastructure:
- auth session;
- locale;
- theme;
- app preferences.

Domain state for future screens should stay inside `src/modules/<Domain>/model` until there is a proven reason to lift it.

## Quality Gates

Before considering an architecture change ready, run:
- `npm test`;
- `npm run lint`;
- `npm run build`.

For Admin Portal umbrella closure, also preserve the final route smoke test in
`src/core/router/adminPortalFinalSmoke.test.tsx` and record forbidden-call
search evidence for direct transport, browser token storage, local
readiness/billing calculations and direct DB/vector/provider access.

## Baseline Scope

The baseline is complete when it contains the current auth/settings shell, the documented security module, and explicit recipes for adding future modules.
