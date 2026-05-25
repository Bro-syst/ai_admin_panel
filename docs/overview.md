# Frontend Monorepo Overview

## Purpose

This repository is the frontend workspace for multiple AI Admin Panel products.

The current implementation contains two applications:
- `apps/admin-panel` - internal administration frontend.
- `apps/client-panel` - user-facing frontend workspace with auth/security template shell.

Future applications should be added as sibling apps, for example:
- `apps/customer-cabinet`;
- `apps/support-console`.

## Why The Structure Exists

The repository should not be coupled to a single frontend forever. Admin, user-facing, and support applications can share tooling and selected packages while keeping their product boundaries clear.

## Current Scope

At the repository level:
- npm workspaces are configured in the root `package.json`;
- root scripts delegate to the current admin and client apps;
- shared TypeScript defaults live in `tsconfig.base.json`;
- repository-level docs describe how multiple frontend apps should coexist;
- Admin Portal prompt/TZ pipeline lives under `apps/admin-panel/docs` because it is app-specific, not repository-wide;
- admin-specific docs live under `apps/admin-panel/docs`;
- client-specific docs live under `apps/client-panel/docs`.

## App Ownership

Each app owns:
- routes and pages;
- app-specific UI composition;
- app-specific API boundaries;
- Vite config and runtime entrypoint;
- app-specific documentation.

## Shared Code

Shared code belongs in `packages/` only after reuse is real. Until there are two consumers, code should stay in the app that needs it.
