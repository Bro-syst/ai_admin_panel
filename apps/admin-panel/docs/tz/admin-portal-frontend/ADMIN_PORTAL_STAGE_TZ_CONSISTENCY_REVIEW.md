# Admin Portal Stage TZ Consistency Review

Status: `stage-package-ready-for-implementation`

Date: `2026-05-12`

## Gate Result

Passed.

- `pipeline_state.md` allowed prompt `03_stage_tz_consistency_review`.
- Step 02 was complete with output `stages/*.md`.
- All 13 expected stage files exist.
- `blocked_findings` was `none`.
- Target app, umbrella TZ path and stage output directory matched the prompt.

## Findings Fixed During Review

| Finding | Risk | Fix |
| --- | --- | --- |
| Stage 04 described provisioning correlation/idempotency but did not explicitly bind `provisioning_correlation_id` to the body and `X-Request-ID` behavior. | Implementation could fall back to interceptor-only request metadata and drift from backend provisioning contracts. | Stage 04 now requires body correlation, same-value `X-Request-ID` where controlled, and retry-stable `idempotency_key`. |
| Stage 08 introduced `AgentKnowledgeBinding` without explicitly requiring the standard module subfolders. | A new module could be implemented outside the accepted `api/model/pages/ui` ownership pattern. | Stage 08 now requires `src/modules/AgentKnowledgeBinding/{api,model,pages,ui}` where binding behavior is not owned by `Knowledge`. |
| Stage 10 required public widget smoke isolation but did not explicitly forbid using admin `apiClient` transport. | Public smoke could accidentally send admin cookies as visitor identity. | Stage 10 now requires a dedicated public widget API helper isolated from admin `apiClient` and admin cookies. |

No blocking findings remain.

## OpenAPI Contract Correction: 2026-05-12

Status: `applied`

The backend contract was rechecked against the live OpenAPI document:
- primary OpenAPI path: `/openapi.json`;
- compatibility OpenAPI alias: `/api/v1/openapi.json`.

Result:
- no dedicated backend security endpoint is implemented under `/api/admin/v1`;
- `/security` is a frontend route only;
- Stage 01 must use the existing OpenAPI-listed paths:
  `/api/admin/v1/auth/login`, `/api/admin/v1/auth/refresh`,
  `/api/admin/v1/auth/logout`, `/api/admin/v1/auth/logout-all`,
  `/api/admin/v1/auth/me`, `/api/admin/v1/users/me`,
  `/api/admin/v1/auth/sessions`,
  `/api/admin/v1/auth/sessions/{session_id}`,
  `/api/admin/v1/auth/totp`,
  `/api/admin/v1/auth/totp/enrollment`,
  `/api/admin/v1/auth/totp/confirm`,
  `/api/admin/v1/auth/totp/disable`,
  and password setup/reset auth endpoints.

Documentation was corrected so this is treated as a real OpenAPI contract
correction, not as a soft clarification.

## Coverage Map

| Umbrella Area | Covered By | Ownership / Verification |
| --- | --- | --- |
| Auth, frontend `/security` route, sessions, TOTP, password route aliases, error fallback | Stage 01 | `core/router`, `core/auth`, `core/api`, `AdminSecurity`, route/auth/security regression tests; no dedicated backend security endpoint |
| Internal admin users | Stage 02 | `AdminUsers/{api,model,pages,ui}`, permission-aware mutations and confirmations |
| Operator shell and navigation discipline | Stage 03 | `AppShell`, route metadata, no future links/placeholders |
| Tenant provisioning and tenant operations | Stage 04 | `Tenants/{api,model,pages,ui}`, portal read models, correlation/idempotency tests |
| Dashboard and operations | Stage 05 | `Operations/{api,model,pages,ui}`, backend read models, root redirect changes only after dashboard tests |
| Agent templates and agent lifecycle | Stage 06 | `AgentTemplates`, `Agents`, tenant context and lifecycle tests |
| Agent config lifecycle | Stage 07 | `AgentConfig`, fixed editable schema and backend validation results |
| Knowledge source management and agent binding | Stage 08 | `Knowledge`, `AgentKnowledgeBinding`, managed source/indexing/readiness contracts |
| Capabilities and policy | Stage 09 | `AgentCapabilities`, `AgentPolicy`, backend catalogs and validation results |
| Sites, widgets, public smoke and releases | Stage 10 | `SitesWidgets`, `Releases`, dedicated public widget helper and backend-owned release gates |
| Conversations and support inspection | Stage 11 | `Conversations`, support-safe read models and close confirmation |
| Usage, metering and billing export | Stage 12 | `UsageBilling`, backend billing-safe read models, no frontend pricing/math |
| Final smoke, evidence and docs closure | Stage 13 | E2E verification, forbidden-call searches, docs and pipeline evidence |

## Consistency Verdict

- Completeness: passed. No umbrella, checklist, UI/UX or API-reference area was
  lost in stage decomposition.
- Stage order/minimality: passed. The 13-stage split is minimal enough for
  independent verification and avoids duplicate ownership.
- Runtime safety: passed. Baseline auth/security/settings behavior remains
  preserved, and authenticated `/` moves to `/dashboard` only in Stage 05 after
  the dashboard is real and tested.
- Architecture: passed after the Stage 08 ownership clarification.
- Frontend/backend responsibility: passed after the Stage 04 and Stage 10
  clarifications.
- Engineering/reuse: passed. Stage files keep DTO mapping in `api`,
  orchestration in `model`, route composition in `pages`, presentational work
  in `ui`, and do not request speculative shared extraction.

## Allowed Next Steps

- Prompt 04 is allowed for one stage at a time.
- Optional prompt 08 is allowed to generate stage-specific execution prompts
  before running prompt 04.

## Repeat Audit: 2026-05-12

Status: `stage-package-ready-for-implementation`

Gate mode:
- explicit repeat-audit requested after prompt 03 had already passed;
- `allowed_next_step` stayed `04_stage_implementation`;
- `optional_next_step` stayed `08_generate_adapted_execution_prompts`;
- runtime code was not changed.

Additional findings fixed:

| Finding | Risk | Fix |
| --- | --- | --- |
| The Admin Portal adapted prompts README still said the package was ready for prompt 03. | A future operator could rerun the wrong gate or think prompt 03 had not passed. | Updated the README to show prompt 03 complete, prompt 04 allowed and prompt 08 optional. |
| The adapted prompt 03 did not document explicit repeat-audit mode after the stage package was accepted. | A valid user-requested re-check could be reported as `Blocked` only because the ledger had correctly advanced to prompt 04. | Added repeat-audit gate rules that preserve prompt 04/08 next-step state and forbid runtime implementation. |

Repeat audit verdict:
- stage coverage remains complete;
- 13-stage order remains minimal and safe;
- architecture boundaries remain accepted;
- no new stage-blocking findings were found.

## Urgent Agent Config Operator UX Review: 2026-05-20

Status: `urgent-stage-ready-for-implementation`

Gate result:
- `pipeline_state.md` allowed prompt
  `03_urgent_agent_config_operator_ux_consistency_review`;
- urgent stage source and stage TZ paths matched the prompt;
- Stages 01-13 are accepted and docs-synced/not required;
- umbrella finalization is complete;
- `blocked_findings` was `none`;
- runtime code was not changed.

Findings fixed during review:

| Finding | Risk | Fix |
| --- | --- | --- |
| The urgent stage required mutation evidence but did not explicitly enumerate `resource id`, `result/status`, and config `version` as displayed evidence fields. | Prompt 04 could improve copy/correlation feedback while still missing backend-returned status/version evidence from the source urgent TZ. | The urgent stage now requires safe backend-returned action, resource type/id, result/status, version when applicable, correlation/request id and timestamp, with explicit fallback rules for missing status/result/version evidence. |

Coverage result:
- all requirements from
  `URGENT_AGENT_CONFIG_OPERATOR_UX_FIX_TZ.md` are represented in the urgent
  stage after the evidence clarification;
- the urgent stage is a post-finalization fix and does not create `stage_14`;
- no new route, global navigation, customer portal scope, backend-only scope or
  public widget runtime change is requested;
- required tests remain assigned to AgentConfig, Agent Detail, Tenant Detail
  and reusable evidence/copy primitives where touched.

Architecture and reuse result:
- `AgentConfig` remains the owner for option metadata, form/model/API changes,
  validation state and create-version endpoint choice;
- `Agents` is limited to Agent Detail guidance and backend-read-model next
  step display;
- `Tenants` is limited to existing mutation evidence display;
- `shared/ui` may evolve only for narrow reusable copy/evidence primitives and
  must not receive business logic;
- API/DTO mapping remains in module API/model boundaries; pages/UI do not call
  transport directly.

Degradation-safety result:
- accepted auth/session/security, tenants, agents, AgentConfig, route smoke and
  finalization baselines are preserved;
- backend validation/read models remain the authority for validity, blockers
  and next steps;
- no local readiness, release, policy, billing, metering, pricing or
  model-routing calculation is permitted;
- evidence blocks must not render access/refresh tokens, secrets, provider
  keys, internal prompts or backend-internal payloads.

Allowed next step:
- urgent prompt 04 is allowed:
  `04_urgent_agent_config_operator_ux_implementation`.
