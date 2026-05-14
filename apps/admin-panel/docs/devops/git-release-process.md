# Git And Release Process

This document defines the working Git and verification process for `apps/admin-panel`.

## Branch Strategy

- `main` contains only stable code that passed checks.
- Work happens in task branches, for example `codex/...` or `feature/...`.
- Do not push directly to `main`.
- Merge to `main` only through a pull request.

Current development work may be pushed to the active non-main branch before merge, but the branch must stay reviewable: small commits, clear messages, and no unrelated file churn.

## Local Checks Before Push

For admin-panel-only changes, run:

```bash
npm run lint:admin
npm run test:admin
npm run build:admin
```

For workspace-level changes, or before merge to `main`, run:

```bash
npm run lint
npm test
npm run build
```

If browser behavior changed, add a manual browser smoke check for the affected route.

Minimum admin-panel smoke:

```text
http://127.0.0.1:5173/login
```

Check that:

- the login page renders;
- static assets load;
- auth bootstrap does not stay on permanent loading;
- protected routes redirect anonymous users to login;
- login/logout works when backend is available.

## Pull Request Requirements

A pull request into `main` should be mergeable only when:

- branch is up to date with `main`;
- there are no conflicts;
- lint passes;
- tests pass;
- build passes;
- affected browser flow was smoke-tested;
- docs were updated when startup, env, backend contracts, deployment, or routes changed;
- no generated/local files were committed accidentally.

Do not commit:

```text
dist/
node_modules/
.env
.env.*
.DS_Store
.idea/
.vscode/
*.log
```

## Recommended CI

GitHub Actions should run on every pull request and on every push to `main`:

```bash
npm ci
npm run lint
npm test
npm run build
```

For faster future optimization, CI can later split admin/client jobs, but the merge gate should still prove the whole workspace is healthy before `main`.

## Merge Rule

Merge to `main` only after all required checks are green.

Recommended merge style:

- squash merge for small task branches;
- regular merge only for intentionally structured multi-commit work;
- no force-push to shared branches after review has started unless reviewers agree.

## Deployment Artifact

Admin-panel production artifact is created by:

```bash
npm run build:admin
```

Build output:

```text
apps/admin-panel/dist
```

Deploy only the built static artifact, not source files, local env files, or `node_modules`.

## Post-Deploy Smoke

After deployment:

1. Open the admin-panel public URL.
2. Confirm `/login` loads without asset errors.
3. Confirm `/api` backend target is correct.
4. Log in with an admin account.
5. Open a protected page.
6. Check a simple authenticated API-backed screen.
7. Log out.

If any smoke step fails, stop rollout and use the rollback plan from deployment docs.

## Branch Protection Recommendation

Enable GitHub branch protection for `main`:

- require pull request before merge;
- require status checks;
- require branch up to date before merge;
- restrict direct pushes;
- optionally require at least one approval.
