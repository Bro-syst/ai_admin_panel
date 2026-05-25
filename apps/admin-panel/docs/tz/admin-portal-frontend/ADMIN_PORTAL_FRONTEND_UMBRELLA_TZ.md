# Admin Portal Frontend Umbrella TZ

Status: `stage-package-consistency-accepted-ready-for-implementation`

Target app:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel`

Purpose:
- grow the existing Admin Portal frontend from an auth/security shell into a
  complete internal operator portal for AI agent platform management;
- preserve the current implemented auth/session/password/TOTP baseline;
- define the frontend scope, module ownership, UX expectations, API contracts
  and stage boundaries before implementation starts.

Frontend implementation package:
- `FRONTEND_PRODUCT_BRIEF.md` - product, users, current baseline and product
  principles;
- `ADMIN_PORTAL_UI_UX_SPEC.md` - routes, screens, flows, states and UX rules;
- `ADMIN_PORTAL_FRONTEND_API_REFERENCE.md` - frontend-facing endpoint reference
  without backend stage history;
- `ADMIN_PORTAL_FRONTEND_IMPLEMENTATION_PLAN.md` - frontend stages/modules and
  gates;
- `ADMIN_PORTAL_ACCEPTANCE_CHECKLIST.md` - acceptance checklist for frontend
  delivery.

## 1. Source Materials

Primary frontend-local source:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/FUNCTIONAL_CHECKLIST.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/FRONTEND_PRODUCT_BRIEF.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_UI_UX_SPEC.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_API_REFERENCE.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_IMPLEMENTATION_PLAN.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_ACCEPTANCE_CHECKLIST.md`

Prompt and repository rules:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/01_discovery_create_umbrella_frontend_tz_prompt.md`
- `/Volumes/Work/PC/ai_admin_panel/docs/development-guide.md`
- `/Volumes/Work/PC/ai_admin_panel/docs/recipes.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/architecture.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/development-guide.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/overview.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/recipes.md`

Backend/product read-only supporting context:
- `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_IMPLEMENTATION_TZ.md`
- `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_COVERAGE_CHECKLIST.md`
- `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_TZ_CONFORMANCE_REVIEW.md`
- `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_CODE_GROUNDED_AUDIT.md`
- `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/SERVICE_LAUNCH_CHECKLIST.md`
- `/Volumes/Work/AI_Agents/ai_core/docs/api/portals/admin/README.md`

## 2. Target App And Hard Boundaries

In scope:
- `apps/admin-panel` only;
- internal platform/admin/operator workflows over `/api/admin/v1`;
- public widget runtime smoke/install guidance only where it supports Admin
  Portal release readiness and uses `/api/v1/widget/*` as a separate public
  runtime.

Out of scope:
- `apps/client-panel`;
- customer self-service portal;
- public customer registration or subscription management;
- pricing, invoice, payment or tax logic;
- new backend endpoint implementation;
- direct DB/vector DB/model provider/internal backend module access;
- replacing backend readiness, policy, release, usage, metering or billing
  decisions with frontend calculations;
- rewriting the implemented auth/security baseline from scratch.

Root/shared/package concerns:
- do not move code to root docs or `packages/` unless a second real consumer
  appears;
- Admin Portal routes, UI, domain API clients and product docs stay inside
  `apps/admin-panel`;
- repository docs change only when workspace or multi-app rules change.

Backend docs boundary:
- backend/product docs are read-only source material for this step;
- frontend evidence can be linked back later only during accepted docs-sync or
  finalization stages.

## 3. Current Frontend Baseline

Already implemented and must be reused:
- login: `POST /api/admin/v1/auth/login`;
- refresh: `POST /api/admin/v1/auth/refresh`;
- logout: `POST /api/admin/v1/auth/logout`;
- logout all sessions: `POST /api/admin/v1/auth/logout-all`;
- current admin bootstrap through compatibility alias
  `GET /api/admin/v1/users/me`;
- protected routing and anonymous redirect to `/login`;
- AppShell with settings/logout navigation;
- theme, locale and app settings providers;
- `/settings` page with general and security tabs;
- current administrator summary;
- active sessions list and session revoke;
- password setup and reset request/confirm flows;
- backend mail route aliases `/admin/password-setup` and
  `/admin/password-reset`;
- TOTP status, enrollment, QR/manual key display, confirm by `enrollment_id`
  and disable;
- CSRF header from `ai_core_admin_csrf`;
- backend error mapping with canonical `error_code` and compatibility `code`
  fallback.

Current active route compatibility to preserve:
- `/login`;
- `/auth/password-setup`;
- `/admin/password-setup`;
- `/password-setup`;
- `/admin/password-reset`;
- `/password-reset/request`;
- `/password-reset/confirm`;
- `/`;
- `/settings`;
- `*`.

Regression-sensitive baseline:
- no access or refresh token is stored in `localStorage` or `sessionStorage`;
- backend cookies remain the session source of truth;
- `src/core/auth` remains the auth/session/security infrastructure owner;
- TOTP provisioning secret/manual key is not persisted after completion;
- current security UI lives under `/settings?tab=security`, but new work must
  introduce `/security` as a real protected page, not a redirect or alias;
- no future navigation item appears before it has a working route and useful
  non-placeholder scenario.

## 4. Engineering Principles And Reuse Plan

Reuse first:
- keep auth/session lifecycle in `src/core/auth`;
- keep transport, CSRF, auth retry and error normalization in `src/core/api`;
- expand route registration in `src/core/router/routes.tsx`;
- expand shell/navigation through `src/shared/ui/AppShell` unless a separate
  shell ownership need becomes explicit;
- reuse `src/modules/Settings` and `src/modules/AdminSecurity` for current
  account/security functionality.

New ownership:
- each new domain gets a dedicated module under `src/modules/<Domain>`;
- module API clients and DTO mapping live in module `api/`;
- scenario hooks and orchestration live in module `model/`;
- route-level pages live in module `pages/`;
- domain components live in module `ui/`;
- module public imports go through `index.ts`.

Responsibilities that must stay separated:
- pages must not call `apiClient` or `axios` directly;
- presentational UI must not parse backend DTOs;
- frontend must not maintain duplicate readiness, permissions, release,
  billing or metering sources of truth;
- frontend role-aware UI is a convenience only; backend authorization remains
  authoritative;
- public widget runtime identity must not be mixed with Admin Portal cookies.

Abstraction rule:
- no shared package extraction in the first pass;
- extract shared primitives only after repeated real use or clear
  infrastructure ownership;
- no compatibility adapters/shims unless a stage explicitly accepts them as
  debt and records removal criteria.

## 5. Required Admin Scenarios

1. Secure operator entry:
   login, refresh, logout, logout all, current admin bootstrap, password
   setup/reset, active sessions and TOTP.
2. Internal admin management:
   list, inspect, invite, resend invite, disable/enable and revoke target admin
   sessions without exposing secrets or raw setup tokens.
3. Tenant provisioning:
   create customer/service tenants through the approved provisioning flow,
   inspect status, metadata, billing reference, configuration and audit
   correlation.
4. Operations overview:
   show dashboard and operations read models with links to failing or
   incomplete areas.
5. Agent creation and lifecycle:
   select a template/archetype, create an agent, manage lifecycle/status and
   show setup checklist/foundation/channel state.
6. Agent behavior setup:
   manage versioned config, validation, activation and rollback through
   backend contracts.
7. Knowledge and binding:
   manage knowledge sources/documents/indexing read models and bind approved
   source sets to an agent without direct vector DB access.
8. Template-driven domain knowledge setup:
   render required source-pack category progress and regulated-domain readiness
   markers from backend template/read-model data. AML/KYC is only an accepted
   backend example/fixture for this generic UI capability, not separate
   frontend product scope and not an AML-specific runtime branch.
9. Capabilities and policy:
   assign capabilities and bind/validate policy profiles without implementing
   safety logic locally.
10. Sites, widgets and releases:
    configure site/widget records, run a controlled widget smoke helper,
    inspect readiness, create/publish/rollback/disable releases with evidence
    or approved manual override and confirmation.
11. Runtime, support, usage and billing visibility:
    inspect conversations, messages, turns, memory, usage/metering read models
    and billing export status/actions where backend allows.
12. Evidence and smoke:
    keep acceptance evidence for critical flows and link it during docs sync.

## 6. API And Contract Expectations

General:
- browser requests use credentials;
- mutating cookie-authenticated requests include `X-CSRF-Token` from
  `ai_core_admin_csrf`;
- `401` handling, refresh retry and terminal auth failure handling stay in
  core infrastructure;
- response envelopes and DTOs are mapped at API/model boundaries;
- request/correlation id is displayed or copyable when backend returns it.

Auth/security:
- keep the current working `AuthProvider` bootstrap on
  `GET /api/admin/v1/users/me`;
- treat `GET /api/admin/v1/users/me` as the backend-required compatibility
  alias of canonical `GET /api/admin/v1/auth/me` with the same envelope;
- this is not a frontend/backend divergence and not a migration requirement;
  the current implementation is accepted as-is because it follows the backend
  alias contract;
- new product modules must not call either `auth/me` or `users/me` directly;
  they read current admin/session state through `useAuth` or the existing auth
  context;
- switch to `GET /api/admin/v1/auth/me` only if a future backend contract
  explicitly deprecates `/users/me`; until then, do not change the working auth
  bootstrap just for canonical naming;
- do not read access/refresh tokens from bodies or browser storage.

Portal read-model priority:
- portal screens must use portal-safe read models as primary source for screen
  summary state whenever such endpoints exist;
- raw management endpoints are mutation or drill-down contracts, not the main
  source for assembled portal state;
- frontend must not assemble readiness, release, knowledge, billing or metering
  summaries from multiple lower-level endpoints when a portal read model exists.

Primary portal read models:
- `GET /api/admin/v1/portal/tenants/{tenant_id}/agents`
- `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}`
- `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/knowledge`
- `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/sites-widgets`
- `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/release-readiness`
- `GET /api/admin/v1/portal/tenants/{tenant_id}/usage-metering`
- `GET /api/admin/v1/portal/tenants/{tenant_id}/billing-export`
- `GET /api/admin/v1/portal/tenants/{tenant_id}/knowledge/sources`
- `GET /api/admin/v1/portal/tenants/{tenant_id}/knowledge/sources/{source_id}`
- `GET /api/admin/v1/portal/tenants/{tenant_id}/knowledge/release-readiness`

Admin users:
- `GET /api/admin/v1/admins`
- `GET /api/admin/v1/admins/{admin_id}`
- `POST /api/admin/v1/admins`
- `POST /api/admin/v1/admins/{admin_id}/resend-invite`
- `POST /api/admin/v1/admins/{admin_id}/disable`
- `POST /api/admin/v1/admins/{admin_id}/enable`
- `POST /api/admin/v1/admins/{admin_id}/revoke-sessions`

Tenants:
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

Tenant provisioning v1 form:
- required visible fields are `tenant_name` and `external_customer_ref`;
- optional visible field is `external_billing_ref`;
- defaulted/system fields are `provisioning_source = admin_portal` and
  `requested_status = active` unless backend/product policy exposes a
  controlled status selector;
- tenant provisioning model/API layer generates
  `provisioning_correlation_id` for the provisioning attempt and sends it in
  the request body;
- tenant provisioning model/API layer generates `idempotency_key` per
  provisioning attempt and reuses it for retry of the same attempt;
- where the API helper controls headers, set `X-Request-ID` to the same value
  as `provisioning_correlation_id`; do not rely only on the generic request
  interceptor for the body correlation field;
- do not generate provisioning correlation or idempotency values in
  presentational UI;
- do not use `POST /api/admin/v1/system/tenants` as the primary
  customer/service onboarding path.

Dashboard and operations:
- `GET /api/admin/v1/system/platform-settings`
- `GET /api/admin/v1/system/portal/dashboard`
- `GET /api/admin/v1/system/portal/operations`

Agents and templates:
- `GET /api/admin/v1/tenants/{tenant_id}/agent-catalog`
- `POST /api/admin/v1/tenants/{tenant_id}/agents`
- `GET /api/admin/v1/tenants/{tenant_id}/agents`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}`
- `PATCH /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}`
- `PATCH /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/status`
- `PATCH /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/lifecycle`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/setup-checklist`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/foundation-assessment`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/channel-binding`

Agent config:
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/active`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/config-drafts`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}/validate`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}/activate`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}/rollback`

Agent config editable schema:
- root `payload`
- `identity`
- `tone_and_language`
- `goals`
- `rules`
- `restrictions`
- `handoff_policy`
- `integration_policy`
- `model_preference`
- `model_selection_hints`
- `execution_profile_hints`
- `compatibility_and_safety`

Agent config rules:
- do not expose raw provider routing overrides;
- config stage tests must cover draft -> validate -> activate -> rollback
  using this schema.

Knowledge and binding:
- `/api/admin/v1/tenants/{tenant_id}/knowledge/*`
- `/api/admin/v1/portal/tenants/{tenant_id}/knowledge/*`
- `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/knowledge/*`

Knowledge v1 UX:
- managed source registration;
- document registration;
- indexing job start/retry;
- portal readiness inspection;
- access-scope and allowed-agent-scope controls in forms and read views;
- no generic file-upload promise unless a backend upload endpoint is accepted.

Knowledge source/document fields to model where backend exposes them:
- `source_key`
- `source_kind`
- `allowed_agent_scope`
- `allowed_agent_ids`
- `access_scope`
- `content_revision`
- `content_reference`
- `raw_content`
- `chunking_profile`
- `vectorization_profile`
- `embedding_provider`
- `embedding_model`
- `embedding_version`
- `idempotency_key`
- `restricted_access_approved`

Domain knowledge example:
- template-driven UI must support `domain_knowledge_compliance`,
  `aml_kyc_domain_knowledge_v1`,
  `source_pack.aml_kyc_domain_knowledge_v1` and
  `evaluation.aml_kyc_domain_grounded_smoke_v1` when backend returns them;
- these values are an accepted backend example/fixture for regulated domain
  knowledge setup, not a requirement to hardcode an AML product flow;
- accepted source-pack category examples are `regulatory_guidance`,
  `internal_aml_kyc_policies`, `risk_classification_guidance` and
  `operational_procedures`;
- AML/KYC release readiness must not be shown as ready when backend reports
  missing or invalid grounded retrieval evidence.

Capabilities and policy:
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/capabilities/catalog`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/capabilities/assignments`
- `PUT /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/capabilities/assignments`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/policy-profiles/catalog`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/policy/binding`
- `PUT /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/policy/binding`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/policy/binding/validate`

Sites, widgets and releases:
- `/api/admin/v1/tenants/{tenant_id}/sites*`
- `/api/admin/v1/tenants/{tenant_id}/widgets*`
- `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/releases*`
- `/api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/release-readiness`
- `/api/v1/widget/*` only for public widget runtime smoke/install guidance;
  never as an admin-cookie identity flow.

Release gate/manual override:
- release creation UI must support evidence path and approved manual override
  path;
- manual override request fields are `manual_override.reason_code`,
  `manual_override.related_missing_or_failed_items` and optional
  `manual_override.comment`;
- display `gate_mode`, `manual_override_used`,
  `active_release_gate_mode` and `active_release_manual_override` where
  backend returns them;
- publish, rollback and disable confirmations must include release version,
  status, gate mode and active marker.

Public widget smoke v1 decision:
- implement a controlled Admin Portal helper/evidence flow from
  Sites/Widgets/Releases rather than leaving smoke as an external-only
  question;
- the helper uses `/api/v1/widget/*` as public runtime and never admin cookies
  as visitor identity;
- acceptance must cover invalid widget key, invalid origin, not-ready,
  throttled and normal message-flow states.

Widget install snippet v1:
- widget install guidance is backend-owned or backend-derived;
- frontend displays/copies backend-returned `public_embed_marker`,
  `widget_key`, allowed origins and install guidance from site/widget/channel
  binding read models;
- frontend may render a presentational snippet template from backend-returned
  values, but must not invent runtime configuration, tenant id, agent id, model
  settings or policy settings;
- if backend later returns a ready-made snippet, prefer it as authoritative
  display-only content.

Conversations, usage and billing:
- `/api/admin/v1/tenants/{tenant_id}/chats*`
- `/api/admin/v1/portal/tenants/{tenant_id}/conversations/runtime-summary`
- `/api/admin/v1/tenants/{tenant_id}/usage*`
- `/api/admin/v1/portal/tenants/{tenant_id}/usage-metering`
- `/api/admin/v1/portal/tenants/{tenant_id}/billing-export`
- `/api/admin/v1/tenants/{tenant_id}/billing/*`

Billing export mutation visibility:
- if backend returns permissions, action availability follows permissions;
- without explicit permissions, first-pass billing export mutations are visible
  only to `platform_admin`;
- `platform_operator` and `platform_viewer` remain read-only for billing export
  mutations unless backend permissions explicitly allow otherwise;
- export-sensitive actions require confirmation and must show correlation/result
  state after mutation;
- pricing, invoice, payment and tax logic stay out of frontend.

## 7. Routes And Navigation Impact

Navigation groups:
- Overview: Dashboard, Operations.
- Access: My Security, Admin Users.
- Customers: Tenants.
- Agents: Templates, Agents.
- Agent Setup: Config, Knowledge, Capabilities, Policy, Sites & Widgets.
- Production: Releases, Conversations, Usage & Metering, Billing Export.

Target routes:
- `/login`
- `/admin/password-setup`
- `/admin/password-reset`
- `/security`
- `/admins`
- `/dashboard`
- `/operations`
- `/tenants`
- `/tenants/:tenantId`
- `/tenants/:tenantId/agents`
- `/tenants/:tenantId/agents/new`
- `/tenants/:tenantId/agents/:agentId`
- `/tenants/:tenantId/agents/:agentId/config`
- `/tenants/:tenantId/agents/:agentId/knowledge`
- `/tenants/:tenantId/agents/:agentId/capabilities`
- `/tenants/:tenantId/agents/:agentId/policy`
- `/tenants/:tenantId/agents/:agentId/sites-widgets`
- `/tenants/:tenantId/agents/:agentId/releases`
- `/tenants/:tenantId/conversations`
- `/tenants/:tenantId/usage`
- `/tenants/:tenantId/billing-export`

Route rules:
- add routes only with working pages and tests;
- implement `/security` as a normal protected frontend route/page, not as
  redirect to `/settings?tab=security`;
- OpenAPI is the source of truth for backend paths. Use `/openapi.json`
  primarily; `/api/v1/openapi.json` is a compatibility alias;
- do not create or require a dedicated backend security endpoint. Live
  OpenAPI verified on `2026-05-12` exposes no such path; the security page uses
  existing `/api/admin/v1/auth/*` and `/api/admin/v1/users/me` endpoints;
- the `/security` page must reuse existing `AdminTotpPanel` and
  `AdminSessionsPanel` behavior;
- keep `/settings` for general account/app settings;
- update AppShell navigation to point security/account-protection tasks to
  `/security`;
- update router, settings and security tests that currently assert the
  `/settings?tab=security` shape;
- do not keep hidden compatibility redirects unless a real deployed-user
  migration requirement is accepted;
- root redirect may move from `/settings` to `/dashboard` only after dashboard
  is functional.
- keep authenticated `/ -> /settings` until `/dashboard` is implemented as a
  real working route; move the root redirect to `/dashboard` only in the same
  stage that adds and tests the dashboard.

Shell behavior:
- persistent current admin summary;
- role-aware navigation/action affordances;
- selected tenant context where tenant-scoped routes are active;
- selected agent context where agent-scoped routes are active;
- top status strip for selected tenant/agent/readiness where backend returns
  useful read-model data;
- responsive desktop and mobile navigation.

## 8. Module Ownership And File Owners

Existing owners:
- `src/core/router/routes.tsx` - route registration and protected route tree;
- `src/core/router/routeGuards.tsx` - auth guard behavior;
- `src/core/api/apiClient.ts` - transport, credentials, CSRF and interceptors;
- `src/core/api/errors/*` - API error parsing and localization hooks;
- `src/core/auth/authService.ts` - auth/session/password service;
- `src/core/auth/AuthProvider.tsx` - current auth state;
- `src/core/i18n/*` - locale/messages;
- `src/core/settings/*` - app settings/preferences;
- `src/shared/ui/AppShell/*` - global shell and navigation surface;
- `src/modules/Settings/*` - account/settings page and sessions UI;
- `src/modules/AdminSecurity/*` - TOTP module.

Candidate new modules:
- `src/modules/AdminUsers`
- `src/modules/Tenants`
- `src/modules/Operations`
- `src/modules/AgentTemplates`
- `src/modules/Agents`
- `src/modules/AgentConfig`
- `src/modules/Knowledge`
- `src/modules/AgentKnowledgeBinding`
- `src/modules/AgentCapabilities`
- `src/modules/AgentPolicy`
- `src/modules/SitesWidgets`
- `src/modules/Releases`
- `src/modules/Conversations`
- `src/modules/UsageBilling`

Stage decomposition may combine tightly coupled candidate modules when it
reduces churn, but must keep API/model/page/UI ownership explicit.

## 9. UI States And I18n Requirements

Every route/screen must support:
- loading;
- empty;
- ready;
- validation error;
- backend unavailable;
- permission denied;
- not found;
- destructive/critical confirmation;
- successful mutation notice;
- retry where safe;
- request/correlation id display or copy action when available.

UX requirements:
- operations-console feel, not generic CRUD tables;
- checklist-driven setup where backend exposes setup/readiness state;
- status badges use backend status values;
- destructive and critical actions are visually separated from normal editing;
- detail drawers are acceptable for safe inspection;
- no future/placeholder screen copy in production navigation.

I18n:
- all new user-visible text goes through existing i18n messages;
- preserve current supported locale behavior;
- do not add hardcoded English/Russian strings inside new UI components.

Accessibility:
- pages need meaningful headings;
- form controls need labels;
- icon buttons need accessible names and tooltips where meaning is not obvious;
- dialogs and status banners need accessible roles;
- keyboard navigation must work for dialogs, tabs, filters and action menus.

## 10. Security, Session And Access Requirements

- admin portal remains internal operator-only;
- backend remains source of truth for identity, permissions and authorization;
- frontend role vocabulary is locked to backend roles:
  `platform_admin`, `platform_operator`, `platform_viewer`;
- if backend response includes permissions, action availability prefers
  permissions over local role inference;
- no access or refresh token browser storage;
- no raw setup tokens, password hashes, refresh token internals or TOTP secrets
  after enrollment completion;
- current role can hide or disable UI actions, but backend rejection must still
  be handled cleanly;
- critical actions require confirmation with object/action summary;
- session revoked, expired or disabled admin state redirects to login with a
  clear reason where backend provides enough information;
- public widget smoke must not use admin cookies as visitor identity.

## 11. Testing Requirements

Per stage:
- API mapping and error-state tests for new API clients;
- model/hook tests for scenario orchestration and mutation refresh behavior;
- page/component tests for loading, empty, ready, error and permission states;
- router tests for new routes and protected behavior;
- regression tests when auth/session/settings/security code is touched.
- use backend portal fixture shapes where practical, especially dashboard,
  tenant detail, agent detail, runtime summary, usage metering and forbidden
  responses;
- Agent Config tests must cover draft, validate, activate and rollback using
  the accepted editable schema;
- Knowledge tests must cover restricted source visibility, agent-scoped sources
  and failed indexing retry;
- Release tests must cover evidence path and approved manual-override path;
- Widget smoke tests must cover invalid widget key, invalid origin, not-ready,
  throttled and normal message-flow states.

Final admin app gates:
- `npm run test:admin`
- `npm run lint:admin`
- `npm run build:admin`

Evidence expectations:
- auth/session/password/TOTP baseline remains covered;
- admin users lifecycle evidence;
- tenant provisioning/detail evidence;
- agent create/setup/config evidence;
- knowledge/index/binding evidence;
- capability/policy binding evidence;
- site/widget/release readiness evidence;
- public widget controlled smoke evidence where in frontend scope;
- conversations/support evidence;
- usage/metering/billing export evidence;
- no token storage and no direct DB/vector/provider calls.

## 12. Regression-Sensitive Scenarios

- anonymous user cannot access protected routes;
- authenticated root redirect remains valid during staged rollout;
- login/refresh/logout/logout-all continue to work;
- `/admin/password-setup` and `/admin/password-reset` backend mail links work;
- `/password-reset/request` and `/password-reset/confirm` remain valid;
- `/settings` remains valid for general settings;
- current `/settings?tab=security` behavior is baseline only before the
  `/security` stage; that stage must add a real `/security` page and update
  route/navigation/tests instead of adding a hidden redirect;
- TOTP enrollment secret is not retained after completion;
- session revoke updates session list;
- CSRF header is attached to mutating cookie-authenticated requests;
- backend `error_code` and compatibility `code` both map correctly;
- future navigation entries do not appear before functional routes exist.

## 13. Docs Impact

During stages:
- update `apps/admin-panel/docs` only when implemented behavior changes;
- keep root docs unchanged unless workspace/shared-package rules change;
- keep backend/product docs read-only unless a dedicated docs-sync/finalization
  stage explicitly accepts writing there.

After accepted stage closure:
- synchronize implemented routes, module ownership and development recipes;
- update evidence links for launch/front-end coverage checklists when allowed;
- ensure docs describe shipped behavior only.

## 14. Stage Split Recommendation

Use staged decomposition. This umbrella is too broad for one implementation
pass, and there are clear dependency boundaries.

Recommended order:
1. Security/auth polish and shell readiness.
2. Admin Users.
3. Navigation and operator shell expansion.
4. Tenants provisioning, list and detail.
5. Dashboard and Operations.
6. Agent Templates and Agent lifecycle.
7. Agent Config.
8. Knowledge management, domain source packs and agent knowledge binding.
9. Capabilities and Policy binding.
10. Sites, Widgets, controlled smoke and release management.
11. Conversations and support inspection.
12. Usage, Metering and Billing Export.
13. End-to-end frontend smoke, evidence and docs sync.

Stage package created by prompt 02:

| # | Stage TZ | Visible increment |
| --- | --- | --- |
| 01 | [stage_01_security_route_shell_readiness.md](stages/stage_01_security_route_shell_readiness.md) | Real `/security` page and shell/auth readiness. |
| 02 | [stage_02_admin_users.md](stages/stage_02_admin_users.md) | Admin Users management. |
| 03 | [stage_03_navigation_operator_shell.md](stages/stage_03_navigation_operator_shell.md) | Operator shell/navigation expansion for implemented routes only. |
| 04 | [stage_04_tenants.md](stages/stage_04_tenants.md) | Tenant provisioning, list and detail. |
| 05 | [stage_05_dashboard_operations.md](stages/stage_05_dashboard_operations.md) | Dashboard, Operations and authenticated `/ -> /dashboard`. |
| 06 | [stage_06_agent_templates_agents.md](stages/stage_06_agent_templates_agents.md) | Agent templates, agent creation and lifecycle. |
| 07 | [stage_07_agent_config.md](stages/stage_07_agent_config.md) | Agent config versions, validation, activation and rollback. |
| 08 | [stage_08_knowledge_binding.md](stages/stage_08_knowledge_binding.md) | Knowledge sources, indexing, readiness and agent binding. |
| 09 | [stage_09_capabilities_policy.md](stages/stage_09_capabilities_policy.md) | Capability assignment and policy binding. |
| 10 | [stage_10_sites_widgets_releases.md](stages/stage_10_sites_widgets_releases.md) | Sites, widgets, public smoke and releases. |
| 11 | [stage_11_conversations_support.md](stages/stage_11_conversations_support.md) | Conversations and support inspection. |
| 12 | [stage_12_usage_metering_billing.md](stages/stage_12_usage_metering_billing.md) | Usage, metering and billing export. |
| 13 | [stage_13_e2e_smoke_docs.md](stages/stage_13_e2e_smoke_docs.md) | End-to-end smoke, evidence and docs sync. |

Stage count decision:
- keep 13 stages because each stage maps to an independently visible route,
  domain module group or final evidence gate;
- keep Sites/Widgets/Releases combined because release evidence depends on the
  widget channel path and can be verified as one publishability increment;
- keep Usage/Metering/Billing combined because frontend must not duplicate
  billing calculations and all three depend on the same billing-safe read model
  boundary;
- do not split smaller unless prompt 03 finds an actual consistency or
  implementation risk.

Current gate state:
- prompt 03 accepted the stage TZ package;
- prompt 04 may now implement exactly one accepted stage at a time;
- prompt 08 is available as an optional helper to generate adapted execution
  prompts before prompt 04.

## 15. Open Questions And Deferred Items

No open pre-implementation questions remain after the code-grounded audit
corrections.

Resolved by conformance review:
- current `AuthProvider` stays on `/users/me`; `/users/me` is the required
  backend alias of `/auth/me`, so this is accepted current implementation, not
  a frontend/backend mismatch. New modules use `useAuth` instead of calling
  either endpoint directly;
- tenant provisioning v1 visible fields are `tenant_name`,
  `external_customer_ref` and optional `external_billing_ref`; correlation and
  idempotency values are generated in the Tenants model/API layer;
- widget install snippet v1 is backend-owned or backend-derived display/copy
  guidance;
- `/security` must be a real protected page that reuses existing security
  panels, not a redirect to `/settings?tab=security`;
- authenticated `/` remains redirected to `/settings` until `/dashboard` is a
  real working route;
- frontend roles are `platform_admin`, `platform_operator`,
  `platform_viewer`, with permissions preferred when present;
- Agent Config editable schema is defined in section 6;
- Knowledge v1 UX is managed source/document registration, indexing and portal
  readiness, not generic upload;
- billing export mutations are first-pass `platform_admin` only unless backend
  permissions explicitly allow more;
- public widget smoke is an Admin Portal controlled helper/evidence flow using
  public widget runtime identity.

## 16. Acceptance For This Umbrella

This umbrella is accepted for decomposition when:
- source materials are recorded;
- target app and hard boundaries are explicit;
- current implemented baseline is preserved;
- scope is split into stageable functional areas;
- open questions are recorded instead of guessed.

Verdict: `Ready for decomposition`.
