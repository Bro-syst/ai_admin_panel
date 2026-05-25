# Admin Portal Frontend Acceptance Checklist

Status: `accepted`

This checklist is the acceptance gate checklist for the Admin Portal frontend
umbrella. The umbrella was finalized and accepted after Stage 13 and the Stage
01 public export fix-pass.

Current implemented scope is summarized in:

- `apps/admin-panel/docs/implemented-functionality-checklist.md`
- `apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md`

## Global Acceptance

- [x] Admin Portal remains internal operator-only.
- [x] No customer self-service scope is implemented.
- [x] No generic CRUD shell replaces scenario-specific workflows.
- [x] Existing auth/session/password/TOTP flows still work.
- [x] No access/refresh tokens are stored in browser storage.
- [x] Cookie/CSRF request rules are preserved.
- [x] All new routes are protected unless explicitly public auth/password pages.
- [x] No future-stage navigation placeholders exist.
- [x] Portal read models are primary for summary screens.
- [x] Frontend does not calculate readiness, release gate, policy, metering or
  billing state locally.
- [x] No direct DB/vector/provider/internal backend calls exist.
- [x] API/DTO mapping stays in `api/` or `model/`, not pages/UI.
- [x] New modules use `src/modules/<Domain>/{api,model,pages,ui}` and
  `index.ts`.
- [x] `pages` and `ui` do not call `apiClient` directly.

## Screen Acceptance

### Login / Security

- [x] Login works.
- [x] Refresh/logout/logout-all work.
- [x] `/users/me` bootstrap remains accepted current implementation.
- [x] `/security` is a real protected frontend page.
- [x] `/security` reuses sessions and TOTP panels.
- [x] `/security` is not a redirect to `/settings?tab=security`.
- [x] No dedicated backend security endpoint is required or invented.
- [x] `/settings` remains general settings.
- [x] Password setup/reset routes and aliases work.
- [x] TOTP secret/manual key is not persisted after completion.

### Admin Users

- [x] Admin list loads.
- [x] Search/filter work.
- [x] Safe detail view exists.
- [x] Create/invite works where permitted.
- [x] Resend invite works where permitted.
- [x] Disable/enable confirmations work.
- [x] Revoke sessions confirmation works.
- [x] Viewer/read-only user cannot mutate.
- [x] Raw setup tokens, password hashes, refresh token internals and TOTP
  secrets are not shown.

### Dashboard / Operations

- [x] Dashboard uses backend read model.
- [x] Operations uses backend read model.
- [x] Cards link to resolving screens.
- [x] Empty/error states are useful.
- [x] Root `/` redirects to `/dashboard` only after dashboard is implemented and
  tested.

### Tenants

- [x] Tenant list/detail load.
- [x] Provisioning wizard has required `tenant_name` and
  `external_customer_ref`.
- [x] Optional `external_billing_ref` is supported.
- [x] `provisioning_correlation_id` is generated in model/API layer.
- [x] `idempotency_key` is generated and reused for retry.
- [x] Provisioning status and audit summary show backend values.
- [x] Backend validation errors are visible.
- [x] Primary onboarding does not use simple system tenant create.

### Agents

- [x] Template catalog/detail load.
- [x] Agent creation is template-aware.
- [x] Agent list/detail load from portal read models where available.
- [x] Allowed edit/status/lifecycle actions work.
- [x] Setup checklist/foundation/channel states display backend values.
- [x] No single-bot or AML-specific frontend runtime branch exists.

### Agent Config

- [x] Active config and version list load.
- [x] Draft/create flow works.
- [x] Editable schema is limited to accepted fields.
- [x] Validate result is shown.
- [x] Activate works with confirmation where needed.
- [x] Rollback confirmation includes target version.
- [x] Raw provider routing override is not exposed.

### Knowledge

- [x] Source registration works.
- [x] Source list/detail load.
- [x] Document registration/list/detail load.
- [x] Indexing start/list/retry work.
- [x] Readiness uses backend values.
- [x] Access scope and allowed agent scope are visible/editable where allowed.
- [x] Restricted visibility and approval state are handled.
- [x] Agent binding prevents cross-tenant selection.
- [x] No generic upload is promised without backend endpoint.

### Capabilities / Policy

- [x] Capability catalog loads.
- [x] Assignments load/update.
- [x] Risk/policy/metering markers show where returned.
- [x] Policy profile catalog loads.
- [x] Policy binding load/update works.
- [x] Policy validation result shows backend outcome.
- [x] Frontend does not implement safety logic locally.

### Sites / Widgets

- [x] Site list/detail/create/status flows work where permitted.
- [x] Widget list/detail/create/status flows work where permitted.
- [x] Widget binding to agent/site works where permitted.
- [x] Install guidance is backend-owned/backend-derived.
- [x] Snippet display does not invent runtime config or policy/model settings.
- [x] Public widget smoke helper uses `/api/v1/widget/*`, not admin cookies.
- [x] Smoke covers invalid key, invalid origin, not-ready, throttled and normal
  message flow.

### Releases

- [x] Release list/detail load.
- [x] Draft creation works.
- [x] Readiness checklist uses backend values.
- [x] Evidence path works.
- [x] Manual override path supports required fields.
- [x] `gate_mode` and manual override state display where returned.
- [x] Publish/rollback/disable confirmations include version, status, gate mode
  and active marker.
- [x] UI does not claim real customer launch without external evidence.

### Conversations / Support

- [x] Chat list/detail load.
- [x] Messages and turns load.
- [x] Current memory view loads where exposed.
- [x] Runtime summary uses portal read model.
- [x] Close chat is the only mutation unless future contract allows more.
- [x] Support-safe data only; no secrets/internal prompts unless backend marks
  them support-safe.

### Usage / Billing

- [x] Usage summary/detail load.
- [x] Model/chat/turn usage load.
- [x] Metering read model loads.
- [x] Billing export status loads.
- [x] Export mutations follow permissions, defaulting to `platform_admin`.
- [x] Export-sensitive actions require confirmation.
- [x] Correlation/result state appears after mutations.
- [x] No pricing, invoice, payment or tax logic exists in frontend.

## Required Test Coverage

- [x] Router tests for each new protected route.
- [x] API mapping tests for unstable/new payloads.
- [x] Model/hook tests for mutation refresh and generated attempt ids.
- [x] Page/component tests for loading, empty, ready, error, permission denied
  and not found states.
- [x] Auth/security regression tests when touched.
- [x] No token storage smoke/test evidence.
- [x] Widget smoke states.

## Stage 13 Evidence Snapshot

- Stages 01-12 are accepted and docs-synced in `pipeline_state.md`.
- `adminPortalFinalSmoke.test.tsx` verifies the shipped route surface, the
  protected tenant -> agent -> knowledge/capability/policy -> widget ->
  release -> conversations/usage/billing route journey, and authenticated `/`
  -> `/dashboard`.
- API/DTO mapping, model orchestration, UI state and confirmation coverage is
  distributed across module-local tests for every accepted module.
- Forbidden transport searches verify module pages/UI/model do not call
  `apiClient`, `fetch` or `axios` directly outside accepted API owners.
- Token-storage evidence verifies no access/refresh token browser storage.
- Forbidden direct-call evidence verifies no frontend runtime DB/vector/model
  provider/internal backend clients.

## Final Commands

From repo root:

```bash
npm run test:admin
npm run lint:admin
npm run build:admin
```

If any command is omitted, the reason must be recorded in `pipeline_state.md`.
