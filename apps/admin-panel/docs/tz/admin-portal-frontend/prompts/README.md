# Admin Portal Frontend Adapted Prompts

This directory contains Admin Portal-specific prompt variants for the frontend
delivery pipeline.

Canonical reusable templates stay in:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/`

Use this directory when working specifically on:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/`

## Prompt Order

1. `01_discovery_create_umbrella_frontend_tz_prompt.md`
2. `02_decompose_umbrella_tz_into_stages_prompt.md`
3. `03_stage_tz_consistency_review_prompt.md`
4. `04_stage_implementation_prompt.md`
5. `05_stage_acceptance_review_prompt.md`
6. `06_stage_docs_sync_prompt.md`
7. `07_umbrella_finalization_prompt.md`

The canonical gate rules still apply:
- read `pipeline_state.md` before each step;
- continue only when `allowed_next_step` matches the prompt number;
- do not skip prompt 03 before implementation prompt 04;
- do not write runtime code in prompts 01, 02 or 03;
- prompt 04 implements exactly one accepted stage at a time;
- prompt 05 reviews the implemented stage before docs sync;
- prompt 06 runs only after stage acceptance;
- prompt 07 runs only after every stage is accepted and docs synced/not
  required.

## Current Admin Portal State

The current Admin Portal package has completed the one-stage-at-a-time delivery
pipeline. Stages 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12 and 13 have
been implemented, accepted, and docs-synced. The Stage 01 public export
fix-pass has also been accepted and recorded as docs-sync-not-required.
Umbrella finalization is complete.

A post-finalization urgent fix stage for Agent Config operator UX and mutation
evidence is implemented, accepted and docs-synced.

A post-finalization urgent stage for Release Evidence Requirements UI has also
been implemented, accepted and docs-synced.

A post-finalization urgent stage for Release Retrieval Evidence Operator Flow
has also been implemented, accepted and docs-synced:

- current status: `post-finalization-urgent-release-retrieval-evidence-docs-synced`
- allowed next step: `none`
- optional next step: `none`
- state ledger:
  `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md`
- stage package:
  `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages`
- urgent stage TZ:
  `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_release_retrieval_evidence_operator_flow.md`
- urgent source TZ:
  `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_RELEASE_RETRIEVAL_EVIDENCE_OPERATOR_FLOW_TZ.md`
- urgent prompt package:
  `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/prompts/urgent_release_retrieval_evidence_operator_flow`

Both urgent release packages stay on the existing
`/tenants/:tenantId/agents/:agentId/releases` route and do not reopen the
accepted 13-stage umbrella as `stage_14`.
