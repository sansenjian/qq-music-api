# Release Workflow

## Overview

Use this file for versioning, documentation deployment, and npm/GitHub Packages publication tasks.

## Strategy

This project separates documentation deployment from package publication.

| Artifact | Trigger | Workflow | Result |
| --- | --- | --- | --- |
| GitHub Pages docs | Push to `main` or manual dispatch | `.github/workflows/deploy-docs.yml` | Deploys latest `main` docs |
| Version bump | Push to `main` or manual dispatch | `.github/workflows/version.yml` | Updates `package.json`, `CHANGELOG.md`, and `docs/public/version.json` |
| npm package | Manual dispatch | `.github/workflows/package.yml` | Publishes to npm and GitHub Packages |

## Package Publication

- Standard package release is the manual GitHub Actions workflow `.github/workflows/package.yml`.
- Leave the `Tag to release` input empty to publish the current `package.json` version.
- Provide a tag only when intentionally publishing that historical tag.
- Do not treat `git push origin main --follow-tags` as the package release trigger; package publication is manual.
- Do not use local `npm publish` as the normal release path unless the user explicitly asks for a manual/local publish test.

## Pre-Release Validation

Before triggering package publication, verify:

- `npm run test`
- `npm run lint`
- `npm run build`
- `npm run docs:build`
- `package.json` version is the intended version.
- `CHANGELOG.md` has been generated and reviewed when relevant.

## Workflow Behavior

The package workflow checks out the selected ref, installs dependencies, runs tests, runs lint, builds TypeScript, builds documentation, generates the changelog, then publishes to npm and GitHub Packages.

## Verification

After publication, check:

- GitHub Actions run status under `actions/workflows/package.yml`.
- npm package page for `@sansenjian/qq-music-api`.
- GitHub Packages entry for this repository.
