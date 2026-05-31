# Admin Portal Implemented Functionality Checklist

Status: `implemented`

Use this checklist to verify the current functional composition of
`apps/admin-panel`. It describes what is already implemented and accepted in
the Admin Portal after umbrella frontend finalization and the accepted urgent
Agent Config operator UX fix plus the urgent Release Evidence Requirements UI
and Release Retrieval Evidence Operator Flow stages.

## Product Boundary

- [x] The app is an internal operator/admin console.
- [x] Customer self-service portal scope is not implemented here.
- [x] Generic CRUD admin shell is not used as a replacement for scenario flows.
- [x] Runtime scope stays inside `apps/admin-panel`.
- [x] No `apps/client-panel` internals are used.
- [x] No speculative shared package extraction is part of the implemented
  scope.
- [x] Public widget smoke is isolated from admin cookies and admin visitor
  identity.

## Security And Session Baseline

- [x] Login.
- [x] Session refresh.
- [x] Logout.
- [x] Logout all sessions.
- [x] Current admin bootstrap through `/api/admin/v1/users/me`.
- [x] Protected route guard for authenticated admin pages.
- [x] Public password setup route `/auth/password-setup`.
- [x] Password setup compatibility aliases `/admin/password-setup` and
  `/password-setup`.
- [x] Password reset request route `/password-reset/request`.
- [x] Password reset confirm route `/password-reset/confirm`.
- [x] Password reset compatibility alias `/admin/password-reset`.
- [x] No access or refresh tokens are stored in browser storage.
- [x] Cookie and CSRF request rules are preserved in the shared API client.
- [x] Backend error handling supports canonical `error_code` and compatibility
  `code`.

## Shell And Navigation

- [x] Authenticated root `/` redirects to `/dashboard`.
- [x] App shell shows only implemented destinations.
- [x] Navigation groups are implemented for Overview, Workspace, Access,
  Customers and Session.
- [x] Overview navigation contains `Dashboard` and `Operations`.
- [x] Workspace navigation contains `Settings`.
- [x] Access navigation contains `Security`.
- [x] Access navigation contains permission-aware `Admin Users`.
- [x] Customers navigation contains permission-aware `Tenants`.
- [x] Session navigation contains `Log out`.
- [x] Tenant-scoped links live inside tenant/agent detail flows, not as global
  placeholder navigation.
- [x] Expanded desktop, collapsed desktop and mobile navigation are supported.

## Implemented Routes

- [x] `/login`
- [x] `/auth/password-setup`
- [x] `/admin/password-setup`
- [x] `/password-setup`
- [x] `/admin/password-reset`
- [x] `/password-reset/request`
- [x] `/password-reset/confirm`
- [x] `/`
- [x] `/dashboard`
- [x] `/operations`
- [x] `/settings`
- [x] `/security`
- [x] `/admins`
- [x] `/tenants`
- [x] `/tenants/:tenantId`
- [x] `/tenants/:tenantId/agents`
- [x] `/tenants/:tenantId/agents/new`
- [x] `/tenants/:tenantId/agents/:agentId`
- [x] `/tenants/:tenantId/agents/:agentId/config`
- [x] `/tenants/:tenantId/agents/:agentId/knowledge`
- [x] `/tenants/:tenantId/agents/:agentId/capabilities`
- [x] `/tenants/:tenantId/agents/:agentId/policy`
- [x] `/tenants/:tenantId/agents/:agentId/sites-widgets`
- [x] `/tenants/:tenantId/agents/:agentId/releases`
- [x] `/tenants/:tenantId/conversations`
- [x] `/tenants/:tenantId/usage`
- [x] `/tenants/:tenantId/billing-export`
- [x] `*` not found route

## Settings And Security

- [x] General settings page for language/theme/current admin summary.
- [x] `/security` is a real protected frontend page.
- [x] `/security` is not a redirect to `/settings?tab=security`.
- [x] `/security` reuses active sessions and TOTP panels.
- [x] Active session list.
- [x] Own session revoke.
- [x] TOTP status.
- [x] TOTP enrollment with QR/manual key.
- [x] TOTP confirmation with `enrollment_id`.
- [x] TOTP disable.
- [x] No dedicated backend security endpoint is invented for `/security`.

## Admin Users

- [x] Admin list.
- [x] Search and filtering.
- [x] Safe admin detail.
- [x] Create/invite admin where permitted.
- [x] Resend invite where permitted.
- [x] Disable admin with confirmation.
- [x] Enable admin with confirmation.
- [x] Revoke target admin sessions with confirmation.
- [x] Password setup status display.
- [x] Invite status display.
- [x] TOTP enabled status display.
- [x] Viewer/read-only users cannot mutate through UI controls.
- [x] Raw setup tokens, password hashes, refresh token internals and TOTP
  secrets are not displayed.

## Dashboard And Operations

- [x] `/dashboard` uses backend-owned portal overview read models.
- [x] `/operations` uses backend-owned operations and platform settings read
  models.
- [x] Dashboard cards link only to implemented routes.
- [x] Operations cards link only to implemented routes.
- [x] Loading, empty/low-data and error states are implemented.
- [x] Frontend does not calculate readiness, billing, policy or provider state
  locally.

## Tenants

- [x] Tenant list.
- [x] Tenant detail.
- [x] Tenant provisioning form.
- [x] Required provisioning fields: `tenant_name` and
  `external_customer_ref`.
- [x] Optional provisioning field: `external_billing_ref`.
- [x] Provisioning source defaults to `admin_portal`.
- [x] `provisioning_correlation_id` is generated in model/API layer.
- [x] `idempotency_key` is generated and reused for retry of the same attempt.
- [x] Provisioning status display.
- [x] External customer and billing references display.
- [x] Provisioning audit/correlation summary display.
- [x] Tenant configuration readout.
- [x] Controlled tenant configuration edit flow.
- [x] Backend mutation result/correlation feedback.
- [x] Safe tenant mutation evidence values are copyable where displayed.
- [x] Backend-supported tenant actions require confirmation where needed.
- [x] Primary customer/service onboarding does not use simple system tenant
  create as the main flow.

## Agent Templates And Agents

- [x] Tenant-scoped agent template catalog.
- [x] Template-aware agent creation.
- [x] Tenant-scoped agent list.
- [x] Tenant-scoped agent detail.
- [x] Portal agent read models are the primary list/detail source.
- [x] Agent metadata update where backend action refs allow it.
- [x] Agent status change where backend action refs allow it.
- [x] Agent lifecycle change where backend action refs allow it.
- [x] Active config evidence is visible on Agent Detail when backend read
  models expose it.
- [x] Setup checklist display from backend values.
- [x] Next setup/blocker guidance comes from backend/read-model state.
- [x] Foundation assessment display from backend values.
- [x] Channel binding display from backend values.
- [x] Raw future-stage action refs are not rendered as generic UI actions.

## Agent Config

- [x] Active config inspection.
- [x] Version list.
- [x] Version detail.
- [x] Approved-schema draft state.
- [x] Controlled operator inputs for enum-like config fields: model family,
  latency/quality/cost sensitivity, capabilities, profile, response mode,
  schema version, safety labels, tone, language and toggles.
- [x] `config_schema_version` is shown as read-only/default `1.0` while
  unknown existing backend values remain visible/preserved.
- [x] Preferred capabilities use canonical backend values `chat` and
  `reasoning`.
- [x] Safety labels use canonical backend values `baseline`, `public_widget`
  and `controlled_smoke`.
- [x] Localized labels do not replace canonical payload values.
- [x] Unknown backend option values are shown as current/custom values and are
  not silently dropped.
- [x] Create draft flow.
- [x] Create config version flow through the `/configs` endpoint.
- [x] Backend validation flow.
- [x] Validation guidance makes clear that validation does not activate a
  version.
- [x] Validation result display.
- [x] Activation flow with confirmation/validation evidence.
- [x] Activation shows active config id/version and backend evidence when
  returned.
- [x] Rollback flow with target version confirmation.
- [x] Backend action-ref gating.
- [x] Critical Agent Config mutation evidence remains visible after create
  version, validate, activate and rollback actions.
- [x] Safe mutation evidence values such as config id, version and
  correlation/request id are copyable when shown.
- [x] Missing correlation/request/status/version evidence has a safe explicit
  fallback instead of a generated fake value.
- [x] Raw provider credentials or backend-internal routing overrides are not
  exposed.
- [x] Evidence blocks do not render tokens, secrets, provider keys, internal
  prompts or backend-internal payload details.

## Knowledge And Agent Binding

- [x] Portal knowledge status display.
- [x] Source catalog.
- [x] Source detail.
- [x] Source registration.
- [x] Source metadata update/disable where permitted.
- [x] Document registration.
- [x] Document metadata update/disable where permitted.
- [x] Indexing start.
- [x] Indexing retry.
- [x] Knowledge release-readiness display from backend read models.
- [x] Support-safe chunks/retrieval/support reconstruction drill-downs.
- [x] Agent knowledge binding status.
- [x] Agent knowledge binding update/disable where permitted.
- [x] Cross-tenant source selection is prevented by tenant-scoped contracts.
- [x] No generic upload is promised without a backend endpoint.
- [x] No direct vector DB/provider calls are made from frontend.

## Capabilities And Policy

- [x] Capability catalog.
- [x] Current capability assignments.
- [x] Capability assignment update where permitted.
- [x] Capability readiness/issues display from backend values.
- [x] Policy profile catalog.
- [x] Current policy binding.
- [x] Policy binding update where permitted.
- [x] Backend policy validation.
- [x] Policy validation result display.
- [x] Backend-supported mutation action gating.
- [x] Frontend does not implement policy engine, safety scoring or local
  release readiness logic.

## Sites, Widgets And Releases

- [x] Site/widget portal status.
- [x] Site management where permitted.
- [x] Widget management where permitted.
- [x] Backend-derived install guidance.
- [x] Install guidance does not invent runtime config, model config or policy
  settings.
- [x] Public widget smoke helper uses public widget transport, not admin
  `apiClient`.
- [x] Public widget smoke covers response/evidence display.
- [x] Release readiness display from backend values.
- [x] Release evidence requirements are loaded from the backend portal read
  model on the existing `/tenants/:tenantId/agents/:agentId/releases` route.
- [x] Release setup blockers, evidence status, required change kind, stable
  reference guidance, owner stage and publish evidence requirements render from
  backend metadata.
- [x] Backend-provided smoke cases render as an evidence matrix in backend
  order.
- [x] Templates with no backend-required smoke cases do not show a hardcoded
  sales/support smoke matrix.
- [x] Release list.
- [x] Release detail snapshots.
- [x] Release draft creation.
- [x] Manual override fields and `gate_mode` visibility.
- [x] Release create is blocked in the UI unless explicit evidence is complete
  or backend metadata allows a manual override path.
- [x] Release evidence payload submits backend `required_change_kind`, stable
  reference, pass/fail state and every `evidence.smoke_cases[]` row.
- [x] Release retrieval evidence candidates are loaded from the backend portal
  read model on the existing Releases route.
- [x] Operators can generate/select backend-approved retrieval evidence
  candidates for managed knowledge release evidence.
- [x] Managed retrieval evidence stable references are read-only/candidate-
  backed in the normal release draft path.
- [x] Release draft payload includes backend `release_candidate_id` when a
  retrieval evidence candidate is applied.
- [x] Grounded smoke-case stable references use the selected backend retrieval
  evidence candidate where backend rules require a stable release reference
  match.
- [x] Publish support reconstruction evidence is filled from a compatible
  backend retrieval candidate or release read model when managed retrieval
  evidence is required.
- [x] Historical releases without compatible retrieval evidence show operator
  guidance and remain fail-closed.
- [x] Manual override payload includes backend/default reason code, related
  missing or failed items and optional comment when used.
- [x] Publish action with confirmation.
- [x] Failed releases cannot be published through the normal UI.
- [x] Rollback action with confirmation.
- [x] Disable action with confirmation.
- [x] Release actions display backend mutation result/correlation feedback.
- [x] Release mutation evidence uses neutral missing-field wording and does
  not fabricate correlation ids, statuses or versions.

## Conversations And Support

- [x] Tenant-scoped runtime summary.
- [x] Chat list.
- [x] Chat detail.
- [x] Messages.
- [x] Message detail.
- [x] Turns.
- [x] Turn detail.
- [x] Current memory view where exposed.
- [x] Support evidence refs.
- [x] Approved close action.
- [x] Close action requires confirmation and permission support.
- [x] UI is read-only except approved close action.
- [x] Support-safe fields are used as the display boundary.

## Usage, Metering And Billing Export

- [x] Usage summary.
- [x] Usage detail.
- [x] Model request usage drill-down.
- [x] Chat usage drill-down.
- [x] Conversation turn usage drill-down.
- [x] Metering read model display.
- [x] Billing export status.
- [x] Billing export action where permitted.
- [x] Export failure action where permitted.
- [x] Retry action where permitted.
- [x] Reconciliation action where permitted.
- [x] Export-sensitive actions require confirmation.
- [x] Mutation results show backend correlation/result state.
- [x] Billing export mutations default to `platform_admin` unless backend
  permissions explicitly allow more.
- [x] No frontend pricing, invoice, payment, tax or revenue-recognition logic.

## Architecture And Safety Checks

- [x] New modules follow `src/modules/<Domain>/{api,model,pages,ui}`.
- [x] Module public APIs are exported through `index.ts`.
- [x] API clients and DTO mapping live in module `api/` or model boundary.
- [x] Pages and presentational UI do not call `apiClient` directly.
- [x] Pages and presentational UI do not call `fetch` or `axios` directly for
  admin API traffic.
- [x] Portal read models are primary for summary screens where available.
- [x] No duplicate frontend source of truth for auth/session state.
- [x] No frontend-local readiness, release gate, policy, billing or metering
  calculations.
- [x] No direct DB/vector/provider/internal backend calls.
- [x] No future-stage navigation placeholders.

## Verification Commands

Run from repository root when checking the implemented composition:

```bash
npm run test:admin
npm run lint:admin
npm run build:admin
```

The final accepted baseline recorded:

- `npm run test:admin` passed: 68 files, 269 tests.
- `npm run lint:admin` passed.
- `npm run build:admin` passed.

Optional boundary checks:

```bash
rg "apiClient" apps/admin-panel/src/modules -g '!**/api/**' -g '!**/*.test.ts' -g '!**/*.test.tsx' -n
rg "fetch\\(" apps/admin-panel/src/modules -g '!**/api/**' -g '!**/*.test.ts' -g '!**/*.test.tsx' -n
rg "axios" apps/admin-panel/src/modules -g '!**/api/**' -g '!**/*.test.ts' -g '!**/*.test.tsx' -n
rg "access[_-]?token|refresh[_-]?token|tokenStorage|sessionStorage\\.setItem|localStorage\\.setItem\\([^\\n]*(token|auth|session)" apps/admin-panel/src -n
rg "calculate(Readiness|Billing|Pricing|Price|Invoice|Payment|Tax)|compute(Readiness|Billing|Pricing|Price|Invoice|Payment|Tax)|priceAmount|invoiceAmount|taxAmount|paymentCapture" apps/admin-panel/src -n
```

## Source Of Final Acceptance

- `docs/tz/admin-portal-frontend/pipeline_state.md`
- `docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md`
- `docs/tz/admin-portal-frontend/stages/*.md`
