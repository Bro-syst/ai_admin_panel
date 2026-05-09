# Client Panel Recipes

## Add A Client Route

1. Add a route-level page under `src/app` or `src/modules/<ModuleName>/pages`.
2. Register the route in `src/app/App.tsx`.
3. Add route tests.
4. Update `docs/overview.md` and `docs/architecture.md`.

## Add A Client Module

Recommended shape:

```text
src/modules/Profile/
  index.ts
  api/
  model/
  pages/
  ui/
```

Keep API mapping in `api`, orchestration hooks in `model`, and rendering components in `ui`.
