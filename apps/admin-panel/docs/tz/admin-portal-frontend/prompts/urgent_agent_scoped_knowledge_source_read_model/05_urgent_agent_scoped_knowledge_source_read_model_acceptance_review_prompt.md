# Prompt 05: Urgent Agent-Scoped Knowledge Source Read Model Acceptance Review

Use this prompt after urgent prompt 04 implements the urgent stage.

This is a review step. Do not fix runtime code by default.

```text
Prompt '05_urgent_agent_scoped_knowledge_source_read_model_acceptance_review_prompt.md'

TARGET_APP = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel

FRONTEND_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md
PIPELINE_STATE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md
IMPLEMENTED_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/implemented-functionality-checklist.md

URGENT_SOURCE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_AGENT_SCOPED_KNOWLEDGE_SOURCE_READ_MODEL_TZ.md
URGENT_STAGE_NAME = urgent_stage_agent_scoped_knowledge_source_read_model
URGENT_STAGE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_agent_scoped_knowledge_source_read_model.md

Проведи acceptance review реализованного urgent stage `URGENT_STAGE_NAME`.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/urgent_agent_scoped_knowledge_source_read_model/README.md
   - PIPELINE_STATE_PATH
2. Продолжай только если:
   - `allowed_next_step = 05_urgent_agent_scoped_knowledge_source_read_model_acceptance_review`;
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
   - Knowledge ownership remains in Knowledge;
   - accepted Stages 01-13 and prior urgent release flows are not degraded.
3. Agent-scoped contract:
   - three read methods call agent-scoped routes with tenantId and agentId;
   - tenant-scoped portal reads are not used by the agent Knowledge screen;
   - DTO mapping stays in API/model boundary.
4. Runtime behaviour:
   - initial load selects source only from backend agent-scoped list;
   - detail loads through agent-scoped detail route;
   - create-source success records mutation evidence and reloads backend list;
   - created source is auto-selected only if backend returns it;
   - created-but-not-visible case has actionable warning;
   - document/indexing controls enable only after backend detail loads;
   - document/indexing mutations refresh list/detail/readiness.
5. Frontend/backend responsibility:
   - no local source visibility/readiness calculation;
   - release readiness rendered from backend only;
   - no localStorage/sessionStorage source truth;
   - no release evidence or publish logic changes.
6. Evidence/security:
   - no tokens, secrets, provider keys, internal prompts, raw source text,
     raw chunks, vector/debug payloads, DB/provider payloads or fake ids are
     rendered.
7. Architecture:
   - Knowledge owns API/model/UI changes;
   - pages/UI do not call transport directly;
   - no speculative shared extraction;
   - no cross-module deep import regression.
8. Tests and commands:
   - urgent tests cover required cases;
   - `npm run test:admin -- Knowledge`, `npm run test:admin`,
     `npm run lint:admin`, `npm run build:admin` run or omissions are
     justified.
9. If findings exist:
   - do not fix by default;
   - update PIPELINE_STATE_PATH with findings;
   - set `allowed_next_step = 04_urgent_agent_scoped_knowledge_source_read_model_implementation_fix_pass`.
10. If no findings:
   - update PIPELINE_STATE_PATH with urgent stage acceptance;
   - set `allowed_next_step = 06_urgent_agent_scoped_knowledge_source_read_model_docs_sync`.

Final response:
- findings first or explicit "findings нет";
- checks run;
- architecture/engineering verdict;
- urgent stage status;
- next step: urgent prompt 06 docs sync or urgent prompt 04 fix-pass;
- final status: `Urgent stage accepted`,
  `Urgent stage accepted with documented deferred items`, or `Blocked`.
```
