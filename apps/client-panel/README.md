# Client Panel

React/Vite application for future user-facing flows.

The app is intentionally small for now: it gives the monorepo a real second workspace app with its own runtime entrypoint, docs, tests, and commands. Product modules should be added here only when the client-panel scope is defined.

## Quick Start

From the repository root:

```bash
npm install
npm run dev:client
```

The default dev URL is:

```text
http://127.0.0.1:5174/
```

Override the local API proxy when needed:

```bash
CLIENT_PANEL_DEV_API_TARGET=http://127.0.0.1:8000 npm run dev:client
```

## Commands

```bash
npm run test:client
npm run lint:client
npm run build:client
```

## App Docs

- [Overview](docs/overview.md)
- [Architecture](docs/architecture.md)
- [Development Guide](docs/development-guide.md)
- [Recipes](docs/recipes.md)
