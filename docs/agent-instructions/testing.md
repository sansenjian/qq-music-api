# Testing and Validation

## Overview

Use this file when choosing which checks to run or when adding tests for changed behavior.

## Required Checks

- Code changes: run `npm run build && npm run test` before handoff.
- Documentation changes: run `npm run docs:build`.
- Lint-sensitive changes: run `npm run lint`.
- Formatting-only or formatting-sensitive changes: run `npm run format` when appropriate.

## Focused Checks

- Unit tests: `npm run test:unit`.
- All Vitest tests: `npm run test`.
- Coverage: `npm run test:coverage`.
- Verbose test output: `npm run test:verbose`.
- Flagged test runner: `npm run test:flags` or `npm run test:flags:unit`.

## Test Placement

- Controller tests belong under `tests/unit/controllers/`.
- Service API tests belong under `tests/unit/services/apis/` or the relevant service test folder.
- Middleware tests belong under `tests/integration/middleware/` when behavior crosses Koa middleware boundaries.
- API integration tests belong under `tests/integration/api/` when route behavior is being exercised.
- Utility tests belong under `tests/unit/util/`.

## Cookie and Login Changes

- Treat Cookie, QR login, user identity, and credential handling as sensitive behavior.
- Inspect existing cookie and login-related tests before changing behavior, especially `tests/unit/util/cookie*.test.ts`, `tests/unit/util/cookieResolver.test.ts`, and relevant integration API tests.
- Add focused coverage when compatibility could change.
