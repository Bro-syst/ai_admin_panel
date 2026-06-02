# AI Core Admin Portal Overview

## Current Scope

`apps/admin-panel` is the React frontend baseline for internal AI Core administrator workflows.

The portal currently includes:
- internal login/logout;
- first password setup by invite token;
- password reset request and confirmation;
- protected routing;
- root redirect `/` -> `/dashboard`;
- `/dashboard` frontend page for backend-owned portal overview read models;
- `/operations` frontend page for backend-owned operations and platform
  settings read models;
- settings for language and theme;
- current administrator summary;
- `/security` frontend page for active session management and TOTP
  enrollment/disable;
- `/admins` frontend page for internal admin user list, safe detail and
  lifecycle actions;
- `/tenants` and `/tenants/:tenantId` frontend pages for tenant provisioning,
  tenant detail, provisioning/audit/configuration inspection and approved
  tenant actions;
- tenant-scoped agent pages for template catalog, agent creation, list/detail
  inspection and backend-supported metadata/status/lifecycle actions:
  `/tenants/:tenantId/agents`, `/tenants/:tenantId/agents/new` and
  `/tenants/:tenantId/agents/:agentId`;
- tenant-scoped Agent Config page
  `/tenants/:tenantId/agents/:agentId/config` for active/versioned config
  inspection, controlled enum-like operator inputs, approved-schema
  draft/create-version, backend validation, activation, rollback and copyable
  mutation evidence;
- tenant-scoped Knowledge page
  `/tenants/:tenantId/agents/:agentId/knowledge` for managed source/document
  registration, indexing, agent-scoped backend source/detail/release-readiness
  inspection, support-safe retrieval drill-downs and agent knowledge binding;
- tenant-scoped Capabilities page
  `/tenants/:tenantId/agents/:agentId/capabilities` for backend-owned
  capability catalog, current assignments, assignment update, readiness/issues
  and mutation result feedback;
- tenant-scoped Policy page
  `/tenants/:tenantId/agents/:agentId/policy` for backend-owned policy profile
  catalog, current binding, binding update, backend validation and validation
  result display;
- tenant-scoped Sites & Widgets page
  `/tenants/:tenantId/agents/:agentId/sites-widgets` for backend-owned
  site/widget status, site and widget management, backend-derived install
  guidance and isolated public widget smoke evidence;
- tenant-scoped Releases page
  `/tenants/:tenantId/agents/:agentId/releases` for backend-owned release
  readiness, release evidence requirements, backend-provided smoke-case
  evidence matrix, backend-approved retrieval evidence candidates,
  candidate-backed draft evidence, manual override, publish support
  reconstruction evidence, rollback and disable actions;
- tenant-scoped Conversations page `/tenants/:tenantId/conversations` for
  support-safe runtime summary, chat/message/turn/current-memory inspection,
  support evidence refs and approved close action;
- tenant-scoped Usage & Metering page `/tenants/:tenantId/usage` and Billing
  Export page `/tenants/:tenantId/billing-export` for backend-owned usage
  summaries, metering read models, usage drill-downs, billing export status and
  permission-aware export/failure/retry/reconciliation actions without
  frontend pricing, invoice, payment or tax logic;
- API client with request metadata, CSRF, auth, and error interceptors;
- tests for the critical auth, routing, API, settings, Admin Users, Tenants,
  Operations, tenant-scoped Agents, Agent Config, Knowledge, agent knowledge
  binding, Capabilities, Policy, Sites & Widgets, Releases, Conversations and
  Usage/Billing behavior;
- final route smoke evidence for the shipped tenant -> agent -> setup ->
  widget -> release -> support -> usage/billing operator journey.

## Current Navigation

After login the shell shows implemented destinations only:
- Overview: `Dashboard`, `Operations`;
- Workspace: `Settings`;
- Access: `Security`, `Admin Users` when the current admin role/permissions can
  see it;
- Customers: `Tenants` when the current admin role/permissions can see it;
- Session: `Log out`.

Tenant-scoped agent, Agent Config, Knowledge, Capabilities, Policy,
Sites & Widgets, Releases, Conversations, Usage & Metering and Billing Export
navigation currently lives inside the tenant detail and agent detail flow, not
as a global shell group.

The shell supports expanded and collapsed desktop navigation plus a compact
mobile bottom navigation. The mobile header shows the brand and current admin
summary.

This is intentional. New AI Core admin sections should not appear as placeholders before there is a working page and a defined scenario.

## Current Modules

- `Operations` - protected `/dashboard` and `/operations` pages backed by
  portal dashboard, operations and platform settings read models.
- `Settings` - interface settings and current administrator.
- `AdminSecurity` - protected `/security` page plus TOTP state, enrollment,
  confirmation, and disable flows.
- `AdminUsers` - protected `/admins` page plus admin list, search/filter, safe
  detail, invite/create and lifecycle actions.
- `Tenants` - protected `/tenants` and `/tenants/:tenantId` pages plus portal
  tenant read-model API mapping, provisioning form, tenant detail, provisioning
  binding, audit summary, configuration editor and backend-supported tenant
  action confirmations.
- `AgentTemplates` - backend agent catalog mapping and template catalog panel
  used by tenant-scoped agent list/create flows.
- `Agents` - protected tenant-scoped agent list, create and detail pages plus
  portal agent read-model mapping, setup/foundation/channel read sections and
  backend-supported metadata/status/lifecycle action gating.
- `AgentConfig` - protected tenant-scoped agent config page plus active/version
  list/detail API mapping, controlled option metadata, approved payload draft
  state, create draft/create version, backend validation, activation, rollback
  orchestration and safe mutation evidence display.
- `Knowledge` - protected tenant-scoped knowledge page plus agent-scoped
  portal source/readiness/detail reads, document/indexing mutations and
  support-safe retrieval/reconstruction API mapping, orchestration and UI.
- `AgentKnowledgeBinding` - agent-specific knowledge status/catalog/binding API
  mapping, backend action gating, update/disable orchestration and binding UI.
- `AgentCapabilities` - protected tenant-scoped capabilities page plus
  capability catalog/current assignment API mapping, backend action gating,
  assignment update orchestration, readiness/issues and mutation feedback UI.
- `AgentPolicy` - protected tenant-scoped policy page plus policy profile
  catalog/current binding/validation API mapping, backend action gating,
  binding update orchestration and validation result UI.
- `SitesWidgets` - protected tenant-scoped Sites & Widgets page plus backend
  site/widget status read models, site/widget management, backend-derived
  install guidance and isolated public widget smoke orchestration.
- `Releases` - protected tenant-scoped Releases page plus backend-owned
  release readiness, release evidence requirements mapping, smoke-case
  evidence matrix state, retrieval evidence candidate mapping/state, release
  history/detail mapping, draft/manual override, publish, rollback and disable
  orchestration.
- `Conversations` - protected tenant-scoped Conversations page plus runtime
  summary read model, chat/message/turn/current-memory drill-down mapping,
  support-safe redaction handling, evidence refs and approved close
  orchestration.
- `UsageBilling` - protected tenant-scoped Usage & Metering and Billing Export
  pages plus backend-owned usage/metering/billing read-model mapping,
  usage/chat/turn/model-request drill-downs, billing export status and
  permission-aware export/failure/retry/reconciliation orchestration.
- `Settings/ui/AdminSessionsPanel` - active session management reused by the
  Security page.

There is no dedicated backend security endpoint. The `/security` page is
a frontend route over existing `/api/admin/v1/auth/*` and
`/api/admin/v1/users/me` contracts. Backend paths must be checked from
`/openapi.json`; `/api/v1/openapi.json` is kept as an OpenAPI compatibility
alias.

## How To Grow

Each new admin scenario should get its own boundary in `src/modules`.

Possible future directions:
- AI model management;
- prompt/template management;
- users and roles;
- audit and support tooling;
- moderation/review queues;
- system settings;
- deeper operational drilldowns beyond the current dashboard and operations
  summaries.

Before implementation, document:
- backend contract;
- route;
- module name;
- read/write scenarios;
- security-sensitive actions;
- loading, empty, ready, and error UI states;
- minimum tests.

## Prompt And TZ Pipeline

Admin Portal implementation planning is app-specific and lives here:
- `apps/admin-panel/docs/implemented-functionality-checklist.md` - checklist
  of the implemented and accepted Admin Portal functionality;
- `apps/admin-panel/docs/prompts` - prompt pipeline for discovery, stage
  decomposition, implementation, review, docs sync, and finalization.
- `apps/admin-panel/docs/tz/admin-portal-frontend` - Admin Portal frontend
  umbrella TZ, functional checklist, and pipeline state.

## Definition Of Ready

A new section is ready to build when there is:
- a clear user scenario;
- backend endpoint or mock contract;
- route naming;
- UI state list;
- access rule and expected backend auth behavior;
- test minimum.
