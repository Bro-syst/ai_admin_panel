# Frontend Monorepo Development Guide

## Daily Commands

From the repository root:

```bash
npm install
npm run dev:admin
npm run dev:client
npm run test
npm run lint
npm run build
```

Root `test`, `lint`, and `build` run every active app.

## Local App Startup

Use the separate startup guide:

`docs/local-app-startup.md`

## Adding A New App

New frontend apps go under `apps/<app-name>`.

Each app should include:
- `package.json`;
- `src/`;
- `index.html`;
- app runtime config such as `vite.config.ts`;
- app-specific docs under `docs/`;
- tests for routes and critical flows.

Do not put app-specific routes, UI, or product docs at repository root.

## Adding Shared Code

Start code inside the app that needs it. Move it to `packages/` only after another app needs the same behavior.

Before extracting:
- identify the public API;
- remove product-specific naming;
- add package-level tests;
- update the consuming apps explicitly.

## Documentation Rules

Repository docs explain how apps and packages coexist.

App docs explain product behavior, routes, app architecture, and module recipes.

When a change affects only `apps/admin-panel`, update `apps/admin-panel/docs`.

When a change affects workspace layout, shared packages, or multi-app rules, update root `docs`.

## Quality Gates

Before merging structural changes:

```bash
npm test
npm run lint
npm run build
```

For app-specific changes, also run the named app command, for example:

```bash
npm run test:admin
npm run lint:admin
npm run build:admin

npm run test:client
npm run lint:client
npm run build:client
```
