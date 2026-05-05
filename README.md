# ai_admin_panel

React/Vite template for the AI Admin Panel.

The project was bootstrapped from the working `aml_portal` frontend and adapted as a clean starting point for a new admin application. It keeps the proven auth/settings shell, routing, API client, providers, tests, and documentation recipes so future modules can follow the same architecture.

## Quick Start

```bash
npm install
npm run dev
```

By default the local Vite proxy sends `/api` requests to `http://127.0.0.1:8000`.
Override it when needed:

```bash
AI_ADMIN_DEV_API_TARGET=http://127.0.0.1:8000 npm run dev
```

## Commands

```bash
npm test
npm run lint
npm run build
npm run preview
```

## Project Docs

- [Overview](docs/overview.md) - current scope and what is included in the template.
- [Architecture](docs/architecture.md) - layers, module boundaries, backend boundary, state rules.
- [Development Guide](docs/development-guide.md) - rules for daily development.
- [Recipes](docs/recipes.md) - practical steps for adding modules, routes, API calls, UI, and tests.

## Current Baseline

The first screen after login is `/settings`. New product sections should be added only when there is a clear user scenario, route, backend contract, and test minimum.
