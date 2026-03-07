---
# 规范版本: agentic-ai-foundation/v1
# 适用范围：整个仓库
# 最后更新：2026-03-08
---

# AGENTS.md

## 项目概览

这是一个基于 Koa 的 QQ 音乐 API 服务项目，当前代码库已完成从 JavaScript 到 TypeScript 的迁移。

- 运行时：Node.js 20+
- 开发语言：TypeScript
- Web 框架：Koa 2
- 路由系统：@koa/router
- 文档系统：VitePress
- 测试框架：Jest

## 启动与构建

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

默认启动入口为 `app.ts`，默认端口为 `3200`。

### 生产构建

```bash
npm run build
```

### 生产运行

```bash
npm run start
```

## Toolchain

| 意图     | 命令                                 | 配置权威                        |
| -------- | ------------------------------------ | ------------------------------- |
| 开发     | `npm run dev`                        | `package.json`                  |
| 构建     | `npm run build`                      | `tsconfig.json`                 |
| 测试     | `npm run test`                       | `jest.config.ts`                |
| 代码检查 | `npm run eslint`                     | `.eslintrc.js`                  |
| 格式化   | `npm run prettier`                   | `.prettierrc`                   |
| 文档开发 | `npm run docs:dev`                   | `docs/.vitepress/config.mjs`    |
| 发版     | `git push origin main --follow-tags` | `.github/workflows/release.yml` |

**提交前必须执行**：

```bash
npm run build && npm run test && npm run docs:build
```

## 目录结构

```text
app.ts                 应用启动入口
index.ts               包导出入口
module/                API 请求封装层
routers/               HTTP 控制器与路由注册
middlewares/           Koa 中间件
util/                  通用工具函数
config/                运行时配置
types/                 全局类型与公共类型定义
docs/                  VitePress 文档站点
tests/                 单元测试与集成测试
public/                静态资源
scripts/               辅助脚本
```

## 分层说明

### module/

负责直接请求 QQ 音乐相关接口，通常只处理：

- 请求参数拼装
- 调用上游接口
- 基础数据格式转换
- 返回统一响应结构

### routers/context/

负责 HTTP 层控制器逻辑，通常只处理：

- 读取 `ctx.query` 或 `ctx.request.body`
- 参数校验
- 调用 `module/` 中对应能力
- 设置 `ctx.body` 与 `ctx.status`

### routers/router.ts

负责统一注册所有路由。

### util/

放置跨模块复用的通用逻辑，例如响应包装、颜色输出等。

## 编码约定

1. 新增功能时，优先保持现有目录分层，不要把路由逻辑和接口请求逻辑混写。
2. 新增接口时，通常需要同时补充：
   - `module/apis/...` 中的接口实现
   - `routers/context/...` 中的控制器
   - `routers/context/index.ts` 或相关导出
   - `routers/router.ts` 中的路由注册
   - 必要时补充文档与测试
3. 统一使用 TypeScript，避免继续引入新的 `.js` 业务文件。
4. 尽量复用已有类型定义，公共类型优先放到 `types/`。
5. 保持返回结构一致，优先复用已有响应工具。
6. 修改 Cookie 相关逻辑时，参考 `tests/integration/login.test.ts` 验证扫码登录兼容性

## 行为边界

1. 仅在当前仓库内执行分析、修改与命令操作，不推断或操作仓库外文件。
2. 修改实现时，必须遵守既有分层边界：`module/` 不写 HTTP 控制器逻辑，`routers/context/` 不直接承载上游请求细节，`routers/router.ts` 只负责路由注册。
3. 涉及扫码登录、Cookie、用户信息或其他敏感配置时，只能做兼容性修复与明确需求内的改动，不得擅自重构认证流程、扩展凭据用途或删除保护逻辑。
4. 未经需求明确，不新增外部服务依赖、不修改默认端口、不调整公开接口返回结构、不改变现有路由语义。
5. 文档、测试、类型与实现应保持同步；如果本次任务只允许文档修改，则不得顺带改动业务代码。
6. 对不确定的业务规则，优先保守处理并在提交说明中写明假设，避免以猜测替代已验证行为。
7. 禁止引入与任务无关的大规模重构、批量格式化或目录迁移，避免扩大变更面。
8. 删除文件、调整公共配置、修改构建脚本前，必须确认该变更是任务目标的一部分，且不会破坏现有构建、测试与文档流程。

## 测试与验证

提交前建议至少执行：

```bash
npm run build
npm run test
```

如果修改了文档，再执行：

```bash
npm run docs:build
```

如果修改了格式或风格敏感文件，再执行：

```bash
npm run eslint
npm run prettier
```

## 关键注意事项

1. 项目默认端口为 `3200`。
2. 生产启动依赖 `dist/` 目录，因此发布前必须先执行构建。
3. 当前仓库包含扫码登录相关接口实现，不要在未理解流程前随意调整登录状态字段。
4. 文档内容位于 `docs/`，接口能力变更时要同步更新文档。
5. 现有测试以 Jest 为主，新增行为建议补充对应测试。

## 建议的开发流程

1. 阅读相关模块现有实现。
2. 在 `module/` 增加或调整接口能力。
3. 在 `routers/context/` 接入 HTTP 控制器。
4. 在路由层完成注册。
5. 补充类型、测试与文档。
6. 执行构建和测试，确认无误后再提交。

## 发版流程

### 发布策略说明

**重要**：本项目采用 **文档与包分离发布** 策略。

| 内容                  | 触发条件          | 发布方式       | 说明                           |
| --------------------- | ----------------- | -------------- | ------------------------------ |
| **GitHub Pages 文档** | 推送 main 分支    | 自动部署       | 永远与 main 同步，可能领先 npm |
| **npm 包**            | 手动触发 workflow | GitHub Actions | 正式版本，需要推送 v\* 标签    |
| **GitHub Release**    | 手动触发 workflow | GitHub Actions | 与 npm 版本同步                |

**核心规则：**

```
文档部署：push main → 自动部署（无需手动操作）
包发布：  推送 v* 标签 → 手动触发 workflow → 自动发布
```

### 发版方式说明

本项目采用 **GitHub Actions 自动化发版** 作为标准流程。本地只负责触发，所有发布步骤由 GitHub 自动完成。

### 版本与文档策略

**文档部署策略：**

- ✅ **文档永远与 main 分支同步** - 每次推送到 main 自动部署最新文档
- ✅ **文档可以领先 npm 版本** - 不需要等待发布，文档即时更新
- ✅ **GitHub Pages** - 始终反映最新代码状态（可能包含未发布的功能）
- ⚠️ **文档部署独立于包发布** - 推送到 main 就会部署文档，不需要推送标签

**版本发布策略：**

- 📦 **npm 包** - 只在推送标签时发布（正式版本）
- 📦 **GitHub Release** - 与 npm 版本同步
- 📦 **CHANGELOG** - 基于 Git 标签生成，记录正式发布历史
- ⚠️ **包发布需要手动触发** - 推送标签后，需要在 GitHub Actions 手动触发 release workflow

**总结：**

```
GitHub Pages 文档 = main 分支最新状态（可能领先 npm）
npm 包版本        = 最近一次推送的 v* 标签

文档部署：自动（push main 触发）
包发布：    半自动（推送标签 + 手动触发 workflow）
```

**注意事项：**

1. **不要依赖本地发布** - 本地 `npm publish` 仅用于测试，不是标准发布方式
2. **文档总是最新** - GitHub Pages 可能包含未发布的功能文档
3. **版本号对应** - npm 包版本与 Git 标签严格对应
4. **手动触发原因** - 发布前可以在 GitHub Actions 页面确认所有测试通过

### 标准发版步骤

1. **确保所有测试通过**

   ```bash
   npm run test
   ```

2. **本地构建验证**

   ```bash
   npm run build
   npm run docs:build
   ```

3. **更新版本号并打标签**

   ```bash
   # 补丁版本（Bug 修复）
   npm version patch

   # 小版本（新功能，向后兼容）
   npm version minor

   # 主版本（破坏性变更）
   npm version major
   ```

   这会：
   - ✅ 更新 `package.json` 版本号
   - ✅ 自动执行 `version` 脚本生成 `CHANGELOG.md`
   - ✅ 自动提交并创建 Git tag（格式：`v1.0.0`）

4. **推送标签**

   ```bash
   git push origin main --follow-tags
   ```

   推送后：
   - ✅ **文档自动部署** - deploy-docs.yml 会自动部署最新文档
   - ⚠️ **包发布待触发** - 需要手动触发 release workflow

5. **手动触发发布 workflow**

   - 访问：https://github.com/sansenjian/qq-music-api/actions/workflows/release.yml
   - 点击 "Run workflow"
   - 选择刚才推送的 v* 标签
   - 点击 "Run workflow" 按钮

   GitHub Actions 会自动：
   - ✅ 检出代码
   - ✅ 安装依赖
   - ✅ 运行测试（npm test）
   - ✅ 运行代码检查（npm run eslint）
   - ✅ 构建 TypeScript 和文档
   - ✅ 生成 CHANGELOG
   - ✅ 创建 GitHub Release
   - ✅ 发布到 npm
   - ✅ 发布到 GitHub Packages

6. **验证发布结果**
   - 检查 GitHub Actions 状态：https://github.com/sansenjian/qq-music-api/actions
   - 查看 GitHub Release：https://github.com/sansenjian/qq-music-api/releases
   - 查看 npm 包：https://www.npmjs.com/package/@sansenjian/qq-music-api

### 快捷发版命令

**注意**：推荐使用完整的发版流程（如上），让 GitHub Actions 自动完成所有步骤。

如果确实需要手动发布（不推荐），可以：

```bash
# 1. 更新版本号（会自动生成 CHANGELOG）
npm version patch

# 2. 手动构建和发布（仅本地测试）
npm run build
npm run docs:build
npm publish
```

但这会跳过 GitHub Actions 的自动化流程，不建议作为常规发版方式。

### 版本规范

- **Patch (补丁版本)**: `1.0.0` → `1.0.1` - Bug 修复，无新功能
- **Minor (小版本)**: `1.0.0` → `1.1.0` - 新增功能，向后兼容
- **Major (主版本)**: `1.0.0` → `2.0.0` - 破坏性变更

### 发版前检查清单

- [ ] 所有测试通过 (`npm run test`)
- [ ] 本地构建成功 (`npm run build`)
- [ ] 文档构建成功 (`npm run docs:build`)
- [ ] CHANGELOG.md 已生成并审查
- [ ] package.json 版本号正确
- [ ] Git 标签已推送（格式：`v1.0.0`）
- [ ] GitHub Actions 发布成功
- [ ] npm 包已发布
- [ ] GitHub Release 已创建

### 注意事项

1. 发版前必须确保 `dist/` 目录是最新的（先执行 `npm run build`）
2. CHANGELOG 基于 Git Commit Message 自动生成，请保持规范的提交信息
3. 发布到 npm 前请确认版本号符合语义化版本规范
4. 如有破坏性变更，请在 CHANGELOG 中明确说明迁移指南
