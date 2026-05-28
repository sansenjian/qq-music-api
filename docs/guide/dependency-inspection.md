---
layout: doc
title: 依赖分析
---

# 依赖分析

项目集成 [`node-modules-inspector`](https://github.com/antfu/node-modules-inspector) 用于观察依赖体积、依赖关系和可优化空间。

## 常用命令

```bash
npm run deps:inspect
```

启动交互式依赖分析页面，默认监听 `http://127.0.0.1:9999`。

```bash
npm run deps:build
```

构建静态分析页面到 `.node-modules-inspector/`，该目录仅用于本地排查，不提交到仓库。

## 使用场景

- 查找体积较大的直接依赖与传递依赖。
- 判断某个开发依赖是否还能移除或替换。
- 在升级构建工具、测试工具或文档工具后，对比依赖树变化。

## 版本说明

当前固定使用 `node-modules-inspector@2.0.1`。`2.1.x` 版本暂时依赖尚未发布到 npm 的 `publint@^0.3.21`，在 npm 安装时会失败；等上游发布修复后再升级。

项目当前不提交 `package-lock.json`，因此暂不提供 `node-modules-inspector check` 脚本；该命令依赖 npm lockfile 的 `npm query --package-lock-only` 能力。
