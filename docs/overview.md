# AI Admin Panel Overview

## Current Scope

`ai_admin_panel` is a clean React frontend baseline for an internal AI administration application.

The template currently includes:
- internal login/logout;
- first password setup by invite token;
- password reset request and confirmation;
- protected routing;
- root redirect `/` -> `/settings`;
- settings for language and theme;
- current administrator summary;
- active session management;
- TOTP enrollment/disable for sensitive actions;
- API client with request metadata, CSRF, auth, and error interceptors;
- tests for the critical auth, routing, API, and settings behavior.

The source template was `/Volumes/Work/DV/ web_kassa/aml_portal`. The code was copied without its `.git`, `node_modules`, `dist`, local env files, and cache folders.

## Current Navigation

After login the user sees only:
- `Settings`;
- `Log out`.

This is intentional. New AI/admin domain sections should not appear as placeholders before there is a working page and a defined scenario.

## Current Modules

- `Settings` - interface settings, current administrator, active sessions.
- `AmlSecurity` - inherited TOTP security module from the source template. Keep it as the security baseline until the backend contract is renamed or replaced.

## How To Grow

Each new admin scenario should get its own boundary in `src/modules`.

Possible future directions:
- AI model management;
- prompt/template management;
- users and roles;
- audit and support tooling;
- moderation/review queues;
- system settings;
- operational dashboards.

Before implementation, document:
- backend contract;
- route;
- module name;
- read/write scenarios;
- security-sensitive actions;
- loading, empty, ready, and error UI states;
- minimum tests.

## Definition Of Ready

A new section is ready to build when there is:
- a clear user scenario;
- backend endpoint or mock contract;
- route naming;
- UI state list;
- access rule and expected backend auth behavior;
- test minimum.
