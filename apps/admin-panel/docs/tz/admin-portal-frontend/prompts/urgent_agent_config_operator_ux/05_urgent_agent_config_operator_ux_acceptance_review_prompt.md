# Prompt 05: Urgent Agent Config Operator UX Acceptance Review

Use this prompt after urgent prompt 04 implements the urgent stage.

This is a review step. Do not fix runtime code by default.

```text
Prompt '05_urgent_agent_config_operator_ux_acceptance_review_prompt.md'

TARGET_APP = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel

FRONTEND_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md
PIPELINE_STATE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md
IMPLEMENTED_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/implemented-functionality-checklist.md

URGENT_SOURCE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_AGENT_CONFIG_OPERATOR_UX_FIX_TZ.md
URGENT_STAGE_NAME = urgent_stage_agent_config_operator_ux_fix
URGENT_STAGE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_agent_config_operator_ux_fix.md

Проведи acceptance review реализованного urgent stage `URGENT_STAGE_NAME`.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/urgent_agent_config_operator_ux/README.md
   - PIPELINE_STATE_PATH
2. Продолжай только если:
   - `allowed_next_step = 05_urgent_agent_config_operator_ux_acceptance_review`;
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
   - no customer/backend-only/public-widget-runtime scope;
   - accepted Stages 01-13 not degraded.
3. AgentConfig controls:
   - response mode is select/default, not raw text;
   - profile name is select/default, not raw text;
   - schema version is read-only/default `1.0`;
   - preferred model family is select/default;
   - preferred capabilities and safety labels are multi-select/chips;
   - tone/language/sensitivity/toggles remain controlled;
   - unknown backend values are visible and preserved.
4. Payload/API correctness:
   - canonical backend values are submitted, not localized labels;
   - `Create version` uses `createConfigVersion` and `/configs`;
   - DTO mapping remains in API/model boundaries.
5. Evidence/security:
   - critical mutation evidence stays visible after action;
   - copy buttons work for safe ids/evidence values;
   - missing correlation/request evidence has safe fallback;
   - no tokens, secrets, provider keys, internal prompts or backend-internal
     payloads are rendered.
6. Guidance:
   - validate is clearly not activation;
   - successful validation points to Activate;
   - activation shows active config id/version/evidence;
   - safe-default false wording is unambiguous;
   - Agent Detail next-step/blocker guidance comes from backend/read-model
     state and does not push lifecycle activation through blockers.
7. Architecture:
   - AgentConfig owns option metadata/form/model/API changes;
   - Agents/Tenants touches are narrow;
   - shared UI changes are justified by immediate reuse;
   - no business logic in shared UI;
   - no direct transport in pages/UI.
8. Frontend/backend responsibility:
   - no local readiness, release, policy, billing, metering, pricing or
     model-routing calculation;
   - no direct DB/vector/provider/internal backend calls.
9. Tests and commands:
   - urgent tests cover required cases;
   - `npm run test:admin -- AgentConfig AgentDetailView TenantDetailView`,
     `npm run test:admin`, `npm run lint:admin`, `npm run build:admin` run or
     omissions are justified.
10. If findings exist:
   - do not fix by default;
   - update PIPELINE_STATE_PATH with findings;
   - set `allowed_next_step = 04_urgent_agent_config_operator_ux_implementation_fix_pass`.
11. If no findings:
   - update PIPELINE_STATE_PATH with urgent stage acceptance;
   - set `allowed_next_step = 06_urgent_agent_config_operator_ux_docs_sync`.

Final response:
- findings first or explicit "findings нет";
- checks run;
- architecture/engineering verdict;
- urgent stage status;
- next step: urgent prompt 06 docs sync or urgent prompt 04 fix-pass;
- final status: `Urgent stage accepted`,
  `Urgent stage accepted with documented deferred items`, or `Blocked`.
```

