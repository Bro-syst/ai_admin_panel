# Stage 10: Sites, Widgets And Releases

Status: `ready-for-stage-implementation`

## Goal

Connect agents to public widget channels and manage controlled release
publication with backend-owned readiness, evidence and rollback contracts.

## Dependencies

- Stages 01-09 are accepted and implemented.
- Prompt 03 accepts this stage TZ before implementation.

## Exact Scope

- Add `src/modules/SitesWidgets` and `src/modules/Releases`.
- Add:
  - `/tenants/:tenantId/agents/:agentId/sites-widgets`
  - `/tenants/:tenantId/agents/:agentId/releases`
- Implement site/widget list/detail/create/status/binding where contracts allow.
- Display backend-derived install/embed guidance.
- Implement controlled public widget smoke helper/evidence flow.
- Implement release list/detail/draft, readiness, evidence, manual override,
  publish, rollback, disable and active release snapshot.

## Out Of Scope

- Customer-facing widget application development.
- Admin cookie use as public visitor identity.
- Frontend-generated readiness or release gate calculations.
- Billing, support and conversation inspection.

## Routes / Navigation Impact

- Add Sites & Widgets and Releases links in implemented agent context.
- Links to Conversations/Usage/Billing remain absent until later stages.

## Module / File Ownership

- `src/modules/SitesWidgets/{api,model,pages,ui}` owns site/widget UX and smoke
  helper orchestration.
- `src/modules/Releases/{api,model,pages,ui}` owns release UX.
- Public widget smoke calls use a dedicated public widget API helper and remain
  isolated from admin `apiClient` and admin-cookie identity handling.

## Reuse Rules And Responsibility Boundaries

- Pages/ui do not call `apiClient`.
- Backend snippets or returned markers drive embed guidance.
- Release readiness, gate mode and manual override display are backend-owned.
- Public widget smoke uses public widget runtime identity, never admin cookies
  or authenticated admin transport.

## API Contracts

- `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/sites-widgets`
- `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}/release-readiness`
- Management groups:
  `/api/admin/v1/tenants/{tenant_id}/sites*`,
  `/api/admin/v1/tenants/{tenant_id}/widgets*`,
  `/api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/releases*`.
- Public smoke:
  - `GET /api/v1/widget/bootstrap`
  - `POST /api/v1/widget/session`
  - `GET /api/v1/widget/session`
  - `GET /api/v1/widget/chats/{chat_id}/messages`
  - `POST /api/v1/widget/chats/{chat_id}/messages`
  - `GET /api/v1/widget/chats/{chat_id}/messages/{message_id}`

## UI/UX States

- Sites/widgets show loading, empty, error, status and binding states.
- Install guidance displays/copies backend-returned marker, key, allowed
  origins and snippet guidance.
- Public smoke covers invalid key, invalid origin, not-ready, throttled and
  normal message-flow states.
- Release confirmations cover publish, rollback and disable with version,
  status, gate mode and active marker.
- Manual override captures `reason_code`,
  `related_missing_or_failed_items` and optional `comment`.

## Access / Security Requirements

- Protected admin routes for management.
- Public widget smoke must not reuse admin cookies as visitor identity.
- Release mutations are permission-aware and CSRF-protected.
- Manual override visibility follows backend permissions/fields.

## Tests And Verification Commands

- `npm run test:admin`
- `npm run lint:admin`
- `npm run build:admin`
- Tests cover snippet rendering source, release readiness mapping, manual
  override payload, publish/rollback/disable confirmations and public smoke
  identity separation.

## Docs Impact

- Update sites/widgets/release docs and evidence recipes after acceptance.

## Acceptance Criteria

- Operators can manage approved sites/widgets and releases.
- Embed guidance is backend-derived.
- Release readiness and gate decisions are backend-owned.
- Public smoke flow does not leak admin identity.

## Future-Stage Forbidden Actions

- Do not implement Conversations, Usage, Metering or Billing Export.
- Do not calculate readiness locally.
- Do not build customer widget runtime UI.

## Expected Gate Result

- Prompt 03 verifies sites/widgets/release scope and contracts.
- Prompt 04 may implement Stage 10 only after Stages 01-09 are accepted.
