# Frontend Monorepo Architecture

## Workspace Layout

```text
apps/
  admin-panel/
    src/
    docs/
    package.json
    vite.config.ts
    tsconfig.json

packages/
  README.md

docs/
  overview.md
  architecture.md
  development-guide.md
  recipes.md

package.json
package-lock.json
tsconfig.base.json
```

## Layers

Repository level:
- owns workspace scripts, shared documentation, and baseline TypeScript configuration;
- does not own product routes or product UI.

App level:
- owns a deployable frontend application;
- owns product routes, pages, app providers, and app-specific docs;
- may depend on shared packages.

Package level:
- owns reusable frontend libraries;
- must not depend on apps;
- should expose stable public APIs.

## Dependency Rules

Allowed:
- apps import packages;
- packages import other packages when the dependency is deliberate;
- root scripts invoke app/package scripts.

Forbidden:
- packages import from apps;
- one app imports another app's internals;
- shared packages contain product-specific pages or routing;
- root-level docs replace app-level docs for product-specific architecture.

## Current App

`apps/admin-panel` is the first app and currently contains the copied React/Vite admin template.

Its app-specific architecture remains documented in:
- `apps/admin-panel/docs/architecture.md`;
- `apps/admin-panel/docs/development-guide.md`;
- `apps/admin-panel/docs/recipes.md`.

## Shared Package Policy

Create a package only when there is a real second consumer.

Good candidates:
- design-system primitives used by multiple apps;
- API transport helpers with stable contracts;
- shared lint/TypeScript/Tailwind config;
- authentication primitives if backend contracts are shared.

Poor candidates:
- product pages;
- one-app domain components;
- speculative abstractions.
