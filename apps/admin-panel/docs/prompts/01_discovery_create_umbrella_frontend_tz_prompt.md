# Prompt 01: Discovery And Umbrella Frontend TZ

## Purpose

Use this first when backend/product scope exists but the frontend work is not yet
expressed as a precise umbrella `TZ`.

This step reads backend `TZ`, backend docs, product request, current code and
architecture docs, then creates or updates an umbrella frontend `TZ`.

Do not write runtime code in this step.

## Template

```text
TARGET_APP = apps/admin-panel
BACKEND_TZ_PATH = {BACKEND_TZ_PATH}
BACKEND_SUPPORTING_DOCS = {BACKEND_SUPPORTING_DOCS}
FRONTEND_TZ_PATH = /Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/ADMIN_PORTAL_FRONTEND_UMBRELLA_TZ.md
PIPELINE_STATE_PATH = {PIPELINE_STATE_PATH}

Проведи discovery и сформируй или обнови umbrella frontend ТЗ `{FRONTEND_TZ_PATH}` для `TARGET_APP`.

Backend materials используй только как read-only supporting context:
- `BACKEND_TZ_PATH`
- `BACKEND_SUPPORTING_DOCS`

Если backend materials не указаны, source of truth — запрос пользователя, текущий frontend runtime и docs проекта.

Обязательные документы для чтения:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md`
- `/Volumes/Work/PC/ai_admin_panel/docs/architecture.md`
- `/Volumes/Work/PC/ai_admin_panel/docs/development-guide.md`
- `/Volumes/Work/PC/ai_admin_panel/docs/recipes.md`
- docs выбранного `TARGET_APP`:
  - для `apps/admin-panel`: `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/architecture.md`, `development-guide.md`, `overview.md`, `recipes.md`
  - для `apps/client-panel`: `/Volumes/Work/PC/ai_admin_panel/apps/client-panel/docs/architecture.md`, `development-guide.md`, `overview.md`, `recipes.md`, если файл есть

Pipeline gate:
1. Если `PIPELINE_STATE_PATH` отсутствует, создай его.
2. Если он существует, перечитай и не сбрасывай уже зафиксированные решения.
3. Если ledger существует и `allowed_next_step` указывает на более поздний
   шаг, не переписывай историю; обновляй только discovery/TZ scope, если это
   явно requested correction, иначе верни `Blocked`.
4. Не переходи к stage decomposition или реализации на этом шаге.

Что нужно сделать:
1. Перечитать backend/product input и выделить frontend-relevant scope.
2. Сделать app-boundary split:
   - `apps/admin-panel in scope`;
   - `apps/client-panel in scope`;
   - shared/root/package concern;
   - backend-only;
   - out of scope.
3. Если `TARGET_APP` один, не включать требования другого app в его frontend ТЗ.
4. Осмотреть текущий код и найти existing owners:
   - routes;
   - API services and DTO mapping;
   - auth/session/security owners;
   - modules/model/hooks;
   - UI/pages/components;
   - i18n/theme/layout;
   - tests;
   - docs.
5. Зафиксировать engineering fit:
   - which existing owners should be reused;
   - where new ownership is truly required;
   - where shared/package extraction is not justified;
   - which responsibilities must stay separated;
   - which duplicate state or duplicate mapping risks must be avoided.
6. Сформировать umbrella frontend ТЗ `{FRONTEND_TZ_PATH}` со структурой:
   - title and status;
   - source materials;
   - target app and hard boundaries;
   - in scope;
   - out of scope;
   - current frontend baseline;
   - engineering principles and reuse plan;
   - required user/admin scenarios;
   - API/contract expectations;
   - routes/navigation impact;
   - module ownership and file owners;
   - UI states and i18n requirements;
   - security/session/access requirements;
   - testing requirements;
   - regression-sensitive scenarios;
   - docs impact;
   - stage split recommendation;
   - open questions and deferred items.
7. Не добавлять adapters/shims для старого API, если это не зафиксировано как явное accepted debt с removal criteria.
8. Если данных недостаточно, не додумывать product behavior: записать open questions.
9. Обновить `PIPELINE_STATE_PATH`:
   - path to umbrella TZ;
   - target app;
   - source materials;
   - status of step 01;
   - `allowed_next_step = 02_decompose_umbrella_tz_into_stages`;
   - recommended next step.
10. В финале дай:
   - app-boundary split;
   - reuse/new ownership summary;
   - created/updated files;
   - open questions/deferred items;
   - next step;
   - итоговый статус: `Ready for decomposition` / `Ready for one-stage implementation` / `Blocked`.

Важно:
- Код не писать.
- Не менять backend docs.
- Не переносить app-specific scope в root docs.
- Не создавать shared package requirements без реального второго consumer.
- Не перепрыгивать к implementation.
```
