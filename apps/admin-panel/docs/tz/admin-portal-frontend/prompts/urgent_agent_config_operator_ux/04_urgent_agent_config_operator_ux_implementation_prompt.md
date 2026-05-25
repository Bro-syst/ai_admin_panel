# Prompt 04: Urgent Agent Config Operator UX Implementation

Use this prompt only after urgent prompt 03 accepts the urgent stage.

```text
Prompt '04_urgent_agent_config_operator_ux_implementation_prompt.md'

TARGET_APP = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel

FRONTEND_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md
PIPELINE_STATE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md
IMPLEMENTED_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/implemented-functionality-checklist.md

URGENT_SOURCE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_AGENT_CONFIG_OPERATOR_UX_FIX_TZ.md
URGENT_STAGE_NAME = urgent_stage_agent_config_operator_ux_fix
URGENT_STAGE_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_agent_config_operator_ux_fix.md

Реализуй urgent stage `URGENT_STAGE_NAME`.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/README.md
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/urgent_agent_config_operator_ux/README.md
   - PIPELINE_STATE_PATH
   - URGENT_SOURCE_TZ_PATH
   - URGENT_STAGE_TZ_PATH
2. Продолжай только если:
   - `allowed_next_step = 04_urgent_agent_config_operator_ux_implementation`;
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
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/AgentConfig/**`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/Agents/**`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/Tenants/**`
  only for already exposed mutation evidence/copy UX;
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/shared/ui/**`
  only for narrow reusable copy/evidence primitives;
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/core/i18n/messages.ts`;
- focused tests in the same owner areas;
- PIPELINE_STATE_PATH.

Implementation requirements:
1. AgentConfig controls:
   - controlled select for preferred model family;
   - existing sensitivity selects preserved;
   - multi-select/chips for preferred capabilities;
   - controlled select/default for profile name;
   - controlled select/default for response mode;
   - read-only/default control for schema version;
   - multi-select/chips for safety labels;
   - existing tone/language selects and boolean toggles preserved.
2. Centralized metadata:
   - create typed option metadata in AgentConfig owner area;
   - do not scatter option literals through UI;
   - labels/help may use i18n;
   - metadata is temporary UI adapter, not business-rule source of truth.
3. Payload correctness:
   - UI labels must never be submitted as backend values;
   - unknown existing backend values must be visible and preserved where
     possible;
   - `Create version` must use `agentConfigApi.createConfigVersion`, not
     `createDraft`.
4. Evidence and copy:
   - evolve/reuse `MutationResultBlock` or a narrow shared primitive;
   - show action, resource type/id, status/result, version where available,
     correlation/request fallback and timestamp where available;
   - add copy buttons for safe ids/evidence values;
   - do not render tokens, secrets, provider keys, internal prompts or
     backend-internal payloads.
5. Guidance:
   - AgentConfig explains validate vs activate;
   - after successful validation, next action is clearly Activate;
   - after activation, active config id/version and evidence are visible;
   - replace ambiguous safe-default false wording;
   - Agent Detail shows active config id, actionable blockers and next setup
     step from backend/read-model state where available;
   - do not push lifecycle activation while blockers remain.
6. Preserve boundaries:
   - no new route/global nav;
   - no backend endpoint implementation;
   - no frontend-local readiness/release/policy/billing/model-routing logic;
   - no direct DB/vector/provider/internal backend calls;
   - no direct transport calls in pages/UI.
7. Add/update focused tests from urgent stage TZ.
8. Run checks:
   - `npm run test:admin -- AgentConfig AgentDetailView TenantDetailView`
   - `npm run test:admin`
   - `npm run lint:admin`
   - `npm run build:admin`
   - boundary searches for direct transport outside API owners.
9. Update PIPELINE_STATE_PATH:
   - implementation summary;
   - changed files;
   - reuse/new ownership decisions;
   - commands run;
   - blockers/deferred items;
   - set `allowed_next_step = 05_urgent_agent_config_operator_ux_acceptance_review`.

Final response:
- what was implemented;
- boundaries preserved;
- reuse/new ownership decisions;
- tests/checks run;
- blockers/deferred items;
- final status: `Urgent stage ready for acceptance review`,
  `Ready with documented deferred items`, or `Blocked`.
```

