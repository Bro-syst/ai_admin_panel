# Client Panel Development Guide

## Commands

From the repository root:

```bash
npm run dev:client
npm run test:client
npm run lint:client
npm run build:client
```

## Rules

- Add product routes only for confirmed client scenarios.
- Keep admin-panel code out of this app.
- Prefer local app code until reuse with another app is proven.
- Move shared contracts to `packages/` only after the second consumer exists.
- Update these docs when the app gains a new route, module, or backend boundary.
