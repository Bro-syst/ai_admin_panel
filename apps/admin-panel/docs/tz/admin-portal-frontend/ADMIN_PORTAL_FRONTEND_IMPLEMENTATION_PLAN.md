# Admin Portal Frontend Implementation Plan

Status: `ready-for-decomposition-input`

This plan is the frontend-facing stage guide. It intentionally avoids backend
stage history and focuses on app modules, routes, UI behavior, tests and gates.

## Existing Code To Preserve

Owners:
- `src/core/auth` - auth/session bootstrap and actions;
- `src/core/api` - transport, CSRF, auth retry, error mapping;
- `src/core/router` - route registration and guards;
- `src/shared/ui/AppShell` - shell/navigation surface;
- `src/modules/Settings` - general settings, current admin, sessions UI;
- `src/modules/AdminSecurity` - TOTP UI/model/API.

Rules:
- do not switch `/users/me` to `/auth/me` during unrelated work;
- do not add route/nav placeholders;
- do not move code to `packages/`;
- do not call `apiClient` from pages or presentational UI.

## Module Shape

Every new feature module uses:

```text
src/modules/<Domain>/
  index.ts
  api/
  model/
  pages/
  ui/
```

Ownership:
- `api/` - endpoint calls and DTO mapping;
- `model/` - hooks, scenario orchestration, local form state, attempt ids;
- `pages/` - route-level composition;
- `ui/` - domain components;
- `index.ts` - public exports.

## Recommended Stage Order

### Stage 01: Security Route And Shell Readiness

Goal:
- introduce `/security` as real protected page;
- keep `/settings` for general settings;
- preserve auth baseline.

Scope:
- route `/security`;
- reuse `AdminTotpPanel` and `AdminSessionsPanel`;
- AppShell nav item for Security;
- tests for route and no redirect behavior.

Out of scope:
- Admin Users;
- Dashboard;
- broad shell redesign.

### Stage 02: Admin Users

Goal:
- day-2 internal admin management.

Module:
- `src/modules/AdminUsers`

Route:
- `/admins`

Scope:
- list/search/filter;
- safe detail;
- create/invite;
- resend invite;
- disable/enable;
- revoke sessions;
- permission-aware actions.

### Stage 03: Navigation And Operator Shell Expansion

Goal:
- shell supports real operator navigation without placeholders.

Scope:
- navigation model and grouping;
- current admin summary;
- responsive behavior;
- tenant/agent context slots where routes already exist.

Rule:
- only show links to implemented routes.

### Stage 04: Tenants

Goal:
- provision and inspect tenants.

Module:
- `src/modules/Tenants`

Routes:
- `/tenants`
- `/tenants/:tenantId`

Scope:
- tenant list/detail;
- provisioning wizard;
- provisioning attempt correlation/idempotency in model/API layer;
- provisioning/audit/config read models;
- allowed status/metadata/config actions.

### Stage 05: Dashboard And Operations

Goal:
- operational overview.

Module:
- `src/modules/Operations`

Routes:
- `/dashboard`
- `/operations`

Scope:
- dashboard cards;
- operations summary;
- quick links;
- move authenticated `/` redirect from `/settings` to `/dashboard` in this
  same stage only after dashboard works and tests pass.

### Stage 06: Agent Templates And Agents

Goal:
- template-aware agent creation and lifecycle.

Modules:
- `src/modules/AgentTemplates`
- `src/modules/Agents`

Routes:
- `/tenants/:tenantId/agents`
- `/tenants/:tenantId/agents/new`
- `/tenants/:tenantId/agents/:agentId`

Scope:
- template catalog/detail;
- create agent wizard;
- agent list/detail;
- allowed edit/status/lifecycle actions;
- setup/foundation/channel read models.

### Stage 07: Agent Config

Module:
- `src/modules/AgentConfig`

Route:
- `/tenants/:tenantId/agents/:agentId/config`

Scope:
- active config;
- version list/detail;
- draft/create/validate/activate/rollback;
- editable schema from UI/UX spec.

### Stage 08: Knowledge And Binding

Modules:
- `src/modules/Knowledge`
- `src/modules/AgentKnowledgeBinding`

Route:
- `/tenants/:tenantId/agents/:agentId/knowledge`

Scope:
- managed source/document registration;
- indexing jobs;
- readiness;
- support-safe drill-downs where returned;
- agent binding;
- template-driven source-pack/category progress.

### Stage 09: Capabilities And Policy

Modules:
- `src/modules/AgentCapabilities`
- `src/modules/AgentPolicy`

Routes:
- `/tenants/:tenantId/agents/:agentId/capabilities`
- `/tenants/:tenantId/agents/:agentId/policy`

Scope:
- catalogs;
- current assignments/bindings;
- update;
- validate policy binding;
- readiness issues.

### Stage 10: Sites, Widgets And Releases

Modules:
- `src/modules/SitesWidgets`
- `src/modules/Releases`

Routes:
- `/tenants/:tenantId/agents/:agentId/sites-widgets`
- `/tenants/:tenantId/agents/:agentId/releases`

Scope:
- site/widget management;
- backend-derived install guidance;
- controlled public widget smoke helper;
- release list/detail/draft;
- readiness;
- evidence/manual override;
- publish/rollback/disable.

### Stage 11: Conversations And Support

Module:
- `src/modules/Conversations`

Route:
- `/tenants/:tenantId/conversations`

Scope:
- chat list/detail;
- messages;
- turns;
- memory;
- runtime summary;
- approved close action.

### Stage 12: Usage, Metering And Billing Export

Module:
- `src/modules/UsageBilling`

Routes:
- `/tenants/:tenantId/usage`
- `/tenants/:tenantId/billing-export`

Scope:
- usage summary/detail;
- model/chat/turn usage;
- metering read model;
- billing export status;
- permission-aware export actions.

### Stage 13: End-To-End Smoke, Evidence And Docs Sync

Goal:
- close operator journey and documentation.

Scope:
- verify route flow;
- verify no token storage;
- verify portal read model usage;
- verify no direct DB/vector/provider calls;
- update app docs and pipeline state.

## Stage Gate Rules

- Prompt 02 creates stage TZ files before implementation.
- Prompt 03 accepts stage package before runtime work.
- Prompt 04 implements exactly one stage.
- Prompt 05 reviews that stage.
- Prompt 06 syncs docs only after acceptance.
- Prompt 07 finalizes only after all stages pass.
- Pipeline state `allowed_next_step` must match the requested prompt.

## Default Commands

From repo root:

```bash
npm run test:admin
npm run lint:admin
npm run build:admin
```

From `apps/admin-panel`:

```bash
npm run test
npm run lint
npm run build
```

Omitted checks must be justified in `pipeline_state.md`.

