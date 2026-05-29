# Urgent Release Evidence Requirements UI TZ

Status: `accepted-docs-synced`

Docs sync:
- Accepted urgent behavior is implemented and documented in
  `apps/admin-panel/docs/implemented-functionality-checklist.md` and app docs.
- No deferred items.
- No blocked findings.

## Source Material

Backend TZ:
- `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/tz/TZ-SVC-9_admin_portal_release_evidence_and_operator_flow_closure.md`

Frontend handoff:
- `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/tz/TZ-SVC-9_admin_portal_release_evidence_and_operator_flow_closure/handoff.md`

Accepted Admin Portal frontend umbrella baseline:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/stage_10_sites_widgets_releases.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md`

## Goal

Update the existing Admin Portal release screen so an operator can complete
release evidence for a sales qualification smoke without guessing backend
release-gate requirements.

The frontend must consume the backend-owned release evidence requirements read
model, render the required evidence matrix, submit the full structured evidence
payload, and show backend-provided gate status/reasons before release creation.

This is a post-finalization urgent frontend TZ. It does not reopen the accepted
13-stage umbrella and must not create `stage_14`.

## Target App And Route

Target app:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel`

Existing route to update:
- `/tenants/:tenantId/agents/:agentId/releases`

Do not add a new route.

## Primary Runtime Files

Only the existing release module and i18n should be changed unless tests prove a
narrow shared UI helper is required.

- `src/modules/Releases/api/releasesApi.ts`
- `src/modules/Releases/model/useReleasesManager.ts`
- `src/modules/Releases/ui/ReleasesView.tsx`
- `src/modules/Releases/pages/ReleasesPage.tsx`
- `src/core/i18n/messages.ts`

Primary tests:
- `src/modules/Releases/api/releasesApi.test.ts`
- `src/modules/Releases/model/useReleasesManager.test.ts`
- `src/modules/Releases/ui/ReleasesView.test.tsx`
- `src/core/router/routes.test.tsx`

## No-Regression Boundary

Do not move release evidence UI or release evidence state into:
- `src/modules/Agents`;
- `src/modules/AgentPolicy`;
- `src/modules/SitesWidgets`;
- `src/modules/Knowledge`;
- `src/modules/AgentCapabilities`;
- `src/modules/AgentConfig`.

Adjacent screens may continue linking to `/releases`, but release evidence
logic belongs only to `src/modules/Releases`.

Policy and Sites/Widgets are setup dependencies, not implementation scope for
this TZ. Do not change policy binding behavior or site/widget smoke behavior
for this task.

## Existing Code-Grounded Gaps

Current frontend state in `src/modules/Releases`:

- `loadReleases` loads:
  - portal agent detail;
  - `release-readiness`;
  - release list;
  - selected release detail.
- `loadReleases` does not load:
  - `release-evidence-requirements`.
- `ReleaseEvidenceInput` supports only one `smokeCaseId`.
- `toEvidencePayload` submits at most one `evidence.smoke_cases[]` item.
- `ReleaseDraftForm` hardcodes `evidenceChangeKind: 'runtime_behavior'`.
- `buildReleaseDraftInput` can build only one smoke case.
- `ReleasesView` exposes only selected config id, evidence reference and manual
  override fields.
- `ReleasesView` does not render backend-provided smoke-case matrix.
- `ReleasesView` does not show publish evidence requirement labels/help text
  from backend-provided requirement metadata.

These gaps are the accepted implementation scope.

## Backend Contracts

Add frontend consumption of the new portal read endpoint:

- `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/release-evidence-requirements`

Keep using existing release endpoints:

- `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/release-readiness`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/releases`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/releases/{release_id}`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/releases`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/releases/{release_id}/publish`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/releases/{release_id}/rollback`
- `POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/releases/{release_id}/disable`

Do not add alternate frontend routes or alternate release evidence endpoints.
Do not call a draft validation endpoint; backend TZ-SVC-9 does not define one.

## Release Evidence Requirements Read Model

The frontend must map and expose these top-level fields:

- `agent_id`;
- `template_id`;
- `release_setup_ready`;
- `release_setup_blocking_items`;
- `evidence_required`;
- `evidence_status`;
- `required_change_kind`;
- `stable_reference_rule`;
- `stable_reference_prefix`;
- `required_smoke_cases`;
- `manual_override`;
- `publish_evidence_requirements`;
- `last_checked_at`;
- `owner_stage`.

Each `required_smoke_cases` item:

- `case_id`;
- `required`;
- `grounded_reference_required`;
- `stable_reference_must_match_release_reference`;
- `label_key`;
- `description_key`.

`manual_override`:

- `allowed`;
- `blocked_reason`;
- `default_reason_code`;
- `related_missing_or_failed_items_default`.

Each `publish_evidence_requirements` item:

- `field`;
- `required`;
- `label_key`;
- `description_key`.

DTO mapping belongs in `src/modules/Releases/api/releasesApi.ts`, not in pages
or UI.

## UI Requirements

The release screen must:

- load release readiness and release evidence requirements before showing create
  controls;
- render backend-provided release setup gate status and blocking items;
- render backend-provided `evidence_status`, `required_change_kind`,
  `stable_reference_rule`, `stable_reference_prefix`, `last_checked_at` and
  `owner_stage` in operator-readable form;
- render `required_smoke_cases` as an evidence matrix in backend-provided order;
- allow the operator to mark each required case passed/failed;
- allow stable reference and outcome per case where needed;
- guide the release evidence stable reference with `stable_reference_prefix`
  when backend returns it;
- enforce `stable_reference_must_match_release_reference` as pre-submit UX
  guard only;
- disable explicit evidence submission when backend does not return
  `required_change_kind`;
- show backend-provided gate reason/manual override state when release creation
  is disabled;
- submit `evidence.change_kind` from backend-provided `required_change_kind`;
- submit `evidence.stable_reference` from the release evidence reference input;
- submit `evidence.passed` from explicit evidence path state;
- submit all `evidence.smoke_cases[]` entries, not one selected case;
- support manual override with:
  - `reason_code`;
  - `related_missing_or_failed_items`;
  - optional `comment`;
- prefill manual override defaults from backend when available:
  - `manual_override.default_reason_code`;
  - `manual_override.related_missing_or_failed_items_default`;
- label manual override as manual override, not evidence success;
- disable/block release creation unless complete explicit evidence or allowed
  manual override is present;
- continue displaying release status, gate mode, active marker and manual
  override state from backend release read models;
- disable publish for failed releases;
- use backend-provided `publish_evidence_requirements` to explain publish
  evidence fields and required/optional state.

For templates where `required_smoke_cases=[]`, the UI must not show a
sales/support smoke-case matrix. It must still show backend-provided gate state
and allow the generic evidence/manual override path only when backend metadata
allows it.

## Localization Requirements

Render backend `label_key` and `description_key` through frontend i18n keys.
Do not show raw keys as primary operator text when the key is known.

Minimum i18n coverage:

- release evidence requirements section title;
- evidence status values;
- required change kind values;
- stable reference rule values;
- smoke case labels and descriptions for backend `sales_support.*` keys;
- manual override allowed/blocked labels;
- manual override blocked reason labels;
- publish evidence field labels/descriptions;
- neutral mutation/evidence missing text such as `Не передано backend`.

Unknown backend keys must remain visible in a safe fallback form, not crash the
screen.

## Mutation Evidence Requirements

Release mutation responses must continue to show:

- action;
- resource type;
- resource id;
- tenant/agent/config/release ids when backend returns them;
- status/version when backend returns them;
- timestamp;
- correlation id or request id;
- copy buttons for safe ids and correlation/request id.

If an optional backend field is absent:

- hide it or show neutral text such as `Не передано backend`;
- do not show alarming wording such as `не вернулся` on successful actions;
- never fabricate correlation ids, versions or statuses.

This TZ does not authorize a cross-module mutation evidence refactor outside
`Releases`.

## Frontend / Backend Responsibility Boundary

Frontend must not:

- define its own sales/support smoke-case catalog;
- hardcode `sales_support.*` requirements;
- calculate release readiness locally;
- calculate release gate state locally;
- infer `required_change_kind`;
- infer manual override eligibility;
- weaken backend release gates;
- use admin cookies as public widget visitor identity;
- call direct DB/vector/provider/internal backend endpoints.

Frontend may:

- use backend-returned requirement metadata for display and pre-submit UX
  completeness checks;
- prevent obviously incomplete submission before hitting backend;
- localize backend-provided keys;
- preserve unknown backend values in safe fallback UI.

Backend remains authoritative for release creation, publish, rollback, disable,
authorization and evidence validation.

## Access / Security Requirements

- Route stays protected through existing admin auth.
- Release mutations remain permission-aware and CSRF-protected through the
  existing API layer.
- Mutating controls must explain read-only/permission-disabled state.
- Manual override controls must be visible/enabled only according to
  backend-provided state and existing mutation permission.
- Do not render tokens, secrets, provider keys, internal prompts or backend
  internal payloads.

## Implementation Plan

1. Extend `releasesApi.ts`.
   - Add types and mapper for release evidence requirements.
   - Add `getEvidenceRequirements(tenantId, agentId)`.
   - Change `ReleaseEvidenceInput` from single smoke case to array of smoke
     cases.
   - Change `toEvidencePayload` to submit all smoke cases.
   - Preserve existing release readiness/list/detail/lifecycle mappings.

2. Extend `useReleasesManager.ts`.
   - Load evidence requirements together with readiness and releases.
   - Initialize draft form from backend requirements:
     - `evidenceChangeKind` from `required_change_kind`;
     - manual override defaults from `manual_override`;
     - smoke case form rows from `required_smoke_cases`.
   - Add derived state for:
     - explicit evidence completeness;
     - manual override availability/completeness;
     - create disabled reason.
   - Do not calculate backend readiness; only check whether the current form is
     complete enough to submit.

3. Extend `ReleasesView.tsx`.
   - Add release evidence requirements panel.
   - Add smoke-case matrix.
   - Add manual override section with backend defaults and blocked reason.
   - Add publish evidence requirements help text.
   - Disable publish for failed releases.
   - Keep existing route, list, detail and lifecycle action layout.

4. Update `messages.ts`.
   - Add release evidence, smoke case, manual override, publish evidence and
     neutral missing-field labels.

5. Update tests.
   - Add API mapper/endpoint tests.
   - Add manager load/default/submit payload tests.
   - Add UI tests for matrix, manual override, disabled create and failed
     publish.

## Tests And Verification Commands

Required focused tests:

- `releasesApi.getEvidenceRequirements` calls
  `/api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/release-evidence-requirements`;
- API mapper handles:
  - `required_smoke_cases`;
  - `manual_override`;
  - `publish_evidence_requirements`;
- `toEvidencePayload` sends every `evidence.smoke_cases[]` item;
- `buildReleaseDraftInput` uses backend-provided `required_change_kind`;
- release manager loads evidence requirements together with readiness;
- release screen renders smoke cases from backend `required_smoke_cases`;
- release create is disabled/blocked without complete evidence or allowed
  manual override;
- manual override payload includes reason code, related missing/failed items
  and comment;
- manual override form uses backend-provided defaults;
- failed release cannot be published through normal UI;
- publish evidence requirements are rendered from backend metadata;
- release mutation evidence uses neutral missing optional field copy.

Final gate commands:

```bash
npm run test:admin
npm run lint:admin
npm run build:admin
```

Focused implementation commands may use:

```bash
npm run test:admin -- Releases
```

## Documentation Impact

After acceptance, sync only docs that describe implemented behavior:

- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/overview.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/architecture.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/development-guide.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/recipes.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/implemented-functionality-checklist.md`

Do not edit backend docs from this frontend task.

## Acceptance Criteria

- Existing route `/tenants/:tenantId/agents/:agentId/releases` remains the only
  release route.
- Release screen loads and displays backend release evidence requirements.
- Sales qualification release evidence matrix is rendered from backend data.
- Full `evidence.smoke_cases[]` payload is submitted.
- `evidence.change_kind` uses backend `required_change_kind`.
- Manual override defaults and blocked reason come from backend metadata.
- Release creation is blocked in UI when neither evidence nor allowed manual
  override is complete.
- Backend still remains the final authority for release create/publish.
- Publish UI explains backend-provided publish evidence requirements.
- Failed releases cannot be published through normal UI.
- No release evidence logic is added to Agent Detail, Policy, Sites/Widgets,
  Knowledge, Capabilities or Agent Config.
- `npm run test:admin`, `npm run lint:admin` and `npm run build:admin` pass or
  any omission is explicitly justified in acceptance review.

## Open Questions

- none

## Suggested Next Pipeline Step

Because the accepted Admin Portal umbrella is already finalized, do not run the
normal 13-stage decomposition again.

Suggested next step:
- run urgent prompt 03 consistency review for:
  `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_release_evidence_requirements_ui.md`.

Final implementation should run as a post-finalization urgent stage, not as
`stage_14`.
