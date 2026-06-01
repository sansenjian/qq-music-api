---
# 规范版本: agentic-ai-foundation/v1
# 适用范围：整个仓库
# 最后更新：2026-05-31
---

# AGENTS.md

QQ Music API 是一个基于 Koa 2 和 TypeScript 的 QQ 音乐 API 服务，包含 HTTP 服务、包导出入口和 VitePress 文档站点。

## Quick Reference

- Runtime: Node.js `^20.17.0 || >=22.9.0`
- Package manager: `npm@11.14.1`
- App entry: `src/app.ts`
- Package entry: `src/index.ts`
- Default port: `3200`
- Production start requires `dist/`
- Scope: only operate inside this repository unless the user explicitly asks otherwise.

## Commands

| Intent | Command | Source of truth |
| --- | --- | --- |
| Install | `npm install` | `package.json` |
| Dev server | `npm run dev` | `src/app.ts` |
| Build | `npm run build` | `vite.config.ts`, `tsconfig.json` |
| Production start | `npm run start` | `dist/app.js` |
| Test | `npm run test` | `vitest.config.ts` |
| Lint | `npm run lint` | `.oxlintrc.json` |
| Format TS | `npm run format` | `.prettierrc` |
| Docs dev | `npm run docs:dev` | `docs/.vitepress/config.mjs` |
| Docs build | `npm run docs:build` | `docs/.vitepress/config.mjs` |
| Package release | manually trigger `.github/workflows/package.yml` | GitHub Actions |

## Required Validation

For code changes, run `npm run build && npm run test` before handoff. If docs changed, also run `npm run docs:build`. If formatting or lint-sensitive files changed, run `npm run lint` or `npm run format` as appropriate.

## Detailed Instructions

- [Architecture and layering](docs/agent-instructions/architecture.md)
- [Development workflow](docs/agent-instructions/development.md)
- [Branching and merge rules](docs/agent-instructions/branching.md)
- [Testing and validation](docs/agent-instructions/testing.md)
- [Safety boundaries](docs/agent-instructions/safety.md)
- [Release workflow](docs/agent-instructions/release.md)
