# Prompt 04: Urgent Release Retrieval Evidence Operator Flow Implementation

Use this prompt only after urgent prompt 03 accepts the urgent stage.

```text
Prompt '04_urgent_release_retrieval_evidence_operator_flow_implementation_prompt.md'

TARGET_APP = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel

FRONTEND_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md
PIPELINE_STATE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md
IMPLEMENTED_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/implemented-functionality-checklist.md

URGENT_SOURCE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_RELEASE_RETRIEVAL_EVIDENCE_OPERATOR_FLOW_TZ.md
URGENT_STAGE_NAME = urgent_stage_release_retrieval_evidence_operator_flow
URGENT_STAGE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_release_retrieval_evidence_operator_flow.md
BACKEND_TZ_PATH = /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/tz/TZ-SVC-10_release_retrieval_evidence_operator_flow/FRONTEND_RELEASE_SCREEN_RETRIEVAL_EVIDENCE_TZ.md

Реализуй urgent stage `URGENT_STAGE_NAME`.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/urgent_release_retrieval_evidence_operator_flow/README.md
   - PIPELINE_STATE_PATH
   - URGENT_SOURCE_TZ_PATH
   - URGENT_STAGE_TZ_PATH
   - BACKEND_TZ_PATH as read-only contract context
2. Продолжай только если:
   - `allowed_next_step = 04_urgent_release_retrieval_evidence_operator_flow_implementation`;
   - urgent prompt 03 consistency review is complete and accepted;
   - blocked findings are empty or `none`;
   - Stages 01-13 remain accepted/finalized;
   - urgent Release Evidence Requirements UI remains accepted/docs-synced.
3. Если gate не пройден, остановись со статусом `Blocked`.

Обязательные документы:
- FRONTEND_TZ_PATH
- IMPLEMENTED_CHECKLIST_PATH
- URGENT_SOURCE_TZ_PATH
- URGENT_STAGE_TZ_PATH
- PIPELINE_STATE_PATH
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/architecture.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/development-guide.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/recipes.md

Allowed runtime write scope:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/Releases/**`;
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/core/i18n/messages.ts`;
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/core/router/routes.test.tsx`
  only to prove no new release route/regression;
- focused tests in the same owner areas;
- PIPELINE_STATE_PATH.

Implementation requirements:
1. API/model contract:
   - add typed retrieval evidence candidate DTO/domain mapping;
   - add `getRetrievalEvidenceCandidates(tenantId, agentId)`;
   - add `createRetrievalEvidenceCandidate(tenantId, agentId, input)`;
   - call canonical GET/POST endpoints only;
   - keep DTO mapping in Releases API/model boundaries.
2. Loading and selection:
   - load retrieval evidence candidates with release page data;
   - store summary, items, loading/error state;
   - select newest compatible candidate by default when no current selection
     exists;
   - preserve unknown backend reasons safely.
3. Candidate generation:
   - add manager action for `Сформировать retrieval evidence`;
   - send `selected_config_id`, `release_candidate_id`, `idempotency_key`;
   - on success refresh/select/apply candidate;
   - on failure show localized/actionable error and do not invent references.
4. Draft form:
   - selected candidate fills `releaseCandidateId`,
     `evidenceStableReference`, backend `requiredChangeKind` and grounded
     smoke case stable references;
   - managed retrieval stable reference fields are read-only/disabled;
   - create release payload includes backend `release_candidate_id`;
   - create stays disabled when managed candidate/reference evidence is
     missing.
5. Publish form:
   - support reconstruction reference is read-only/autofilled from backend
     candidate/read model when required;
   - historical release without compatible candidate shows the required
     operator guidance;
   - publish stays disabled when required support/reference/usage evidence is
     missing;
   - existing runtime usage candidate flow still fills only usage IDs.
6. UI requirements:
   - render `Retrieval evidence релиза` block after release evidence
     requirements and before release history/draft controls;
   - render loading, no-candidate, generation, error and candidate list states;
   - candidate cards display only safe fields;
   - replace manual reference copy action with candidate-backed
     `Подставить retrieval evidence в проверки с базой знаний`;
   - no raw query/chunk/transcript/provider/secret/debug content.
7. Localization:
   - localize known no-candidate reasons and backend errors;
   - preserve unknown backend keys through safe fallback;
   - localized labels must never be submitted as backend values.
8. Preserve boundaries:
   - no new route/global nav;
   - no retrieval evidence logic in Agent Detail, Policy, Sites/Widgets,
     Knowledge, Capabilities or Agent Config;
   - no backend endpoint implementation;
   - no frontend-local release readiness/gate/policy/billing/model-routing
     logic;
   - no direct DB/vector/provider/internal backend calls;
   - no direct transport calls in pages/UI.
9. Add/update focused tests from urgent stage TZ.
10. Run checks:
   - `npm run test:admin -- Releases`
   - `npm run test:admin`
   - `npm run lint:admin`
   - `npm run build:admin`
   - boundary searches from URGENT_STAGE_TZ_PATH.
11. Update PIPELINE_STATE_PATH:
   - implementation summary;
   - changed files;
   - reuse/new ownership decisions;
   - commands run;
   - blockers/deferred items;
   - set `allowed_next_step = 05_urgent_release_retrieval_evidence_operator_flow_acceptance_review`.

Final response:
- what was implemented;
- boundaries preserved;
- reuse/new ownership decisions;
- tests/checks run;
- blockers/deferred items;
- final status: `Urgent stage ready for acceptance review`,
  `Ready with documented deferred items`, or `Blocked`.
```
