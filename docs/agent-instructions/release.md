# Release Workflow

## Overview

Use this file for versioning, documentation deployment, and npm/GitHub Packages publication tasks.

## Strategy

This project separates documentation deployment from package publication.

| Artifact            | Trigger                           | Workflow                            | Result                                                                 |
| ------------------- | --------------------------------- | ----------------------------------- | ---------------------------------------------------------------------- |
| GitHub Pages docs   | Push to `main` or manual dispatch | `.github/workflows/deploy-docs.yml` | Deploys latest `main` docs                                             |
| Version bump        | Push to `main` or manual dispatch | `.github/workflows/version.yml`     | Updates `package.json`, `CHANGELOG.md`, and `docs/public/version.json` |
| npm beta packages   | Manual dispatch with `beta`       | `.github/workflows/package.yml`     | Publishes core and MCP prerelease packages to the `beta` dist-tag      |
| npm stable packages | Manual dispatch with `latest`     | `.github/workflows/package.yml`     | Publishes core and MCP stable packages to the `latest` dist-tag        |

## Package Publication

- Standard package release is the GitHub Actions workflow `.github/workflows/package.yml`.
- Package publication must be started manually with `workflow_dispatch`; pushes to `dev`, `main`, or `v*` tags must not publish npm packages automatically.
- Version numbers use `<manual>.<main>.<dev>`:
  - `<manual>` is changed manually when the project needs a larger compatibility line.
  - `<main>` is incremented by the stable version bump on `main`.
  - `<dev>` is incremented by beta releases from `dev` and resets to `0` on the next stable bump.
- The stable version bump increments the main segment, resets the dev segment to `0`, and writes a numeric version such as `2.4.0`.
- `dev` branch publication reads local `package.json`, `origin/main`, npm `latest`, and npm `beta`, then publishes the next dev prerelease such as `2.4.1-beta.123.1` with npm dist-tag `beta`.
- Stable publication must use the numeric `package.json` version and publishes with npm dist-tag `latest`.
- Package publication includes `@sansenjian/qq-music-api` and `@sansenjian/qq-music-api-mcp`.
- The MCP package version must match the core package version for stable releases.
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
- The package workflow is manually dispatched with the intended `channel`.
- Beta releases intentionally do not require committing the generated prerelease version.
- Beta releases do not require syncing the latest stable version commit back into `dev`; the package workflow reads `origin/main`, npm `latest`, and npm `beta` to choose the prerelease base.
- Beta releases, including manual dispatches, must run from the current `origin/dev` HEAD.
- `CHANGELOG.md` has been generated and reviewed when relevant.

## Workflow Behavior

The package workflow checks out the selected ref, determines the release channel, installs dependencies, runs tests, runs lint, builds TypeScript, builds documentation, generates the changelog, then publishes to npm and GitHub Packages with the correct dist-tag.

Manual channel behavior:

- Manual dispatch with `channel=auto`: infer the channel from the selected ref.
- Manual dispatch with `channel=beta` or `channel=latest`: use the requested channel, while preserving exact branch/tag safety checks.
- Selecting the current `dev` ref with `channel=beta` publishes `beta`.
- Selecting `main` or a `v*` tag on `main` with `channel=latest` publishes `latest`.

## Verification

After publication, check:

- GitHub Actions run status under `actions/workflows/package.yml`.
- npm package page for `@sansenjian/qq-music-api`.
- npm package page for `@sansenjian/qq-music-api-mcp`.
- `npm dist-tag ls @sansenjian/qq-music-api` and `npm dist-tag ls @sansenjian/qq-music-api-mcp` show beta releases under `beta` and stable releases under `latest`.
- GitHub Packages entry for this repository.
