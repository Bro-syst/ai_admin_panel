# Urgent Stage: Release Evidence Requirements UI

Status: `accepted-docs-synced`

## Goal

Make the existing tenant -> agent -> Releases screen consume backend-owned
release evidence requirements so an operator can prepare a sales qualification
smoke release without guessing required evidence, smoke cases, manual override
rules or publish evidence expectations.

This is a post-finalization urgent frontend stage. It does not reopen the
accepted 13-stage umbrella and must not create `stage_14`.

## Dependencies

- Umbrella Admin Portal frontend TZ is accepted.
- Stages 01-13 are implemented, accepted and docs-synced/not required.
- Stage 10 Sites/Widgets/Releases remains the baseline for route/module/API
  ownership.
- Source urgent TZ:
  `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_RELEASE_EVIDENCE_REQUIREMENTS_UI_TZ.md`.
- Backend source material is read-only:
  `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/tz/TZ-SVC-9_admin_portal_release_evidence_and_operator_flow_closure.md`.
- Backend handoff is read-only:
  `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/tz/TZ-SVC-9_admin_portal_release_evidence_and_operator_flow_closure/handoff.md`.
- Prompt 03 must accept this urgent stage before runtime implementation starts.

## Exact Scope

- Keep the existing release route:
  `/tenants/:tenantId/agents/:agentId/releases`.
- Add frontend consumption of backend release evidence requirements.
- Render release setup gate status, blocking items, evidence status,
  required change kind, stable reference rules, manual override state, required
  smoke cases, publish evidence requirements and last checked metadata.
- Replace the current single smoke-case evidence path with a backend-provided
  smoke-case matrix.
- Submit the full structured release evidence payload:
  - backend-provided `evidence.change_kind`;
  - release evidence stable reference;
  - explicit pass/fail evidence state;
  - all `evidence.smoke_cases[]` rows;
  - manual override fields when backend allows override.
- Disable/block create actions in the UI when neither complete explicit
  evidence nor allowed manual override is present.
- Keep backend release create/publish/rollback/disable as final authority.
- Improve release mutation evidence missing optional field wording only inside
  Releases.
- Add i18n for known backend label/description keys and safe fallback for
  unknown keys.

## Out Of Scope

- New route or global navigation item.
- Moving release evidence UI/state into Agent Detail, Policy, Sites/Widgets,
  Knowledge, Capabilities or Agent Config.
- Policy binding behavior changes.
- Sites/widgets smoke behavior changes.
- Backend endpoint implementation.
- Draft validation endpoint calls not defined by backend TZ-SVC-9.
- Frontend-local release readiness or release gate calculation.
- Frontend-local smoke-case catalog.
- Public widget runtime identity changes.
- Direct DB/vector/provider/internal backend calls.
- Broad shared package extraction.

## Routes / Navigation Impact

- No new route.
- `/tenants/:tenantId/agents/:agentId/releases` remains the only release route.
- Adjacent screens may continue linking to `/releases`.
- No release evidence widget/panel may be added to Agent Detail, Policy,
  Sites/Widgets, Knowledge, Capabilities or Agent Config.

## Module / File Ownership

Allowed runtime write scope:

- `src/modules/Releases/api/releasesApi.ts`
- `src/modules/Releases/model/useReleasesManager.ts`
- `src/modules/Releases/ui/ReleasesView.tsx`
- `src/modules/Releases/pages/ReleasesPage.tsx`
- `src/core/i18n/messages.ts`
- focused tests for Releases and route safety:
  - `src/modules/Releases/api/releasesApi.test.ts`
  - `src/modules/Releases/model/useReleasesManager.test.ts`
  - `src/modules/Releases/ui/ReleasesView.test.tsx`
  - `src/core/router/routes.test.tsx`

Any shared UI change must be narrow, immediately reused and justified in
implementation notes.

## Reuse Rules And Responsibility Boundaries

- `src/modules/Releases/api` owns endpoint calls and DTO/result mapping.
- `src/modules/Releases/model` owns loading, draft state, evidence matrix form
  state, manual override form state and submit payload assembly.
- `src/modules/Releases/ui` owns release evidence requirements rendering,
  smoke-case matrix, disabled reasons, operator guidance and mutation evidence
  presentation.
- Pages/UI do not call `apiClient`, `fetch` or `axios` directly for admin
  backend traffic.
- Frontend may do pre-submit completeness checks, but backend remains
  authoritative for release creation and evidence validation.
- Frontend must preserve unknown backend values in safe fallback UI.
- Submitted values must be canonical backend values, not localized labels.
- Do not define a frontend smoke-case catalog or hardcode sales/support
  requirements outside known i18n key labels.

## API Contracts

Add frontend consumption of:

- `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/release-evidence-requirements`

Keep existing release endpoints:

- `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/release-readiness`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/releases`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/releases/{release_id}`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/releases`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/releases/{release_id}/publish`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/releases/{release_id}/rollback`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/releases/{release_id}/disable`

Required evidence requirements fields:

- `agent_id`
- `template_id`
- `release_setup_ready`
- `release_setup_blocking_items`
- `evidence_required`
- `evidence_status`
- `required_change_kind`
- `stable_reference_rule`
- `stable_reference_prefix`
- `required_smoke_cases`
- `manual_override`
- `publish_evidence_requirements`
- `last_checked_at`
- `owner_stage`

## UI/UX States

- Loading, empty, error and retry states remain visible for release data.
- Create controls wait for release readiness and evidence requirements.
- Release setup blockers are shown from backend data.
- Evidence requirements are shown in operator-readable language.
- Backend `required_smoke_cases` render as a matrix in backend order.
- Templates with empty `required_smoke_cases=[]` do not show a sales/support
  matrix.
- Stable reference guidance uses backend `stable_reference_prefix` and
  `stable_reference_rule`.
- `stable_reference_must_match_release_reference` is enforced as a
  pre-submit UX guard only.
- Manual override is labelled as override, not successful evidence.
- Manual override defaults come from backend metadata.
- Publish controls explain backend-provided publish evidence requirements.
- Failed releases cannot be published through the normal UI.
- Missing optional mutation evidence uses neutral copy such as
  `Не передано backend`, not alarming success-state wording.

## Localization Requirements

- Known backend `label_key` and `description_key` values are localized through
  `src/core/i18n/messages.ts`.
- Unknown backend keys remain visible through safe fallback text.
- Minimum labels cover:
  - release evidence requirements section;
  - evidence status values;
  - required change kind values;
  - stable reference rule values;
  - known `sales_support.*` smoke case keys;
  - manual override allowed/blocked states;
  - manual override blocked reasons;
  - publish evidence fields/descriptions;
  - neutral missing optional backend evidence.

## Access / Security Requirements

- Existing protected admin route behavior remains intact.
- Existing permission/action-ref gating remains authoritative.
- Release mutations stay CSRF-protected through the existing API layer.
- Manual override controls are enabled only according to backend state and
  existing mutation permissions.
- Do not render tokens, secrets, provider keys, internal prompts or backend
  internal payloads.
- Public widget runtime identity remains separate from Admin Portal cookies.

## Tests And Verification Commands

Required tests:

- `getEvidenceRequirements` calls the new portal endpoint.
- API mapper handles required smoke cases, manual override and publish
  evidence requirements.
- `toEvidencePayload` sends every `evidence.smoke_cases[]` item.
- Draft payload uses backend-provided `required_change_kind`.
- Release manager loads evidence requirements with readiness and releases.
- Release screen renders smoke cases from backend data.
- Release create is blocked without complete evidence or allowed manual
  override.
- Manual override payload includes reason code, related missing/failed items
  and comment.
- Manual override form uses backend defaults.
- Failed release publish is disabled.
- Publish evidence requirements render from backend metadata.
- Mutation evidence uses neutral missing optional field copy.
- No new release route is introduced.

Verification commands:

```bash
npm run test:admin -- Releases
npm run test:admin
npm run lint:admin
npm run build:admin
```

Boundary searches:

```bash
rg -n "apiClient|fetch\\(|axios" apps/admin-panel/src/modules/Releases apps/admin-panel/src/modules/Agents apps/admin-panel/src/modules/AgentPolicy apps/admin-panel/src/modules/SitesWidgets apps/admin-panel/src/modules/Knowledge apps/admin-panel/src/modules/AgentCapabilities apps/admin-panel/src/modules/AgentConfig
rg -n "release-evidence|smoke_cases|required_smoke_cases|manual_override" apps/admin-panel/src/modules
```

## Docs Impact

After acceptance, update only implemented behavior:

- `apps/admin-panel/docs/implemented-functionality-checklist.md`
- `apps/admin-panel/docs/overview.md`
- `apps/admin-panel/docs/architecture.md`
- `apps/admin-panel/docs/development-guide.md`
- `apps/admin-panel/docs/recipes.md`
- `apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_RELEASE_EVIDENCE_REQUIREMENTS_UI_TZ.md`
- `apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md`

Update root docs only if workspace/package/multi-app rules change.
Do not edit backend docs from this frontend task.

## Acceptance Criteria

- Existing route `/tenants/:tenantId/agents/:agentId/releases` remains the only
  release route.
- Release screen loads and displays backend release evidence requirements.
- Smoke-case matrix is rendered from backend data.
- Full `evidence.smoke_cases[]` payload is submitted.
- `evidence.change_kind` uses backend `required_change_kind`.
- Manual override defaults and blocked reason come from backend metadata.
- Release creation is blocked in UI when neither evidence nor allowed manual
  override is complete.
- Backend remains final authority for release create and publish.
- Publish UI explains backend-provided publish evidence requirements.
- Failed releases cannot be published through normal UI.
- No release evidence logic is added to Agent Detail, Policy, Sites/Widgets,
  Knowledge, Capabilities or Agent Config.
- `npm run test:admin`, `npm run lint:admin` and `npm run build:admin` pass or
  omissions are justified in acceptance review.

## Future-Stage Forbidden Actions

- Do not reopen the accepted 13-stage umbrella scope as `stage_14`.
- Do not add customer portal scope.
- Do not add backend endpoint implementation.
- Do not add public widget runtime behavior changes.
- Do not add local readiness/release/policy/model-routing calculations.
- Do not introduce broad shared package extraction.
- Do not document release evidence requirements as implemented before prompt
  05 acceptance and prompt 06 docs sync.

## Expected Gate Result

- Prompt 03 verifies this urgent stage against accepted umbrella scope, Stage
  10 ownership and architecture boundaries.
- Prompt 04 may implement this urgent stage only after prompt 03 accepts it.
- Prompt 05 must review the urgent implementation before docs sync.
- Prompt 06 must sync app docs and mark the urgent stage accepted or blocked.
