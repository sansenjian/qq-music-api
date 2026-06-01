# Branching and Merge Rules

## Overview

Use this file when creating branches, opening pull requests, or deciding how `dev` and `main` should move.

## Branch Roles

- `dev` is the integration branch for active development.
- `main` is the stable release branch.
- Feature, fix, refactor, test, and docs work must start from `dev`.
- Ordinary development work should not open pull requests directly into `main`.

## Development Flow

1. Sync local `dev` from `origin/dev`.
2. Create a topic branch from `dev`.
3. Use a project-scoped branch name such as `feat/...`, `fix/...`, `refactor/...`, `docs/...`, `test/...`, `chore/...`, or `sync/...`.
4. Implement and validate the change on the topic branch.
5. Open a pull request back into `dev`.
6. Merge into `dev` only after the expected checks and review pass.

## Promoting Dev to Main

When `dev` is stable, promote it through a pull request into `main`.

Default flow:

1. Sync `origin/dev` and `origin/main`.
2. Open a pull request from `dev` into `main`.
3. Confirm GitHub reports the pull request as mergeable.
4. Run or wait for the required checks.
5. Merge the pull request into `main`.

Use this direct `dev -> main` pull request whenever it is clean and mergeable.

## Conflict Flow

Use a temporary sync branch only when `dev -> main` cannot be merged cleanly or needs manual conflict resolution.

1. Sync `origin/main` and `origin/dev`.
2. Create a sync branch from `origin/main`, for example `sync/dev-to-main`.
3. Merge `origin/dev` into the sync branch.
4. Resolve conflicts intentionally.
5. Run required validation.
6. Open a pull request from the sync branch into `main`.

This is an exception path for conflicts, not the default release path.

## After Main Changes

If `main` receives changes that are not already in `dev`, bring them back to `dev`.

Common examples:

- version bumps
- `CHANGELOG.md` updates
- release workflow outputs
- stable-branch hotfixes
- conflict-resolution fixes made during a `dev -> main` promotion

Use a small sync branch from `dev` and open a pull request back into `dev` when needed.

## Conflict Resolution Policy

- Preserve `main` release metadata when promoting to `main`, including version bumps, `CHANGELOG.md`, and release workflow outputs.
- Preserve ESM/CJS package-entry fixes unless the replacement is a verified superset.
- Preserve `dev` feature implementation when promoting stable work, including CLI, framework, route, and test improvements.
- Do not downgrade `package.json` or `package-lock.json` versions during promotion.
- Do not commit regenerated `docs/public/version.json` unless the task is explicitly a version or release update.
- For package-entry changes, verify both ESM import and CJS require behavior with package-entry tests.

## Hotfixes

Emergency fixes may branch from `main` only when the user explicitly asks for a stable-branch hotfix.
After merging a hotfix into `main`, backport or merge it into `dev` so future development does not lose the fix.

## Validation

Before opening a release or sync pull request, run:

- `npm run build`
- `npm run test`
- `npm run lint`
- `npm run docs:build` when docs changed
