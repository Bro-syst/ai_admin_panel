# Prompt 05: Urgent Release Retrieval Evidence Operator Flow Acceptance Review

Use this prompt after urgent prompt 04 implements the urgent stage.

This is a review step. Do not fix runtime code by default.

```text
Prompt '05_urgent_release_retrieval_evidence_operator_flow_acceptance_review_prompt.md'

TARGET_APP = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel

FRONTEND_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md
PIPELINE_STATE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md
IMPLEMENTED_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/implemented-functionality-checklist.md

URGENT_SOURCE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_RELEASE_RETRIEVAL_EVIDENCE_OPERATOR_FLOW_TZ.md
URGENT_STAGE_NAME = urgent_stage_release_retrieval_evidence_operator_flow
URGENT_STAGE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_release_retrieval_evidence_operator_flow.md

Проведи acceptance review реализованного urgent stage `URGENT_STAGE_NAME`.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/urgent_release_retrieval_evidence_operator_flow/README.md
   - PIPELINE_STATE_PATH
2. Продолжай только если:
   - `allowed_next_step = 05_urgent_release_retrieval_evidence_operator_flow_acceptance_review`;
   - urgent stage is recorded as ready for acceptance review;
   - changed files, commands run and implementation notes are recorded;
   - blocked findings are empty or `none`.
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

Review tasks:
1. Findings first. If no findings, say that explicitly.
2. Scope fit:
   - only urgent stage implemented;
   - no new route/global nav;
   - no retrieval evidence UI/state moved to another module;
   - accepted Stages 01-13 and previous urgent release UI are not degraded.
3. Retrieval candidate contract:
   - canonical GET and POST endpoints are used;
   - fields are mapped in API/model boundary;
   - optional fields receive safe defaults;
   - unknown backend values are preserved safely;
   - backend remains candidate eligibility/create/publish authority.
4. Evidence UI/runtime:
   - retrieval evidence block renders in expected location;
   - no-candidate reason/required action render safely;
   - candidate generation flow selects/applies candidate after success;
   - candidate cards display only safe fields;
   - managed stable references are read-only/candidate-backed;
   - grounded smoke case references are candidate-backed where required;
   - historical releases without compatible candidate show operator guidance.
5. Payload correctness:
   - create payload includes backend `release_candidate_id`;
   - draft stable references come from selected candidate;
   - localized labels are not submitted as backend values;
   - publish support reconstruction uses backend candidate/read model where
     required;
   - runtime usage candidate flow still fills only usage IDs.
6. Evidence/security:
   - no tokens, secrets, provider keys, internal prompts, raw queries, chunks,
     transcripts, provider payloads, DB/vector/debug payloads or local smoke
     fixtures are rendered.
7. Architecture:
   - Releases owns API/model/UI changes;
   - shared UI changes are justified by immediate reuse;
   - pages/UI do not call transport directly;
   - no duplicate source of truth;
   - no speculative shared extraction.
8. Frontend/backend responsibility:
   - no local release readiness/gate/policy/billing/metering/pricing or
     model-routing calculation;
   - no direct DB/vector/provider/internal backend calls.
9. Tests and commands:
   - urgent tests cover required cases;
   - `npm run test:admin -- Releases`, `npm run test:admin`,
     `npm run lint:admin`, `npm run build:admin` run or omissions are
     justified.
10. If findings exist:
   - do not fix by default;
   - update PIPELINE_STATE_PATH with findings;
   - set `allowed_next_step = 04_urgent_release_retrieval_evidence_operator_flow_implementation_fix_pass`.
11. If no findings:
   - update PIPELINE_STATE_PATH with urgent stage acceptance;
   - set `allowed_next_step = 06_urgent_release_retrieval_evidence_operator_flow_docs_sync`.

Final response:
- findings first or explicit "findings нет";
- checks run;
- architecture/engineering verdict;
- urgent stage status;
- next step: urgent prompt 06 docs sync or urgent prompt 04 fix-pass;
- final status: `Urgent stage accepted`,
  `Urgent stage accepted with documented deferred items`, or `Blocked`.
```
