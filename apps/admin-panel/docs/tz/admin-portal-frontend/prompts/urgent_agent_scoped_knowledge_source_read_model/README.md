# Urgent Agent-Scoped Knowledge Source Read Model Prompt Package

This directory contains adapted prompts for the post-finalization urgent
Agent-Scoped Knowledge Source Read Model stage.

Canonical reusable templates stay in:

- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/prompts/`

Urgent stage source:

- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/URGENT_AGENT_SCOPED_KNOWLEDGE_SOURCE_READ_MODEL_TZ.md`
- `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_agent_scoped_knowledge_source_read_model.md`

Backend source TZ, read-only:

- `/Volumes/Work/AI_Agents/ai_core/docs/productization/first-service-sales-support/tz/TZ-SVC-11_agent_scoped_knowledge_source_portal_read_model_closure/TZ-SVC-11-FRONTEND_agent_knowledge_screen.md`

## Prompt Order

1. `03_urgent_agent_scoped_knowledge_source_read_model_consistency_review_prompt.md`
2. `04_urgent_agent_scoped_knowledge_source_read_model_implementation_prompt.md`
3. `05_urgent_agent_scoped_knowledge_source_read_model_acceptance_review_prompt.md`
4. `06_urgent_agent_scoped_knowledge_source_read_model_docs_sync_prompt.md`

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
- The existing Knowledge route remains
  `/tenants/:tenantId/agents/:agentId/knowledge`.

## Current Expected State

- current status:
  `post-finalization-urgent-agent-scoped-knowledge-docs-synced`
- allowed next step:
  `none`
- optional next step:
  `none`
- state ledger:
  `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/pipeline_state.md`
- urgent stage:
  `/Volumes/Work/PC/ai_admin_panel/apps/admin-panel/docs/tz/admin-portal-frontend/stages/urgent_stage_agent_scoped_knowledge_source_read_model.md`

The accepted 13-stage umbrella remains closed; this urgent package must not
create `stage_14`.

The urgent Agent-Scoped Knowledge Source Read Model stage has been
implemented, accepted and docs-synced. Reopen it only through a new explicit
urgent package or a scoped fix-pass recorded in `pipeline_state.md`.
