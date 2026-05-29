# Urgent Release Retrieval Evidence Operator Flow Prompt Package

This directory contains adapted prompts for the post-finalization urgent
Release Retrieval Evidence Operator Flow stage.

Canonical reusable templates stay in:

- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/`

Urgent stage source:

- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_RELEASE_RETRIEVAL_EVIDENCE_OPERATOR_FLOW_TZ.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_release_retrieval_evidence_operator_flow.md`

Backend source TZ, read-only:

- `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/tz/TZ-SVC-10_release_retrieval_evidence_operator_flow/FRONTEND_RELEASE_SCREEN_RETRIEVAL_EVIDENCE_TZ.md`

## Prompt Order

1. `03_urgent_release_retrieval_evidence_operator_flow_consistency_review_prompt.md`
2. `04_urgent_release_retrieval_evidence_operator_flow_implementation_prompt.md`
3. `05_urgent_release_retrieval_evidence_operator_flow_acceptance_review_prompt.md`
4. `06_urgent_release_retrieval_evidence_operator_flow_docs_sync_prompt.md`

## Gate Rules

- This urgent package does not reopen the accepted 13-stage umbrella.
- Do not create `stage_14`.
- Do not start prompt 04 before urgent prompt 03 accepts the stage.
- Do not start prompt 05 before prompt 04 records implementation files,
  commands and notes.
- Do not start prompt 06 before prompt 05 accepts the urgent stage.
- Runtime code may be changed only in prompt 04.
- Prompt 03, 05 and 06 may edit docs/ledger only.
- Backend/product docs are read-only supporting context.

## Current Expected State

- current status:
  `post-finalization-urgent-release-retrieval-evidence-stage-created-ready-for-consistency-review`
- allowed next step:
  `03_urgent_release_retrieval_evidence_operator_flow_consistency_review`
- optional next step:
  `none`
- state ledger:
  `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md`
- urgent stage:
  `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_release_retrieval_evidence_operator_flow.md`

The accepted 13-stage umbrella remains closed; this urgent package must not
create `stage_14`.
