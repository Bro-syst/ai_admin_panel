# Frontend Monorepo Recipes

## Add A New Frontend App

1. Create `apps/<app-name>`.
2. Add app `package.json` with a unique workspace package name.
3. Add `src/`, `index.html`, and runtime config.
4. Add app docs under `apps/<app-name>/docs`.
5. Add root scripts for the app, for example `dev:<app-name>`, `test:<app-name>`, `build:<app-name>`.
6. Update root `README.md` and `docs/overview.md`.
7. Run install and quality gates from the repository root.

## Add A Shared Package

1. Confirm at least two apps need the same behavior.
2. Create `packages/<package-name>`.
3. Give the package a scoped name, for example `@ai-admin-panel/shared-ui`.
4. Export only stable public APIs from the package entrypoint.
5. Add package tests before wiring it into apps.
6. Update consuming app imports deliberately.
7. Document the package in `packages/README.md`.

## Move App Code Into A Package

1. Identify the smallest reusable boundary.
2. Remove app-specific copy, routes, and product naming.
3. Move implementation and tests together.
4. Keep compatibility adapters in the app if the app still needs product-specific naming.
5. Run all affected apps.

## Add A Module To Admin Panel

Use the admin-panel app recipe:

`apps/admin-panel/docs/recipes.md`

Admin routes, UI, and API contracts stay inside `apps/admin-panel` unless another app genuinely needs them.

## Add A Module To Client Panel

Use the client-panel app recipe:

`apps/client-panel/docs/recipes.md`

Client routes, UI, and API contracts stay inside `apps/client-panel` unless another app genuinely needs them.
