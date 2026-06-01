# Branching and Merge Rules

## Overview

Use this file when creating branches, opening pull requests, or resolving `dev` and `main` divergence.

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

Recommended conflict-safe flow:

1. Sync `origin/main` and `origin/dev`.
2. Create a promotion branch from `origin/main`, for example `sync/dev-to-main`.
3. Merge `origin/dev` into the promotion branch.
4. Resolve conflicts intentionally.
5. Run required validation.
6. Open a pull request from the promotion branch into `main`.

This keeps `dev` available for continued integration work while the release promotion is reviewed.

## Conflict Resolution Policy

- Preserve `main` release metadata when promoting to `main`, including version bumps, `CHANGELOG.md`, and release workflow outputs.
- Preserve ESM/CJS package-entry fixes from `main` unless the replacement is a verified superset.
- Preserve `dev` feature implementation when promoting stable work, including CLI, framework, route, and test improvements.
- Do not downgrade `package.json` or `package-lock.json` versions during promotion.
- Do not commit regenerated `docs/public/version.json` unless the task is explicitly a version or release update.
- For package-entry changes, verify both ESM import and CJS require behavior with package-entry tests.

## Hotfixes

Emergency fixes may branch from `main` only when the user explicitly asks for a stable-branch hotfix.
After merging a hotfix into `main`, backport or merge it into `dev` so future development does not lose the fix.

## Validation

Before opening a branch promotion PR, run:

- `npm run build`
- `npm run test`
- `npm run lint`
- `npm run docs:build` when docs changed
