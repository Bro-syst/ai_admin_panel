# Stage 11: Conversations And Support

Status: `ready-for-stage-implementation`

## Goal

Provide support-safe runtime conversation inspection for tenant operations.

## Dependencies

- Stages 01-10 are accepted and implemented.
- Prompt 03 accepts this stage TZ before implementation.

## Exact Scope

- Add `src/modules/Conversations`.
- Add `/tenants/:tenantId/conversations`.
- Implement runtime summary, chat list/detail, messages, message detail, turns,
  turn detail, current memory view and approved close action.
- Link to usage/model request/retrieval evidence only where returned and safe.

## Out Of Scope

- Editing conversations, messages or model outputs.
- Displaying internal prompts/secrets unless backend marks fields support-safe.
- Usage/billing export screens.
- Customer portal support UI.

## Routes / Navigation Impact

- Add Conversations link under Production or tenant operations navigation.
- Do not add Usage/Billing links until Stage 12.

## Module / File Ownership

- `src/modules/Conversations/api` owns endpoint calls and DTO mapping.
- `src/modules/Conversations/model` owns filters, selected chat/turn/message,
  refresh and close orchestration.
- `src/modules/Conversations/pages` owns route composition.
- `src/modules/Conversations/ui` owns lists, timeline and detail panels.

## Reuse Rules And Responsibility Boundaries

- Pages/ui do not call `apiClient`.
- Backend support-safe fields are the display boundary.
- Read-only by default; close action only if backend contract/permission allows.
- No direct runtime database or provider calls.

## API Contracts

- `GET /api/admin/v1/portal/tenants/{tenant_id}/conversations/runtime-summary`
- Management/drill-down group:
  `/api/admin/v1/tenants/{tenant_id}/chats*`.

## UI/UX States

- Runtime summary and chat list support loading, empty, filtered-empty, error
  and refresh states.
- Message/turn detail supports missing redacted data clearly.
- Close chat action requires confirmation and shows result/correlation state.
- Evidence links are visible only when returned and routeable.

## Access / Security Requirements

- Protected tenant-scoped route.
- Support-safe display only.
- Close action is permission-aware and CSRF-protected.

## Tests And Verification Commands

- `npm run test:admin`
- `npm run lint:admin`
- `npm run build:admin`
- Tests cover support-safe mapping, redaction states, close confirmation,
  runtime summary and absence of edit controls.

## Docs Impact

- Update support/conversation docs after acceptance.

## Acceptance Criteria

- Operators can inspect support-safe conversation runtime data.
- Conversation UI is read-only except approved close action.
- Usage/billing functionality is not introduced.

## Future-Stage Forbidden Actions

- Do not implement Usage, Metering or Billing Export.
- Do not expose internal prompts/secrets.
- Do not call internal runtime databases directly.

## Expected Gate Result

- Prompt 03 verifies support-safe conversation scope.
- Prompt 04 may implement Stage 11 only after Stages 01-10 are accepted.
