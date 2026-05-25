# Stage 06: Agent Templates And Agents

Status: `ready-for-stage-implementation`

## Goal

Enable template-aware agent creation and lifecycle operation inside an existing
tenant context.

## Dependencies

- Stages 01-05 are accepted and implemented.
- Prompt 03 accepts this stage TZ before implementation.

## Exact Scope

- Add `src/modules/AgentTemplates` and `src/modules/Agents`.
- Add tenant-scoped agent routes.
- Implement template catalog/detail, create agent wizard, agent list/detail,
  allowed edit/status/lifecycle actions and setup/foundation/channel read
  sections.
- Prefer portal read models for list/detail summaries.

## Out Of Scope

- Agent config editing.
- Knowledge binding, capability/policy binding, sites/widgets, releases and
  conversations.
- Frontend-local agent readiness scoring.
- Generic CRUD agent admin outside tenant context.

## Routes / Navigation Impact

- Add:
  - `/tenants/:tenantId/agents`
  - `/tenants/:tenantId/agents/new`
  - `/tenants/:tenantId/agents/:agentId`
- Add Agents/Templates navigation only in tenant context or implemented route
  groups.
- Do not show Config/Knowledge/Policy/Sites/Releases links yet.

## Module / File Ownership

- `src/modules/AgentTemplates/{api,model,pages,ui}` owns template catalog UX.
- `src/modules/Agents/{api,model,pages,ui}` owns agent list/detail/lifecycle.
- `src/modules/Tenants` remains tenant context owner.
- Router/AppShell add implemented entries only.

## Reuse Rules And Responsibility Boundaries

- Pages/ui do not call `apiClient`.
- Template and agent DTO mapping remains in module `api/`.
- Agent create/edit lifecycle orchestration remains in `model/`.
- Backend read models are primary for summaries.

## API Contracts

- `GET /api/admin/v1/portal/tenants/{tenant_id}/agents`
- `GET /api/admin/v1/portal/tenants/{tenant_id}/agents/{agent_id}`
- `GET /api/admin/v1/tenants/{tenant_id}/agent-catalog`
- `POST /api/admin/v1/tenants/{tenant_id}/agents`
- `GET /api/admin/v1/tenants/{tenant_id}/agents`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}`
- `PATCH /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}`
- `PATCH /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/status`
- `PATCH /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/lifecycle`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/setup-checklist`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/foundation-assessment`
- `GET /api/admin/v1/tenants/{tenant_id}/agents/{agent_id}/channel-binding`

## UI/UX States

- Template catalog supports loading, empty, filter and detail states.
- Create wizard shows template selection, tenant context, validation, success
  and backend error states.
- Agent list/detail show lifecycle, setup and channel readiness where returned.
- Status/lifecycle actions require confirmation.

## Access / Security Requirements

- Protected tenant-scoped routes.
- Mutations permission-aware; critical actions default to admin-only if
  permissions are absent.
- No customer-facing widget identity or public runtime calls.

## Tests And Verification Commands

- `npm run test:admin`
- `npm run lint:admin`
- `npm run build:admin`
- Tests cover tenant route context, template selection, agent create payload,
  lifecycle confirmations and summary read model mapping.

## Docs Impact

- Update module/route docs after acceptance.

## Acceptance Criteria

- Operators can select a tenant, view/create agents from templates and manage
  allowed lifecycle states.
- Future setup tabs are absent until their stages ship.
- Existing tenant/dashboard/security/admin flows still pass.

## Future-Stage Forbidden Actions

- Do not implement Config, Knowledge, Capabilities, Policy, Sites, Widgets,
  Releases or Conversations.
- Do not calculate readiness locally.
- Do not expose placeholder setup actions.

## Expected Gate Result

- Prompt 03 verifies agent/template scope and contracts.
- Prompt 04 may implement Stage 06 only after Stages 01-05 are accepted.
