# Admin Portal Frontend Functional Checklist

Status: `stage-13-evidence-updated`

Target app:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel`

Backend/product source:
- `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_IMPLEMENTATION_TZ.md`
- `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_COVERAGE_CHECKLIST.md`
- `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_TZ_CONFORMANCE_REVIEW.md`
- `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_CODE_GROUNDED_AUDIT.md`
- `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/SERVICE_LAUNCH_CHECKLIST.md`
- `/Volumes/Work/AI_Agents/ai_core/docs/api/portals/admin/README.md`

Purpose:
- keep a frontend-local inventory before creating the umbrella frontend `TZ`;
- preserve the current implemented auth/security baseline;
- prevent missing screens, duplicate work, speculative abstractions or
  backend-owned logic in the frontend;
- provide the checklist that prompt `01_discovery_create_umbrella_frontend_tz`
  should use as source material.

## 1. Current Baseline To Reuse

These functions are already implemented in `apps/admin-panel` and should be
extended, not rewritten.

- [x] Login with `/api/admin/v1/auth/login`.
- [x] Session refresh with `/api/admin/v1/auth/refresh`.
- [x] Logout with `/api/admin/v1/auth/logout`.
- [x] Logout all sessions with `/api/admin/v1/auth/logout-all`.
- [x] Current admin bootstrap through `/api/admin/v1/users/me`.
- [x] Protected routing.
- [x] App shell.
- [x] Theme and locale providers.
- [x] Settings page.
- [x] Current admin summary.
- [x] Active sessions list.
- [x] Revoke own session.
- [x] Password setup confirm.
- [x] Password reset request.
- [x] Password reset confirm.
- [x] TOTP status.
- [x] TOTP enrollment with QR/manual key.
- [x] TOTP confirm using `enrollment_id`.
- [x] TOTP disable.
- [x] CSRF header from `ai_core_admin_csrf`.
- [x] Error mapping through backend `error_code`.
- [x] Compatibility fallback for backend `code`.
- [x] Backend mail route aliases:
  - `/admin/password-setup`;
  - `/admin/password-reset`.

Current baseline risks to preserve:
- no access/refresh token in browser storage;
- backend remains auth/session/security source of truth;
- auth/session state stays in `src/core/auth`;
- TOTP secret/manual key is shown only during enrollment and not persisted after
  completion;
- no future section appears in navigation before it has a working page and real
  scenario.

## 2. Global UX And Architecture Rules

Every new screen must follow these rules.

- [ ] Treat the portal as an internal operator console, not customer
  self-service.
- [ ] Use backend-owned read models for readiness, health, release, policy,
  billing and metering.
- [ ] Use portal-safe read models as primary screen source where they exist.
- [ ] Treat raw management endpoints as mutation/drill-down contracts, not as
  assembled portal summary sources.
- [ ] Use backend role vocabulary: `platform_admin`, `platform_operator`,
  `platform_viewer`.
- [ ] Prefer backend `permissions` over local role inference when permissions
  are present.
- [ ] Do not calculate readiness locally in the browser.
- [ ] Do not call DB, vector DB, model providers or internal backend modules
  directly.
- [ ] Keep API calls in module `api/` or core infrastructure services.
- [ ] Keep DTO mapping out of pages and presentational UI.
- [ ] Keep domain orchestration in module `model/`.
- [ ] Keep route pages in module `pages/`.
- [ ] Keep domain UI in module `ui/`.
- [ ] Export each module public API through `index.ts`.
- [ ] Do not call `apiClient` directly from `pages` or presentational `ui`.
- [ ] Move code to `shared` only after real reuse or clear infrastructure need.
- [ ] Use accessible form labels, button names, headings, statuses and dialogs.
- [ ] Show loading, empty, ready, error, permission denied and not found states.
- [ ] Show request/correlation id when backend returns it.
- [ ] Confirm destructive or critical actions.
- [ ] Refresh affected read models after successful mutations.
- [ ] Disable or hide actions by role, but rely on backend enforcement.

## 3. Navigation And Shell Expansion

Goal:
- evolve current `Settings`-only shell into a real operator navigation model
  without adding placeholder routes.

Required groups:
- [ ] Overview: Dashboard, Operations.
- [ ] Access: My Security, Admin Users.
- [ ] Customers: Tenants.
- [ ] Agents: Templates, Agents.
- [ ] Agent Setup: Config, Knowledge, Capabilities, Policy, Sites & Widgets.
- [ ] Production: Releases, Conversations, Usage & Metering, Billing Export.

Required shell behavior:
- [ ] Persistent current admin summary.
- [ ] Role-aware navigation/action availability.
- [ ] Tenant context when tenant is selected.
- [ ] Agent context when agent is selected.
- [ ] Top status strip for selected tenant/agent/readiness where relevant.
- [ ] Responsive desktop and mobile navigation.

## 4. P0 Security Polish

Status:
- mostly implemented; remaining work is contract polish and UX hardening.

Checklist:
- [x] `/admin/password-setup` alias.
- [x] `/admin/password-reset` alias.
- [x] `error_code` plus `code` fallback.
- [x] Keep current `AuthProvider` bootstrap on `/api/admin/v1/users/me`;
  backend documents it as the required compatibility alias of canonical
  `/api/admin/v1/auth/me`.
- [x] Treat current `/users/me` bootstrap as accepted implementation, not as
  frontend/backend divergence.
- [ ] New product modules read current admin/session through `useAuth` instead
  of calling `auth/me` or `users/me` directly.
- [ ] Switch current bootstrap to `/auth/me` only if a future backend contract
  explicitly deprecates `/users/me`.
- [ ] Add explicit login redirect reason for expired/revoked/disabled session
  when backend error state allows it.
- [ ] Add global auth error banner or notice area for recoverable auth failures.
- [ ] Confirm no access/refresh token storage in local/session storage through
  tests or smoke evidence.
- [ ] Implement `/security` as a real protected frontend route/page, not
  redirect to `/settings?tab=security`.
- [ ] Confirm `/security` does not require any dedicated backend security
  endpoint and reuses existing `/api/admin/v1/auth/*` contracts.
- [ ] Reuse existing `AdminTotpPanel` and `AdminSessionsPanel` in the new
  security page.
- [ ] Keep `/settings` for general account/app settings.
- [ ] Point AppShell security navigation to `/security`.
- [ ] Keep authenticated `/ -> /settings` until `/dashboard` exists and is
  tested as a real route.

## 5. P0 Admin Users

Purpose:
- day-2 management of internal portal users after first CLI bootstrap.

Module candidate:
- `src/modules/AdminUsers`

Routes:
- `/admins`
- `/admins/:adminId` if detail page is needed; otherwise use detail drawer.

Checklist:
- [ ] List admins.
- [ ] Search/filter by email, role and status.
- [ ] Safe admin detail.
- [ ] Create/invite admin.
- [ ] Resend invite.
- [ ] Disable admin with confirmation.
- [ ] Enable admin with confirmation.
- [ ] Revoke all sessions for selected admin with confirmation.
- [ ] Show password setup status.
- [ ] Show invite status.
- [ ] Show TOTP enabled status.
- [ ] Show created/updated timestamps.
- [ ] No raw setup token display.
- [ ] No password hash, refresh token internals or TOTP secret display.
- [ ] `platform_viewer` cannot mutate.
- [ ] `platform_operator` mutations follow backend permissions.

Backend contracts:
- `GET /api/admin/v1/admins`
- `GET /api/admin/v1/admins/{admin_id}`
- `POST /api/admin/v1/admins`
- `POST /api/admin/v1/admins/{admin_id}/resend-invite`
- `POST /api/admin/v1/admins/{admin_id}/disable`
- `POST /api/admin/v1/admins/{admin_id}/enable`
- `POST /api/admin/v1/admins/{admin_id}/revoke-sessions`

## 6. P0 Tenants

Purpose:
- create and manage customer/service tenant provisioning through approved
  backend flow.

Module candidate:
- `src/modules/Tenants`

Routes:
- `/tenants`
- `/tenants/:tenantId`

Checklist:
- [ ] Tenants list.
- [ ] Tenant detail.
- [ ] Provision tenant wizard.
- [ ] Provision tenant wizard required fields: `tenant_name`,
  `external_customer_ref`.
- [ ] Provision tenant wizard optional field: `external_billing_ref`.
- [ ] Default `provisioning_source` to `admin_portal`.
- [ ] Default `requested_status` to `active` unless backend/product policy
  exposes a controlled status selector.
- [ ] Generate `provisioning_correlation_id` in Tenants model/API layer and
  send it in request body.
- [ ] Set `X-Request-ID` to `provisioning_correlation_id` where the API helper
  controls headers.
- [ ] Generate `idempotency_key` per provisioning attempt and reuse it for
  retry of the same attempt.
- [ ] Do not generate provisioning correlation/idempotency values in
  presentational UI.
- [ ] Show provisioning status.
- [ ] Show external customer reference.
- [ ] Show/set approved external billing reference.
- [ ] Show provisioning correlation id.
- [ ] Show audit/correlation summary.
- [ ] Update allowed provisioning metadata.
- [ ] Change tenant/provisioning status where allowed.
- [ ] Provision default tenant configuration.
- [ ] View/edit approved tenant configuration.
- [ ] Clearly label portal as internal operator console.
- [ ] Do not use simple system tenant create as primary customer/service
  onboarding path.

Primary backend contracts:
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

## 7. P1 Dashboard And Operations

Purpose:
- one operational overview for platform status and next actions.

Module candidate:
- `src/modules/Operations`

Routes:
- `/dashboard`
- `/operations`

Checklist:
- [ ] Active tenants card.
- [ ] Active agents card.
- [ ] Failed onboarding/release checks.
- [ ] Recent runtime errors/degradation.
- [ ] Billing export failures.
- [ ] Operations summary.
- [ ] Quick links to tenant, agent, release, usage and operations screens.
- [ ] No frontend-local health/readiness calculations.
- [ ] Use portal dashboard/operations read models directly.

Backend contracts:
- `GET /api/admin/v1/system/platform-settings`
- `GET /api/admin/v1/system/portal/dashboard`
- `GET /api/admin/v1/system/portal/operations`

## 8. P1 Agent Templates And Agents

Purpose:
- create and manage agents through backend-approved templates/archetypes.

Module candidates:
- `src/modules/AgentTemplates`
- `src/modules/Agents`

Routes:
- `/tenants/:tenantId/agents`
- `/tenants/:tenantId/agents/new`
- `/tenants/:tenantId/agents/:agentId`

Checklist:
- [ ] Template/archetype catalog.
- [ ] Template detail.
- [ ] Start create-agent wizard from selected template.
- [ ] Agents list by tenant.
- [ ] Agent detail.
- [ ] Edit agent name/description/purpose.
- [ ] Update agent status.
- [ ] Update lifecycle.
- [ ] Show setup checklist.
- [ ] Show foundation assessment.
- [ ] Show channel binding.
- [ ] Render template-required source-pack category progress where backend
  returns it.
- [ ] Show regulated-domain policy/evaluation markers where backend returns
  them.
- [ ] No hardcoded single sales bot behavior.
- [ ] No AML/KYC-specific runtime branches in frontend.
- [ ] No destructive delete without future approved contract.

Backend contracts:
- Primary read models:
  - `GET /api/admin/v1/portal/tenants/{tenant_id}/agents`
  - `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}`
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

## 9. P1 Agent Config

Purpose:
- manage versioned behavior configuration without direct provider/prompt chaos.

Module candidate:
- `src/modules/AgentConfig`

Route:
- `/tenants/:tenantId/agents/:agentId/config`

Checklist:
- [ ] Active config view.
- [ ] Config version list.
- [ ] Config detail.
- [ ] Create draft/new version.
- [ ] Edit approved schema fields only:
  - root `payload`;
  - `identity`;
  - `tone_and_language`;
  - `goals`;
  - `rules`;
  - `restrictions`;
  - `handoff_policy`;
  - `integration_policy`;
  - `model_preference`;
  - `model_selection_hints`;
  - `execution_profile_hints`;
  - `compatibility_and_safety`.
- [ ] Validate config.
- [ ] Activate config.
- [ ] Rollback config with target version confirmation.
- [ ] Show validation result before activation where backend requires it.
- [ ] Do not edit provider routing policy directly.
- [ ] Cover draft -> validate -> activate -> rollback in tests.

Backend contracts:
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/active`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/config-drafts`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}/validate`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}/activate`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/configs/{config_id}/rollback`

## 10. P1 Knowledge And Binding

Purpose:
- manage domain knowledge and bind approved source sets to agents.

Module candidates:
- `src/modules/Knowledge`
- `src/modules/AgentKnowledgeBinding`

Routes:
- `/tenants/:tenantId/agents/:agentId/knowledge`

Checklist:
- [ ] Register managed knowledge source.
- [ ] List/read knowledge sources.
- [ ] Update source metadata.
- [ ] Disable source.
- [ ] Register/list/read documents.
- [ ] Update document metadata.
- [ ] Disable document.
- [ ] Start indexing job.
- [ ] Show index readiness.
- [ ] List indexing jobs.
- [ ] Retry failed indexing job.
- [ ] Show support-safe chunks.
- [ ] Show retrieval runs.
- [ ] Show support reconstruction.
- [ ] Show knowledge release readiness.
- [ ] Show portal knowledge source read models as primary screen state.
- [ ] Model `source_key`, `source_kind`, `allowed_agent_scope`,
  `allowed_agent_ids`, `access_scope`, `content_revision`,
  `content_reference`, `raw_content`, `chunking_profile`,
  `vectorization_profile`, `embedding_provider`, `embedding_model`,
  `embedding_version`, `idempotency_key` and
  `restricted_access_approved` where backend exposes them.
- [ ] Show restricted source visibility and approval state.
- [ ] Support agent-scoped source selection.
- [ ] Do not promise generic file upload unless a backend upload endpoint is
  accepted.
- [ ] Show available knowledge catalog for agent.
- [ ] Show current agent binding.
- [ ] Update allowed source set.
- [ ] Disable binding.
- [ ] Show readiness/release impact.
- [ ] No direct vector DB access.
- [ ] No cross-tenant source selection.
- [ ] Failed indexing retry is covered by tests.

Accepted domain knowledge example:
- [ ] Treat AML/KYC only as a backend-provided example/fixture for generic
  regulated domain knowledge setup, not as separate frontend product scope.
- [ ] Support `domain_knowledge_compliance` template markers when backend
  returns them.
- [ ] Support `aml_kyc_domain_knowledge_v1`.
- [ ] Support `source_pack.aml_kyc_domain_knowledge_v1`.
- [ ] Support `evaluation.aml_kyc_domain_grounded_smoke_v1`.
- [ ] Show source-pack category progress for `regulatory_guidance`,
  `internal_aml_kyc_policies`, `risk_classification_guidance` and
  `operational_procedures`.
- [ ] Do not mark AML/KYC release ready when grounded retrieval evidence is
  missing or invalid.

Backend contract groups:
- Primary read models:
  - `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/knowledge`
  - `GET /api/admin/v1/portal/tenants/{tenant_id}/knowledge/sources`
  - `GET /api/admin/v1/portal/tenants/{tenant_id}/knowledge/sources/{source_id}`
  - `GET /api/admin/v1/portal/tenants/{tenant_id}/knowledge/release-readiness`
- `/api/admin/v1/tenants/{tenant_id}/knowledge/*`
- `/api/admin/v1/portal/tenants/{tenant_id}/knowledge/*`
- `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/knowledge/*`

## 11. P1 Capabilities And Policy

Purpose:
- manage what an agent can do and which guardrails apply.

Module candidates:
- `src/modules/AgentCapabilities`
- `src/modules/AgentPolicy`

Routes:
- `/tenants/:tenantId/agents/:agentId/capabilities`
- `/tenants/:tenantId/agents/:agentId/policy`

Checklist:
- [ ] Capability catalog.
- [ ] Current capability assignments.
- [ ] Enable/update assignments.
- [ ] Show risk classification.
- [ ] Show invocation semantics if backend exposes them.
- [ ] Show approval/policy requirements.
- [ ] Show metering classification if backend exposes it.
- [ ] Policy profile catalog.
- [ ] Current policy binding.
- [ ] Bind/update policy profile.
- [ ] Validate policy binding.
- [ ] Show policy-sensitive readiness issues.
- [ ] Do not implement safety logic locally.
- [ ] No ad-hoc tool creation in frontend.

Backend contracts:
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/capabilities/catalog`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/capabilities/assignments`
- `PUT /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/capabilities/assignments`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/policy-profiles/catalog`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/policy/binding`
- `PUT /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/policy/binding`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/policy/binding/validate`

## 12. P2 Sites, Widgets And Releases

Purpose:
- connect the agent to public channel and publish safely.

Module candidates:
- `src/modules/SitesWidgets`
- `src/modules/Releases`

Routes:
- `/tenants/:tenantId/agents/:agentId/sites-widgets`
- `/tenants/:tenantId/agents/:agentId/releases`

Checklist:
- [ ] Create/list/read site.
- [ ] Manage site status.
- [ ] Show allowed origins if exposed.
- [ ] Create/list/read widget.
- [ ] Bind widget to agent/site.
- [ ] Manage widget status.
- [ ] Show install/embed instructions.
- [ ] Display/copy backend-returned `public_embed_marker`, `widget_key`,
  allowed origins and install guidance from site/widget/channel-binding read
  models.
- [ ] Render snippet templates only from backend-returned values.
- [ ] Do not invent runtime configuration, tenant id, agent id, model settings
  or policy settings in frontend snippets.
- [ ] Prefer ready-made backend snippet as authoritative display-only content
  if backend later returns one.
- [ ] Show controlled public widget smoke helper/evidence flow.
- [ ] Widget smoke helper uses `/api/v1/widget/*` and never admin cookies as
  visitor identity.
- [ ] Widget smoke covers invalid widget key, invalid origin, not-ready,
  throttled and normal message-flow states.
- [ ] Release list.
- [ ] Release detail.
- [ ] Create release draft.
- [ ] Show release readiness checklist.
- [ ] Attach/show release evidence where backend supports it.
- [ ] Support approved manual override path with
  `manual_override.reason_code`,
  `manual_override.related_missing_or_failed_items` and optional
  `manual_override.comment`.
- [ ] Display `gate_mode`, `manual_override_used`,
  `active_release_gate_mode` and `active_release_manual_override` where
  returned.
- [ ] Publish release with confirmation.
- [ ] Rollback release with confirmation.
- [ ] Disable release with confirmation.
- [ ] Publish/rollback/disable confirmations include release version, status,
  gate mode and active marker.
- [ ] Show active release snapshot.
- [ ] Public widget flow must not use admin cookies.
- [ ] UI must not claim real customer launch without external evidence.
- [ ] Release tests cover evidence path and approved manual-override path.

Backend contract groups:
- Primary read models:
  - `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/sites-widgets`
  - `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/release-readiness`
- `/api/admin/v1/tenants/{tenant_id}/sites*`
- `/api/admin/v1/tenants/{tenant_id}/widgets*`
- `/api/v1/widget/*`
- `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/releases*`
- `/api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/release-readiness`

## 13. P2 Conversations, Usage, Metering And Billing

Purpose:
- inspect runtime/support evidence and billing-relevant activity.

Module candidates:
- `src/modules/Conversations`
- `src/modules/UsageBilling`

Routes:
- `/tenants/:tenantId/conversations`
- `/tenants/:tenantId/usage`
- `/tenants/:tenantId/billing-export`

Checklist:
- [ ] Chat list.
- [ ] Chat detail.
- [ ] Close chat where approved.
- [ ] Messages view.
- [ ] Message detail.
- [ ] Conversation turns.
- [ ] Turn detail.
- [ ] Current memory view.
- [ ] Runtime summary.
- [ ] Links to usage/model request/retrieval evidence.
- [ ] Usage summary.
- [ ] Usage detail.
- [ ] Model request detail.
- [ ] Chat usage.
- [ ] Conversation turn usage.
- [ ] Portal usage/metering read model.
- [ ] Billing export status.
- [ ] Create export batch for `platform_admin` or explicit backend permission.
- [ ] Register export failure for `platform_admin` or explicit backend
  permission.
- [ ] Retry export for `platform_admin` or explicit backend permission.
- [ ] Run reconciliation for `platform_admin` or explicit backend permission.
- [ ] Keep `platform_operator` and `platform_viewer` read-only for billing
  export mutations unless backend permissions explicitly allow them.
- [ ] Confirm every export-sensitive action.
- [ ] Show correlation/result state after billing export mutations.
- [ ] No pricing, invoice, payment or tax logic in frontend.
- [ ] Do not expose internal prompts/secrets unless backend marks support-safe.

Backend contract groups:
- Primary read models:
  - `GET /api/admin/v1/portal/tenants/{tenant_id}/conversations/runtime-summary`
  - `GET /api/admin/v1/portal/tenants/{tenant_id}/usage-metering`
  - `GET /api/admin/v1/portal/tenants/{tenant_id}/billing-export`
- `/api/admin/v1/tenants/{tenant_id}/chats*`
- `/api/admin/v1/portal/tenants/{tenant_id}/conversations/runtime-summary`
- `/api/admin/v1/tenants/{tenant_id}/usage*`
- `/api/admin/v1/portal/tenants/{tenant_id}/usage-metering`
- `/api/admin/v1/portal/tenants/{tenant_id}/billing-export`
- `/api/admin/v1/tenants/{tenant_id}/billing/*`

## 14. Suggested Umbrella Stage Order

This is a draft order for the future umbrella `TZ`. Prompt `01` may refine it.

1. Security/auth polish and shell readiness.
2. Admin Users.
3. Navigation and operator shell expansion.
4. Tenants provisioning/list/detail.
5. Dashboard and Operations.
6. Agent Templates and Agent lifecycle.
7. Agent Config.
8. Knowledge management, domain source packs and agent knowledge binding.
9. Capabilities and Policy binding.
10. Sites, Widgets, controlled smoke and release management.
11. Conversations and support inspection.
12. Usage, Metering and Billing Export.
13. End-to-end frontend smoke, evidence and docs sync.

## 15. Definition Of Done For Umbrella Scope

- [x] All accepted stages pass their stage acceptance review.
- [x] Final checks pass for admin app:
  - `npm run test:admin`
  - `npm run lint:admin`
  - `npm run build:admin`
- [x] If running checks inside `apps/admin-panel`, use app-local scripts:
  - `npm run test`
  - `npm run lint`
  - `npm run build`
- [x] Frontend evidence is linked back to backend/productization checklists.
- [x] No frontend-local readiness/policy/billing calculations replace backend
  contracts.
- [x] No access/refresh tokens are stored in browser storage.
- [x] No direct DB/vector/provider calls exist in frontend.
- [x] Admin Portal remains internal operator-only.
- [x] Public widget runtime remains separate from admin cookie identity.
- [x] Portal screens use portal-safe read models as primary screen state where
  available.
- [x] Release manual override and `gate_mode` behavior is covered.
- [x] Generic domain knowledge template-driven setup is covered; AML/KYC is
  only an accepted backend example/fixture and has no frontend runtime branch.
- [x] Billing export mutations follow backend permissions, defaulting to
  `platform_admin` only.
- [x] Docs describe implemented behavior only.

Stage 13 evidence:
- `adminPortalFinalSmoke.test.tsx` fixes the shipped route surface and verifies
  that the full tenant -> agent -> setup -> widget -> release -> support ->
  usage/billing route journey is protected.
- Stage 13 boundary searches verified no direct `apiClient`, `fetch` or
  `axios` calls from module pages/UI/model outside accepted API owners.
- Stage 13 token-storage search found no access/refresh token browser storage;
  the only refresh-token hit is the safe revoked-token count mapped in
  `AdminUsers/api`.
- Stage 13 forbidden-call searches found no frontend runtime DB/vector/provider
  client calls. Backend-returned status flags such as Redis enablement and
  direct DB/vector evidence markers remain display-only read-model fields.
- Full gate evidence is recorded in `pipeline_state.md` before prompt 07.

## 16. Open Questions For Umbrella TZ

- [x] No open pre-implementation questions remain after code-grounded audit
  corrections.

Resolved by conformance review:
- [x] Current `AuthProvider` stays on `/users/me`; this matches the backend
  alias contract. New modules use `useAuth` and do not call current-admin
  endpoints directly.
- [x] Tenant provisioning v1 uses required `tenant_name`,
  `external_customer_ref`, optional `external_billing_ref`, and model/API-layer
  `provisioning_correlation_id` plus `idempotency_key`.
- [x] Widget install snippet v1 is backend-owned or backend-derived
  display/copy guidance.
- [x] `/security` is a real protected page, not a redirect to
  `/settings?tab=security`.
- [x] Authenticated `/` stays on `/settings` until dashboard is a working,
  tested route.
- [x] Role vocabulary is `platform_admin`, `platform_operator`,
  `platform_viewer`; prefer backend permissions when present.
- [x] Agent Config editable schema is explicitly listed in section 9.
- [x] Knowledge v1 UX is managed source/document registration and indexing, not
  generic file upload.
- [x] Billing export mutations default to `platform_admin` unless backend
  permissions explicitly allow more.
- [x] Public widget smoke is an Admin Portal controlled helper/evidence flow.
