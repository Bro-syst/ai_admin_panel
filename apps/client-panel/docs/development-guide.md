# Client Panel Development Guide

## Commands

From the repository root:

```bash
npm run dev:client
npm run test:client
npm run lint:client
npm run build:client
```

Use the repository root in IDEA: `/Volumes/Work/PC/ai_admin_panel`. The root contains npm workspaces, shared scripts and the lockfile. Open `apps/client-panel` directly only for quick file browsing.

## Backend

Local dev proxies `/api` and `/auth` to:

```text
http://127.0.0.1:8000
```

Override it when needed:

```bash
CLIENT_PANEL_DEV_API_TARGET=http://127.0.0.1:8000 npm run dev:client
```

If backend is down, the auth bootstrap should finish as anonymous and render `/login`. Do not introduce startup logic that leaves the whole app in `Loading...` forever.

## Rules

- Add product routes only for confirmed client scenarios.
- Keep admin-panel code out of this app.
- Keep cashdesk/order/settlement/compliance concepts out until client-panel explicitly needs them.
- Prefer local app code until reuse with another app is proven.
- Move shared contracts to `packages/` only after the second consumer exists.
- Update these docs when the app gains a new route, module, or backend boundary.
