# Urgent Stage: Release Retrieval Evidence Operator Flow

Status: `accepted-docs-synced`

## Goal

Close the remaining operator gap on the existing Releases screen by consuming
backend-approved retrieval evidence candidates. The operator must be able to
generate/select retrieval evidence, create a release draft from that candidate,
and publish with backend support reconstruction evidence instead of manually
inventing technical references.

This is a post-finalization urgent frontend stage. It does not reopen the
accepted 13-stage umbrella and must not create `stage_14`.

## Dependencies

- Umbrella Admin Portal frontend TZ is accepted and finalized.
- Stages 01-13 are implemented, accepted and docs-synced/not required.
- Stage 10 Sites/Widgets/Releases remains the baseline for release route and
  module ownership.
- Urgent Release Evidence Requirements UI is accepted and docs-synced.
- Runtime provider preflight and runtime usage evidence candidate UI are
  accepted baseline behavior to preserve.
- Source urgent TZ:
  `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_RELEASE_RETRIEVAL_EVIDENCE_OPERATOR_FLOW_TZ.md`.
- Backend source TZ is read-only:
  `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/tz/TZ-SVC-10_release_retrieval_evidence_operator_flow/FRONTEND_RELEASE_SCREEN_RETRIEVAL_EVIDENCE_TZ.md`.
- Prompt 03 must accept this urgent stage before runtime implementation starts.

## Exact Scope

- Keep the existing route:
  `/tenants/:tenantId/agents/:agentId/releases`.
- Add frontend API/model/UI support for release retrieval evidence candidate
  read/create endpoints.
- Render a `Retrieval evidence релиза` block on the Releases screen.
- Let the operator generate a backend retrieval evidence candidate.
- Let the operator select/apply a candidate to the release draft form.
- Make managed retrieval evidence stable references candidate-backed,
  read-only/disabled in the normal path.
- Fill grounded smoke case stable references from selected backend candidate
  where backend rules require a release reference match.
- Include backend `release_candidate_id` in release draft creation.
- Fill publish support reconstruction reference from backend candidate/read
  model where available.
- Preserve existing runtime usage evidence candidate flow for usage IDs.
- Localize known retrieval candidate reasons and backend errors.

## Out Of Scope

- New route, global navigation item or `stage_14`.
- Moving release retrieval evidence UI/state into Agent Detail, Knowledge,
  Policy, Capabilities, Sites/Widgets or Agent Config.
- Backend endpoint implementation.
- Provider/model/secret/API key UI.
- Runtime usage evidence redesign.
- Billing export or release report candidate automation.
- Frontend-local release readiness, release gate, policy, billing, metering,
  pricing or model-routing calculation.
- Direct DB/vector/provider/internal backend calls.
- Hardcoded local tenant IDs, agent IDs, widget keys, release IDs, config IDs,
  localhost URLs or manual smoke fixtures.

## Routes / Navigation Impact

- No new route.
- Existing `/tenants/:tenantId/agents/:agentId/releases` remains the only route
  touched.
- Adjacent screens may keep their current links to Releases.
- No global menu change.

## Module / File Ownership

Allowed runtime write scope:

- `src/modules/Releases/api/releasesApi.ts`
- `src/modules/Releases/model/useReleasesManager.ts`
- `src/modules/Releases/ui/ReleasesView.tsx`
- `src/modules/Releases/pages/ReleasesPage.tsx`, only for wiring if needed
- `src/core/i18n/messages.ts`
- focused tests:
  - `src/modules/Releases/api/releasesApi.test.ts`
  - `src/modules/Releases/model/useReleasesManager.test.ts`
  - `src/modules/Releases/model/useReleasesManager.flow.test.tsx`
  - `src/modules/Releases/ui/ReleasesView.test.tsx`
  - `src/core/router/routes.test.tsx`, only for no-route-regression proof
- `docs/tz/admin-portal-frontend/pipeline_state.md`

Any shared UI change must be narrow, immediately reused and justified.

## Reuse Rules And Responsibility Boundaries

- `src/modules/Releases/api` owns endpoint calls, DTO mapping and safe defaults.
- `src/modules/Releases/model` owns loading, selection, generation,
  candidate application, draft payload assembly and publish form source values.
- `src/modules/Releases/ui` owns retrieval evidence block rendering, disabled
  reasons, candidate-safe presentation and operator guidance.
- Pages/UI do not call `apiClient`, `fetch` or `axios` directly for admin
  backend traffic.
- Frontend may do pre-submit completeness guards, but backend remains
  authoritative for candidate eligibility, release create and publish.
- Localized labels are display-only and must never be submitted as backend
  values.
- Unknown backend values are preserved safely and must not unlock create or
  publish.

## API Contracts

Add frontend consumption of:

```text
GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/release-retrieval-evidence-candidates
POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/release-retrieval-evidence-candidates
```

Frontend methods:

- `getRetrievalEvidenceCandidates(tenantId, agentId)`
- `createRetrievalEvidenceCandidate(tenantId, agentId, input)`

Candidate safe fields:

- `candidate_id`
- `release_candidate_id`
- `retrieval_run_id`
- `stable_reference`
- `support_reconstruction_reference`
- `selected_config_id`
- `outcome`
- `source_ids`
- `index_id`
- `index_version_id`
- `source_set_key`
- `source_set_readiness_marker`
- `selected_chunk_count`
- `citation_count`
- `created_at`
- `status`
- `problems`

Summary fields:

- `candidate_count`
- `ready`
- `no_candidate_reason`
- `required_action`
- `problems`
- `generated_at`

Create input:

- `selected_config_id`
- `release_candidate_id`
- `idempotency_key`

Keep existing release endpoints and release evidence requirements endpoints.

## UI/UX States

- Loading: `Загрузка retrieval evidence...`.
- No candidates: show backend reason/required action and action
  `Сформировать retrieval evidence`.
- Known no-candidate reasons are localized:
  - `missing_selected_config`
  - `managed_knowledge_not_required`
  - `managed_knowledge_not_ready`
  - `no_retrieval_evidence_candidate`
  - `candidate_generation_failed`
  - `candidate_source_unavailable`
- Unknown no-candidate reason is shown safely and does not enable create.
- Candidate list renders selectable cards/radio rows using safe fields only.
- Default selection chooses newest compatible candidate when current selection
  is empty or stale.
- Generation shows progress and actionable errors.
- Successful generation selects/applies the returned candidate.
- `evidenceStableReference` is read-only/disabled for managed knowledge path.
- Grounded smoke stable references are read-only/autofilled from selected
  candidate when backend rules require match.
- Existing manual "copy reference into checks" action becomes
  `Подставить retrieval evidence в проверки с базой знаний` and uses only the
  selected backend candidate.
- Publish support reconstruction reference is read-only/autofilled when a
  compatible candidate exists.
- Candidate-to-release compatibility must be proven before autofilling publish
  support reconstruction:
  - use backend release detail/list support or release candidate fields if the
    backend returns them;
  - otherwise match by selected release `evidenceReference` and candidate
    `stableReference`, or by candidate id stored from a just-created draft in
    current manager state;
  - if compatibility is ambiguous, fail closed and keep publish blocked.
- Historical releases without compatible candidate show:
  `Этот релиз создан без backend retrieval candidate. Создайте новый черновик через retrieval evidence.`
- Existing runtime usage candidate block remains the source for usage IDs.

## Localization Requirements

Add known labels/errors to `src/core/i18n/messages.ts` for all portal locales:

- retrieval evidence section title and description;
- candidate status/outcome labels where known;
- no-candidate reasons listed above;
- generation action/progress/success/failure copy;
- malformed retrieval run id;
- retrieval candidate missing;
- support reconstruction mismatch;
- managed knowledge not ready;
- candidate source unavailable;
- historical release without backend candidate guidance;
- safe fallbacks for unknown reasons/errors.

## Access / Security Requirements

- Existing protected admin route behavior remains intact.
- Existing permission/action-ref gating remains authoritative.
- Candidate generation and release mutations stay CSRF-protected through the
  existing API layer.
- Do not render tokens, secrets, provider keys, internal prompts, raw
  retrieval query/probe, raw chunks/source text, transcripts, provider payloads
  or backend-internal debug payloads.
- Do not expose DB/vector/provider/internal routes.

## Tests And Verification Commands

Required tests:

- `getRetrievalEvidenceCandidates` calls the canonical portal endpoint.
- `createRetrievalEvidenceCandidate` calls the canonical mutation endpoint and
  sends `selected_config_id`, `release_candidate_id`, `idempotency_key`.
- API mapper handles safe defaults and preserves unknown reasons.
- Manager loads candidates with release page data.
- Manager default-selects newest compatible candidate.
- No-candidate state disables create for managed knowledge path.
- Candidate generation success selects and applies the candidate.
- Applying a candidate fills release candidate id, stable reference, required
  change kind and grounded smoke references.
- Create payload includes backend `release_candidate_id`.
- Create payload never invents retrieval stable references.
- Publish form receives backend support reconstruction reference when
  available.
- Publish form does not copy support reconstruction from an unrelated retrieval
  candidate; ambiguous compatibility fails closed.
- Publish stays disabled when required support/reference/usage evidence is
  missing.
- Existing usage candidate apply still fills only usage IDs.
- UI renders the retrieval evidence block in the expected area.
- Candidate cards display only safe fields.
- Manual managed retrieval fields are read-only/disabled.
- Known retrieval errors are localized.
- Raw prompts, queries, chunks, transcripts, provider payloads, secrets and
  local smoke fixtures are not rendered.

Verification commands:

```bash
npm run test:admin -- Releases
npm run test:admin
npm run lint:admin
npm run build:admin
```

Boundary searches:

```bash
rg -n "api_key|secret|credential|OPENAI|provider payload|transcript|raw chunk" src/modules/Releases
rg -n "127\\.0\\.0\\.1|26f29c4f|0ab91c81|sales-support-manual-smoke" src/modules/Releases
rg -n "debug|vector|database|pgvector|opensearch" src/modules/Releases
rg -n "release-retrieval-evidence|retrieval evidence|support_reconstruction" src/modules/Agents src/modules/AgentPolicy src/modules/SitesWidgets src/modules/Knowledge src/modules/AgentCapabilities src/modules/AgentConfig
```

## Docs Impact

After acceptance, update only implemented behavior:

- `apps/admin-panel/docs/implemented-functionality-checklist.md`
- `apps/admin-panel/docs/overview.md`
- `apps/admin-panel/docs/architecture.md`
- `apps/admin-panel/docs/development-guide.md`
- `apps/admin-panel/docs/recipes.md`
- `apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_RELEASE_RETRIEVAL_EVIDENCE_OPERATOR_FLOW_TZ.md`
- `apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_release_retrieval_evidence_operator_flow.md`
- `apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md`

Do not edit backend docs from this frontend task.

## Acceptance Criteria

- Existing route `/tenants/:tenantId/agents/:agentId/releases` remains the only
  release route touched.
- Retrieval evidence candidates are loaded from backend and displayed safely.
- Candidate generation uses the canonical backend POST endpoint.
- Managed retrieval stable references are candidate-backed and not free-text.
- Release create sends backend `release_candidate_id`.
- Grounded smoke case references use selected backend candidate when required.
- Publish support reconstruction reference is backend-candidate/read-model
  backed where required.
- Runtime usage IDs still come from existing runtime usage candidate flow.
- Historical releases without compatible candidate are explained and cannot be
  patched into publishable state through fake references.
- Backend remains final authority for candidate eligibility, release create and
  publish.
- No release retrieval evidence logic is added to Agent Detail, Knowledge,
  Policy, Capabilities, Sites/Widgets or Agent Config.
- `npm run test:admin`, `npm run lint:admin` and `npm run build:admin` pass or
  omissions are justified in acceptance review.

## Future-Stage Forbidden Actions

- Do not add credential/provider/model management.
- Do not add local public widget smoke host configuration.
- Do not add frontend release readiness or release gate engines.
- Do not add retrieval/vector/debug inspectors.
- Do not add customer portal behavior.

## Gate Result Expected Before Moving To Prompt 04

Prompt 03 must confirm:

- source urgent TZ and stage TZ are consistent;
- scope remains post-finalization urgent, not `stage_14`;
- all backend contracts and forbidden actions are represented;
- implementation can proceed with
  `allowed_next_step = 04_urgent_release_retrieval_evidence_operator_flow_implementation`.
