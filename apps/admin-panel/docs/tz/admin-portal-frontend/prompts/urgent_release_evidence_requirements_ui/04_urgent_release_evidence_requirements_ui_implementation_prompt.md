# Prompt 04: Urgent Release Evidence Requirements UI Implementation

Use this prompt only after urgent prompt 03 accepts the urgent stage.

```text
Prompt '04_urgent_release_evidence_requirements_ui_implementation_prompt.md'

TARGET_APP = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel

FRONTEND_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md
PIPELINE_STATE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md
IMPLEMENTED_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/implemented-functionality-checklist.md

URGENT_SOURCE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_RELEASE_EVIDENCE_REQUIREMENTS_UI_TZ.md
URGENT_STAGE_NAME = urgent_stage_release_evidence_requirements_ui
URGENT_STAGE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_release_evidence_requirements_ui.md

Реализуй urgent stage `URGENT_STAGE_NAME`.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/urgent_release_evidence_requirements_ui/README.md
   - PIPELINE_STATE_PATH
   - URGENT_SOURCE_TZ_PATH
   - URGENT_STAGE_TZ_PATH
2. Продолжай только если:
   - `allowed_next_step = 04_urgent_release_evidence_requirements_ui_implementation`;
   - urgent prompt 03 consistency review is complete and accepted;
   - blocked findings are empty or `none`;
   - Stages 01-13 remain accepted/finalized.
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
   - add typed release evidence requirements DTO/domain mapping;
   - add `getEvidenceRequirements(tenantId, agentId)`;
   - load evidence requirements with readiness/releases;
   - keep DTO mapping in Releases API/model boundaries.
2. Full evidence payload:
   - replace single `smokeCaseId` input with all required smoke cases;
   - submit all `evidence.smoke_cases[]` rows;
   - submit backend-provided `required_change_kind`;
   - submit stable reference from evidence input;
   - submit manual override fields when override is chosen and allowed.
3. UI requirements:
   - render evidence requirements panel;
   - render smoke-case matrix from backend `required_smoke_cases`;
   - render release setup gate status and blocking items;
   - render stable reference guidance from backend metadata;
   - render manual override defaults/blocked reason;
   - render publish evidence requirements;
   - disable create when explicit evidence or allowed manual override is
     incomplete;
   - disable publish for failed releases.
4. Localization:
   - localize known backend label/description keys and status values;
   - preserve unknown backend keys through safe fallback;
   - use neutral missing optional backend evidence copy.
5. Preserve boundaries:
   - no new route/global nav;
   - no release evidence logic in Agent Detail, Policy, Sites/Widgets,
     Knowledge, Capabilities or Agent Config;
   - no backend endpoint implementation;
   - no frontend-local release readiness/gate/policy/billing/model-routing
     logic;
   - no direct DB/vector/provider/internal backend calls;
   - no direct transport calls in pages/UI.
6. Add/update focused tests from urgent stage TZ.
7. Run checks:
   - `npm run test:admin -- Releases`
   - `npm run test:admin`
   - `npm run lint:admin`
   - `npm run build:admin`
   - boundary searches for direct transport outside API owners and no-regression
     module ownership.
8. Update PIPELINE_STATE_PATH:
   - implementation summary;
   - changed files;
   - reuse/new ownership decisions;
   - commands run;
   - blockers/deferred items;
   - set `allowed_next_step = 05_urgent_release_evidence_requirements_ui_acceptance_review`.

Final response:
- what was implemented;
- boundaries preserved;
- reuse/new ownership decisions;
- tests/checks run;
- blockers/deferred items;
- final status: `Urgent stage ready for acceptance review`,
  `Ready with documented deferred items`, or `Blocked`.
```
