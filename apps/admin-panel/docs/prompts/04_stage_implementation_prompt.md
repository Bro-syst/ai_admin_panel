# Prompt 04: Stage Implementation Or Fix Pass

## Purpose

Use this to implement one accepted stage, one-stage `TZ`, or a focused fix-pass
after prompt `05` or `07` returned concrete findings.

This step may edit code, tests and docs within the approved scope.

## Template

```text
TARGET_APP = apps/admin-panel
BACKEND_TZ_PATH = {BACKEND_TZ_PATH}
BACKEND_SUPPORTING_DOCS = {BACKEND_SUPPORTING_DOCS}
FRONTEND_TZ_PATH = {FRONTEND_TZ_PATH}
PIPELINE_STATE_PATH = {PIPELINE_STATE_PATH}
STAGE_NAME = {STAGE_NAME}
STAGE_TZ_PATH = {STAGE_TZ_PATH}

Реализуй stage `{STAGE_NAME}` по stage ТЗ `{STAGE_TZ_PATH}`.

Если это one-stage task, `STAGE_NAME = one-stage` и `STAGE_TZ_PATH` указывает на единственный stage/umbrella ТЗ.

Если в запросе есть findings из prompt 05 или 07, работай как fix-pass: исправь только эти findings и не расширяй scope.

Pipeline gate:
1. Перечитай `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/README.md`.
2. Перечитай `PIPELINE_STATE_PATH`.
3. Проверь, что `allowed_next_step` указывает на prompt `04` for this
   `STAGE_NAME`, or that pipeline state records this as an explicit prompt 04
   fix-pass for findings from prompt 05/07.
4. Продолжай только если step 03 имеет статус `Stage package ready for
   implementation` или `Ready with documented deferred items`.
5. Проверь, что `STAGE_NAME` and `STAGE_TZ_PATH` match the stage list in
   `PIPELINE_STATE_PATH`.
6. Для staged work проверь, что previous/dependency stages are accepted and
   docs-synced, unless the stage `TZ` and pipeline state explicitly mark this
   stage independent.
7. Если gate не пройден и это не explicit fix-pass, остановись со статусом
   `Blocked`.

Обязательные документы:
- `{FRONTEND_TZ_PATH}`;
- `{STAGE_TZ_PATH}`;
- root architecture/development docs;
- docs выбранного `TARGET_APP`;
- backend docs only as read-only supporting context.

Что нужно сделать:
1. Перечитать umbrella `TZ` and selected stage `TZ`.
2. Найти current owners before editing:
   - routes;
   - API/services;
   - DTO mapping;
   - model/hooks;
   - pages/UI;
   - i18n/theme/layout;
   - tests;
   - docs.
3. Перед созданием нового кода принять reuse decision:
   - reuse existing helpers/components/hooks when they already fit;
   - extend an existing owner only if it remains cohesive;
   - create a new owner when an existing owner would gain a second unrelated
     reason to change;
   - extract shared code only after real repetition or established local
     pattern;
   - avoid duplicate state, duplicate DTO mapping and duplicate validation.
4. Реализовать только selected stage:
   - no future-stage screens/actions;
   - no placeholder UI that looks functional;
   - no duplicate source of truth;
   - no speculative shared extraction;
   - no direct axios calls from pages/UI;
   - no domain logic in shared;
   - no app internals imported by another app;
   - keep components, hooks and services small enough to have clear ownership;
   - keep backend contract adaptation outside presentational UI.
5. Если backend contract ambiguity appears:
   - cross-check backend docs;
   - if still ambiguous, record blocker/open question;
   - do not invent backend behavior.
6. Add or update tests for:
   - API mapping if payload shape is unstable;
   - route/page behavior;
   - auth/security/guard behavior if touched;
   - regression-sensitive cases from stage `TZ`.
7. Update docs only if implementation changes behavior, owners or repeatable recipe.
8. Run relevant checks:
   - admin-only: `npm run test:admin`, `npm run lint:admin`, `npm run build:admin`;
   - client-only: `npm run test:client`, `npm run lint:client`, `npm run build:client`;
   - cross-app/root: `npm test`, `npm run lint`, `npm run build`.
   Use narrower commands only when justified.
9. Update `PIPELINE_STATE_PATH`:
   - implemented stage;
   - files changed;
   - reuse/new owner decisions;
   - commands run;
   - known deferred items;
   - status of step 04 for selected stage;
   - `allowed_next_step = 05_stage_acceptance_review` for selected stage.
10. В финале дай:
   - what was implemented;
   - stage/fix-pass scope;
   - boundaries preserved;
   - reuse/new ownership decisions;
   - tests/checks run;
   - remaining blockers/deferred items;
   - итоговый статус: `Stage ready for acceptance review` / `Ready with documented deferred items` / `Blocked`.

Важно:
- Do not skip to docs sync or final acceptance.
- Do not implement another stage.
- Do not hide blockers with docs.
- If work touches visual UI, keep design consistent with existing app and verify responsive states when possible.
```
