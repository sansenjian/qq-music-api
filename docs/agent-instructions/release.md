# Release Workflow

## Overview

Use this file for versioning, documentation deployment, and npm/GitHub Packages publication tasks.

## Strategy

This project separates documentation deployment from package publication.

| Artifact | Trigger | Workflow | Result |
| --- | --- | --- | --- |
| GitHub Pages docs | Push to `main` or manual dispatch | `.github/workflows/deploy-docs.yml` | Deploys latest `main` docs |
| Version bump | Push to `main` or manual dispatch | `.github/workflows/version.yml` | Updates `package.json`, `CHANGELOG.md`, and `docs/public/version.json` |
| npm beta package | Push to `dev` or manual dispatch with `beta` | `.github/workflows/package.yml` | Publishes a prerelease version to the `beta` dist-tag |
| npm stable package | `v*` tag or manual dispatch with `latest` | `.github/workflows/package.yml` | Publishes the stable numeric version to the `latest` dist-tag |

## Package Publication

- Standard package release is the GitHub Actions workflow `.github/workflows/package.yml`.
- `dev` branch publication uses a generated prerelease version such as `2.3.5-beta.123.1` and publishes with npm dist-tag `beta`.
- Stable publication must use a numeric `package.json` version and publishes with npm dist-tag `latest`.
- Provide a tag only when intentionally publishing that historical stable tag.
- Do not publish stable packages from `dev`; the workflow verifies `latest` releases come from `main`.
- Do not use local `npm publish` as the normal release path unless the user explicitly asks for a manual/local publish test.

## Pre-Release Validation

Before triggering package publication, verify:

- `npm run test`
- `npm run lint`
- `npm run build`
- `npm run docs:build`
- `package.json` version is the intended version.
- Beta releases intentionally do not require committing the generated prerelease version.
- `CHANGELOG.md` has been generated and reviewed when relevant.

## Workflow Behavior

The package workflow checks out the selected ref, determines the release channel, installs dependencies, runs tests, runs lint, builds TypeScript, builds documentation, generates the changelog, then publishes to npm and GitHub Packages with the correct dist-tag.

Default channel behavior:

- Push to `dev`: publish `beta`.
- Push a `v*` tag from `main`: publish `latest`.
- Manual dispatch with `channel=auto`: infer the channel from the selected ref.
- Manual dispatch with `channel=beta` or `channel=latest`: use the requested channel, while preserving branch safety checks.

## Verification

After publication, check:

- GitHub Actions run status under `actions/workflows/package.yml`.
- npm package page for `@sansenjian/qq-music-api`.
- `npm dist-tag ls @sansenjian/qq-music-api` shows beta releases under `beta` and stable releases under `latest`.
- GitHub Packages entry for this repository.
