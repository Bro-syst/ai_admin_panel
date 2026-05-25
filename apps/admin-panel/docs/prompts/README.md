# AI Admin Panel Prompt Pipeline

Этот каталог хранит canonical prompt-шаблоны для разработки frontend-задач в
`ai_admin_panel`: от анализа backend/product scope и umbrella frontend `TZ` до
реализации этапов, проверки, documentation sync и финального закрытия.

Pipeline рассчитан на работу агентами. Его цель — не ускорить любой ценой, а
снизить scope drift, не дать перескочить этапы и удержать архитектурные правила
проекта.

## Source Of Truth

Repository root:

- `/Volumes/Work/PC/ai_admin_panel/docs/overview.md`
- `/Volumes/Work/PC/ai_admin_panel/docs/architecture.md`
- `/Volumes/Work/PC/ai_admin_panel/docs/development-guide.md`
- `/Volumes/Work/PC/ai_admin_panel/docs/recipes.md`

Admin app:

- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/overview.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/architecture.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/development-guide.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/recipes.md`

Client app:

- `/Volumes/Work/PC/ai_admin_panel/apps/client-panel/docs/architecture.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/client-panel/docs/development-guide.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/client-panel/docs/recipes.md`

Backend docs are read-only supporting context. For AI Core admin backend, the
usual source is:

- `/Volumes/Work/AI_Agents/ai_core/docs/api/portals/admin/README.md`
- `/Volumes/Work/AI_Agents/ai_core/docs/api/portals/admin/frontend_integration_adapter.md`

## Hard Boundaries

- Work only inside `/Volumes/Work/PC/ai_admin_panel`, unless the user explicitly
  asks otherwise.
- `apps/admin-panel` and `apps/client-panel` are separate deployable apps.
- One app must not import another app's internals.
- Shared code moves to `packages/` only after a real second consumer and a stable
  public API exist.
- Backend contracts and backend `TZ` explain what the backend does; they do not
  automatically authorize frontend scope.
- No compatibility adapter or temporary shim is allowed unless the umbrella `TZ`
  explicitly records it as accepted technical debt with removal criteria.
- Do not implement future-stage UI/actions early. Absence of future-stage UI is
  acceptable; premature half-wired UI is a finding.

## Engineering Principles

Every prompt in this pipeline must preserve these engineering rules. They are
not optional style preferences; they are acceptance criteria for frontend work.

- Scenario first: implement the smallest complete user/admin scenario that the
  accepted `TZ` requires.
- Reuse before creating: inspect existing routes, API services, hooks,
  components, i18n keys, tests and docs before adding new owners.
- Prefer local ownership: keep code inside the owning app/module until a real
  second consumer and a stable public API justify extraction to `packages/`.
- Keep modules cohesive: each module/page/hook should have one clear reason to
  change. Split orchestration, transport mapping and rendering when they start
  carrying different responsibilities.
- Keep contracts at boundaries: backend DTO parsing/mapping belongs in API or
  model layers, not in pages or presentational UI.
- Avoid duplicate source of truth: one owner for auth/session state, one owner
  for domain state, and no shadow copies that can drift.
- Keep abstractions earned: do not add factories, registries, global providers,
  shared packages or generic helpers until they remove real duplication or
  match an established local pattern.
- Depend on public APIs: modules should use other modules only through explicit
  public exports; apps must not import another app's internals.
- Make behavior testable: important branches, DTO mapping, guards and
  regression-sensitive UI states need focused tests near the owning code.
- Preserve accessibility and security basics: accessible names/roles for
  interactive UI, backend-owned auth/security truth, cookie/CSRF rules, and no
  token storage in browser storage.
- Prefer readable, boring code over cleverness. A clear small function beats an
  abstract framework unless the stage proves otherwise.

## Pipeline Files

1. [`01_discovery_create_umbrella_frontend_tz_prompt.md`](01_discovery_create_umbrella_frontend_tz_prompt.md)
   Study backend/product input, inspect current frontend, and create/update an
   umbrella frontend `TZ`.

2. [`02_decompose_umbrella_tz_into_stages_prompt.md`](02_decompose_umbrella_tz_into_stages_prompt.md)
   Split the reviewed umbrella `TZ` into minimal sequential stage `TZ` files.

3. [`03_stage_tz_consistency_review_prompt.md`](03_stage_tz_consistency_review_prompt.md)
   Check stage `TZ` files against umbrella scope and architecture.

4. [`04_stage_implementation_prompt.md`](04_stage_implementation_prompt.md)
   Implement exactly one accepted stage, or run a scoped fix-pass.

5. [`05_stage_acceptance_review_prompt.md`](05_stage_acceptance_review_prompt.md)
   Review an implemented stage against its stage `TZ`, umbrella `TZ`, tests and
   architecture.

6. [`06_stage_docs_sync_prompt.md`](06_stage_docs_sync_prompt.md)
   Update docs after a stage is accepted.

7. [`07_umbrella_finalization_prompt.md`](07_umbrella_finalization_prompt.md)
   Final acceptance for the whole umbrella `TZ` after all stages are accepted.

8. [`08_generate_adapted_execution_prompts_prompt.md`](08_generate_adapted_execution_prompts_prompt.md)
   Generate task-specific copies of prompts 04/05/06/07 with real paths, stage
   names and acceptance gates already filled in.

## Pipeline State

Every real task should have a small ledger file, for example:

```text
apps/admin-panel/docs/tz/<umbrella-slug>/pipeline_state.md
```

The ledger must record:

- `FRONTEND_TZ_PATH`
- `TARGET_APP`
- stage list
- status of each pipeline step
- accepted/deferred/blocking findings
- commands that were run
- links to generated task-specific prompts, if any

Prompt steps must read the ledger before acting and update it when their step
finishes. If the ledger is missing, step `01` may create it; later steps should
return `Blocked` unless the user explicitly confirms the previous gate result.

## Mandatory Gate Ledger

Every `pipeline_state.md` must make the next legal action explicit. A prompt may
not infer permission to continue only from prose in previous chat messages.

Minimum required fields/sections:

- `current_step` or top-level `Status`;
- `allowed_next_step`;
- `steps` table or section with every pipeline step and status;
- `stages` table or section after prompt `02`;
- `accepted_decisions`;
- `blocked_findings`;
- `deferred_items`;
- `commands_run`;
- `changed_files`;
- `next_step`.

Gate rules:

- The active prompt must match `allowed_next_step`, except prompt `08`, which is
  an optional helper allowed after prompt `03` and must not replace prompt `04`.
- A prompt must return `Blocked` when `pipeline_state.md` is missing, stale,
  points to different `FRONTEND_TZ_PATH`/`TARGET_APP`, has unresolved
  `blocked_findings`, or lacks the previous step status required by this
  README.
- A stage prompt must verify the selected `STAGE_NAME` and `STAGE_TZ_PATH`
  match the stage list in `pipeline_state.md`.
- A stage cannot be implemented until all dependency/previous stages are either
  accepted and docs-synced or explicitly marked independent in the stage `TZ`
  and pipeline state.
- A prompt may not rewrite previous step statuses to make its own gate pass. If
  a previous status is wrong, return `Blocked` and ask to rerun the missing
  step or run the proper fix-pass.
- After successful completion, the prompt must set `allowed_next_step` to the
  next required prompt and record any optional prompt, such as `08`, separately.

## Status Contract

- `01` finishes with `Ready for decomposition` / `Ready for one-stage implementation` / `Blocked`.
- `02` finishes with `Stage TZ package created` / `One-stage decision recorded` / `Blocked`.
- `03` finishes with `Stage package ready for implementation` / `Ready with documented deferred items` / `Blocked`.
- `04` finishes with `Stage ready for acceptance review` / `Ready with documented deferred items` / `Blocked`.
- `05` finishes with `Stage accepted` / `Stage accepted with documented deferred items` / `Blocked`.
- `06` finishes with `Stage docs synced` / `Docs sync not required` / `Blocked`.
- `07` finishes with `Accepted` / `Accepted with documented deferred items` / `Blocked`.
- `08` finishes with `Adapted prompt package created` / `Blocked`.

Task ledgers may use more specific machine-readable variants such as
`step-01-code-grounded-ready-for-decomposition`, but they must still map
unambiguously to one of the allowed status meanings and must set
`allowed_next_step`.

## Stop Gates

- Do not run `02` before `01` has produced an umbrella frontend `TZ`.
- Do not run `03` before `02` has created stages or recorded a one-stage
  decision.
- Do not run `04` before `03` has accepted the stage package, unless the task is
  explicitly one-stage and the ledger records that decision.
- Do not run `05` before `04` has completed the selected stage.
- Do not run `06` before `05` accepts the stage.
- Do not run `07` before every stage has passed `05` and stage docs sync has
  either run or been explicitly marked not required.
- Do not use `06` docs sync or `07` finalization to hide `Blocked` findings.
  Return to `04` as a fix-pass, then repeat `05`.
- `08` may run after `03`; it creates reusable execution prompts but does not
  itself count as implementation, review, docs sync or final acceptance.

In addition to the bullets above, every prompt must enforce
`allowed_next_step`. If `allowed_next_step` points to a different prompt, stop
with `Blocked` even if the user asks to jump ahead.

## Shared Variables

Use the same variable names across all prompts:

- `TARGET_APP` — `apps/admin-panel`, `apps/client-panel`, or explicit multi-app
  scope.
- `BACKEND_TZ_PATH` — backend `TZ`, or `не используется`.
- `BACKEND_SUPPORTING_DOCS` — backend notes/contracts/checklists, or
  `не используется`.
- `FRONTEND_TZ_PATH` — umbrella frontend `TZ`.
- `PIPELINE_STATE_PATH` — task ledger.
- `STAGE_OUTPUT_DIR` — directory containing stage `TZ` files.
- `STAGE_NAME` — selected stage name.
- `STAGE_TZ_PATH` — selected stage `TZ`.
- `PROMPT_OUTPUT_DIR` — directory for task-specific prompts generated by `08`.

Do not rename these variables per step. Do not reset real paths back to
placeholders unless the user explicitly asks to convert a working prompt back
into a template.

## Quality Gates

For admin-only changes, default checks are:

```bash
npm run test:admin
npm run lint:admin
npm run build:admin
```

For client-only changes:

```bash
npm run test:client
npm run lint:client
npm run build:client
```

For cross-app or root architecture changes:

```bash
npm test
npm run lint
npm run build
```

Use narrower checks during implementation when useful, but final acceptance
must justify any omitted gate.
