# Urgent Agent Config Operator UX Prompt Package

This directory contains adapted prompts for the post-finalization urgent
Agent Config operator UX and mutation evidence fix.

Canonical reusable templates stay in:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/`

Urgent stage source:
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_AGENT_CONFIG_OPERATOR_UX_FIX_TZ.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_agent_config_operator_ux_fix.md`

## Prompt Order

1. `03_urgent_agent_config_operator_ux_consistency_review_prompt.md`
2. `04_urgent_agent_config_operator_ux_implementation_prompt.md`
3. `05_urgent_agent_config_operator_ux_acceptance_review_prompt.md`
4. `06_urgent_agent_config_operator_ux_docs_sync_prompt.md`

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
  `post-finalization-urgent-agent-config-operator-ux-docs-synced-accepted`
- allowed next step:
  `none`
- state ledger:
  `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md`
- urgent stage:
  `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_agent_config_operator_ux_fix.md`

The urgent stage is implemented, accepted and docs-synced. The accepted
13-stage umbrella remains closed; this urgent package did not create
`stage_14`.
