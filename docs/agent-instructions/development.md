# Development Workflow

## Overview

Use this file for day-to-day implementation choices, TypeScript conventions, and keeping code, tests, and docs synchronized.

## Working Rules

- Preserve the existing Koa, TypeScript, Vite, VitePress, and Vitest stack.
- Avoid adding new JavaScript business files; keep application logic in TypeScript.
- JavaScript maintenance scripts are acceptable when matching existing `scripts/*.js` patterns.
- Keep changes scoped to the requested behavior and nearby ownership boundaries.
- Reuse existing types before adding new public types. Put shared types in `src/types/`.
- Reuse existing response helpers so public response structures stay consistent.
- Do not introduce a new dependency unless it is part of the task and the existing stack cannot reasonably solve the problem.
- Do not change the default port `3200` unless the user explicitly asks for it.
- Keep implementation, tests, and documentation synchronized for user-visible behavior changes.

## Recommended Flow

1. Read the relevant service, controller, route, type, and test modules.
2. Implement upstream API behavior in `src/services/`.
3. Wire HTTP behavior in `src/controllers/`.
4. Register or adjust routes in `src/routes/router.ts`.
5. Update shared types, tests, and docs when the public surface changes.
6. Run the smallest useful validation first, then the required handoff checks.

## Documentation Changes

- API behavior changes should update the corresponding page under `docs/api/`.
- Usage or setup changes should update `docs/guide/` or other existing documentation pages.
- Keep VitePress configuration changes in `docs/.vitepress/config.mjs`.
