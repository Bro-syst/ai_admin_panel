# Admin Portal UI/UX Spec

Status: `ready-for-implementation-package`

## Navigation

Navigation groups:
- Overview: Dashboard, Operations.
- Access: Security, Admin Users.
- Customers: Tenants.
- Agents: Templates, Agents.
- Agent Setup: Config, Knowledge, Capabilities, Policy, Sites & Widgets.
- Production: Releases, Conversations, Usage & Metering, Billing Export.

Rules:
- add a nav item only with a working protected route and useful page;
- no placeholder pages;
- selected tenant and selected agent context should be visible on scoped
  screens;
- status/readiness badges must use backend status values;
- root `/` stays redirected to `/settings` until Dashboard is real.

## Screen Specs

### Login And Password Access

Purpose:
- secure entry and password lifecycle.

Already implemented:
- login;
- password setup;
- password reset request/confirm;
- backend mail aliases.

UX requirements:
- clear errors for invalid credentials or expired/revoked session;
- no token display/storage;
- redirect authenticated users away from login.

### Security

Route:
- `/security`

Purpose:
- current admin session and TOTP management.

Required UI:
- active sessions list;
- revoke session;
- TOTP status;
- start enrollment;
- show QR/manual key only during enrollment;
- confirm enrollment;
- disable TOTP;
- logout all where available.

Implementation note:
- create a real protected page;
- reuse `AdminTotpPanel` and `AdminSessionsPanel`;
- do not implement as redirect to `/settings?tab=security`.

### Admin Users

Route:
- `/admins`

Purpose:
- day-2 internal admin/operator/viewer management after bootstrap.

Required UI:
- list admins;
- search/filter by email, role and status;
- safe detail drawer/page;
- create/invite admin;
- resend invite;
- disable/enable admin;
- revoke target admin sessions;
- show invite/setup/TOTP/session status through safe fields only.

Confirmations:
- disable;
- enable;
- revoke sessions.

Never show:
- raw setup token;
- password hash;
- refresh token internals;
- TOTP secret.

### Dashboard And Operations

Routes:
- `/dashboard`
- `/operations`

Purpose:
- one operational overview and next-action list.

Required UI:
- active tenants;
- active agents;
- failed onboarding/release checks;
- recent runtime degradation/errors;
- billing export failures;
- operations summary;
- links to tenant, agent, release, usage and billing screens.

Rules:
- use portal read models;
- do not infer health/readiness locally.

### Tenants

Routes:
- `/tenants`
- `/tenants/:tenantId`

Purpose:
- provision and inspect customer/service tenants.

Required UI:
- tenant list;
- tenant detail;
- provisioning wizard;
- provisioning status;
- external customer reference;
- optional external billing reference;
- provisioning correlation id;
- audit/correlation summary;
- allowed metadata/status/configuration actions.

Provisioning wizard v1:
- required: `tenant_name`, `external_customer_ref`;
- optional: `external_billing_ref`;
- default: `provisioning_source = admin_portal`;
- default: `requested_status = active`;
- generate `provisioning_correlation_id` and `idempotency_key` in model/API
  layer, not UI.

### Agent Templates And Agents

Routes:
- `/tenants/:tenantId/agents`
- `/tenants/:tenantId/agents/new`
- `/tenants/:tenantId/agents/:agentId`

Purpose:
- create and manage agents through backend-approved templates.

Required UI:
- template catalog;
- template detail;
- create agent wizard;
- tenant-scoped agents list;
- agent detail;
- edit allowed name/description/purpose;
- update status/lifecycle where allowed;
- setup checklist;
- foundation assessment;
- channel binding;
- template-driven required source-pack/category progress where returned.

Rules:
- do not hardcode one sales bot;
- do not hardcode AML/KYC runtime behavior.

### Agent Config

Route:
- `/tenants/:tenantId/agents/:agentId/config`

Purpose:
- manage versioned agent behavior configuration.

Editable schema:
- root `payload`;
- `identity`;
- `tone_and_language`;
- `goals`;
- `rules`;
- `restrictions`;
- `handoff_policy`;
- `integration_policy`;
- `model_preference`;
- `model_selection_hints`;
- `execution_profile_hints`;
- `compatibility_and_safety`.

Required UI:
- active config;
- version list;
- config detail;
- create draft/new version;
- validate;
- activate;
- rollback with target version confirmation.

Rules:
- no raw provider routing overrides;
- show validation before activation when backend requires it.

### Knowledge

Route:
- `/tenants/:tenantId/agents/:agentId/knowledge`

Purpose:
- manage tenant knowledge and bind approved source sets to agents.

Required UI:
- managed source registration;
- source list/detail;
- source metadata update;
- source disable;
- document registration/list/detail;
- document metadata update/disable;
- indexing job start/list/retry;
- index readiness;
- support-safe chunks/retrieval/support reconstruction where exposed;
- agent knowledge catalog and binding;
- readiness/release impact.

Fields to model where returned:
- `source_key`;
- `source_kind`;
- `allowed_agent_scope`;
- `allowed_agent_ids`;
- `access_scope`;
- `content_revision`;
- `content_reference`;
- `raw_content`;
- `chunking_profile`;
- `vectorization_profile`;
- `embedding_provider`;
- `embedding_model`;
- `embedding_version`;
- `idempotency_key`;
- `restricted_access_approved`.

Rules:
- no generic file upload unless backend exposes upload contract;
- no vector DB access;
- no cross-tenant source selection.

### Capabilities

Route:
- `/tenants/:tenantId/agents/:agentId/capabilities`

Purpose:
- manage what an agent can do.

Required UI:
- capability catalog;
- current assignments;
- assignment update;
- risk classification;
- invocation semantics where exposed;
- policy/approval requirement;
- metering classification where exposed.

Rules:
- no ad-hoc tool creation in frontend.

### Policy

Route:
- `/tenants/:tenantId/agents/:agentId/policy`

Purpose:
- bind runtime guardrails and decision policy profiles.

Required UI:
- policy profile catalog;
- current binding;
- bind/update profile;
- validate binding;
- policy-sensitive readiness issues.

Rules:
- do not implement safety logic locally.

### Sites And Widgets

Route:
- `/tenants/:tenantId/agents/:agentId/sites-widgets`

Purpose:
- connect agent to public website/widget channel.

Required UI:
- create/list/read sites;
- manage site status;
- allowed origins;
- create/list/read widgets;
- bind widget to agent/site;
- manage widget status;
- install/embed guidance;
- controlled widget smoke helper/evidence flow.

Snippet rules:
- display/copy backend-returned `public_embed_marker`, `widget_key`, allowed
  origins and install guidance;
- render templates only from backend-returned values;
- prefer backend-ready snippet if available.

### Releases

Route:
- `/tenants/:tenantId/agents/:agentId/releases`

Purpose:
- publish agent safely and reversibly.

Required UI:
- release list/detail;
- create draft;
- readiness checklist;
- evidence path;
- manual override path;
- publish;
- rollback;
- disable;
- active release snapshot.

Manual override fields:
- `manual_override.reason_code`;
- `manual_override.related_missing_or_failed_items`;
- optional `manual_override.comment`.

Display where returned:
- `gate_mode`;
- `manual_override_used`;
- `active_release_gate_mode`;
- `active_release_manual_override`.

Confirmations:
- publish;
- rollback;
- disable.

Confirmation summary includes:
- version;
- status;
- gate mode;
- active marker.

### Conversations And Support

Route:
- `/tenants/:tenantId/conversations`

Purpose:
- inspect runtime behavior and support reconstruction.

Required UI:
- chat list/detail;
- close chat where approved;
- messages;
- message detail;
- turns;
- turn detail;
- current memory view;
- runtime summary;
- links to usage/model request/retrieval evidence.

Rules:
- read-only except approved close action;
- no internal prompts/secrets unless backend marks support-safe.

### Usage And Metering

Route:
- `/tenants/:tenantId/usage`

Purpose:
- inspect billing-relevant usage and metering read models.

Required UI:
- usage summary/detail;
- model request detail;
- chat usage;
- conversation turn usage;
- channel/site/widget/chat/turn attribution where returned.

Rules:
- no frontend billing calculations.

### Billing Export

Route:
- `/tenants/:tenantId/billing-export`

Purpose:
- inspect and operate export status where allowed.

Required UI:
- portal billing export read model;
- export status;
- create export batch where permitted;
- register export failure where permitted;
- retry export where permitted;
- run reconciliation where permitted;
- correlation/result state after mutation.

Visibility:
- permissions first;
- without explicit permission, mutations are `platform_admin` only;
- `platform_operator` and `platform_viewer` are read-only.

Rules:
- no pricing, invoice, payment or tax logic.

