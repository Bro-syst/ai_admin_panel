# Urgent TZ: Release Retrieval Evidence Operator Flow

Status: `accepted-docs-synced`

This is a post-finalization frontend urgent TZ for the existing Admin Portal
release screen. It adapts the backend source TZ:

- `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/tz/TZ-SVC-10_release_retrieval_evidence_operator_flow/FRONTEND_RELEASE_SCREEN_RETRIEVAL_EVIDENCE_TZ.md`

The accepted 13-stage umbrella remains closed. Do not create `stage_14`.

## Goal

Update the existing route
`/tenants/:tenantId/agents/:agentId/releases` so an operator can create and
publish release evidence through backend-approved retrieval evidence candidates
instead of manually inventing retrieval/support references.

The screen must guide the operator through this path:

1. Load or generate a backend-approved retrieval evidence candidate.
2. Apply that candidate to the release draft evidence form.
3. Create a release draft with backend `release_candidate_id` and stable
   retrieval references.
4. Use the existing runtime usage candidate flow for usage IDs.
5. Publish with backend support reconstruction reference, not free-text
   `support-reconstruction:*` input.

## Scope

Allowed runtime scope:

- `src/modules/Releases/**`
- `src/core/i18n/messages.ts`
- `src/core/router/routes.test.tsx` only for route no-regression proof
- focused tests in Releases owner areas
- `pipeline_state.md`

No new route or global navigation item is allowed.

## Backend Contracts

Add frontend API/model support for:

```text
GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/release-retrieval-evidence-candidates
POST /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/release-retrieval-evidence-candidates
```

Required frontend API methods:

- `getRetrievalEvidenceCandidates(tenantId, agentId)`
- `createRetrievalEvidenceCandidate(tenantId, agentId, input)`

Request body for create:

```json
{
  "selected_config_id": "<config-id>",
  "release_candidate_id": "<candidate-id-or-null>",
  "idempotency_key": "<frontend-attempt-key>"
}
```

Display-safe candidate fields:

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

Mapper rules:

- snake_case backend DTOs become camelCase frontend models;
- optional strings become `''` or `null` according to model type;
- optional arrays become `[]`;
- optional numbers become `0`;
- optional booleans become `false`;
- unknown enum/string values are preserved and rendered with safe fallback.

## UI Requirements

Add a `Retrieval evidence релиза` block to the existing release screen:

- after release evidence requirements;
- before release history, smoke case matrix and release draft form;
- visually attached to release evidence setup, not runtime usage or provider
  settings.

Block copy:

```text
Сформируйте backend-approved retrieval evidence для выбранной конфигурации.
Портал подставит только серверные references в черновик и публикацию.
```

States:

- loading: `Загрузка retrieval evidence...`;
- no candidates: show safe backend reason, `required_action` and the action
  `Сформировать retrieval evidence`;
- candidate list: selectable candidate cards/radio rows with safe fields only;
- generation progress and success/failure states;
- unknown no-candidate reason remains visible and must not unlock create.

Known `no_candidate_reason` values:

- `missing_selected_config`
- `managed_knowledge_not_required`
- `managed_knowledge_not_ready`
- `no_retrieval_evidence_candidate`
- `candidate_generation_failed`
- `candidate_source_unavailable`

## Draft Behavior

When a candidate is selected or generated, apply it to draft form state:

- `releaseCandidateId = candidate.releaseCandidateId`
- `evidenceStableReference = candidate.stableReference`
- `evidenceChangeKind = evidenceRequirements.requiredChangeKind`
- grounded smoke case stable references use `candidate.stableReference`
  whenever backend rules require a stable release reference match.

The existing action for copying a manual reference into smoke cases must be
replaced with:

```text
Подставить retrieval evidence в проверки с базой знаний
```

It is enabled only when a backend candidate is selected.

`evidenceStableReference` is read-only/disabled for managed knowledge release
evidence. If no candidate exists, show:

```text
Сначала сформируйте retrieval evidence
```

Create release remains disabled when:

- release setup is not ready;
- required smoke outcomes/pass states are incomplete;
- managed retrieval candidate is missing;
- grounded stable references are not filled from the selected backend
  candidate;
- manual override is selected but incomplete or not allowed by backend.

## Publish Behavior

Publish uses two backend-approved evidence sources:

1. Retrieval/support evidence candidate from this urgent TZ.
2. Runtime usage evidence candidate from the already accepted runtime usage
   flow.

For managed knowledge releases:

- `supportReconstructionReference` is read-only/autofilled from backend
  retrieval candidate/read model;
- if backend extends release detail/list with release candidate or support
  reconstruction fields, map and use those fields in the Releases API/model
  boundary;
- if backend does not return support reconstruction on the selected release,
  use a retrieval candidate only when it is clearly compatible with the
  selected release or current draft:
  - candidate `releaseCandidateId` matches the release candidate id used for
    the current draft/release, when available;
  - or candidate `stableReference` matches selected release
    `evidenceReference`;
  - or the selected draft was just created from that candidate in the current
    manager state;
- if compatibility cannot be proven, fail closed and show the historical
  release guidance instead of autofilling support reference;
- the operator must not enter arbitrary
  `support-reconstruction:knowledge-retrieval-run:*` strings;
- if a selected historical release has no compatible candidate/support
  reference, show:

```text
Этот релиз создан без backend retrieval candidate. Создайте новый черновик через retrieval evidence.
```

Usage IDs remain filled only by the runtime usage candidate block.
Billing export and release report references keep the current accepted path
until backend provides candidate sources for them.
Support reconstruction must never be copied from an unrelated candidate just
because a candidate is selected in the retrieval block.

## Error Localization

Add localized messages for:

- malformed retrieval run id:
  `Ссылка на retrieval evidence создана вручную или повреждена. Сформируйте evidence через backend candidate.`
- retrieval candidate missing:
  `Сначала сформируйте retrieval evidence для выбранной конфигурации.`
- support reconstruction mismatch:
  `Support reconstruction не совпадает с evidence релиза. Используйте backend candidate для этого релиза.`
- managed knowledge not ready:
  `База знаний ещё не готова для release evidence. Вернитесь к настройке базы знаний.`
- candidate source unavailable:
  `Backend временно не может проверить источник retrieval evidence. Повторите позже.`

Unknown backend errors remain visible as safe text and must not unlock
create/publish.

## Security And Forbidden Content

Do not render:

- raw retrieval query/probe text;
- raw chunks or source text;
- user/assistant transcripts;
- provider request/response payloads;
- API keys, secrets, credentials;
- DB/debug/vector internal payloads;
- hardcoded local tenant IDs, agent IDs, widget keys, release IDs or config IDs.

Do not add:

- provider/model/secret/API key UI;
- direct DB/vector/provider/internal backend calls;
- backend endpoint implementation;
- frontend-local release readiness, release gate, policy, billing, metering,
  pricing or model-routing logic.

## Tests

Required focused tests:

- API mapper maps retrieval evidence candidates and safe defaults.
- API calls canonical GET/POST endpoints and does not call alternate debug,
  vector or knowledge internal routes.
- Manager loads candidates with release page data.
- Manager selects newest compatible candidate by default.
- No-candidate state disables release create for managed knowledge path.
- Candidate generation success selects/applies the candidate.
- Apply candidate fills release candidate id, stable reference, required change
  kind and grounded smoke case references.
- Create payload includes backend `release_candidate_id` and never invents
  retrieval stable references.
- Publish support reconstruction is read-only/autofilled from backend candidate
  where available.
- Publish stays disabled when required support/reference/usage evidence is
  missing.
- Existing runtime usage candidate flow still fills only usage IDs.
- UI renders the retrieval evidence block, no-candidate reason, required action,
  safe candidate cards and candidate-backed disabled fields.
- UI does not render raw prompt/query/chunk/transcript/provider/secret values.

Required commands from `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel`:

```text
npm run test:admin -- Releases
npm run test:admin
npm run lint:admin
npm run build:admin
```

Required boundary searches:

```text
rg -n "api_key|secret|credential|OPENAI|provider payload|transcript|raw chunk" src/modules/Releases
rg -n "127\\.0\\.0\\.1|26f29c4f|0ab91c81|sales-support-manual-smoke" src/modules/Releases
rg -n "debug|vector|database|pgvector|opensearch" src/modules/Releases
```

## Acceptance

Accepted when:

- backend candidate create/read is the only source for managed retrieval
  reference values;
- release draft creation sends backend `release_candidate_id`;
- support reconstruction for publish comes from backend candidate/read model;
- the operator no longer has to invent retrieval/support references;
- old failed local releases remain historical and do not block creating a new
  correct release;
- tests, lint and build pass or omissions are explicitly justified;
- boundary searches show no provider/secret/debug/local-smoke leakage.
