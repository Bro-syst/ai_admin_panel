# Adapted Prompt 01: Admin Portal Discovery And Umbrella Frontend TZ

Use this prompt only for the Admin Portal frontend package.

Canonical source template:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/01_discovery_create_umbrella_frontend_tz_prompt.md`

Do not write runtime code in this step.

```text
Prompt '01_discovery_create_umbrella_frontend_tz_prompt.md'
TARGET_APP = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel

FRONTEND_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md
PIPELINE_STATE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md
FUNCTIONAL_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/FUNCTIONAL_CHECKLIST.md

FRONTEND_PRODUCT_BRIEF_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/FRONTEND_PRODUCT_BRIEF.md
UI_UX_SPEC_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_UI_UX_SPEC.md
FRONTEND_API_REFERENCE_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_API_REFERENCE.md
FRONTEND_IMPLEMENTATION_PLAN_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_IMPLEMENTATION_PLAN.md
ACCEPTANCE_CHECKLIST_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_ACCEPTANCE_CHECKLIST.md

BACKEND_TZ_PATH = /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_IMPLEMENTATION_TZ.md
BACKEND_SUPPORTING_DOCS =
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_COVERAGE_CHECKLIST.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_TZ_CONFORMANCE_REVIEW.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/ADMIN_PORTAL_FRONTEND_CODE_GROUNDED_AUDIT.md
- /Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/SERVICE_LAUNCH_CHECKLIST.md
- /Volumes/Work/AI_Agents/ai_core/docs/api/portals/admin/README.md

Проведи discovery или code-grounded refresh для Admin Portal frontend TZ.

Главная цель:
- обновить или подтвердить frontend-facing package для реализации Admin Portal;
- не переносить backend stage history во frontend package;
- оставить фронтендеру понятный набор: product brief, UI/UX spec, API reference,
  implementation plan, acceptance checklist, umbrella TZ and pipeline state.

Pipeline gate:
1. Перечитай:
   - /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md
   - PIPELINE_STATE_PATH
2. Если PIPELINE_STATE_PATH отсутствует, создай его.
3. Если ledger существует, не сбрасывай принятые решения.
4. Если allowed_next_step указывает на более поздний шаг, чем 01, выполняй
   этот prompt только как requested correction/refresh текущего TZ package.
5. Если есть blocked_findings, сначала зафиксируй их в pipeline_state и верни
   статус Blocked.
6. Не переходи к stage decomposition или реализации на этом шаге.

Обязательные frontend документы для чтения:
- /Volumes/Work/PC/ai_admin_panel/docs/architecture.md
- /Volumes/Work/PC/ai_admin_panel/docs/development-guide.md
- /Volumes/Work/PC/ai_admin_panel/docs/recipes.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/architecture.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/development-guide.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/overview.md
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/recipes.md
- FRONTEND_TZ_PATH
- FUNCTIONAL_CHECKLIST_PATH
- FRONTEND_PRODUCT_BRIEF_PATH
- UI_UX_SPEC_PATH
- FRONTEND_API_REFERENCE_PATH
- FRONTEND_IMPLEMENTATION_PLAN_PATH
- ACCEPTANCE_CHECKLIST_PATH

Обязательные backend/product материалы для чтения:
- BACKEND_TZ_PATH
- every file in BACKEND_SUPPORTING_DOCS that exists locally

Обязательный code-grounded context:
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/core/router/routes.tsx
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/core/auth/
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/core/api/
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/shared/ui/
- /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/src/modules/

Что нужно проверить и зафиксировать:
1. Product boundary:
   - Admin Portal is internal operator console;
   - not customer portal;
   - not generic CRUD admin;
   - main flow is tenant -> agent -> knowledge/capability/policy -> widget
     -> release -> support/usage/billing.
2. Existing baseline to preserve:
   - login/session/logout;
   - current `/api/admin/v1/users/me` auth bootstrap;
   - settings/security/TOTP/session panels;
   - password setup/reset aliases;
   - AppShell/theme/locale/providers;
   - CSRF and backend error fallback handling.
3. Code-grounded corrections:
   - `/security` must be a real protected page, not redirect;
   - authenticated `/` remains `/settings` until real dashboard is delivered;
   - new modules use `src/modules/<Domain>/{api,model,pages,ui}`;
   - pages/ui do not call `apiClient` directly;
   - portal read models are primary source for portal summary screens;
   - no frontend-local readiness calculation;
   - no direct DB/vector/provider calls.
4. Frontend-facing docs:
   - FRONTEND_PRODUCT_BRIEF_PATH explains product/user/goals;
   - UI_UX_SPEC_PATH defines screens, flow, states, confirmations and UX;
   - FRONTEND_API_REFERENCE_PATH contains short frontend API contracts only;
   - FRONTEND_IMPLEMENTATION_PLAN_PATH gives stage/module implementation order;
   - ACCEPTANCE_CHECKLIST_PATH defines acceptance gates;
   - FUNCTIONAL_CHECKLIST_PATH remains detailed coverage checklist.
5. Open questions:
   - do not invent product behavior;
   - record only questions that block stage decomposition or implementation.

Update outputs:
1. Update FRONTEND_TZ_PATH if source material changed.
2. Update frontend-facing package docs if they drift from umbrella TZ.
3. Update FUNCTIONAL_CHECKLIST_PATH if required functionality changed.
4. Update PIPELINE_STATE_PATH:
   - keep target app and source material paths;
   - record changed files;
   - record blocked_findings or `none`;
   - set `allowed_next_step = 02_decompose_umbrella_tz_into_stages` if ready;
   - set `optional_next_step = none`.

Final response must include:
- whether this was initial discovery or refresh;
- changed files;
- open questions or `none`;
- whether prompt 02 is allowed;
- final status: `Ready for decomposition` or `Blocked`.
```

